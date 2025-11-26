package controllers

import javax.inject._
import play.api.mvc._
import main_.Main
import model.gameModelComp.PlayerInterface
import scala.util.Try
import play.api.libs.json.{Json, JsValue, JsObject}
import play.api.libs.streams.ActorFlow
import org.apache.pekko.actor.ActorSystem
import org.apache.pekko.stream.Materializer
import actors.GameWebSocketActor

@Singleton
class UiController @Inject() (cc: ControllerComponents)(implicit system: ActorSystem, mat: Materializer) extends AbstractController(cc) {

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

  def combinedView: Action[AnyContent] = Action { implicit request =>
    if (Main.controller.isGameOver) {
      Redirect(routes.UiController.gameOverPage())
    } else {
      val stateOpt  = safe(Main.controller.getStateElements)
      val gridData  = getGridState
      val playerOpt = safe(Main.controller.getCurrentplayer)
      
      // Get session info from cookies or query params
      val sessionId = request.session.get("sessionId").orElse(request.getQueryString("sessionId"))
      val playerId = request.session.get("playerId").orElse(request.getQueryString("playerId"))
      val playerNumber = request.session.get("playerNumber").orElse(request.getQueryString("playerNumber"))

      if (stateOpt.isEmpty || gridData.isEmpty || playerOpt.isEmpty) {
        Ok(views.html.debug.loadingScreen("I feel like im supposed to be loading something. . ."))
      } else {
        val state         = stateOpt.get
        val currentPlayer = playerOpt.get
        
        // Get the hand for the specific player viewing this page
        val handSeq = (sessionId, playerId, playerNumber) match {
          case (Some(sid), Some(pid), Some(pNum)) =>
            // Session-based: show cards only for the player viewing
            val viewingPlayerNumber = pNum.toInt
            val viewingPlayer = Main.controller.getSessionPlayer(sid, viewingPlayerNumber)
            viewingPlayer.map(p => getPlayerHand(p)).getOrElse(Seq.empty)
          case _ =>
            // Legacy mode: show current player's hand
            getPlayerHand(currentPlayer)
        }

        Ok(views.html.ui.combinedView(state, gridData, handSeq))
          .withSession(
            sessionId.map("sessionId" -> _).toSeq ++ 
            playerId.map("playerId" -> _).toSeq ++
            playerNumber.map("playerNumber" -> _).toSeq: _*
          )
      }
    }
  }

  def enterNames: Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.ui.enterNames())
  }

  def setPlayerNames: Action[JsValue] = Action(parse.json) { implicit request: Request[JsValue] =>
    Main.controller.setGameMode("m")

    val player1Name = (request.body \ "player1Name").as[String]
    val player2Name = (request.body \ "player2Name").as[String]
    Main.controller.promptForPlayerName(player1Name, player2Name)

    Ok(Json.obj("status" -> "OK", "redirect" -> routes.UiController.combinedView().url))
  }
  
  // SESSION MANAGEMENT ________________________________________________
  
  def createGame: Action[JsValue] = Action(parse.json) { implicit request: Request[JsValue] =>
    val playerName = (request.body \ "playerName").as[String]
    val playerId = java.util.UUID.randomUUID().toString
    
    val sessionId = Main.controller.createGameSession()
    Main.controller.joinGameSession(sessionId, playerName, playerId)
    
    Ok(Json.obj(
      "status" -> "OK",
      "sessionId" -> sessionId,
      "playerId" -> playerId,
      "playerNumber" -> 1
    )).withSession(
      "sessionId" -> sessionId,
      "playerId" -> playerId,
      "playerNumber" -> "1"
    )
  }
  
  def joinGame: Action[JsValue] = Action(parse.json) { implicit request: Request[JsValue] =>
    val sessionId = (request.body \ "sessionId").as[String]
    val playerName = (request.body \ "playerName").as[String]
    val playerId = java.util.UUID.randomUUID().toString
    
    Main.controller.joinGameSession(sessionId, playerName, playerId) match {
      case Some(playerNumber) =>
        // Start the game if both players are ready
        if (playerNumber == 2) {
          Main.controller.setGameMode("m")
          Main.controller.startGameSession(sessionId)
        }
        
        Ok(Json.obj(
          "status" -> "OK",
          "sessionId" -> sessionId,
          "playerId" -> playerId,
          "playerNumber" -> playerNumber
        )).withSession(
          "sessionId" -> sessionId,
          "playerId" -> playerId,
          "playerNumber" -> playerNumber.toString
        )
      case None =>
        BadRequest(Json.obj(
          "status" -> "ERROR",
          "message" -> "Unable to join game. Session may be full or not found."
        ))
    }
  }
  
  def gameWebSocket(sessionId: String, playerId: String): WebSocket = WebSocket.accept[JsValue, JsValue] { request =>
    ActorFlow.actorRef { out =>
      GameWebSocketActor.props(out, sessionId, playerId)
    }
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
          
          // Try to get session info from JSON body, then from session, then from cookies
          val sessionId = (json \ "sessionId").asOpt[String]
            .orElse(request.session.get("sessionId"))
          val playerId = (json \ "playerId").asOpt[String]
            .orElse(request.session.get("playerId"))
          
          println(s"[DEBUG] placeCard - sessionId: $sessionId, playerId: $playerId")
          
          // Validate player turn if session info provided
          val canPlay = (sessionId, playerId) match {
            case (Some(sid), Some(pid)) => 
              val result = Main.controller.isPlayerTurn(sid, pid)
              println(s"[DEBUG] isPlayerTurn check: $result for sid=$sid, pid=$pid")
              result
            case _ => 
              println(s"[DEBUG] No session info - allowing legacy mode")
              true // Legacy mode without sessions
          }
          
          if (!canPlay) {
            Ok(Json.obj(
              "success" -> false,
              "message" -> "It's not your turn!"
            ))
          } else {
            val currentPlayerName = safe(Main.controller.getCurrentplayer).map(_.getPlayerName).getOrElse("")
            val player1Name = safe(Main.controller.getPlayer1).getOrElse("")
            val playerNumber = if (currentPlayerName == player1Name) "player1" else "player2"

            Main.controller.handleCardPlacement(cardIndex, x, y)
            
            val result = getGameStateJson()
            val resultJson = result.asInstanceOf[play.api.mvc.Result].body.asInstanceOf[play.api.http.HttpEntity.Strict].data.utf8String
            val jsonObj = Json.parse(resultJson).as[JsObject]
            val response = jsonObj ++ Json.obj(
              "placedByPlayer" -> playerNumber, 
              "placedAt" -> Json.obj("x" -> x, "y" -> y),
              "action" -> "placeCard"
            )
            
            // Broadcast to other players in session
            for {
              sid <- sessionId
              pid <- playerId
            } {
              system.eventStream.publish(
                actors.GameWebSocketActor.BroadcastToSession(sid, response, Some(pid))
              )
            }
            
            Ok(response)
          }
        case None =>
          BadRequest(Json.obj("success" -> false, "message" -> "Invalid request"))
      }
    }
  }

  def drawCard: Action[AnyContent] = Action { implicit request =>
    if (Main.controller.isGameOver) {
      Ok(Json.obj("gameOver" -> true))
    } else {
      val jsonOpt = request.body.asJson
      
      // Try to get session info from JSON body, then from session
      val sessionId = jsonOpt.flatMap(json => (json \ "sessionId").asOpt[String])
        .orElse(request.session.get("sessionId"))
      val playerId = jsonOpt.flatMap(json => (json \ "playerId").asOpt[String])
        .orElse(request.session.get("playerId"))
      
      println(s"[DEBUG] drawCard - sessionId: $sessionId, playerId: $playerId")
      
      // Validate player turn if session info provided
      val canPlay = (sessionId, playerId) match {
        case (Some(sid), Some(pid)) => 
          val result = Main.controller.isPlayerTurn(sid, pid)
          println(s"[DEBUG] drawCard isPlayerTurn check: $result for sid=$sid, pid=$pid")
          result
        case _ => 
          println(s"[DEBUG] drawCard - No session info, allowing legacy mode")
          true
      }
      
      if (!canPlay) {
        Ok(Json.obj(
          "success" -> false,
          "message" -> "It's not your turn!"
        ))
      } else {
        Main.controller.handleCommand("draw")
        Main.controller.askForInputAgain()
        
        val response = getGameStateJson()
        
        // Broadcast to other players in session
        for {
          sid <- sessionId
          pid <- playerId
        } {
          val responseJson = response.asInstanceOf[play.api.mvc.Result].body
            .asInstanceOf[play.api.http.HttpEntity.Strict].data.utf8String
          val jsonObj = Json.parse(responseJson).as[JsObject] ++ Json.obj("action" -> "drawCard")
          system.eventStream.publish(
            actors.GameWebSocketActor.BroadcastToSession(sid, jsonObj, Some(pid))
          )
        }
        
        response
      }
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

  private def getGameStateJson(): Result = {
    import play.api.libs.json._

    val stateOpt  = safe(Main.controller.getStateElements)
    val gridData  = getGridState

    if (stateOpt.isEmpty || gridData.isEmpty) {
      Ok(
        Json.obj(
          "success" -> false,
          "message" -> "Game state not available"
        )
      )
    } else {
      val state = stateOpt.get

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
           //"hand"    -> handSeq
        )
      )
    }
  }

  private def safe[T](expr: => T): Option[T] =
    Try(expr).toOption

}
