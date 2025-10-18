package controllers

import javax.inject._
import play.api.mvc._
import main_.Main

@Singleton
class UiController @Inject() (cc: ControllerComponents) extends AbstractController(cc) {

def listEvents: Action[AnyContent] = Action {
    Ok(views.html.listEvents(Main.controller.peekBufferedEvents().toString()))
  }
  
  def helloKitty: Action[AnyContent] = Action {
    Ok(views.html.helloKitty("Welcome to the Kitty Card Game! :3"))
  }

  private def getGridWithHtmlColors: Seq[(Int, Int, String, String, String)] = {
    val gridData = Main.controller.getGridColors
    
    gridData.map { case (x, y, card, suitColor) =>
      val htmlColor = suitColor.toString.toLowerCase match {
        case "green" => "#4CAF50"
        case "brown" => "#8B4513"
        case "purple" => "#9370DB"
        case "blue" => "#2196F3"
        case "red" => "#F44336"
        case "white" => "rgba(69, 69, 69, 1)"
        case _ => "#CCCCCC"
      }
      
      val cardInfo = card.map(c => s"${c.toString}").getOrElse("Empty")
      val suitName = suitColor.toString
      
      (x, y, cardInfo, htmlColor, suitName)
    }
  }

  def gridColors: Action[AnyContent] = Action {
    Ok(views.html.gridColors(getGridWithHtmlColors))
  }

  def playersState: Action[AnyContent] = Action {
    Ok(views.html.playersState(Main.controller.getStateElements))
  }

  private def parseHand(handStr: String): Seq[String] = {
    val hand = Option(handStr).getOrElse("")
    if (hand.trim.isEmpty) Seq.empty[String]
    else hand.split(",").map(_.trim).filter(_.nonEmpty).toSeq
  }

  def combinedView: Action[AnyContent] = Action {
    val state = Main.controller.getStateElements
    val gridData = getGridWithHtmlColors
    val currentPlayer = Main.controller.getCurrentplayer
    val currentPlayerHand = currentPlayer.getHand.map(_.toString).mkString(", ")
    val currentPlayerHandSeq = parseHand(currentPlayerHand)
    Ok(views.html.combinedView(state, gridData, currentPlayerHandSeq))
  }

  def getCurrentplayerHand : Action[AnyContent] = Action {
    val currentPlayer = Main.controller.getCurrentplayer
    val handCards = currentPlayer.getHand.map(_.toString).mkString(", ")
    Ok(s"Hand: [$handCards]")
  }

  def enterNames: Action[AnyContent] = Action { implicit request: Request[AnyContent] =>
    Ok(views.html.enterNames())
  }
}
