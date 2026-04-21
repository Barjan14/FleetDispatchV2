import React, { useState } from 'react';
import '../styles/Login.css';

const Login = () => {
  const [exitAnimation, setExitAnimation] = useState(false);

  const navigateTo = (url) => {
    setExitAnimation(true);
    setTimeout(() => {
      window.location.href = url;
    }, 800);
  };    return (
    <div className={`login-container user-login ${exitAnimation ? 'exit-animation' : ''}`}>
      {/* Company Logo */}
      <div className="company-logo">
        <img 
          src="/public/assets/images/Company_Logo.png" 
          alt="Company Logo"
        />
      </div>

      {/* Background Image with Car - Full Screen */}
      <div className="login-image-section">
        <div className="background-image-wrapper">
          <img 
            src="/assets/images/background_1.png" 
            alt="Background"
          />        </div>        <div className="car-wrapper">
          <div className="car-circle-wrapper">
            <img 
              className="login-car"
              src="/assets/images/car.png" 
              alt="Fleet Vehicle"
            />
          </div>
        </div>
      </div>

      {/* Floating Form Box - Centered and Above Background */}
      <div className="login-form-container">
        <div className="login-card">
          {/* Logo and Header */}
          <div className="login-header">
            <div className="logo-container">
              <div className="logo-icon">
                <svg viewBox="0 0 100 100" className="logo-svg">
                  <circle cx="50" cy="30" r="8" fill="white"/>
                  <rect x="30" y="45" width="40" height="15" rx="3" fill="white" opacity="0.8"/>
                  <circle cx="40" cy="65" r="8" fill="white"/>
                  <circle cx="60" cy="65" r="8" fill="white"/>
                  <line x1="35" y1="50" x2="25" y2="40" stroke="white" strokeWidth="2"/>
                  <line x1="65" y1="50" x2="75" y2="40" stroke="white" strokeWidth="2"/>
                </svg>
              </div>
            </div>
            <h1 className="logo-text">FLEET DISPATCH</h1>
            <p className="header-subtitle">Select your login option</p>
          </div>

          {/* Form Box Container */}
          <div className="login-form-box">
            {/* Button Container */}            <div className="login-buttons-container">
              {/* Request Form Button */}
              <button
                type="button"
                className="btn btn-request"
                onClick={() => navigateTo('/request-form')}
              >
                Request Form
              </button>

              {/* Admin Login Button */}
              <button
                type="button"
                className="btn btn-admin"
                onClick={() => navigateTo('/admin-login')}
              >
                Login as Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
