// ===================================================================
// NEXUS ONE — PROCEDURAL DRONE LABORATORY & SCROLL STORY
// Procedural Three.js craft with dynamic rotor count, arm span,
// shell hue, assembly/exploded modes, 3D hotspots, and scroll story.
// ===================================================================

import * as THREE from 'three';

let scene, camera, renderer, animationFrameId;
let droneRootGroup;
let coreChassisMesh, pcbMesh, batteryMesh, opticsGroup;
let armGroups = []; // Array of arm + motor + rotor groups
let rotorBlades = []; // Keep references to spin them

// Drone Parametric State
let droneConfig = {
  rotorCount: 4,
  armSpan: 3.2,
  shellHue: 185, // Cyan
  assemblyMode: 'assembled', // 'assembled' | 'exploded' | 'wireframe'
  rotorRPM: 7200,
  autoOrbit: true
};

// Hotspot 3D Anchors for screen projection
const hotspotAnchors = {
  'rotor-a': new THREE.Vector3(0, 0, 0),
  'rotor-d': new THREE.Vector3(0, 0, 0),
  'core-frame': new THREE.Vector3(0, 0.2, 0),
  'optics': new THREE.Vector3(0, 0, 1.4),
  'pcb': new THREE.Vector3(0, 0.45, 0),
  'battery': new THREE.Vector3(0, -0.45, 0)
};

// Target and current camera poses for smooth transitions / scroll story
let cameraPose = {
  x: 4.5,
  y: 3.2,
  z: 5.5,
  lookX: 0,
  lookY: 0,
  lookZ: 0
};
let targetCameraPose = { ...cameraPose };

let isReducedMotion = false;
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let currentStoryStep = 1;

export function initDroneLab() {
  const canvas = document.getElementById('drone-webgl-canvas');
  if (!canvas) return;

  const wrapper = document.getElementById('drone-canvas-wrapper');
  const width = wrapper.clientWidth || 600;
  const height = wrapper.clientHeight || 480;

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
  camera.position.set(cameraPose.x, cameraPose.y, cameraPose.z);
  camera.lookAt(cameraPose.lookX, cameraPose.lookY, cameraPose.lookZ);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Lights
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x111625, 0.9);
  scene.add(hemiLight);

  const dirLight1 = new THREE.DirectionalLight(0x00f0ff, 2.5);
  dirLight1.position.set(8, 12, 8);
  scene.add(dirLight1);

  const dirLight2 = new THREE.DirectionalLight(0xff007f, 1.8);
  dirLight2.position.set(-8, -6, -8);
  scene.add(dirLight2);

  // Ground cyber grid plane
  const gridHelper = new THREE.GridHelper(14, 28, 0x00f0ff, 0x1e293b);
  gridHelper.position.y = -1.6;
  scene.add(gridHelper);

  // Drone root group
  droneRootGroup = new THREE.Group();
  scene.add(droneRootGroup);

  // Check prefers-reduced-motion
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  isReducedMotion = mediaQuery.matches;

  // Generate Initial Drone Mesh
  rebuildDroneMesh();

  // Mouse drag orbit controls for the canvas
  canvas.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('resize', onResize);

  // Start Animation
  animateDrone();
}

function getAccentColor() {
  return new THREE.Color(`hsl(${droneConfig.shellHue}, 100%, 50%)`);
}

export function rebuildDroneMesh() {
  // Clear existing components
  while (droneRootGroup.children.length > 0) {
    const obj = droneRootGroup.children[0];
    droneRootGroup.remove(obj);
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) obj.material.dispose();
  }
  armGroups = [];
  rotorBlades = [];

  const accentColor = getAccentColor();
  const isWireframe = droneConfig.assemblyMode === 'wireframe';

  // Base materials
  const chassisMat = new THREE.MeshStandardMaterial({
    color: 0x121722,
    metalness: 0.85,
    roughness: 0.25,
    wireframe: isWireframe
  });

  const accentMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    emissive: accentColor,
    emissiveIntensity: 0.6,
    metalness: 0.3,
    roughness: 0.2,
    wireframe: isWireframe
  });

  const carbonMat = new THREE.MeshStandardMaterial({
    color: 0x1e2430,
    metalness: 0.7,
    roughness: 0.4,
    wireframe: isWireframe
  });

  // 1. Central Core Chassis
  const chassisGeom = new THREE.CylinderGeometry(0.75, 0.9, 0.4, 8);
  coreChassisMesh = new THREE.Mesh(chassisGeom, chassisMat);
  coreChassisMesh.position.y = 0;
  droneRootGroup.add(coreChassisMesh);

  // Accent edge trim ring
  const ringGeom = new THREE.TorusGeometry(0.85, 0.04, 16, 32);
  const ringMesh = new THREE.Mesh(ringGeom, accentMat);
  ringMesh.rotation.x = Math.PI / 2;
  coreChassisMesh.add(ringMesh);

  // 2. PCB Module (Top)
  const pcbGeom = new THREE.BoxGeometry(0.8, 0.08, 0.8);
  const pcbCircuitMat = new THREE.MeshStandardMaterial({
    color: 0x064e3b,
    emissive: 0x00ff88,
    emissiveIntensity: 0.4,
    roughness: 0.3,
    wireframe: isWireframe
  });
  pcbMesh = new THREE.Mesh(pcbGeom, pcbCircuitMat);
  pcbMesh.position.y = 0.26;
  droneRootGroup.add(pcbMesh);

  // Microchips on PCB
  for (let c = 0; c < 4; c++) {
    const chip = new THREE.Mesh(
      new THREE.BoxGeometry(0.18, 0.06, 0.18),
      new THREE.MeshStandardMaterial({ color: 0x05070c, metalness: 0.9 })
    );
    chip.position.set((c % 2 === 0 ? 0.2 : -0.2), 0.06, (c < 2 ? 0.2 : -0.2));
    pcbMesh.add(chip);
  }

  // 3. Battery Module (Bottom)
  const battGeom = new THREE.BoxGeometry(0.7, 0.32, 1.1);
  const battMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    metalness: 0.5,
    roughness: 0.3,
    wireframe: isWireframe
  });
  batteryMesh = new THREE.Mesh(battGeom, battMat);
  batteryMesh.position.y = -0.32;
  droneRootGroup.add(batteryMesh);

  // Battery status indicator bar
  const battBar = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.04, 0.7),
    new THREE.MeshBasicMaterial({ color: 0x00ff88 })
  );
  battBar.position.set(0.36, 0, 0);
  batteryMesh.add(battBar);

  // 4. Optics Sensor Gimbal (Front)
  opticsGroup = new THREE.Group();
  const gimbalHousing = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0x1f2937, metalness: 0.9, wireframe: isWireframe })
  );
  const lens = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.14, 0.1, 16),
    accentMat
  );
  lens.rotation.x = Math.PI / 2;
  lens.position.z = 0.24;
  gimbalHousing.add(lens);
  opticsGroup.add(gimbalHousing);
  opticsGroup.position.set(0, 0, 0.95);
  droneRootGroup.add(opticsGroup);

  // 5. Procedural Arms & Rotors based on rotorCount
  const count = droneConfig.rotorCount;
  const radius = droneConfig.armSpan / 2;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + (Math.PI / count); // Off-axis symmetry
    const armGroup = new THREE.Group();

    // Arm strut (Carbon fiber tube)
    const armGeom = new THREE.CylinderGeometry(0.06, 0.06, radius, 8);
    const armMesh = new THREE.Mesh(armGeom, carbonMat);
    armMesh.rotation.z = Math.PI / 2;
    armMesh.position.x = radius / 2;
    armGroup.add(armMesh);

    // Motor Hub at tip
    const motorGeom = new THREE.CylinderGeometry(0.2, 0.2, 0.22, 16);
    const motorMesh = new THREE.Mesh(motorGeom, chassisMat);
    motorMesh.position.set(radius, 0.12, 0);
    armGroup.add(motorMesh);

    // Motor accent ring
    const mRing = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.02, 8, 16), accentMat);
    mRing.rotation.x = Math.PI / 2;
    motorMesh.add(mRing);

    // Rotor Blade assembly
    const rotorAssembly = new THREE.Group();
    rotorAssembly.position.set(radius, 0.28, 0);

    // 2-blade carbon propeller
    const bladeGeom = new THREE.BoxGeometry(0.08, 0.015, 1.4);
    const bladeMesh = new THREE.Mesh(bladeGeom, carbonMat);
    rotorAssembly.add(bladeMesh);

    // Propeller center spinner
    const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.12, 12), accentMat);
    spinner.position.y = 0.06;
    rotorAssembly.add(spinner);

    armGroup.add(rotorAssembly);
    rotorBlades.push(rotorAssembly);

    // Position arm around center
    armGroup.rotation.y = angle;
    droneRootGroup.add(armGroup);
    armGroups.push(armGroup);

    // Set 3D anchor for Rotor A and Rotor D
    if (i === 0) {
      hotspotAnchors['rotor-a'].set(
        Math.sin(angle + Math.PI / 2) * radius,
        0.3,
        Math.cos(angle + Math.PI / 2) * radius
      );
    }
    if (i === Math.floor(count / 2)) {
      hotspotAnchors['rotor-d'].set(
        Math.sin(angle + Math.PI / 2) * radius,
        0.3,
        Math.cos(angle + Math.PI / 2) * radius
      );
    }
  }

  // Update exploded / assembled positions
  applyAssemblyMode(droneConfig.assemblyMode);
}

export function setAssemblyMode(mode) {
  droneConfig.assemblyMode = mode;
  applyAssemblyMode(mode);
}

function applyAssemblyMode(mode) {
  const isExploded = mode === 'exploded';

  if (pcbMesh) {
    pcbMesh.position.y = isExploded ? 0.9 : 0.26;
  }
  if (batteryMesh) {
    batteryMesh.position.y = isExploded ? -0.9 : -0.32;
  }
  if (opticsGroup) {
    opticsGroup.position.z = isExploded ? 1.6 : 0.95;
  }

  armGroups.forEach((armGroup) => {
    // Push arms slightly outwards if exploded
    armGroup.position.y = isExploded ? 0.2 : 0;
  });

  const modeDisplay = document.getElementById('drone-mode-display');
  if (modeDisplay) {
    modeDisplay.textContent = `MODE: ${mode.toUpperCase()}`;
  }
}

function onPointerDown(e) {
  isDragging = true;
  previousMousePosition = { x: e.clientX, y: e.clientY };
}

function onPointerMove(e) {
  if (!isDragging || !droneRootGroup) return;

  const deltaX = e.clientX - previousMousePosition.x;
  const deltaY = e.clientY - previousMousePosition.y;

  droneRootGroup.rotation.y += deltaX * 0.008;
  droneRootGroup.rotation.x += deltaY * 0.006;

  // Clamp vertical pitch
  droneRootGroup.rotation.x = Math.max(-0.8, Math.min(0.8, droneRootGroup.rotation.x));

  previousMousePosition = { x: e.clientX, y: e.clientY };
}

function onPointerUp() {
  isDragging = false;
}

function onResize() {
  const wrapper = document.getElementById('drone-canvas-wrapper');
  if (!wrapper || !renderer || !camera) return;
  const width = wrapper.clientWidth;
  const height = wrapper.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

// Update DOM 2D positions of 3D Hotspot pins
function updateHotspotsProjection() {
  const wrapper = document.getElementById('drone-canvas-wrapper');
  if (!wrapper || !camera) return;
  const width = wrapper.clientWidth;
  const height = wrapper.clientHeight;

  for (const [key, anchorPos] of Object.entries(hotspotAnchors)) {
    const pin = document.getElementById(`pin-${key}`);
    if (!pin) continue;

    // Transform local vector with drone root group matrix
    const worldPos = anchorPos.clone();
    if (droneRootGroup) {
      worldPos.applyMatrix4(droneRootGroup.matrixWorld);
    }

    // Project onto 2D NDC screen space [-1, 1]
    const screenPos = worldPos.project(camera);

    // Check if point is in front of camera
    if (screenPos.z > 1) {
      pin.style.display = 'none';
      continue;
    }

    pin.style.display = 'flex';
    const x = ((screenPos.x + 1) * width) / 2;
    const y = ((-screenPos.y + 1) * height) / 2;

    pin.style.left = `${x}px`;
    pin.style.top = `${y}px`;
  }
}

let droneClock = new THREE.Clock();

function animateDrone() {
  animationFrameId = requestAnimationFrame(animateDrone);

  const delta = droneClock.getDelta();

  // Spin rotors based on RPM
  const rotorSpeed = (droneConfig.rotorRPM / 60) * Math.PI * 2 * 0.04;
  rotorBlades.forEach((blade, index) => {
    // Alternate CW / CCW directions for adjacent rotors
    const dir = index % 2 === 0 ? 1 : -1;
    blade.rotation.y += rotorSpeed * dir;
  });

  // Auto-orbit / idle hover oscillation
  if (droneConfig.autoOrbit && !isDragging && !isReducedMotion) {
    droneRootGroup.rotation.y += delta * 0.35;
    droneRootGroup.position.y = Math.sin(droneClock.getElapsedTime() * 1.8) * 0.1;
  }

  // Smooth camera interpolation towards target pose (for scroll story)
  cameraPose.x += (targetCameraPose.x - cameraPose.x) * 0.06;
  cameraPose.y += (targetCameraPose.y - cameraPose.y) * 0.06;
  cameraPose.z += (targetCameraPose.z - cameraPose.z) * 0.06;
  camera.position.set(cameraPose.x, cameraPose.y, cameraPose.z);
  camera.lookAt(targetCameraPose.lookX, targetCameraPose.lookY, targetCameraPose.lookZ);

  // Update hotspots 2D screen positions
  updateHotspotsProjection();

  renderer.render(scene, camera);
}

// Camera transition for Scroll Story build stages
export function setScrollStoryStage(stageNumber) {
  currentStoryStep = stageNumber;
  switch (stageNumber) {
    case 1: // Chassis
      targetCameraPose = { x: 3.5, y: 1.8, z: 4.8, lookX: 0, lookY: 0, lookZ: 0 };
      setAssemblyMode('assembled');
      break;
    case 2: // Avionics & PCB (Top down)
      targetCameraPose = { x: 0.1, y: 5.5, z: 1.2, lookX: 0, lookY: 0.2, lookZ: 0 };
      setAssemblyMode('exploded');
      break;
    case 3: // Propulsion (Focus on rotor tip)
      targetCameraPose = { x: 3.8, y: 1.2, z: 2.2, lookX: 1.6, lookY: 0.2, lookZ: 0 };
      setAssemblyMode('assembled');
      break;
    case 4: // Optics Gimbal (Front face)
      targetCameraPose = { x: 0, y: 0.4, z: 3.8, lookX: 0, lookY: 0, lookZ: 1.0 };
      setAssemblyMode('assembled');
      break;
    case 5: // Full flight readiness (Wide cinematic orbit)
    default:
      targetCameraPose = { x: 4.5, y: 3.2, z: 5.5, lookX: 0, lookY: 0, lookZ: 0 };
      setAssemblyMode('assembled');
      break;
  }
}

// Parametric updates from UI sliders
export function updateDroneParams({ rotorCount, armSpan, shellHue, rotorRPM }) {
  let needsRebuild = false;

  if (rotorCount !== undefined && rotorCount !== droneConfig.rotorCount) {
    droneConfig.rotorCount = parseInt(rotorCount);
    needsRebuild = true;
  }
  if (armSpan !== undefined && armSpan !== droneConfig.armSpan) {
    droneConfig.armSpan = parseFloat(armSpan) / 100; // mm to three units
    needsRebuild = true;
  }
  if (shellHue !== undefined && shellHue !== droneConfig.shellHue) {
    droneConfig.shellHue = parseInt(shellHue);
    needsRebuild = true;
  }
  if (rotorRPM !== undefined) {
    droneConfig.rotorRPM = parseInt(rotorRPM);
  }

  if (needsRebuild) {
    rebuildDroneMesh();
  }
}

export function resetDroneView() {
  targetCameraPose = { x: 4.5, y: 3.2, z: 5.5, lookX: 0, lookY: 0, lookZ: 0 };
  if (droneRootGroup) {
    droneRootGroup.rotation.set(0, 0, 0);
  }
}

export function toggleAutoOrbit() {
  droneConfig.autoOrbit = !droneConfig.autoOrbit;
  return droneConfig.autoOrbit;
}
