import { Ball } from './Ball.js';
import { Paddle } from './Paddle.js';

const State = {
  MENU: 'MENU',
  PLAYING: 'PLAYING',
  PAUSED: 'PAUSED',
  GAME_OVER: 'GAME_OVER',
  VICTORY: 'VICTORY',
};

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.state = State.MENU;
    this.ball = null;
    this.paddle = null;
    this.score = 0;
    this.lives = 3;
    this.elapsedTime = 0;
    this._lastTime = 0;
    this._animId = null;
  }

  start() {
    this.score = 0;
    this.lives = 3;
    this.elapsedTime = 0;
    this._initEntities();
    this.state = State.PLAYING;
    this._lastTime = performance.now();
    this._loop(this._lastTime);
  }

  _initEntities() {
    this.ball = new Ball(this.canvas.width, this.canvas.height, true);
    this.paddle = new Paddle(this.canvas.width, this.canvas.height);
    this.ball.stickTo(this.paddle);
  }

  _loop = (now) => {
    const dt = Math.min((now - this._lastTime) / 1000, 0.05);
    this._lastTime = now;

    if (this.state === State.PLAYING) {
      this._update(dt);
    }
    this._draw();

    this._animId = requestAnimationFrame(this._loop);
  };

  _update(dt) {
    this.elapsedTime += dt;
    this.paddle.update(dt);

    if (this.ball.attached) {
      this.ball.stickTo(this.paddle);
      return;
    }

    const { fellOut, hitTop } = this.ball.update(dt);

    // 小球与挡板碰撞
    if (this._collidesWithPaddle()) {
      this._bounceOffPaddle();
    }

    if (hitTop) {
      this.score++;
    }

    if (fellOut) {
      this.lives--;
      if (this.lives <= 0) {
        this.state = State.GAME_OVER;
      } else {
        this.ball = new Ball(this.canvas.width, this.canvas.height, true);
        this.ball.stickTo(this.paddle);
      }
    }
  }

  _collidesWithPaddle() {
    const b = this.ball;
    const p = this.paddle;
    // 只有球向下运动时才检测，避免重复弹
    if (b.vy < 0) return false;
    const closestX = Math.max(p.x, Math.min(b.x, p.x + p.width));
    const closestY = Math.max(p.y, Math.min(b.y, p.y + p.height));
    const dx = b.x - closestX;
    const dy = b.y - closestY;
    return (dx * dx + dy * dy) < (b.radius * b.radius);
  }

  // 根据球撞击挡板的相对位置计算反弹角度
  // hitPos ∈ [-1, 1]，映射到反弹角 [150°, 30°]（向右偏到向左偏）
  _bounceOffPaddle() {
    const b = this.ball;
    const p = this.paddle;
    const hitPos = ((b.x - p.x) / p.width) * 2 - 1; // -1..1
    const clampedHit = Math.max(-0.95, Math.min(0.95, hitPos));
    // 反弹角度：-1 → 150°（偏左），+1 → 30°（偏右），0 → 90°（正上）
    const angleDeg = 90 - clampedHit * 60;
    const angleRad = (angleDeg * Math.PI) / 180;
    const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
    b.vx = Math.cos(angleRad) * speed;
    b.vy = -Math.abs(Math.sin(angleRad) * speed);
    // 防止球陷入挡板
    b.y = p.y - b.radius;
  }

  _draw() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.state === State.MENU) {
      this._drawText('按 Enter 开始游戏', canvas.width / 2, canvas.height / 2, 28);
      return;
    }

    this.paddle.draw(ctx);
    this.ball.draw(ctx);
    this._drawHUD();

    if (this.ball.attached && this.state === State.PLAYING) {
      this._drawText('按 空格键 发射', canvas.width / 2, canvas.height / 2, 20);
    }

    if (this.state === State.GAME_OVER) {
      this._drawOverlay(`游戏结束  得分: ${this.score}`, '按 R 重新开始');
    } else if (this.state === State.PAUSED) {
      this._drawOverlay('暂停', '按 P 继续');
    } else if (this.state === State.VICTORY) {
      this._drawOverlay('恭喜通关！', `最终得分: ${this.score}`);
    }
  }

  _drawText(text, x, y, size) {
    const { ctx } = this;
    ctx.fillStyle = '#f5f5f5';
    ctx.font = `${size}px "Segoe UI", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }

  _drawHUD() {
    const { ctx, canvas } = this;
    // 分数 — 左上角
    ctx.fillStyle = '#f5f5f5';
    ctx.font = '18px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`得分: ${this.score}`, 16, 14);

    // 计时器 — 顶部居中
    const mins = Math.floor(this.elapsedTime / 60);
    const secs = Math.floor(this.elapsedTime % 60);
    const timeStr = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    ctx.textAlign = 'center';
    ctx.fillText(timeStr, canvas.width / 2, 14);

    // 生命值 — 右上角，用圆形代表剩余生命数
    ctx.textAlign = 'right';
    ctx.fillText('生命: ', canvas.width - 16 - this.lives * 22, 14);
    for (let i = 0; i < this.lives; i++) {
      ctx.fillStyle = '#e94560';
      ctx.beginPath();
      ctx.arc(canvas.width - 16 - i * 22, 22, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  _drawOverlay(title, subtitle) {
    const { ctx, canvas } = this;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    this._drawText(title, canvas.width / 2, canvas.height / 2 - 18, 26);
    if (subtitle) {
      this._drawText(subtitle, canvas.width / 2, canvas.height / 2 + 22, 18);
    }
  }

  handleInput() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && this.state === State.MENU) {
        this.start();
      }
      if (e.key === 'r' || e.key === 'R') {
        if (this.state === State.GAME_OVER || this.state === 'VICTORY') {
          this.start();
        }
      }
      if (e.key === ' ' && this.state === State.PLAYING && this.ball.attached) {
        this.ball.launch();
      }
      if (e.key === 'p' || e.key === 'P') {
        if (this.state === State.PLAYING) {
          this.state = State.PAUSED;
        } else if (this.state === State.PAUSED) {
          this.state = State.PLAYING;
          this._lastTime = performance.now();
        }
      }
    });
  }
}
