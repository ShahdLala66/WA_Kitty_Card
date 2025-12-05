initial setup:

for se:
git submodule init
git submodule update --remote
npm:
cd wa_kitty_card\frontend
npm install
npm run serve

to run the game:

terminal one (in root):
sbt "project wa_kitty_card" run
terminal two:
cd wa_kitty_card\frontend
npm run serve

-> http://localhost:8080/