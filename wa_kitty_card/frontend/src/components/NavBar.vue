<template>
  <div>
    <v-app-bar scroll-behavior="hide" scroll-threshold="10" class="glass-navbar px-8">
      <a href="/" class="text-decoration-none font-weight-bold text-h5" style="color: inherit;">Kitty Card</a>

      <v-spacer></v-spacer>

      <div class="d-none d-sm-flex align-center nav-items-container">
        <v-btn variant="text" href="/leaderboard" class="nav-btn">Leaderboard</v-btn>
        <v-btn variant="text" href="/combinedView" class="nav-btn">Game View</v-btn>

        <v-menu open-on-hover>
          <template v-slot:activator="{ props }">
            <v-btn variant="text" v-bind="props" class="nav-btn">
              Table of Content ▾
            </v-btn>
          </template>
          <div class="glass-menu d-flex flex-column pa-2">
            <v-btn variant="text" href="/play-server" class="justify-start" block>Play Server</v-btn>
            <v-btn variant="text" href="/html" class="justify-start" block>HTML</v-btn>
            <v-btn variant="text" href="/css" class="justify-start" block>CSS</v-btn>
            <v-btn variant="text" href="/bootstrap" class="justify-start" block>Bootstrap</v-btn>
            <v-btn variant="text" href="/javascript" class="justify-start" block>JavaScript</v-btn>
            <v-btn variant="text" href="/jquery-ajax" class="justify-start" block>jQuery & AJAX</v-btn>
            <v-btn variant="text" href="/websockets" class="justify-start" block>WebSockets</v-btn>
            <v-btn variant="text" href="/polymer" class="justify-start" block>Polymer</v-btn>
            <v-btn variant="text" href="/vue" class="justify-start" block>Vue</v-btn>
            <v-btn variant="text" href="/web-components" class="justify-start" block>Web Components</v-btn>
            <v-btn variant="text" href="/pwa" class="justify-start" block>PWA</v-btn>
            <v-btn variant="text" href="/deployment" class="justify-start" block>Deployment</v-btn>
            <v-btn variant="text" href="/authentication" class="justify-start" block>Authentication</v-btn>
          </div>
        </v-menu>

        <div v-if="user" class="d-flex align-center ml-4">
          <span class="mr-3 text-body-2">{{ user.displayName || user.email }}</span>
          <v-btn variant="text" @click="handleLogout" class="nav-btn">Logout</v-btn>
        </div>
        <v-btn v-else variant="text" href="/login" class="nav-btn ml-4">Login</v-btn>
      </div>

      <div class="d-flex d-sm-none">
        <v-btn icon @click="drawer = !drawer">
          <img src="/images/gorot.png" class="navbar-toggler-icon-img" alt="Menu" />
        </v-btn>
      </div>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      location="right"
      temporary
      class="glass-drawer"
    >
      <v-list class="bg-transparent">
        <v-list-item href="/leaderboard" title="Leaderboard" prepend-icon="mdi-trophy"></v-list-item>
        <v-list-item href="/combinedView" title="Game View" prepend-icon="mdi-gamepad-variant"></v-list-item>
        <v-list-item href="/playersState" title="Players State" prepend-icon="mdi-account-group"></v-list-item>
        <v-list-item href="/gridColors" title="Grid" prepend-icon="mdi-grid"></v-list-item>
        <v-list-item href="/playersHand" title="Players Hand" prepend-icon="mdi-cards"></v-list-item>
        <v-list-item href="/listEvents" title="List Events" prepend-icon="mdi-format-list-bulleted"></v-list-item>
        
        <v-divider class="my-2"></v-divider>
        
        <v-list-item v-if="user" @click="handleLogout" title="Logout" prepend-icon="mdi-logout"></v-list-item>
        <v-list-item v-else href="/login" title="Login" prepend-icon="mdi-login"></v-list-item>
        
        <v-list-item v-if="user" disabled>
          <template v-slot:prepend>
            <v-icon>mdi-account</v-icon>
          </template>
          <v-list-item-title class="text-caption">{{ user.displayName || user.email }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useRouter } from 'vue-router';

const drawer = ref(false);
const { user, signOut } = useAuth();
const router = useRouter();

const handleLogout = async () => {
  await signOut();
  router.push('/');
};
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
