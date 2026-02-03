
import { Character, LevelConfig } from './types';

export const BIRD_SIZE = 36;
export const GRAVITY = 0.6;
export const JUMP_FORCE = -8;
export const PIPE_WIDTH = 60;

export const CHARACTERS: Character[] = [
  { id: 'bird-1', name: 'Original Blue', iconName: 'Bird', color: '#60A5FA', cost: 0 },
  { id: 'bird-2', name: 'Fire Phoenix', iconName: 'Flame', color: '#F87171', cost: 50 },
  { id: 'bird-3', name: 'Ghost Flyer', iconName: 'Ghost', color: '#E5E7EB', cost: 150 },
  { id: 'bird-4', name: 'Emerald Wing', iconName: 'Zap', color: '#34D399', cost: 300 },
  { id: 'bird-5', name: 'Golden King', iconName: 'Crown', color: '#FBBF24', cost: 1000 },
];

export const generateLevels = (): LevelConfig[] => {
  const levels: LevelConfig[] = [];
  const baseColors = ['#87CEEB', '#98FB98', '#FFB6C1', '#DDA0DD', '#F0E68C'];
  const pipeColors = ['#228B22', '#556B2F', '#8B4513', '#483D8B', '#2F4F4F'];

  for (let i = 1; i <= 30; i++) {
    const difficultyFactor = i / 30;
    levels.push({
      id: i,
      backgroundColor: baseColors[i % baseColors.length],
      pipeColor: pipeColors[i % pipeColors.length],
      speed: 2 + (difficultyFactor * 3.5),
      gapSize: 180 - (difficultyFactor * 60),
      pipeFrequency: 1800 - (difficultyFactor * 600),
      eggsToSpawn: 2 + Math.floor(i / 5),
    });
  }
  return levels;
};

export const LEVELS = generateLevels();
