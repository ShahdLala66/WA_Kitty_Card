<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-card class="glass-card pa-6" width="100%" max-width="750" min-height="90%">
      <v-card-title class="text-h5 font-weight-bold text-center">
        Kitty Card Login
      </v-card-title>

      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>

        <v-btn
          block
          color="deep-purple-lighten-1"
          size="large"
          class="mb-4 text-h6"
          :loading="loading"
          @click="handleGoogleLogin"
        >
          <v-icon start>mdi-google</v-icon>
          Sign in with Google
        </v-btn>

        <v-divider class="my-4">
          <span class="text-medium-emphasis">OR</span>
        </v-divider>

        <v-form @submit.prevent="handleEmailLogin">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            required
            color="deep-purple-lighten-1"
            class="mb-2"
          />
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            required
            color="deep-purple-lighten-1"
            class="mb-4"
            :rules="passwordRules"
            :error-messages="passwordErrors"
          >
            <template v-slot:append-inner>
              <v-tooltip location="left" content-class="password-tooltip">
                <template v-slot:activator="{ props }">
                  <span v-bind="props" class="password-help">?</span>
                </template>
                <div class="tooltip-content">
                  <div class="text-subtitle-2 mb-2">Passwort-Anforderungen:</div>
                  <ul class="requirements-list">
                    <li>Mindestens 8 Zeichen</li>
                    <li>Mindestens 1 Großbuchstabe</li>
                    <li>Mindestens 1 Kleinbuchstabe</li>
                    <li>Mindestens 1 Zahl</li>
                    <li>Mindestens 1 Sonderzeichen</li>
                  </ul>
                </div>
              </v-tooltip>
            </template>
          </v-text-field>

          <v-btn
            block
            color="deep-purple-lighten-1"
            type="submit"
            size="large"
            :loading="loading"
            class="mb-2 text-h6"
          >
            Sign In
          </v-btn>

          <div class="text-center mb-3">
            <v-btn
              variant="text"
              color="deep-purple-lighten-1"
              size="small"
              @click="showForgotPasswordDialog = true"
            >
              Passwort vergessen
            </v-btn>
          </div>

          <v-btn
            block
            variant="outlined"
            color="deep-purple-lighten-1"
            size="large"
            @click="handleEmailSignUp"
            :loading="loading"
            class="text-h6"
          >
            Create Account
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Forgot Password Dialog -->
    <v-dialog v-model="showForgotPasswordDialog" max-width="500">
      <v-card class="glass-card pa-4">
        <v-card-title class="text-h6 font-weight-bold">
          Passwort zurücksetzen
        </v-card-title>
        <v-card-text>
          <v-alert v-if="resetSuccess" type="success" class="mb-3">
            {{ resetSuccess }}
          </v-alert>
          <v-alert v-if="resetError" type="error" class="mb-3">
            {{ resetError }}
          </v-alert>
          <v-text-field
            v-model="resetEmail"
            label="Email"
            type="email"
            color="deep-purple-lighten-1"
            prepend-inner-icon="mdi-email"
            class="mb-3"
          />
          <v-text-field
            v-model="newPassword"
            label="Neues Passwort"
            type="password"
            color="deep-purple-lighten-1"
            prepend-inner-icon="mdi-lock"
            class="mb-3"
            :rules="passwordRules"
          >
            <template v-slot:append-inner>
              <v-tooltip location="left" content-class="password-tooltip">
                <template v-slot:activator="{ props }">
                  <span v-bind="props" class="password-help">?</span>
                </template>
                <div class="tooltip-content">
                  <div class="text-subtitle-2 mb-2">Passwort-Anforderungen:</div>
                  <ul class="requirements-list">
                    <li>Mindestens 8 Zeichen</li>
                    <li>Mindestens 1 Großbuchstabe</li>
                    <li>Mindestens 1 Kleinbuchstabe</li>
                    <li>Mindestens 1 Zahl</li>
                    <li>Mindestens 1 Sonderzeichen</li>
                  </ul>
                </div>
              </v-tooltip>
            </template>
          </v-text-field>
          <v-text-field
            v-model="confirmPassword"
            label="Passwort bestätigen"
            type="password"
            color="deep-purple-lighten-1"
            prepend-inner-icon="mdi-lock-check"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            variant="text"
            @click="closeForgotPasswordDialog"
          >
            Abbrechen
          </v-btn>
          <v-btn
            color="deep-purple-lighten-1"
            @click="handlePasswordReset"
            :loading="resetLoading"
          >
            Passwort ändern
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { loginWithGoogle, loginWithEmail, signUp, sendPasswordReset, loading, error } = useAuth();

const email = ref('');
const password = ref('');
const passwordErrors = ref([]);

// Forgot Password
const showForgotPasswordDialog = ref(false);
const resetEmail = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const resetSuccess = ref('');
const resetError = ref('');
const resetLoading = ref(false);

// Passwort-Validierung
const passwordValidation = computed(() => ({
  minLength: password.value.length >= 8,
  hasUpperCase: /[A-Z]/.test(password.value),
  hasLowerCase: /[a-z]/.test(password.value),
  hasNumber: /[0-9]/.test(password.value),
  hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password.value)
}));

const isPasswordValid = computed(() => {
  return Object.values(passwordValidation.value).every(v => v === true);
});

const passwordRules = [
  v => !!v || 'Passwort ist erforderlich'
];

const handleGoogleLogin = async () => {
  const { user, error: authError } = await loginWithGoogle();
  if (user) {
    router.push('/');
  }
};

const handleEmailLogin = async () => {
  const { user, error: authError } = await loginWithEmail(email.value, password.value);
  if (user) {
    router.push('/');
  }
};

const handleEmailSignUp = async () => {
  passwordErrors.value = [];
  
  if (!isPasswordValid.value) {
    passwordErrors.value = ['Passwort erfüllt nicht alle Anforderungen'];
    return;
  }
  
  const { user, error: authError } = await signUp(email.value, password.value);
  if (user) {
    router.push('/');
  }
};

const handlePasswordReset = async () => {
  resetError.value = '';
  resetSuccess.value = '';
  
  if (!resetEmail.value) {
    resetError.value = 'Bitte gib deine Email-Adresse ein';
    return;
  }
  
  if (!newPassword.value) {
    resetError.value = 'Bitte gib ein neues Passwort ein';
    return;
  }
  
  // Validate new password
  const validation = {
    minLength: newPassword.value.length >= 8,
    hasUpperCase: /[A-Z]/.test(newPassword.value),
    hasLowerCase: /[a-z]/.test(newPassword.value),
    hasNumber: /[0-9]/.test(newPassword.value),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword.value)
  };
  
  if (!Object.values(validation).every(v => v === true)) {
    resetError.value = 'Passwort erfüllt nicht alle Anforderungen';
    return;
  }
  
  if (newPassword.value !== confirmPassword.value) {
    resetError.value = 'Passwörter stimmen nicht überein';
    return;
  }
  
  resetLoading.value = true;
  
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: resetEmail.value,
        newPassword: newPassword.value
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.status === 'OK') {
      resetSuccess.value = 'Passwort erfolgreich geändert! Du kannst dich jetzt anmelden.';
      setTimeout(() => {
        closeForgotPasswordDialog();
      }, 2000);
    } else {
      resetError.value = data.message || 'Fehler beim Zurücksetzen des Passworts';
    }
  } catch (error) {
    resetError.value = 'Netzwerkfehler: ' + error.message;
  } finally {
    resetLoading.value = false;
  }
};

const closeForgotPasswordDialog = () => {
  showForgotPasswordDialog.value = false;
  resetEmail.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  resetError.value = '';
  resetSuccess.value = '';
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

.password-help {
  display: inline-flex;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(171, 129, 233, 0.2);
  font-weight: bold;
  font-size: 14px;
  cursor: help;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
}

:deep(.password-tooltip) {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(10px);
  border-radius: 8px;
  border: 1px solid rgba(171, 129, 233, 0.3);
  padding: 12px 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.tooltip-content {
  color: rgba(0, 0, 0, 0.87);
  text-align: left;
  
  .text-subtitle-2 {
    color: rgb(171, 129, 233);
    font-weight: 600;
    text-align: left;
  }
}

.requirements-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
  text-align: left;
  
  li {
    padding: 4px 0;
    padding-left: 20px;
    position: relative;
    font-size: 14px;
    text-align: left;
    
    &:before {
      content: "•";
      position: absolute;
      left: 8px;
      color: rgb(171, 129, 233);
      font-weight: bold;
    }
  }
}
</style>
