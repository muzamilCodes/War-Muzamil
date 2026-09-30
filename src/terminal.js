// ===================================================================
// WAR MUZAMIL FUNCTIONAL TERMINAL
// Local map execution for War Muzamil portfolio details, projects,
// bio, contact channels, and Matrix digital rain simulation.
// ===================================================================

import { playKey, playConfirm, playDeny } from './audio.js';

let commandHistory = [];
let historyIndex = -1;
let isMatrixActive = false;
let matrixAnimId = null;

const COMMANDS_MAP = {
  help: () => `AVAILABLE KERNEL COMMANDS:
  help             - Display list of supported commands
  whoami           - Identify engineer credentials & location
  bio              - Professional narrative & software focus
  skills           - Full-stack technical stack & proficiencies
  projects         - List shipped production platforms & live links
  experience       - Career milestones & work history at ILS
  contact          - Direct communication coordinates & phone/email
  github           - Open GitHub repository profile
  linkedin         - Open LinkedIn connection profile
  whatsapp         - Open direct WhatsApp messaging
  matrix           - Toggle digital rain simulation overlay
  clear            - Purge terminal buffer screen
  theme <name>     - Switch neon palette (cyan, emerald, amber, violet)`,

  whoami: () => `NAME: War Muzamil
ROLE: Full Stack Developer
LOCATION: Handwara, Srinagar / Kashmir, India
EXPERIENCE: 1+ Years Practical Experience · 7+ Shipped Projects
STATUS: AVAILABLE for Freelance & Full-Time Software Engineering`,

  bio: () => `WAR MUZAMIL // FULL STACK DEVELOPER
Motivated software engineer with hands-on experience building dynamic,
data-driven web applications that solve real-world problems.
Specializes in React.js, Next.js, Node.js, Express, MongoDB, and PostgreSQL,
delivering fluid user experiences paired with robust backend architectures.`,

  skills: () => `TECHNICAL CAPABILITIES:
  [====================] React.js & Next.js   : 96/100 (SSR, App Router, Hooks)
  [=================== ] Node.js & Express    : 94/100 (RESTful APIs, JWT Auth)
  [=================== ] Tailwind CSS & UI    : 96/100 (Glassmorphism, 3D CSS)
  [==================  ] MongoDB & PostgreSQL : 92/100 (Mongoose, Relational)
  [==================  ] TypeScript / JS      : 90/100 (Strict type safety)
  [=================   ] Tools & DevOps       : 92/100 (Git, GitHub, Vite, Vercel)`,

  projects: () => `FEATURED SHIPPED PLATFORMS:
  01. StudyMaterial Platform
      - Next.js · React · MongoDB · Tailwind CSS · TypeScript
      - Live Demo: https://study-meterial-eight.vercel.app/
  02. Quick Services Marketplace
      - React.js · Node.js · Express.js · MongoDB · REST APIs
      - Live Demo: https://quick-services-indol.vercel.app
  03. Talexa Job Recruitment Portal
      - React.js · Next.js · Node.js · PostgreSQL · Express.js
      - Live Portal: https://talexa.ilsimperiatech.com/
  04. ASIAN MALL E-Commerce
      - Next.js · React · Tailwind CSS · Framer Motion
      - Live Demo: https://asian-mall.vercel.app
  05. Sportify Kashmir Store (V2)
      - React.js · Vite · Tailwind CSS · Context API
      - Live Demo: https://new-soprtify-kashmir.vercel.app`,

  experience: () => `CAREER MILESTONES:
  • Full Stack Developer @ ILS (Institute of Language & Software) [2024 - Present]
    Production full-stack engineering with React, Next.js, Node.js, Express, and .NET.
  • Frontend Developer @ ILS [2024]
    Responsive UI development, Tailwind CSS design systems, micro-animations.
  • Independent Web Engineering [2023 - 2024]
    Shipped 7+ production platforms deployed to Vercel with automated CI/CD.
  • Higher Secondary Education (12th Pass) [2024]
    Govt Boys Higher Secondary School Qalamabad (Science & Mathematics).`,

  contact: () => `DIRECT COMMUNICATION CHANNELS:
  • Email    : warmuzamil68@gmail.com
  • Phone    : +91 9682645127
  • WhatsApp : https://wa.me/919682645127
  • Location : Handwara, Srinagar / Kashmir, India`,

  github: () => {
    window.open('https://github.com/muzamilCodes', '_blank');
    return `Opening GitHub profile: https://github.com/muzamilCodes`;
  },

  linkedin: () => {
    window.open('https://www.linkedin.com/in/muzamilCodes', '_blank');
    return `Opening LinkedIn profile: https://www.linkedin.com/in/muzamilCodes`;
  },

  whatsapp: () => {
    window.open('https://wa.me/919682645127', '_blank');
    return `Opening WhatsApp chat: +91 9682645127`;
  },

  matrix: () => {
    toggleMatrixRain();
    return isMatrixActive ? `MATRIX RAIN INITIALIZED. Press ESC or click MATRIX button to stop.` : `MATRIX RAIN TERMINATED.`;
  }
};

export function initTerminal() {
  const input = document.getElementById('terminal-input');
  const historyContainer = document.getElementById('terminal-history');
  const terminalBody = document.getElementById('terminal-body');
  const clearBtn = document.getElementById('term-clear-btn');
  const matrixBtn = document.getElementById('term-matrix-btn');
  const quickCmdButtons = document.querySelectorAll('.quick-cmd');

  if (!input || !historyContainer) return;

  input.addEventListener('keydown', (e) => {
    playKey();

    if (e.key === 'Enter') {
      const rawCmd = input.value.trim();
      if (!rawCmd) return;

      commandHistory.push(rawCmd);
      historyIndex = commandHistory.length;

      executeCommand(rawCmd);
      input.value = '';
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex > 0) {
        historyIndex--;
        input.value = commandHistory[historyIndex];
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        historyIndex++;
        input.value = commandHistory[historyIndex];
      } else {
        historyIndex = commandHistory.length;
        input.value = '';
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      autoCompleteCommand(input);
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearTerminal();
      playConfirm();
    });
  }

  if (matrixBtn) {
    matrixBtn.addEventListener('click', () => {
      toggleMatrixRain();
    });
  }

  quickCmdButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const cmd = btn.getAttribute('data-cmd');
      if (cmd) {
        input.value = cmd;
        executeCommand(cmd);
        input.value = '';
      }
    });
  });

  function executeCommand(cmdStr) {
    const cleanCmd = cmdStr.trim().toLowerCase();

    const entry = document.createElement('div');
    entry.className = 'term-history-entry';

    const echoLine = document.createElement('div');
    echoLine.className = 'term-cmd-echo';
    echoLine.innerHTML = `<span class="term-prompt">muzamil@portfolio:~$</span> <span>${escapeHtml(cmdStr)}</span>`;
    entry.appendChild(echoLine);

    let outputText = '';

    if (cleanCmd === 'clear') {
      clearTerminal();
      return;
    } else if (cleanCmd.startsWith('theme ')) {
      const themeName = cleanCmd.replace('theme ', '').trim();
      outputText = applyTheme(themeName);
    } else if (COMMANDS_MAP[cleanCmd]) {
      outputText = COMMANDS_MAP[cleanCmd]();
      playConfirm();
    } else {
      playDeny();
      outputText = `muzamil: command not found: '${escapeHtml(cmdStr)}'. Type 'help' for available commands.`;
    }

    const outputBlock = document.createElement('div');
    outputBlock.className = 'term-output-block';
    outputBlock.textContent = outputText;
    entry.appendChild(outputBlock);

    historyContainer.appendChild(entry);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function clearTerminal() {
    historyContainer.innerHTML = '';
  }

  function autoCompleteCommand(inputEl) {
    const val = inputEl.value.toLowerCase().trim();
    if (!val) return;

    const available = Object.keys(COMMANDS_MAP);
    const match = available.find((c) => c.startsWith(val));
    if (match) {
      inputEl.value = match;
    }
  }

  function applyTheme(name) {
    const valid = ['cyan', 'emerald', 'amber', 'violet'];
    if (valid.includes(name)) {
      document.body.className = `theme-${name}`;
      return `Neon visual theme updated to: ${name.toUpperCase()}`;
    }
    return `Invalid palette '${name}'. Options: cyan, emerald, amber, violet`;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  initMatrixRain();
}

function initMatrixRain() {
  const canvas = document.getElementById('matrix-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const characters = '0123456789ABCDEFΣΩΨλπ⌘⌥⎋MuzamilReactNextNode';
  const fontSize = 16;
  let columns = Math.floor(width / fontSize);
  let drops = [];

  for (let i = 0; i < columns; i++) {
    drops[i] = Math.floor(Math.random() * -50);
  }

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    columns = Math.floor(width / fontSize);
    drops = [];
    for (let i = 0; i < columns; i++) drops[i] = 1;
  });

  function drawMatrix() {
    ctx.fillStyle = 'rgba(5, 7, 12, 0.08)';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#00ff88';
    ctx.font = `${fontSize}px 'JetBrains Mono', monospace`;

    for (let i = 0; i < drops.length; i++) {
      const text = characters.charAt(Math.floor(Math.random() * characters.length));
      ctx.fillText(text, i * fontSize, drops[i] * fontSize);

      if (drops[i] * fontSize > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      drops[i]++;
    }

    if (isMatrixActive) {
      matrixAnimId = requestAnimationFrame(drawMatrix);
    }
  }

  window.toggleMatrixRain = function () {
    isMatrixActive = !isMatrixActive;
    if (isMatrixActive) {
      canvas.classList.add('active');
      drawMatrix();
      playConfirm();
    } else {
      canvas.classList.remove('active');
      if (matrixAnimId) cancelAnimationFrame(matrixAnimId);
      ctx.clearRect(0, 0, width, height);
    }
  };

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMatrixActive) {
      window.toggleMatrixRain();
    }
  });
}
