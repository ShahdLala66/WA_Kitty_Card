<template>
  <div class="sign-container">
    <div class="rope left-rope"></div>
    <div class="rope right-rope"></div>
    <div class="wooden-frame">
      <div class="frame-label">Scoring</div>
      <div class="chalkboard">
        <div class="player-info">
          <div class="player-row">
            <v-avatar size="40" class="player-avatar">
              <v-img v-if="playerProfiles[state[1]]?.photoURL" :src="playerProfiles[state[1]].photoURL" />
              <v-icon v-else color="deep-purple-lighten-1">mdi-account-circle</v-icon>
            </v-avatar>
            <span class="player-name">{{ state[1] }}</span>
            <span v-if="getPlayerScore(state[1])" class="score">{{ getPlayerScore(state[1]) }}</span>
          </div>
          <div class="kitty-divider">
            <img src="@/assets/images/kitty.png" alt="Kitty" class="kitty-image" />
          </div>
          <div class="player-row">
            <v-avatar size="40" class="player-avatar">
              <v-img v-if="playerProfiles[state[2]]?.photoURL" :src="playerProfiles[state[2]].photoURL" />
              <v-icon v-else color="deep-purple-lighten-1">mdi-account-circle</v-icon>
            </v-avatar>
            <span class="player-name">{{ state[2] }}</span>
            <span v-if="getPlayerScore(state[2])" class="score">{{ getPlayerScore(state[2]) }}</span>
          </div>
          <div class="divider"></div>
          <div class="current-turn">
            <span class="turn-label">Turn:</span>
            <span class="current-name">{{ state[0] }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserProfileByEmail } from '../services/surrealdb';

export default {
  name: 'PlayerState',
  props: {
    state: {
      type: Array,
      required: true
    },
    players: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      playerProfiles: {}
    };
  },
  watch: {
    players: {
      immediate: true,
      async handler(newPlayers) {
        if (newPlayers && newPlayers.length > 0) {
          await this.loadPlayerProfiles();
        }
      }
    }
  },
  methods: {
    getPlayerScore(playerName) {
      if (!this.players || !playerName || playerName === 'Waiting') return null;
      const player = this.players.find(p => p.name === playerName);
      return player ? player.score : null;
    },
    async loadPlayerProfiles() {
      for (const player of this.players) {
        if (player.email && !this.playerProfiles[player.name]) {
          const result = await getUserProfileByEmail(player.email);
          if (result.success) {
            this.playerProfiles[player.name] = result.profile;
          }
        }
      }
    }
  }
}
</script>

<style lang="scss">
@font-face {
  font-family: 'Eraser';
  src: url('~@/assets/fonts/EraserRegular.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}

@font-face {
  font-family: 'EraserDust';
  src: url('~@/assets/fonts/EraserDust.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
}
</style>

<style lang="scss" scoped>
@import "@/styles/colors";

.sign-container {
  position: relative;
  display: flex;
  justify-content: center;
  padding-top: 50px;
  margin: 20px auto;
  width: 90%;
  max-width: 1200px;
}

.rope {
  position: absolute;
  width: 4px;
  height: 45px;
  top: 0;
  background: linear-gradient(to bottom, 
    #E8D4B8 0%, #F5E6D3 20%, #E8D4B8 40%, #F5E6D3 60%, #E8D4B8 80%, #F5E6D3 100%);
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 10px;
    height: 10px;
    background: #D4C4A8;
    border-radius: 50%;
    border: 2px solid #C4B498;
  }
}

.left-rope {
  left: 35%;
}

.right-rope {
  right: 35%;
}

.wooden-frame {
  background: linear-gradient(180deg, 
    #F5DEB3 0%, 
    #EDD9A3 50%, 
    #E5C78A 100%);
  border: 3px solid #D4B896;
  border-radius: 16px;
  padding: 8px 12px 12px 12px;
  box-shadow: 
    0 6px 12px rgba(0, 0, 0, 0.2),
    inset 0 2px 0 rgba(255, 255, 255, 0.3),
    inset 0 -2px 4px rgba(0, 0, 0, 0.1);
  position: relative;
  width: 100%;
}

.frame-label {
  text-align: center;
  font-family: 'Eraser', 'Segoe Print', 'Comic Sans MS', cursive !important;
  font-size: 3em;
  font-weight: bold;
  color: #8B6F47;
  margin-bottom: 8px;
  text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
}

.chalkboard {
  background: linear-gradient(135deg, 
    #42b364 0%, 
    #5cb444 50%, 
    #42b364 100%);
  border: 3px solid #689F38;
  border-radius: 12px;
  padding: 20px 25px;
  box-shadow: 
    inset 0 2px 4px rgba(0, 0, 0, 0.2),
    inset 0 -2px 4px rgba(255, 255, 255, 0.1);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      repeating-linear-gradient(
        90deg,
        transparent,
        transparent 3px,
        rgba(255, 255, 255, 0.03) 3px,
        rgba(255, 255, 255, 0.03) 6px
      ),
      repeating-linear-gradient(
        0deg,
        transparent,
        transparent 3px,
        rgba(255, 255, 255, 0.03) 3px,
        rgba(255, 255, 255, 0.03) 6px
      );
    border-radius: 9px;
    pointer-events: none;
  }
}

.player-info {
  position: relative;
  z-index: 1;
  font-family: 'EraserDust', 'Eraser', 'Segoe Print', cursive !important;
}

.player-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding: 8px 0;
  gap: 12px;
}

.player-avatar {
  border: 3px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.kitty-divider {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.kitty-image {
  width: 100px;
  height: 100px;
  opacity: .9 ;
  filter: brightness(1.2);
}

.player-name {
  font-size: 1.6em;
  font-weight: bold;
  color: #FFFFFF;
  font-family: 'EraserDust', 'Eraser', cursive !important;
  text-shadow: 
    2px 2px 0px rgba(0, 0, 0, 0.3),
    1px 1px 3px rgba(0, 0, 0, 0.2);
  letter-spacing: 1px;
}

.score {
  font-size: 2.5em;
  font-weight: bold;
  color: #FFFFFF;
  font-family: 'EraserDust', 'Eraser', cursive !important;
  text-shadow: 
    3px 3px 0px rgba(0, 0, 0, 0.3),
    2px 2px 5px rgba(0, 0, 0, 0.2);
  min-width: 80px;
  text-align: right;
}

.divider {
  height: 2px;
  background: linear-gradient(to right, 
    transparent, 
    rgba(255, 255, 255, 0.4) 10%, 
    rgba(255, 255, 255, 0.4) 90%, 
    transparent);
  margin: 12px 0 15px 0;
}

.current-turn {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-size: 1.3em;
  padding-top: 5px;
}

.turn-label {
  font-weight: bold;
  color: #FFFFFF;
  font-family: 'EraserDust', 'Eraser', cursive !important;
  text-shadow: 
    2px 2px 0px rgba(0, 0, 0, 0.3),
    1px 1px 3px rgba(0, 0, 0, 0.2);
}

.current-name {
  font-weight: bold;
  color: #FFEB3B;
  font-family: 'EraserDust', 'Eraser', cursive !important;
  text-shadow: 
    2px 2px 0px rgba(0, 0, 0, 0.4),
    0 0 8px rgba(255, 235, 59, 0.4);
  font-size: 1.15em;
}

@media screen and (max-width: 576px) {
  .sign-container {
    padding-top: 40px;
  }
  
  .wooden-frame {
    padding: 6px 10px 10px 10px;
  }
  
  .chalkboard {
    padding: 15px 20px;
  }
  
  .player-name {
    font-size: 1.1em;
  }
  
  .score {
    font-size: 1.6em;
  }
  
  .left-rope {
    left: 15%;
  }
  
  .right-rope {
    right: 15%;
  }
  .right-rope {
    right: 15%;
  }
}
</style>