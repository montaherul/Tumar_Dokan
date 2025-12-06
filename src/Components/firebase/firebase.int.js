// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup, // NEW: For social logins
  GoogleAuthProvider, // NEW: Google Auth Provider
  GithubAuthProvider // NEW: GitHub Auth Provider
} from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Keep Firestore if you're using it

const firebaseConfig = {
  apiKey: "AIzaSyCj22RruYIAmIUucWEh_TKgIuffAf8PEQw",
  authDomain: "myproject-1c783.firebaseapp.com",
  projectId: "myproject-1c783",
  storageBucket: "myproject-1c783.firebasestorage.app",
  messagingSenderId: "537688691250",
  appId: "1:537688691250:web:35a13487f6ce78eecca22b",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app); // Export Firestore if needed

// Instantiate social providers
export const googleProvider = new GoogleAuthProvider(); // NEW
export const githubProvider = new GithubAuthProvider(); // NEW

// Export Firebase Auth functions for use in AuthContext
export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup // NEW: Export signInWithPopup
};