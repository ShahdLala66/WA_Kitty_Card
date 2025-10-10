package controllers

import javax.inject._
import play.api.mvc._
import services.GameStateService

@Singleton
class GameApiController @Inject()(cc: ControllerComponents, gameService: GameStateService) extends AbstractController(cc) {

  def getUpdates = Action {
    val updates = gameService.getAllUpdates
    Ok(updates.mkString("\n"))
  }

  def clearUpdates = Action {
    gameService.clear()
    Ok("Cleared")
  }
}
