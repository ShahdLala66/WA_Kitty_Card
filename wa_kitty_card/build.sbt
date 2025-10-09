name := """WA_Kitty_Card"""
organization := "com.sharina"

version := "1.0-SNAPSHOT"

scalaVersion := "3.4.2"

lazy val root = (project in file("."))
  .enablePlugins(PlayScala)
  .settings(
    // Include source files from SE_Kitty_Card directly
    Compile / unmanagedSourceDirectories += baseDirectory.value / "../SE_Kitty_Card/src/main/scala",
    Test / unmanagedSourceDirectories += baseDirectory.value / "../SE_Kitty_Card/src/test/scala"

  )
  

libraryDependencies ++= Seq(
  guice,
  "org.scalatestplus.play" %% "scalatestplus-play" % "7.0.2" % Test,
  // Dependencies from SE_Kitty_Card project (excluding conflicting guice)
  "org.scalactic" %% "scalactic" % "3.2.18",
  "org.scalatest" %% "scalatest" % "3.2.18" % "test",
  "org.scalatestplus" %% "mockito-4-5" % "3.2.12.0" % "test",
  "com.typesafe.play" %% "play-json" % "2.10.5",
    "org.openjfx" % "javafx-base" % "22.0.1",
    "org.openjfx" % "javafx-graphics" % "22.0.2",
    "org.openjfx" % "javafx-media" % "22.0.2",
    "org.openjfx" % "javafx-controls" % "22.0.1",
    "org.scalamock" %% "scalamock" % "6.0.0" % "test",
    "com.typesafe.play" %% "play-json" % "2.10.5",
    "org.scala-lang.modules" %% "scala-xml" % "2.3.0",
    "org.scalafx" %% "scalafx" % "22.0.0-R33"
)

// Adds additional packages into Twirl
//TwirlKeys.templateImports += "com.sharina.controllers._"

// Adds additional packages into conf/routes
// play.sbt.routes.RoutesKeys.routesImport += "com.sharina.binders._"
