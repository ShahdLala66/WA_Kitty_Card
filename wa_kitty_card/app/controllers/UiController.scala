package controllers

import javax.inject._
import play.api.mvc._
import main_.Main
import scala.util.Try

@Singleton
class UiController @Inject() (cc: ControllerComponents) extends AbstractController(cc) {

  // VIEWS

  def listEvents: Action[AnyContent] = Action {
    val events = Main.controller.peekBufferedEvents().toString()
    Ok(views.html.listEvents(events))
  }

  def helloKitty: Action[AnyContent] = Action {
    Ok(views.html.helloKitty("Welcome to the Kitty Card Game! :3"))
  }

  def combinedView: Action[AnyContent] = Action {
    val stateOpt  = safe(Main.controller.getStateElements)
    val gridData  = getGridState
    val playerOpt = safe(Main.controller.getCurrentplayer)

    if (stateOpt.isEmpty || gridData.isEmpty || playerOpt.isEmpty) {
      Ok(views.html.loadingScreen("I feel like im supposed to be loading something. . ."))
    } else {
      val state         = stateOpt.get
      val currentPlayer = playerOpt.get

      val hand = safe(currentPlayer.getHand)
        .map(_.map(_.toString).mkString(", "))
        .getOrElse("")
      val handSeq = parseHand(hand)

      Ok(views.html.combinedView(state, gridData, handSeq))
    }
  }

  def enterNames: Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.enterNames())
  }

  def loadingScreen: Action[AnyContent] = Action {
    Ok(views.html.loadingScreen("Loading… or maybe just debugging the loading."))
  }

  // GRID

  private def getGridState: Seq[(Int, Int, String, String, String)] = {
    safe(Main.controller.getGridColors)
      .map(_.flatMap { case (x, y, card, suitColor) =>
        Option(suitColor).map { color =>
          val htmlColor = color.toString.toLowerCase match {
            case "green"  => "#4CAF50"
            case "brown"  => "#8B4513"
            case "purple" => "#9370DB"
            case "blue"   => "#2196F3"
            case "red"    => "#F44336"
            case "white"  => "rgba(69, 69, 69, 1)"
            case _        => "#CCCCCC"
          }

          val cardInfo = Option(card)
            .flatMap(_.map(_.toString))
            .getOrElse("Empty")

          val suitName = color.toString
          (x, y, cardInfo, htmlColor, suitName)
        }
      })
      .getOrElse(Seq.empty)
  }

  def gridColors: Action[AnyContent] = Action {
    val grid = getGridState
    if (grid.isEmpty)
      Ok(views.html.loadingScreen("I swear it's almost done."))
    else
      Ok(views.html.gridColors(grid))
  }

  // PLAYER

  def playersState: Action[AnyContent] = Action {
    safe(Main.controller.getStateElements)
      .filter(_.size >= 2)
      .map(state => Ok(views.html.playersState(state)))
      .getOrElse(Ok(views.html.loadingScreen("Computing the secret to life, the universe, and everything.")))
  }

  private def parseHand(handStr: String): Seq[String] = {
    Option(handStr)
      .getOrElse("")
      .split(",")
      .map(_.trim)
      .filter(_.nonEmpty)
      .toSeq
  }

  def getCurrentplayerHand: Action[AnyContent] = Action {
    val playerOpt = safe(Main.controller.getCurrentplayer)
    val handOpt   = playerOpt.flatMap(p => safe(p.getHand))

    handOpt match {
      case Some(hand) if hand.nonEmpty =>
        Ok(s"Hand: [${hand.map(_.toString).mkString(", ")}]")
      case _ =>
        Ok(views.html.loadingScreen("I think I am, therefore, I am. I think."))
    }
  }

  private def safe[T](expr: => T): Option[T] =
    Try(expr).toOption

}
