import React, { useState, useMemo } from 'react';

// Clean, professional SVG icons
const Icons = {
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

// Helper to format dates cleanly
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
  const [sortOrder, setSortOrder] = useState('newest');

  // Intelligent Sorting Logic
  const sortedLogs = useMemo(() => {
    const list = [...tripLogs];
    switch (sortOrder) {
      case 'newest': return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'oldest': return list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'status': return list.sort((a, b) => String(a.status).localeCompare(String(b.status)));
      default: return list;
    }
  }, [tripLogs, sortOrder]);

  if (loading) {
    return (
      <div className="admin-card">
        <div className="admin-card-header">
          <h3>Trip Logs</h3>
        </div>
        <div className="admin-empty">Loading logs...</div>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h3>
          Trip Logs
          <span className="admin-count">
            {tripLogs.length}
          </span>
        </h3>

        {/* ✅ CHANGED: Tabs and Refresh removed, replaced with a clean Sorting Dropdown */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Sort By:</span>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="admin-btn admin-btn-outline"
            style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#fff' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="status">Status</option>
          </select>
        </div>
      </div>

      <div className="admin-table-scroll">
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
            {sortedLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-empty" style={{ padding: '40px' }}>
                  No trip logs recorded yet.
                </td>
              </tr>
            ) : (
              sortedLogs.map(log => (
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
      </div>
    </div>
  );
}