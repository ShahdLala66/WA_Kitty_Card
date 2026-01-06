<template>
  <div class="login-container">
    <v-card class="mx-auto pa-6" max-width="400">
      <v-card-title class="text-h5 text-center mb-4">
        Kitty Card Login
      </v-card-title>

      <v-card-text>
        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>

        <!-- Google Sign In Button -->
        <v-btn
          block
          color="primary"
          size="large"
          class="mb-4"
          :loading="loading"
          @click="handleGoogleLogin"
        >
          <v-icon start>mdi-google</v-icon>
          Sign in with Google
        </v-btn>

        <v-divider class="my-4">
          <span class="text-medium-emphasis">OR</span>
        </v-divider>

        <!-- Email/Password Form -->
        <v-form @submit.prevent="handleEmailLogin">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            required
            class="mb-2"
          />
          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            required
            class="mb-4"
          />

          <v-btn
            block
            color="secondary"
            type="submit"
            :loading="loading"
            class="mb-2"
          >
            Sign In
          </v-btn>

          <v-btn
            block
            variant="text"
            @click="handleEmailSignUp"
            :loading="loading"
          >
            Create Account
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
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

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
