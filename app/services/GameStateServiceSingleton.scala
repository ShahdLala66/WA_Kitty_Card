package services

import javax.inject._
import scala.compiletime.uninitialized

object GameStateServiceSingleton {
  private var service: GameStateService = uninitialized

  def init(s: GameStateService): Unit = {
    service = s
  }

  def addUpdate(update: String): Unit = {
    if (service != null) service.addUpdate(update)
  }
}
