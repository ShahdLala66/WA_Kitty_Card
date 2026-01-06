import { ref, onMounted, onUnmounted } from 'vue';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, logout, onAuthChange } from '../firebase/auth';

export function useAuth() {
  const user = ref(null);
  const loading = ref(true);
  const error = ref(null);

  let unsubscribe = null;

  onMounted(() => {
    // Listen for auth state changes
    unsubscribe = onAuthChange((firebaseUser) => {
      user.value = firebaseUser;
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

  return {
    user,
    loading,
    error,
    loginWithGoogle,
    loginWithEmail,
    signUp,
    signOut,
    isAuthenticated: () => !!user.value
  };
}
