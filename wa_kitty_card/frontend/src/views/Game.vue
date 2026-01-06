<template>
  <div class="game-layout">
    <div class="state-section">
      <PlayerState :state="state" :players="players" />
    </div>
    
    <div class="zayne-wood"></div>
    <div class="table-background"></div>
    
    <div class="grid-section">
      <GameGrid :gridData="gridData" @cellClicked="onGridCellClicked" @cardDropped="onCardDropped" />
    </div>

    <div class="hand-section">
      <PlayerHand :cards="currentPlayerHand" :selectedCardIndex="selectedCardIndex" :isMyTurn="isMyTurn"
        @cardSelected="onCardSelected" @dragEnd="onDragEnd" />
    </div>

    <GameActions @undo="undo" @redo="redo" @draw="draw" />
  </div>
</template>

<script>
import api from '@/services/api'
import PlayerState from '@/components/PlayerState.vue'
import GameGrid from '@/components/GameGrid.vue'
import PlayerHand from '@/components/PlayerHand.vue'
import GameActions from '@/components/GameActions.vue'
import { saveAllPlayersScores } from '@/firebase/firestore'
//import GameTable from '@/components/GameTable.vue'

export default {
  name: 'Game',
  components: {
    PlayerState,
    GameGrid,
    PlayerHand,
    GameActions
  },
  data() {
    return {
      state: ['Player 1', 'Waiting', 'Waiting'],
      gridData: [],
      currentPlayerHand: [],
      players: [],
      playerIdentity: 'Player ?',
      playerBannerClass: '',
      playerBannerDisplay: 'none',
      websocket: null,
      sessionId: null,
      playerId: null,
      playerNumber: null,
      selectedCardIndex: null,
      isMyTurn: true
    }
  },
  computed: {
    currentPlayerName() {
      return this.state && this.state.length > 0 ? this.state[0] : '';
    }
  },
  watch: {
    state(newState) {
      this.updateTurnState(newState);
    }
  },
  mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    this.sessionId = sessionStorage.getItem('sessionId') || urlParams.get('sessionId');
    this.playerId = sessionStorage.getItem('playerId') || urlParams.get('playerId');
    this.playerNumber = sessionStorage.getItem('playerNumber') || urlParams.get('playerNumber');

    if (this.playerNumber) {
      this.playerIdentity = 'Player ' + this.playerNumber;
      this.playerBannerClass = 'player-' + this.playerNumber;
      this.playerBannerDisplay = 'block';
    }

    // Fetch initial game state from API
    if (this.sessionId && this.playerId) {
      this.loadGameState();
      this.connectWebSocket();
    }
  },
  methods: {
    loadGameState() {
      api.getGameState(this.sessionId, this.playerId)
        .then(data => {
          if (data.success) {
            if (data.state) this.state = data.state;
            if (data.grid) {
              this.gridData = data.grid.map(c => [
                c.x, c.y, c.card, c.color, c.suit, c.placedByPlayer || null
              ]);
            }
            if (data.hand) this.currentPlayerHand = data.hand;
            if (data.players) this.players = data.players;
            this.updateTurnState(this.state);
          }
        })
        .catch(err => {
          console.error('Failed to load game state:', err);
        });
    },
    connectWebSocket() {
      const wsUrl = api.getWebSocketUrl(this.sessionId, this.playerId);
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.gameOver) {
          const players = data.players || this.players;
          const winner = this.getWinner(players);
          
          // Save ALL players' scores to Firebase
          saveAllPlayersScores(players, this.sessionId, winner)
            .then(() => console.log('All players scores saved!'))
            .catch(err => console.error(' Failed to save scores:', err));
          
          // Redirect to game over page
          const myScore = this.getPlayerScore(this.state[parseInt(this.playerNumber)], players);
          const isWinner = winner === this.state[parseInt(this.playerNumber)];
          this.$router.push({ 
            path: '/gameOverPage', 
            query: { 
              winner, 
              score: myScore, 
              isWinner: String(isWinner),
              gameId: this.sessionId 
            } 
          });
          return;
        }
        if (data.state) this.state = data.state;
        if (data.grid) this.gridData = data.grid.map(c => [c.x, c.y, c.card, c.color, c.suit, c.placedByPlayer || null]);
        if (data.hand) this.currentPlayerHand = data.hand;
        if (data.players) this.players = data.players;
      };
    },
    undo() {
      // Implement undo
    },
    redo() {
      // Implement redo
    },
    draw() {
      if (!this.isMyTurn) {
        alert("It's not your turn!");
        return;
      }

      api.drawCard(this.sessionId, this.playerId)
        .then(data => {
          if (data.gameOver) {
            const winner = this.getWinner(data.players || this.players);
            const score = this.getPlayerScore(winner, data.players || this.players);
            const isWinner = winner === this.state[parseInt(this.playerNumber)];
            this.$router.push({ path: '/gameOverPage', query: { winner, score, isWinner: String(isWinner) } });
            return;
          }
          if (data.success === false || data.message) {
            alert(data.message || 'Failed to draw card');
            return;
          }

          // Update state, grid, and hand from response
          if (data.state) this.state = data.state;
          if (data.grid) {
            this.gridData = data.grid.map(c => [
              c.x, c.y, c.card, c.color, c.suit, c.placedByPlayer || null
            ]);
          }
          if (data.hand) this.currentPlayerHand = data.hand;
        })
        .catch(err => {
          alert('Failed to draw card: ' + err);
        });
    },
    onCardSelected(index) {
      this.selectedCardIndex = index;
    },
    onGridCellClicked(x, y) {
      if (this.selectedCardIndex !== null) {
        this.placeCard(this.selectedCardIndex, x, y);
      }
    },
    onCardDropped(x, y, cardIndex) {
      this.placeCard(cardIndex, x, y);
    },
    onDragEnd() {
      // Clear any drag state if needed
    },
    updateTurnState(stateArray) {
      if (!stateArray || stateArray.length < 3 || !this.playerNumber) {
        return;
      }

      const currentPlayerName = stateArray[0];
      const myPlayerName = stateArray[parseInt(this.playerNumber)];

    },
    placeCard(cardIndex, x, y) {
      api.placeCard({
        cardIndex,
        x,
        y,
        sessionId: this.sessionId,
        playerId: this.playerId
      })
        .then(data => {
          if (data.gameOver) {
            const winner = this.getWinner(data.players || this.players);
            const score = this.getPlayerScore(winner, data.players || this.players);
            const isWinner = winner === this.state[parseInt(this.playerNumber)];
            this.$router.push({ path: '/gameOverPage', query: { winner, score, isWinner: String(isWinner) } });
            return;
          }
          if (data.message) {
            alert(data.message);
            return;
          }

          // Update state from response
          if (data.state) {
            this.state = data.state;
          }

          // Update grid with full data including placedByPlayer
          if (data.grid) {
            this.gridData = data.grid.map(c => [
              c.x,
              c.y,
              c.card,
              c.color,
              c.suit,
              c.placedByPlayer || data.placedByPlayer || null
            ]);
          } else if (data.placedByPlayer) {
            // Fallback: update just the placed cell
            const newGridData = [...this.gridData];
            const cellIndex = newGridData.findIndex(cell => cell[0] === x && cell[1] === y);
            if (cellIndex !== -1) {
              newGridData[cellIndex] = [...newGridData[cellIndex]];
              newGridData[cellIndex][5] = data.placedByPlayer;
              this.gridData = newGridData;
            }
          }

          // Update hand from response
          if (data.hand) {
            this.currentPlayerHand = data.hand;
          }

          // Update players scores from response
          if (data.players) {
            this.players = data.players;
          }

          // Clear selection on success
          this.selectedCardIndex = null;
        })
        .catch(err => {
          alert('Failed to place card: ' + err);
        });
    },
    getWinner(players) {
      if (!players || players.length === 0) return 'Unknown';
      const sorted = [...players].sort((a, b) => b.score - a.score);
      return sorted[0].name;
    },
    //uberprufen ob es nicht im backendschon gibt so ein funktion
    getPlayerScore(winnerName, players) {
      if (!players || players.length === 0) return 0;
      const winner = players.find(p => p.name === winnerName);
      return winner ? winner.score : 0;
    }
  }
}
</script>

<style lang="scss" scoped>
.game-layout {
  display: grid;
  grid-template-rows: 60vh 5vh 50vh 25vh 45vh; 
  height: 160vh;
  width: 100%;
  position: relative;
  padding: 0 2rem;
}


.zayne-wood {
  background-color: #D4A574;
  
  width: 100vw;
  margin-left: -2rem; 
  margin-right: -2rem; 
  
  height: 10vh; 
  border-bottom: solid 2vh #C89968;
  
  background-image: 
    repeating-conic-gradient(
      rgba(253, 197, 152, 0.5) 0deg,
      transparent 69deg,
      transparent 20deg,
      rgba(245, 195, 155, 0.5) 15deg
    ),
    linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.08) 0%,
      transparent 30%,
      transparent 70%,
      rgba(0, 0, 0, 0.08) 100%
    );
  
  box-shadow: 
    0 2px 5px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
}

.table-background {
  position: absolute;
  left: 0;
  top: 70vh; 
  width: 100vw;
  height: 100vh; 
  
  background-color: rgb(252, 244, 208);
  
  background-image: 
    linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
  background-size: 50px 50px;
  border-bottom: 40px solid rgb(192, 160, 101);
  pointer-events: none;
  z-index: -1;
  
  margin-left: 50%;
  transform: translateX(-50%);
}

.state-section, 
.grid-section, 
.hand-section {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative; 
  z-index: 2; 
  margin: 0 1rem;
}


@media screen and (max-width: 576px) {
  .hand-section {
    align-items: flex-start;
    padding-top: 10px;
  }

  .game-layout {
    padding: 0 ;
    }
  .zayne-wood {
    margin-left: 0; 
    margin-right: 0;
  }

}

</style>