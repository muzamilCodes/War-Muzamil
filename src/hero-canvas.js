// ===================================================================
// THREE.JS HERO WEBGL CORE
// Features: Rotating wireframe icosahedron/shapes, bounded particle dust,
// pointer parallax, neon palette switcher, wireframe/surface/points modes.
// ===================================================================

import * as THREE from 'three';

let scene, camera, renderer, animationFrameId;
let coreGroup, coreMesh, particleSystem;
let currentGeometryType = 'icosahedron';
let currentRenderMode = 'wireframe';
let activeNeonColor = 0x00f0ff;
let particleSpeedMultiplier = 1.0;
let parallaxGain = 1.0;

// Pointer parallax state
const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
let isReducedMotion = false;

export function initHeroCanvas() {
  const canvas = document.getElementById('hero-webgl-canvas');
  if (!canvas) return;

  const container = document.getElementById('hero-canvas-container');
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  // Scene setup
  scene = new THREE.Scene();

  // Camera setup
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.z = 6.2;

  // WebGL Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const pointLight1 = new THREE.PointLight(activeNeonColor, 4, 20);
  pointLight1.position.set(5, 5, 5);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xff007f, 3, 20);
  pointLight2.position.set(-5, -5, -2);
  scene.add(pointLight2);

  // Group for parallax & rotation
  coreGroup = new THREE.Group();
  scene.add(coreGroup);

  // Check prefers-reduced-motion
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  isReducedMotion = mediaQuery.matches;
  mediaQuery.addEventListener('change', (e) => {
    isReducedMotion = e.matches;
  });

  // Build Initial Core Mesh & Particle Nebula
  buildCoreMesh();
  buildParticleDust();

  // Pointer move listener for Parallax
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', onWindowResize);

  // Start Animation Loop
  animate();
}

function getGeometry(type) {
  switch (type) {
    case 'torus':
      return new THREE.TorusKnotGeometry(1.2, 0.38, 128, 32, 2, 3);
    case 'octahedron':
      return new THREE.OctahedronGeometry(1.8, 1);
    case 'sphere':
      return new THREE.SphereGeometry(1.7, 32, 32);
    case 'icosahedron':
    default:
      return new THREE.IcosahedronGeometry(1.7, 1);
  }
}

function buildCoreMesh() {
  if (coreMesh) {
    coreGroup.remove(coreMesh);
    if (coreMesh.geometry) coreMesh.geometry.dispose();
    if (coreMesh.material) coreMesh.material.dispose();
  }

  const geometry = getGeometry(currentGeometryType);
  let material;

  if (currentRenderMode === 'wireframe') {
    material = new THREE.MeshBasicMaterial({
      color: activeNeonColor,
      wireframe: true,
      transparent: true,
      opacity: 0.85
    });
    coreMesh = new THREE.Mesh(geometry, material);
  } else if (currentRenderMode === 'surface') {
    material = new THREE.MeshStandardMaterial({
      color: 0x0a1020,
      emissive: activeNeonColor,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.9,
      wireframe: false
    });
    coreMesh = new THREE.Mesh(geometry, material);

    // Add wireframe outer shell overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: activeNeonColor,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const wireOverlay = new THREE.Mesh(geometry.clone(), wireMat);
    wireOverlay.scale.setScalar(1.02);
    coreMesh.add(wireOverlay);
  } else if (currentRenderMode === 'points') {
    material = new THREE.PointsMaterial({
      color: activeNeonColor,
      size: 0.04,
      transparent: true,
      opacity: 0.9
    });
    coreMesh = new THREE.Points(geometry, material);
  }

  coreGroup.add(coreMesh);
}

function buildParticleDust() {
  if (particleSystem) {
    coreGroup.remove(particleSystem);
    if (particleSystem.geometry) particleSystem.geometry.dispose();
    if (particleSystem.material) particleSystem.material.dispose();
  }

  const particleCount = 4096;
  const positions = new Float32Array(particleCount * 3);
  const scales = new Float32Array(particleCount);

  // Distribute particles in a bounded spherical envelope
  for (let i = 0; i < particleCount; i++) {
    const radius = 2.0 + Math.random() * 2.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);

    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);

    scales[i] = Math.random();
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

  const material = new THREE.PointsMaterial({
    color: activeNeonColor,
    size: 0.028,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending
  });

  particleSystem = new THREE.Points(geometry, material);
  coreGroup.add(particleSystem);
}

function onPointerMove(e) {
  // Normalize pointer coordinates to [-1, 1]
  const nx = (e.clientX / window.innerWidth) * 2 - 1;
  const ny = -(e.clientY / window.innerHeight) * 2 + 1;
  mouse.targetX = nx;
  mouse.targetY = ny;
}

function onWindowResize() {
  const container = document.getElementById('hero-canvas-container');
  if (!container || !renderer || !camera) return;
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

let clock = new THREE.Clock();

function animate() {
  animationFrameId = requestAnimationFrame(animate);

  const delta = clock.getDelta();
  const time = clock.getElapsedTime() * particleSpeedMultiplier;

  // Damped pointer parallax
  const targetX = isReducedMotion ? 0 : mouse.targetX * 0.8 * parallaxGain;
  const targetY = isReducedMotion ? 0 : mouse.targetY * 0.6 * parallaxGain;
  mouse.x += (targetX - mouse.x) * 0.05;
  mouse.y += (targetY - mouse.y) * 0.05;

  if (coreGroup) {
    coreGroup.position.x = mouse.x * 0.6;
    coreGroup.position.y = mouse.y * 0.6;
  }

  // Smooth rotation
  if (coreMesh) {
    if (!isReducedMotion) {
      coreMesh.rotation.x += delta * 0.35 * particleSpeedMultiplier;
      coreMesh.rotation.y += delta * 0.5 * particleSpeedMultiplier;
    }
  }

  // Particle dust swirling & gentle breathing
  if (particleSystem) {
    if (!isReducedMotion) {
      particleSystem.rotation.y -= delta * 0.15 * particleSpeedMultiplier;
      particleSystem.rotation.x = Math.sin(time * 0.3) * 0.15;
    }
  }

  renderer.render(scene, camera);
}

// Public API for Hero HUD Controls
export function setCoreShape(shapeKey) {
  currentGeometryType = shapeKey;
  buildCoreMesh();
}

export function setRenderMode(modeKey) {
  currentRenderMode = modeKey;
  buildCoreMesh();
}

export function setNeonPalette(colorHex) {
  activeNeonColor = colorHex;
  buildCoreMesh();
  if (particleSystem && particleSystem.material) {
    particleSystem.material.color.setHex(activeNeonColor);
  }
}

export function setParticleSpeed(speed) {
  particleSpeedMultiplier = parseFloat(speed) || 1.0;
}

export function setParallaxGain(gain) {
  parallaxGain = parseFloat(gain) || 1.0;
}
