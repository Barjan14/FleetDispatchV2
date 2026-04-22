import React from 'react';

export default function OverviewPage({ stats }) {
  return (
    <div className="admin-stats-grid">
      {[
        {icon:'🚗', label:'Vehicles', value:stats.totalVehicles||0},
        {icon:'👥', label:'Users',    value:stats.totalUsers||0},
        {icon:'🗂️', label:'Fleets',   value:stats.totalFleets||0},
        {icon:'📅', label:'Pending',  value:stats.pendingBookings||0},
      ].map(s=>(
        <div className="admin-stat-card" key={s.label}>
          <div className="admin-stat-icon">{s.icon}</div>
          <div className="admin-stat-info"><p>{s.label}</p><h2>{s.value}</h2></div>
        </div>
      ))}
    </div>
  );
}
