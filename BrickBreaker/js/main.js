import { Game } from './Game.js';

const canvas = document.getElementById('gameCanvas');
const game = new Game(canvas);

game.handleInput();
requestAnimationFrame((now) => {
  game._lastTime = now;
  game._loop(now);
});
