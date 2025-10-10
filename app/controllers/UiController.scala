package controllers

import javax.inject._
import play.api.mvc._
import SE_Kitty_Card.GameLauncher
import services.{GameStateService, GameStateServiceSingleton}

@Singleton
class GameWebController @Inject()(cc: ControllerComponents, gameService: GameStateService) extends AbstractController(cc) {
  // Initialize singleton so old controller can use it
  GameStateServiceSingleton.init(gameService)
  
}

