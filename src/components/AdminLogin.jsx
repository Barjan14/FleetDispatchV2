import React, { useState } from 'react';
import '../styles/AdminLogin.css';
import { supabase } from '../supabaseClient';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [exitAnimation, setExitAnimation]     = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDir, setTransitionDir]     = useState('forward');

  const navigateTo = (url, dir = 'forward') => {
    if (isTransitioning) return;
    setTransitionDir(dir);
    setIsTransitioning(true);
    setExitAnimation(true);
    setTimeout(() => { window.location.href = url; }, 900);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email: username, password });

      if (authError) {
        setError('Invalid admin credentials');
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from('employee_profiles')
        .select('role')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError || profile?.role !== 'admin') {
        await supabase.auth.signOut();
        setError('Access denied. This account is not an admin.');
        return;
      }

      localStorage.setItem('adminToken', authData.session.access_token);
      localStorage.setItem('isAdmin', 'true');
      localStorage.setItem('adminUser', JSON.stringify({
        id:       authData.user.id,
        username: authData.user.email.split('@')[0],
        email:    authData.user.email,
      }));

      navigateTo('/admin-dashboard');

    } catch (err) {
      console.error('Admin login error:', err);
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
    <div className={`admin-login-container admin-login ${exitAnimation ? 'exit-animation' : ''}`}>

      {/* Full-page background — image + gradient that fades right */}
      <div className="admin-bg-fullpage" aria-hidden="true">
        <img src="/assets/images/admin-bg-1.jpg" alt="" />
        <div className="admin-bg-gradient" />
      </div>

      {/* Floating particles */}
      <div className="al-particles" aria-hidden="true">
        {Array.from({ length: 12 }).map((_, i) => (
          <span key={i} className={`al-particle al-particle-${i + 1}`} />
        ))}
      </div>

      {/* Left branding column */}
      <div className="admin-content-left">
        <div className="admin-panel-center">
          <div className="admin-collab-bar">
            <div className="admin-collab-logo-wrap">
              <img src="/assets/images/DAR-FLEET.png" alt="DAR Fleet" className="admin-collab-logo" />
            </div>
            <span className="admin-collab-x">×</span>
            <div className="admin-collab-logo-wrap">
              <img src="/assets/images/PQ-LOGO.png" alt="PQ" className="admin-collab-logo" />
            </div>
          </div>
          <h2 className="admin-panel-title">Fleet Dispatch<br />Management</h2>
          <p className="admin-panel-subtitle">Monitor · Dispatch · Control</p>
        </div>
      </div>

      {/* Right form column */}
      <div className="admin-form-container">
        <div className="admin-login-card">

          {/* Header */}
          <div className="admin-header">
            <h1 className="admin-logo-text">ADMIN PANEL</h1>
            <p className="admin-header-subtitle">
              {username || password ? 'Verify your credentials' : 'Fleet Dispatch Management'}
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="admin-form-box">
            <form onSubmit={handleAdminLogin} className="admin-login-form">

              <div className="admin-form-group">
                <label htmlFor="admin-username" className="admin-form-label">Admin Username</label>
                <div className="admin-input-wrapper">
                  <input
                    type="text"
                    id="admin-username"
                    className="admin-form-input"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your admin email"
                    required
                  />
                </div>
              </div>

              <div className="admin-form-group">
                <label htmlFor="admin-password" className="admin-form-label">Password</label>
                <div className="admin-password-input-wrapper admin-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="admin-password"
                    className="admin-form-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    className="admin-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <svg className="admin-eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    ) : (
                      <svg className="admin-eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                        <line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" className="admin-btn admin-btn-primary" disabled={isLoading}>
                {isLoading ? 'Authenticating...' : 'ACCESS ADMIN PANEL'}
              </button>

              <button type="button" className="admin-btn admin-btn-back" onClick={() => navigateTo('/request-form', 'back')}>
                REQUEST FORM
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>

      {/* Car flyby — outside container so exit fade never kills it */}
      <div className={`al-car-transition ${isTransitioning ? 'active' : ''} ${transitionDir === 'back' ? 'reverse' : ''}`} aria-hidden="true">
        <div className="al-car-runner">
          <img src="/assets/images/car.png" alt="car" />
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
