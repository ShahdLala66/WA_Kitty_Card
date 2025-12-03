<template>
  <div class="game-layout">
    <div class="player-info-banner" id="player-info-banner" :class="playerBannerClass" :style="{ display: playerBannerDisplay }">
      <span class="player-identity">You are: <strong id="player-identity-name">{{ playerIdentity }}</strong></span>
    </div>

    <div class="state-section">
      <PlayerState :state="state" />
    </div>

    <div class="zayne-wood"></div>
    <div class="grid-section">
      <GameGrid 
        :gridData="gridData" 
        @cellClicked="onGridCellClicked"
        @cardDropped="onCardDropped" 
      />
    </div>

    <div class="hand-section">
      <PlayerHand 
        :cards="currentPlayerHand" 
        :selectedCardIndex="selectedCardIndex"
        :isMyTurn="isMyTurn"
        @cardSelected="onCardSelected"
        @dragEnd="onDragEnd" 
      />
    </div>

    <div class="table-background">
      <GameTable />
    </div>

    <GameActions @undo="undo" @redo="redo" @draw="draw" />

  </div>
</template>

<script>
import PlayerState from '@/components/PlayerState.vue'
import GameGrid from '@/components/GameGrid.vue'
import PlayerHand from '@/components/PlayerHand.vue'
import GameActions from '@/components/GameActions.vue'
import GameTable from '@/components/GameTable.vue'

export default {
  name: 'Game',
  components: {
    PlayerState,
    GameGrid,
    PlayerHand,
    GameActions,
    GameTable
  },
  data() {
    return {
      state: ['Player 1', 'Waiting', 'Waiting'],
      gridData: [],
      currentPlayerHand: [],
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
    if (window.initialData) {
      if (window.initialData.state) this.state = window.initialData.state;
      if (window.initialData.gridData) this.gridData = window.initialData.gridData;
      if (window.initialData.currentPlayerHand) this.currentPlayerHand = window.initialData.currentPlayerHand;
    }

    const urlParams = new URLSearchParams(window.location.search);
    this.sessionId = sessionStorage.getItem('sessionId') || urlParams.get('sessionId');
    this.playerId = sessionStorage.getItem('playerId') || urlParams.get('playerId');
    this.playerNumber = sessionStorage.getItem('playerNumber') || urlParams.get('playerNumber');

    if (this.playerNumber) {
      this.playerIdentity = 'Player ' + this.playerNumber;
      this.playerBannerClass = 'player-' + this.playerNumber;
      this.playerBannerDisplay = 'block';
      
      // Initialize turn state from loaded state
      this.updateTurnState(this.state);
    }
    
    if (this.sessionId && this.playerId) {
      this.connectWebSocket();
    }
  },
  methods: {
    connectWebSocket() {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      this.websocket = new WebSocket(`${protocol}//${window.location.host}/ws/${this.sessionId}/${this.playerId}`);
      
      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.gameOver) {
          window.location.href = '/gameOverPage';
          return;
        }
        if (data.state) this.state = data.state;
        if (data.grid) this.gridData = data.grid.map(c => [c.x, c.y, c.card, c.color, c.suit, c.placedByPlayer || null]);
        if (data.hand) this.currentPlayerHand = data.hand;
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
      
      fetch('/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: this.sessionId, playerId: this.playerId })
      })
      .then(res => res.json())
      .then(data => {
        if (data.gameOver) {
          window.location.href = '/gameOverPage';
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
      
      // Only update if we have valid player names (not "Waiting")
      if (myPlayerName && myPlayerName !== 'Waiting') {
        this.isMyTurn = currentPlayerName === myPlayerName;
      }
    },
    placeCard(cardIndex, x, y) {
      const requestBody = {
        cardIndex: cardIndex,
        x: x,
        y: y
      };
      
      if (this.sessionId && this.playerId) {
        requestBody.sessionId = this.sessionId;
        requestBody.playerId = this.playerId;
      }
      
      fetch('/placeCard', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody)
      })
      .then(response => {
        if (!response.ok) {
          return Promise.reject(`HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data.gameOver) {
          window.location.href = '/gameOverPage';
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
        
        // Clear selection on success
        this.selectedCardIndex = null;
      })
      .catch(err => {
        alert('Failed to place card: ' + err);
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/table.scss";
</style>
