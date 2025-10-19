package controllers

import javax.inject._
import play.api.mvc._
import play.api.libs.streams.ActorFlow
import org.apache.pekko.actor._
import org.apache.pekko.stream.Materializer
import main_.Main
import util._
import controller.GameControllerInterface
import scala.concurrent.{ExecutionContext, Future}

@Singleton
class WebSocketController @Inject()(cc: ControllerComponents)
                                    (implicit system: ActorSystem, mat: Materializer, ec: ExecutionContext) 
  extends AbstractController(cc) {

  def socket: WebSocket = WebSocket.accept[String, String] { request =>
    ActorFlow.actorRef { out =>
      GameWebSocketActor.props(out, Main.controller)
    }
  }
}

object GameWebSocketActor {
  def props(out: ActorRef, gameController: GameControllerInterface): Props = 
    Props(new GameWebSocketActor(out, gameController))
}

class GameWebSocketActor(out: ActorRef, gameController: GameControllerInterface) extends Actor with Observer {
  
  // Register as observer to game controller
  gameController.add(this)
  
  // Send initial welcome message and start the game
  out ! "Welcome to Kitty Card Game!\n"
  out ! "Type commands like: start, s (single), m (multi), player names, card placement, etc.\n"
  out ! "---\n"
  
  // Start the game when WebSocket connects
  gameController.startGame()
  
  override def receive: Receive = {
    case msg: String =>
      // Handle incoming messages from client
      handleClientInput(msg.trim)
  }
  
  override def postStop(): Unit = {
    // Unregister observer when connection closes
    gameController.remove(this)
    super.postStop()
  }
  
  // Observer pattern - receive updates from game controller
  override def update(event: GameEvent): Unit = {
    event match {
      case GameSaved =>
        out ! "✓ Game saved successfully\n"
        
      case UpdateLoadedGame(gridColors, currentPlayer, p1, p2, hand) =>
        out ! "✓ Game loaded successfully\n"
        out ! formatGrid(gridColors)
        out ! s"\nCurrent players: ${p1.name} vs ${p2.name}\n"
        out ! s"${currentPlayer.name}'s turn!\n"
        out ! "\nYour cards:\n"
        hand.foreach(card => out ! s"  ${card}\n")
        
      case UpdatePlayers(player1, player2) =>
        out ! s"Players: ${player1.name} vs ${player2.name}\n"
        out ! "Let's start the game!\n"
        
      case PlayerTurn(playerName) =>
        out ! s"\n=== ${playerName}'s Turn ===\n"
        
      case ShowCardsForPlayer(hand) =>
        out ! "\nYour cards:\n"
        hand.zipWithIndex.foreach { case (card, idx) =>
          out ! s"  [$idx] $card\n"
        }
        
      case UpdateGrid(grid) =>
        val colors = gameController.getGridColors
        out ! formatGrid(colors)
        
      case CardPlacementSuccess(x, y, card, points) =>
        out ! s"✓ Placed $card at ($x, $y) - Earned $points points!\n"
        
      case InvalidPlacement =>
        out ! "✗ Invalid placement! Try again.\n"
        
      case GameOver(player1Name, player1Points, player2Name, player2Points) =>
        out ! "\n=== GAME OVER ===\n"
        val winner = if (player1Points > player2Points) player1Name else player2Name
        out ! s"Winner: ${winner}\n"
        out ! s"Final Scores - ${player1Name}: $player1Points | ${player2Name}: $player2Points\n"
        
      case CardDrawn(playerName, card) =>
        out ! s"${playerName} drew: ${card}\n"
        
      case AskForGameMode =>
        out ! "\nChoose game mode:\n"
        out ! "  's' - Single Player\n"
        out ! "  'm' - Multiplayer\n"
        
      case AskForLoadGame =>
        out ! "\nLoad saved game? (y/n)\n"
        
      case PromptForPlayerName =>
        out ! "\nEnter player names (format: Player1 Player2)\n"
        
      case FreezeEnemy =>
        out ! "⚡ Enemy frozen! Play again!\n"
        
      case InitializeGUIForLoad =>
        // Skip GUI initialization in web mode
        ()
        
      case _ =>
        // Handle other events if needed
        ()
    }
  }
  
  private def handleClientInput(input: String): Unit = {
    input.toLowerCase match {
      // Game mode selection
      case "s" | "m" =>
        gameController.setGameMode(input)
        
      // Load game
      case "y" | "yes" =>
        gameController.askForGameLoad()
        gameController.handleCommand("load")
        
      case "n" | "no" =>
        gameController.handleCommand("start")
        
      // Game commands
      case "save" | "load" | "undo" | "redo" | "draw" =>
        gameController.handleCommand(input)
        
      // Start command
      case "start" =>
        gameController.handleCommand("start")
        
      // Player names (two words)
      case names if names.split("\\s+").length == 2 =>
        val Array(p1, p2) = names.split("\\s+")
        gameController.promptForPlayerName(p1, p2)
        
      // Card placement (format: cardIndex x y)
      case placement if placement.split("\\s+").length == 3 =>
        try {
          val parts = placement.split("\\s+")
          val cardIndex = parts(0).toInt
          val x = parts(1).toInt
          val y = parts(2).toInt
          gameController.handleCardPlacement(cardIndex, x, y)
        } catch {
          case e: Exception =>
            out ! s"✗ Invalid input format. Use: cardIndex x y (e.g., 0 1 1)\n"
        }
        
      case _ =>
        out ! "✗ Unknown command. Try: start, s/m, player names, card placement (0 1 1), save, load, undo, redo, draw\n"
    }
  }
  
  private def formatGrid(gridColors: List[(Int, Int, Option[model.gameModelComp.CardInterface], model.gameModelComp.baseImp.Suit.Suit)]): String = {
    val sb = new StringBuilder
    sb.append("\n┌─────────────────────────────┐\n")
    sb.append("│          GRID               │\n")
    sb.append("├─────────────────────────────┤\n")
    
    val size = Math.sqrt(gridColors.length).toInt
    for (x <- 0 until size) {
      sb.append("│ ")
      for (y <- 0 until size) {
        val cell = gridColors.find { case (cx, cy, _, _) => cx == x && cy == y }
        cell match {
          case Some((_, _, Some(card), color)) =>
            val cardStr = card.toString.take(6)
            sb.append(f"$cardStr%-6s ")
          case Some((_, _, None, color)) =>
            val coords = s"($x,$y)"
            sb.append(f"$coords%-6s ")
          case None =>
            sb.append("      ")
        }
      }
      sb.append("│\n")
    }
    sb.append("└─────────────────────────────┘\n")
    sb.toString()
  }
}
