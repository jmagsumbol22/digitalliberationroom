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
// Left third  = Challenge 1 passed (page 4)
// Right third = Challenge 2 passed (page 5)
// Center      = Challenge 3 passed (page 6A or 6B)
const reveal = { left: 0, center: 0, right: 0 };
const target = { left: 0, center: 0, right: 0 };
const SPEED  = 0.0018; // ~30 seconds to fully reveal each section

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

// ─── WHICH PAGES SHOW THE LIBRARY EFFECT ──────────────────────────
const MATRIX_PAGES = new Set([
  'page-2', 'page-3', 'page-3a',
  'page-4', 'page-4a', 'page-5',
  'page-6a', 'page-6b'
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

  // Fade everything toward black each frame
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Accumulate library image into revealed sections frame by frame
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
        ctx.globalAlpha = p * 0.055; // accumulates to ~full brightness over time
        ctx.drawImage(libraryImg, 0, 0, canvas.width, canvas.height);
        ctx.restore();
      }
    });
  }

  // Rain characters
  ctx.font = `${fontSize}px monospace`;

  drops.forEach((y, i) => {
    const x   = i * fontSize;
    const yPx = y * fontSize;
    const r   = showLib ? revealAt(x) : 0;

    // Thin out rain as each section reveals
    if (r > 0 && Math.random() < r * 0.97) {
      if (yPx > canvas.height && Math.random() > 0.975) drops[i] = 0;
      drops[i]++;
      return;
    }

    const char = chars[Math.floor(Math.random() * chars.length)];

    if (showLib) {
      // Character brightness follows library pixel brightness —
      // bright areas (skylight, marble floor) glow brighter,
      // dark areas (shadowed shelves) glow dimmer
      const b   = pixelBrightness(x, yPx);
      const g   = Math.floor(80 + b * 175);
      const a   = 0.15 + b * 0.65;
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

// ─── NAVIGATION + REVEAL TRIGGERS ─────────────────────────────────
function goTo(pageId) {
  // Each successful challenge path forward reveals one section of the library
  if (pageId === 'page-4')                           target.left   = 1; // Challenge 1 passed
  if (pageId === 'page-5')                           target.right  = 1; // Challenge 2 passed
  if (pageId === 'page-6a' || pageId === 'page-6b') target.center = 1; // Challenge 3 passed

  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}
