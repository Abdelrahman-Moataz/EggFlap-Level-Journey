
import { UserData, Character } from '../types';
import { CHARACTERS } from '../constants';

const STORAGE_KEY_USER = 'eggquest_user';
const STORAGE_KEY_AUTH = 'eggquest_auth';

export const mockAuth = {
  getCurrentUser: (): { email: string; uid: string } | null => {
    const auth = localStorage.getItem(STORAGE_KEY_AUTH);
    return auth ? JSON.parse(auth) : null;
  },
  login: (email: string) => {
    const uid = btoa(email);
    const user = { email, uid };
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(user));
    return user;
  },
  logout: () => {
    localStorage.removeItem(STORAGE_KEY_AUTH);
  }
};

export const mockFirestore = {
  getUserData: (uid: string): UserData => {
    const data = localStorage.getItem(`${STORAGE_KEY_USER}_${uid}`);
    if (data) return JSON.parse(data);
    
    // Fix: Added missing displayName and avatarColor to match UserData interface
    const initialData: UserData = {
      uid,
      email: '',
      displayName: 'Egg Pilot',
      avatarColor: '#fbbf24',
      currentLevel: 1,
      unlockedLevels: 1,
      totalEggs: 0,
      unlockedCharacters: ['bird_1'],
      selectedCharacterId: 'bird_1'
    };
    localStorage.setItem(`${STORAGE_KEY_USER}_${uid}`, JSON.stringify(initialData));
    return initialData;
  },
  saveUserData: (data: UserData) => {
    localStorage.setItem(`${STORAGE_KEY_USER}_${data.uid}`, JSON.stringify(data));
  }
};
