import { useState, useEffect } from 'react';
import '../styles/SplashScreen.css';

export default function SplashScreen({ onDone }) {
  const [phase, setPhase] = useState('show');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('fadeout'), 2200);
    const t2 = setTimeout(() => onDone(), 2850);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className={`splash-screen${phase === 'fadeout' ? ' splash-fadeout' : ''}`}>
      <div className="splash-dots" aria-hidden="true" />

      <div className="splash-content">
        <div className="splash-logo-wrap">
          <img
            src="/assets/images/Company_Logo.png"
            alt="FleetDispatch"
            className="splash-logo"
          />
        </div>

        <div className="splash-brand">
          <h1 className="splash-title">FLEET DISPATCH</h1>
          <p className="splash-sub">Vehicle Management System</p>
          <p className="splash-agency">Department of Agrarian Reform · Region X</p>
        </div>

        <div className="splash-bar-wrap" aria-hidden="true">
          <div className="splash-bar" />
        </div>
      </div>

      <div className="splash-ground" aria-hidden="true" />
      <div className="splash-car-strip" aria-hidden="true">
        <img
          src="/assets/images/car.png"
          alt=""
          className="splash-car"
        />
      </div>
    </div>
  );
}
