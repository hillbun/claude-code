import { TILE, CANVAS_W, CANVAS_H, SKY } from './constants.js';
import { Input } from './input.js';
import { Level } from './level.js';
import { Player } from './player.js';

// ---- Particles ----
class Particle {
  constructor(x, y, vx, vy, color, life) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.color = color; this.life = life; this.maxLife = life;
  }
  update() {
    this.x += this.vx; this.y += this.vy;
    this.vy += 0.3; this.life--;
  }
  draw(ctx, cam) {
    const alpha = this.life / this.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x - cam.x, this.y - cam.y, 6, 6);
    ctx.globalAlpha = 1;
  }
}

// ---- Game ----
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.input = new Input();
    this.level = new Level();
    this.player = new Player(3 * TILE, 11 * TILE);
    this.cam = { x: 0, y: 0, w: CANVAS_W, h: CANVAS_H };
    this.score = 0;
    this.coins = 0;
    this.particles = [];
    this.coinAnims = [];
    this.gameOver = false;
    this.won = false;
  }

  start() {
    const loop = () => {
      this.update();
      this.draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  update() {
    if (this.gameOver || this.won) return;

    const hit = this.player.update(this.input, this.level);
    this.input.update();

    // Handle block hit
    if (hit) {
      if (hit.type === 'coin') {
        this.score += 200; this.coins++;
        this.coinAnims.push({ x: hit.tx * TILE + 8, y: hit.ty - 16, vy: -6, life: 30 });
      } else if (hit.type === 'brick') {
        this.score += 50;
        for (let i = 0; i < 4; i++) {
          this.particles.push(new Particle(
            hit.tx * TILE + 8 + (i % 2) * 12,
            hit.ty + 8,
            (i % 2 === 0 ? -2 : 2) + Math.random() * 2,
            -4 - Math.random() * 3,
            '#c06828', 30
          ));
        }
      }
    }

    // Update particles
    this.particles = this.particles.filter(p => { p.update(); return p.life > 0; });

    // Update coin animations
    this.coinAnims = this.coinAnims.filter(c => { c.y += c.vy; c.vy += 0.4; c.life--; return c.life > 0; });

    // Camera
    this._updateCamera();

    // Win condition - reach flag
    if (this.player.x >= 197 * TILE && !this.won) {
      this.won = true;
      this.score += 5000;
    }
  }

  _updateCamera() {
    // Camera follows player, centered but clamped
    const target = this.player.x - CANVAS_W / 3;
    this.cam.x += (target - this.cam.x) * 0.1;
    this.cam.x = Math.max(0, Math.min(this.cam.x, this.level.w * TILE - CANVAS_W));
    this.cam.y = 0;
  }

  draw() {
    const ctx = this.ctx;

    // Sky
    ctx.fillStyle = SKY;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Level
    this.level.draw(ctx, this.cam);

    // Coin animations
    ctx.fillStyle = '#ffd800';
    this.coinAnims.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x - this.cam.x, c.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });

    // Particles
    this.particles.forEach(p => p.draw(ctx, this.cam));

    // Player
    this.player.draw(ctx, this.cam);

    // HUD
    this._drawHUD();

    // Game Over / Win overlay
    if (this.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_W / 2, CANVAS_H / 2 - 20);
      ctx.font = '18px Arial';
      ctx.fillText('Press R to restart', CANVAS_W / 2, CANVAS_H / 2 + 20);
      if (this.input.keys.KeyR) this._restart();
    }

    if (this.won) {
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = '#ffd800'; ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('COURSE CLEAR!', CANVAS_W / 2, CANVAS_H / 2 - 20);
      ctx.fillStyle = '#fff'; ctx.font = '20px Arial';
      ctx.fillText(`Score: ${this.score}`, CANVAS_W / 2, CANVAS_H / 2 + 20);
      ctx.font = '16px Arial';
      ctx.fillText('Press R to play again', CANVAS_W / 2, CANVAS_H / 2 + 50);
      if (this.input.keys.KeyR) this._restart();
    }
  }

  _drawHUD() {
    const ctx = this.ctx;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px Courier New';
    ctx.textAlign = 'left';
    ctx.fillText(`MARIO`, 24, 24);
    ctx.fillText(`${String(this.score).padStart(6, '0')}`, 24, 42);

    ctx.textAlign = 'center';
    ctx.fillText(`x${String(this.coins).padStart(2, '0')}`, CANVAS_W / 2, 42);
    // Coin icon
    ctx.fillStyle = '#ffd800';
    ctx.beginPath(); ctx.arc(CANVAS_W / 2 - 20, 38, 6, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.textAlign = 'right';
    ctx.fillText('WORLD', CANVAS_W - 24, 24);
    ctx.fillText('1-1', CANVAS_W - 24, 42);
  }

  _restart() {
    this.level = new Level();
    this.player = new Player(3 * TILE, 11 * TILE);
    this.score = 0; this.coins = 0;
    this.particles = []; this.coinAnims = [];
    this.cam.x = 0;
    this.gameOver = false; this.won = false;
  }
}

// Boot
const game = new Game();
game.start();
