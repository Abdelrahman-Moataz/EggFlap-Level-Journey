
import React, { useState, useEffect } from 'react';
import { Bird, Play, Map as MapIcon, ShoppingBag, LogOut, ChevronRight, Circle, Trophy } from 'lucide-react';
import { GameState, UserProfile, LevelConfig } from './types';
import { LEVELS, CHARACTERS } from './constants';
import { storageService } from './services/storageService';
import FlappyGame from './game/FlappyGame';
import LevelMap from './components/LevelMap';
import CharacterShop from './components/CharacterShop';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  // Initial Auth Check (Simulated Splash Screen)
  useEffect(() => {
    const timer = setTimeout(async () => {
      const savedUser = await storageService.getUserProfile('demo-user');
      if (savedUser) setUser(savedUser);
      setIsAuthLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    const profile = await storageService.createUserProfile(email, 'demo-user');
    setUser(profile);
  };

  const handleLogout = () => {
    setUser(null);
    setGameState(GameState.MENU);
  };

  const startLevel = (levelId: number) => {
    setGameState(GameState.PLAYING);
  };

  const onGameWin = async (eggs: number) => {
    if (!user) return;
    const currentLevel = user.currentLevel;
    const updated = await storageService.updateProgress(user.uid, currentLevel, eggs);
    if (updated) {
       setUser({ ...updated, currentLevel: Math.min(30, currentLevel + 1) });
    }
    setGameState(GameState.LEVEL_COMPLETE);
  };

  const onGameLose = () => {
    setGameState(GameState.GAMEOVER);
  };

  const buyCharacter = async (char: any) => {
    if (!user) return;
    const updated = await storageService.buyCharacter(user.uid, char.id, char.cost);
    if (updated) setUser(updated);
  };

  const selectCharacter = async (charId: string) => {
    if (!user) return;
    const updated = await storageService.selectCharacter(user.uid, charId);
    if (updated) setUser(updated);
  };

  if (isAuthLoading) {
    return (
      <div className="h-screen w-screen bg-sky-400 flex flex-col items-center justify-center text-white">
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl animate-bounce mb-8">
           <Bird className="w-16 h-16 text-sky-500" />
        </div>
        <h1 className="text-5xl font-game tracking-wider mb-2">EggFlap</h1>
        <p className="text-xl opacity-80 animate-pulse">Level Journey</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen w-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-indigo-600 p-8 text-center text-white">
             <div className="w-16 h-16 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-4">
                <Bird className="w-10 h-10" />
             </div>
             <h2 className="text-3xl font-game">Join the Flight</h2>
          </div>
          <form onSubmit={handleLogin} className="p-8 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="pilot@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
              <input 
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-indigo-500 outline-none" 
                placeholder="••••••••"
              />
            </div>
            <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95">
               Start Playing
            </button>
            <p className="text-center text-xs text-slate-400">Simulation Mode: Just type anything</p>
          </form>
        </div>
      </div>
    );
  }

  const currentLevelConfig = LEVELS[user.currentLevel - 1];
  const selectedChar = CHARACTERS.find(c => c.id === user.selectedCharacterId) || CHARACTERS[0];

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-slate-100">
      
      {/* Dynamic Views */}
      {gameState === GameState.MENU && (
        <div className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-b from-sky-400 to-sky-600 text-white">
          <div className="mb-12 text-center">
            <h1 className="text-6xl font-game mb-2 drop-shadow-lg">EggFlap</h1>
            <p className="opacity-80">Highest Level: {user.highestLevelUnlocked}</p>
          </div>

          <div className="grid gap-4 w-full max-w-xs">
            <button 
              onClick={() => setGameState(GameState.MAP)}
              className="group flex items-center justify-between p-6 bg-white text-sky-600 rounded-3xl font-bold text-xl shadow-2xl hover:bg-slate-50 transition-all active:scale-95"
            >
              <span>Play Journey</span>
              <Play className="w-8 h-8 fill-current group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => setGameState(GameState.SHOP)}
              className="flex items-center justify-between p-6 bg-indigo-500 text-white rounded-3xl font-bold text-xl shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
            >
              <span>The Aviary</span>
              <ShoppingBag className="w-8 h-8" />
            </button>

            <div className="flex gap-4">
              <div className="flex-1 bg-white/20 backdrop-blur-md p-4 rounded-2xl flex flex-col items-center">
                <Circle className="w-6 h-6 fill-yellow-400 text-yellow-500 mb-1" />
                <span className="font-bold">{user.totalEggs}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
              >
                <LogOut className="w-8 h-8" />
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.MAP && (
        <LevelMap 
          levels={LEVELS} 
          user={user} 
          onLevelSelect={(id) => {
            setUser({ ...user, currentLevel: id });
            setGameState(GameState.PLAYING);
          }} 
        />
      )}

      {gameState === GameState.PLAYING && (
        <FlappyGame 
          level={currentLevelConfig} 
          user={user} 
          character={selectedChar}
          onWin={onGameWin}
          onLose={onGameLose}
        />
      )}

      {gameState === GameState.GAMEOVER && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bird className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-4xl font-game text-slate-800 mb-2">Oh No!</h2>
            <p className="text-slate-500 mb-8">You hit a pipe. Don't give up, pilot!</p>
            <div className="grid gap-3">
              <button 
                onClick={() => setGameState(GameState.PLAYING)}
                className="w-full py-4 bg-sky-500 text-white font-bold rounded-2xl shadow-lg hover:bg-sky-600 transition-all"
              >
                Try Again
              </button>
              <button 
                onClick={() => setGameState(GameState.MAP)}
                className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
              >
                Back to Map
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.LEVEL_COMPLETE && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="bg-white rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-4xl font-game text-slate-800 mb-2">Success!</h2>
            <p className="text-slate-500 mb-6">Level {user.currentLevel - 1} Clear!</p>
            
            <div className="bg-yellow-50 p-4 rounded-2xl flex items-center justify-between mb-8">
               <span className="font-bold text-slate-700">Earnings:</span>
               <div className="flex items-center gap-1 text-yellow-600 font-game text-xl">
                 <Circle className="w-5 h-5 fill-yellow-400" />
                 +5
               </div>
            </div>

            <div className="grid gap-3">
              <button 
                onClick={() => setGameState(GameState.PLAYING)}
                className="w-full py-4 bg-sky-500 text-white font-bold rounded-2xl shadow-lg hover:bg-sky-600 transition-all flex items-center justify-center gap-2"
              >
                Next Level
                <ChevronRight className="w-6 h-6" />
              </button>
              <button 
                onClick={() => setGameState(GameState.MAP)}
                className="w-full py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all"
              >
                View Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === GameState.SHOP && (
        <CharacterShop 
          user={user} 
          onBuy={buyCharacter} 
          onSelect={selectCharacter} 
          onClose={() => setGameState(GameState.MENU)} 
        />
      )}

      {/* Persistent Navigation for Map/Shop (Bottom Bar) */}
      {(gameState === GameState.MAP || gameState === GameState.SHOP) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-xs bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl flex p-2 gap-2 z-40">
           <button 
             onClick={() => setGameState(GameState.MENU)}
             // Fix: Removed unreachable ternary check for GameState.MENU since we are inside a MAP || SHOP block
             className="flex-1 py-3 rounded-2xl flex flex-col items-center transition-all text-slate-500 hover:bg-white"
           >
              <Bird className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Menu</span>
           </button>
           <button 
             onClick={() => setGameState(GameState.MAP)}
             className={`flex-1 py-3 rounded-2xl flex flex-col items-center transition-all ${gameState === GameState.MAP ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
           >
              <MapIcon className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Map</span>
           </button>
           <button 
             onClick={() => setGameState(GameState.SHOP)}
             className={`flex-1 py-3 rounded-2xl flex flex-col items-center transition-all ${gameState === GameState.SHOP ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white'}`}
           >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-1">Shop</span>
           </button>
        </div>
      )}
    </div>
  );
};

export default App;
