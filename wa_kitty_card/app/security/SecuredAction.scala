package security

import play.api.mvc._
import play.api.libs.json.Json
import com.google.firebase.auth.FirebaseAuth

import scala.concurrent.{ExecutionContext, Future}
import javax.inject._

final case class AuthenticatedRequest[A](uid: String, request: Request[A])
  extends WrappedRequest[A](request)

@Singleton
class SecuredAction @Inject() (
  val parser: BodyParser[AnyContent]
)(implicit val executionContext: ExecutionContext)
  extends ActionBuilder[AuthenticatedRequest, AnyContent] {

  override def invokeBlock[A](
    request: Request[A],
    block: AuthenticatedRequest[A] => Future[Result]
  ): Future[Result] = {

    println(s"SecuredAction - Headers: ${request.headers.toSimpleMap}")
    
    extractToken(request) match {
      case None =>
        println("No token found in Authorization header")
        Future.successful(
          Results.Unauthorized(Json.obj(
            "status" -> "ERROR",
            "message" -> "No authorization token provided"
          ))
        )

      case Some(token) =>
        println(s"Token found: ${token.take(20)}...")
        
        if (com.google.firebase.FirebaseApp.getApps.isEmpty) {
          println("Firebase Admin NOT initialized - cannot verify token")
          return Future.successful(
            Results.InternalServerError(Json.obj(
              "status" -> "ERROR",
              "message" -> "Firebase authentication not configured on server"
            ))
          )
        }
        
        Future {
          val decodedToken = FirebaseAuth.getInstance().verifyIdToken(token)
          decodedToken.getUid
        }.flatMap { uid =>
          println(s"Token verified for user: $uid")
          block(AuthenticatedRequest(uid, request))
        }.recover { case e =>
          println(s"Token verification failed: ${e.getMessage}")
          e.printStackTrace()
          Results.Unauthorized(Json.obj(
            "status" -> "ERROR",
            "message" -> "Invalid or expired token"
          ))
        }
    }
  }

  private def extractToken[A](request: Request[A]): Option[String] =
    request.headers.get("Authorization")
      .filter(_.startsWith("Bearer "))
      .map(_.substring("Bearer ".length).trim)
}
