const canvas = document.getElementById("treeCanvas");
const ctx = canvas.getContext("2d");
const seed = document.getElementById("seed-heart");
const scene = document.getElementById("scene");
const startBtn = document.getElementById("start-btn");
const music = document.getElementById("bg-music");

canvas.width = 900;
canvas.height = 1100;
ctx.scale(2.2, 2.2);

const startDate = new Date(2025, 6, 1);
function updateTimer() {
  const d = Math.abs(new Date() - startDate) / 1000;
  document.getElementById("days").textContent = Math.floor(d / 86400);
  document.getElementById("hours").textContent = Math.floor(d % 86400 / 3600);
  document.getElementById("minutes").textContent = Math.floor(d % 3600 / 60);
  document.getElementById("seconds").textContent = Math.floor(d % 60);
}
setInterval(updateTimer, 1000);

const TREE_X = 200;
const TREE_Y = 460; 
let growth = 0;
const branches = [];
const leaves = [];

function createBranch(x, y, angle, length, depth) {
  if (depth === 0) return;
  const nx = x + Math.cos(angle) * length;
  const ny = y + Math.sin(angle) * length;
  branches.push({ x1: x, y1: y, x2: nx, y2: ny, depth, bend: (Math.random() - 0.5) * 45 });
  
  const spread = 0.65;
  createBranch(nx, ny, angle - spread * 0.8, length * 0.75, depth - 1);
  createBranch(nx, ny, angle, length * 0.7, depth - 1);
  createBranch(nx, ny, angle + spread * 0.8, length * 0.75, depth - 1);
}

function createCircularCanopy(centerX, centerY, radius) {
    for (let i = 0; i < 800; i++) {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius;
        leaves.push({
            x: centerX + Math.cos(angle) * r,
            y: centerY + Math.sin(angle) * r * 0.88,
            size: 1.8 + Math.random() * 3.8,
            color: ["#ff4d6d", "#ff758f", "#ffb3c1", "#c9184a", "#ff0054"][Math.floor(Math.random() * 5)],
            delay: Math.random() * 0.6,
            phase: Math.random() * Math.PI * 2
        });
    }
}

createBranch(TREE_X, TREE_Y, -Math.PI / 2, 100, 5);
createCircularCanopy(TREE_X, 250, 160); 

function drawHeart(x, y, s, c, a) {
  ctx.globalAlpha = a;
  ctx.fillStyle = c;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + s, y - s, x + 2 * s, y + s, x, y + 2 * s);
  ctx.bezierCurveTo(x - 2 * s, y + s, x - s, y - s, x, y);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function render() {
  ctx.clearRect(0, 0, 900, 1100);
  if (growth < 1.2) growth += 0.0035;
  else scene.classList.add("show-text");

  branches.forEach((b, i) => {
    const threshold = (5 - b.depth) / 5 * 0.4;
    if (growth > threshold) {
      const t = Math.min(1, (growth - threshold) * 6);
      ctx.strokeStyle = "#2a9d8f";
      ctx.lineWidth = b.depth * 1.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.quadraticCurveTo((b.x1 + b.x2) / 2 + b.bend, (b.y1 + b.y2) / 2, b.x1 + (b.x2 - b.x1) * t, b.y1 + (b.y2 - b.y1) * t);
      ctx.stroke();
    }
  });

  if (growth > 0.45) {
    leaves.forEach(l => {
      const a = Math.min(1, (growth - 0.45 - l.delay) * 2.5);
      if (a > 0) {
        const w = Math.sin(Date.now() * 0.0015 + l.phase) * 2.2;
        drawHeart(l.x + w, l.y + (w/2), l.size, l.color, a);
      }
    });
  }
  requestAnimationFrame(render);
}

startBtn.addEventListener("click", () => {
  document.getElementById("overlay").style.opacity = 0;
  setTimeout(() => document.getElementById("overlay").remove(), 1000);
  scene.classList.add("active");
  music.play();

  seed.style.opacity = "1";
  
  setTimeout(() => {
      seed.style.transition = "bottom 1.5s cubic-bezier(0.47, 0, 0.745, 0.715)";
      // Posizionato esattamente alla base del tronco (TREE_Y)
      seed.style.bottom = "35px"; 
  }, 100);

  setTimeout(() => {
      growth = 0.01;
      render();
  }, 1600); 
});