
import { UserProfile } from '../types';

const STORAGE_KEY = 'eggflap_user_data';

export const storageService = {
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  },

  async createUserProfile(email: string, uid: string): Promise<UserProfile> {
    const newProfile: UserProfile = {
      uid,
      email,
      currentLevel: 1,
      highestLevelUnlocked: 1,
      totalEggs: 0,
      unlockedCharacters: ['bird-1'],
      selectedCharacterId: 'bird-1'
    };
    await this.saveUserProfile(newProfile);
    return newProfile;
  },

  async updateProgress(uid: string, level: number, eggs: number): Promise<UserProfile | null> {
    const profile = await this.getUserProfile(uid);
    if (!profile) return null;

    profile.totalEggs += eggs;
    if (level >= profile.highestLevelUnlocked) {
      profile.highestLevelUnlocked = level + 1;
    }
    
    await this.saveUserProfile(profile);
    return profile;
  },

  async buyCharacter(uid: string, charId: string, cost: number): Promise<UserProfile | null> {
    const profile = await this.getUserProfile(uid);
    if (!profile || profile.totalEggs < cost) return null;

    profile.totalEggs -= cost;
    profile.unlockedCharacters.push(charId);
    await this.saveUserProfile(profile);
    return profile;
  },

  async selectCharacter(uid: string, charId: string): Promise<UserProfile | null> {
    const profile = await this.getUserProfile(uid);
    if (!profile) return null;

    profile.selectedCharacterId = charId;
    await this.saveUserProfile(profile);
    return profile;
  }
};
