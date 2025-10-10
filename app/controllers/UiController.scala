package controllers

import javax.inject._
import play.api.mvc._

@Singleton
class UiController @Inject()(cc: ControllerComponents) extends AbstractController(cc) {
    def index: Action[AnyContent] = Action {
        Ok(views.html.index("Kitty Cards"))
    }
}