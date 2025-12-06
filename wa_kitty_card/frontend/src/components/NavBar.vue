<template>
  <div>
    <v-app-bar scroll-behavior="hide" scroll-threshold="10" class="glass-navbar px-8">
      <a href="/" class="text-decoration-none font-weight-bold text-h5" style="color: inherit;">Kitty Card</a>

      <v-spacer></v-spacer>

      <!-- Desktop Menu -->
      <div class="d-none d-sm-flex align-center nav-items-container">
        <v-btn variant="text" href="/combinedView" class="nav-btn">Game View</v-btn>

        <v-menu open-on-hover>
          <template v-slot:activator="{ props }">
            <v-btn variant="text" v-bind="props" class="nav-btn">
              Debug ▾
            </v-btn>
          </template>
          <div class="glass-menu d-flex flex-column pa-2">
            <v-btn variant="text" href="/playersState" class="justify-start" block>Players State</v-btn>
            <v-btn variant="text" href="/gridColors" class="justify-start" block>Grid</v-btn>
            <v-btn variant="text" href="/playersHand" class="justify-start" block>Players Hand</v-btn>
            <v-btn variant="text" href="/listEvents" class="justify-start" block>List Events</v-btn>
          </div>
        </v-menu>
      </div>

      <!-- Mobile Menu Button -->
      <div class="d-flex d-sm-none">
        <v-btn icon @click="drawer = !drawer">
          <img src="/images/gorot.png" class="navbar-toggler-icon-img" alt="Menu" />
        </v-btn>
      </div>
    </v-app-bar>

    <!-- Mobile Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      location="right"
      temporary
      class="glass-drawer"
    >
      <v-list class="bg-transparent">
        <v-list-item href="/combinedView" title="Game View" prepend-icon="mdi-gamepad-variant"></v-list-item>
        <v-list-item href="/playersState" title="Players State" prepend-icon="mdi-account-group"></v-list-item>
        <v-list-item href="/gridColors" title="Grid" prepend-icon="mdi-grid"></v-list-item>
        <v-list-item href="/playersHand" title="Players Hand" prepend-icon="mdi-cards"></v-list-item>
        <v-list-item href="/listEvents" title="List Events" prepend-icon="mdi-format-list-bulleted"></v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      drawer: false
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/colors";

.glass-navbar {
  background-color: $white-transparent !important;
  backdrop-filter: blur($backdrop-blur);
  color: $font-dark !important;
}

.glass-menu {
  background-color: $white-transparent !important;
  backdrop-filter: blur($backdrop-blur);
  color: $font-dark !important;
  border-radius: $border-radius/2 !important;
  box-shadow: 0 $box-shadow-blur $base-size $black-shadow-light !important;
  width: 220px;
}

.glass-drawer {
  background-color: $white-transparent !important;
  backdrop-filter: blur($backdrop-blur);
  color: $font-dark !important;
}

.nav-btn {
  width: 220px !important;
}

.navbar-toggler-icon-img {
  width: 1.5em;
  height: 1.5em;
}

.nav-items-container {
  gap: 6vw;
  margin-right: 6vw;
}
</style>
