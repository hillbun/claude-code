// ============================================================
// 魂斗罗 第一关 Demo
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;

// --- 常量 ---
const GRAVITY = 0.55;
const GROUND_Y = H - 60;
const PLAYER_SPEED = 3.5;
const JUMP_FORCE = -10.5;
const BULLET_SPEED = 8;
const ENEMY_SPEED = 1.2;
const SHOOT_COOLDOWN = 8; // frames

// --- 输入 ---
const keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; e.preventDefault(); });
window.addEventListener('keyup', e => { keys[e.code] = false; e.preventDefault(); });

// --- 工具函数 ---
function rectOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

// --- 平台定义 ---
const platforms = [
  { x: 0,   y: GROUND_Y, w: W, h: 60 },       // 地面
  { x: 150, y: GROUND_Y - 80, w: 120, h: 16 },
  { x: 380, y: GROUND_Y - 140, w: 100, h: 16 },
  { x: 580, y: GROUND_Y - 90,  w: 140, h: 16 },
];

// ============================================================
// 玩家
// ============================================================
function createPlayer() {
  return {
    x: 80, y: GROUND_Y - 40,
    w: 28, h: 38,
    vx: 0, vy: 0,
    facing: 1,        // 1=right, -1=left
    grounded: false,
    shootTimer: 0,
    animFrame: 0,
    animTimer: 0,
  };
}

let player = createPlayer();

function updatePlayer() {
  const p = player;

  // 水平移动
  let moving = false;
  if (keys['ArrowLeft'] || keys['KeyA'])  { p.vx = -PLAYER_SPEED; p.facing = -1; moving = true; }
  else if (keys['ArrowRight'] || keys['KeyD']) { p.vx = PLAYER_SPEED; p.facing = 1; moving = true; }
  else { p.vx = 0; }

  // 跳跃
  if ((keys['Space'] || keys['ArrowUp'] || keys['KeyW']) && p.grounded) {
    p.vy = JUMP_FORCE;
    p.grounded = false;
  }

  // 射击（八方向）
  if (p.shootTimer > 0) p.shootTimer--;
  if (keys['KeyZ'] && p.shootTimer <= 0) {
    shoot();
    p.shootTimer = SHOOT_COOLDOWN;
  }

  // 物理
  p.vy += GRAVITY;
  p.x += p.vx;
  p.y += p.vy;

  // 平台碰撞
  p.grounded = false;
  for (const pl of platforms) {
    if (p.vy >= 0 &&
        p.x + p.w > pl.x && p.x < pl.x + pl.w &&
        p.y + p.h > pl.y && p.y + p.h < pl.y + pl.h + p.vy + 2) {
      p.y = pl.y - p.h;
      p.vy = 0;
      p.grounded = true;
    }
  }

  // 边界
  if (p.x < 0) p.x = 0;
  if (p.x + p.w > W) p.x = W - p.w;
  if (p.y + p.h > GROUND_Y + 60) {
    p.y = GROUND_Y - p.h;
    p.vy = 0;
    p.grounded = true;
  }

  // 走路动画
  if (moving && p.grounded) {
    p.animTimer++;
    if (p.animTimer > 6) { p.animFrame = (p.animFrame + 1) % 4; p.animTimer = 0; }
  } else {
    p.animFrame = 0;
  }
}

function drawPlayer() {
  const p = player;
  ctx.save();
  ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
  if (p.facing === -1) ctx.scale(-1, 1);

  // 身体
  ctx.fillStyle = '#2277dd';
  ctx.fillRect(-p.w / 2, -p.h / 2 + 6, p.w, p.h - 6);

  // 头
  ctx.fillStyle = '#ffcc88';
  ctx.fillRect(-8, -p.h / 2 - 2, 16, 14);

  // 头发/头盔
  ctx.fillStyle = '#884400';
  ctx.fillRect(-9, -p.h / 2 - 4, 18, 6);

  // 腿（走路动画）
  ctx.fillStyle = '#2255aa';
  const legOffset = [0, 2, 0, -2][p.animFrame];
  ctx.fillRect(-6, p.h / 2 - 8, 5, 8 + legOffset);
  ctx.fillRect(1, p.h / 2 - 8, 5, 8 - legOffset);

  // 枪
  ctx.fillStyle = '#888';
  ctx.fillRect(p.w / 2 - 4, -2, 12, 4);

  ctx.restore();
}

// ============================================================
// 子弹 & 八方向射击
// ============================================================
const bullets = [];

function getShootDir() {
  const p = player;
  let dx = p.facing, dy = 0;

  // 上
  if (keys['ArrowUp'] || keys['KeyW']) {
    if (keys['ArrowLeft'] || keys['KeyA'])       { dx = -1; dy = -1; }
    else if (keys['ArrowRight'] || keys['KeyD'])  { dx = 1;  dy = -1; }
    else { dx = 0; dy = -1; }
  }
  // 下（空中才能朝下打）
  else if ((keys['ArrowDown'] || keys['KeyS']) && !p.grounded) {
    if (keys['ArrowLeft'] || keys['KeyA'])       { dx = -1; dy = 1; }
    else if (keys['ArrowRight'] || keys['KeyD'])  { dx = 1;  dy = 1; }
    else { dx = 0; dy = 1; }
  }

  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return { dx: dx / len, dy: dy / len };
}

function shoot() {
  const p = player;
  const dir = getShootDir();
  bullets.push({
    x: p.x + p.w / 2 + dir.dx * 16,
    y: p.y + p.h / 2 + dir.dy * 8 - 4,
    w: 8, h: 4,
    vx: dir.dx * BULLET_SPEED,
    vy: dir.dy * BULLET_SPEED,
  });
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx;
    b.y += b.vy;
    if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) {
      bullets.splice(i, 1);
    }
  }
}

function drawBullets() {
  ctx.fillStyle = '#ffee44';
  for (const b of bullets) {
    ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
  }
}

// ============================================================
// 敌兵
// ============================================================
const enemies = [];
let enemySpawnTimer = 0;
const ENEMY_SPAWN_INTERVAL = 90; // frames

function spawnEnemy() {
  const side = Math.random() < 0.75 ? 1 : -1; // 多从右边出
  const ex = side === 1 ? W + 10 : -30;
  const ey = GROUND_Y - 36 + (Math.random() < 0.3 ? -60 : 0);
  enemies.push({
    x: ex, y: ey,
    w: 24, h: 36,
    vx: -ENEMY_SPEED * side,
    shootTimer: 60 + Math.random() * 60 | 0,
    alive: true,
  });
}

function updateEnemies() {
  enemySpawnTimer++;
  if (enemySpawnTimer >= ENEMY_SPAWN_INTERVAL) {
    spawnEnemy();
    enemySpawnTimer = 0;
  }

  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.x += e.vx;

    // 敌兵出界移除
    if (e.x < -50 || e.x > W + 50) {
      enemies.splice(i, 1);
      continue;
    }

    // 敌兵射击
    e.shootTimer--;
    if (e.shootTimer <= 0) {
      const dx = player.x - e.x;
      const dy = player.y - e.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      enemyBullets.push({
        x: e.x + e.w / 2,
        y: e.y + e.h / 2,
        w: 6, h: 3,
        vx: (dx / dist) * 4,
        vy: (dy / dist) * 4,
      });
      e.shootTimer = 80 + Math.random() * 80 | 0;
    }
  }
}

function drawEnemies() {
  for (const e of enemies) {
    ctx.save();
    ctx.translate(e.x + e.w / 2, e.y + e.h / 2);
    if (e.vx < 0) ctx.scale(-1, 1);

    // 身体
    ctx.fillStyle = '#cc3333';
    ctx.fillRect(-e.w / 2, -e.h / 2 + 6, e.w, e.h - 6);

    // 头
    ctx.fillStyle = '#ffcc88';
    ctx.fillRect(-7, -e.h / 2 - 2, 14, 12);

    // 头盔
    ctx.fillStyle = '#882222';
    ctx.fillRect(-8, -e.h / 2 - 3, 16, 5);

    // 腿
    ctx.fillStyle = '#992222';
    ctx.fillRect(-5, e.h / 2 - 6, 4, 6);
    ctx.fillRect(1, e.h / 2 - 6, 4, 6);

    ctx.restore();
  }
}

// ============================================================
// 敌兵子弹
// ============================================================
const enemyBullets = [];

function updateEnemyBullets() {
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];
    b.x += b.vx;
    b.y += b.vy;
    if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) {
      enemyBullets.splice(i, 1);
    }
  }
}

function drawEnemyBullets() {
  ctx.fillStyle = '#ff4444';
  for (const b of enemyBullets) {
    ctx.fillRect(b.x - b.w / 2, b.y - b.h / 2, b.w, b.h);
  }
}

// ============================================================
// 爆炸特效
// ============================================================
const explosions = [];

function addExplosion(x, y) {
  explosions.push({ x, y, frame: 0, maxFrame: 12 });
}

function updateExplosions() {
  for (let i = explosions.length - 1; i >= 0; i--) {
    explosions[i].frame++;
    if (explosions[i].frame >= explosions[i].maxFrame) explosions.splice(i, 1);
  }
}

function drawExplosions() {
  for (const e of explosions) {
    const t = e.frame / e.maxFrame;
    const r = 8 + t * 18;
    ctx.globalAlpha = 1 - t;
    ctx.fillStyle = '#ff8800';
    ctx.beginPath();
    ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffee44';
    ctx.beginPath();
    ctx.arc(e.x, e.y, r * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ============================================================
// 碰撞检测
// ============================================================
let score = 0;
let lives = 3;
let invincibleTimer = 0;

function checkCollisions() {
  // 子弹 vs 敌兵
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    for (let j = enemies.length - 1; j >= 0; j--) {
      const e = enemies[j];
      if (rectOverlap(
        { x: b.x - b.w / 2, y: b.y - b.h / 2, w: b.w, h: b.h },
        { x: e.x, y: e.y, w: e.w, h: e.h }
      )) {
        addExplosion(e.x + e.w / 2, e.y + e.h / 2);
        enemies.splice(j, 1);
        bullets.splice(i, 1);
        score += 100;
        break;
      }
    }
  }

  // 敌兵子弹 vs 玩家
  if (invincibleTimer > 0) { invincibleTimer--; return; }
  for (let i = enemyBullets.length - 1; i >= 0; i--) {
    const b = enemyBullets[i];
    if (rectOverlap(
      { x: b.x - b.w / 2, y: b.y - b.h / 2, w: b.w, h: b.h },
      { x: player.x, y: player.y, w: player.w, h: player.h }
    )) {
      enemyBullets.splice(i, 1);
      lives--;
      invincibleTimer = 90;
      addExplosion(player.x + player.w / 2, player.y + player.h / 2);
      if (lives <= 0) {
        gameOver = true;
      }
      break;
    }
  }
}

// ============================================================
// 背景绘制
// ============================================================
function drawBackground() {
  // 天空渐变
  const grad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  grad.addColorStop(0, '#1a0a2e');
  grad.addColorStop(0.5, '#2d1b4e');
  grad.addColorStop(1, '#0d3b1d');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, GROUND_Y);

  // 远景山
  ctx.fillStyle = '#0a2a12';
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(80, GROUND_Y - 100);
  ctx.lineTo(200, GROUND_Y - 60);
  ctx.lineTo(350, GROUND_Y - 130);
  ctx.lineTo(500, GROUND_Y - 80);
  ctx.lineTo(650, GROUND_Y - 110);
  ctx.lineTo(W, GROUND_Y - 50);
  ctx.lineTo(W, GROUND_Y);
  ctx.fill();

  // 平台
  ctx.fillStyle = '#3a6a2a';
  for (const p of platforms) {
    ctx.fillRect(p.x, p.y, p.w, p.h);
    // 平台顶边高光
    ctx.fillStyle = '#5a9a3a';
    ctx.fillRect(p.x, p.y, p.w, 3);
    ctx.fillStyle = '#3a6a2a';
  }

  // 地面纹理
  ctx.fillStyle = '#2a5a1a';
  ctx.fillRect(0, GROUND_Y, W, 60);
}

// ============================================================
// HUD 更新
// ============================================================
function updateHUD() {
  document.getElementById('score').textContent = 'SCORE: ' + score;
  document.getElementById('lives').textContent = 'LIVES: ' + lives;
}

// ============================================================
// 游戏状态
// ============================================================
let gameOver = false;
let gameStarted = false;

function resetGame() {
  player = createPlayer();
  bullets.length = 0;
  enemies.length = 0;
  enemyBullets.length = 0;
  explosions.length = 0;
  score = 0;
  lives = 3;
  invincibleTimer = 0;
  enemySpawnTimer = 0;
  gameOver = false;
}

function drawTitleScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.7)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#ff4444';
  ctx.font = 'bold 48px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('CONTRA', W / 2, H / 2 - 40);

  ctx.fillStyle = '#fff';
  ctx.font = '18px Courier New';
  ctx.fillText('第一关 DEMO', W / 2, H / 2);

  ctx.fillStyle = '#aaa';
  ctx.font = '14px Courier New';
  ctx.fillText('按 ENTER 开始游戏', W / 2, H / 2 + 40);
}

function drawGameOverScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.75)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#ff2222';
  ctx.font = 'bold 42px Courier New';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', W / 2, H / 2 - 20);

  ctx.fillStyle = '#fff';
  ctx.font = '16px Courier New';
  ctx.fillText('SCORE: ' + score, W / 2, H / 2 + 20);
  ctx.fillStyle = '#aaa';
  ctx.font = '14px Courier New';
  ctx.fillText('按 ENTER 重新开始', W / 2, H / 2 + 55);
}

// ============================================================
// 主循环
// ============================================================
function gameLoop() {
  if (!gameStarted) {
    drawBackground();
    drawTitleScreen();
    if (keys['Enter']) gameStarted = true;
    requestAnimationFrame(gameLoop);
    return;
  }

  if (gameOver) {
    drawGameOverScreen();
    if (keys['Enter']) resetGame();
    requestAnimationFrame(gameLoop);
    return;
  }

  // 更新
  updatePlayer();
  updateBullets();
  updateEnemies();
  updateEnemyBullets();
  updateExplosions();
  checkCollisions();
  updateHUD();

  // 绘制
  drawBackground();
  drawBullets();
  drawEnemyBullets();
  drawEnemies();

  // 无敌闪烁
  if (invincibleTimer <= 0 || (invincibleTimer % 6 < 3)) {
    drawPlayer();
  }

  drawExplosions();

  requestAnimationFrame(gameLoop);
}

// 启动
gameLoop();
