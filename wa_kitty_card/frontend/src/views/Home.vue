<template>
  <v-container fluid class="home fill-height d-flex flex-column align-center">
    <h1 class="text-h2 font-weight-bold mb-6 text-center">{{ message }}</h1>

    <div class="d-flex justify-center align-center my-8 position-relative" style="z-index: 2">
      <button class="cute-button" @click="$router.push('/enterNames')">
        <img class="button-image" width="150" src="/images/zayne-icon.png" />
      </button>
    </div>

    <div class="cloud">
      <div class="cat-container">
        <img src="/images/ZayneChillingGif.gif" alt="Cat on cloud" />
        <div class="thought-bubble">Welcome! 🐾</div>
      </div>
    </div>

    <v-container class="py-4">
      <v-row>
        <v-col cols="12" md="12" xxl="4" class="mb-3">
          <v-card class="h-100 glass-card" elevation="4">
            <v-card-item>
              <v-card-title class="text-h4 font-weight-bold text-center mb-4 card-title">
                <strong>General</strong>
              </v-card-title>
            </v-card-item>
            <v-card-text class="text-body-1">
              <p class="mb-4">
                When you start the game, you will be asked to choose a mode:
              </p>

              <v-list density="compact" class="bg-transparent">
                <v-list-item prepend-icon="mdi-paw">Single</v-list-item>
                <v-list-item prepend-icon="mdi-paw">Multiplayer</v-list-item>
              </v-list>

              <p class="mt-4">
                Single player mode has a special feature but the game can NOT be
                played as single player, as it needs two people. Then you will be
                asked to load or save a game. If it’s your first time playing, you
                need to start a new game.
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" xxl="4" class="mb-3">
          <v-card class="h-100 glass-card" elevation="4">
            <v-card-item>
              <v-card-title class="text-h4 font-weight-bold text-center mb-4 card-title">
                <strong>Rules</strong>
              </v-card-title>
            </v-card-item>
            <v-card-text class="text-body-1">
              <h4 class="text-h6 font-weight-bold mt-3 mb-2"><em>About Rounds:</em></h4>
              <p class="mb-2">
                At the start of each game, both players decide the order to play.
              </p>
              <ul class="pl-4 mb-4">
                <li>The player going first receives 3 cards.</li>
                <li>The player going second receives also 3 cards.</li>
              </ul>

              <p class="mb-4">
                Players alternate turns, and each round, they can choose to either
                [Play] a card or [Draw] a card. When all 9 cups are filled with
                kitties, the player with more points wins the game.
              </p>

              <h4 class="text-h6 font-weight-bold mt-3 mb-2"><em>About Cards:</em></h4>
              <p class="mb-2">
                There are 4 colors of cards and 5 colors of cups, including the
                white cup.
              </p>
              <ul class="pl-4 mb-4">
                <li>There are the ACE and Bomb cards.</li>
                <li>The ace card freezes the enemy! More rounds for you!</li>
                <li>
                  If you get the bomb card, consider yourself lucky since it's the
                  best! Most points and it destroys the enemy's card AND lets you
                  play again. If you don't win that round it's on you.
                </li>
              </ul>

              <h4 class="text-h6 font-weight-bold mt-3 mb-2"><em>About Points:</em></h4>
              <ul class="pl-4 mb-4">
                <li>You can put your cards in any unoccupied cups.</li>
                <li>
                  Place kitties in the cups and score points based on the cup color.
                </li>
                <li>
                  <strong>Matched Cup</strong> (kitty color matches cup color) gives
                  double points.
                </li>
                <li><strong>White Cup</strong> gives standard points.</li>
                <li>
                  <strong>Unmatched Cup</strong> (kitty color doesn't match the cup
                  color) gives no points.
                </li>
              </ul>

              <h4 class="text-h6 font-weight-bold mt-3 mb-2"><em>About the card placement:</em></h4>
              <ul class="pl-4 mb-4">
                <li>
                  Careful where you place your card! If you place it in the wrong
                  cell the cat will destroy it! Your turn will be canceled.
                </li>
              </ul>

              <h4 class="text-h6 font-weight-bold mt-3 mb-2"><em>About the winner:</em></h4>
              <ul class="pl-4">
                <li>The one with most Points will win.</li>
                <li>
                  If you get the ACE, you are lucky! You will be able to freeze your
                  enemy! Although it might only give you one point, but a win is a
                  win!
                </li>
                <li>Other modes to be added in the future (ahem Semester 5)</li>
              </ul>
            </v-card-text>
            <v-img class="mx-auto mb-4 rounded-lg elevation-2" width="300"
              src="https://github.com/user-attachments/assets/0dabce1d-05ac-43b2-9b42-0b0db84bbe00"></v-img>
            <v-img class="mx-auto mb-4 rounded-lg elevation-2" width="300"
              src="https://github.com/user-attachments/assets/efecb4e8-2e53-4586-8bd7-b79ecacc3ab6"></v-img>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" xxl="4" class="mb-3">
          <v-card class="h-100 glass-card" elevation="4">
            <v-card-item>
              <v-card-title class="text-h4 font-weight-bold text-center mb-4 card-title">
                <strong>LOOK!!!</strong>
              </v-card-title>
            </v-card-item>
            <v-card-text class="text-body-1 text-center">
              <p class="mb-2">
                After being asked what mode you wanna play, you get this:
              </p>
              <v-img class="mx-auto mb-4 rounded-lg elevation-2" width="300"
                src="https://github.com/user-attachments/assets/d9a47570-83dd-42af-a7e9-470f9e398ab5"></v-img>

              <p class="mb-2">Now for the Game itself!</p>
              <v-img class="mx-auto mb-4 rounded-lg elevation-2" width="300"
                src="https://github.com/user-attachments/assets/9f592665-8085-4664-b3d9-3281d1907bdd"></v-img>

              <p class="mb-2">
                Aren't the little kitties cute? Btw THEY'RE ALL MOVING!
              </p>
              <v-img class="mx-auto mb-4 rounded-lg elevation-2" width="300"
                src="https://github.com/user-attachments/assets/4789d1dd-f420-4a28-9237-1f270d346c70"></v-img>
              <v-img class="mx-auto mb-4 rounded-lg elevation-2" width="300"
                src="https://github.com/user-attachments/assets/f4761088-5c92-4b2a-ad1b-d7495532a261"></v-img>

              <p class="mb-2 mt-4">And Game Over:</p>
              <v-img class="mx-auto mb-4 rounded-lg elevation-2" width="300"
                src="https://github.com/user-attachments/assets/90c78aaa-d0af-455b-a8ae-c2bf2257085d"></v-img>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      message: 'Welcome to Kitty Card!'
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/colors";

.glass-card {
  background: $white-transparent !important;
  backdrop-filter: blur(10px);
  border-radius: $border-radius;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.cute-button {
  border: none;
  background: $white-transparent;
  border-radius: $border-radius;
  box-shadow: 0 $box-shadow-blur $base-size $black-shadow-light;
  padding: 10px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-0.2vh);
    box-shadow: 0 $box-shadow-blur $base-size $black-shadow-dark;
  }

  img {
    border-radius: 1rem;
    transition: transform 0.3s ease;
  }
}

.cloud {
  position: absolute;
  width: 15vw;
  height: 6vw;
  left: 70vw;
  top: 20vh;
  background: linear-gradient(to bottom right, #ffffff 0%, #f5f9ff 100%);
  border-radius: 8vw;
  z-index: 1;

  &::before,
  &::after {
    content: "";
    position: absolute;
    background: inherit;
    border-radius: 50%;
    box-shadow: inherit;
  }

  &::before {
    width: 5vw;
    height: 5vw;
    top: -2.5vw;
  }

  &::after {
    width: 6vw;
    height: 6vw;
    top: -3vw;
    left: 2vw;
  }

  animation: cloudFloat 6s ease-in-out infinite alternate;
}

@keyframes cloudFloat {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(-20px);
  }
}

.cat-container {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 8vw;
  pointer-events: auto;
  transition: transform 0.3s ease;
  z-index: 10;
}

.cat-container:hover {
  transform: translate(-50%, -50%) scale(1.1);
}

.cat-container img {
  height: 100%;
}

.thought-bubble {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translate(-50%, -10px);
  background: #fff;
  border-radius: 20px;
  padding: 10px 15px;
  min-width: 120px;
  text-align: center;
  font-family: 'Poppins', sans-serif;
  font-size: clamp(0.7rem, 2vw, 1rem);
  color: #333;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  pointer-events: none;
}

.cat-container:hover .thought-bubble {
  opacity: 1;
  transform: translate(-50%, -25px);
}
</style>
