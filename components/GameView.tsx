
import React, { useEffect, useRef, useState } from 'react';
import { Bird as BirdIcon, Egg as EggIcon, PlayCircle, RotateCcw, XCircle } from 'lucide-react';
import { LevelConfig, PipeData, Character } from '../types';

interface GameViewProps {
  level: LevelConfig;
  character: Character;
  onWin: (eggsCollected: number) => void;
  onLose: () => void;
  onExit: () => void;
}

export const GameView: React.FC<GameViewProps> = ({ level, character, onWin, onLose, onExit }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING' | 'GAMEOVER' | 'WIN'>('IDLE');
  const [score, setScore] = useState(0);
  // We use a ref for logic and a state for the UI/callback to ensure we never have stale data
  const [eggsDisplay, setEggsDisplay] = useState(0);
  const eggsCollectedRef = useRef(0);
  const [isShaking, setIsShaking] = useState(false);
  
  // Refs to avoid stale closures in the animation loop
  const gameStateRef = useRef<'IDLE' | 'PLAYING' | 'GAMEOVER' | 'WIN'>('IDLE');
  const levelRef = useRef(level);
  const charRef = useRef(character);
  const birdY = useRef(300);
  const birdVelocity = useRef(0);
  const pipes = useRef<PipeData[]>([]);
  const requestRef = useRef<number | undefined>(undefined);
  const birdHitTime = useRef<number>(0);
  const stars = useRef<{x: number, y: number, size: number, speed: number}[]>([]);

  // Physics Constants
  const GRAVITY = 0.55; 
  const JUMP_FORCE = -8.5;
  const TERMINAL_VELOCITY = 10;
  const PIPE_WIDTH = 70;
  const BIRD_SIZE = 36;
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;

  // Keep refs in sync with props
  useEffect(() => {
    levelRef.current = level;
    charRef.current = character;
  }, [level, character]);

  useEffect(() => {
    stars.current = Array.from({ length: 30 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * CANVAS_HEIGHT,
      size: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.2
    }));
    
    initGame();
    requestRef.current = requestAnimationFrame(update);
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const initGame = () => {
    birdY.current = 250;
    birdVelocity.current = 0;
    birdHitTime.current = 0;
    setScore(0);
    eggsCollectedRef.current = 0;
    setEggsDisplay(0);
    setGameState('IDLE');
    gameStateRef.current = 'IDLE';
    setIsShaking(false);
    pipes.current = [];
    spawnPipe(CANVAS_WIDTH + 100);
  };

  const spawnPipe = (x: number) => {
    const minHeight = 80;
    const maxHeight = CANVAS_HEIGHT - levelRef.current.gapSize - minHeight - 50; 
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
    const hasEgg = Math.random() < levelRef.current.eggProbability;
    const eggY = topHeight + (levelRef.current.gapSize / 2);

    pipes.current.push({
      x,
      topHeight,
      passed: false,
      hasEgg,
      eggY,
      eggCollected: false
    });
  };

  const triggerGameOver = () => {
    if (gameStateRef.current === 'GAMEOVER') return;
    setGameState('GAMEOVER');
    gameStateRef.current = 'GAMEOVER';
    setIsShaking(true);
    birdHitTime.current = performance.now();
    onLose();
    setTimeout(() => setIsShaking(false), 500);
  };

  const jump = (e?: React.PointerEvent) => {
    if (e) e.preventDefault();
    
    if (gameStateRef.current === 'IDLE') {
      setGameState('PLAYING');
      gameStateRef.current = 'PLAYING';
      birdVelocity.current = JUMP_FORCE;
    } else if (gameStateRef.current === 'PLAYING') {
      birdVelocity.current = JUMP_FORCE;
    }
  };

  const update = (time: number) => {
    const currentState = gameStateRef.current;
    const currentLevel = levelRef.current;

    if (currentState === 'PLAYING') {
      // Parallax Stars
      stars.current.forEach(star => {
        star.x -= star.speed;
        if (star.x < 0) star.x = CANVAS_WIDTH;
      });

      // Update Physics
      birdVelocity.current += GRAVITY;
      if (birdVelocity.current > TERMINAL_VELOCITY) birdVelocity.current = TERMINAL_VELOCITY;
      birdY.current += birdVelocity.current;

      // Ground collision
      if (birdY.current > CANVAS_HEIGHT - BIRD_SIZE - 20) {
        triggerGameOver();
      }
      
      // Ceiling check
      if (birdY.current < 0) {
        birdY.current = 0;
        birdVelocity.current = 0;
      }

      // Pipe Logic
      pipes.current.forEach(pipe => {
        pipe.x -= currentLevel.speed;

        // Collision detection
        const birdRect = {
          left: 100 + 4,
          right: 100 + BIRD_SIZE - 4,
          top: birdY.current + 4,
          bottom: birdY.current + BIRD_SIZE - 4
        };

        if (birdRect.right > pipe.x && birdRect.left < pipe.x + PIPE_WIDTH) {
          if (birdRect.top < pipe.topHeight || birdRect.bottom > pipe.topHeight + currentLevel.gapSize) {
            triggerGameOver();
          }
        }

        // Egg collection
        if (pipe.hasEgg && !pipe.eggCollected) {
          const eggX = pipe.x + PIPE_WIDTH / 2;
          const dist = Math.hypot(eggX - (100 + BIRD_SIZE/2), pipe.eggY - (birdY.current + BIRD_SIZE/2));
          if (dist < 30) {
            pipe.eggCollected = true;
            eggsCollectedRef.current += 1;
            setEggsDisplay(eggsCollectedRef.current);
          }
        }

        // Score logic
        if (!pipe.passed && pipe.x + PIPE_WIDTH < 100) {
          pipe.passed = true;
          setScore(prev => {
            const nextScore = prev + 1;
            if (nextScore >= currentLevel.pipesToPass) {
              setGameState('WIN');
              gameStateRef.current = 'WIN';
              // Use the ref value here to avoid stale state from the frame closure
              const finalEggs = eggsCollectedRef.current;
              setTimeout(() => onWin(finalEggs), 1200);
            }
            return nextScore;
          });
        }
      });

      // Pipe recycling
      if (pipes.current.length > 0 && pipes.current[0].x < -PIPE_WIDTH) {
        pipes.current.shift();
      }
      
      const lastPipe = pipes.current[pipes.current.length - 1];
      if (lastPipe && lastPipe.x < CANVAS_WIDTH - 200) {
        if (pipes.current.length + score < currentLevel.pipesToPass) {
          spawnPipe(CANVAS_WIDTH + 50);
        }
      }
    } else if (currentState === 'GAMEOVER') {
        if (birdY.current < CANVAS_HEIGHT - BIRD_SIZE - 20) {
            birdVelocity.current += GRAVITY;
            birdY.current += birdVelocity.current;
        }
    }
    
    draw();
    requestRef.current = requestAnimationFrame(update);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, levelRef.current.bgColor);
    gradient.addColorStop(1, '#00000033');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Stars
    ctx.fillStyle = '#ffffff88';
    stars.current.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Pipes
    pipes.current.forEach(pipe => {
      ctx.fillStyle = levelRef.current.pipeColor;
      ctx.strokeStyle = '#00000044';
      ctx.lineWidth = 3;

      // Top pipe
      ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.topHeight);
      ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, PIPE_WIDTH + 10, 20);
      ctx.strokeRect(pipe.x - 5, pipe.topHeight - 20, PIPE_WIDTH + 10, 20);
      
      // Bottom pipe
      const bottomY = pipe.topHeight + levelRef.current.gapSize;
      ctx.fillRect(pipe.x, bottomY, PIPE_WIDTH, CANVAS_HEIGHT - bottomY);
      ctx.strokeRect(pipe.x, bottomY, PIPE_WIDTH, CANVAS_HEIGHT - bottomY);
      ctx.fillRect(pipe.x - 5, bottomY, PIPE_WIDTH + 10, 20);
      ctx.strokeRect(pipe.x - 5, bottomY, PIPE_WIDTH + 10, 20);

      if (pipe.hasEgg && !pipe.eggCollected) {
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.ellipse(pipe.x + PIPE_WIDTH/2, pipe.eggY, 14, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    // Ground
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(0, CANVAS_HEIGHT - 20, CANVAS_WIDTH, 20);

    // Bird
    const now = performance.now();
    const timeSinceHit = birdHitTime.current > 0 ? now - birdHitTime.current : 0;
    let birdShakeX = 0;
    let birdShakeY = 0;
    let birdScale = 1;

    if (timeSinceHit > 0 && timeSinceHit < 400) {
      const intensity = 6 * (1 - timeSinceHit / 400);
      birdShakeX = (Math.random() - 0.5) * intensity;
      birdShakeY = (Math.random() - 0.5) * intensity;
      birdScale = 1 + Math.sin((timeSinceHit / 400) * Math.PI) * 0.2;
    }

    ctx.save();
    ctx.translate(100 + BIRD_SIZE/2 + birdShakeX, birdY.current + BIRD_SIZE/2 + birdShakeY);
    ctx.scale(birdScale, birdScale);
    
    let rotation = Math.min(Math.PI / 3, Math.max(-Math.PI / 4, birdVelocity.current * 0.08));
    if (gameStateRef.current === 'GAMEOVER') rotation = Math.PI / 2; 
    
    ctx.rotate(rotation);
    
    ctx.fillStyle = charRef.current.color;
    ctx.beginPath();
    ctx.arc(0, 0, BIRD_SIZE/2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Eyes
    if (gameStateRef.current === 'GAMEOVER') {
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(6, -10); ctx.lineTo(14, -2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(14, -10); ctx.lineTo(6, -2); ctx.stroke();
    } else {
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(10, -6, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath(); ctx.arc(12, -6, 2.5, 0, Math.PI * 2); ctx.fill();
    }

    // Beak
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.moveTo(14, 0); ctx.lineTo(26, 4); ctx.lineTo(14, 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  };

  return (
    <div 
      className={`relative w-full h-full flex flex-col items-center justify-center overflow-hidden touch-none select-none ${isShaking ? 'animate-[shake_0.5s_ease-in-out]' : ''}`} 
      onPointerDown={jump}
    >
        <style>{`
            @keyframes shake {
                0%, 100% { transform: translate(0, 0); }
                10%, 30%, 50%, 70%, 90% { transform: translate(-4px, 0); }
                20%, 40%, 60%, 80% { transform: translate(4px, 0); }
            }
        `}</style>
      <canvas 
        ref={canvasRef} 
        width={CANVAS_WIDTH} 
        height={CANVAS_HEIGHT} 
        className="w-full h-full max-w-[400px] max-h-[600px] border-4 border-black/20 rounded-2xl shadow-2xl bg-slate-900"
      />
      
      {/* HUD */}
      <div className="absolute top-6 left-0 right-0 flex justify-between px-6 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl flex flex-col items-center border border-white/10">
          <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Progress</span>
          <span className="text-white font-game text-xl leading-none">{score}/{level.pipesToPass}</span>
        </div>
        <div className="bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl flex flex-col items-center border border-white/10">
          <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Eggs</span>
          <div className="flex items-center gap-1">
             <EggIcon size={14} className="text-yellow-400 fill-yellow-400" />
             <span className="text-white font-game text-xl leading-none">{eggsDisplay}</span>
          </div>
        </div>
      </div>

      {gameState === 'IDLE' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm z-40">
          <div className="bg-white/10 p-8 rounded-full mb-6">
            <PlayCircle className="w-24 h-24 text-white animate-pulse" />
          </div>
          <h2 className="text-white font-game text-4xl mb-2 drop-shadow-md">EGG QUEST</h2>
          <p className="text-white/80 font-bold tracking-widest uppercase text-sm animate-bounce">Tap to Fly</p>
        </div>
      )}

      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/80 backdrop-blur-md p-8 text-center z-50 animate-in zoom-in duration-300">
          <div className="bg-red-600/20 p-6 rounded-full mb-4 border-4 border-red-500/30">
            <XCircle className="w-20 h-20 text-white" />
          </div>
          <h2 className="text-white font-game text-5xl mb-2">CRASHED!</h2>
          <div className="bg-black/20 rounded-2xl p-4 mb-10 border border-white/10 w-full max-w-[240px]">
             <p className="text-white/60 font-bold text-xs uppercase tracking-widest mb-1">Score</p>
             <div className="flex justify-between items-center text-white font-game text-xl">
                <span>{score}</span>
                <span className="text-white/30">/</span>
                <span>{level.pipesToPass}</span>
             </div>
          </div>
          <div className="flex flex-col gap-4 w-full max-w-[280px]">
            <button 
              onPointerDown={(e) => { e.stopPropagation(); initGame(); }}
              className="bg-yellow-400 text-yellow-900 font-game text-2xl py-5 rounded-2xl shadow-[0_6px_0_0_#ca8a04] active:shadow-none active:translate-y-[6px] transition-all flex items-center justify-center gap-3"
            >
              <RotateCcw className="w-6 h-6" />
              RETRY
            </button>
            <button 
              onPointerDown={(e) => { e.stopPropagation(); onExit(); }}
              className="bg-white/10 text-white font-game text-xl py-4 rounded-2xl border border-white/10"
            >
              QUIT
            </button>
          </div>
        </div>
      )}

      {gameState === 'WIN' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-green-500/80 backdrop-blur-md p-8 text-center z-50 animate-in zoom-in duration-300">
          <div className="bg-white p-8 rounded-full mb-6 shadow-2xl">
            <BirdIcon className="w-24 h-24 text-green-600 animate-bounce" />
          </div>
          <h2 className="text-white font-game text-5xl mb-2">CLEARED!</h2>
          <div className="flex items-center gap-3 bg-black/30 px-8 py-3 rounded-full border border-white/20">
            <EggIcon className="text-yellow-300 w-10 h-10 fill-yellow-300" />
            <span className="text-white font-game text-4xl">+{eggsDisplay}</span>
          </div>
        </div>
      )}
    </div>
  );
};
