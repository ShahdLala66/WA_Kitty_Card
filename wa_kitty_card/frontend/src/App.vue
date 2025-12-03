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
  data() {
    return {
      lastScrollTop: 0,
      scrollThreshold: 5
    }
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
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll);
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  },
  methods: {
    handleScroll() {
      const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
      
      if (currentScroll < 0) return;
      if (Math.abs(this.lastScrollTop - currentScroll) <= this.scrollThreshold) return;
      
      const navbar = this.$el.querySelector('.navbar');
      if (!navbar) return;
      
      const navbarHeight = navbar.offsetHeight;
      
      if (currentScroll > this.lastScrollTop && currentScroll > navbarHeight) {
        navbar.classList.add('navbar-hidden');
      } else if (currentScroll < this.lastScrollTop) {
        navbar.classList.remove('navbar-hidden');
      }
      
      this.lastScrollTop = currentScroll;
    }
  }
}
</script>

<style lang="scss">
/* Assuming a build setup that handles SCSS imports */
@import "./styles/main.scss";
@import "./styles/session-styles.scss";
</style>
