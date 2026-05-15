// ── MATRIX RAIN ───────────────────────────────────────────
const canvas  = document.getElementById('matrix-rain');
const ctx     = canvas.getContext('2d');
const chars   = '01010110010001000001011010110101010001001011010100010101';
const fontSize = 15;

canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;

let cols  = Math.floor(canvas.width / fontSize);
let drops = Array(cols).fill(1);

window.addEventListener('resize', () => {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  cols  = Math.floor(canvas.width / fontSize);
  drops = Array(cols).fill(1);
});

function drawRain() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#00FF41';
  ctx.font      = fontSize + 'px monospace';

  for (let i = 0; i < drops.length; i++) {
    const char = chars[Math.floor(Math.random() * chars.length)];
    ctx.fillText(char, i * fontSize, drops[i] * fontSize);
    if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  }
}

setInterval(drawRain, 45);

// ── PAGE NAVIGATION ───────────────────────────────────────
function goTo(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
  if (pageId === 'page-5') setTimeout(triggerPage5, 600);
}

// ── PAGE 5 GLITCH SEQUENCE ────────────────────────────────
function triggerPage5() {
  const page5    = document.getElementById('page-5');
  const blackout = document.getElementById('p5-blackout');
  const restart  = document.getElementById('p5-restart');

  page5.classList.add('glitching');

  setTimeout(() => {
    page5.classList.remove('glitching');
    blackout.classList.add('active');
  }, 2500);

  setTimeout(() => {
    restart.style.display = 'block';
    setTimeout(() => restart.classList.add('visible'), 50);
  }, 3800);
}

// ── RESTART ───────────────────────────────────────────────
function restartRoom() {
  document.getElementById('p5-blackout').classList.remove('active');
  document.getElementById('p5-restart').classList.remove('visible');
  document.getElementById('p5-restart').style.display = 'none';
  document.getElementById('page-5').classList.remove('glitching');
  goTo('page-1');
}
