import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  serverTimestamp 
} from "firebase/firestore";
import { 
  ref as storageRef, 
  uploadBytes, 
  getDownloadURL,
  deleteObject 
} from "firebase/storage";
import { db, storage, auth } from "./config";

/**
 * Get user profile from Firestore
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (userId) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { success: true, profile: userDoc.data() };
    } else {
      return { success: false, error: "Profile not found" };
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Create or update user profile in Firestore
 * @param {string} userId - The user ID
 * @param {Object} profileData - Profile data to save
 * @returns {Promise<Object>} Result of operation
 */
export const saveUserProfile = async (userId, profileData) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const dataToSave = {
      ...profileData,
      updatedAt: serverTimestamp()
    };
    
    // Check if profile exists
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      // Update existing profile
      await updateDoc(userDocRef, dataToSave);
    } else {
      // Create new profile
      await setDoc(userDocRef, {
        ...dataToSave,
        createdAt: serverTimestamp()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error saving user profile:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload profile image to Firebase Storage
 * @param {string} userId - The user ID
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} Download URL and result
 */
export const uploadProfileImage = async (userId, imageFile) => {
  try {
    // Validate file type
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    // Validate file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }
    
    // Create a storage reference
    const imageRef = storageRef(storage, `profileImages/${userId}/${Date.now()}_${imageFile.name}`);
    
    // Upload the file
    const snapshot = await uploadBytes(imageRef, imageFile);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    // Update user profile with new photo URL
    await saveUserProfile(userId, { photoURL: downloadURL });
    
    return { success: true, photoURL: downloadURL };
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete old profile image from storage
 * @param {string} photoURL - The photo URL to delete
 * @returns {Promise<Object>} Result of operation
 */
export const deleteProfileImage = async (photoURL) => {
  try {
    if (!photoURL) return { success: true };
    
    // Extract storage path from URL
    const imageRef = storageRef(storage, photoURL);
    await deleteObject(imageRef);
    
    return { success: true };
  } catch (error) {
    // If image doesn't exist, that's okay
    if (error.code === 'storage/object-not-found') {
      return { success: true };
    }
    console.error("Error deleting profile image:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Initialize user profile with Google data or default data
 * @param {Object} user - Firebase user object
 * @returns {Promise<Object>} Result of operation
 */
export const initializeUserProfile = async (user) => {
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
    // Only create profile if it doesn't exist
    if (!userDoc.exists()) {
      const profileData = {
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(userDocRef, profileData);
      return { success: true, created: true };
    }
    
    return { success: true, created: false };
  } catch (error) {
    console.error("Error initializing user profile:", error);
    return { success: false, error: error.message };
  }
};
