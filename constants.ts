// Physics & Gameplay
export const JUMP_SPEED_MULTIPLIER = 5.0; // How much distance per second of holding
export const MAX_JUMP_DISTANCE = 7.5;
export const MAX_CHARGE_TIME = 1.5; // Seconds
export const GRAVITY = 32; // Increased to make jumping feel snappier/heavier
export const HORIZONTAL_SPEED = 8; // Horizontal flight speed (units/sec) - faster means lower arc
export const PLATFORM_HEIGHT = 2;
export const PLATFORM_BASE_SIZE = 1.2;
export const PLAYER_SIZE = 0.3;

// Generation
export const MIN_DISTANCE = 3.0; // Increased to prevent visual overlap (Size 1.2 * 2 = 2.4, so 3.0 is safe)
export const MAX_DISTANCE = 5.5;

// Colors
export const BG_COLOR = '#d6e4ff';
export const PLAYER_COLOR = '#3b82f6'; // Blue-500
export const PLATFORM_COLORS = [
  '#fca5a5', // Red-300
  '#fdba74', // Orange-300
  '#fde047', // Yellow-300
  '#86efac', // Green-300
  '#67e8f9', // Cyan-300
  '#c4b5fd', // Violet-300
  '#f9a8d4', // Pink-300
  '#94a3b8', // Slate-400
];