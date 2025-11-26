package actors

import org.apache.pekko.actor._
import play.api.libs.json._

object GameWebSocketActor {
  def props(out: ActorRef, sessionId: String, playerId: String) = Props(new GameWebSocketActor(out, sessionId, playerId))
  
  case class SendMessage(message: JsValue)
  case class BroadcastToSession(sessionId: String, message: JsValue, excludePlayerId: Option[String] = None)
}

class GameWebSocketActor(out: ActorRef, sessionId: String, playerId: String) extends Actor {
  import GameWebSocketActor._
  
  // Register with the session manager
  context.system.eventStream.subscribe(self, classOf[BroadcastToSession])
  
  override def preStart(): Unit = {
    super.preStart()
    // Notify that player connected
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
    // Notify that player disconnected
    val leaveMessage = Json.obj(
      "type" -> "player-left",
      "sessionId" -> sessionId,
      "playerId" -> playerId
    )
    context.system.eventStream.publish(BroadcastToSession(sessionId, leaveMessage, Some(playerId)))
  }
  
  def receive = {
    case msg: JsValue =>
      // Message from client
      handleClientMessage(msg)
      
    case BroadcastToSession(sid, message, excludeId) =>
      // Broadcast message to this session
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
        // Broadcast game actions to other players in the session
        context.system.eventStream.publish(
          BroadcastToSession(sessionId, msg, Some(playerId))
        )
      case Some("game-state-update") =>
        // Broadcast state updates
        context.system.eventStream.publish(
          BroadcastToSession(sessionId, msg, Some(playerId))
        )
      case _ =>
        // Unknown message type
    }
  }
}
