
import { initializeApp, getApp, getApps } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc
} from "firebase/firestore";
import { UserData } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyBJax1Z6bPN05dL4s5wimFhN0TEG4aCQXs",
  authDomain: "booking-580fc.firebaseapp.com",
  databaseURL: "https://booking-580fc-default-rtdb.firebaseio.com",
  projectId: "booking-580fc",
  storageBucket: "booking-580fc.firebasestorage.app",
  messagingSenderId: "869669492146",
  appId: "1:869669492146:web:5674959ba6dcce51b880ab",
  measurementId: "G-MKCYD20Q2X"
};

// Singleton instance initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

// Fix: Complete authService with logout and full loginOrRegister logic
export const authService = {
  onStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },
  
  loginOrRegister: async (email: string, pass: string) => {
    const cleanEmail = email.trim();
    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, pass);
      return result.user;
    } catch (error: any) {
      // If user doesn't exist or wrong credentials, try registering (simplified for game flow)
      if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential' || error.code === 'auth/user-disabled') {
        const result = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        return result.user;
      }
      throw error;
    }
  },

  // Fix: Added missing logout function to satisfy App.tsx usage
  logout: async () => {
    await signOut(auth);
  }
};

// Fix: Add missing firestoreService export to handle data persistence
export const firestoreService = {
  getUserData: async (uid: string): Promise<UserData | null> => {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  },

  initUserData: async (uid: string, email: string): Promise<UserData> => {
    const initialData: UserData = {
      uid,
      email,
      displayName: 'Egg Pilot',
      avatarColor: '#fbbf24',
      currentLevel: 1,
      unlockedLevels: 1,
      totalEggs: 0,
      unlockedCharacters: ['bird_1'],
      selectedCharacterId: 'bird_1'
    };
    await setDoc(doc(db, "users", uid), initialData);
    return initialData;
  },

  saveUserData: async (uid: string, data: Partial<UserData>) => {
    await setDoc(doc(db, "users", uid), data, { merge: true });
  }
};
