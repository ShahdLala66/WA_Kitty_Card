package security

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.{FirebaseApp, FirebaseOptions}
import java.io.{FileInputStream, ByteArrayInputStream}
import java.nio.charset.StandardCharsets
import scala.util.{Try, Success, Failure}

object FirebaseAdmin {
  
  def init(): Unit = {
    if (FirebaseApp.getApps.isEmpty) {
      var serviceAccount: java.io.InputStream = null
      try {
        val credentials = sys.env.get("FIREBASE_CONFIG") match {
          case Some(jsonConfig) =>
            println("Using FIREBASE_CONFIG from environment variable")
            new ByteArrayInputStream(jsonConfig.getBytes(StandardCharsets.UTF_8))
          case None =>
            // Fallback to file (for local development)
            val credentialsPath = sys.env.getOrElse(
              "GOOGLE_APPLICATION_CREDENTIALS",
              "wa_kitty_card/conf/firebase-service-account.json"
            )
            println(s"Using Firebase credentials from file: $credentialsPath")
            new FileInputStream(credentialsPath)
        }
        
        serviceAccount = credentials

        val options = FirebaseOptions.builder()
          .setCredentials(GoogleCredentials.fromStream(serviceAccount))
          .build()

        FirebaseApp.initializeApp(options)
        println("Firebase Admin initialized successfully")
      } catch {
        case e: java.io.FileNotFoundException =>
          println(s"Firebase service account file not found: ${e.getMessage}")
          println("Continuing without Firebase authentication...")
        case e: Exception =>
          println(s"Failed to initialize Firebase Admin: ${e.getMessage}")
          e.printStackTrace()
          println("Continuing without Firebase authentication...")
      } finally {
        if (serviceAccount != null) {
            serviceAccount.close()
        }
      }
    } else {
      println("Firebase Admin already initialized")
    }
  }
}
