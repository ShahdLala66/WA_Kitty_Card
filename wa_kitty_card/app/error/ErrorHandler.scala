package error

import scala.concurrent._
import play.api.http.HttpErrorHandler
import play.api.mvc._
import play.api.mvc.Results._
import play.api.routing.Router
import javax.inject._

@Singleton
class ErrorHandler @Inject() (router: Provider[Router]) extends HttpErrorHandler {

  def onClientError(
      request: RequestHeader,
      statusCode: Int,
      message: String
  ): Future[Result] = {
    statusCode match {
      case 404 =>
        val docs = router.get.documentation
        val html = views.html.error404("Page Not Found", docs)(request)
        Future.successful(NotFound(html))
      case _ =>
        Future.successful(
          Status(statusCode)(
            s"A client error occurred ($statusCode) on ${request.uri}"
          )
        )
    }
  }

  def onServerError(request: RequestHeader, exception: Throwable): Future[Result] = {
    Future.successful(
      InternalServerError("A server error occurred: " + exception.getMessage)
    )
  }

}
