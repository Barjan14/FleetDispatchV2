import React, { useState } from 'react';

// Clean, professional SVG icons to replace emojis
const Icons = {
  Refresh: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  ),
  Car: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  ),
  User: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  MapPin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  )
};

// Helper to format dates cleanly (e.g., "Oct 24, 08:30 AM")
function formatShortDate(dateString) {
  if (!dateString) return '—';
  const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// Helper for status badges
function getStatusBadge(status) {
  const map = {
    Scheduled: 'b-pending',
    Ongoing: 'b-ongoing',
    Completed: 'b-approved',
    Cancelled: 'b-rejected'
  };
  return map[status] || 'b-pending';
}

export default function VehicleLogsPage({ logs = [], loading, tripLogs = [], onRefresh }) {
  const [activeTab, setActiveTab] = useState('trip');

  if (loading) {
    return (
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>System Logs</h3>
        </div>
        <div className="admin-empty">Loading logs...</div>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h3>
          {activeTab === 'trip' ? 'Trip & Booking Logs' : 'Vehicle Change Logs'}
          <span className="admin-count">
            {activeTab === 'trip' ? tripLogs.length : logs.length}
          </span>
        </h3>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setActiveTab('trip')}
            className={`admin-btn ${activeTab === 'trip' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
            style={{ fontSize: '12px' }}
          >
            Trip Logs
          </button>

          <button
            onClick={() => setActiveTab('vehicle')}
            className={`admin-btn ${activeTab === 'vehicle' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
            style={{ fontSize: '12px' }}
          >
            Vehicle Changes
          </button>

          <button 
            onClick={onRefresh} 
            className="admin-btn admin-btn-outline" 
            style={{ padding: '6px 10px', fontSize: '12px', marginLeft: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Icons.Refresh /> Refresh
          </button>
        </div>
      </div>

      <div className="admin-table-scroll">

        {/* ================= TRIP & BOOKING LOGS TABLE ================= */}
        {activeTab === 'trip' && (
          <table className="admin-table" style={{ fontSize: '13px' }}>
            <thead>
              <tr>
                <th>Log Info</th>
                <th>Assignment</th>
                <th>Route (Origin ➔ Dest)</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Logged At</th>
              </tr>
            </thead>

            <tbody>
              {tripLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-empty" style={{ padding: '40px' }}>
                    No trip logs recorded yet.
                  </td>
                </tr>
              ) : (
                tripLogs.map(log => (
                  <tr key={log.id} style={{ transition: 'background-color 0.2s' }}>
                    
                    {/* 1. LOG INFO (ID + Purpose) */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <div className="admin-bold" style={{ color: '#4b5563' }}>#{log.id}</div>
                      <div className="admin-muted-sm" style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={log.purpose}>
                        {log.purpose || 'No Purpose'}
                      </div>
                    </td>

                    {/* 2. ASSIGNMENT (Vehicle + Driver) */}
                    <td style={{ verticalAlign: 'middle', lineHeight: '1.5' }}>
                      <div className="admin-bold-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icons.Car /> {log.vehicles?.name || log.vehicle?.name || 'Unknown Vehicle'}
                      </div>
                      <div className="admin-muted-sm" style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                        <Icons.User /> {log.driver_name || 'Unknown Driver'}
                      </div>
                    </td>

                    {/* 3. ROUTE (Origin -> Destination) */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <div className="admin-bold" style={{ color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icons.MapPin /> {log.origin || '—'}
                      </div>
                      <div className="admin-muted-sm" style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', paddingLeft: '4px' }}>
                        <Icons.ArrowRight /> {log.destination || '—'}
                      </div>
                    </td>

                    {/* 4. SCHEDULE (Start -> End) */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <div className="admin-bold-sm" style={{ color: '#059669' }}>
                        {formatShortDate(log.start_datetime)}
                      </div>
                      <div className="admin-muted-sm">
                        to {formatShortDate(log.end_datetime)}
                      </div>
                    </td>

                    {/* 5. STATUS */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <span className={`admin-badge-mini ${getStatusBadge(log.status)}`} style={{ fontSize: '11px', padding: '4px 8px' }}>
                        {log.status}
                      </span>
                    </td>

                    {/* 6. TIMESTAMP */}
                    <td className="admin-muted-sm" style={{ verticalAlign: 'middle' }}>
                      {formatShortDate(log.created_at)}
                    </td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {/* ================= VEHICLE LOGS TABLE ================= */}
        {activeTab === 'vehicle' && (
          <table className="admin-table" style={{ fontSize: '13px' }}>
            <thead>
              <tr>
                <th>Log ID</th>
                <th>Target Vehicle</th>
                <th>Action Taken</th>
                <th>Change Details</th>
                <th>Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-empty" style={{ padding: '40px' }}>
                    No vehicle changes recorded yet.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} style={{ transition: 'background-color 0.2s' }}>
                    
                    {/* ID */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <code className="admin-muted-sm">#{log.id}</code>
                    </td>
                    
                    {/* VEHICLE */}
                    <td className="admin-bold" style={{ verticalAlign: 'middle' }}>
                      {log.vehicle_name || '—'}
                    </td>

                    {/* ACTION TAKEN (Type + Admin) */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <span className={`admin-badge-mini ${
                        log.change_type === 'create' ? 'b-approved' :
                        log.change_type === 'update' ? 'b-ongoing' :
                        log.change_type === 'delete' ? 'b-rejected' :
                        'b-pending'
                      }`} style={{ marginBottom: '4px', display: 'inline-block' }}>
                        {log.change_type}
                      </span>
                      <div className="admin-muted-sm">by {log.admin_id || 'System'}</div>
                    </td>

                    {/* CHANGE DETAILS (Field + Old -> New) */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <div className="admin-bold-sm" style={{ color: '#4b5563' }}>Field: {log.field_name || '—'}</div>
                      <div className="admin-muted-sm" style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }} title={`${log.old_value} ➔ ${log.new_value}`}>
                        <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>{log.old_value || '—'}</span> 
                        <Icons.ArrowRight /> 
                        <span style={{ color: '#059669', fontWeight: 'bold' }}>{log.new_value || '—'}</span>
                      </div>
                    </td>

                    {/* TIMESTAMP */}
                    <td className="admin-muted-sm" style={{ verticalAlign: 'middle' }}>
                      {formatShortDate(log.created_at)}
                    </td>
                    
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

      </div>
    </div>
  );
}