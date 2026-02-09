const canvas = document.getElementById("treeCanvas");
const ctx = canvas.getContext("2d");
const seed = document.getElementById("seed-heart");
const scene = document.getElementById("scene");
const startBtn = document.getElementById("start-btn");
const music = document.getElementById("bg-music");

canvas.width = 840;
canvas.height = 1040;
ctx.scale(2, 2);

// ✅ TIMER
const startDate = new Date(2025, 6, 1);
function updateTimer() {
  const d = Math.abs(new Date() - startDate) / 1000;
  document.getElementById("days").textContent = Math.floor(d / 86400);
  document.getElementById("hours").textContent = Math.floor(d % 86400 / 3600);
  document.getElementById("minutes").textContent = Math.floor(d % 3600 / 60);
  document.getElementById("seconds").textContent = Math.floor(d % 60);
}
setInterval(updateTimer, 1000);
updateTimer();

// 🌱 CONFIGURAZIONE ALBERO
let growthProgress = 0; 
const branches = [];
const leaves = [];

// 1. Genera i rami (struttura naturale)
function createTreeStructure(x, y, angle, length, depth) {
    if (depth === 0) return;

    const x2 = x + Math.cos(angle) * length;
    const y2 = y + Math.sin(angle) * length;

    branches.push({ 
        x1: x, y1: y, x2: x2, y2: y2, 
        depth: depth, 
        thickness: depth * 1.4 
    });

    const numBranches = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numBranches; i++) {
        createTreeStructure(
            x2, y2, 
            angle + (Math.random() - 0.5) * 0.7, 
            length * (0.75 + Math.random() * 0.15), 
            depth - 1
        );
    }
}

// 2. Genera la chioma (600 cuori disposti a cerchio)
function createLeafCloud(centerX, centerY, radius) {
    for (let i = 0; i < 600; i++) {
        // Distribuzione circolare (Polar coordinates)
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * radius; // sqrt per densità uniforme
        
        leaves.push({
            x: centerX + Math.cos(angle) * r,
            y: centerY + Math.sin(angle) * r * 0.8, // leggermente schiacciato
            size: 2 + Math.random() * 4,
            color: ["#ff4d6d", "#ff758f", "#ffb3c1", "#c9184a", "#ff0054"][Math.floor(Math.random() * 5)],
            delay: Math.random(), // ordine di apparizione casuale
            phase: Math.random() * Math.PI * 2 // per l'oscillazione
        });
    }
}

// Inizializzazione struttura
createTreeStructure(210, 480, -Math.PI / 2, 65, 6);
createLeafCloud(210, 320, 150); // Centro della chioma e raggio

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
    ctx.clearRect(0, 0, 420, 520);
    
    if (growthProgress > 0) {
        growthProgress += 0.004; // Velocità totale

        // Disegna Rami
        branches.forEach((b, index) => {
            const branchThreshold = (index / branches.length) * 0.6; // i rami finiscono al 60% del tempo
            if (growthProgress > branchThreshold) {
                const localProgress = Math.min(1, (growthProgress - branchThreshold) * 8);
                ctx.strokeStyle = "#2a9d8f";
                ctx.lineWidth = b.thickness;
                ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(b.x1, b.y1);
                ctx.lineTo(
                    b.x1 + (b.x2 - b.x1) * localProgress,
                    b.y1 + (b.y2 - b.y1) * localProgress
                );
                ctx.stroke();
            }
        });

        // Disegna Chioma (inizia quando i rami sono quasi pronti)
        if (growthProgress > 0.5) {
            leaves.forEach(l => {
                // I cuori sbocciano tra il 50% e il 100% del progresso
                const leafAlpha = Math.min(1, (growthProgress - 0.5 - l.delay * 0.4) * 4);
                if (leafAlpha > 0) {
                    const wobble = Math.sin(Date.now() * 0.002 + l.phase) * 2;
                    drawHeart(l.x + wobble, l.y + (wobble/2), l.size, l.color, leafAlpha);
                }
            });
        }
    }

    if (growthProgress >= 1.1) {
        scene.classList.add("show-text");
    }

    requestAnimationFrame(render);
}

// 🎬 ATTIVAZIONE
startBtn.addEventListener('click', () => {
    document.getElementById("overlay").style.opacity = "0";
    setTimeout(() => document.getElementById("overlay").remove(), 1000);
    scene.classList.add("active");
    music.play();

    setTimeout(() => seed.classList.add("fall"), 500);
    setTimeout(() => {
        growthProgress = 0.01;
        render();
    }, 2500);
});