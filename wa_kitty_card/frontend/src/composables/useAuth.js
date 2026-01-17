import { ref, onMounted, onUnmounted } from 'vue';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, logout, onAuthChange, resetPassword } from '../firebase/auth';
import { initializeUserProfile } from '../services/surrealdb';

export function useAuth() {
  const user = ref(null);
  const loading = ref(true);
  const error = ref(null);

  let unsubscribe = null;

  onMounted(() => {
    unsubscribe = onAuthChange(async (firebaseUser) => {
      user.value = firebaseUser;
      
      // Sync profile to SurrealDB on every auth state change
      if (firebaseUser) {
        try {
          await initializeUserProfile(firebaseUser);
        } catch (err) {
          console.error('Failed to sync profile:', err);
        }
      }
      
      loading.value = false;
    });
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });

  const loginWithGoogle = async () => {
    error.value = null;
    loading.value = true;
    const { user: authUser, error: authError } = await signInWithGoogle();
    if (authError) {
      error.value = authError;
    }
    loading.value = false;
    return { user: authUser, error: authError };
  };

  const loginWithEmail = async (email, password) => {
    error.value = null;
    loading.value = true;
    const { user: authUser, error: authError } = await signInWithEmail(email, password);
    if (authError) {
      error.value = authError;
    }
    loading.value = false;
    return { user: authUser, error: authError };
  };

  const signUp = async (email, password) => {
    error.value = null;
    loading.value = true;
    const { user: authUser, error: authError } = await signUpWithEmail(email, password);
    if (authError) {
      error.value = authError;
    }
    loading.value = false;
    return { user: authUser, error: authError };
  };

  const signOut = async () => {
    error.value = null;
    loading.value = true;
    const { error: authError } = await logout();
    if (authError) {
      error.value = authError;
    }
    loading.value = false;
    return { error: authError };
  };

  const sendPasswordReset = async (email) => {
    error.value = null;
    loading.value = true;
    const { error: authError } = await resetPassword(email);
    if (authError) {
      error.value = authError;
    }
    loading.value = false;
    return { error: authError };
  };

  return {
    user,
    loading,
    error,
    loginWithGoogle,
    loginWithEmail,
    signUp,
    signOut,
    sendPasswordReset,
    isAuthenticated: () => !!user.value
  };
}
