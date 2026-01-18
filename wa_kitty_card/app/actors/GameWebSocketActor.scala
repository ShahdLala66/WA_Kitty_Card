package actors

import org.apache.pekko.actor._
import play.api.libs.json._

object GameWebSocketActorFactory {
  def create(out: ActorRef, sessionId: String, playerId: String) = Props(new GameWebSocketActor(out, sessionId, playerId))
  
  case class SendMessage(message: JsValue)
  case class BroadcastToSession(sessionId: String, message: JsValue, excludePlayerId: Option[String] = None)
}

class GameWebSocketActor(out: ActorRef, sessionId: String, playerId: String) extends Actor {
  import GameWebSocketActorFactory._
  
  context.system.eventStream.subscribe(self, classOf[BroadcastToSession])
  
  override def preStart(): Unit = {
    super.preStart()
    val joinMessage = Json.obj(
      "type" -> "player-joined",
      "sessionId" -> sessionId,
      "playerId" -> playerId
    )
    context.system.eventStream.publish(BroadcastToSession(sessionId, joinMessage, Some(playerId)))
  }
  
  override def postStop(): Unit = {
    super.postStop()
    context.system.eventStream.unsubscribe(self)
    val leaveMessage = Json.obj(
      "type" -> "player-left",
      "sessionId" -> sessionId,
      "playerId" -> playerId
    )
    context.system.eventStream.publish(BroadcastToSession(sessionId, leaveMessage, Some(playerId)))
  }
  
  def receive = {
    case msg: JsValue =>
      handleClientMessage(msg)
      
    case BroadcastToSession(sid, message, excludeId) =>
      if (sid == sessionId && !excludeId.contains(playerId)) {
        out ! message
      }
      
    case SendMessage(message) =>
      out ! message
  }
  
  private def handleClientMessage(msg: JsValue): Unit = {
    val msgType = (msg \ "type").asOpt[String]
    msgType match {
      case Some("game-action") =>
        context.system.eventStream.publish(
          BroadcastToSession(sessionId, msg, Some(playerId))
        )
      case Some("game-state-update") =>
        context.system.eventStream.publish(
          BroadcastToSession(sessionId, msg, Some(playerId))
        )
      case _ =>
    }
  }
}
