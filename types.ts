
export interface UserProfile {
  uid: string;
  email: string;
  currentLevel: number;
  highestLevelUnlocked: number;
  totalEggs: number;
  unlockedCharacters: string[];
  selectedCharacterId: string;
}

export interface Character {
  id: string;
  name: string;
  iconName: string;
  color: string;
  cost: number;
}

export interface LevelConfig {
  id: number;
  backgroundColor: string;
  pipeColor: string;
  speed: number;
  gapSize: number;
  pipeFrequency: number;
  eggsToSpawn: number;
}

export enum GameState {
  MENU,
  MAP,
  PLAYING,
  GAMEOVER,
  SHOP,
  LEVEL_COMPLETE
}
