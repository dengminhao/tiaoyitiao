import * as THREE from 'three';

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER'
}

export enum ShapeType {
  BOX = 'BOX',
  CYLINDER = 'CYLINDER'
}

export interface PlatformData {
  id: string;
  position: THREE.Vector3;
  type: ShapeType;
  color: string;
  size: number; // Radius or width
  height: number;
}

export interface GameStore {
  score: number;
  highScore: number;
  gameState: GameState;
  setGameState: (state: GameState) => void;
  incrementScore: () => void;
  resetScore: () => void;
}
