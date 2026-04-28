import React, { useState } from 'react';

// Clean, professional SVG icons
const Icons = {
  Refresh: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  ),
  MapPin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
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
  Note: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  )
};

// Helper to color-code statuses
function bookBadge(s) {
  const map = { 
    Pending: 'b-pending', 
    Approved: 'b-approved', 
    Rejected: 'b-rejected', 
    Ongoing: 'b-ongoing', 
    Returned: 'b-returned' 
  };
  return map[s] || '';
}

// Helper to format dates cleanly
function formatShortDate(dateString) {
  if (!dateString) return '—';
  const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

export default function BookingsPage({
  bookings = [],
  vehicles = [],
  drivers = [],
  onApprove,
  onReject,
  onRefresh,
  onViewDetails,
}) {
  const [assignments, setAssignments] = useState({});

  const setAssignment = (bookingId, field, value) => {
    setAssignments(prev => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        [field]: value
      }
    }));
  };

  const activeBookings = bookings.filter(b => 
    b.status === 'Pending' || b.status === 'Approved' || b.status === 'Ongoing'
  );

  return (
    <div className="admin-card">
      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>
          Booking Inbox
          <span className="admin-count">
            {activeBookings.filter(b => b.status === 'Pending').length} Pending
          </span>
        </h3>
        
        <button 
          onClick={onRefresh} 
          className="admin-btn admin-btn-outline" 
          style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Icons.Refresh /> Refresh
        </button>
      </div>

      <div className="admin-table-scroll">
        <table className="admin-table" style={{ fontSize: '13px' }}>
          <thead>
            <tr>
              <th>Requester</th>
              <th>Trip Details</th>
              <th>Schedule</th>
              <th>Assignment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {activeBookings.length === 0 && (
              <tr>
                <td colSpan={6} className="admin-empty" style={{ padding: '40px' }}>
                  No active requests. You're all caught up!
                </td>
              </tr>
            )}

            {activeBookings.map(b => {
              const availableVehicles = vehicles.filter(v => v.is_available || v.id === b.vehicle_id);
              const availableDrivers = drivers.filter(d => d.availability === 'Available' || d.id === b.driver_id);

              const selectedVehicle = assignments[b.id]?.vehicleId ?? b.vehicle_id ?? '';
              const selectedDriver = assignments[b.id]?.driverId ?? b.driver_id ?? '';

              return (
                <tr 
                  key={b.id} 
                  style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                  onClick={() => onViewDetails && onViewDetails(b)}
                >
                  
                  {/* 1. REQUESTER */}
                  <td style={{ verticalAlign: 'middle' }}>
                    <div className="admin-bold" style={{ color: '#4b5563' }}>#{b.id?.toString().slice(0, 6)}</div>
                    <div className="admin-muted-sm" style={{ color: '#2563eb' }}>{b.email || b.user?.email || 'Unknown User'}</div>
                  </td>

                  {/* 2. TRIP DETAILS */}
                  <td style={{ verticalAlign: 'middle' }}>
                    <div className="admin-bold" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }} title={b.destination}>
                      <Icons.MapPin /> {b.destination || '—'}
                    </div>
                    <div className="admin-muted-sm" style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '4px' }} title={b.purpose}>
                      {b.purpose || '—'}
                    </div>
                  </td>

                  {/* 3. SCHEDULE */}
                  <td style={{ verticalAlign: 'middle' }}>
                    <div className="admin-bold-sm" style={{ color: '#059669' }}>
                      {formatShortDate(b.start_datetime)}
                    </div>
                    <div className="admin-muted-sm">
                      to {formatShortDate(b.end_datetime)}
                    </div>
                  </td>

                  {/* 4. ASSIGNMENT */}
                  <td style={{ verticalAlign: 'middle' }}>
                    {b.status === 'Pending' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <select
                          value={selectedVehicle}
                          onClick={(e) => e.stopPropagation()} 
                          onChange={(e) => setAssignment(b.id, 'vehicleId', e.target.value)}
                          className="admin-btn admin-btn-outline"
                          style={{ padding: '4px 8px', fontSize: '11px', width: '160px' }}
                        >
                          <option value="">Select Vehicle</option>
                          {availableVehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.name} ({v.plate_number})</option>
                          ))}
                        </select>
                        <select
                          value={selectedDriver}
                          onClick={(e) => e.stopPropagation()} 
                          onChange={(e) => setAssignment(b.id, 'driverId', e.target.value)}
                          className="admin-btn admin-btn-outline"
                          style={{ padding: '4px 8px', fontSize: '11px', width: '160px' }}
                        >
                          <option value="">Select Driver</option>
                          {availableDrivers.map(d => (
                            <option key={d.id} value={d.id}>{d.name ? d.name : `Driver #${d.id?.toString().slice(0, 5)}`}</option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="admin-muted-sm" style={{ lineHeight: '1.4' }}>
                          <div className="admin-bold-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Icons.Car /> {b.vehicle?.name || 'N/A'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                            <Icons.User /> {b.driver?.name || 'N/A'}
                          </div>
                      </div>
                    )}
                  </td>

                  {/* 5. STATUS & NOTES */}
                  <td style={{ verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                      <span className={`admin-badge ${bookBadge(b.status)}`} style={{ fontSize: '11px' }}>
                        {b.status}
                      </span>
                      
                      {b.admin_notes && (
                        <div className="admin-muted-sm" style={{ maxWidth: '120px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }} title={b.admin_notes}>
                          <Icons.Note /> {b.admin_notes}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 6. ACTIONS - ✅ Fixed: Removed className="admin-actions" from the <td> */}
                  <td style={{ verticalAlign: 'middle' }}>
                    {b.status === 'Pending' ? (
                      <div className="admin-actions" style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          className="admin-btn admin-btn-success"
                          style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 'bold' }}
                          onClick={(e) => {
                            e.stopPropagation(); 
                            if (!selectedVehicle || !selectedDriver) {
                              alert('Please assign both a vehicle and a driver before approving.');
                              return;
                            }
                            onApprove(b.id, selectedVehicle, selectedDriver);
                          }}
                        >
                          Approve
                        </button>
                        <button 
                          className="admin-btn admin-btn-danger" 
                          style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 'bold' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onReject(b.id);
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="admin-muted-sm" style={{ fontStyle: 'italic', color: '#9ca3af' }}>
                        Managed in Fleets
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}