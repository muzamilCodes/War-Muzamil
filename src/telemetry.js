// ===================================================================
// TELEMETRY & SHIPPING BEHAVIOUR MODULE
// Features: Realtime Canvas FPS chart (time vs fps, 30/60/90 markings),
// live UTC clock, dynamic latency jitter, hero HUD mirroring.
// ===================================================================

const fpsHistory = new Array(60).fill(72);
let lastFrameTime = performance.now();
let frameCount = 0;
let currentFps = 72;

export function initTelemetry() {
  const canvas = document.getElementById('telemetry-fps-canvas');
  const headerClock = document.getElementById('header-utc-clock');
  const headerLatency = document.getElementById('header-latency');
  const headerFps = document.getElementById('header-fps');
  const sustainedFpsEl = document.getElementById('telemetry-sustained-fps');

  // 1. Live UTC Clock Update Loop
  function updateClock() {
    const now = new Date();
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');
    const utcStr = `${hours}:${minutes}:${seconds} UTC`;

    if (headerClock) {
      headerClock.textContent = utcStr;
    }
  }
  setInterval(updateClock, 1000);
  updateClock();

  // 2. Realistic Jittering Latency Readout
  function updateLatency() {
    // Realistic jitter between 11ms and 16ms
    const latency = 11 + Math.floor(Math.random() * 6);
    if (headerLatency) {
      headerLatency.textContent = `${latency}ms`;
    }
  }
  setInterval(updateLatency, 2500);

  // 3. FPS Calculation Loop
  function measureFps(now) {
    frameCount++;
    const delta = now - lastFrameTime;

    if (delta >= 500) {
      currentFps = Math.min(90, Math.round((frameCount * 1000) / delta));
      // Clamp for realistic demonstration between 60 and 75 fps
      currentFps = Math.max(58, Math.min(84, currentFps));

      fpsHistory.push(currentFps);
      fpsHistory.shift();

      if (headerFps) headerFps.textContent = `${currentFps} FPS`;
      if (sustainedFpsEl) sustainedFpsEl.textContent = `${currentFps} FPS`;

      frameCount = 0;
      lastFrameTime = now;
    }

    drawFpsGraph(canvas);
    requestAnimationFrame(measureFps);
  }
  requestAnimationFrame(measureFps);
}

function drawFpsGraph(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;

  ctx.clearRect(0, 0, width, height);

  // Grid lines: 30, 60, 90 FPS
  const y90 = height * 0.12;
  const y60 = height * 0.48;
  const y30 = height * 0.84;

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);

  [y90, y60, y30].forEach((y) => {
    ctx.beginPath();
    ctx.moveTo(40, y);
    ctx.lineTo(width - 10, y);
    ctx.stroke();
  });

  ctx.setLineDash([]); // Reset dash

  // Draw FPS Plot Line
  const stepX = (width - 60) / (fpsHistory.length - 1);
  const startX = 45;

  ctx.beginPath();
  fpsHistory.forEach((val, idx) => {
    // Map value (0 to 100) to height (height - 20 to 10)
    const normalizedY = height - 20 - ((val - 20) / 75) * (height - 40);
    const x = startX + idx * stepX;

    if (idx === 0) {
      ctx.moveTo(x, normalizedY);
    } else {
      ctx.lineTo(x, normalizedY);
    }
  });

  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0; // reset shadow

  // Gradient area fill underneath line
  const lastX = startX + (fpsHistory.length - 1) * stepX;
  const firstNormY = height - 20 - ((fpsHistory[0] - 20) / 75) * (height - 40);

  ctx.lineTo(lastX, height - 10);
  ctx.lineTo(startX, height - 10);
  ctx.closePath();

  const fillGradient = ctx.createLinearGradient(0, y90, 0, height);
  fillGradient.addColorStop(0, 'rgba(0, 255, 136, 0.25)');
  fillGradient.addColorStop(1, 'rgba(0, 255, 136, 0.01)');
  ctx.fillStyle = fillGradient;
  ctx.fill();

  // Current marker dot at latest point
  const currentVal = fpsHistory[fpsHistory.length - 1];
  const currentY = height - 20 - ((currentVal - 20) / 75) * (height - 40);

  ctx.beginPath();
  ctx.arc(lastX, currentY, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#00ff88';
  ctx.lineWidth = 2;
  ctx.stroke();
}
