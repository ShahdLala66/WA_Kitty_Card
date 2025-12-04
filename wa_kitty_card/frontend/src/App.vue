<template>
  <div id="app">
    <nav class="navbar navbar-expand-sm navbar-light bg-light fixed-top">
      <div class="container-fluid">
        <a class="navbar-brand" href="/">Kitty Card</a>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
        >
          <img
            src="/images/gorot.png"
            class="navbar-toggler-icon-img"
          />
        </button>

        <div
          class="collapse navbar-collapse justify-content-end me-5"
          id="navbarNavDropdown"
        >
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link" href="/combinedView">Game View</a>
            </li>
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Debug
              </a>
              <ul class="dropdown-menu">
                <li>
                  <a class="dropdown-item" href="/playersState">Players State</a>
                </li>
                <li>
                  <a class="dropdown-item" href="/gridColors">Grid</a>
                </li>
                <li>
                  <a class="dropdown-item" href="/playersHand">Players Hand</a>
                </li>
                <li></li>
                <li>
                  <a class="dropdown-item" href="/listEvents">List Events</a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
    
    <component :is="currentView" />
  </div>
</template>

<script>
import Home from './views/Home.vue'
import EnterNames from './views/EnterNames.vue'
import Game from './views/Game.vue'
import GameOver from './views/GameOver.vue'

export default {
  name: 'App',
  components: {
    Home,
    EnterNames,
    Game,
    GameOver
  },
  computed: {
    currentView() {
      const path = window.location.pathname;
      if (path === '/') return 'Home';
      if (path === '/enterNames') return 'EnterNames';
      if (path === '/combinedView') return 'Game';
      if (path === '/gameOverPage') return 'GameOver';
      // Fallback or handle debug views if we made components for them
      // For now, if it's a debug view, we might just show the JSON dump if we didn't make a component
      // But since we are using a single entry point, we need to handle it.
      // If the controller returns vueIndex for debug views, we need a generic 'Debug' component or reuse one.
      // For simplicity, let's map debug paths to a simple JSON viewer or just Home for now if not implemented.
      if (['/playersState', '/gridColors', '/playersHand', '/listEvents'].includes(path)) return 'Game'; // Reusing Game or we could make a Debug component
      return 'Home';
    }
  }
}
</script>

<style lang="scss">
/* Assuming a build setup that handles SCSS imports */
@import "./styles/session-styles.scss";

@import "@/styles/colors";
@import "@/styles/background";
@import "@/styles/nav-menu";
@import "@/styles/error-handler";
@import "@/styles/table";
@import "@/styles/card-placement";

@import "bootstrap/scss/bootstrap";

body {
  text-align: center;
}

h1 {
  background: $white-transparent;
  backdrop-filter: blur(10px);
  line-height: 1.6;
  transition: transform $transition-fast ease, box-shadow $transition-fast ease;
  border-radius: $border-radius;
  width: 100%;
  padding: 1.2vh 3rem;
  box-shadow: 0 $box-shadow-blur $base-size $black-shadow-light;
  margin-top: 10vh;

  &:hover {
    transform: translateY(-0.2vh);
    box-shadow: 0 $box-shadow-blur $base-size $black-shadow-dark;
  }
}

a {
  color: $font-dark;
  text-decoration: none;
  transition: color $transition-fast ease;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.info-card {
  background: $white-transparent;
  backdrop-filter: blur(10px);
  border-radius: $border-radius;
  box-shadow: 0 $box-shadow-blur $base-size $black-shadow-light;
  padding: 2rem 3rem;
  text-align: left;
  line-height: 1.6;
  transition: transform $transition-fast ease, box-shadow $transition-fast ease;
  width: clamp(60vw, 50vw, 40vw);

  &:hover {
    transform: translateY(-0.2vh);
    box-shadow: 0 $box-shadow-blur $base-size $black-shadow-dark;
  }
}

.card {
  background: $white-transparent !important;
  backdrop-filter: blur(10px) !important;
  box-shadow: 0 $box-shadow-blur $base-size $black-shadow-light !important;
  text-align: left !important;
  transition: transform $transition-fast ease, box-shadow $transition-fast ease !important;

  &:hover {
    transform: translateY(-0.2vh);
    box-shadow: 0 $box-shadow-blur $base-size $black-shadow-dark;
  }
}

.section-title {
  text-align: center;
  font-family: $font-display;
  margin-bottom: 1rem;
  color: $font-dark;
}

ul {
  list-style-type: "🐾 ";
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

.card-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: $font-dark;
}

.card-title::before,
.card-title::after {
  content: "";
  flex: 1 1 auto;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(0, 0, 0, 0.18), transparent);
  margin: 0 0.5rem;
  border-radius: 2px;
}

.card-title strong {
  display: inline-block;
  padding: 0 0.6rem;
  background: transparent;
  position: relative;
}

.card-title strong::before,
.card-title strong::after {
  content: "୨ৎ";
  display: inline-block;
  margin: 0 0.25rem;
  font-size: 0.95rem;
  vertical-align: middle;
}

.player-state-card {
  margin: 0 auto;
  max-height: 45px;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;

}

.player-state-card .card-body {
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-start !important;
}

.transparent-card {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
}

</style>