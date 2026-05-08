<template>
<div>
<div> 
<span v-for="(player, index) in players" :key="index" style="margin-right: 20px; display: inline-flex; align-items: center; gap: 8px;">
  <v-avatar size="32">
    <v-img v-if="playerProfiles[player.name]?.photoURL" :src="playerProfiles[player.name].photoURL" />
    <v-icon v-else size="small" color="deep-purple-lighten-1">mdi-account-circle</v-icon>
  </v-avatar>
  <strong :style="{ color: player.color }">{{ player.name }}:</strong> {{ player.score }} points
</span>
</div>
</div>
</template>


<script>
import { getUserProfileByEmail } from '../services/surrealdb';

export default {
  name: 'ScoreBoard',
  props: {
    players: {
      type: Array,
      required: true
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