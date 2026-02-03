
export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  avatarColor: string;
  currentLevel: number;
  unlockedLevels: number;
  totalEggs: number;
  unlockedCharacters: string[];
  selectedCharacterId: string;
}

export interface Character {
  id: string;
  name: string;
  color: string;
  price: number;
  iconName: string;
}

export interface LevelConfig {
  id: number;
  bgColor: string;
  pipeColor: string;
  speed: number;
  gapSize: number;
  pipesToPass: number;
  eggProbability: number;
}

export enum ScreenType {
  SPLASH = 'SPLASH',
  AUTH = 'AUTH',
  MAIN_MENU = 'MAIN_MENU',
  LEVEL_MAP = 'LEVEL_MAP',
  GAME = 'GAME',
  SHOP = 'SHOP',
  PROFILE = 'PROFILE'
}

export interface PipeData {
  x: number;
  topHeight: number;
  passed: boolean;
  hasEgg: boolean;
  eggY: number;
  eggCollected: boolean;
}
