package services

import javax.inject.Singleton
import scala.collection.mutable

@Singleton
class GameStateService {
  private val gameStateBuffer: mutable.ListBuffer[String] = mutable.ListBuffer.empty

  def addUpdate(update: String): Unit = synchronized {
    gameStateBuffer += update
  }

  def getAllUpdates: List[String] = synchronized {
    gameStateBuffer.toList
  }

  def clear(): Unit = synchronized {
    gameStateBuffer.clear()
  }
}
