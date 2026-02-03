
import { initializeApp, getApp, getApps, FirebaseApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc,
  Firestore
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

const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

const LOCAL_STORAGE_KEY_PREFIX = 'eggquest_user_cache_';

const getLocalData = (uid: string): UserData | null => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY_PREFIX + uid);
  return data ? JSON.parse(data) : null;
};

const saveLocalData = (uid: string, data: Partial<UserData>) => {
  const existing = getLocalData(uid) || {} as UserData;
  const updated = { ...existing, ...data };
  localStorage.setItem(LOCAL_STORAGE_KEY_PREFIX + uid, JSON.stringify(updated));
};

export const authService = {
  onStateChanged: (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },
  
  loginOrRegister: async (email: string, pass: string) => {
    const cleanEmail = email.trim();
    try {
      const result = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
      return result.user;
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        const loginResult = await signInWithEmailAndPassword(auth, cleanEmail, pass);
        return loginResult.user;
      }
      throw error;
    }
  },

  logout: () => signOut(auth)
};

export const firestoreService = {
  getUserData: async (uid: string): Promise<UserData | null> => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data() as UserData;
        saveLocalData(uid, data);
        console.log("✅ Successfully retrieved user data from Firestore for UID:", uid);
        return data;
      }
    } catch (err: any) {
      console.warn("⚠️ Firestore retrieval failed. Falling back to local storage. Error:", err.message);
    }
    return getLocalData(uid);
  },

  initUserData: async (uid: string, email: string): Promise<UserData> => {
    const initialData: UserData = {
      uid,
      email,
      displayName: "Egg Pilot",
      avatarColor: "#fbbf24",
      currentLevel: 1,
      unlockedLevels: 1,
      totalEggs: 0,
      unlockedCharacters: ['bird_1'],
      selectedCharacterId: 'bird_1'
    };

    saveLocalData(uid, initialData);

    try {
      await setDoc(doc(db, "users", uid), initialData);
      console.log("✅ User document initialized in Firestore.");
    } catch (err: any) {
      console.error("❌ Critical: User initialization failed in cloud. Check Rules!", err.message);
    }
    
    return initialData;
  },

  saveUserData: async (uid: string, data: Partial<UserData>): Promise<void> => {
    saveLocalData(uid, data);
    try {
      await setDoc(doc(db, "users", uid), data, { merge: true });
      console.log("✅ Cloud Sync Successful:", Object.keys(data).join(", "));
    } catch (err: any) {
      console.error("❌ Cloud Sync Failed. Check security rules or connection.", err.message);
      throw err;
    }
  }
};
