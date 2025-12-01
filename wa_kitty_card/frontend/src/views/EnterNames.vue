<template>
  <div class="enter-names">
    <h1>Kitty Card Game - Multiplayer</h1>
    
    <div class="game-mode-selector">
      <button 
        id="create-game-btn" 
        class="mode-btn" 
        :class="{ active: mode === 'create' }"
        @click="mode = 'create'"
      >
        Create New Game
      </button>
      <button 
        id="join-game-btn" 
        class="mode-btn"
        :class="{ active: mode === 'join' }"
        @click="mode = 'join'"
      >
        Join Existing Game
      </button>
    </div>
    
    <!-- Create Game Form -->
    <div v-if="mode === 'create'" id="create-game-form" class="game-form">
      <h2>Create a New Game</h2>
      <form id="create-form" @submit.prevent="createGame">
        <div>
          <label for="create-player-name">Your Name</label><br />
          <input type="text" id="create-player-name" v-model="playerName" required />
        </div>
        <br />
        <div>
          <button type="submit">Create Game</button>
        </div>
      </form>
      
      <div v-if="waiting" id="waiting-room">
        <h3>Game Created!</h3>
        <p>Share this Game ID with another player:</p>
        <div class="game-id-display">
          <input type="text" id="game-id-input" :value="gameId" readonly />
          <button id="copy-game-id-btn" @click="copyGameId">Copy ID</button>
        </div>
        <p class="waiting-text">Waiting for player 2 to join...</p>
        <div class="spinner"></div>
      </div>
    </div>
    
    <!-- Join Game Form -->
    <div v-if="mode === 'join'" id="join-game-form" class="game-form">
      <h2>Join an Existing Game</h2>
      <form id="join-form" @submit.prevent="joinGame">
        <div>
          <label for="join-game-id">Game ID</label><br />
          <input type="text" id="join-game-id" v-model="joinGameId" required placeholder="Enter game ID" />
        </div>
        <br />
        <div>
          <label for="join-player-name">Your Name</label><br />
          <input type="text" id="join-player-name" v-model="playerName" required />
        </div>
        <br />
        <div>
          <button type="submit">Join Game</button>
        </div>
      </form>
    </div>
    
    <div v-if="errorMessage" id="error-message" class="error-message">{{ errorMessage }}</div>
  </div>
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
@import "@/styles/enter-names.scss";
</style>
