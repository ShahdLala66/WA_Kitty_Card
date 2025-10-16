package controllers

import javax.inject._
import play.api.mvc._
import main_.Main

@Singleton
class UiController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
    def index: Action[AnyContent] = Action {
        Ok(views.html.index(Main.controller.peekBufferedEvents().toString()))
    }
}