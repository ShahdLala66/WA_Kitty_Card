<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="glass-card pa-6 d-flex flex-column align-center justify-center" width="100%" max-width="750" min-height="90%" elevation="4">
      <v-card-title class="text-h2 font-weight-bold text-center mb-4 text-deep-purple-lighten-1">
        Game Over
      </v-card-title>
      
      <div class="text-h4 mb-8 text-center">
        Winner: <span class="font-weight-bold">{{ winnerName }}</span>
      </div>

      <v-alert v-if="saveError" type="error" class="mb-4">
        {{ saveError }}
      </v-alert>
      
      <div class="d-flex flex-column gap-4 w-100" style="max-width: 400px;">
        <v-btn
          to="/enterNames"
          color="deep-purple-lighten-1"
          size="large"
          block
          class="mb-2 text-h6"
          prepend-icon="mdi-replay"
        >
          New Game
        </v-btn>

        <v-btn
          to="/leaderboard"
          variant="outlined"
          size="large"
          block
          class="mb-2 text-h6"
          prepend-icon="mdi-trophy"
          color="deep-purple-lighten-1"
        >
          View Leaderboard
        </v-btn>
        
        <v-btn
          to="/"
          variant="outlined"
          size="large"
          block
          class="text-h6"
          prepend-icon="mdi-home"
          color="deep-purple-lighten-1"
        >
          Home
        </v-btn>
      </div>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { saveGameResult } from '../firebase/firestore'
import { auth } from '../firebase/config'

const route = useRoute()
const winnerName = ref('Unknown')
const scoreSaved = ref(false)
const saveError = ref(null)

onMounted(async () => {
  console.log('GameOver mounted - Starting...')
  
  winnerName.value = route.query.winner || 'Unknown'
  const score = parseInt(route.query.score) || 0
  const isWinner = route.query.isWinner === 'true'
  const gameId = route.query.gameId

  console.log('Game data:', { winner: winnerName.value, score, isWinner, gameId })
  
  if (gameId && score > 0) {
    scoreSaved.value = true
    console.log('Scores were saved by the game (gameId:', gameId, ')')
  }
})
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
