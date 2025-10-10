package controllers

import javax.inject._
import play.api.mvc._
import SE_Kitty_Card.GameLauncher
import services.{GameStateService, GameStateServiceSingleton}

@Singleton
class GameWebController @Inject()(cc: ControllerComponents, gameService: GameStateService) extends AbstractController(cc) {
  // Initialize singleton so old controller can use it
  GameStateServiceSingleton.init(gameService)
  
  // Serve the main page
  def index(): Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.index("Kitty Card Game"))
  }
  
  // Start the game
  def startGame(): Action[AnyContent] = Action {
    GameLauncher.startGame()
    Ok("Game started")
  }
  
  // Endpoint to set game mode
  def setGameMode(mode: String): Action[AnyContent] = Action {
    GameLauncher.controller.setGameMode(mode)
    Ok(s"Game mode set to: $mode")
  }
  
  // Endpoint to provide player names
  def setPlayerNames(player1: String, player2: String): Action[AnyContent] = Action {
    GameLauncher.controller.promptForPlayerName(player1, player2)
    Ok(s"Players set: $player1 vs $player2")
  }
}


