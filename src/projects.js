// ===================================================================
// WAR MUZAMIL REAL PROJECTS SHOWCASE & INTERNAL DETAIL DIALOGS
// Features: 3D pointer tilt with holographic glare, and accessible
// internal modal dialogs with real project demos and source repositories.
// ===================================================================

import { playConfirm } from './audio.js';

export const projectSpecs = {
  studymaterial: {
    title: 'StudyMaterial Platform',
    tagline: 'Smart Educational Learning & Resource Hub',
    stack: 'Next.js · React · MongoDB · Tailwind CSS · TypeScript',
    liveUrl: 'https://study-meterial-eight.vercel.app/',
    githubUrl: 'https://github.com/muzamilCodes/study-material-eight',
    architecture: `StudyMaterial is a full-featured educational platform engineered to provide class-wise study materials, chapter notes, 10-year solved state board papers, and interactive quizzes for students across medical, commerce, and non-med streams. Built with Next.js App Router for server-rendered speed and MongoDB Atlas for real-time resource cataloging.`,
    metrics: [
      { k: 'FRAMEWORK', v: 'Next.js 14 & React 18' },
      { k: 'DATABASE', v: 'MongoDB & Mongoose' },
      { k: 'STYLING', v: 'Tailwind CSS & Responsive UI' },
      { k: 'TYPE SYSTEM', v: 'TypeScript Strict Mode' }
    ],
    codeSpec: `// Next.js Server Route - Class-wise Resource Retrieval
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Material from '@/models/Material';

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const stream = searchParams.get('stream') || 'medical';
  const classGrade = searchParams.get('grade') || '12th';

  const documents = await Material.find({ stream, classGrade })
    .select('title subject fileUrl downloadCount year')
    .sort({ year: -1 })
    .lean();

  return NextResponse.json({ success: true, count: documents.length, documents });
}`
  },
  quickservices: {
    title: 'Quick Services Marketplace',
    tagline: 'On-Demand Local Services & Technician Booking',
    stack: 'React.js · Node.js · Express.js · MongoDB · REST APIs',
    liveUrl: 'https://quick-services-indol.vercel.app',
    githubUrl: 'https://github.com/muzamilCodes/QuickServices',
    architecture: `Quick Services is a full-stack hyper-local marketplace platform connecting users with electricians, plumbers, carpenters, and technicians. Features secure user authentication, OTP phone verification, service slot scheduling, real-time booking status dashboards, and ratings/reviews.`,
    metrics: [
      { k: 'FRONTEND', v: 'React.js with State Context' },
      { k: 'BACKEND', v: 'Node.js & Express.js REST API' },
      { k: 'AUTHENTICATION', v: 'JWT & OTP Token Verification' },
      { k: 'DATA ENGINE', v: 'MongoDB Multi-Collection Schemas' }
    ],
    codeSpec: `// Express.js Booking Controller with Atomic Conflict Check
router.post('/book-service', authMiddleware, async (req, res) => {
  const { providerId, serviceType, appointmentSlot } = req.body;
  const isAvailable = await Provider.checkAvailability(providerId, appointmentSlot);
  if (!isAvailable) {
    return res.status(409).json({ message: 'Selected time slot is already reserved.' });
  }

  const booking = await Booking.create({
    userId: req.user._id,
    providerId,
    serviceType,
    appointmentSlot,
    status: 'CONFIRMED'
  });

  res.status(201).json({ success: true, bookingId: booking._id });
});`
  },
  talexa: {
    title: 'Talexa Job Recruitment Portal',
    tagline: 'Enterprise Talent Discovery & Matchmaking Engine',
    stack: 'React.js · Next.js · Node.js · PostgreSQL · Express.js',
    liveUrl: 'https://talexa.ilsimperiatech.com/',
    githubUrl: 'https://github.com/muzamilCodes',
    architecture: `Talexa is an enterprise-grade job recruitment platform developed for ILS. Handles end-to-end recruitment pipelines: resume ingestion, automated candidate qualification, role-based access for hiring managers and applicants, job application tracking, and automated interview scheduling.`,
    metrics: [
      { k: 'ROLE ACCESS', v: 'Multi-tenant RBAC (Candidates & Recruiters)' },
      { k: 'DATABASE', v: 'PostgreSQL Relational Schema' },
      { k: 'ARCHITECTURE', v: 'Full-Stack Next.js & Express API' },
      { k: 'DEPLOYMENT', v: 'Enterprise Cloud Infrastructure' }
    ],
    codeSpec: `// SQL Query Optimization for Job Application Filters
SELECT j.id, j.title, j.department, j.experience_years, 
       COUNT(a.id) AS total_applicants,
       AVG(a.screening_score) AS avg_match_score
FROM jobs j
LEFT JOIN applications a ON j.id = a.job_id
WHERE j.status = 'ACTIVE' AND j.location ILIKE $1
GROUP BY j.id
ORDER BY j.created_at DESC
LIMIT 20;`
  },
  asianmall: {
    title: 'ASIAN MALL E-Commerce',
    tagline: 'Modern Retail Shopping Directory & Product Showcase',
    stack: 'Next.js · React · Tailwind CSS · Framer Motion',
    liveUrl: 'https://asian-mall.vercel.app',
    githubUrl: 'https://github.com/muzamilCodes/ASIAN-MALL',
    architecture: `ASIAN MALL is an interactive retail shopping mall destination platform. Features a 3D animated store directory, dynamic floor map navigation, product category filtering, promotions carousel, and responsive storefronts for retail vendors.`,
    metrics: [
      { k: 'STACK', v: 'Next.js 14 App Router' },
      { k: 'ANIMATION', v: 'Framer Motion & Tailwind CSS' },
      { k: 'PERFORMANCE', v: '98+ Lighthouse Score' },
      { k: 'DEPLOYMENT', v: 'Vercel Global Edge Network' }
    ],
    codeSpec: `// Framer Motion Dynamic Store Grid Transition
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

export function StoreGrid({ stores }) {
  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stores.map(store => <StoreCard key={store.id} store={store} />)}
    </motion.div>
  );
}`
  },
  sportify: {
    title: 'Sportify Kashmir Store (V2)',
    tagline: 'Athletic Gear & Custom Team Apparel Platform',
    stack: 'React.js · Vite · Tailwind CSS · Context API · Node.js',
    liveUrl: 'https://new-soprtify-kashmir.vercel.app',
    githubUrl: 'https://github.com/muzamilCodes/new-soprtify-kashmir',
    architecture: `Sportify Kashmir Store V2 is a high-speed e-commerce solution engineered for cricket gear, fitness merchandise, and custom athletic team apparel. Includes shopping cart persistence, multi-variant selectors, and WhatsApp order dispatch integration.`,
    metrics: [
      { k: 'BUILD TOOL', v: 'Vite 5 (Sub-second HMR)' },
      { k: 'STATE MANAGEMENT', v: 'React Context & Local Storage' },
      { k: 'PAYMENT/DISPATCH', v: 'Instant Direct Messaging & Cart Sync' },
      { k: 'RESPONSIVE', v: '100% Mobile & Touch Optimized' }
    ],
    codeSpec: `// Cart Reducer with Persistent State
export function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find(i => i.id === action.payload.id && i.size === action.payload.size);
      if (existing) {
        return state.map(i => i === existing ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...state, { ...action.payload, qty: 1 }];
    }
    case 'REMOVE_ITEM':
      return state.filter(i => !(i.id === action.payload.id && i.size === action.payload.size));
    default:
      return state;
  }
}`
  }
};

export function initProjects() {
  const cards = document.querySelectorAll('.project-tilt-card');
  const modal = document.getElementById('project-modal');
  const closeModalBtn = document.getElementById('close-project-modal');
  const modalDoneBtn = document.getElementById('modal-done-btn');

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let isReducedMotion = mediaQuery.matches;

  // 1. 3D Tilt with Pointer Glare
  cards.forEach((card) => {
    const glare = card.querySelector('.card-glare');

    card.addEventListener('pointermove', (e) => {
      if (isReducedMotion) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-4px)`;

      if (glare) {
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;
        glare.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(0, 240, 255, 0.25) 0%, transparent 65%)`;
      }
    });

    card.addEventListener('pointerleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      if (glare) glare.style.background = '';
    });

    // Open detail modal
    card.addEventListener('click', () => {
      const projId = card.getAttribute('data-project-id');
      openProjectModal(projId);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const projId = card.getAttribute('data-project-id');
        openProjectModal(projId);
      }
    });
  });

  // Modal Close Handlers
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = '';
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (modalDoneBtn) modalDoneBtn.addEventListener('click', closeModal);

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.hidden) {
      closeModal();
    }
  });

  function openProjectModal(projId) {
    const spec = projectSpecs[projId];
    if (!spec || !modal) return;

    playConfirm();

    document.getElementById('modal-project-title').textContent = spec.title;
    document.getElementById('modal-project-subtitle').textContent = spec.tagline;
    document.getElementById('modal-project-tag').textContent = spec.stack;
    document.getElementById('modal-project-arch').textContent = spec.architecture;
    document.getElementById('modal-code-content').textContent = spec.codeSpec;

    // Update real links
    const liveBtn = document.getElementById('modal-live-btn');
    const githubBtn = document.getElementById('modal-github-btn');
    if (liveBtn) liveBtn.href = spec.liveUrl;
    if (githubBtn) githubBtn.href = spec.githubUrl;

    // Build metrics rows
    const metricsContainer = document.getElementById('modal-project-metrics');
    metricsContainer.innerHTML = '';
    spec.metrics.forEach((m) => {
      const row = document.createElement('div');
      row.className = 'modal-metric-row';
      row.innerHTML = `<span class="modal-metric-k">${m.k}</span><span class="modal-metric-v">${m.v}</span>`;
      metricsContainer.appendChild(row);
    });

    modal.hidden = false;
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      if (closeModalBtn) closeModalBtn.focus();
    }, 50);
  }
}
