<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="glass-card pa-6" width="100%" max-width="750" min-height="90%" elevation="4">
      <v-card-title class="text-h4 font-weight-bold text-center mb-6">
        Kitty Card - Multiplayer
      </v-card-title>

      <v-tabs v-model="mode" grow class="mb-6 bg-transparent" color="deep-purple-lighten-1">
        <v-tab value="create">Create New Game</v-tab>
        <v-tab value="join">Join Existing Game</v-tab>
      </v-tabs>

      <v-window v-model="mode">
        <!-- Create Game Form -->
        <v-window-item value="create">
          <v-form @submit.prevent="createGame">
            <v-text-field
              v-model="playerName"
              label="Your Name"
              required
              color="deep-purple-lighten-1"
              class="mb-4"
            ></v-text-field>
            
            <v-btn
              type="submit"
              color="deep-purple-lighten-1"
              block
              size="large"
              class="text-h6"
            >
              Create Game
            </v-btn>
          </v-form>

          <div v-if="waiting" class="text-center mt-6">
            <h3 class="text-h5 mb-2">Game Created!</h3>
            <p class="mb-4">Share this Game ID with another player:</p>
            
            <div class="d-flex align-center gap-2 mb-4">
              <v-text-field
                ref="gameIdInput"
                :model-value="gameId"
                readonly
                hide-details
                class="flex-grow-1"
                color="deep-purple-lighten-1"
              ></v-text-field>
              <v-btn color="deep-purple-lighten-1" @click="copyGameId" height="56">
                Copy ID
              </v-btn>
            </div>
            
            <p class="text-medium-emphasis mb-4">Waiting for player 2 to join...</p>
            <v-progress-circular indeterminate color="deep-purple-lighten-1" size="40"></v-progress-circular>
          </div>
        </v-window-item>

        <!-- Join Game Form -->
        <v-window-item value="join">
          <v-form @submit.prevent="joinGame">  
            <v-text-field
              v-model="playerName"
              label="Your Name"
              required
              color="deep-purple-lighten-1"
              class="mb-4"
            ></v-text-field>

            <v-text-field
              v-model="joinGameId"
              label="Game ID"
              required
              color="deep-purple-lighten-1"
              class="mb-4"
            ></v-text-field>

            <v-btn
              type="submit"
              color="deep-purple-lighten-1"
              block
              size="large"
              class="text-none text-h6"
            >
              Join Game
            </v-btn>
          </v-form>
        </v-window-item>
      </v-window>
    </v-card>
  </v-container>
</template>

<script>
export default {
  name: 'EnterNames',
  data() {
    return {
      mode: 'create',
      playerName: '',
      joinGameId: '',
      gameId: '',
      waiting: false,
      errorMessage: '',
      websocket: null,
      sessionId: null,
      playerId: null,
      playerNumber: null
    }
  },
  methods: {
    createGame() {
      fetch('/createGame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: this.playerName })
      })
        .then(response => response.json())
        .then(data => {
          if (data.status !== 'OK') {
            this.errorMessage = 'Failed to create game. Please try again.';
            return;
          }

          this.sessionId = data.sessionId;
          this.playerId = data.playerId;
          this.playerNumber = data.playerNumber;

          sessionStorage.setItem('sessionId', this.sessionId);
          sessionStorage.setItem('playerId', this.playerId);
          sessionStorage.setItem('playerNumber', this.playerNumber);

          this.waiting = true;
          this.gameId = this.sessionId;
          this.connectWebSocket();
        })
        .catch(err => {
          this.errorMessage = 'Error creating game: ' + err.message;
        });
    },
    joinGame() {
      const gameId = this.joinGameId.trim().toUpperCase();
      fetch('/joinGame', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: gameId, playerName: this.playerName })
      })
        .then(response => response.json())
        .then(data => {
          if (data.status !== 'OK') {
            this.errorMessage = data.message || 'Failed to join game. Please check the Game ID.';
            return;
          }

          this.sessionId = data.sessionId;
          this.playerId = data.playerId;
          this.playerNumber = data.playerNumber;

          sessionStorage.setItem('sessionId', this.sessionId);
          sessionStorage.setItem('playerId', this.playerId);
          sessionStorage.setItem('playerNumber', this.playerNumber);

          this.connectWebSocket();
          setTimeout(() => {
            window.location.href = `/combinedView?sessionId=${this.sessionId}&playerId=${this.playerId}&playerNumber=${this.playerNumber}`;
          }, 500);
        })
        .catch(err => {
          this.errorMessage = 'Error joining game: ' + err.message;
        });
    },
    copyGameId() {
      navigator.clipboard.writeText(this.gameId);
      this.$nextTick(() => {
        const input = this.$refs.gameIdInput.$el.querySelector('input');
        if (input) {
          input.select();
        }
      });
    },
    connectWebSocket() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      this.websocket = new WebSocket(`${protocol}//${window.location.host}/ws/${this.sessionId}/${this.playerId}`);

      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'player-joined' && this.waiting) {
          window.location.href = `/combinedView?sessionId=${this.sessionId}&playerId=${this.playerId}&playerNumber=${this.playerNumber}`;
        }
      };
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

.gap-2 {
  gap: 8px;
}
</style>
