<template>
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
              <li>
                <a class="dropdown-item" href="/listEvents">List Events</a>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      lastScrollTop: 0,
      scrollThreshold: 5
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
      
      const navbar = this.$el;
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

<style lang="scss" scoped>
@import "@/styles/colors";

body {
    padding-top: 15vh !important;
}

nav.navbar {
    position: fixed;
    background: $white-transparent !important;
    box-shadow: 0 $box-shadow-blur $base-size $black-shadow-light !important;
    transition: transform 0.3s ease-in-out;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        backdrop-filter: blur($backdrop-blur);
        z-index: -1;
    }

    &.navbar-hidden {
        transform: translateY(-100%);
    }
}

nav.navbar .navbar-brand {
    font-weight: bold !important;
}

nav.navbar .nav-link {
    color: $font-dark !important;
    border-radius: $border-radius;

    &:hover {
        background: $white-transparent !important;
    }
}

nav.navbar .dropdown-menu {
    background: $white-transparent !important;
    border: none !important;
    border-radius: $border-radius;
    box-shadow: 0 $box-shadow-blur $base-size $black-shadow-light !important;

    &::before {
        content: '';
        position: absolute;
        inset: 0;
        backdrop-filter: blur($backdrop-blur);
        border-radius: inherit;
        z-index: -1;
    }
}

nav.navbar .dropdown-item {
    color: $font-dark !important;

    &:hover {
        background: $white-transparent !important;
        border-radius: $border-radius;
    }
}

.navbar-toggler-icon-img {
    width: 1.5em;
    height: 1.5em;
}

.navbar-toggler:hover {
    background: $white-transparent !important;
}
</style>
