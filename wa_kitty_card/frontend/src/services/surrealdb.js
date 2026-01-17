import Surreal from 'surrealdb';

const db = new Surreal();

let isConnected = false;

export const initSurrealDB = async () => {
  if (isConnected) return;
  
  try {
    const config = window.APP_CONFIG || {};
    const dbUrl = config.SURREALDB_URL || process.env.VUE_APP_SURREALDB_URL;
    const namespace = config.SURREALDB_NAMESPACE || process.env.VUE_APP_SURREALDB_NAMESPACE;
    const database = config.SURREALDB_DATABASE || process.env.VUE_APP_SURREALDB_DATABASE ;
    const username = config.SURREALDB_USERNAME || process.env.VUE_APP_SURREALDB_USERNAME ;
    const password = config.SURREALDB_PASSWORD || process.env.VUE_APP_SURREALDB_PASSWORD ;
    
    console.log('🔌 Connecting to SurrealDB:', dbUrl);
    
    await db.connect(dbUrl);
    
    // Authenticate with ROOT credentials
    await db.signin({
      username: username,
      password: password
    });
    
    // Use namespace and database after authentication
    await db.use({ namespace: namespace, database: database });
    
    // Initialize table schema if needed
    await initializeSchema();
    
    isConnected = true;
    console.log('Connected to SurrealDB with proper authentication');
  } catch (error) {
    console.error('Failed to connect to SurrealDB:', error);
    isConnected = false;
    throw error;
  }
};

/**
 * Initialize database schema
 */
const initializeSchema = async () => {
  try {
    // Define user_profiles table with schema
    await db.query(`
      DEFINE TABLE IF NOT EXISTS user_profiles SCHEMAFULL;
      DEFINE FIELD IF NOT EXISTS userId ON user_profiles TYPE string;
      DEFINE FIELD IF NOT EXISTS email ON user_profiles TYPE string;
      DEFINE FIELD IF NOT EXISTS displayName ON user_profiles TYPE string;
      DEFINE FIELD IF NOT EXISTS photoURL ON user_profiles TYPE option<string>;
      DEFINE FIELD IF NOT EXISTS photoType ON user_profiles TYPE option<string>;
      DEFINE FIELD IF NOT EXISTS photoSize ON user_profiles TYPE option<number>;
      DEFINE FIELD IF NOT EXISTS createdAt ON user_profiles TYPE datetime;
      DEFINE FIELD IF NOT EXISTS updatedAt ON user_profiles TYPE datetime;
      DEFINE INDEX IF NOT EXISTS userIdIndex ON user_profiles FIELDS userId UNIQUE;
      DEFINE INDEX IF NOT EXISTS emailIndex ON user_profiles FIELDS email;
    `);
    console.log('Schema initialized');
  } catch (error) {
    console.warn('Schema initialization warning:', error.message);
  }
};

/**
 * Get user profile from SurrealDB
 */
export const getUserProfile = async (userId) => {
  try {
    await initSurrealDB();
    
    const result = await db.select(`user_profiles:${userId}`);
    
    if (result && result.length > 0) {
      return { success: true, profile: result[0] };
    }
    
    return { success: false, error: 'Profile not found' };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get user profile by email
 */
export const getUserProfileByEmail = async (email) => {
  try {
    await initSurrealDB();
    
    const result = await db.query('SELECT * FROM user_profiles WHERE email = $email LIMIT 1', {
      email: email
    });
    
    if (result && result[0] && result[0].length > 0) {
      return { success: true, profile: result[0][0] };
    }
    
    return { success: false, error: 'Profile not found' };
  } catch (error) {
    console.error('Error fetching user profile by email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Save or update user profile in SurrealDB
 */
export const saveUserProfile = async (userId, profileData) => {
  try {
    await initSurrealDB();
    
    const data = {
      ...profileData,
      userId,
      updatedAt: new Date().toISOString()
    };
    
    // Merge with existing profile or create new one
    const result = await db.merge(`user_profiles:${userId}`, data);
    
    return { success: true, profile: result };
  } catch (error) {
    console.error('Error saving user profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload profile image (convert to base64 and store in SurrealDB)
 */
export const uploadProfileImage = async (userId, imageFile) => {
  try {
    // Validate file
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }
    
    // Validate file size (max 5MB)
    if (imageFile.size > 5 * 1024 * 1024) {
      throw new Error('Image size must be less than 5MB');
    }
    
    // Convert image to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Save to SurrealDB
    await initSurrealDB();
    
    const result = await db.merge(`user_profiles:${userId}`, {
      photoURL: base64Image,
      photoType: imageFile.type,
      photoSize: imageFile.size,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true, photoURL: base64Image, profile: result };
  } catch (error) {
    console.error('Error uploading profile image:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Remove profile image
 */
export const removeProfileImage = async (userId) => {
  try {
    await initSurrealDB();
    
    const result = await db.merge(`user_profiles:${userId}`, {
      photoURL: null,
      photoType: null,
      photoSize: null,
      updatedAt: new Date().toISOString()
    });
    
    return { success: true, profile: result };
  } catch (error) {
    console.error('Error removing profile image:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Initialize or update user profile (called on EVERY login to sync data)
 */
export const initializeUserProfile = async (user) => {
  try {
    await initSurrealDB();
    
    // Always update/create profile with latest data from Firebase Auth
    const profileData = {
      userId: user.uid,
      email: user.email,
      displayName: user.displayName || user.email.split('@')[0],
      updatedAt: new Date().toISOString()
    };
    
    // Check if profile exists
    const existing = await db.select(`user_profiles:${user.uid}`);
    
    if (existing && existing.length > 0) {
      // Update existing profile, preserve photoURL if exists
      const result = await db.merge(`user_profiles:${user.uid}`, {
        ...profileData,
        // Only set photoURL from Google if user doesn't have custom photo
        photoURL: existing[0].photoURL || user.photoURL || null
      });
      return { success: true, created: false, profile: result };
    } else {
      // Create new profile
      const result = await db.create(`user_profiles:${user.uid}`, {
        ...profileData,
        photoURL: user.photoURL || null,
        createdAt: new Date().toISOString()
      });
      return { success: true, created: true, profile: result };
    }
  } catch (error) {
    console.error('Error initializing user profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Helper function to convert File to base64
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(reader.result);
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsDataURL(file);
  });
};

export default db;
