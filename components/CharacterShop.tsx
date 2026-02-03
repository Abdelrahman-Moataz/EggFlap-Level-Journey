
import React from 'react';
// Fix: Removed Flame, Ghost, Zap, and Crown from lucide-react imports to avoid conflict with local declarations
import { Bird, Circle, Check } from 'lucide-react';
import { UserProfile, Character } from '../types';
import { CHARACTERS } from '../constants';

interface ShopProps {
  user: UserProfile;
  onBuy: (char: Character) => void;
  onSelect: (charId: string) => void;
  onClose: () => void;
}

const CharacterShop: React.FC<ShopProps> = ({ user, onBuy, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-game">The Aviary</h2>
            <div className="flex items-center gap-1 text-yellow-300 font-bold">
              <Circle className="w-4 h-4 fill-yellow-300" />
              {user.totalEggs} Eggs
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">Close</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {CHARACTERS.map(char => {
            const isUnlocked = user.unlockedCharacters.includes(char.id);
            const isSelected = user.selectedCharacterId === char.id;
            const canAfford = user.totalEggs >= char.cost;

            return (
              <div 
                key={char.id}
                className={`
                  p-4 rounded-2xl border-2 flex items-center justify-between transition-all
                  ${isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-slate-100'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: char.color }}
                  >
                    {char.iconName === 'Bird' && <Bird />}
                    {char.iconName === 'Flame' && <Flame />}
                    {char.iconName === 'Ghost' && <Ghost />}
                    {char.iconName === 'Zap' && <Zap />}
                    {char.iconName === 'Crown' && <Crown />}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{char.name}</h3>
                    {!isUnlocked && (
                      <div className="text-sm text-slate-500 flex items-center gap-1">
                        <Circle className="w-3 h-3 fill-yellow-400 text-yellow-500" />
                        {char.cost}
                      </div>
                    )}
                  </div>
                </div>

                {isUnlocked ? (
                  isSelected ? (
                    <div className="text-indigo-600 flex items-center gap-1 font-bold">
                      <Check className="w-5 h-5" />
                      Active
                    </div>
                  ) : (
                    <button 
                      onClick={() => onSelect(char.id)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl font-bold transition-colors"
                    >
                      Use
                    </button>
                  )
                ) : (
                  <button 
                    disabled={!canAfford}
                    onClick={() => onBuy(char)}
                    className={`
                      px-4 py-2 rounded-xl font-bold transition-all
                      ${canAfford ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                    `}
                  >
                    Unlock
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Reuse custom icons
const Flame = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.5 3.5 6.5 1 1.5 1 2.5 1 3.5a5 5 0 1 1-10 0c0-1.5 1.5-3.5 1.5-3.5s-.5 2 0 3.5Z"/></svg>
);
const Ghost = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>
);
const Zap = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
const Crown = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
);

export default CharacterShop;
