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
          />

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
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { loginWithGoogle, loginWithEmail, signUp, loading, error } = useAuth();

const email = ref('');
const password = ref('');

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
  const { user, error: authError } = await signUp(email.value, password.value);
  if (user) {
    router.push('/');
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
</style>
