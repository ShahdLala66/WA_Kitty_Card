package services

import util.{GameEvent, Observer}
import javax.inject._

@Singleton
class GameStateObserver @Inject()(gameService: GameStateService) extends Observer {
  
  override def update(event: GameEvent): Unit = {
    gameService.addUpdate(event.toString)
  }
}
