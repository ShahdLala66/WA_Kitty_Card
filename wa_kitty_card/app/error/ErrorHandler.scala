package error

import scala.concurrent._
import play.api.http.HttpErrorHandler
import play.api.http.DefaultHttpErrorHandler
import play.api.mvc._
import play.api.mvc.Results._
import play.api.routing.Router
import javax.inject._

@Singleton
class ErrorHandler @Inject() (
    router: Provider[Router],
    defaultHandler: DefaultHttpErrorHandler
) extends HttpErrorHandler {

  override def onClientError(
      request: RequestHeader,
      statusCode: Int,
      message: String
  ): Future[Result] = {
    statusCode match {
      case 404 =>
        val docs = router.get.documentation
        val html = views.html.errors.error404("Page Not Found", docs)(request)
        Future.successful(NotFound(html))
      case _ =>
        // delegate other client errors to Play's default handler
        defaultHandler.onClientError(request, statusCode, message)
    }
  }

  override def onServerError(request: RequestHeader, exception: Throwable): Future[Result] = {
    // delegate server errors to Play's default handler
    defaultHandler.onServerError(request, exception)
  }

}

