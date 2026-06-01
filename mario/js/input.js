export class Input {
  constructor() {
    this.keys = {};
    this.prev = {};
    this._listen();
  }

  _listen() {
    const prevent = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space']);
    window.addEventListener('keydown', e => {
      this.keys[e.code] = true;
      if (prevent.has(e.code)) e.preventDefault();
    });
    window.addEventListener('keyup', e => { this.keys[e.code] = false; });
  }

  justPressed(code) { return this.keys[code] && !this.prev[code]; }

  update() { this.prev = { ...this.keys }; }

  get left()  { return this.keys.ArrowLeft  || this.keys.KeyA; }
  get right() { return this.keys.ArrowRight || this.keys.KeyD; }
  get jump()  { return this.keys.ArrowUp    || this.keys.KeyW || this.keys.Space; }
  get jumpPressed() {
    return this.justPressed('ArrowUp') || this.justPressed('KeyW') || this.justPressed('Space');
  }
}
