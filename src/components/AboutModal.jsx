import React, { useState, useEffect, useRef } from 'react';
import '../styles/AboutModal.css';

/* ── SVG icon paths ───────────────────────────────────────── */
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
  users:       <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  github:      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>,
  close:       <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
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
    name: 'Bryle Jan Nacalaban',
    role: 'Full-Stack Developer',
    desc: 'Architected the entire system foundation — configuring Supabase projects, designing the PostgreSQL schema, implementing secure admin authentication with JWT tokens, setting up Row-Level Security policies, managing version control, handling Vercel deployment, and leading the overall technical architecture of Fleet Dispatch.',
    img: '/assets/images/BRYLE.jpg',
    initials: 'B',
    color: '#3b82f6',
    objectPosition: 'center top',
    github: 'https://github.com/Barjan14',
  },
  {
    name: 'Shun Cyrel Caseres',
    role: 'Backend Developer',
    desc: 'Built the employee-facing booking request form, developed the Drivers page with full Supabase data integration, wired the Gmail-powered email notification system, contributed to system architecture, and participated in end-to-end testing and bug triaging throughout the project.',
    img: '/assets/images/SHUN.jpg',
    initials: 'S',
    color: '#22c55e',
    objectPosition: 'center top',
    github: 'https://github.com/5huncyrel',
  },
  {
    name: 'Ian Olandria',
    role: 'UI/UX Designer',
    desc: 'Created all wireframes and high-fidelity screen mockups, established the visual design language and DAR-aligned brand identity, and handled API integration to connect frontend components with backend data — ensuring a consistent and intuitive experience across every page.',
    img: '/assets/images/IAN.png',
    initials: 'I',
    color: '#eab308',
    objectPosition: 'center 15%',
    github: 'https://github.com/IyanuKwent',
  },
  {
    name: 'Rehana Nicole Ruilan',
    role: 'Frontend Developer',
    desc: 'Developed the complete admin dashboard frontend — the Overview, Vehicles, Bookings, Drivers, Fleets, Financial Data, and Logs pages — along with the full design system, component styling, and UI/UX polish. Also led end-to-end testing and bug triaging across all system features.',
    img: '/assets/images/REHANA.png',
    initials: 'R',
    color: '#fb923c',
    objectPosition: 'center top',
    github: 'https://github.com/BadGalRiirii',
  },
  {
    name: 'Faith Grace Gutierrez',
    role: 'QA & Documentation',
    desc: 'Authored the comprehensive system documentation, user manuals, and technical write-ups — ensuring every feature, workflow, and page in Fleet Dispatch is clearly documented for administrators and end users alike.',
    img: '/assets/images/FAITH.jpg',
    initials: 'F',
    color: '#f472b6',
    objectPosition: 'center top',
    github: 'https://github.com/faithgrace7',
  },
];

const FEATURES = [
  { icon: 'zap',       label: 'Real-time Sync',    desc: 'Live updates via Supabase Realtime WebSockets',   color: '#FFBE26' },
  { icon: 'shield',    label: 'Role-based Access',  desc: 'Separated admin & public employee portals',        color: '#4ade80' },
  { icon: 'monitor',   label: 'Responsive Design',  desc: 'Smooth on desktop, tablet & mobile screens',       color: '#34d399' },
  { icon: 'bell',      label: 'Email Alerts',       desc: 'Automated approval/rejection emails via Edge Fn',  color: '#fbbf24' },
  { icon: 'barChart',  label: 'Financial Reports',  desc: 'Aggregated fuel, maintenance & repair tracking',   color: '#a3e635' },
  { icon: 'fileText',  label: 'Full Audit Trail',   desc: 'Every vehicle change and trip permanently logged', color: '#f472b6' },
];

const STEPS = [
  {
    icon: 'clipboard',
    role: 'employee',
    title: 'Submit a Vehicle Request',
    desc: 'Go to the Fleet Dispatch website and click the Request Form button on the main page — no account or password is needed. Fill in your full name, department, destination, reason for the trip, number of passengers, and your preferred departure and return date and time. When finished, click Submit. A confirmation message will appear on screen to confirm that your request was received.',
    note: 'No account or password needed — the Request Form is open to everyone directly from the main page.',
  },
  {
    icon: 'checkCircle',
    role: 'admin',
    title: 'Admin Reviews Pending Requests',
    desc: 'Log in to the Admin Portal using the Admin Login button on the main page, then enter your username and password. Once inside, go to the Bookings page and look under the Pending tab — new requests from employees appear there automatically. Click on any request to read the full details: the employee\'s name, department, destination, purpose, and number of passengers.',
    note: 'New requests appear automatically — you do not need to refresh the page.',
  },
  {
    icon: 'key',
    role: 'admin',
    title: 'Assign a Vehicle and Driver',
    desc: 'While viewing the booking you just opened, use the two dropdown menus to select a vehicle and a driver. The dropdowns will only show vehicles and drivers that are currently free — you do not need to check other pages. You must choose both a vehicle and a driver before the Approve button becomes available to click.',
    note: 'The Approve button stays grayed out until both a vehicle and a driver have been selected.',
  },
  {
    icon: 'checkCircle',
    role: 'admin',
    title: 'Approve or Reject the Booking',
    desc: 'Click Approve to confirm the trip. The system will automatically mark the chosen vehicle as On Duty and the driver as On Trip, then send an email to the employee with all trip details — vehicle name, driver name, destination, and departure time. If the request cannot be accommodated, click Reject — the employee will also receive an email letting them know.',
    note: 'Both Approve and Reject send an email to the employee automatically — no separate step needed.',
  },
  {
    icon: 'truck',
    role: 'admin',
    title: 'Monitor and Dispatch from the Fleets Page',
    desc: 'Open the Fleets page to see all approved and active trips in one place. When the vehicle departs, find that booking in the list and click Mark as Ongoing. When the vehicle returns, click Mark as Returned. The system will automatically set the vehicle back to Available and free up the driver — no extra steps needed.',
    note: 'Clicking Mark as Returned resets both the vehicle and the driver back to Available automatically.',
  },
  {
    icon: 'monitor',
    role: 'admin',
    title: 'Manage Vehicles',
    desc: 'The Vehicles page shows every vehicle in the fleet as a card. Each card has a colored header that tells you the current status at a glance. Each card also shows the license plate, fuel type, and condition rating. Click Edit on any card to update the vehicle\'s condition. Use the Add Vehicle button at the top right to register a new vehicle.',
    note: 'Click any vehicle card to open the full detail sheet with the complete vehicle history.',
    legend: [
      { color: '#006205', status: 'Bright Green — Available', desc: 'Ready to be assigned to a trip' },
      { color: '#1e5a3a', status: 'Dark Green — On Duty',    desc: 'Currently out on a trip' },
      { color: '#64748b', status: 'Gray — Under Repair',     desc: 'Temporarily out of rotation' },
      { color: '#dc2626', status: 'Red — Out of Service',    desc: 'Decommissioned or unsafe to use' },
    ],
  },
  {
    icon: 'users',
    role: 'admin',
    title: 'Manage Driver Profiles',
    desc: 'The Drivers page shows a list of all drivers along with their license number, license type, expiry date, and current availability. Use the status filter at the top of the page to quickly find drivers that are Available. Click Edit on any driver card to update their information.',
    note: 'Watch the license expiry colors: red means already expired, yellow means it expires within the next 60 days.',
  },
  {
    icon: 'barChart',
    role: 'admin',
    title: 'Track Expenses with Financial Data',
    desc: 'The Financial Data page is where you log and review fleet expenses. It has three sections: Fuel Records — log each refueling by selecting the vehicle, date, liters filled, and total cost; Maintenance Costs — record scheduled service expenses; and Repair Records — record any repair work with a description and cost. Charts at the top of the page update automatically as you add entries, giving you a clear monthly view of spending.',
    note: 'The charts update automatically each time you add a new record — no manual refresh needed.',
  },
  {
    icon: 'fileText',
    role: 'admin',
    title: 'Review the System Logs',
    desc: 'The Logs page keeps an automatic record of everything that happens in the system — you do not need to do anything to activate it. Every time a vehicle is edited, a trip is started, or a booking is updated, a new entry is created. You can scroll through the full history or use the date filter to find a specific event. This page is useful for checking when something happened or confirming who made a change.',
    note: 'Logs are recorded automatically. Nothing gets deleted — the full history is always there.',
  },
  {
    icon: 'grid',
    role: 'admin',
    title: 'Use the Overview Dashboard',
    desc: 'The Overview page is the first thing you see after logging in, and it gives you a summary of everything at a glance. It shows how many vehicles are available, how many drivers are active, and how many trips have been completed this month. There is also a calendar showing which days have scheduled trips, a list of today\'s departures and expected returns, any overdue vehicle alerts, and a financial snapshot for the current month. Everything on this page updates automatically — no need to refresh.',
    note: 'Start here every morning — the Overview shows you everything important in one place.',
  },
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
const DevCard = ({ dev, index, onClick }) => {
  const [imgError, setImgError] = useState(false);
  const [ref, visible] = useReveal();

  return (
    <div
      ref={ref}
      className={`am-dev-card ${visible ? 'am-revealed' : ''}`}
      style={{ '--accent': dev.color, '--i': index, cursor: 'pointer' }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick?.()}
    >
      <span className="am-dev-num">0{index + 1}</span>

      <div className="am-dev-avatar-wrap">
        {!imgError ? (
          <img
            src={dev.img}
            alt={dev.name}
            className="am-dev-avatar"
            style={{ objectPosition: dev.objectPosition || 'center' }}
            onError={() => setImgError(true)}
          />
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

      {/* Click hint */}
      <span className="am-dev-expand-hint">View profile →</span>
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
const ROLE_STYLE = {
  employee: { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.28)', color: '#93c5fd', label: 'Employee' },
  admin:    { bg: 'rgba(255,190,38,0.1)',  border: 'rgba(255,190,38,0.26)',  color: '#FFBE26', label: 'Admin'    },
};

const StepCard = ({ step, index, total }) => {
  const [ref, visible] = useReveal();
  const rs = step.role ? ROLE_STYLE[step.role] : null;

  return (
    <div className="am-step-wrap" ref={ref} style={{ '--i': index }}>
      <div className={`am-step-card ${visible ? 'am-revealed' : ''}`}>

        {/* Header */}
        <div className="am-step-card-head">
          <div className="am-step-bubble">
            <Icon name={step.icon} size={24} />
          </div>
          <div className="am-step-head-info">
            <span className="am-step-num">Step {String(index + 1).padStart(2, '0')}</span>
            <h3 className="am-step-title">{step.title}</h3>
          </div>
          {rs && (
            <span className="am-step-role" style={{ background: rs.bg, borderColor: rs.border, color: rs.color }}>
              {rs.label}
            </span>
          )}
        </div>

        {/* Body */}
        <div className="am-step-card-body">
          <p className="am-step-desc">{step.desc}</p>

          {step.note && (
            <div className="am-step-note">
              <span className="am-step-note-icon" aria-hidden="true">💡</span>
              <span>{step.note}</span>
            </div>
          )}

          {step.legend && (
            <div className="am-step-legend">
              <span className="am-step-legend-title">Card Color Guide</span>
              {step.legend.map((item, i) => (
                <div key={i} className="am-legend-item">
                  <span className="am-legend-swatch" style={{ background: item.color }} />
                  <span className="am-legend-text">
                    <strong>{item.status}</strong>
                    <span className="am-legend-sub">{item.desc}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
      {index < total - 1 && <div className="am-step-connector" />}
    </div>
  );
};

/* ── Expanded Profile Modal ───────────────────────────────── */
const DevProfileModal = ({ dev, index, onClose }) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="am-profile-overlay"
      onClick={(e) => { e.stopPropagation(); onClose(); }}
    >
      <div
        className="am-profile-card"
        style={{ '--accent': dev.color }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button className="am-profile-close" onClick={onClose} aria-label="Close profile">
          <Icon name="close" size={16} />
        </button>

        {/* Background glow */}
        <div className="am-profile-glow" style={{ background: `radial-gradient(circle at 50% 0%, ${dev.color}22 0%, transparent 65%)` }} />

        {/* Number */}
        <span className="am-profile-num">0{index + 1}</span>

        {/* Photo */}
        <div className="am-profile-photo-wrap">
          {!imgError ? (
            <img
              src={dev.img}
              alt={dev.name}
              className="am-profile-photo"
              style={{ objectPosition: dev.objectPosition || 'center' }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="am-profile-photo-fallback">{dev.initials}</div>
          )}
          <svg className="am-profile-ring" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="54" fill="none" stroke={dev.color}
              strokeWidth="2.5" strokeDasharray="100 240" strokeLinecap="round" />
            <circle cx="60" cy="60" r="54" fill="none" stroke={dev.color}
              strokeWidth="1" strokeDasharray="12 328" strokeLinecap="round" opacity="0.25" />
          </svg>
        </div>

        {/* Info */}
        <h2 className="am-profile-name">{dev.name}</h2>
        <span className="am-profile-role" style={{ color: dev.color, borderColor: `${dev.color}40`, background: `${dev.color}12` }}>
          {dev.role}
        </span>

        {/* Divider */}
        <div className="am-profile-divider" style={{ background: `linear-gradient(90deg, transparent, ${dev.color}44, transparent)` }} />

        {/* Description */}
        <p className="am-profile-desc">{dev.desc}</p>

        {/* GitHub link */}
        <a
          href={dev.github}
          target="_blank"
          rel="noopener noreferrer"
          className="am-profile-github"
          style={{ '--accent': dev.color }}
          onClick={e => e.stopPropagation()}
        >
          <Icon name="github" size={15} />
          <span>{dev.github.replace('https://github.com/', '@')}</span>
        </a>
      </div>
    </div>
  );
};

/* ── Main Modal ───────────────────────────────────────────── */
const AboutModal = ({ onClose }) => {
  const overlayRef = useRef(null);
  const bodyRef    = useRef(null);
  const [visible,     setVisible]     = useState(false);
  const [activeNav,   setActiveNav]   = useState('am-sec-team');
  const [expandedDev, setExpandedDev] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (expandedDev) { setExpandedDev(null); setExpandedIdx(null); }
        else handleClose();
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [expandedDev]);

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

  const openProfile = (dev, idx) => { setExpandedDev(dev); setExpandedIdx(idx); };
  const closeProfile = () => { setExpandedDev(null); setExpandedIdx(null); };

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

          <button className="am-close-btn" onClick={handleClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <line x1="18" y1="6"  x2="6"  y2="18" />
              <line x1="6"  y1="6"  x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div id="am-scroll-body" ref={bodyRef} className="am-body">

          {/* ── Hero ── */}
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
                Click any card to view the full profile.
              </p>
            </div>
            <div className="am-dev-list">
              {DEVS.map((dev, i) => (
                <DevCard key={i} dev={dev} index={i} onClick={() => openProfile(dev, i)} />
              ))}
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
              <p className="am-lead">
                A plain-language, step-by-step guide to everything in the system —
                from requesting a vehicle to approving trips, managing the fleet, and reviewing expenses.
                Follow the steps in order for your first time, or jump to any step you need.
              </p>
            </div>
            <div className="am-steps-list">
              {STEPS.map((s, i) => <StepCard key={i} step={s} index={i} total={STEPS.length} />)}
            </div>
          </section>

          {/* ── Footer ── */}
          <footer className="am-footer">
            <div className="am-footer-collab">
              <img src="/assets/images/DAR-FLEET.png" alt="DAR"         className="am-footer-logo" />
              <span className="am-footer-x">×</span>
              <img src="/assets/images/PQ-LOGO.png"   alt="Penta Quail" className="am-footer-logo" />
            </div>
            <p className="am-footer-stack">React · Supabase · Vite · PostgreSQL</p>
            <p className="am-footer-copy">© 2026 Penta Quail · USTP — Department of Agrarian Reform</p>
          </footer>

        </div>
      </div>

      {/* ── Expanded Profile Overlay (sibling to am-panel, inside am-overlay) ── */}
      {expandedDev && (
        <DevProfileModal
          dev={expandedDev}
          index={expandedIdx}
          onClose={closeProfile}
        />
      )}
    </div>
  );
};

export default AboutModal;
