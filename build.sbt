import sbt.*
import Keys.*
import play.sbt.PlayImport.*

lazy val root = (project in file("."))
    .enablePlugins(PlayScala)
    .dependsOn(se)
    .settings(
        name := "WA_Kitty_Card",
        organization := "com.sharina",
        scalaVersion := "3.4.2",
        libraryDependencies ++= Seq(
            guice // Play's guice module (keep this)
        ),
        dependencyOverrides ++= Seq(
            "com.google.inject" % "guice" % "6.0.0",
            "com.google.inject.extensions" % "guice-assistedinject" % "6.0.0",
            "net.codingwell" %% "scala-guice" % "6.0.0",
            "javax.inject" % "javax.inject" % "1"
        )
    )

lazy val se = ProjectRef(file("../SE_Kitty_Card"), "root")