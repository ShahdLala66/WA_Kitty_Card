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
      <GameGrid :gridData="gridData" @cellClicked="onGridCellClicked" />
    </div>

    <div class="hand-section">
      <PlayerHand :cards="currentPlayerHand" @cardSelected="onCardSelected" />
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
      selectedCardIndex: null
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
        if (data.grid) this.gridData = data.grid.map(c => [c.x, c.y, c.card, c.color, c.suit]);
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
      fetch('/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: this.sessionId, playerId: this.playerId })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success === false) alert(data.message);
      });
    },
    onCardSelected(index) {
      this.selectedCardIndex = index;
    },
    onGridCellClicked(x, y) {
      if (this.selectedCardIndex !== null) {
        fetch('/placeCard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            sessionId: this.sessionId, 
            playerId: this.playerId,
            cardIndex: this.selectedCardIndex,
            x: x,
            y: y
          })
        })
        .then(res => res.json())
        .then(data => {
          if (data.success === false) alert(data.message);
          else this.selectedCardIndex = null;
        });
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@/styles/table.scss";
</style>
