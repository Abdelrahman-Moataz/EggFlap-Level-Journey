
import React from 'react';
import { ChevronRight, Lock, Check } from 'lucide-react';
import { UserProfile, LevelConfig } from '../types';

interface LevelMapProps {
  levels: LevelConfig[];
  user: UserProfile;
  onLevelSelect: (levelId: number) => void;
}

const LevelMap: React.FC<LevelMapProps> = ({ levels, user, onLevelSelect }) => {
  return (
    <div className="w-full max-w-md mx-auto h-full flex flex-col bg-sky-100 overflow-y-auto pb-24 no-scrollbar">
      <div className="p-8 text-center bg-sky-400 text-white rounded-b-3xl shadow-lg">
        <h2 className="text-3xl font-game">World Tour</h2>
        <p className="opacity-90">Progress to reach the Golden Nest</p>
      </div>

      <div className="relative flex flex-col items-center py-12 px-6 gap-16">
        {/* Winding Path Line */}
        <div className="absolute top-0 w-2 h-full bg-sky-200/50 -z-10" />

        {levels.map((lvl, index) => {
          const isUnlocked = lvl.id <= user.highestLevelUnlocked;
          const isCurrent = lvl.id === user.currentLevel;
          const isCompleted = lvl.id < user.highestLevelUnlocked;
          
          // S-curve layout logic
          const offset = Math.sin(index * 0.8) * 60;

          return (
            <button
              key={lvl.id}
              disabled={!isUnlocked}
              onClick={() => onLevelSelect(lvl.id)}
              className={`
                relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                ${isUnlocked ? 'scale-110 shadow-xl' : 'scale-90 opacity-60'}
                ${isCurrent ? 'ring-4 ring-yellow-400 ring-offset-4 animate-pulse' : ''}
              `}
              style={{ 
                transform: `translateX(${offset}px)`,
                backgroundColor: isUnlocked ? lvl.backgroundColor : '#CBD5E1'
              }}
            >
              {isCompleted ? (
                <Check className="text-white w-8 h-8" />
              ) : isUnlocked ? (
                <span className="text-white text-xl font-game">{lvl.id}</span>
              ) : (
                <Lock className="text-slate-500 w-6 h-6" />
              )}

              {/* Tooltip for current */}
              {isCurrent && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap shadow-md">
                   Play Now!
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LevelMap;
