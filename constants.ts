
import { Character, LevelConfig } from './types';

export const TOTAL_LEVELS = 30;

export const CHARACTERS: Character[] = [
  { id: 'bird_1', name: 'Original', color: '#fbbf24', price: 0, iconName: 'Bird' },
  { id: 'bird_2', name: 'Bluey', color: '#60a5fa', price: 50, iconName: 'Bird' },
  { id: 'bird_3', name: 'Rosie', color: '#f472b6', price: 150, iconName: 'Bird' },
  { id: 'bird_4', name: 'Emerald', color: '#34d399', price: 300, iconName: 'Bird' },
  { id: 'bird_5', name: 'Shadow', color: '#4b5563', price: 500, iconName: 'Bird' },
];

const BG_COLORS = [
  '#0ea5e9', '#38bdf8', '#0284c7', // Blues
  '#f59e0b', '#fbbf24', '#d97706', // Yellows
  '#10b981', '#34d399', '#059669', // Greens
  '#8b5cf6', '#a78bfa', '#7c3aed', // Purples
];

const PIPE_COLORS = [
  '#166534', '#15803d', '#14532d', // Deep greens
  '#9a3412', '#c2410c', '#7c2d12', // Rust reds
  '#1e3a8a', '#1e40af', '#172554', // Deep blues
];

export const generateLevels = (): LevelConfig[] => {
  return Array.from({ length: TOTAL_LEVELS }, (_, i) => {
    const levelNum = i + 1;
    // Difficulty curve
    const speed = 3 + (levelNum * 0.15); // Starts at 3.15, ends at 7.5
    const gapSize = Math.max(160, 260 - (levelNum * 3.5)); // Starts at 256.5, ends at 155
    const pipesToPass = 5 + Math.floor(levelNum / 2); // 5 to 20 pipes
    
    return {
      id: levelNum,
      bgColor: BG_COLORS[i % BG_COLORS.length],
      pipeColor: PIPE_COLORS[i % PIPE_COLORS.length],
      speed,
      gapSize,
      pipesToPass,
      eggProbability: 0.3 + (levelNum * 0.01), // Increases slightly
    };
  });
};

export const LEVELS = generateLevels();
