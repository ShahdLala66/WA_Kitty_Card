package controllers

import javax.inject._
import play.api.mvc._
import main_.Main

@Singleton
class UiController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
    def index: Action[AnyContent] = Action {
        Ok(views.html.index(Main.controller.peekBufferedEvents().toString()))
    }

    def playersState: Action[AnyContent] = Action {
        Ok(views.html.playersState(Main.controller.getState))
    }
    def HelloKitty: Action[AnyContent] = Action {
        Ok(views.html.HelloKitty("Hello, Kitty Card Game!"))
    }

    def gridColors: Action[AnyContent] = Action {
        val gridData = Main.controller.getGridColors
        
        // Transform the grid data into a browser-friendly format
        val gridWithHtmlColors = gridData.map { case (x, y, card, suitColor) =>
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
        
        Ok(views.html.gridColors(gridWithHtmlColors))
    }
  
    }
