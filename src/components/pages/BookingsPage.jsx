import React, { useState, useEffect } from 'react';

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
  Briefcase: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
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

function bookBadge(s) {
  const map = { Pending: 'b-pending', Approved: 'b-approved', Rejected: 'b-rejected', Ongoing: 'b-ongoing', Returned: 'b-returned' };
  return map[s] || '';
}

function formatShortDate(dateString) {
  if (!dateString) return '—';
  const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// ✅ NEW: Now accepts the full `vehicles` array to cross-reference the ID!
export function extractRequesterInfo(booking, allVehicles = []) {
  let name = booking.employee_name || booking.name || booking.user?.name || '';
  let dept = booking.department || booking.position || booking.user?.profile?.department || booking.user?.department || '';
  let email = booking.email || booking.user?.email || 'Not Provided';
  let plate = booking.vehicle?.plate_number || '';
  let details = '';

  // Cross-reference the vehicle database if we only have an ID
  if (!plate && booking.vehicle_id && allVehicles.length > 0) {
    const foundCar = allVehicles.find(v => v.id === booking.vehicle_id);
    if (foundCar) plate = foundCar.plate_number;
  }

  // if (booking.admin_notes) {
  //   const empMatch = booking.admin_notes.match(/Employee:\s*(.*?)(?=\s*(?:Dep:|Dept:|Department:|Plate:|Plate No:|$))/i);
  //   const deptMatch = booking.admin_notes.match(/(?:Dep:|Dept:|Department:)\s*(.*?)(?=\s*(?:Plate:|Plate No:|$))/i);
  //   const plateMatch = booking.admin_notes.match(/(?:Plate:|Plate No:)\s*(.*?)(?=\s*(?:Dep:|Dept:|Employee:|$))/i);
    
  //   if (empMatch && empMatch[1]) name = empMatch[1].trim();
  //   if (deptMatch && deptMatch[1]) dept = deptMatch[1].trim();
  //   if (plateMatch && plateMatch[1] && !plate) plate = plateMatch[1].trim();
  // }

  if (booking.admin_notes) {
    // Parse key-value lines (handles both \n and inline text separated by labels)
    const notes = booking.admin_notes;

    const empMatch = notes.match(/Employee:\s*([^\n\r\t]+)/i);
    const deptMatch = notes.match(/(?:Dep|Dept|Department):\s*([^\n\r\t]+)/i);
    const plateMatch = notes.match(/(?:Plate|Plate No):\s*([^\n\r\t]+)/i);
    const detailsMatch = notes.match(/Details:\s*([\s\S]*?)(?=\s*(?:Employee:|Department:|Passengers:|Priority:|$))/i);

    if (empMatch && empMatch[1]) name = empMatch[1].trim();
    if (deptMatch && deptMatch[1]) dept = deptMatch[1].trim();
    if (plateMatch && plateMatch[1] && !plate) plate = plateMatch[1].trim();
    if (detailsMatch && detailsMatch[1]) details = detailsMatch[1].trim();
  }

  return { 
    name: name || 'Unknown User', 
    dept: dept || 'Not Provided', 
    email, 
    plate: plate || 'N/A',
    details: details || ''
  };
}

export default function BookingsPage({
  bookings = [],
  vehicles = [],
  drivers = [],
  onApprove,
  onReject,
  onRefresh,
  onViewDetails,
  initialFilter,
}) {
  const [assignments, setAssignments] = useState({});
  const [bookingTab, setBookingTab]   = useState(initialFilter === 'completed' ? 'completed' : 'active');

  useEffect(() => {
    if (initialFilter === 'completed') setBookingTab('completed');
    else if (initialFilter === 'active') setBookingTab('active');
  }, [initialFilter]);

  const setAssignment = (bookingId, field, value) => {
    setAssignments(prev => ({ ...prev, [bookingId]: { ...prev[bookingId], [field]: value } }));
  };

  const activeBookings    = bookings.filter(b => b.status === 'Pending' || b.status === 'Approved' || b.status === 'Ongoing');
  const completedBookings = bookings.filter(b => b.status === 'Returned' || b.status === 'Completed' || b.status === 'Rejected');

  const pendingCount = activeBookings.filter(b => b.status === 'Pending').length;

  return (
    <div className="admin-card">
      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h3 style={{ margin: 0 }}>
            {bookingTab === 'active' ? 'Booking Inbox' : 'Trip History'}
            {bookingTab === 'active' && pendingCount > 0 && (
              <span className="admin-count">{pendingCount} Pending</span>
            )}
            {bookingTab === 'completed' && (
              <span className="admin-count">{completedBookings.length}</span>
            )}
          </h3>

          {/* Tab switcher */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px', gap: '2px' }}>
            <button
              onClick={() => setBookingTab('active')}
              style={{
                padding: '5px 14px', fontSize: '12px', fontWeight: 700, borderRadius: '6px', border: 'none',
                cursor: 'pointer', transition: 'all 0.15s',
                background: bookingTab === 'active' ? '#ffffff' : 'transparent',
                color: bookingTab === 'active' ? '#006205' : '#64748b',
                boxShadow: bookingTab === 'active' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Active
            </button>
            <button
              onClick={() => setBookingTab('completed')}
              style={{
                padding: '5px 14px', fontSize: '12px', fontWeight: 700, borderRadius: '6px', border: 'none',
                cursor: 'pointer', transition: 'all 0.15s',
                background: bookingTab === 'completed' ? '#ffffff' : 'transparent',
                color: bookingTab === 'completed' ? '#475569' : '#64748b',
                boxShadow: bookingTab === 'completed' ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Completed
            </button>
          </div>
        </div>

        <button
          onClick={onRefresh}
          className="admin-btn admin-btn-outline"
          style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Icons.Refresh /> Sync
        </button>
      </div>

      {/* ── ACTIVE BOOKINGS TABLE ── */}
      {bookingTab === 'active' && (
      <div className="admin-table-scroll">
        <table className="admin-table" style={{ fontSize: '13px' }}>
          <thead>
            <tr>
              <th>Requester</th>
              <th>Trip Details</th>
              <th>Schedule</th>
              <th>Status</th>
              <th>Assignment & Action</th>
            </tr>
          </thead>

          <tbody>
            {activeBookings.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-empty" style={{ padding: '40px' }}>
                  No active requests. You're all caught up!
                </td>
              </tr>
            )}

            {activeBookings.map(b => {
              const availableVehicles = vehicles.filter(v => v.is_available || v.id === b.vehicle_id);
              const availableDrivers = drivers.filter(d => d.availability === 'Available' || d.id === b.driver_id);

              const selectedVehicle = assignments[b.id]?.vehicleId ?? b.vehicle_id ?? '';
              const selectedDriver = assignments[b.id]?.driverId ?? b.driver_id ?? '';

              const reqInfo = extractRequesterInfo(b, vehicles);
              const canApprove = selectedVehicle && selectedDriver;

              return (
                <tr
                  key={b.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onViewDetails && onViewDetails(b)}
                >
                  <td style={{ verticalAlign: 'middle' }}>
                    <div className="admin-bold" style={{ color: '#0f172a', fontSize: '13.5px' }}>
                      {reqInfo.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
                      <Icons.Briefcase /> {reqInfo.dept}
                    </div>
                    {reqInfo.email !== 'Not Provided' && (
                      <div style={{ fontSize: '11px', color: '#2563eb', marginTop: '2px' }}>
                        {reqInfo.email}
                      </div>
                    )}
                  </td>

                  <td style={{ verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, fontSize: '13px', color: '#0f172a', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={b.destination}>
                      <Icons.MapPin /> {b.destination || '—'}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '3px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={b.purpose}>
                      {b.purpose || '—'}
                    </div>
                  </td>

                  <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>
                      {formatShortDate(b.start_datetime)}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>
                      → {formatShortDate(b.end_datetime)}
                    </div>
                  </td>

                  <td style={{ verticalAlign: 'middle' }}>
                    <span className={`admin-badge ${bookBadge(b.status)}`} style={{ fontSize: '11px' }}>{b.status}</span>
                  </td>

                  {/* Merged assignment + action cell */}
                  <td style={{ verticalAlign: 'middle' }} onClick={(e) => e.stopPropagation()}>
                    {b.status === 'Pending' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', minWidth: '180px' }}>
                        {/* Dropdowns */}
                        <select
                          value={selectedVehicle}
                          onChange={(e) => setAssignment(b.id, 'vehicleId', e.target.value)}
                          style={{
                            padding: '6px 10px', fontSize: '12px',
                            border: '1px solid #e2e8f0', borderRadius: '6px',
                            background: '#f8fafc', color: selectedVehicle ? '#0f172a' : '#94a3b8',
                            outline: 'none', fontFamily: 'inherit', width: '100%',
                          }}
                        >
                          <option value="">Vehicle</option>
                          {availableVehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.name} — {v.plate_number}</option>
                          ))}
                        </select>
                        <select
                          value={selectedDriver}
                          onChange={(e) => setAssignment(b.id, 'driverId', e.target.value)}
                          style={{
                            padding: '6px 10px', fontSize: '12px',
                            border: '1px solid #e2e8f0', borderRadius: '6px',
                            background: '#f8fafc', color: selectedDriver ? '#0f172a' : '#94a3b8',
                            outline: 'none', fontFamily: 'inherit', width: '100%',
                          }}
                        >
                          <option value="">Driver</option>
                          {availableDrivers.map(d => (
                            <option key={d.id} value={d.id}>{d.name || `Driver #${d.id?.toString().slice(0,5)}`}</option>
                          ))}
                        </select>

                        {/* Action buttons */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => {
                              if (!canApprove) {
                                alert('Please assign both a vehicle and a driver before approving.');
                                return;
                              }
                              onApprove(b.id, selectedVehicle, selectedDriver);
                            }}
                            style={{
                              flex: 1, padding: '7px 0', fontSize: '12px', fontWeight: 700,
                              background: canApprove ? '#16a34a' : '#e2e8f0',
                              color: canApprove ? '#fff' : '#94a3b8',
                              border: 'none', borderRadius: '6px', cursor: canApprove ? 'pointer' : 'not-allowed',
                              transition: 'background 0.15s, transform 0.1s',
                              letterSpacing: '0.2px',
                            }}
                            onMouseEnter={e => { if (canApprove) e.currentTarget.style.background = '#15803d'; }}
                            onMouseLeave={e => { if (canApprove) e.currentTarget.style.background = '#16a34a'; }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => onReject(b.id)}
                            style={{
                              flex: 1, padding: '7px 0', fontSize: '12px', fontWeight: 600,
                              background: 'transparent',
                              color: '#ef4444',
                              border: '1px solid #fca5a5', borderRadius: '6px', cursor: 'pointer',
                              transition: 'background 0.15s, border-color 0.15s',
                              letterSpacing: '0.2px',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#f87171'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#fca5a5'; }}
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ lineHeight: '1.6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, fontSize: '12px', color: '#1e293b' }}>
                          <Icons.Car /> {b.vehicle?.name || 'Assigned'}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', paddingLeft: '19px' }}>
                          {reqInfo.plate}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                          <Icons.User /> {b.driver?.name || 'N/A'}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}

      {/* ── COMPLETED BOOKINGS TABLE ── */}
      {bookingTab === 'completed' && (
      <div className="admin-table-scroll">
        <table className="admin-table" style={{ fontSize: '13px' }}>
          <thead>
            <tr>
              <th>Requester</th>
              <th>Trip Details</th>
              <th>Schedule</th>
              <th>Vehicle & Driver</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {completedBookings.length === 0 && (
              <tr>
                <td colSpan={5} className="admin-empty" style={{ padding: '40px' }}>
                  No completed trips yet.
                </td>
              </tr>
            )}
            {completedBookings.map(b => {
              const reqInfo = extractRequesterInfo(b, vehicles);
              return (
                <tr
                  key={b.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onViewDetails && onViewDetails(b)}
                >
                  <td style={{ verticalAlign: 'middle' }}>
                    <div className="admin-bold" style={{ color: '#0f172a', fontSize: '13.5px' }}>{reqInfo.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', fontSize: '11.5px', color: '#64748b', fontWeight: 600 }}>
                      <Icons.Briefcase /> {reqInfo.dept}
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, fontSize: '13px', color: '#0f172a', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={b.destination}>
                      <Icons.MapPin /> {b.destination || '—'}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '3px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {b.purpose || '—'}
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>{formatShortDate(b.start_datetime)}</div>
                    <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px' }}>→ {formatShortDate(b.end_datetime)}</div>
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, fontSize: '12px', color: '#1e293b' }}>
                      <Icons.Car /> {b.vehicle?.name || '—'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#64748b', marginTop: '3px' }}>
                      <Icons.User /> {b.driver?.name || '—'}
                    </div>
                  </td>
                  <td style={{ verticalAlign: 'middle' }}>
                    <span className={`admin-badge ${bookBadge(b.status)}`} style={{ fontSize: '11px' }}>{b.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      )}
    </div>
  );
}
