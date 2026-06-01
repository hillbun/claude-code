export const TILE = 32;
export const CANVAS_W = 800;
export const CANVAS_H = 480;
export const COLS = Math.ceil(CANVAS_W / TILE);
export const ROWS = Math.ceil(CANVAS_H / TILE);

// Physics
export const GRAVITY = 0.55;
export const MAX_FALL = 12;
export const JUMP_VEL = -10.5;
export const JUMP_HOLD_GRAVITY = 0.2;
export const RUN_ACCEL = 0.25;
export const FRICTION = 0.88;
export const MAX_SPEED = 4.5;

// Tile types
export const T = {
  EMPTY: 0, GROUND: 1, BRICK: 2, QUESTION: 3, USED: 4,
  PIPE_TL: 5, PIPE_TR: 6, PIPE_BL: 7, PIPE_BR: 8,
  HARD: 9, FLAG: 10,
};

export const SKY = '#5c94fc';

export function isSolid(t) {
  return t >= 1 && t <= 9;
}
