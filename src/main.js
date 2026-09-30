// ===================================================================
// WAR MUZAMIL // MAIN APPLICATION ENTRY POINT
// Full Stack Developer & MERN Specialist · Kashmir, India
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

  // 2. Setup Animations
  setupGsapAnimations();

  // 3. Setup Navigation & Header
  setupNavigation();

  // 4. Setup Hero HUD Controls
  setupHeroControls();

  // 5. Setup Dual-Photo Gallery Switcher
  setupPhotoSwitcher();

  // 6. Setup Theme & Audio
  setupThemeAndAudio();
});

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
// DUAL-PHOTO GALLERY SWITCHER
// ===================================================================
function setupPhotoSwitcher() {
  const switchBtns = document.querySelectorAll('.photo-switch-btn');
  const portraitImg = document.getElementById('active-portrait-img');

  if (!portraitImg || switchBtns.length === 0) return;

  switchBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const targetSrc = btn.getAttribute('data-src');
      if (!targetSrc || portraitImg.getAttribute('src') === targetSrc) return;

      playConfirm();

      switchBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Smooth crossfade
      portraitImg.style.opacity = '0';
      setTimeout(() => {
        portraitImg.src = targetSrc;
        portraitImg.style.opacity = '1';
      }, 200);
    });
  });
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
