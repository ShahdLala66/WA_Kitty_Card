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
          <div class="profile-image-section mb-6">
            <div class="d-flex flex-column align-center">
              <v-avatar 
                size="150" 
                class="mb-4 profile-avatar"
                :class="{ 'avatar-loading': imageLoading }"
              >
                <v-img 
                  v-if="currentPhotoURL" 
                  :src="currentPhotoURL" 
                  alt="Profile"
                  @error="handleImageError"
                  cover
                />
                <v-icon v-else size="100" color="deep-purple-lighten-1">
                  mdi-account-circle
                </v-icon>
              </v-avatar>

              <div class="d-flex gap-2 flex-wrap justify-center">
                <v-btn
                  color="deep-purple-lighten-1"
                  variant="elevated"
                  prepend-icon="mdi-upload"
                  @click="triggerFileInput"
                  :loading="imageLoading"
                >
                  Bild hochladen
                </v-btn>

                <v-btn
                  v-if="currentPhotoURL && !isGooglePhoto"
                  color="error"
                  variant="outlined"
                  prepend-icon="mdi-delete"
                  @click="handleRemoveImage"
                  :loading="imageLoading"
                >
                  Bild entfernen
                </v-btn>
              </div>

              <input
                ref="fileInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="handleFileSelect"
              />

              <v-progress-linear
                v-if="uploadProgress > 0 && uploadProgress < 100"
                :model-value="uploadProgress"
                color="deep-purple-lighten-1"
                class="mt-3"
                height="8"
                rounded
              />

              <p v-if="isGooglePhoto" class="text-caption text-grey mt-2">
                <v-icon size="small" class="mr-1">mdi-google</v-icon>
                Von Google synchronisiert
              </p>
            </div>
          </div>

          <v-divider class="my-4"></v-divider>

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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { getUserProfile, uploadProfileImage, removeProfileImage } from '../services/surrealdb';

const router = useRouter();
const { user, signOut } = useAuth();

const successMessage = ref('');
const error = ref('');
const loading = ref(false);
const imageLoading = ref(false);
const fileInput = ref(null);
const profile = ref(null);
const uploadProgress = ref(0);

const currentPhotoURL = computed(() => {
  if (profile.value?.photoURL) {
    return profile.value.photoURL;
  }
  return user.value?.photoURL || null;
});

const isGooglePhoto = computed(() => {
  const url = currentPhotoURL.value;
  return url && (url.includes('googleusercontent.com') || url.includes('google.com'));
});

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

const loadUserProfile = async () => {
  if (!user.value) return;
  
  const result = await getUserProfile(user.value.uid);
  if (result.success) {
    profile.value = result.profile;
  }
};

onMounted(() => {
  if (user.value) {
    loadUserProfile();
  }
});

watch(user, (newUser) => {
  if (newUser) {
    loadUserProfile();
  }
});

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    error.value = 'Bitte wählen Sie eine Bilddatei aus';
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    error.value = 'Die Bildgröße darf 5MB nicht überschreiten';
    return;
  }

  if (!user.value) {
    error.value = 'Benutzer nicht angemeldet';
    return;
  }

  imageLoading.value = true;
  error.value = '';
  successMessage.value = '';

  try {
    const result = await uploadProfileImage(user.value.uid, file);
    
    if (result.success) {
      if (profile.value) {
        profile.value.photoURL = result.photoURL;
      } else {
        profile.value = { photoURL: result.photoURL };
      }
      successMessage.value = 'Profilbild erfolgreich hochgeladen!';
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    } else {
      error.value = 'Fehler beim Hochladen: ' + result.error;
    }
  } catch (err) {
    error.value = 'Fehler beim Hochladen des Bildes';
    console.error(err);
  } finally {
    imageLoading.value = false;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

const handleRemoveImage = async () => {
  if (!user.value) return;

  imageLoading.value = true;
  error.value = '';
  successMessage.value = '';

  try {
    const result = await removeProfileImage(user.value.uid);
    
    if (result.success) {
      if (profile.value) {
        profile.value.photoURL = null;
      }
      successMessage.value = 'Profilbild erfolgreich entfernt!';
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    } else {
      error.value = 'Fehler beim Entfernen: ' + result.error;
    }
  } catch (err) {
    error.value = 'Fehler beim Entfernen des Bildes';
    console.error(err);
  } finally {
    imageLoading.value = false;
  }
};

const handleImageError = () => {
  console.error('Failed to load profile image');
};

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

.profile-image-section {
  .profile-avatar {
    border: 4px solid rgba(103, 58, 183, 0.3);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
      border-color: rgba(103, 58, 183, 0.6);
    }
    
    &.avatar-loading {
      opacity: 0.6;
    }
  }
}

.gap-2 {
  gap: 8px;
}

:deep(.v-field--readonly) {
  opacity: 0.8;
}
</style>
