import React, { useState, useEffect, useRef } from 'react';
import '../styles/AboutModal.css';

/* ── SVG icon component ───────────────────────────────────── */
const PATHS = {
  zap:         <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  shield:      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  monitor:     <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>,
  bell:        <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  barChart:    <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  fileText:    <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>,
  clipboard:   <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></>,
  checkCircle: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></>,
  key:         <><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></>,
  truck:       <><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></>,
  trendingUp:  <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
  grid:        <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
};

const Icon = ({ name, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    {PATHS[name]}
  </svg>
);

/* ── Data ─────────────────────────────────────────────────── */
const DEVS = [
  {
    name: 'Dev Name One',
    role: 'Full Stack Developer',
    desc: 'Led system architecture, Supabase integration, and real-time data sync across the platform.',
    img: '/assets/images/devs/dev1.jpg',
    initials: 'DN',
    color: '#f5a623',
  },
  {
    name: 'Dev Name Two',
    role: 'Frontend Developer',
    desc: 'Crafted the admin dashboard UI, component library, and interactive data visualizations.',
    img: '/assets/images/devs/dev2.jpg',
    initials: 'DN',
    color: '#2952d9',
  },
  {
    name: 'Dev Name Three',
    role: 'UI/UX Designer',
    desc: 'Defined the design system, user flows, and visual identity aligned with DAR branding.',
    img: '/assets/images/devs/dev3.jpg',
    initials: 'DN',
    color: '#7c9df5',
  },
  {
    name: 'Dev Name Four',
    role: 'Backend Developer',
    desc: 'Built database schemas, RLS policies, booking logic, and financial reporting queries.',
    img: '/assets/images/devs/dev4.jpg',
    initials: 'DN',
    color: '#e8941a',
  },
  {
    name: 'Dev Name Five',
    role: 'QA & Documentation',
    desc: 'Handled testing, bug triaging, deployment pipeline, and authored the system documentation.',
    img: '/assets/images/devs/dev5.jpg',
    initials: 'DN',
    color: '#4d78f0',
  },
];

const FEATURES = [
  { icon: 'zap',       label: 'Real-time Sync',    desc: 'Live updates via Supabase Realtime',   color: '#FFBE26' },
  { icon: 'shield',    label: 'Role-based Access',  desc: 'Separated admin & employee portals',   color: '#4ade80' },
  { icon: 'monitor',   label: 'Responsive',         desc: 'Smooth on desktop, tablet & mobile',   color: '#34d399' },
  { icon: 'bell',      label: 'Smart Alerts',       desc: 'Toast notifications on every action',  color: '#fbbf24' },
  { icon: 'barChart',  label: 'Financial Reports',  desc: 'Aggregated cost tracking with charts', color: '#a3e635' },
  { icon: 'fileText',  label: 'Full Audit Trail',   desc: 'Every change is permanently logged',   color: '#f472b6' },
];

const STEPS = [
  { icon: 'clipboard',   title: 'Submit a Vehicle Request',   desc: 'Employees access the Request Form from the main login screen. Fill in trip details — destination, date/time, purpose, and passenger count — then submit. No account required.' },
  { icon: 'checkCircle', title: 'Admin Reviews Bookings',     desc: 'Admins log in through the Admin Login portal. Pending requests surface on the Bookings page. Admins can assign a vehicle and driver, then approve or reject with a single click.' },
  { icon: 'key',         title: 'Vehicle & Driver Assignment', desc: 'The Vehicles page lists all fleet units with condition, availability, and odometer data. The Drivers page tracks status and assignments. Approved bookings auto-update both.' },
  { icon: 'truck',       title: 'Fleet Management',           desc: 'Group vehicles into named fleets via the Fleets page. Track ongoing trips, mark vehicles as returned, and monitor live fleet utilization at a glance.' },
  { icon: 'barChart',    title: 'Financial Overview',         desc: 'The Financial Data page aggregates fuel, maintenance, and trip costs. Charts and summary cards give management a real-time pulse on fleet spending.' },
  { icon: 'fileText',    title: 'Audit Logs',                 desc: 'Every vehicle change and trip is automatically recorded in the Logs page — who changed what and when — providing a full audit trail for compliance.' },
  { icon: 'grid',        title: 'Dashboard Overview',         desc: "The Overview page presents live counts of vehicles, active bookings, pending requests, and ongoing trips in a clean stats panel — the admin's command center." },
];

const SECTIONS = [
  { id: 'am-sec-team',   label: 'Team'   },
  { id: 'am-sec-system', label: 'System' },
  { id: 'am-sec-guide',  label: 'Guide'  },
];

/* ── Scroll-reveal hook ───────────────────────────────────── */
const useReveal = () => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el   = ref.current;
    const root = document.getElementById('am-scroll-body');
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { root: root || null, threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return [ref, visible];
};

/* ── Dev Card ─────────────────────────────────────────────── */
const DevCard = ({ dev, index }) => {
  const [imgError, setImgError] = useState(false);
  const [ref, visible] = useReveal();

  return (
    <div
      ref={ref}
      className={`am-dev-card ${visible ? 'am-revealed' : ''}`}
      style={{ '--accent': dev.color, '--i': index }}
    >
      <span className="am-dev-num">0{index + 1}</span>

      <div className="am-dev-avatar-wrap">
        {!imgError ? (
          <img src={dev.img} alt={dev.name} className="am-dev-avatar" onError={() => setImgError(true)} />
        ) : (
          <div className="am-dev-avatar-fallback">{dev.initials}</div>
        )}
        <svg className="am-dev-ring-svg" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="none" stroke={dev.color}
            strokeWidth="2.5" strokeDasharray="72 216" strokeLinecap="round" />
          <circle cx="50" cy="50" r="46" fill="none" stroke={dev.color}
            strokeWidth="1" strokeDasharray="10 278" strokeLinecap="round" opacity="0.3" />
        </svg>
      </div>

      <div className="am-dev-info">
        <span className="am-dev-name">{dev.name}</span>
        <span className="am-dev-role" style={{ color: dev.color }}>{dev.role}</span>
        <p className="am-dev-desc">{dev.desc}</p>
      </div>
    </div>
  );
};

/* ── Feature Card ─────────────────────────────────────────── */
const FeatureCard = ({ f, index }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`am-feature-card ${visible ? 'am-revealed' : ''}`}
      style={{ '--fc': f.color, '--i': index }}
    >
      <span className="am-feature-icon-wrap" style={{ color: f.color }}>
        <Icon name={f.icon} size={22} />
      </span>
      <strong className="am-feature-label">{f.label}</strong>
      <span className="am-feature-desc">{f.desc}</span>
    </div>
  );
};

/* ── Step Card ────────────────────────────────────────────── */
const StepCard = ({ step, index, total }) => {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`am-step ${visible ? 'am-revealed' : ''}`}
      style={{ '--i': index }}
    >
      <div className="am-step-left">
        <div className="am-step-bubble">
          <Icon name={step.icon} size={20} />
        </div>
        {index < total - 1 && <div className="am-step-line" />}
      </div>
      <div className="am-step-body">
        <span className="am-step-num">Step {String(index + 1).padStart(2, '0')}</span>
        <h3 className="am-step-title">{step.title}</h3>
        <p className="am-step-desc">{step.desc}</p>
      </div>
    </div>
  );
};

/* ── Main Modal ───────────────────────────────────────────── */
const AboutModal = ({ onClose }) => {
  const overlayRef = useRef(null);
  const bodyRef    = useRef(null);
  const [visible,   setVisible]   = useState(false);
  const [activeNav, setActiveNav] = useState('am-sec-team');

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const onKey = (e) => { if (e.key === 'Escape') handleClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    const onScroll = () => {
      const bodyTop = body.getBoundingClientRect().top;
      for (const sec of [...SECTIONS].reverse()) {
        const el = document.getElementById(sec.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - bodyTop <= 100) {
          setActiveNav(sec.id);
          break;
        }
      }
    };
    body.addEventListener('scroll', onScroll, { passive: true });
    return () => body.removeEventListener('scroll', onScroll);
  }, []);

  const handleClose = () => { setVisible(false); setTimeout(onClose, 420); };
  const handleBackdrop = (e) => { if (e.target === overlayRef.current) handleClose(); };

  const scrollTo = (id) => {
    const el   = document.getElementById(id);
    const body = bodyRef.current;
    if (!el || !body) return;
    body.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' });
  };

  return (
    <div
      ref={overlayRef}
      className={`am-overlay ${visible ? 'am-overlay--in' : ''}`}
      onClick={handleBackdrop}
      role="dialog" aria-modal="true" aria-label="About Fleet Dispatch"
    >
      <div className={`am-panel ${visible ? 'am-panel--in' : ''}`}>

        {/* ── Top bar ── */}
        <div className="am-topbar">

          {/* Centered nav */}
          <nav className="am-nav" aria-label="Sections">
            {[
              { id: 'am-sec-team',   label: 'Team',   icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              { id: 'am-sec-system', label: 'System', icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg> },
              { id: 'am-sec-guide',  label: 'Guide',  icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="14" height="14"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> },
            ].map(s => (
              <button
                key={s.id}
                className={`am-nav-btn ${activeNav === s.id ? 'am-nav-btn--on' : ''}`}
                onClick={() => scrollTo(s.id)}
              >
                {s.icon}
                <span>{s.label}</span>
              </button>
            ))}
          </nav>

          {/* Close */}
          <button className="am-close-btn" onClick={handleClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div id="am-scroll-body" ref={bodyRef} className="am-body">

          {/* ── Hero / Collab ── */}
          <div className="am-hero">
            <div className="am-hero-orb am-hero-orb-1" />
            <div className="am-hero-orb am-hero-orb-2" />
            <div className="am-hero-orb am-hero-orb-3" />
            <div className="am-hero-inner">

              <h1 className="am-hero-title">Built for DAR,<br />Driven by Data.</h1>
              <p className="am-hero-lead">
                A real-time fleet management system designed to modernize vehicle
                dispatch operations at the Department of Agrarian Reform.
              </p>
              <div className="am-hero-stack">
                {['React', 'Supabase', 'Vite', 'PostgreSQL'].map(t => (
                  <span key={t} className="am-hero-tag">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* ── Team ── */}
          <section id="am-sec-team" className="am-section am-section--pq">
            <div className="am-section-head">
              <span className="am-eyebrow am-eyebrow--pq">Penta Quail · USTP</span>
              <h2 className="am-heading">Meet the Developers</h2>
              <p className="am-lead">
                Five interns from the University of Science and Technology of the Philippines (USTP),
                turning a real organizational challenge into a polished digital solution for DAR.
              </p>
            </div>
            <div className="am-dev-list">
              {DEVS.map((dev, i) => <DevCard key={i} dev={dev} index={i} />)}
            </div>
          </section>

          {/* ── System ── */}
          <section id="am-sec-system" className="am-section">
            <div className="am-section-head">
              <span className="am-eyebrow">About the System</span>
              <h2 className="am-heading">What is Fleet Dispatch?</h2>
              <p className="am-lead">
                Fleet Dispatch replaces manual vehicle logbooks with a centralized, real-time platform —
                covering the full workflow from booking requests to trip completion and cost reporting.
              </p>
            </div>
            <div className="am-features-grid">
              {FEATURES.map((f, i) => <FeatureCard key={i} f={f} index={i} />)}
            </div>
          </section>

          {/* ── Guide ── */}
          <section id="am-sec-guide" className="am-section">
            <div className="am-section-head">
              <span className="am-eyebrow">User Manual</span>
              <h2 className="am-heading">How It Works</h2>
              <p className="am-lead">A step-by-step walkthrough of the system's core features and workflows.</p>
            </div>
            <div className="am-steps-list">
              {STEPS.map((s, i) => <StepCard key={i} step={s} index={i} total={STEPS.length} />)}
            </div>
          </section>

          {/* ── Footer ── */}
          <footer className="am-footer">
            <div className="am-footer-collab">
              <img src="/assets/images/DAR-FLEET.png" alt="DAR"          className="am-footer-logo" />
              <span className="am-footer-x">×</span>
              <img src="/assets/images/PQ-LOGO.png"   alt="Penta Quail"  className="am-footer-logo" />
            </div>
            <p className="am-footer-stack">React · Supabase · Vite · PostgreSQL</p>
            <p className="am-footer-copy">© 2025 Penta Quail · USTP — Department of Agrarian Reform</p>
          </footer>

        </div>
      </div>
    </div>
  );
};

export default AboutModal;
