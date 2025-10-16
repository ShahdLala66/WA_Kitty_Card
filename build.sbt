ThisBuild / scalaVersion := "3.5.1"


lazy val commonSettings = Seq(
    ThisBuild / version := "0.1.0-SNAPSHOT",
   libraryDependencies += guice,
   libraryDependencies += "org.scalactic" %% "scalactic" % "3.2.18",
   libraryDependencies += "org.scalatest" %% "scalatest" % "3.2.18" % "test",
   libraryDependencies += "org.scalatestplus" %% "mockito-4-5" % "3.2.12.0" % "test",
   libraryDependencies += "com.typesafe.play" %% "play-json" % "2.10.5",
   libraryDependencies += "org.openjfx" % "javafx-base" % "22.0.1",
   libraryDependencies += "org.openjfx" % "javafx-graphics" % "22.0.2",
   libraryDependencies += "org.openjfx" % "javafx-media" % "22.0.2",
   libraryDependencies += "org.openjfx" % "javafx-controls" % "22.0.1",
   libraryDependencies += "org.scalamock" %% "scalamock" % "6.0.0" % "test",
   libraryDependencies += "com.typesafe.play" %% "play-json" % "2.10.5",
   libraryDependencies += "org.scala-lang.modules" %% "scala-xml" % "2.3.0",
   libraryDependencies += "org.scalafx" %% "scalafx" % "22.0.0-R33"
)

lazy val se_kitty_card = project.in(file("se_kitty_card"))
  .settings(
    commonSettings,
    mainClass := Some("main_.Main")

  )

lazy val wa_kitty_card = project.in(file("wa_kitty_card"))
  .enablePlugins(PlayScala)
  .dependsOn(se_kitty_card % "compile->compile;test->test")
  .settings(
    commonSettings,
    libraryDependencies += "org.scalatestplus.play" %% "scalatestplus-play" % "7.0.2" % Test
  )

lazy val root = (project in file("."))
  .aggregate(se_kitty_card, wa_kitty_card)
  .settings(
    name := "KittyCardWeb"
  )