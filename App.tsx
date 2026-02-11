
import React, { useState, useEffect } from 'react';
import { 
  Bird as BirdIcon, 
  Map as MapIcon, 
  ShoppingBag, 
  User as UserIcon, 
  Lock, 
  Egg as EggIcon,
  ChevronLeft,
  LogOut,
  Save,
  CheckCircle2,
  Cloud,
  CloudUpload,
  RefreshCw,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { UserData, ScreenType } from './types';
import { CHARACTERS, LEVELS, TOTAL_LEVELS } from './constants';
import { authService, firestoreService } from './services/firebase';
import { Button } from './components/Button';
import { GameView } from './components/GameView';
import { GoogleGenAI } from "@google/genai";

const AVATAR_COLORS = [
  '#fbbf24', '#f87171', '#60a5fa', '#34d399', '#a78bfa', '#f472b6', '#fb923c', '#94a3b8'
];

const App: React.FC = () => {
  const [screen, setScreen] = useState<ScreenType>(ScreenType.SPLASH);
  const [user, setUser] = useState<UserData | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  
  // AI State for providing player motivation
  const [aiTip, setAiTip] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Profile Edit State
  const [tempName, setTempName] = useState('');
  const [tempColor, setTempColor] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    // Hide the static loading screen from index.html once React mounts
    const staticLoader = document.getElementById('loading-screen');
    if (staticLoader) staticLoader.style.display = 'none';

    let isMounted = true;
    
    // Auth Listener
    const unsubscribe = authService.onStateChanged(async (fbUser) => {
      if (!isMounted) return;
      
      if (fbUser) {
        try {
          let userData = await firestoreService.getUserData(fbUser.uid);
          if (!userData && isMounted) {
            userData = await firestoreService.initUserData(fbUser.uid, fbUser.email || '');
          }
          if (isMounted && userData) {
            setUser(userData);
            setScreen(ScreenType.LEVEL_MAP);
          }
        } catch (err: any) {
          console.error("Initialization Error:", err);
          if (isMounted) setInitializationError(`Sync Failed: ${err.message}`);
        } finally {
          if (isMounted) setIsAuthChecking(false);
        }
      } else {
        if (isMounted) {
          setUser(null);
          setScreen(ScreenType.AUTH);
          setIsAuthChecking(false);
        }
      }
    });

    return () => { 
      isMounted = false; 
      unsubscribe(); 
    };
  }, []);

  // Fetch AI Tip when reaching the map screen to encourage the player
  useEffect(() => {
    if (user && screen === ScreenType.LEVEL_MAP && !aiTip && !isAiLoading) {
      const fetchAiTip = async () => {
        setIsAiLoading(true);
        try {
          // Create a new instance right before use as per best practices
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Give a short, punchy, 1-sentence encouraging advice for a pilot in a game called Egg Quest. They are currently at level ${user.unlockedLevels}. Be creative, friendly, and use bird or egg puns occasionally.`,
            config: {
                temperature: 0.8,
                maxOutputTokens: 50
            }
          });
          setAiTip(response.text || "Fly high and keep your eggs safe!");
        } catch (err) {
          console.error("Gemini API Error:", err);
          setAiTip("Gravity is just a suggestion. Keep flapping!");
        } finally {
          setIsAiLoading(false);
        }
      };
      fetchAiTip();
    }
  }, [user, screen, aiTip, isAiLoading]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setAuthError(null);
    try {
      await authService.loginOrRegister(email, password);
    } catch (err: any) {
      setAuthError(err.message || "Auth error occurred.");
      setIsLoading(false);
    }
  };

  const updateUserData = async (updated: Partial<UserData>) => {
    if (!user) return;
    setIsSyncing(true);
    setUser(prev => prev ? { ...prev, ...updated } : null);
    try {
      await firestoreService.saveUserData(user.uid, updated);
    } catch (err) {
      console.error("Cloud sync failed:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    await updateUserData({ displayName: tempName, avatarColor: tempColor });
    setTimeout(() => {
      setIsSavingProfile(false);
      setScreen(ScreenType.LEVEL_MAP);
    }, 800);
  };

  const onLevelWin = async (eggsCollected: number) => {
    if (!user) return;
    
    setIsSyncing(true);
    const nextLvlNum = user.unlockedLevels + 1;
    const unlockedLevels = Math.max(user.unlockedLevels, nextLvlNum);
    const updates = {
      totalEggs: user.totalEggs + eggsCollected,
      unlockedLevels: unlockedLevels,
      currentLevel: nextLvlNum > TOTAL_LEVELS ? TOTAL_LEVELS : nextLvlNum
    };

    setUser(prev => prev ? { ...prev, ...updates } : null);
    try {
      await firestoreService.saveUserData(user.uid, updates);
    } finally {
      setIsSyncing(false);
    }

    // Reset AI tip for the new level context
    setAiTip("");

    setTimeout(() => setScreen(ScreenType.LEVEL_MAP), 1500);
  };

  // UI - SPLASH/LOADING
  if (isAuthChecking) {
    return (
      <div className="h-screen w-full bg-sky-500 flex flex-col items-center justify-center p-8 overflow-hidden">
        <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center shadow-2xl animate-bounce-subtle border-4 border-white/50">
          <BirdIcon size={64} className="text-yellow-900" />
        </div>
        <h1 className="mt-8 text-white font-game text-7xl text-center leading-tight drop-shadow-lg">EGG<br/>QUEST</h1>
        
        {initializationError ? (
          <div className="mt-10 bg-red-500/20 p-6 rounded-3xl border border-red-500/30 max-w-xs text-center">
            <AlertTriangle className="text-red-300 mx-auto mb-2" />
            <p className="text-white text-xs font-bold uppercase tracking-widest">{initializationError}</p>
            <button onClick={() => window.location.reload()} className="mt-4 bg-white text-sky-600 px-6 py-2 rounded-xl font-game text-sm shadow-xl">RETRY</button>
          </div>
        ) : (
          <div className="mt-12 flex flex-col items-center gap-3">
            <RefreshCw className="text-white/60 animate-spin" size={24} />
            <p className="text-white/60 font-bold text-[10px] uppercase tracking-[0.3em]">Connecting to Cloud</p>
          </div>
        )}
      </div>
    );
  }

  // UI - AUTH
  if (screen === ScreenType.AUTH) {
    return (
      <div className="h-screen w-full bg-slate-50 flex flex-col p-6 items-center justify-center">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 border-b-8 border-slate-200">
          <h2 className="font-game text-4xl text-slate-800 mb-6 text-center">Join Quest</h2>
          <form onSubmit={handleAuth} className="space-y-4">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" placeholder="Email" required />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold" placeholder="Password" required />
            {authError && <p className="text-red-500 text-xs font-bold text-center bg-red-50 p-3 rounded-xl">{authError}</p>}
            <Button onClick={() => {}} className="w-full py-5 text-2xl" disabled={isLoading}>{isLoading ? 'LOADING...' : 'START'}</Button>
          </form>
        </div>
      </div>
    );
  }

  // UI - MAP
  if (screen === ScreenType.LEVEL_MAP && user) {
    return (
      <div className="h-screen w-full bg-slate-100 flex flex-col overflow-hidden relative">
        <div className="bg-white/90 backdrop-blur-md border-b-4 border-slate-200 p-4 flex justify-between items-center z-20 sticky top-0">
          <div className="flex items-center gap-3">
            <button onClick={() => { setTempName(user.displayName); setTempColor(user.avatarColor); setScreen(ScreenType.PROFILE); }} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center border-b-4 border-black/10 shadow-lg" style={{ backgroundColor: user.avatarColor }}>
                <BirdIcon size={24} className="text-white" />
              </div>
              <div className="text-left">
                <p className="font-game text-slate-800 text-lg leading-none">{user.displayName}</p>
                <div className="flex items-center gap-2">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Level {user.unlockedLevels}</p>
                   {isSyncing ? <RefreshCw size={10} className="text-sky-500 animate-spin" /> : <Cloud size={10} className="text-emerald-500" />}
                </div>
              </div>
            </button>
          </div>
          <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-2xl border-2 border-yellow-200">
            <EggIcon className="text-yellow-500 w-5 h-5 fill-yellow-400" />
            <span className="font-game text-yellow-800 text-xl leading-none">{user.totalEggs}</span>
          </div>
        </div>

        {/* Gemini AI Tip Box - Dynamic Motivation */}
        {aiTip && (
          <div className="mx-6 mt-4 p-4 bg-white rounded-2xl border-b-4 border-slate-200 shadow-md flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="bg-sky-100 p-2 rounded-xl">
               <Sparkles className="text-sky-500 w-5 h-5" />
             </div>
             <p className="text-slate-600 text-xs font-medium italic leading-relaxed">
               "{aiTip}"
             </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8 flex flex-col-reverse items-center gap-16 pb-32">
          {LEVELS.map((level, idx) => {
            const isUnlocked = level.id <= user.unlockedLevels;
            const isCurrent = level.id === user.unlockedLevels;
            const offset = (Math.sin(idx * 0.8) * 60);
            return (
              <div key={level.id} className="relative" style={{ transform: `translateX(${offset}px)` }}>
                <button
                  disabled={!isUnlocked}
                  onClick={() => { updateUserData({ currentLevel: level.id }); setScreen(ScreenType.GAME); }}
                  className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center transition-all ${isUnlocked ? 'shadow-[0_8px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-[8px]' : 'opacity-40 grayscale'} ${isCurrent ? 'bg-sky-500 border-4 border-white animate-bounce-subtle' : isUnlocked ? 'bg-emerald-500 border-4 border-white' : 'bg-slate-400 border-4 border-slate-300'}`}
                >
                  {isUnlocked ? <span className="text-white font-game text-3xl">{level.id}</span> : <Lock className="text-white/50" size={28} />}
                </button>
              </div>
            );
          })}
        </div>

        <div className="bg-white border-t-4 border-slate-200 p-4 flex justify-around items-center sticky bottom-0 z-50">
          <button className="flex flex-col items-center gap-1 text-sky-600"><MapIcon size={24} /><span className="text-[10px] font-bold uppercase tracking-widest">Map</span></button>
          <button onClick={() => setScreen(ScreenType.SHOP)} className="flex flex-col items-center gap-1 text-slate-400"><ShoppingBag size={24} /><span className="text-[10px] font-bold uppercase tracking-widest">Shop</span></button>
          <button onClick={() => authService.logout()} className="flex flex-col items-center gap-1 text-slate-400"><LogOut size={24} /><span className="text-[10px] font-bold uppercase tracking-widest">Exit</span></button>
        </div>
      </div>
    );
  }

  // UI - PROFILE
  if (screen === ScreenType.PROFILE && user) {
    return (
      <div className="h-screen w-full bg-white flex flex-col">
        <div className="p-6 border-b-4 border-slate-100 flex items-center justify-between">
          <button onClick={() => setScreen(ScreenType.LEVEL_MAP)} className="p-3 bg-slate-100 rounded-2xl"><ChevronLeft size={24} /></button>
          <h2 className="font-game text-3xl">Profile</h2>
          <div className="w-12"></div>
        </div>
        <div className="flex-1 p-8 space-y-8 overflow-y-auto text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-32 h-32 rounded-[2.5rem] flex items-center justify-center border-b-8 border-black/10 shadow-2xl" style={{ backgroundColor: tempColor }}>
              <BirdIcon size={64} className="text-white" />
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Pilot Avatar</p>
          </div>
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Pilot Name</label>
            <input type="text" value={tempName} onChange={e => setTempName(e.target.value)} className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] font-bold text-xl" maxLength={15} />
          </div>
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block text-left ml-1">Signature Color</label>
            <div className="grid grid-cols-4 gap-3">
              {AVATAR_COLORS.map(c => (
                <button key={c} onClick={() => setTempColor(c)} className={`aspect-square rounded-2xl border-4 transition-all ${tempColor === c ? 'border-sky-400 scale-110 shadow-lg' : 'border-transparent'}`} style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
          <Button onClick={handleSaveProfile} className="w-full py-5 text-2xl flex items-center justify-center gap-3" disabled={isSavingProfile}>
            {isSavingProfile ? <CheckCircle2 className="animate-bounce" /> : <Save />}
            {isSavingProfile ? 'SAVED!' : 'SAVE CHANGES'}
          </Button>
        </div>
      </div>
    );
  }

  // UI - SHOP
  if (screen === ScreenType.SHOP && user) {
    return (
      <div className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden">
        <div className="bg-white border-b-4 border-slate-200 p-6 flex items-center justify-between sticky top-0 z-10">
          <button onClick={() => setScreen(ScreenType.LEVEL_MAP)} className="p-3 bg-slate-100 rounded-2xl"><ChevronLeft size={24} /></button>
          <h2 className="font-game text-3xl">Shop</h2>
          <div className="flex items-center gap-2 bg-yellow-100 px-5 py-2 rounded-2xl border-2 border-yellow-200">
            <EggIcon className="text-yellow-500 w-6 h-6 fill-yellow-400" />
            <span className="font-game text-yellow-800 text-2xl leading-none">{user.totalEggs}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {CHARACTERS.map(char => {
            const isUnlocked = user.unlockedCharacters.includes(char.id);
            const isSelected = user.selectedCharacterId === char.id;
            const canAfford = user.totalEggs >= char.price;
            return (
              <div key={char.id} className={`bg-white rounded-[2rem] p-6 shadow-xl border-b-8 transition-all ${isSelected ? 'border-sky-500 bg-sky-50' : 'border-slate-200'}`}>
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-3xl flex items-center justify-center border-2 border-slate-50" style={{ color: char.color }}><BirdIcon size={48} /></div>
                  <div className="flex-1 text-left"><h3 className="font-game text-2xl text-slate-800">{char.name}</h3></div>
                  <div>
                    {isUnlocked ? (
                      <button onClick={() => updateUserData({ selectedCharacterId: char.id })} disabled={isSelected} className={`px-6 py-3 rounded-2xl font-game ${isSelected ? 'text-sky-500 bg-white' : 'bg-sky-500 text-white'}`}>{isSelected ? 'ACTIVE' : 'SELECT'}</button>
                    ) : (
                      <button onClick={() => {
                        if (canAfford) {
                          updateUserData({ 
                            totalEggs: user.totalEggs - char.price, 
                            unlockedCharacters: [...user.unlockedCharacters, char.id] 
                          });
                        }
                      }} disabled={!canAfford} className={`px-6 py-3 rounded-2xl font-game flex items-center gap-2 ${canAfford ? 'bg-yellow-400' : 'bg-slate-200 text-slate-400'}`}><EggIcon size={16}/> {char.price}</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // UI - GAME
  if (screen === ScreenType.GAME && user) {
    const currentLevel = LEVELS.find(l => l.id === user.currentLevel) || LEVELS[0];
    const currentChar = CHARACTERS.find(c => c.id === user.selectedCharacterId) || CHARACTERS[0];
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center overflow-hidden">
        <GameView 
          level={currentLevel}
          character={currentChar}
          onWin={onLevelWin}
          onLose={() => {}}
          onExit={() => setScreen(ScreenType.LEVEL_MAP)}
        />
      </div>
    );
  }
  return null;
};

export default App;
