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
