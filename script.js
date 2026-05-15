// ─── CANVAS SETUP ─────────────────────────────────────────────────
const canvas  = document.getElementById('matrix-rain');
const ctx     = canvas.getContext('2d');
const chars   = '01010110010001000001011010110101010001001011010100010101';
const fontSize = 15;

let cols  = Math.floor(window.innerWidth  / fontSize);
let drops = Array(cols).fill(1);

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  cols  = Math.floor(canvas.width / fontSize);
  drops = Array(cols).fill(1);
  sampleLibrary();
});

// ─── LIBRARY IMAGE ────────────────────────────────────────────────
const libraryImg = new Image();
let pixelData    = null;
let libraryReady = false;

libraryImg.onload = sampleLibrary;
libraryImg.src    = 'images/library.jpg';

function sampleLibrary() {
  if (!libraryImg.naturalWidth || !canvas.width) return;
  const off    = document.createElement('canvas');
  off.width    = canvas.width;
  off.height   = canvas.height;
  const offCtx = off.getContext('2d');
  offCtx.drawImage(libraryImg, 0, 0, canvas.width, canvas.height);
  pixelData    = offCtx.getImageData(0, 0, canvas.width, canvas.height).data;
  libraryReady = true;
}

function pixelBrightness(x, y) {
  if (!pixelData) return 0.5;
  const px = Math.max(0, Math.min(Math.floor(x), canvas.width  - 1));
  const py = Math.max(0, Math.min(Math.floor(y), canvas.height - 1));
  const i  = (py * canvas.width + px) * 4;
  return (pixelData[i] * 0.299 + pixelData[i + 1] * 0.587 + pixelData[i + 2] * 0.114) / 255;
}

// ─── REVEAL STATE ─────────────────────────────────────────────────
// left   = Challenge 1 passed (page-3 reached via red pill)
// right  = Challenge 2 passed (page-4 reached via red pill)
// center = Challenge 3 passed (page-5 reached)
const reveal = { left: 0, center: 0, right: 0 };
const target = { left: 0, center: 0, right: 0 };
const SPEED  = 0.0018;

function updateReveal() {
  ['left', 'center', 'right'].forEach(k => {
    if (reveal[k] < target[k])
      reveal[k] = Math.min(target[k], reveal[k] + SPEED);
  });
}

function revealAt(x) {
  const t = canvas.width / 3;
  if (x < t)     return reveal.left;
  if (x > t * 2) return reveal.right;
  return reveal.center;
}

// ─── MATRIX PAGES ─────────────────────────────────────────────────
const MATRIX_PAGES = new Set([
  'page-1', 'page-2', 'page-3', 'page-4', 'page-5'
]);

function onMatrixPage() {
  const a = document.querySelector('.page.active');
  return a && MATRIX_PAGES.has(a.id);
}

// ─── DRAW LOOP ────────────────────────────────────────────────────
function draw() {
  updateReveal();

  const matrixPage = onMatrixPage();
  const showLib    = matrixPage && libraryReady;
  const t          = canvas.width / 3;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (showLib) {
    [
      ['left',   0,     t],
      ['center', t,     t],
      ['right',  t * 2, t],
    ].forEach(([key, sx, sw]) => {
      const p = reveal[key];
      if (p > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(sx, 0, sw, canvas.height);
        ctx.clip();
        ctx.globalAlpha = p * 0.055;
        ctx.drawImage(libraryImg, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    });
  }

  ctx.font = `${fontSize}px monospace`;

  drops.forEach((y, i) => {
    const x   = i * fontSize;
    const yPx = y * fontSize;
    const r   = showLib ? revealAt(x) : 0;

    if (r > 0 && Math.random() < r * 0.97) {
      if (yPx > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
      return;
    }

    const char = chars[Math.floor(Math.random() * chars.length)];

    if (showLib) {
      const b = pixelBrightness(x, yPx);
      const g = Math.floor(80 + b * 175);
      const a = 0.15 + b * 0.65;
      ctx.fillStyle = `rgba(0, ${g}, ${Math.floor(b * 60)}, ${a})`;
    } else {
      ctx.fillStyle = 'rgba(0, 255, 65, 0.75)';
    }

    ctx.fillText(char, x, yPx);

    if (yPx > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  });
}

setInterval(draw, 45);

// ─── PAGE 5 GLITCH SEQUENCE ───────────────────────────────────────
function triggerPage5() {
  const page5    = document.getElementById('page-5');
  const blackout = document.getElementById('p5-blackout');
  const restart  = document.getElementById('p5-restart');

  // Fire intense glitch immediately
  page5.classList.add('glitching');

  // Cut to black after 2.5 seconds
  setTimeout(() => {
    page5.classList.remove('glitching');
    blackout.classList.add('active');
  }, 2500);

  // Fade in restart button after blackout settles
  setTimeout(() => {
    restart.style.display = 'block';
    setTimeout(() => restart.classList.add('visible'), 50);
  }, 3800);
}

// ─── RESTART ──────────────────────────────────────────────────────
function restartRoom() {
  reveal.left = reveal.center = reveal.right = 0;
  target.left = target.center = target.right = 0;

  const blackout = document.getElementById('p5-blackout');
  const restart  = document.getElementById('p5-restart');
  blackout.classList.remove('active');
  restart.classList.remove('visible');
  restart.style.display = 'none';
  document.getElementById('page-5').classList.remove('glitching');

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-1').classList.add('active');
}

// ─── NAVIGATION ───────────────────────────────────────────────────
function goTo(pageId) {
  // Red pill progress triggers library reveal, left to right
  if (pageId === 'page-3') target.left   = 1;
  if (pageId === 'page-4') target.right  = 1;
  if (pageId === 'page-5') target.center = 1;

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');

  if (pageId === 'page-5') setTimeout(triggerPage5, 600);
}
