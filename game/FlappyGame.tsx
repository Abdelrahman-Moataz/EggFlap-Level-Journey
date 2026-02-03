
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Bird, Egg, Circle, Square } from 'lucide-react';
import { LevelConfig, UserProfile, Character } from '../types';
import { BIRD_SIZE, GRAVITY, JUMP_FORCE, PIPE_WIDTH } from '../constants';

interface GameProps {
  level: LevelConfig;
  user: UserProfile;
  character: Character;
  onWin: (eggsCollected: number) => void;
  onLose: () => void;
}

const FlappyGame: React.FC<GameProps> = ({ level, user, character, onWin, onLose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState({
    birdY: 300,
    birdVelocity: 0,
    pipes: [] as { x: number; topHeight: number; id: number }[],
    eggs: [] as { x: number; y: number; collected: boolean; id: number }[],
    score: 0,
    eggsCollected: 0,
    distance: 0,
  });

  // Fix: Added initial undefined to useRef to satisfy "Expected 1 arguments"
  const requestRef = useRef<number | undefined>(undefined);
  // Fix: Added initial undefined to useRef to satisfy "Expected 1 arguments"
  const lastTimeRef = useRef<number | undefined>(undefined);
  const stateRef = useRef(gameState);

  const winThreshold = 3000; // Pixels to travel to finish level

  const jump = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      birdVelocity: JUMP_FORCE
    }));
  }, []);

  const spawnPipe = useCallback((x: number) => {
    const minH = 100;
    const maxH = 400;
    const topHeight = minH + Math.random() * (maxH - minH);
    return { x, topHeight, id: Date.now() + Math.random() };
  }, []);

  const spawnEgg = useCallback((x: number) => {
    const y = 150 + Math.random() * 300;
    return { x, y, collected: false, id: Date.now() + Math.random() };
  }, []);

  const update = (time: number) => {
    if (lastTimeRef.current === undefined) {
      lastTimeRef.current = time;
    }
    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const canvas = canvasRef.current;
    if (!canvas) return;

    setGameState(prev => {
      // 1. Move Bird
      const newVelocity = prev.birdVelocity + GRAVITY;
      const newY = prev.birdY + newVelocity;

      // 2. Move Pipes & Eggs
      const newDistance = prev.distance + level.speed;
      let newPipes = prev.pipes.map(p => ({ ...p, x: p.x - level.speed }));
      let newEggs = prev.eggs.map(e => ({ ...e, x: e.x - level.speed }));

      // Remove off-screen pipes
      newPipes = newPipes.filter(p => p.x > -100);
      newEggs = newEggs.filter(e => e.x > -100);

      // Spawn new pipes if needed
      if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 500) {
        if (newDistance < winThreshold - 400) {
           newPipes.push(spawnPipe(800));
        }
      }

      // Spawn eggs
      if (Math.random() < 0.01 && newEggs.length < 3 && newDistance < winThreshold - 400) {
        newEggs.push(spawnEgg(850));
      }

      // 3. Collision Detection
      const birdRect = {
        left: 50,
        right: 50 + BIRD_SIZE,
        top: newY,
        bottom: newY + BIRD_SIZE
      };

      // Ground/Ceiling
      if (newY < 0 || newY > canvas.height - BIRD_SIZE) {
        onLose();
        return prev;
      }

      // Pipes
      for (const pipe of newPipes) {
        const topRect = { left: pipe.x, right: pipe.x + PIPE_WIDTH, top: 0, bottom: pipe.topHeight };
        const bottomRect = { left: pipe.x, right: pipe.x + PIPE_WIDTH, top: pipe.topHeight + level.gapSize, bottom: canvas.height };

        if (
          (birdRect.right > topRect.left && birdRect.left < topRect.right && birdRect.bottom > topRect.top && birdRect.top < topRect.bottom) ||
          (birdRect.right > bottomRect.left && birdRect.left < bottomRect.right && birdRect.bottom > bottomRect.top && birdRect.top < bottomRect.bottom)
        ) {
          onLose();
          return prev;
        }
      }

      // Eggs
      let collectedCount = prev.eggsCollected;
      newEggs = newEggs.map(egg => {
        if (!egg.collected) {
           const eggRect = { left: egg.x, right: egg.x + 20, top: egg.y, bottom: egg.y + 20 };
           if (birdRect.right > eggRect.left && birdRect.left < eggRect.right && birdRect.bottom > eggRect.top && birdRect.top < eggRect.bottom) {
             collectedCount++;
             return { ...egg, collected: true };
           }
        }
        return egg;
      });

      // 4. Check Win
      if (newDistance >= winThreshold) {
        onWin(collectedCount);
        return prev;
      }

      return {
        ...prev,
        birdY: newY,
        birdVelocity: newVelocity,
        pipes: newPipes,
        eggs: newEggs,
        distance: newDistance,
        eggsCollected: collectedCount,
        score: Math.floor(newDistance / 100)
      };
    });

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(update);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <div 
      className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      onMouseDown={jump}
      onTouchStart={jump}
      style={{ backgroundColor: level.backgroundColor }}
    >
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        className="w-full h-full max-w-2xl bg-transparent"
      />
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none">
        <div className="bg-black/50 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
           <Circle className="w-5 h-5 fill-yellow-400 text-yellow-500" />
           {gameState.eggsCollected}
        </div>
        <div className="bg-black/50 text-white px-4 py-2 rounded-full font-bold">
           Level {level.id} - {Math.round((gameState.distance / winThreshold) * 100)}%
        </div>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 h-2 bg-black/20 w-full">
         <div 
           className="h-full bg-white transition-all duration-100" 
           style={{ width: `${(gameState.distance / winThreshold) * 100}%` }}
         />
      </div>

      {/* Bird Renderer */}
      <div 
        className="absolute pointer-events-none transition-transform duration-75"
        style={{ 
          left: 'calc(50% - 370px)', // Centering relative to 800px canvas width simulation
          top: gameState.birdY,
          width: BIRD_SIZE,
          height: BIRD_SIZE,
          transform: `rotate(${gameState.birdVelocity * 3}deg)`
        }}
      >
        <div 
          className="w-full h-full rounded-full flex items-center justify-center shadow-lg"
          style={{ backgroundColor: character.color }}
        >
          {character.iconName === 'Bird' && <Bird className="text-white w-6 h-6" />}
          {character.iconName === 'Flame' && <Flame className="text-white w-6 h-6" />}
          {character.iconName === 'Ghost' && <Ghost className="text-white w-6 h-6" />}
          {character.iconName === 'Zap' && <Zap className="text-white w-6 h-6" />}
          {character.iconName === 'Crown' && <Crown className="text-white w-6 h-6" />}
        </div>
      </div>

      {/* Pipes Renderer (Manual overlay for simplicity or pure canvas) */}
      {gameState.pipes.map(pipe => (
        <React.Fragment key={pipe.id}>
          {/* Top Pipe */}
          <div 
            className="absolute shadow-inner rounded-b-lg border-2 border-black/10"
            style={{ 
              left: `calc(50% - 400px + ${pipe.x}px)`, 
              top: 0, 
              width: PIPE_WIDTH, 
              height: pipe.topHeight, 
              backgroundColor: level.pipeColor 
            }}
          />
          {/* Bottom Pipe */}
          <div 
            className="absolute shadow-inner rounded-t-lg border-2 border-black/10"
            style={{ 
              left: `calc(50% - 400px + ${pipe.x}px)`, 
              top: pipe.topHeight + level.gapSize, 
              width: PIPE_WIDTH, 
              height: 1000, 
              backgroundColor: level.pipeColor 
            }}
          />
        </React.Fragment>
      ))}

      {/* Eggs Renderer */}
      {gameState.eggs.filter(e => !e.collected).map(egg => (
        <div 
          key={egg.id}
          className="absolute w-6 h-6 flex items-center justify-center animate-bounce"
          style={{ 
            left: `calc(50% - 400px + ${egg.x}px)`, 
            top: egg.y 
          }}
        >
          <div className="w-4 h-5 bg-yellow-300 rounded-full shadow-lg border border-yellow-500" />
        </div>
      ))}
    </div>
  );
};

// Simple icon mappings for those that weren't imported
const Flame = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.5 3.5 6.5 1 1.5 1 2.5 1 3.5a5 5 0 1 1-10 0c0-1.5 1.5-3.5 1.5-3.5s-.5 2 0 3.5Z"/></svg>
);
const Ghost = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 10h.01"/><path d="M15 10h.01"/><path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z"/></svg>
);
const Zap = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
);
const Crown = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/></svg>
);

export default FlappyGame;
