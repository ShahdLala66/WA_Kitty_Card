package modules

import play.api.inject.{ApplicationLifecycle, Binding, Module}
import play.api.{Configuration, Environment}
import services.{GameStateObserver, GameStateService}
import SE_Kitty_Card.GameLauncher
import javax.inject._
import scala.concurrent.Future

class StartupModule extends Module {
  override def bindings(environment: Environment, configuration: Configuration): Seq[Binding[_]] = {
    Seq(
      bind[GameInitializer].toSelf.eagerly()
    )
  }
}

@Singleton
class GameInitializer @Inject()(
  lifecycle: ApplicationLifecycle,
  gameStateObserver: GameStateObserver
) {
  
  // Register the observer with the game controller
  GameLauncher.controller.add(gameStateObserver)
  
  println("GameStateObserver registered with GameController")
  println("Game controller ready - waiting for API calls to start game")
  
 
  
  lifecycle.addStopHook { () =>
    Future.successful(())
  }
}
