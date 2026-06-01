import { TILE, GRAVITY, MAX_FALL, JUMP_VEL, JUMP_HOLD_GRAVITY, RUN_ACCEL, FRICTION, MAX_SPEED, isSolid } from './constants.js';

export class Player {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.w = 22; this.h = 30;
    this.vx = 0; this.vy = 0;
    this.onGround = false;
    this.facing = 1;
    this.frame = 0; this.ft = 0;
    this.dead = false;
  }

  update(input, level) {
    if (this.dead) return;

    // Horizontal
    if (input.left)  { this.vx -= RUN_ACCEL; this.facing = -1; }
    if (input.right) { this.vx += RUN_ACCEL; this.facing =  1; }
    if (!input.left && !input.right) {
      this.vx *= FRICTION;
      if (Math.abs(this.vx) < 0.15) this.vx = 0;
    }
    this.vx = Math.max(-MAX_SPEED, Math.min(MAX_SPEED, this.vx));

    // Jump
    if (input.jumpPressed && this.onGround) {
      this.vy = JUMP_VEL;
      this.onGround = false;
    }
    // Variable height: hold = lighter gravity while going up
    if (input.jump && this.vy < 0) {
      this.vy += JUMP_HOLD_GRAVITY;
    }
    // Normal gravity
    this.vy += GRAVITY;
    if (this.vy > MAX_FALL) this.vy = MAX_FALL;

    // Move X + collide
    this.x += this.vx;
    this._collideX(level);

    // Move Y + collide
    this.y += this.vy;
    this.onGround = false;
    const hitResult = this._collideY(level);

    // Clamp left boundary
    if (this.x < 0) { this.x = 0; this.vx = 0; }

    // Fall into pit
    if (this.y > 15 * TILE) this.dead = true;

    // Animation
    this.ft++;
    if (Math.abs(this.vx) > 0.5) {
      if (this.ft > 5) { this.frame = (this.frame + 1) % 3; this.ft = 0; }
    } else { this.frame = 0; }

    return hitResult;
  }

  _tileAt(px, py, level) {
    return level.get(Math.floor(px / TILE), Math.floor(py / TILE));
  }

  _collideX(level) {
    const t = this.y + 4, b = this.y + this.h - 1;
    const checkY = [t, (t + b) / 2, b];
    for (const cy of checkY) {
      if (this.vx > 0) {
        if (isSolid(this._tileAt(this.x + this.w, cy, level))) {
          this.x = Math.floor((this.x + this.w) / TILE) * TILE - this.w;
          this.vx = 0; return;
        }
      } else if (this.vx < 0) {
        if (isSolid(this._tileAt(this.x, cy, level))) {
          this.x = Math.floor(this.x / TILE) * TILE + TILE;
          this.vx = 0; return;
        }
      }
    }
  }

  _collideY(level) {
    const l = this.x + 3, r = this.x + this.w - 3;
    let hit = null;
    if (this.vy > 0) {
      for (const cx of [l, r]) {
        if (isSolid(this._tileAt(cx, this.y + this.h, level))) {
          this.y = Math.floor((this.y + this.h) / TILE) * TILE - this.h;
          this.vy = 0; this.onGround = true; return null;
        }
      }
    } else if (this.vy < 0) {
      for (const cx of [l, r]) {
        const tx = Math.floor(cx / TILE);
        const ty = Math.floor(this.y / TILE);
        if (isSolid(level.get(tx, ty))) {
          this.y = (ty + 1) * TILE;
          this.vy = 0;
          hit = level.hitBlock(tx, ty);
          return hit ? { type: hit, tx, ty: ty * TILE } : null;
        }
      }
    }
    return null;
  }

  draw(ctx, cam) {
    if (this.dead) return;
    const dx = Math.round(this.x - cam.x);
    const dy = Math.round(this.y - cam.y);
    const f = this.facing;

    ctx.save();
    if (f === -1) {
      ctx.translate(dx + this.w, dy);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(dx, dy);
    }

    const w = this.w, h = this.h;

    // Hat
    ctx.fillStyle = '#e44040';
    ctx.fillRect(2, 0, w - 4, 7);
    ctx.fillRect(0, 3, w, 5);

    // Hair / face
    ctx.fillStyle = '#fca044';
    ctx.fillRect(1, 8, w - 2, 8);
    ctx.fillStyle = '#6c3400';
    ctx.fillRect(0, 8, 3, 4);

    // Eye
    ctx.fillStyle = '#000';
    ctx.fillRect(w - 7, 10, 3, 3);

    // Body (shirt)
    ctx.fillStyle = '#e44040';
    ctx.fillRect(3, 16, w - 6, 5);

    // Overalls
    ctx.fillStyle = '#2044b0';
    ctx.fillRect(1, 19, w - 2, 7);
    // Strap
    ctx.fillRect(5, 17, 3, 4);
    ctx.fillRect(w - 8, 17, 3, 4);
    // Button
    ctx.fillStyle = '#ffd800';
    ctx.fillRect(7, 19, 2, 2);
    ctx.fillRect(w - 9, 19, 2, 2);

    // Legs / Shoes
    ctx.fillStyle = '#6c3400';
    if (!this.onGround) {
      // Jump pose
      ctx.fillRect(0, 26, 8, 4);
      ctx.fillRect(w - 10, 24, 8, 4);
    } else if (Math.abs(this.vx) > 0.5) {
      // Walk
      const off = this.frame === 1 ? 3 : this.frame === 2 ? -2 : 0;
      ctx.fillRect(1 + off, 26, 8, 4);
      ctx.fillRect(w - 9 - off, 26, 8, 4);
    } else {
      ctx.fillRect(2, 26, 8, 4);
      ctx.fillRect(w - 10, 26, 8, 4);
    }

    ctx.restore();
  }
}
