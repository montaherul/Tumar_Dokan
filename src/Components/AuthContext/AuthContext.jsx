import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  signOut, 
  onAuthStateChanged,
  signInWithPopup, // NEW
  googleProvider, // NEW
  githubProvider // NEW
} from "../firebase/firebase.int"; // Import Firebase auth functions and providers

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // This will store our custom user object from MongoDB
  const [firebaseUser, setFirebaseUser] = useState(null); // This will store the raw Firebase user object
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = "http://localhost:5000/api"; // Your backend API base URL

  // Function to sync Firebase user data with your MongoDB backend
  const syncUserWithBackend = async (firebaseUserData) => {
    if (!firebaseUserData) return;

    try {
      const token = await firebaseUserData.getIdToken(); // Get Firebase ID token
      const response = await fetch(`${API_BASE_URL}/users`, { // New endpoint for user profiles
        method: 'POST', // Use POST for initial creation/update
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token, // Send Firebase ID token for backend verification
        },
        body: JSON.stringify({
          uid: firebaseUserData.uid,
          email: firebaseUserData.email,
          name: firebaseUserData.displayName,
          photoURL: firebaseUserData.photoURL,
          phoneNumber: firebaseUserData.phoneNumber,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store the custom user object from your backend
        setUser(data.user); 
        return { success: true, user: data.user };
      } else {
        console.error("Backend user sync failed:", data.message);
        return { success: false, message: data.message || 'Backend sync failed' };
      }
    } catch (error) {
      console.error("Error syncing user with backend:", error);
      return { success: false, message: 'Network error during backend sync' };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        // If Firebase user exists, try to sync with backend
        await syncUserWithBackend(currentUser);
      } else {
        setUser(null); // No Firebase user, so no custom user
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUserData = userCredential.user;
      
      // Sync with backend after successful Firebase login
      const backendSyncResult = await syncUserWithBackend(firebaseUserData);
      
      if (backendSyncResult.success) {
        return { success: true };
      } else {
        // If backend sync fails, log out from Firebase to prevent inconsistent state
        await signOut(auth);
        return { success: false, message: backendSyncResult.message };
      }

    } catch (error) {
      console.error("Firebase Login error:", error);
      let errorMessage = "Login failed. Please check your credentials.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Invalid email or password.";
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = "Too many login attempts. Please try again later.";
      }
      return { success: false, message: errorMessage };
    }
  };

  const register = async (email, password, name) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUserData = userCredential.user;

      // Update Firebase profile with display name
      await updateProfile(firebaseUserData, { displayName: name });

      // Sync with backend after successful Firebase registration
      const backendSyncResult = await syncUserWithBackend(firebaseUserData);

      if (backendSyncResult.success) {
        return { success: true };
      } else {
        // If backend sync fails, delete Firebase user and log out
        await firebaseUserData.delete(); // This might require re-authentication
        await signOut(auth);
        return { success: false, message: backendSyncResult.message };
      }

    } catch (error) {
      console.error("Firebase Registration error:", error);
      let errorMessage = "Registration failed.";
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email is already registered.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. It must be at least 6 characters.";
      }
      return { success: false, message: errorMessage };
    }
  };

  // NEW: Social Login Functions
  const signInWithGoogle = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUserData = userCredential.user;
      const backendSyncResult = await syncUserWithBackend(firebaseUserData);
      if (backendSyncResult.success) {
        return { success: true };
      } else {
        await signOut(auth);
        return { success: false, message: backendSyncResult.message };
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
      let errorMessage = "Google sign-in failed.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "Google sign-in window closed.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "Google sign-in already in progress.";
      }
      return { success: false, message: errorMessage };
    }
  };

  const signInWithGitHub = async () => {
    try {
      const userCredential = await signInWithPopup(auth, githubProvider);
      const firebaseUserData = userCredential.user;
      const backendSyncResult = await syncUserWithBackend(firebaseUserData);
      if (backendSyncResult.success) {
        return { success: true };
      } else {
        await signOut(auth);
        return { success: false, message: backendSyncResult.message };
      }
    } catch (error) {
      console.error("GitHub Sign-In error:", error);
      let errorMessage = "GitHub sign-in failed.";
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = "GitHub sign-in window closed.";
      } else if (error.code === 'auth/cancelled-popup-request') {
        errorMessage = "GitHub sign-in already in progress.";
      }
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFirebaseUser(null);
      // No need to clear localStorage token as Firebase handles sessions
    } catch (error) {
      console.error("Firebase Logout error:", error);
      alert("Failed to log out. Please try again.");
    }
  };

  // Provide a way to update user details from other components (e.g., EditProfile)
  // This will update the Firebase user and then trigger a backend sync
  const updateUser = async (newUserData) => {
    if (!firebaseUser) return { success: false, message: "No user logged in." };

    try {
      // Update Firebase profile (displayName, photoURL)
      await updateProfile(firebaseUser, {
        displayName: newUserData.name || firebaseUser.displayName,
        photoURL: newUserData.photoURL || firebaseUser.photoURL,
      });

      // Now, update the custom backend user profile
      const token = await firebaseUser.getIdToken();
      const response = await fetch(`${API_BASE_URL}/users/${firebaseUser.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({
          name: newUserData.name,
          photoURL: newUserData.photoURL,
          phoneNumber: newUserData.phoneNumber,
          // Add other fields you want to update in MongoDB
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user); // Update the local custom user state
        return { success: true, user: data.user };
      } else {
        console.error("Backend user update failed:", data.message);
        return { success: false, message: data.message || 'Backend update failed' };
      }
    } catch (error) {
      console.error("Error updating user profile:", error);
      return { success: false, message: 'Failed to update profile.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, login, register, logout, updateUser, signInWithGoogle, signInWithGitHub }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};