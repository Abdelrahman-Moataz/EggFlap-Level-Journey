# EggFlap: Level Journey 🐦🥚

A high-performance, progressive arcade game built with **React**, **Tailwind CSS**, and **Lucide Icons**. Inspired by classic "Flappy" mechanics but enhanced with a 30-level progression system, a character economy, and a Candy Crush-style world map.

## 🚀 Features

- **30 Hand-crafted Levels**: Difficulty scales as you progress, with increasing speed, tighter gaps, and changing color palettes.
- **Candy Crush Style Map**: A winding visual path that tracks your progress through the world.
- **The Aviary (Shop)**: Collect eggs mid-flight to unlock 5 unique bird characters (Phoenix, Ghost, Zap, King, etc.).
- **Progressive Difficulty**:
  - Speed increases every level.
  - Pipe gaps shrink.
  - Obstacle frequency shifts.
- **Persistent Data**: Automatic saving to LocalStorage (simulating a Firestore backend) to keep your progress and unlocked characters safe.
- **Pure Programmatic Visuals**: No external image assets. Everything is drawn via Canvas or SVG/Icons for maximum performance and a clean aesthetic.

## 🛠️ Technical Stack

- **React 19**: Modern UI component architecture.
- **Custom Game Engine**: Built from scratch using `requestAnimationFrame` and HTML5 Canvas.
- **Tailwind CSS**: For sleek, responsive UI overlays and menus.
- **Lucide React**: Providing the programmatic iconography for characters and UI elements.

## 🕹️ Controls

- **Desktop**: Click the mouse button to flap.
- **Mobile**: Tap the screen to flap.

## 📂 Project Structure

- `App.tsx`: The central hub handling state (Auth, Menu, Game, Shop).
- `game/FlappyGame.tsx`: The core physics engine and rendering loop.
- `components/LevelMap.tsx`: The visual progression map.
- `components/CharacterShop.tsx`: The character unlock and selection system.
- `services/storageService.ts`: Data persistence logic.

## 🏗️ Development

This project uses an import map based structure for instant browser compatibility without a heavy build step.

1. Clone the repository.
2. Open `index.html` in any modern web browser (or use a Live Server).
3. Start flapping!

---
*Created with ❤️ by the EggFlap Team*
