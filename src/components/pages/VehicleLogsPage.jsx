import React, { useState } from 'react';

export default function VehicleLogsPage({ logs, loading, tripLogs = [], drivers = [] }) {
  // ✅ Changed default state to 'trip' instead of 'vehicle'
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
      <div className="admin-card-header">
        {/* Dynamically replaces the header based on the active table */}
        <h3>
          {activeTab === 'trip' ? 'Trip & Booking Logs' : 'Vehicle Change Logs'}
          <span className="admin-count">
            {activeTab === 'trip' ? tripLogs.length : logs.length}
          </span>
        </h3>

        <div style={{ display: 'flex', gap: '8px' }}>
          {/* ✅ Swapped button order so Trip Logs is first */}
          <button
            onClick={() => setActiveTab('trip')}
            className={`admin-btn ${activeTab === 'trip' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
            style={{ fontSize: '12px' }}
          >
            Trip & Booking Logs
          </button>

          <button
            onClick={() => setActiveTab('vehicle')}
            className={`admin-btn ${activeTab === 'vehicle' ? 'admin-btn-primary' : 'admin-btn-outline'}`}
            style={{ fontSize: '12px' }}
          >
            Vehicle Changes
          </button>
        </div>
      </div>

      <div className="admin-table-scroll">

        {/* ================= TRIP & BOOKING LOGS TABLE (Now First) ================= */}
        {activeTab === 'trip' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Destination</th>
                <th>Purpose</th>
                <th>Status</th>
                <th>Start</th>
                <th>End</th>
                <th>Distance</th>
                <th>Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {tripLogs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="admin-empty">
                    No trip logs yet.
                  </td>
                </tr>
              ) : (
                tripLogs.map(log => {
                  // ✅ MAGIC FIX: Search the drivers list using BOTH user_id (UUID) and id (BigInt) 
                  // to guarantee we find a match no matter how the database saved it!
                  const matchedDriver = drivers.find(d => 
                    d.user_id === log.driver_id || String(d.id) === String(log.driver_id)
                  );
                  
                  const driverDisplayName = matchedDriver?.name || log.driver?.name || 'Unknown Driver';

                  return (
                    <tr key={log.id}>
                      <td className="admin-muted-sm"><code>#{log.id}</code></td>

                      <td className="admin-bold">
                        {log.vehicles?.name || log.vehicle?.name || log.vehicle_id || '—'}
                      </td>

                      {/* ✅ Uses the perfectly matched driver name */}
                      <td className="admin-bold-sm" style={{ color: '#2563eb' }}>
                        {driverDisplayName}
                      </td>

                      <td className="admin-muted-sm">{log.destination || '—'}</td>
                      
                      <td className="admin-muted-sm" style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.purpose}>
                        {log.purpose || '—'}
                      </td>

                      <td>
                        <span className={`admin-badge-mini ${
                          log.status === 'Scheduled' ? 'b-pending' :
                          log.status === 'Ongoing' ? 'b-ongoing' :
                          log.status === 'Completed' ? 'b-approved' :
                          log.status === 'Cancelled' ? 'b-rejected' :
                          'b-pending'
                        }`}>
                          {log.status}
                        </span>
                      </td>

                      <td className="admin-muted-sm">
                        {log.start_datetime ? new Date(log.start_datetime).toLocaleString() : '—'}
                      </td>

                      <td className="admin-muted-sm">
                        {log.end_datetime ? new Date(log.end_datetime).toLocaleString() : '—'}
                      </td>

                      <td className="admin-muted-sm">
                        {log.distance_km != null ? `${Number(log.distance_km).toFixed(2)} km` : '—'}
                      </td>

                      <td className="admin-muted-sm">
                        {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}

        {/* ================= VEHICLE LOGS TABLE (Now Second) ================= */}
        {activeTab === 'vehicle' && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Vehicle</th>
                <th>Change Type</th>
                <th>Field</th>
                <th>Old Value</th>
                <th>New Value</th>
                <th>Admin</th>
                <th>Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-empty">
                    No vehicle logs yet.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id}>
                    <td className="admin-muted-sm"><code>#{log.id}</code></td>
                    <td className="admin-bold">{log.vehicle_name || '—'}</td>

                    <td>
                      <span className={`admin-badge-mini ${
                        log.change_type === 'create' ? 'b-approved' :
                        log.change_type === 'update' ? 'b-ongoing' :
                        log.change_type === 'delete' ? 'b-rejected' :
                        'b-pending'
                      }`}>
                        {log.change_type}
                      </span>
                    </td>

                    <td className="admin-muted">{log.field_name || '—'}</td>
                    <td className="admin-muted-sm" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.old_value || '—'}
                    </td>
                    <td className="admin-muted-sm" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.new_value || '—'}
                    </td>
                    <td>{log.admin_id || 'System'}</td>
                    <td className="admin-muted-sm">
                      {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
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