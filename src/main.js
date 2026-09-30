// ===================================================================
// WAR MUZAMIL // MAIN APPLICATION ENTRY POINT
// Cyberpunk 3D Single-Page Portfolio & Interactive WebGL Experience
// ===================================================================

import './style.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import { toggleAudio, playBlip, playConfirm } from './audio.js';
import {
  initHeroCanvas,
  setCoreShape,
  setRenderMode,
  setNeonPalette,
  setParticleSpeed,
  setParallaxGain
} from './hero-canvas.js';
import { initRadarChart } from './radar-chart.js';
import { initProjects } from './projects.js';
import { initTerminal } from './terminal.js';
import { initTelemetry } from './telemetry.js';
import { initContactForm } from './contact.js';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Core Subsystems
  initHeroCanvas();
  initRadarChart();
  initProjects();
  initTerminal();
  initTelemetry();
  initContactForm();

  // 2. Setup Cyberpunk Preloader (0% to 100% Boot Sequence)
  initPreloader();

  // 3. Setup Animations & Custom Cursor
  setupCyberCursor();
  setupTypingAnimation();

  // 3. Setup Navigation & Header
  setupNavigation();

  // 4. Setup Hero HUD Controls
  setupHeroControls();

  // 5. Setup 3D Hero Portrait Physics & Switcher
  setupHeroPortrait3D();

  // 6. Setup Theme & Audio
  setupThemeAndAudio();
});

// ===================================================================
// CYBERPUNK 0% TO 100% PRELOADER SEQUENCE
// ===================================================================
function initPreloader() {
  const preloader = document.getElementById('cyber-preloader');
  const percentEl = document.getElementById('preloader-percent');
  const barEl = document.getElementById('preloader-bar');
  const statusEl = document.getElementById('preloader-status');

  if (!preloader || !percentEl || !barEl || !statusEl) {
    setupGsapAnimations();
    return;
  }

  // Lock background scroll during initial boot sequence
  document.body.style.overflow = 'hidden';

  let current = 0;
  const target = 100;
  const duration = 1800; // 1.8 seconds smooth cyber boot
  const startTime = performance.now();

  const statusMilestones = [
    { threshold: 0, text: '[01/04] BOOTING SYSTEM ENVIRONMENT...' },
    { threshold: 25, text: '[02/04] COMPILING 3D WEBGL SHADERS...' },
    { threshold: 55, text: '[03/04] CONNECTING MERN CLOUD MANIFOLD...' },
    { threshold: 85, text: '[04/04] CALIBRATING NEON OPTICS & SENSORS...' },
    { threshold: 100, text: 'SYSTEM ONLINE // ACCESS GRANTED' }
  ];

  function updatePreloader(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    current = Math.min(Math.floor(eased * target), 100);

    percentEl.textContent = current;
    barEl.style.width = `${current}%`;
    preloader.setAttribute('aria-valuenow', current);

    // Update status text
    for (let i = statusMilestones.length - 1; i >= 0; i--) {
      if (current >= statusMilestones[i].threshold) {
        if (statusEl.textContent !== statusMilestones[i].text) {
          statusEl.textContent = statusMilestones[i].text;
        }
        break;
      }
    }

    if (progress < 1) {
      requestAnimationFrame(updatePreloader);
    } else {
      percentEl.textContent = '100';
      barEl.style.width = '100%';
      statusEl.textContent = 'SYSTEM ONLINE // ACCESS GRANTED';
      statusEl.style.color = 'var(--success)';

      // Short cinematic pause at 100%, then slide up curtain
      setTimeout(() => {
        gsap.to(preloader, {
          yPercent: -100,
          opacity: 0,
          duration: 0.85,
          ease: 'power4.inOut',
          onComplete: () => {
            preloader.style.display = 'none';
            document.body.style.overflow = '';
            setupGsapAnimations();
          }
        });
      }, 300);
    }
  }

  requestAnimationFrame(updatePreloader);
}

// ===================================================================
// CUSTOM CYBER CURSOR FOLLOWER
// ===================================================================
function setupCyberCursor() {
  const cursor = document.getElementById('cyber-cursor');
  const ring = document.getElementById('cyber-cursor-ring');
  if (!cursor || !ring) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let ringX = mouseX;
  let ringY = mouseY;

  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  }, { passive: true });

  function renderCursorRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
    requestAnimationFrame(renderCursorRing);
  }
  requestAnimationFrame(renderCursorRing);

  // Hover states
  document.querySelectorAll('a, button, input, textarea, select, .project-tilt-card, .skill-stat-row').forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('active'));
    el.addEventListener('mouseleave', () => ring.classList.remove('active'));
  });
}

// ===================================================================
// DYNAMIC TYPING ROLE ANIMATION
// ===================================================================
function setupTypingAnimation() {
  const typedEl = document.getElementById('typed-role-text');
  if (!typedEl) return;

  const roles = [
    'Full Stack Developer & MERN Specialist',
    'Next.js 14 & React Architecture',
    'Node.js & Express REST APIs',
    'MongoDB & PostgreSQL Databases',
    'High-Performance Interactive 3D Web'
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingSpeed = 70;

  function typeTick() {
    const currentRole = roles[roleIdx];

    if (isDeleting) {
      charIdx--;
      typedEl.textContent = currentRole.substring(0, charIdx);
      typingSpeed = 35;
    } else {
      charIdx++;
      typedEl.textContent = currentRole.substring(0, charIdx);
      typingSpeed = 70;
    }

    if (!isDeleting && charIdx === currentRole.length) {
      isDeleting = true;
      typingSpeed = 2200; // Pause at end of word
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typingSpeed = 400;
    }

    setTimeout(typeTick, typingSpeed);
  }

  typeTick();
}

// ===================================================================
// HERO 3D PORTRAIT PHYSICS & DUAL SWITCHER
// ===================================================================
function setupHeroPortrait3D() {
  const cardWrapper = document.getElementById('hero-portrait-card');
  const activePortrait = document.getElementById('hero-active-portrait');
  const glareLayer = document.getElementById('portrait-glare');
  const switchBtns = document.querySelectorAll('.hero-switch-btn');
  const frameWrapper = cardWrapper ? cardWrapper.querySelector('.cyber-frame-wrapper') : null;

  if (!cardWrapper || !frameWrapper) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 3D Perspective Tilt with Mouse
  cardWrapper.addEventListener('pointermove', (e) => {
    if (isReducedMotion) return;

    const rect = cardWrapper.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -14;
    const rotY = ((x - centerX) / centerX) * 14;

    frameWrapper.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateZ(10px)`;

    if (glareLayer) {
      const pctX = (x / rect.width) * 100;
      const pctY = (y / rect.height) * 100;
      glareLayer.style.background = `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(0, 240, 255, 0.3) 0%, transparent 65%)`;
    }
  });

  cardWrapper.addEventListener('pointerleave', () => {
    frameWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0)';
    if (glareLayer) glareLayer.style.background = '';
  });

  // Hero Photo Switcher
  switchBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetSrc = btn.getAttribute('data-src');
      if (!targetSrc || activePortrait.getAttribute('src') === targetSrc) return;

      playConfirm();

      switchBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      activePortrait.style.opacity = '0';
      setTimeout(() => {
        activePortrait.src = targetSrc;
        activePortrait.style.opacity = '1';
      }, 200);
    });
  });
}

// ===================================================================
// GSAP ENTRANCE & SCROLL ANIMATIONS
// ===================================================================
function setupGsapAnimations() {
  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (isReducedMotion) return;

  gsap.from('[data-gsap="stagger"]', {
    y: 25,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: 'power3.out',
    delay: 0.2
  });

  gsap.from('[data-gsap="fade-down"]', {
    y: -20,
    opacity: 0,
    duration: 0.8,
    ease: 'power2.out',
    delay: 0.1
  });

  gsap.from('[data-gsap="fade-up"]', {
    y: 35,
    opacity: 0,
    duration: 0.9,
    ease: 'power3.out',
    delay: 0.5
  });

  document.querySelectorAll('.section-blueprint-header').forEach((header) => {
    gsap.from(header, {
      scrollTrigger: {
        trigger: header,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    });
  });
}

// ===================================================================
// NAVIGATION & HEADER SCROLL BEHAVIOR
// ===================================================================
function setupNavigation() {
  const header = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    let currentId = '';
    sections.forEach((sec) => {
      const top = sec.offsetTop - 140;
      const height = sec.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }, { passive: true });

  navLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => playBlip(700));
    link.addEventListener('click', () => playConfirm());
  });

  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      playBlip(900);
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        playConfirm();
      });
    });
  }
}

// ===================================================================
// HERO HUD CONTROLS
// ===================================================================
function setupHeroControls() {
  const shapeButtons = document.querySelectorAll('.shape-buttons .ctrl-chip');
  shapeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      shapeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      setCoreShape(btn.getAttribute('data-shape'));
      playConfirm();
    });
  });

  const modeButtons = document.querySelectorAll('.mode-buttons .ctrl-chip');
  modeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      modeButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      setRenderMode(btn.getAttribute('data-mode'));
      playConfirm();
    });
  });

  const speedSlider = document.getElementById('particle-speed-slider');
  const speedVal = document.getElementById('speed-val');
  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      speedVal.textContent = `${val.toFixed(1)}x`;
      setParticleSpeed(val);
    });
  }

  const parallaxSlider = document.getElementById('parallax-gain-slider');
  const parallaxVal = document.getElementById('parallax-val');
  if (parallaxSlider) {
    parallaxSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      parallaxVal.textContent = `${val.toFixed(1)}x`;
      setParallaxGain(val);
    });
  }
}

// ===================================================================
// THEME PALETTE & AUDIO SYNTHESIZER
// ===================================================================
function setupThemeAndAudio() {
  const audioBtn = document.getElementById('audio-toggle-btn');
  const paletteBtn = document.getElementById('palette-btn');
  const paletteMenu = document.getElementById('palette-menu');
  const paletteItems = document.querySelectorAll('.palette-item');

  if (audioBtn) {
    audioBtn.addEventListener('click', () => {
      const active = toggleAudio();
      audioBtn.classList.toggle('audio-active', active);
    });
  }

  if (paletteBtn && paletteMenu) {
    paletteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = paletteMenu.hidden;
      paletteMenu.hidden = !isHidden;
      paletteBtn.setAttribute('aria-expanded', isHidden);
      playBlip(750);
    });

    document.addEventListener('click', () => {
      paletteMenu.hidden = true;
      paletteBtn.setAttribute('aria-expanded', 'false');
    });

    paletteItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const palette = item.getAttribute('data-palette');
        document.body.className = `theme-${palette}`;

        paletteItems.forEach((it) => it.classList.remove('active'));
        item.classList.add('active');

        const colors = {
          cyan: 0x00f0ff,
          emerald: 0x00ff88,
          amber: 0xffaa00,
          violet: 0xbf5af2
        };
        setNeonPalette(colors[palette] || 0x00f0ff);

        paletteMenu.hidden = true;
        paletteBtn.setAttribute('aria-expanded', 'false');
        playConfirm();
      });
    });
  }
}
