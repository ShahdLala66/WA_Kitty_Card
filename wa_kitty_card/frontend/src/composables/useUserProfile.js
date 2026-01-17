import { ref, computed } from 'vue';
import { 
  getUserProfile, 
  saveUserProfile, 
  uploadProfileImage 
} from '../firebase/userProfile';

export function useUserProfile(userId) {
  const profile = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const uploadProgress = ref(0);

  const photoURL = computed(() => profile.value?.photoURL || null);
  const displayName = computed(() => profile.value?.displayName || '');

  const loadProfile = async () => {
    if (!userId) {
      error.value = 'No user ID provided';
      return;
    }

    loading.value = true;
    error.value = null;

    const result = await getUserProfile(userId);
    
    if (result.success) {
      profile.value = result.profile;
    } else {
      error.value = result.error;
    }
    
    loading.value = false;
  };

  const updateProfile = async (profileData) => {
    if (!userId) {
      error.value = 'No user ID provided';
      return { success: false, error: 'No user ID provided' };
    }

    loading.value = true;
    error.value = null;

    const result = await saveUserProfile(userId, profileData);
    
    if (result.success) {
      profile.value = { ...profile.value, ...profileData };
    } else {
      error.value = result.error;
    }
    
    loading.value = false;
    return result;
  };

  const uploadImage = async (imageFile) => {
    if (!userId) {
      error.value = 'No user ID provided';
      return { success: false, error: 'No user ID provided' };
    }

    loading.value = true;
    error.value = null;
    uploadProgress.value = 0;

    const result = await uploadProfileImage(userId, imageFile);
    
    if (result.success) {
      if (profile.value) {
        profile.value.photoURL = result.photoURL;
      } else {
        profile.value = { photoURL: result.photoURL };
      }
      uploadProgress.value = 100;
    } else {
      error.value = result.error;
    }
    
    loading.value = false;
    return result;
  };

  return {
    profile,
    photoURL,
    displayName,
    loading,
    error,
    uploadProgress,
    loadProfile,
    updateProfile,
    uploadImage
  };
}
