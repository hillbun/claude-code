export class Ball {
  constructor(canvasWidth, canvasHeight, attached = false) {
    this.radius = 8;
    this.speed = 350;
    this.color = '#f5f5f5';
    this.attached = attached;
    // attached 模式：球静止，等待发射
    if (attached) {
      this.vx = 0;
      this.vy = 0;
      this.x = canvasWidth / 2;
      this.y = canvasHeight - 40 - 8 - 10; // 挡板上方
    } else {
      this.x = canvasWidth / 2;
      this.y = canvasHeight / 2;
      this._randomizeVelocity();
    }

    this._canvasWidth = canvasWidth;
    this._canvasHeight = canvasHeight;
  }

  _randomizeVelocity() {
    const angle = (Math.random() * 0.8 - 0.4) + (Math.random() < 0.5 ? -Math.PI / 2 : Math.PI / 2);
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
    if (Math.abs(this.vy) < this.speed * 0.3) {
      this.vy = this.speed * 0.5 * (this.vy >= 0 ? 1 : -1);
    }
  }

  // 发射：脱离挡板，给一个向上的初速度
  launch() {
    if (!this.attached) return;
    this.attached = false;
    const angle = -Math.PI / 2 + (Math.random() * 0.6 - 0.3);
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  // 跟随挡板位置（attached 状态下由 Game 调用）
  stickTo(paddle) {
    this.x = paddle.x + paddle.width / 2;
    this.y = paddle.y - this.radius - 2;
  }

  update(dt) {
    if (this.attached) return { fellOut: false, hitTop: false };

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // 左右墙壁反弹
    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = Math.abs(this.vx);
    } else if (this.x + this.radius > this._canvasWidth) {
      this.x = this._canvasWidth - this.radius;
      this.vx = -Math.abs(this.vx);
    }

    let hitTop = false;
    // 顶部反弹
    if (this.y - this.radius < 0) {
      this.y = this.radius;
      this.vy = Math.abs(this.vy);
      hitTop = true;
    }

    // 底部落出
    if (this.y - this.radius > this._canvasHeight) {
      return { fellOut: true, hitTop: false };
    }
    return { fellOut: false, hitTop };
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
