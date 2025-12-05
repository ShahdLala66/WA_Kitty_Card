<template>
  <div class="home">
    <h1>{{ message }}</h1>

    <div class="button-container">
      <button class="cute-button">
        <a href="/enterNames">
          <img
            class="button-image"
            width="150"
            src="/images/zayne-icon.png"
          />
        </a>
      </button>
    </div>

    <div class="cloud">
      <div class="cat-container">
        <img
          src="/images/ZayneChillingGif.gif"
          alt="Cat on cloud"
        />
        <div class="thought-bubble">Welcome! 🐾</div>
      </div>
    </div>

    <div class="container py-4">
      <div class="row">
        <div class="col-12 col-md-12 col-xxl-4 mb-3">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h2 class="card-title"><strong>General</strong></h2>
              <p class="card-text">
                When you start the game, you will be asked to choose a mode:
              </p>

              <ul>
                <li>Single</li>
                <li>Multiplayer</li>
              </ul>

              <p class="card-text">
                Single player mode has a special feature but the game can NOT be
                played as single player, as it needs two people. Then you will be
                asked to load or save a game. If it’s your first time playing, you
                need to start a new game.
              </p>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-xxl-4 mb-3">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h2 class="card-title"><strong>Rules</strong></h2>
              <h4 class="mt-3"><em>About Rounds:</em></h4>
              <p class="card-text">
                At the start of each game, both players decide the order to play.
              </p>
              <ul>
                <li>The player going first receives 3 cards.</li>
                <li>The player going second receives also 3 cards.</li>
              </ul>

              <p class="card-text">
                Players alternate turns, and each round, they can choose to either
                [Play] a card or [Draw] a card. When all 9 cups are filled with
                kitties, the player with more points wins the game.
              </p>

              <h4 class="mt-3"><em>About Cards:</em></h4>
              <p class="card-text">
                There are 4 colors of cards and 5 colors of cups, including the
                white cup.
              </p>
              <ul>
                <li>There are the ACE and Bomb cards.</li>
                <li>The ace card freezes the enemy! More rounds for you!</li>
                <li>
                  If you get the bomb card, consider yourself lucky since it's the
                  best! Most points and it destroys the enemy's card AND lets you
                  play again. If you don't win that round it's on you.
                </li>
              </ul>

              <h4 class="mt-3"><em>About Points:</em></h4>
              <ul>
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

              <h4 class="mt-3"><em>About the card placement:</em></h4>
              <ul>
                <li>
                  Careful where you place your card! If you place it in the wrong
                  cell the cat will destroy it! Your turn will be canceled.
                </li>
              </ul>

              <h4 class="mt-3"><em>About the winner:</em></h4>
              <ul>
                <li>The one with most Points will win.</li>
                <li>
                  If you get the ACE, you are lucky! You will be able to freeze your
                  enemy! Although it might only give you one point, but a win is a
                  win!
                </li>
                <li>Other modes to be added in the future (ahem Semester 5)</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 col-xxl-4 mb-3">
          <div class="card h-100 shadow-sm">
            <div class="card-body">
              <h2 class="card-title"><strong>LOOK!!!</strong></h2>
              <p class="card-text">
                After being asked what mode you wanna play, you get this:
              </p>
              <img
                class="img-fluid mb-2"
                width="300"
                src="https://github.com/user-attachments/assets/d9a47570-83dd-42af-a7e9-470f9e398ab5"
              />

              <p class="card-text">Now for the Game itself!</p>
              <img
                class="img-fluid mb-2"
                width="300"
                src="https://github.com/user-attachments/assets/9f592665-8085-4664-b3d9-3281d1907bdd"
              />

              <p class="card-text">
                Aren't the little kitties cute? Btw THEY'RE ALL MOVING!
              </p>
              <img
                class="img-fluid mb-2"
                width="300"
                src="https://github.com/user-attachments/assets/4789d1dd-f420-4a28-9237-1f270d346c70"
              />
              <img
                class="img-fluid mb-2"
                width="300"
                src="https://github.com/user-attachments/assets/f4761088-5c92-4b2a-ad1b-d7495532a261"
              />

              <p class="card-text">And Game Over:</p>
              <img
                class="img-fluid mb-2"
                width="300"
                src="https://github.com/user-attachments/assets/90c78aaa-d0af-455b-a8ae-c2bf2257085d"
              />
              <img
                class="img-fluid mb-2"
                width="300"
                src="https://github.com/user-attachments/assets/0dabce1d-05ac-43b2-9b42-0b0db84bbe00"
              />
              <img
                class="img-fluid mb-2"
                width="300"
                src="https://github.com/user-attachments/assets/efecb4e8-2e53-4586-8bd7-b79ecacc3ab6"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      message: 'Welcome to Kitty Card!'
    }
  },
  created() {
    if (window.initialData && window.initialData.message) {
      this.message = window.initialData.message;
    }
  }
}
</script>
