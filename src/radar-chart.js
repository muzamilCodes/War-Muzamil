// ===================================================================
// WAR MUZAMIL TECHNOLOGY RADAR COMPONENT
// Features: Real competency matrix across modern full-stack web,
// animated neon polygon, concentric rings, and hover tooltips.
// ===================================================================

import { playBlip } from './audio.js';

export const radarData = [
  { name: 'React / Next.js', score: 96, desc: 'App Router, SSR, Server Components, State Management, Custom Hooks' },
  { name: 'Node / Express', score: 94, desc: 'RESTful API architectures, JWT auth, middleware, microservices' },
  { name: 'MongoDB / DB', score: 92, desc: 'Mongoose schemas, aggregation pipelines, PostgreSQL relational modeling' },
  { name: 'TypeScript / JS', score: 90, desc: 'Strict typing, ES Modules, async pipelines, OOP and functional design' },
  { name: 'Tailwind CSS', score: 96, desc: 'Responsive mobile-first systems, glassmorphism, 3D transforms, animations' }
];

export function initRadarChart() {
  const svg = document.getElementById('radar-chart-svg');
  if (!svg) return;

  const center = { x: 250, y: 250 };
  const maxRadius = 170;
  const numAxes = radarData.length;
  const angleStep = (Math.PI * 2) / numAxes;

  // 1. Draw Concentric Grid Rings
  const gridRingsGroup = svg.querySelector('.radar-grid-rings');
  if (gridRingsGroup) {
    gridRingsGroup.innerHTML = '';
    [0.2, 0.4, 0.6, 0.8, 1.0].forEach((level) => {
      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const ringRadius = maxRadius * level;
      const points = [];

      for (let i = 0; i < numAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = center.x + ringRadius * Math.cos(angle);
        const y = center.y + ringRadius * Math.sin(angle);
        points.push(`${x.toFixed(1)},${y.toFixed(1)}`);
      }

      polygon.setAttribute('points', points.join(' '));
      polygon.setAttribute('class', `grid-ring ring-${Math.round(level * 100)}`);
      gridRingsGroup.appendChild(polygon);
    });
  }

  // 2. Draw Spokes
  const spokesGroup = svg.querySelector('.radar-spokes');
  if (spokesGroup) {
    spokesGroup.innerHTML = '';
    for (let i = 0; i < numAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = center.x + maxRadius * Math.cos(angle);
      const y = center.y + maxRadius * Math.sin(angle);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', center.x);
      line.setAttribute('y1', center.y);
      line.setAttribute('x2', x);
      line.setAttribute('y2', y);
      line.setAttribute('class', 'radar-spoke');
      spokesGroup.appendChild(line);
    }
  }

  // 3. Compute Data Polygon Points
  const dataPolygon = document.getElementById('radar-data-polygon');
  const verticesGroup = document.getElementById('radar-vertices');
  const labelsGroup = document.getElementById('radar-labels');
  const tooltip = document.getElementById('radar-tooltip');

  if (verticesGroup) verticesGroup.innerHTML = '';
  if (labelsGroup) labelsGroup.innerHTML = '';

  const polygonPoints = [];

  radarData.forEach((item, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const distance = (item.score / 100) * maxRadius;
    const x = center.x + distance * Math.cos(angle);
    const y = center.y + distance * Math.sin(angle);

    polygonPoints.push(`${x.toFixed(1)},${y.toFixed(1)}`);

    // Vertex Circle Pin
    if (verticesGroup) {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '6');
      circle.setAttribute('class', 'radar-vertex-circle');
      circle.setAttribute('data-index', index);

      circle.addEventListener('mouseenter', (e) => {
        showTooltip(item, e);
        highlightStatRow(index);
        playBlip(750 + index * 70);
      });
      circle.addEventListener('mouseleave', () => {
        hideTooltip();
        resetStatRows();
      });

      verticesGroup.appendChild(circle);
    }

    // Outer Axis Text Label
    if (labelsGroup) {
      const labelRadius = maxRadius + 30;
      const lx = center.x + labelRadius * Math.cos(angle);
      const ly = center.y + labelRadius * Math.sin(angle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', lx);
      text.setAttribute('y', ly);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('class', 'radar-label-text');
      text.setAttribute('data-index', index);
      text.textContent = `${item.name} (${item.score})`;

      text.addEventListener('mouseenter', (e) => {
        showTooltip(item, e);
        highlightStatRow(index);
        playBlip(800);
      });
      text.addEventListener('mouseleave', () => {
        hideTooltip();
        resetStatRows();
      });

      labelsGroup.appendChild(text);
    }
  });

  if (dataPolygon) {
    dataPolygon.setAttribute('points', polygonPoints.join(' '));
  }

  // Hook up hover interaction on the skill rows
  const statRows = document.querySelectorAll('.skill-stat-row');
  statRows.forEach((row) => {
    const idx = parseInt(row.getAttribute('data-skill-idx'));
    row.addEventListener('mouseenter', () => {
      highlightVertex(idx);
      playBlip(700 + idx * 50);
    });
    row.addEventListener('mouseleave', () => {
      resetVertices();
    });
  });

  function showTooltip(item) {
    if (!tooltip) return;
    tooltip.hidden = false;
    tooltip.querySelector('.tooltip-skill-name').textContent = item.name;
    tooltip.querySelector('.tooltip-skill-score').textContent = `Proficiency: ${item.score}/100`;
    tooltip.querySelector('.tooltip-skill-desc').textContent = item.desc;
  }

  function hideTooltip() {
    if (tooltip) tooltip.hidden = true;
  }

  function highlightStatRow(idx) {
    statRows.forEach((r, i) => {
      r.classList.toggle('active', i === idx);
    });
  }

  function resetStatRows() {
    statRows.forEach((r) => r.classList.remove('active'));
  }

  function highlightVertex(idx) {
    const circles = svg.querySelectorAll('.radar-vertex-circle');
    const labels = svg.querySelectorAll('.radar-label-text');
    circles.forEach((c) => {
      c.classList.toggle('active', parseInt(c.getAttribute('data-index')) === idx);
    });
    labels.forEach((l) => {
      l.classList.toggle('active', parseInt(l.getAttribute('data-index')) === idx);
    });
  }

  function resetVertices() {
    svg.querySelectorAll('.radar-vertex-circle').forEach((c) => c.classList.remove('active'));
    svg.querySelectorAll('.radar-label-text').forEach((l) => l.classList.remove('active'));
  }
}
