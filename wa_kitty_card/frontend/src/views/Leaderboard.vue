<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="glass-card pa-6" width="100%" max-width="750" min-height="90%">
      <v-card-title class="text-h5 font-weight-bold text-center">
        Leaderboard
      </v-card-title>

      <v-tabs v-model="activeTab" grow class="mb-6 bg-transparent mobile-tabs" color="deep-purple-lighten-1">
        <v-tab value="top" class="text-caption text-sm-body-1">Top Players</v-tab>
        <v-tab value="average" class="text-caption text-sm-body-1">Average Score</v-tab>
        <v-tab value="recent" class="text-caption text-sm-body-1">Recent Games</v-tab>
        <v-tab value="personal" class="text-caption text-sm-body-1">Personal Best</v-tab>
      </v-tabs>

      <v-progress-linear v-if="loading" indeterminate color="deep-purple-lighten-1"></v-progress-linear>

      <v-alert v-if="error" type="error" class="mb-4">
        {{ error }}
      </v-alert>

      <v-window v-model="activeTab">
        <v-window-item value="top">
          <v-list class="bg-transparent">
            <v-list-item
              v-for="(entry, index) in topScores"
              :key="entry.id"
              class="mb-2"
            >
              <template v-slot:prepend>
                <v-avatar :color="getRankColor(index)">
                  <span class="text-h6">{{ index + 1 }}</span>
                </v-avatar>
              </template>

              <div class="d-flex align-center justify-space-between flex-grow-1">
                <div class="player-info text-center">
                  <div class="text-h6">
                    {{ entry.playerName || entry.displayName }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ entry.email }}
                  </div>
                </div>
                
                <div class="score-section">
                  <span class="text-h5 font-weight-bold score-number">{{ entry.score }}</span>
                  <span class="crown-placeholder">
                    <v-icon v-if="entry.isWinner" color="gold">mdi-crown</v-icon>
                  </span>
                </div>
              </div>
            </v-list-item>
          </v-list>
        </v-window-item>

        <v-window-item value="average">
          <v-list class="bg-transparent">
            <v-list-item
              v-for="(entry, index) in averageScores"
              :key="entry.email"
              class="mb-2"
            >
              <template v-slot:prepend>
                <v-avatar :color="getRankColor(index)">
                  <span class="text-h6">{{ index + 1 }}</span>
                </v-avatar>
              </template>

              <div class="d-flex align-center justify-space-between flex-grow-1">
                <div class="player-info text-center">
                  <div class="text-h6">
                    {{ entry.playerName || entry.displayName }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ entry.email }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ entry.gameCount }} games
                  </div>
                </div>
                
                <div class="score-section">
                  <span class="text-h5 font-weight-bold score-number">{{ entry.averageScore }}</span>
                  <span class="crown-placeholder"></span>
                </div>
              </div>
            </v-list-item>
          </v-list>
        </v-window-item>

        <v-window-item value="recent">
          <v-list class="bg-transparent">
            <v-list-item
              v-for="entry in recentGames"
              :key="entry.id"
              class="mb-2"
            >
              <v-list-item-title>
                {{ entry.playerName || entry.displayName }}
                <v-chip v-if="entry.isWinner" size="small" color="success" class="ml-2">
                  Winner
                </v-chip>
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ formatDate(entry.timestamp) }}
              </v-list-item-subtitle>

              <template v-slot:append>
                <div class="text-h6 font-weight-bold">
                  {{ entry.score }}
                </div>
              </template>
            </v-list-item>
          </v-list>
        </v-window-item>

        <v-window-item value="personal">
          <v-list v-if="user" class="bg-transparent">
            <v-list-item
              v-for="(entry, index) in personalScores"
              :key="entry.id"
              class="mb-2"
            >
              <template v-slot:prepend>
                <v-avatar color="deep-purple-lighten-1">
                  <span>{{ index + 1 }}</span>
                </v-avatar>
              </template>

              <v-list-item-title>
                {{ formatDate(entry.timestamp) }}
                <v-chip v-if="entry.isWinner" size="small" color="success" class="ml-2">
                  Won
                </v-chip>
              </v-list-item-title>

              <template v-slot:append>
                <div class="text-h6 font-weight-bold">
                  {{ entry.score }}
                </div>
              </template>
            </v-list-item>
          </v-list>
          <v-alert v-else type="info">
            Please log in to see your personal scores
          </v-alert>
        </v-window-item>
      </v-window>

      <v-divider class="my-4"></v-divider>

      <v-btn block color="deep-purple-lighten-1" size="large" class="text-h6" @click="$router.push('/')">
        Back to Home
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getTopScores, getRecentGames, getUserScores, getAverageScores } from '../firebase/firestore';
import { useAuth } from '../composables/useAuth';

const { user } = useAuth();

const activeTab = ref('top');
const loading = ref(false);
const error = ref(null);

const topScores = ref([]);
const averageScores = ref([]);
const recentGames = ref([]);
const personalScores = ref([]);

const getRankColor = (index) => {
  if (index === 0) return '#FFD700'; // gold
  if (index === 1) return '#C0C0C0'; // silver
  if (index === 2) return '#CD7F32'; // bronze
  return 'deep-purple-lighten-1';
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'Just now';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

const loadTopScores = async () => {
  loading.value = true;
  error.value = null;
  const result = await getTopScores(10);
  if (result.success) {
    topScores.value = result.scores;
  } else {
    error.value = result.error;
  }
  loading.value = false;
};

const loadAverageScores = async () => {
  loading.value = true;
  error.value = null;
  const result = await getAverageScores();
  if (result.success) {
    averageScores.value = result.scores;
  } else {
    error.value = result.error;
  }
  loading.value = false;
};

const loadRecentGames = async () => {
  loading.value = true;
  error.value = null;
  const result = await getRecentGames(20);
  if (result.success) {
    recentGames.value = result.games;
  } else {
    error.value = result.error;
  }
  loading.value = false;
};

const loadPersonalScores = async () => {
  if (!user.value) return;
  
  loading.value = true;
  error.value = null;
  const result = await getUserScores();
  if (result.success) {
    personalScores.value = result.scores;
  } else {
    error.value = result.error;
  }
  loading.value = false;
};

watch(activeTab, (newTab) => {
  if (newTab === 'top') loadTopScores();
  if (newTab === 'average') loadAverageScores();
  if (newTab === 'recent') loadRecentGames();
  if (newTab === 'personal') loadPersonalScores();
});

onMounted(() => {
  loadTopScores();
});
</script>

<style lang="scss" scoped>
@import "@/styles/colors";

.glass-card {
  background: $white-transparent !important;
  backdrop-filter: blur(10px);
  border-radius: $border-radius;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.mobile-tabs .v-tab {
  min-width: 0;
  padding: 0 8px;
  font-size: 0.75rem;
}

@media screen and (min-width: 600px) {
  .mobile-tabs .v-tab {
    padding: 0 16px;
    font-size: 0.875rem;
  }
}

.player-info {
  flex: 0 0 400px;
  min-width: 0;
}

.score-section {
  flex: 0 0 120px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

.score-number {
  min-width: 60px;
  text-align: right;
  display: inline-block;
}

.crown-placeholder {
  width: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media screen and (max-width: 600px) {
  .player-info {
    flex: 0 0 200px;
  }
  
  .score-section {
    flex: 0 0 100px;
  }
  
  .score-number {
    min-width: 50px;
  }
}
</style>
