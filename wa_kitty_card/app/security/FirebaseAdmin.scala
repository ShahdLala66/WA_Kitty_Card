package security

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.{FirebaseApp, FirebaseOptions}
import java.io.FileInputStream
import scala.util.{Try, Success, Failure}

object FirebaseAdmin {
  
  def init(): Unit = {
    if (FirebaseApp.getApps.isEmpty) {
      var serviceAccount: FileInputStream = null
      try {
        serviceAccount = new FileInputStream("wa_kitty_card/conf/firebase-service-account.json")

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
