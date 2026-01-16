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


npm install vuetify@^3.11.2
npm install firebase@^10.7.1

for the serviceworker:
npm run build 
npx serve -s dist -l 8080 