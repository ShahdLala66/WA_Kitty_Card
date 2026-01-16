<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="glass-card pa-6" width="100%" max-width="750" min-height="90%">
      <v-card-title class="text-h5 font-weight-bold text-center mb-4">
        Mein Profil
      </v-card-title>

      <v-card-text>
        <v-alert v-if="successMessage" type="success" class="mb-4">
          {{ successMessage }}
        </v-alert>

        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>

        <div v-if="user" class="profile-content">
          <!-- User Information -->
          <v-form>
            <v-text-field
              v-model="user.email"
              label="Email"
              color="deep-purple-lighten-1"
              class="mb-3"
              readonly
              prepend-inner-icon="mdi-email"
            />

            <v-text-field
              v-model="user.uid"
              label="User ID"
              color="deep-purple-lighten-1"
              class="mb-3"
              readonly
              prepend-inner-icon="mdi-identifier"
            />

            <v-text-field
              v-model="accountCreated"
              label="Account erstellt"
              color="deep-purple-lighten-1"
              class="mb-3"
              readonly
              prepend-inner-icon="mdi-calendar"
            />

            <v-text-field
              v-model="lastSignIn"
              label="Letzte Anmeldung"
              color="deep-purple-lighten-1"
              class="mb-4"
              readonly
              prepend-inner-icon="mdi-clock-outline"
            />
          </v-form>

          <v-divider class="my-4"></v-divider>

          <!-- Action Buttons -->
          <div class="d-flex flex-column gap-2">
            <v-btn
              block
              color="deep-purple-lighten-1"
              size="large"
              class="text-h6"
              @click="router.push('/')"
            >
              <v-icon start>mdi-home</v-icon>
              Zurück zur Startseite
            </v-btn>

            <v-btn
              block
              variant="outlined"
              color="error"
              size="large"
              class="text-h6"
              @click="handleLogout"
              :loading="loading"
            >
              <v-icon start>mdi-logout</v-icon>
              Ausloggen
            </v-btn>
          </div>
        </div>

        <div v-else class="text-center">
          <v-progress-circular indeterminate color="deep-purple-lighten-1"></v-progress-circular>
          <p class="mt-3">Lade Profildaten...</p>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { user, signOut } = useAuth();

const successMessage = ref('');
const error = ref('');
const loading = ref(false);

const accountCreated = computed(() => {
  if (!user.value?.metadata?.creationTime) return 'Unbekannt';
  return new Date(user.value.metadata.creationTime).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

const lastSignIn = computed(() => {
  if (!user.value?.metadata?.lastSignInTime) return 'Unbekannt';
  return new Date(user.value.metadata.lastSignInTime).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
});

const handleLogout = async () => {
  loading.value = true;
  error.value = '';
  
  const { error: logoutError } = await signOut();
  
  if (logoutError) {
    error.value = 'Fehler beim Ausloggen: ' + logoutError;
    loading.value = false;
  } else {
    successMessage.value = 'Erfolgreich ausgeloggt';
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  }
};
</script>

<style lang="scss" scoped>
@import "@/styles/colors";

.glass-card {
  background: $white-transparent !important;
  backdrop-filter: blur(10px);
  border-radius: $border-radius;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.profile-content {
  max-width: 600px;
  margin: 0 auto;
}

.gap-2 {
  gap: 8px;
}

:deep(.v-field--readonly) {
  opacity: 0.8;
}
</style>
