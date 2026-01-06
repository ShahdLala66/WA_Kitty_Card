<template>
  <v-container class="leaderboard-page">
    <v-row justify="center">
      <v-col cols="12" md="8" lg="6">
        <v-card class="glass-card pa-6">
          <v-card-title class="text-h3 text-center mb-6">
             Leaderboard
          </v-card-title>

          <v-tabs v-model="activeTab" class="mb-4">
            <v-tab value="top">Top Players</v-tab>
            <v-tab value="recent">Recent Games</v-tab>
            <v-tab value="personal">My Scores</v-tab>
          </v-tabs>

          <!-- Loading State -->
          <v-progress-linear v-if="loading" indeterminate color="primary"></v-progress-linear>

          <!-- Error State -->
          <v-alert v-if="error" type="error" class="mb-4">
            {{ error }}
          </v-alert>

          <v-window v-model="activeTab">
            <!-- Top Players Tab -->
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

                  <v-list-item-title class="text-h6">
                    {{ entry.displayName || entry.playerName }}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ entry.email }}
                  </v-list-item-subtitle>

                  <template v-slot:append>
                    <div class="text-h5 font-weight-bold">
                      {{ entry.score }}
                      <v-icon v-if="entry.isWinner" color="gold">mdi-crown</v-icon>
                    </div>
                  </template>
                </v-list-item>
              </v-list>
            </v-window-item>

            <!-- Recent Games Tab -->
            <v-window-item value="recent">
              <v-list class="bg-transparent">
                <v-list-item
                  v-for="entry in recentGames"
                  :key="entry.id"
                  class="mb-2"
                >
                  <v-list-item-title>
                    {{ entry.displayName || entry.playerName }}
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

            <!-- Personal Scores Tab -->
            <v-window-item value="personal">
              <v-list v-if="user" class="bg-transparent">
                <v-list-item
                  v-for="(entry, index) in personalScores"
                  :key="entry.id"
                  class="mb-2"
                >
                  <template v-slot:prepend>
                    <v-avatar color="primary">
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

          <v-btn block color="primary" @click="$router.push('/')">
            Back to Home
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { getTopScores, getRecentGames, getUserScores } from '../firebase/firestore';
import { useAuth } from '../composables/useAuth';

const { user } = useAuth();

const activeTab = ref('top');
const loading = ref(false);
const error = ref(null);

const topScores = ref([]);
const recentGames = ref([]);
const personalScores = ref([]);

const getRankColor = (index) => {
  if (index === 0) return 'gold';
  if (index === 1) return 'silver';
  if (index === 2) return '#CD7F32'; // bronze
  return 'grey';
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

// Watch tab changes and load data
watch(activeTab, (newTab) => {
  if (newTab === 'top') loadTopScores();
  if (newTab === 'recent') loadRecentGames();
  if (newTab === 'personal') loadPersonalScores();
});

onMounted(() => {
  loadTopScores();
});
</script>

<style scoped>
.leaderboard-page {
  min-height: 100vh;
  padding-top: 2rem;
}

.glass-card {
  background-color: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
  border-radius: 16px;
}
</style>
