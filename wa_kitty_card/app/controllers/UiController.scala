package controllers

import javax.inject._
import play.api.mvc._
import main_.Main
import model.gameModelComp.PlayerInterface
import scala.util.Try
import play.api.libs.json.{Json, JsValue, JsObject}

@Singleton
class UiController @Inject() (cc: ControllerComponents) extends AbstractController(cc) {

  // VIEWS

  def listEvents: Action[AnyContent] = Action {
    val events = Main.controller.peekBufferedEvents().toString()
    Ok(views.html.debug.listEvents(events))
  }

  def index: Action[AnyContent] = Action {
    Ok(views.html.ui.helloKitty("Welcome to the Kitty Card Game! :3"))
  }

  def newGame: Action[AnyContent] = Action {
    Main.controller.handleCommand("start")
    Redirect(routes.UiController.enterNames())
  }

  def combinedView: Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    if (Main.controller.isGameOver) {
      Redirect(routes.UiController.gameOverPage())
    } else {
      val stateOpt  = safe(Main.controller.getStateElements)
      val gridData  = getGridState
      
      // Check if a specific player number is requested (for online multiplayer)
      val playerNumberOpt = request.getQueryString("playerNumber").flatMap(s => scala.util.Try(s.toInt).toOption)
      
      println(s"[combinedView] playerNumber from query: $playerNumberOpt")
      
      // Get the appropriate player based on query param or fallback to current player
      val playerOpt = playerNumberOpt match {
        case Some(num) => 
          val p = safe(Main.controller.getPlayerByNumber(num)).flatten
          println(s"[combinedView] Got player by number $num: ${p.map(_.getPlayerName)}")
          p
        case None => 
          val p = safe(Main.controller.getCurrentplayer)
          println(s"[combinedView] Using current player: ${p.map(_.getPlayerName)}")
          p
      }
      
      // Resolve the player number for session binding
      val resolvedPlayerNumber = playerNumberOpt.getOrElse {
        val currentName = safe(Main.controller.getCurrentplayer).map(_.getPlayerName).getOrElse("")
        val player1Name = safe(Main.controller.getPlayer1).getOrElse("")
        if (currentName == player1Name) 1 else 2
      }

      if (stateOpt.isEmpty || gridData.isEmpty || playerOpt.isEmpty) {
        println(s"[combinedView] Missing data - state: ${stateOpt.isDefined}, grid: ${gridData.nonEmpty}, player: ${playerOpt.isDefined}")
        Ok(views.html.debug.loadingScreen("I feel like im supposed to be loading something. . ."))
      } else {
        val state         = stateOpt.get
        val player        = playerOpt.get
        val handSeq       = getPlayerHand(player)
        
        println(s"[combinedView] Player ${player.getPlayerName} (ID: $resolvedPlayerNumber) hand: $handSeq")

        Ok(views.html.ui.combinedView(state, gridData, handSeq, resolvedPlayerNumber))
      }
    }
  }

  def enterNames: Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.ui.enterNames())
  }

  def setPlayerNames: Action[JsValue] = Action(parse.json) { implicit request: Request[JsValue] =>
    println(s"[setPlayerNames] Received request: ${request.body}")
    
    // Reset and start a new game
    Main.controller.handleCommand("start")
    Main.controller.setGameMode("m")

    val player1Name = (request.body \ "player1Name").as[String]
    val player2Name = (request.body \ "player2Name").as[String]
    
    println(s"[setPlayerNames] Starting game with: $player1Name vs $player2Name")
    Main.controller.promptForPlayerName(player1Name, player2Name)
    
    println(s"[setPlayerNames] Game initialized, redirecting to combinedView")
    Ok(Json.obj("status" -> "OK", "redirect" -> routes.UiController.combinedView().url))
  }

  def loadingScreen: Action[AnyContent] = Action {
    Ok(views.html.debug.loadingScreen("Loading… or maybe just debugging the loading."))
  }

  // GRID

  private def getGridState: Seq[(Int, Int, String, String, String)] = {
    safe(Main.controller.getGridColors)
      .map(_.flatMap { case (x, y, card, suitColor) =>
        Option(suitColor).map { color =>
          val htmlColor = color.toString.toLowerCase match {
            case "green"  => "#a8e5aaff"
            case "brown"  => "#d29b73ff"
            case "purple" => "#bfa8eeff"
            case "blue"   => "#a1cdf1ff"
            case "red"    => "#f5b5b5ff"
            case "white"  => "rgba(224, 222, 222, 1)"
            case _        => "#CCCCCC"
          }

          val cardInfo = Option(card)
            .flatMap(_.map(_.toString))
            .getOrElse("Empty")

          val suitName = color.toString
          (x, y, cardInfo, htmlColor, suitName)
        }
      })
      .getOrElse(Seq.empty)
  }

  def gridColors: Action[AnyContent] = Action {
    val grid = getGridState
    if (grid.isEmpty)
      Ok(views.html.debug.loadingScreen("I swear it's almost done."))
    else
      Ok(views.html.debug.gridColors(grid))
  }

  // PLAYER

  def playersState: Action[AnyContent] = Action {
    safe(Main.controller.getStateElements)
      .filter(_.size >= 2)
      .map(state => Ok(views.html.debug.playersState(state)))
      .getOrElse(Ok(views.html.debug.loadingScreen("Computing the secret to life, the universe, and everything.")))
  }

  private def parseHand(handStr: String): Seq[String] = {
    Option(handStr)
      .getOrElse("")
      .split(",")
      .map(_.trim)
      .filter(_.nonEmpty)
      .toSeq
  }

  private def getPlayerHand(player: PlayerInterface): Seq[String] = {
    safe(player.getHand)
      .map(_.map(_.toString).mkString(", "))
      .map(parseHand)
      .getOrElse(Seq.empty)
  }

  def getCurrentplayerHand: Action[AnyContent] = Action {
    val playerOpt = safe(Main.controller.getCurrentplayer)
    val handOpt   = playerOpt.flatMap(p => safe(p.getHand))

    handOpt match {
      case Some(hand) if hand.nonEmpty =>
        Ok(s"Hand: [${hand.map(_.toString).mkString(", ")}]")
      case _ =>
        Ok(views.html.debug.loadingScreen("I think I am, therefore, I am. I think."))
    }
  }

  def playerHandView: Action[AnyContent] = Action {
    val playerOpt = safe(Main.controller.getCurrentplayer)
    playerOpt match {
      case Some(p: PlayerInterface) =>
        val handSeq = getPlayerHand(p)
        Ok(views.html.debug.playerHand(handSeq))
      case _ =>
        Ok(views.html.debug.loadingScreen("Couldn't load current player's hand."))
    }
  }

  // GAME ACTIONS

  def placeCard: Action[AnyContent] = Action { implicit request =>
    if (Main.controller.isGameOver) {
      Ok(Json.obj("gameOver" -> true))
    } else {
      request.body.asJson match {
        case Some(json) =>
          val cardIndex = (json \ "cardIndex").as[Int]
          val x         = (json \ "x").as[Int]
          val y         = (json \ "y").as[Int]
          // Get player number from request body for online multiplayer
          val requestedPlayerNumber = (json \ "playerNumber").asOpt[Int]
          val currentPlayerName = safe(Main.controller.getCurrentplayer).map(_.getPlayerName).getOrElse("")
          val player1Name = safe(Main.controller.getPlayer1).getOrElse("")
          val playerNumber = if (currentPlayerName == player1Name) "player1" else "player2"

          Main.controller.handleCardPlacement(cardIndex, x, y)
          
          val result = getGameStateJson(requestedPlayerNumber)
          val resultJson = result.asInstanceOf[play.api.mvc.Result].body.asInstanceOf[play.api.http.HttpEntity.Strict].data.utf8String
          val jsonObj = Json.parse(resultJson).as[JsObject]
          Ok(jsonObj ++ Json.obj("placedByPlayer" -> playerNumber, "placedAt" -> Json.obj("x" -> x, "y" -> y)))

      }
    }
  }

  def drawCard: Action[AnyContent] = Action { implicit request =>
    if (Main.controller.isGameOver) {
      Ok(Json.obj("gameOver" -> true))
    } else {
      val playerNumberOpt = request.getQueryString("playerNumber").flatMap(s => scala.util.Try(s.toInt).toOption)
      Main.controller.handleCommand("draw")
      Main.controller.askForInputAgain()
      getGameStateJson(playerNumberOpt)
    }
  }

  def undo: Action[AnyContent] = Action { implicit request =>
    if (Main.controller.isGameOver) {
      Ok(Json.obj("gameOver" -> true))
    } else {
      val playerNumberOpt = request.getQueryString("playerNumber").flatMap(s => scala.util.Try(s.toInt).toOption)
      Main.controller.handleCommand("undo")
      Main.controller.askForInputAgain()
      getGameStateJson(playerNumberOpt)
    }
  }

  def redo: Action[AnyContent] = Action { implicit request =>
    if (Main.controller.isGameOver) {
      Ok(Json.obj("gameOver" -> true))
    } else {
      val playerNumberOpt = request.getQueryString("playerNumber").flatMap(s => scala.util.Try(s.toInt).toOption)
      Main.controller.handleCommand("redo")
      Main.controller.askForInputAgain()
      getGameStateJson(playerNumberOpt)
    }
  }

  def gameOverPage: Action[AnyContent] = Action {
    if (Main.controller.isGameOver) {
      val winnerName = Main.controller.getWinner().getOrElse("No one")
      Ok(views.html.ui.gameOver(winnerName))
    } else {
      Redirect(routes.UiController.combinedView())
    }
  }

  def gameOver: Action[AnyContent] = Action {
    if (Main.controller.isGameOver)
      Redirect(routes.UiController.gameOverPage())
    else
      Redirect(routes.UiController.index())
  }

  private def getGameStateJson(playerNumberOpt: Option[Int] = None): Result = {
    import play.api.libs.json._

    val stateOpt  = safe(Main.controller.getStateElements)
    val gridData  = getGridState
    
    // Get the appropriate player based on player number or fallback to current player
    val playerOpt = playerNumberOpt match {
      case Some(num) => safe(Main.controller.getPlayerByNumber(num)).flatten
      case None => safe(Main.controller.getCurrentplayer)
    }
    
    // Determine which player number this is (1 or 2)
    val resolvedPlayerNumber = playerNumberOpt.getOrElse {
      val currentName = safe(Main.controller.getCurrentplayer).map(_.getPlayerName).getOrElse("")
      val player1Name = safe(Main.controller.getPlayer1).getOrElse("")
      if (currentName == player1Name) 1 else 2
    }

    if (stateOpt.isEmpty || gridData.isEmpty || playerOpt.isEmpty) {
      Ok(
        Json.obj(
          "success" -> false,
          "message" -> "Game state not available"
        )
      )
    } else {
      val state   = stateOpt.get
      val player  = playerOpt.get
      val handSeq = getPlayerHand(player)
      
      // Get current player's number to indicate whose turn it is
      val currentPlayerName = safe(Main.controller.getCurrentplayer).map(_.getPlayerName).getOrElse("")
      val player1Name = safe(Main.controller.getPlayer1).getOrElse("")
      val currentTurnPlayerNumber = if (currentPlayerName == player1Name) 1 else 2

      val gridJson = gridData.map { case (x, y, cardInfo, htmlColor, suitName) =>
        Json.obj(
          "x"     -> x,
          "y"     -> y,
          "card"  -> cardInfo,
          "color" -> htmlColor,
          "suit"  -> suitName
        )
      }

      Ok(
        Json.obj(
          "success" -> true,
          "state"   -> state,
          "grid"    -> gridJson,
          "hand"    -> handSeq,
          "playerNumber" -> resolvedPlayerNumber,
          "currentTurnPlayer" -> currentTurnPlayerNumber,
          "isMyTurn" -> (resolvedPlayerNumber == currentTurnPlayerNumber)
        )
      )
    }
  }

  private def safe[T](expr: => T): Option[T] =
    Try(expr).toOption

}
