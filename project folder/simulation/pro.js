const canvas = document.getElementById("simCanvas");
const ctx = canvas.getContext("2d");

/* ===== AXIS SPACING ===== */
const axisPadding = {
  left: 60,
  bottom: 50,
  top: 30,
  right: 30
};

let launchX, launchY;

/* ===== RESIZE CANVAS ===== */
function resizeCanvas() {
  const pad = 20;
  canvas.width = canvas.parentElement.clientWidth - pad * 2;
  canvas.height = canvas.parentElement.clientHeight - pad * 2;

  launchX = axisPadding.left;
  launchY = canvas.height - axisPadding.bottom;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ===== CONTROLS ===== */
const speedInput = document.getElementById("speed");
const angleInput = document.getElementById("angle");
const gravityInput = document.getElementById("gravity");
const zoomInput = document.getElementById("zoom");

let running = false;
let t = 0;
let posX = 0, posY = 0;
let vx = 0, vy = 0;
let g = 9.8;
let zoom = 80;

let trace = [];
let prevTrace = [];

/* ===== RESULTS ===== */
function calculateResults() {
  const v = +speedInput.value;
  const a = +angleInput.value * Math.PI / 180;
  const gval = +gravityInput.value;

  document.getElementById("rangeVal").textContent =
    ((v * v * Math.sin(2 * a)) / gval).toFixed(2);

  document.getElementById("tofVal").textContent =
    ((2 * v * Math.sin(a)) / gval).toFixed(2);

  document.getElementById("hmaxVal").textContent =
    ((v * v * Math.sin(a) ** 2) / (2 * gval)).toFixed(2);
}

/* ===== SIMULATION ===== */
function startSim() {
  t = 0;
  g = +gravityInput.value;

  const v = +speedInput.value;
  const a = +angleInput.value * Math.PI / 180;

  vx = v * Math.cos(a);
  vy = v * Math.sin(a);

  posX = 0;
  posY = 0;

  if (trace.length > 1) prevTrace = [...trace];
  trace = [];
  running = true;
}

function resetSim() {
  running = false;
  t = 0;

  // RESET POSITION
  posX = 0;
  posY = 0;

  // RESET VELOCITY
  vx = 0;
  vy = 0;

  // CLEAR TRAJECTORIES
  trace = [];
  prevTrace = [];
}


// function resetSim() {
//   running = false;
//   t = 0;
//   trace = [];
// }

/* ===== SPEED CONTROL ===== */
const timeScale = 6.5;

/* ===== UPDATE ===== */
function update(dt) {
    if (!running) return;

    t += dt * timeScale;

    posX = vx * t;
    posY = vy * t - 0.5 * g * t * t;

    trace.push({ x: posX, y: posY });

    if (posY <= 0) {
      posY = 0;     // LOCK on x-axis
      running = false;
    }

  }

/* ===== DRAW ===== */
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  /* AXES */
  ctx.strokeStyle = "#000";

  /* ===== AXIS LINES (FULL LENGTH) ===== */

  // X-axis → touch right edge
  ctx.beginPath();
  ctx.moveTo(launchX, launchY);
  ctx.lineTo(canvas.width, launchY);
  ctx.stroke();

  // Y-axis → touch top edge
  ctx.beginPath();
  ctx.moveTo(launchX, 0);
  ctx.lineTo(launchX, launchY);
  ctx.stroke();


  ctx.save();
  ctx.translate(launchX, launchY);
  ctx.scale(zoom / 60, zoom / 60);

  /* SCALE MARKS */
  ctx.font = "10px Arial";

  for (let m = 100; m <= 1000; m += 100) {
    if (launchX + m * (zoom / 60) > canvas.width - 20) break;
    ctx.beginPath();
    ctx.moveTo(m, -4);
    ctx.lineTo(m, 4);
    ctx.stroke();
    ctx.fillText(m + " m", m - 14, 16);
  }

  for (let h = 50; h <= 600; h += 50) {
    if (launchY - h * (zoom / 60) < 20) break;
    ctx.beginPath();
    ctx.moveTo(-4, -h);
    ctx.lineTo(4, -h);
    ctx.stroke();
    ctx.fillText(h + " m", -38, -h + 4);
  }

  /* PREVIOUS TRACE */
  if (prevTrace.length > 1) {
    ctx.setLineDash([2, 6]);
    ctx.strokeStyle = "gray";
    ctx.beginPath();
    ctx.moveTo(prevTrace[0].x, -prevTrace[0].y);
    prevTrace.forEach(p => ctx.lineTo(p.x, -p.y));
    ctx.stroke();
  }

  /* CURRENT TRACE */
  if (trace.length > 1) {
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(trace[0].x, -trace[0].y);
    trace.forEach(p => ctx.lineTo(p.x, -p.y));
    ctx.stroke();
  }

  ctx.setLineDash([]);

  /* PROJECTILE */
  ctx.beginPath();
  ctx.arc(posX, -posY, 8, 0, Math.PI * 2);
  ctx.fillStyle = "red";
  ctx.fill();

  ctx.restore();
}

/* ===== LOOP ===== */
function loop() {
  update(0.016);
  draw();
  requestAnimationFrame(loop);
}

/* ===== EVENTS ===== */
zoomInput.oninput = () => zoom = +zoomInput.value;
document.getElementById("startBtn").onclick = () => { calculateResults(); startSim(); };
document.getElementById("pauseBtn").onclick = () => {
    if (posY === 0 && t !== 0) return; // projectile already landed
    running = !running;
  };
document.getElementById("resetBtn").onclick = resetSim;

loop();
