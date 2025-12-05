<template>
  <v-container class="fill-height d-flex flex-column align-center justify-center">
    <v-card class="glass-card pa-8 text-center" elevation="4" min-width="300">
      <h1 class="text-h2 font-weight-bold mb-4 text-primary">Game Over</h1>
      <h2 class="text-h4 mb-8">Winner: {{ winnerName }}</h2>
      
      <div class="d-flex flex-column gap-4">
        <v-btn
          to="/enterNames"
          color="primary"
          size="large"
          class="mb-4"
          prepend-icon="mdi-replay"
        >
          New Game
        </v-btn>
        
        <v-btn
          to="/"
          variant="outlined"
          size="large"
          prepend-icon="mdi-home"
        >
          Home
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'GameOver',
  data() {
    return {
      winnerName: 'Unknown'
    }
  },
  created() {
    if (window.initialData && window.initialData.winnerName) {
      this.winnerName = window.initialData.winnerName;
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
</style>
