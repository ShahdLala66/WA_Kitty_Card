import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBBlIS2ljci7ULGVnOPGvLKTKbwp_3MFW4",
  authDomain: "wa-kitty-cards.firebaseapp.com",
  projectId: "wa-kitty-cards",
  storageBucket: "wa-kitty-cards.firebasestorage.app",
  messagingSenderId: "921151976936",
  appId: "1:921151976936:web:f80169c7c1f8dcee75e05d"
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, db, storage }; //i think storage is not needed cause...money? 