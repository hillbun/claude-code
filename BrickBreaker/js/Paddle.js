export class Paddle {
  constructor(canvasWidth, canvasHeight) {
    this.width = 120;
    this.height = 16;
    this.speed = 500;
    this.x = (canvasWidth - this.width) / 2;
    this.y = canvasHeight - 40;
    this.color = '#2ecc71';

    this._canvasWidth = canvasWidth;
    this._keys = { left: false, right: false };
    this._mouseX = null;

    this._onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') this._keys.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd') this._keys.right = true;
    };
    this._onKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a') this._keys.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd') this._keys.right = false;
    };
    this._onMouseMove = (e) => {
      const rect = document.getElementById('gameCanvas').getBoundingClientRect();
      this._mouseX = e.clientX - rect.left;
    };

    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
    window.addEventListener('mousemove', this._onMouseMove);
  }

  update(dt) {
    if (this._mouseX !== null) {
      // 鼠标控制：平滑跟随
      const target = this._mouseX - this.width / 2;
      const diff = target - this.x;
      this.x += diff * Math.min(1, 12 * dt);
    } else {
      // 键盘控制
      if (this._keys.left) this.x -= this.speed * dt;
      if (this._keys.right) this.x += this.speed * dt;
    }

    // 边界约束
    if (this.x < 0) this.x = 0;
    if (this.x + this.width > this._canvasWidth) {
      this.x = this._canvasWidth - this.width;
    }
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    const r = this.height / 2;
    ctx.roundRect(this.x, this.y, this.width, this.height, r);
    ctx.fill();
  }
}
