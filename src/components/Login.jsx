import React, { useState, useRef, useCallback } from 'react';
import '../styles/Login.css';
import '../styles/AboutModal.css';
import bgVideo from '../assets/videos/bg_video.mp4';
import AboutModal from './AboutModal';

const Login = () => {
  const [exitAnimation, setExitAnimation]     = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [tilt, setTilt]                       = useState({ x: 0, y: 0 });
  const [ripples, setRipples]                 = useState([]);
  const [btnPressed, setBtnPressed]           = useState(null);
  const [showAbout, setShowAbout]             = useState(false);

  const cardRef  = useRef(null);
  const rippleId = useRef(0);

  /* ── Routing (untouched) ──────────────────────────────────── */
  const navigateTo = (url) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setExitAnimation(true);
    setTimeout(() => { window.location.href = url; }, 900);
  };

  /* ── 3-D card tilt ────────────────────────────────────────── */
  const handleMouseMove = useCallback((e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (rect.width  / 2);
    const dy   = (e.clientY - cy) / (rect.height / 2);
    setTilt({ x: dy * -6, y: dx * 6 });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  /* ── Click ripple ─────────────────────────────────────────── */
  const triggerRipple = (e, btnKey) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id   = ++rippleId.current;
    setRipples(prev => [
      ...prev,
      { id, x: e.clientX - rect.left, y: e.clientY - rect.top, btn: btnKey },
    ]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
  };

  return (
    <>
      <div className={`login-container user-login ${exitAnimation ? 'exit-animation' : ''}`}>

        {/* ── Video Background — sits behind everything ────────── */}
        <div className="video-bg">
          <video
            autoPlay
            muted
            loop
            playsInline
            src={bgVideo}
          />
          <div className="video-overlay" />
        </div>

        {/* ── Floating particles ──────────────────────────────── */}
        <div className="particles" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => (
            <span key={i} className={`particle particle-${i + 1}`} />
          ))}
        </div>

        {/* ── All content stacked vertically in the center ─────── */}
        <div className="login-content">

          {/* Login Card */}
          <div
            className="login-card"
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            }}
          >
            {/* Shine that follows mouse tilt */}
            <div
              className="card-shine"
              style={{
                background: `radial-gradient(
                  circle at ${50 + tilt.y * 5}% ${50 + tilt.x * 5}%,
                  rgba(255,255,255,0.18) 0%,
                  transparent 65%
                )`,
              }}
            />

            {/* Header */}
            <div className="login-header">
              <div className="logo-container">
                <img className="brand-logo" src="/assets/images/Company_Logo.png" alt="DAR Logo" draggable="false" />
              </div>
              <h1 className="logo-text">FLEET DISPATCH</h1>
              <p className="header-subtitle">Select your login option</p>
            </div>

            {/* Buttons */}
            <div className="login-form-box">
              <div className="login-buttons-container">

                <button
                  type="button"
                  className={`btn btn-request ${btnPressed === 'request' ? 'btn-pressing' : ''}`}
                  onMouseDown={() => setBtnPressed('request')}
                  onMouseUp={() => setBtnPressed(null)}
                  onMouseLeave={() => setBtnPressed(null)}
                  onClick={(e) => { triggerRipple(e, 'request'); navigateTo('/request-form'); }}
                >
                  {ripples.filter(r => r.btn === 'request').map(r => (
                    <span key={r.id} className="btn-ripple" style={{ left: r.x, top: r.y }} />
                  ))}
                  <span>Request Form</span>
                </button>

                <div className="btn-divider"><span>or</span></div>

                <button
                  type="button"
                  className={`btn btn-admin ${btnPressed === 'admin' ? 'btn-pressing' : ''}`}
                  onMouseDown={() => setBtnPressed('admin')}
                  onMouseUp={() => setBtnPressed(null)}
                  onMouseLeave={() => setBtnPressed(null)}
                  onClick={(e) => { triggerRipple(e, 'admin'); navigateTo('/admin-login'); }}
                >
                  {ripples.filter(r => r.btn === 'admin').map(r => (
                    <span key={r.id} className="btn-ripple btn-ripple--green" style={{ left: r.x, top: r.y }} />
                  ))}
                  <span>Login as Admin</span>
                </button>

              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Car flyby — outside login-container so exit fade never kills it */}
      <div className={`page-transition ${isTransitioning ? 'active' : ''}`} aria-hidden="true">
        <div className="car-runner">
          <img src="/assets/images/car.png" alt="car" />
        </div>
      </div>

      {/* ── Floating ? button ── */}
      <button
        className="am-help-btn"
        onClick={() => setShowAbout(true)}
        aria-label="About Fleet Dispatch"
        title="About & Help"
      >
        ?
      </button>

      {/* ── About modal ── */}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
  );
};

export default Login;