import { TILE, T, isSolid } from './constants.js';

export class Level {
  constructor() {
    this.w = 212;
    this.h = 15;
    this.grid = this._build();
    this.decorations = this._buildDecorations();
  }

  _build() {
    const g = Array.from({ length: this.h }, () => new Array(this.w).fill(T.EMPTY));

    // Ground (rows 13-14)
    for (let x = 0; x < this.w; x++) { g[13][x] = T.GROUND; g[14][x] = T.GROUND; }

    // Gaps
    this._clear(g, 69, 70);
    this._clear(g, 86, 88);

    // Question / Brick blocks
    g[9][16] = T.QUESTION;
    g[9][20] = T.BRICK; g[9][21] = T.QUESTION; g[9][22] = T.BRICK;
    g[9][23] = T.QUESTION; g[9][24] = T.BRICK;
    g[5][22] = T.QUESTION;

    g[9][77] = T.QUESTION;
    g[9][78] = T.BRICK; g[9][79] = T.QUESTION;
    for (let x = 80; x <= 87; x++) g[5][x] = T.BRICK;

    g[9][91] = T.BRICK; g[9][92] = T.BRICK;
    g[9][93] = T.QUESTION; g[9][94] = T.BRICK;

    g[5][94] = T.BRICK; g[5][95] = T.BRICK;
    g[5][96] = T.BRICK; g[5][97] = T.BRICK;

    g[9][100] = T.BRICK; g[9][101] = T.QUESTION;
    g[9][106] = T.BRICK; g[9][107] = T.QUESTION;
    g[9][109] = T.QUESTION; g[9][110] = T.QUESTION;

    g[9][117] = T.BRICK; g[9][118] = T.QUESTION; g[9][119] = T.QUESTION;

    g[9][128] = T.BRICK;
    g[9][129] = T.BRICK; g[9][130] = T.QUESTION;
    g[9][131] = T.QUESTION;

    g[9][168] = T.BRICK; g[9][169] = T.QUESTION;
    g[9][170] = T.QUESTION; g[9][171] = T.QUESTION;

    // Pipes
    this._pipe(g, 28, 11);
    this._pipe(g, 38, 10);
    this._pipe(g, 46, 9);
    this._pipe(g, 57, 9);
    this._pipe(g, 163, 11);
    this._pipe(g, 179, 11);

    // Stairs
    this._stairs(g, 134, 4, 1);
    this._stairs(g, 140, 4, -1);
    this._stairs(g, 148, 5, 1);
    this._stairs(g, 152, 4, -1);
    g[9][152] = T.BRICK; g[9][153] = T.BRICK;
    this._stairs(g, 181, 9, 1);

    // Flagpole
    for (let y = 2; y <= 12; y++) g[y][198] = T.FLAG;

    return g;
  }

  _clear(g, a, b) {
    for (let x = a; x <= b; x++) { g[13][x] = T.EMPTY; g[14][x] = T.EMPTY; }
  }

  _pipe(g, x, topY) {
    g[topY][x] = T.PIPE_TL; g[topY][x + 1] = T.PIPE_TR;
    for (let y = topY + 1; y <= 12; y++) { g[y][x] = T.PIPE_BL; g[y][x + 1] = T.PIPE_BR; }
  }

  _stairs(g, sx, h, dir) {
    for (let i = 0; i < h; i++)
      for (let j = 0; j <= i; j++) {
        const x = dir === 1 ? sx + i : sx - i;
        if (x >= 0 && x < this.w) g[12 - j][x] = T.HARD;
      }
  }

  _buildDecorations() {
    const d = [];
    // Hills
    const hillXs = [0, 48, 96, 144, 192];
    hillXs.forEach((hx, i) => {
      const hw = (i % 2 === 0) ? 96 : 64;
      const hh = (i % 2 === 0) ? 48 : 32;
      d.push({ type: 'hill', x: hx * TILE, y: 13 * TILE - hh, w: hw, h: hh });
    });
    // Clouds
    for (let i = 0; i < 30; i++) {
      const cx = (i * 240 + 100) % (this.w * TILE);
      const cy = (i * 80 + 30) % (4 * TILE) + 16;
      d.push({ type: 'cloud', x: cx, y: cy, s: 1 + (i % 3) * 0.4 });
    }
    return d;
  }

  get(tx, ty) {
    if (tx < 0 || tx >= this.w) return T.EMPTY;
    if (ty < 0) return T.EMPTY;
    if (ty >= this.h) return T.GROUND;
    return this.grid[ty][tx];
  }

  set(tx, ty, v) {
    if (tx >= 0 && tx < this.w && ty >= 0 && ty < this.h) this.grid[ty][tx] = v;
  }

  hitBlock(tx, ty) {
    const t = this.get(tx, ty);
    if (t === T.QUESTION) { this.set(tx, ty, T.USED); return 'coin'; }
    if (t === T.BRICK)    { this.set(tx, ty, T.EMPTY); return 'brick'; }
    return null;
  }

  // ---- drawing ----

  draw(ctx, cam) {
    // Decorations (behind tiles)
    this._drawDecorations(ctx, cam);

    // Tiles
    const sx = Math.floor(cam.x / TILE);
    const ex = Math.ceil((cam.x + cam.w) / TILE);
    for (let y = 0; y < this.h; y++)
      for (let x = sx; x <= ex; x++) {
        const t = this.get(x, y);
        if (t === T.EMPTY) continue;
        this._drawTile(ctx, t, x * TILE - cam.x, y * TILE - cam.y);
      }
  }

  _drawDecorations(ctx, cam) {
    ctx.save();
    // Hills
    this.decorations.filter(d => d.type === 'hill').forEach(d => {
      const dx = d.x - cam.x * 0.6;
      if (dx + d.w < -100 || dx > cam.w + 100) return;
      ctx.fillStyle = '#58a828';
      ctx.beginPath();
      ctx.moveTo(dx, d.y + d.h);
      ctx.lineTo(dx + d.w / 2, d.y);
      ctx.lineTo(dx + d.w, d.y + d.h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#80d010';
      ctx.beginPath();
      ctx.moveTo(dx + d.w * 0.15, d.y + d.h);
      ctx.lineTo(dx + d.w / 2, d.y + d.h * 0.15);
      ctx.lineTo(dx + d.w * 0.55, d.y + d.h);
      ctx.closePath();
      ctx.fill();
    });

    // Clouds
    this.decorations.filter(d => d.type === 'cloud').forEach(d => {
      const dx = d.x - cam.x * 0.3;
      if (dx + 80 * d.s < -100 || dx > cam.w + 100) return;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      const s = d.s;
      this._roundRect(ctx, dx, d.y, 32 * s, 24 * s);
      this._roundRect(ctx, dx + 20 * s, d.y - 8 * s, 32 * s, 24 * s);
      this._roundRect(ctx, dx + 40 * s, d.y, 32 * s, 24 * s);
    });
    ctx.restore();
  }

  _roundRect(ctx, x, y, w, h) {
    ctx.beginPath();
    ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawTile(ctx, t, x, y) {
    const S = TILE;
    switch (t) {
      case T.GROUND:
        ctx.fillStyle = '#c84c0c'; ctx.fillRect(x, y, S, S);
        ctx.fillStyle = '#e09050'; ctx.fillRect(x + 1, y + 1, S - 2, S / 2 - 1);
        ctx.strokeStyle = '#a03800'; ctx.lineWidth = 1; ctx.strokeRect(x, y, S, S);
        break;
      case T.BRICK:
        ctx.fillStyle = '#c06828'; ctx.fillRect(x, y, S, S);
        ctx.strokeStyle = '#7c3810'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y + S / 2); ctx.lineTo(x + S, y + S / 2);
        ctx.moveTo(x + S / 2, y); ctx.lineTo(x + S / 2, y + S / 2);
        ctx.moveTo(x + S / 4, y + S / 2); ctx.lineTo(x + S / 4, y + S);
        ctx.moveTo(x + S * 3 / 4, y + S / 2); ctx.lineTo(x + S * 3 / 4, y + S);
        ctx.stroke();
        break;
      case T.QUESTION:
        ctx.fillStyle = '#e8a020'; ctx.fillRect(x, y, S, S);
        ctx.fillStyle = '#f8d878'; ctx.fillRect(x + 2, y + 2, S - 4, S - 4);
        ctx.fillStyle = '#e8a020'; ctx.fillRect(x + 4, y + 4, S - 8, S - 8);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('?', x + S / 2, y + S / 2 + 1);
        break;
      case T.USED:
        ctx.fillStyle = '#886848'; ctx.fillRect(x, y, S, S);
        ctx.strokeStyle = '#604830'; ctx.lineWidth = 1; ctx.strokeRect(x, y, S, S);
        break;
      case T.PIPE_TL:
        ctx.fillStyle = '#30b018'; ctx.fillRect(x - 4, y, S + 4, S);
        ctx.fillStyle = '#68e040'; ctx.fillRect(x - 4, y, S / 3, S);
        ctx.fillStyle = '#187008'; ctx.fillRect(x - 4, y, 2, S);
        ctx.fillRect(x + S - 2, y, 2, S);
        break;
      case T.PIPE_TR:
        ctx.fillStyle = '#30b018'; ctx.fillRect(x, y, S + 4, S);
        ctx.fillStyle = '#68e040'; ctx.fillRect(x, y, S / 3, S);
        ctx.fillStyle = '#187008'; ctx.fillRect(x, y, 2, S);
        ctx.fillRect(x + S + 2, y, 2, S);
        break;
      case T.PIPE_BL:
        ctx.fillStyle = '#30b018'; ctx.fillRect(x, y, S, S);
        ctx.fillStyle = '#68e040'; ctx.fillRect(x, y, S / 3, S);
        ctx.fillStyle = '#187008'; ctx.fillRect(x, y, 2, S);
        ctx.fillRect(x + S - 2, y, 2, S);
        break;
      case T.PIPE_BR:
        ctx.fillStyle = '#30b018'; ctx.fillRect(x, y, S, S);
        ctx.fillStyle = '#68e040'; ctx.fillRect(x, y, S / 3, S);
        ctx.fillStyle = '#187008'; ctx.fillRect(x, y, 2, S);
        ctx.fillRect(x + S - 2, y, 2, S);
        break;
      case T.HARD:
        ctx.fillStyle = '#989898'; ctx.fillRect(x, y, S, S);
        ctx.fillStyle = '#c0c0c0'; ctx.fillRect(x + 2, y + 2, S - 4, S / 2 - 2);
        ctx.strokeStyle = '#606060'; ctx.lineWidth = 1; ctx.strokeRect(x, y, S, S);
        break;
      case T.FLAG:
        ctx.fillStyle = '#a0a0a0'; ctx.fillRect(x + S / 2 - 2, y, 4, S);
        if (y < 3 * S + 16) {
          ctx.fillStyle = '#18b818';
          ctx.beginPath();
          ctx.moveTo(x + S / 2 + 2, y);
          ctx.lineTo(x + S / 2 + 22, y + 10);
          ctx.lineTo(x + S / 2 + 2, y + 20);
          ctx.closePath(); ctx.fill();
        }
        break;
    }
  }
}
