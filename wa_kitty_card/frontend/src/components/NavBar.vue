<template>
  <div>
    <v-app-bar scroll-behavior="hide" scroll-threshold="10" class="glass-navbar px-8">
      <a href="/" class="text-decoration-none font-weight-bold text-h5" style="color: inherit;">Kitty Card</a>

      <v-spacer></v-spacer>

      <div class="d-none d-sm-flex align-center nav-items-container">
        <v-btn variant="text" href="/leaderboard" class="nav-btn">Leaderboard</v-btn>
        <v-btn variant="text" href="/combinedView" class="nav-btn">Game View</v-btn>

        <div v-if="user" class="d-flex align-center ml-4">
          <v-btn variant="text" @click="goToProfile" class="nav-btn text-body-2">
            {{ user.email }}
          </v-btn>
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
        
        <v-divider class="my-2"></v-divider>
        
        <v-list-item v-if="user" @click="goToProfile" title="Profil" prepend-icon="mdi-account">
          <v-list-item-subtitle class="text-caption">{{ user.email }}</v-list-item-subtitle>
        </v-list-item>
        <v-list-item v-if="user" @click="handleLogout" title="Logout" prepend-icon="mdi-logout"></v-list-item>
        <v-list-item v-else href="/login" title="Login" prepend-icon="mdi-login"></v-list-item>
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

const goToProfile = () => {
  router.push('/profile');
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
