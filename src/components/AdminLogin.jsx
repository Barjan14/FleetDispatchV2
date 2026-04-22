import React, { useState } from 'react';
import '../styles/AdminLogin.css';
import { supabase } from '../supabaseClient';

const AdminLogin = () => {
  const [username, setUsername] = useState('');   // holds email value
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [exitAnimation, setExitAnimation] = useState(false);
  const [headerVisible] = useState(true);

  const navigateTo = (url) => {
    setExitAnimation(true);
    setTimeout(() => { window.location.href = url; }, 800);
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Sign in via Supabase Auth (username field = email)
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({ email: username, password });

      if (authError) {
        setError('Invalid admin credentials');
        return;
      }

      // 2. Check role in employee_profiles — must be 'admin'
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

      // 3. Persist session — same localStorage keys the dashboard already reads
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
    <div className={`admin-login-container admin-login ${exitAnimation ? 'exit-animation' : ''}`}>
      {/* Company Logo */}
      <div className="company-logo">
        <img src="/public/assets/images/Company_Logo.png" alt="Company Logo" />
      </div>

      {/* Background Image with Car - Full Screen */}
      <div className="admin-image-section">
        <div className="background-image-wrapper">
          <img src="/assets/images/background_2.png" alt="Background" />
        </div>
        <div className="car-wrapper">
          <div className="car-circle-wrapper-admin">
            <img className="admin-car" src="/assets/images/car.png" alt="Fleet Vehicle" />
          </div>
        </div>
      </div>

      {/* Floating Form Box */}
      <div className="admin-form-container">
        <div className="admin-login-card">
          {/* Header */}
          <div className={`admin-header ${!headerVisible ? 'hidden' : ''}`}>
            <div className="admin-logo-icon">
              <svg viewBox="0 0 100 100" className="admin-logo-svg">
                <rect x="20" y="20" width="60" height="60" rx="5" fill="none" stroke="white" strokeWidth="3"/>
                <circle cx="50" cy="50" r="8" fill="white"/>
                <line x1="50" y1="30" x2="50" y2="20" stroke="white" strokeWidth="2"/>
                <line x1="70" y1="50" x2="80" y2="50" stroke="white" strokeWidth="2"/>
              </svg>
            </div>
            <h1 className="admin-logo-text">ADMIN PANEL</h1>
            <p className="admin-header-subtitle">
              {username || password ? 'Verify your credentials' : 'Fleet Dispatch Management'}
            </p>
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Form Box */}
          <div className="admin-form-box">
            <form onSubmit={handleAdminLogin} className="admin-login-form">

              {/* Email input — label says "Admin Username" to keep look identical */}
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

              {/* Password */}
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

              <button type="button" className="admin-btn admin-btn-back" onClick={() => navigateTo('/request-form')}>
                REQUEST FORM
              </button>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;