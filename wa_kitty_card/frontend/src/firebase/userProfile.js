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

export const saveUserProfile = async (userId, profileData) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const dataToSave = {
      ...profileData,
      updatedAt: serverTimestamp()
    };
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      await updateDoc(userDocRef, dataToSave);
    } else {
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

export const uploadProfileImage = async (userId, imageFile) => {
  try {
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }
    
    const imageRef = storageRef(storage, `profileImages/${userId}/${Date.now()}_${imageFile.name}`);
    const snapshot = await uploadBytes(imageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    await saveUserProfile(userId, { photoURL: downloadURL });
    
    return { success: true, photoURL: downloadURL };
  } catch (error) {
    console.error("Error uploading profile image:", error);
    return { success: false, error: error.message };
  }
};

export const deleteProfileImage = async (photoURL) => {
  try {
    if (!photoURL) return { success: true };
    
    const imageRef = storageRef(storage, photoURL);
    await deleteObject(imageRef);
    
    return { success: true };
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      return { success: true };
    }
    console.error("Error deleting profile image:", error);
    return { success: false, error: error.message };
  }
};

export const initializeUserProfile = async (user) => {
  try {
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    
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
