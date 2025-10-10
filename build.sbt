import sbt._
import Keys._
import play.sbt.PlayImport._

lazy val kittyLib = RootProject(file("lib/SE_Kitty_Card"))

lazy val root = (project in file("."))
  .enablePlugins(PlayScala)
  .dependsOn(kittyLib)
  .settings(
    name := "WA_Kitty_Card",
    organization := "com.sharina",
    scalaVersion := "3.4.2",

    libraryDependencies ++= Seq(
      guice,
      "com.typesafe.play" %% "play-json" % "2.10.5",
      "org.scalactic" %% "scalactic" % "3.2.18",
      "org.scalatest" %% "scalatest" % "3.2.18" % Test,
      "org.scala-lang.modules" %% "scala-xml" % "2.3.0"
    ),

    dependencyOverrides ++= Seq(
      "com.google.inject" % "guice" % "6.0.0",
      "com.google.inject.extensions" % "guice-assistedinject" % "6.0.0",
      "net.codingwell" %% "scala-guice" % "6.0.0",
      "javax.inject" % "javax.inject" % "1"
    )
  )
