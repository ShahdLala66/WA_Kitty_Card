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
import actors.GameWebSocketActorFactory
import security.{FirebaseAdmin, SecuredAction, AuthenticatedRequest}
import scala.concurrent.ExecutionContext

@Singleton
class UiController @Inject() (cc: ControllerComponents)(implicit system: ActorSystem, mat: Materializer, ec: ExecutionContext) extends AbstractController(cc) {

  FirebaseAdmin.init()

  private val securedAction = new SecuredAction(cc.parsers.defaultBodyParser)

  private val gridPlacements = scala.collection.mutable.Map[(Int, Int), String]()

  def index(path: String): Action[AnyContent] = Action {
    Ok(views.html.vueIndex())
  }
  
  def createGame: Action[JsValue] = securedAction(parse.json) { implicit request: AuthenticatedRequest[JsValue] =>
    val playerName = (request.body \ "playerName").as[String]
    val playerId = java.util.UUID.randomUUID().toString
    
    Main.controller.handleCommand("start")
    gridPlacements.clear()
    
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
  
  def joinGame: Action[JsValue] = securedAction(parse.json) { implicit request: AuthenticatedRequest[JsValue] =>
    val sessionId = (request.body \ "sessionId").as[String]
    val playerName = (request.body \ "playerName").as[String]
    val playerId = java.util.UUID.randomUUID().toString
    
    Main.controller.joinGameSession(sessionId, playerName, playerId) match {
      case Some(playerNumber) =>
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
  
  def getGameState: Action[AnyContent] = securedAction { implicit request: AuthenticatedRequest[AnyContent] =>
    val sessionId = request.getQueryString("sessionId")
    val playerId = request.getQueryString("playerId")
    val playerNumber = (sessionId, playerId) match {
      case (Some(sid), Some(pid)) => 
        Main.controller.getPlayerNumberForSession(sid, pid)
      case _ => None
    }
    
    val stateOpt = safe(Main.controller.getStateElements)
    val gridData = getGridState
    
    if (stateOpt.isEmpty || gridData.isEmpty) {
      Ok(Json.obj(
        "success" -> false,
        "message" -> "Game state not available"
      ))
    } else {
      val state = stateOpt.get
      
      val gridJson = gridData.map { case (x, y, cardInfo, htmlColor, suitName) =>
        val placedBy = gridPlacements.get((x, y)).orNull
        Json.obj(
          "x" -> x,
          "y" -> y,
          "card" -> cardInfo,
          "color" -> htmlColor,
          "suit" -> suitName,
          "placedByPlayer" -> placedBy
        )
      }
      

      val handSeq = (sessionId, playerId, playerNumber) match {
        case (Some(sid), Some(pid), Some(pNum)) =>
          Main.controller.getSessionPlayer(sid, pNum)
            .map(p => safe(p.getHand).map(_.map(_.toString)).getOrElse(Seq.empty))
            .getOrElse(Seq.empty)
        case _ => Seq.empty
      }
      
      val playersOpt = safe(Main.controller.getPlayers)
      val playersJson = playersOpt.map { players =>
        players.map { player =>
          Json.obj(
            "name" -> player.name,
            "score" -> player.points,
            "color" -> (if (player.name == state(1)) "#FF6B6B" else "#4ECDC4")
          )
        }
      }.getOrElse(Seq.empty)
      
      Ok(Json.obj(
        "success" -> true,
        "state" -> state,
        "grid" -> gridJson,
        "hand" -> handSeq,
        "players" -> playersJson,
        "gameOver" -> Main.controller.isGameOver
      ))
    }
  }
  
  def gameWebSocket(sessionId: String, playerId: String): WebSocket = WebSocket.accept[JsValue, JsValue] { request =>
    ActorFlow.actorRef { out =>
      GameWebSocketActorFactory.create(out, sessionId, playerId)
    }
  }

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

  def placeCard: Action[AnyContent] = securedAction { implicit request: AuthenticatedRequest[AnyContent] =>
    if (Main.controller.isGameOver) {
      Ok(Json.obj("gameOver" -> true))
    } else {
      request.body.asJson match {
        case Some(json) =>
          val (cardIndex, x, y) = ((json \ "cardIndex").as[Int], (json \ "x").as[Int], (json \ "y").as[Int])
          def getParam(key: String) = (json \ key).asOpt[String].orElse(request.session.get(key))
          val (sessionId, playerId) = (getParam("sessionId"), getParam("playerId"))
          
          val canPlay = (for {
            sid <- sessionId
            pid <- playerId
          } yield Main.controller.isPlayerTurn(sid, pid)).getOrElse(true)
          
          if (!canPlay) {
            Ok(Json.obj("success" -> false, "message" -> "It's not your turn!"))
          } else {
            val currentPlayerName = safe(Main.controller.getCurrentplayer).map(_.getPlayerName).getOrElse("")
            val player1Name = safe(Main.controller.getPlayer1).getOrElse("")
            val playerNumber = if (currentPlayerName == player1Name) "player1" else "player2"

            val placementSuccess = Main.controller.handleCardPlacement(cardIndex, x, y)
            
            if (!placementSuccess) {
              Ok(Json.obj(
                "success" -> false,
                "message" -> "Failed to place card. The position might be occupied or invalid."
              ))
            } else {
              gridPlacements((x, y)) = playerNumber
              val handSeq = for {
                sid <- sessionId
                pid <- playerId
                playerNum <- Main.controller.getPlayerNumberForSession(sid, pid)
                player <- Main.controller.getSessionPlayer(sid, playerNum)
              } yield player.getHand.map(_.toString)
              
              val result = getGameStateJson()
              val resultJson = result.asInstanceOf[play.api.mvc.Result].body.asInstanceOf[play.api.http.HttpEntity.Strict].data.utf8String
              val jsonObj = Json.parse(resultJson).as[JsObject]
              val response = jsonObj ++ Json.obj(
                "placedByPlayer" -> playerNumber, 
                "placedAt" -> Json.obj("x" -> x, "y" -> y),
                "action" -> "placeCard",
                "hand" -> handSeq.getOrElse(Seq.empty),
                "gameOver" -> Main.controller.isGameOver
              )
              
              for {
                sid <- sessionId
                pid <- playerId
              } {
                val otherPlayerHand = for {
                  pNum <- Main.controller.getPlayerNumberForSession(sid, pid).map(n => if (n == 1) 2 else 1)
                  player <- Main.controller.getSessionPlayer(sid, pNum)
                } yield player.getHand.map(_.toString)
                
                system.eventStream.publish(
                  actors.GameWebSocketActorFactory.BroadcastToSession(sid, jsonObj ++ Json.obj(
                    "placedByPlayer" -> playerNumber, "placedAt" -> Json.obj("x" -> x, "y" -> y),
                    "action" -> "placeCard", "hand" -> otherPlayerHand.getOrElse(Seq.empty),
                    "gameOver" -> Main.controller.isGameOver
                  ), Some(pid))
                )
              }
              
              Ok(response)
            }
          }
        case None =>
          BadRequest(Json.obj("success" -> false, "message" -> "Invalid request"))
      }
    }
  }

  def drawCard: Action[AnyContent] = securedAction { implicit request: AuthenticatedRequest[AnyContent] =>
    if (Main.controller.isGameOver) {
      Ok(Json.obj("gameOver" -> true))
    } else {
      val jsonOpt = request.body.asJson
      def getParam(key: String) = jsonOpt.flatMap(json => (json \ key).asOpt[String]).orElse(request.session.get(key))
      val (sessionId, playerId) = (getParam("sessionId"), getParam("playerId"))
      
      val canPlay = (for {
        sid <- sessionId
        pid <- playerId
      } yield Main.controller.isPlayerTurn(sid, pid)).getOrElse(true)
      
      if (!canPlay) {
        Ok(Json.obj("success" -> false, "message" -> "It's not your turn!"))
      } else {
        val playerNumberOpt = for {
          sid <- sessionId
          pid <- playerId
        } yield Main.controller.getPlayerNumberForSession(sid, pid)
        
        Main.controller.handleCommand("draw")
        Main.controller.askForInputAgain()
        
        val handSeq = (for {
          sid <- sessionId
          playerNum <- playerNumberOpt.flatten
          player <- Main.controller.getSessionPlayer(sid, playerNum)
        } yield player.getHand.map(_.toString)).getOrElse(Seq.empty)
        
        val response = getGameStateJson()
        val responseJson = response.asInstanceOf[play.api.mvc.Result].body
          .asInstanceOf[play.api.http.HttpEntity.Strict].data.utf8String
        val baseJson = Json.parse(responseJson).as[JsObject]
        
        for {
          sid <- sessionId
          pid <- playerId
        } {
          val jsonWithoutHand = baseJson ++ Json.obj("action" -> "drawCard")
          system.eventStream.publish(
            actors.GameWebSocketActorFactory.BroadcastToSession(sid, jsonWithoutHand, Some(pid))
          )
        }
        
        Ok(baseJson ++ Json.obj("hand" -> handSeq))
      }
    }
  }

  private def getGameStateJson(): Result = {
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
        val placedBy = gridPlacements.get((x, y))
        Json.obj(
          "x"     -> x,
          "y"     -> y,
          "card"  -> cardInfo,
          "color" -> htmlColor,
          "suit"  -> suitName,
          "placedByPlayer" -> placedBy
        )
      }

      val playersOpt = safe(Main.controller.getPlayers)
      val playersJson = playersOpt.map { players =>
        players.map { player =>
          Json.obj(
            "name"  -> player.name,
            "score" -> player.points,
            "color" -> (if (player.name == state(1)) "#FF6B6B" else "#4ECDC4")
          )
        }
      }.getOrElse(Seq.empty)

      Ok(
        Json.obj(
          "success" -> true,
          "state"   -> state,
          "grid"    -> gridJson,
          "players" -> playersJson
        )
      )
    }
  }

  private def safe[T](code: => T): Option[T] =
    Try(code).toOption

}
