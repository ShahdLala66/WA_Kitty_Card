package controllers

import javax.inject._
import play.api.mvc._
import play.api.libs.streams.ActorFlow
import play.api.libs.json.Json
import org.apache.pekko.actor._
import org.apache.pekko.stream.Materializer
import org.apache.pekko.stream.scaladsl.{Flow, Sink, Source}
import main_.Main

@Singleton
class GameSocketController @Inject()(cc: ControllerComponents)(implicit system: ActorSystem, mat: Materializer)
  extends AbstractController(cc) {

  // In-memory game storage (works with single instance)
  private val games = scala.collection.mutable.Map[String, GameRoom]()

  def createGame: Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    val gameId = java.util.UUID.randomUUID().toString
    val gameRoom = new GameRoom(gameId)
    games.put(gameId, gameRoom)

    Ok(Json.obj(
      "gameId" -> gameId,
      "wsUrl" -> s"ws://${request.host}/game/$gameId/ws"
    ))
  }

  def joinGame(gameId: String): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    games.get(gameId) match {
      case Some(room) if room.playerCount < 2 =>
        Ok(Json.obj(
          "gameId" -> gameId,
          "wsUrl" -> s"ws://${request.host}/game/$gameId/ws"
        ))
      case Some(_) =>
        BadRequest("Game is full")
      case None =>
        NotFound("Game not found")
    }
  }

  def gameSocket(gameId: String) = WebSocket.accept[String, String] { _ =>
    games.get(gameId) match {
      case Some(room) =>
        ActorFlow.actorRef { out =>
          GamePlayerActor.props(out, room)
        }
      case None =>
        Flow.fromSinkAndSource(Sink.ignore, Source.single("Game not found"))
    }
  }
}

// Game room class
class GameRoom(val gameId: String) {
  private val players = scala.collection.mutable.ListBuffer[ActorRef]()
  private val playerNames = scala.collection.mutable.Map[Int, String]()
  private var gameStarted = false

  def addPlayer(player: ActorRef): Int = {
    players += player
    players.size
  }

  def setPlayerName(playerNumber: Int, name: String): Unit = {
    playerNames.put(playerNumber, name)
    println(s"[GameRoom] Player $playerNumber name set to: $name")
    
    // If both players have set their names and game hasn't started, start it
    if (playerNames.size >= 2 && !gameStarted) {
      startGame()
    }
  }

  def getPlayerName(playerNumber: Int): String = {
    playerNames.getOrElse(playerNumber, s"Player $playerNumber")
  }

  def playerCount: Int = players.size

  def isFull: Boolean = players.size >= 2

  def isGameStarted: Boolean = gameStarted

  def startGame(): Unit = {
    if (gameStarted) {
      println(s"[GameRoom] Game already started, ignoring")
      return
    }
    
    gameStarted = true
    val player1Name = getPlayerName(1)
    val player2Name = getPlayerName(2)
    
    println(s"[GameRoom] Starting game with $player1Name vs $player2Name")
    
    // Initialize the game in SE controller
    try {
      Main.controller.handleCommand("start")
      Main.controller.setGameMode("m")
      Main.controller.promptForPlayerName(player1Name, player2Name)
      println(s"[GameRoom] Game initialized successfully!")
      
      // Broadcast to all players to redirect to game
      broadcastToAll(Json.stringify(Json.obj(
        "type" -> "gameStart",
        "message" -> "Game is starting!",
        "player1" -> player1Name,
        "player2" -> player2Name
      )))
    } catch {
      case e: Exception =>
        println(s"[GameRoom] Error starting game: ${e.getMessage}")
        e.printStackTrace()
    }
  }

  def broadcast(message: String, except: Option[ActorRef] = None): Unit = {
    players.foreach { player =>
      if (except.isEmpty || except.get != player) {
        player ! message
      }
    }
  }

  def broadcastToAll(message: String): Unit = {
    players.foreach { player =>
      player ! message
    }
  }

  def removePlayer(player: ActorRef): Unit = {
    players -= player
  }
}

// Actor for each player
object GamePlayerActor {
  def props(out: ActorRef, room: GameRoom): Props = Props(new GamePlayerActor(out, room))
}

class GamePlayerActor(out: ActorRef, room: GameRoom) extends Actor {
  import play.api.libs.json.Json

  val playerNumber: Int = room.addPlayer(self)
  println(s"[GamePlayerActor] Player $playerNumber connected. Total players: ${room.playerCount}")

  // Send player their number immediately
  out ! Json.stringify(Json.obj(
    "type" -> "playerAssigned",
    "playerNumber" -> playerNumber
  ))

  // Notify other players that someone joined
  room.broadcast(Json.stringify(Json.obj(
    "type" -> "playerJoined",
    "playerNumber" -> playerNumber
  )), Some(self))

  // If room is now full (2 players), notify clients to send their names
  if (room.isFull && !room.isGameStarted) {
    println(s"[GamePlayerActor] Room is full! Requesting player names...")
    context.system.scheduler.scheduleOnce(
      scala.concurrent.duration.Duration(300, "millis"),
      new Runnable {
        def run(): Unit = {
          room.broadcastToAll(Json.stringify(Json.obj(
            "type" -> "requestPlayerNames",
            "message" -> "Both players connected! Please confirm your names."
          )))
        }
      }
    )(context.system.dispatcher)
  } else {
    println(s"[GamePlayerActor] Room not full yet. Waiting for more players...")
  }

  def receive: Receive = {
    case msg: String =>
      val json = Json.parse(msg)
      (json \ "type").asOpt[String] match {
        case Some("playerInfo") =>
          // Player sent their name - this triggers game start when both names are received
          val playerName = (json \ "playerName").asOpt[String].getOrElse(s"Player $playerNumber")
          println(s"[GamePlayerActor] Player $playerNumber sent name: $playerName")
          room.setPlayerName(playerNumber, playerName)
          
          // Broadcast updated player info to all
          room.broadcastToAll(Json.stringify(Json.obj(
            "type" -> "playerInfoUpdate",
            "playerNumber" -> playerNumber,
            "playerName" -> playerName
          )))

        case Some("move") =>
          room.broadcast(msg, Some(self))

        case Some("cardPlayed") =>
          room.broadcast(msg, Some(self))

        case Some("gameAction") =>
          room.broadcast(msg, Some(self))

        case Some("chat") =>
          room.broadcast(msg, Some(self))

        case _ =>
          println(s"[GamePlayerActor] Unknown message type: $msg")
      }
  }

  override def postStop(): Unit = {
    room.removePlayer(self)
    room.broadcast(Json.stringify(Json.obj(
      "type" -> "playerLeft",
      "playerNumber" -> playerNumber
    )))
  }
}
