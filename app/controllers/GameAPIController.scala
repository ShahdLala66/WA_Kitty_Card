package controllers

import javax.inject._
import play.api.mvc._
import services.GameStateService

@Singleton
class GameApiController @Inject()(cc: ControllerComponents, gameService: GameStateService) extends AbstractController(cc) {

  def getUpdates: Action[AnyContent] = Action {
    val updates = gameService.getAllUpdates
    Ok(updates.mkString("\n"))
  }

  def clearUpdates: Action[AnyContent] = Action {
    gameService.clear()
    Ok("Cleared")
  }
  
  // Receive updates from SE project via HTTP
  def receiveUpdate(): Action[AnyContent] = Action { request =>
    request.body.asText match {
      case Some(update) =>
        gameService.addUpdate(update)
        Ok("Update received")
      case None =>
        BadRequest("No update provided")
    }
  }
}
