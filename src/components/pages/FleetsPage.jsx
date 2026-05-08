import React from 'react';

const Icons = {
  Refresh: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
    </svg>
  ),
  Car: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />
    </svg>
  ),
  User: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  ),
  MapPin: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  ),
  Clock: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Dispatch: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" /><polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Return: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Layers: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" />
    </svg>
  ),
};

function formatShortDate(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function FleetsPage({
  bookings = [],
  fleets = [],
  vehicles = [],
  drivers = [],
  onMarkOngoing,
  onMarkReturned,
  onRefresh
}) {
  return (
    <div className="admin-card">
      {/* HEADER */}
      <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>
          Active Fleet Assignments
          <span className="admin-count">{bookings.length}</span>
        </h3>
        <button
          onClick={onRefresh}
          className="admin-btn admin-btn-outline"
          style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Icons.Refresh /> Refresh Data
        </button>
      </div>

      <div className="admin-table-scroll">
        <table className="admin-table" style={{ fontSize: '13px' }}>
          <thead>
            <tr>
              <th>Booking</th>
              <th>Vehicle</th>
              <th>Driver & Route</th>
              <th>Schedule</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-empty" style={{ padding: '40px' }}>
                  No active assignments right now.
                </td>
              </tr>
            ) : (
              bookings.map((bk) => {
                const vehicle = vehicles.find(v => v.id === bk.vehicle_id) || bk.vehicle;
                const fleet = fleets.find(f => f.id === vehicle?.fleet_id);
                const assignedDriver = drivers.find(d =>
                  String(d.assigned_vehicle_id) === String(vehicle?.id) ||
                  (fleet && String(d.assigned_fleet_id) === String(fleet.id))
                );
                const isApproved = bk.status === 'Approved';
                const isOngoing  = bk.status === 'Ongoing';

                return (
                  <tr key={bk.id}>
                    {/* 1. BOOKING */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>#{bk.id}</div>
                      <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {bk.purpose || 'No purpose'}
                      </div>
                    </td>

                    {/* 2. VEHICLE */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', color: '#0f172a' }}>
                        <Icons.Car /> {vehicle?.name || 'Unknown Vehicle'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#94a3b8', marginTop: '3px', paddingLeft: '20px' }}>
                        {vehicle?.plate_number && <span style={{ fontWeight: 600, color: '#64748b' }}>{vehicle.plate_number}</span>}
                        {fleet && (
                          <>
                            <span>·</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Icons.Layers /> {fleet.name}
                            </span>
                          </>
                        )}
                        {!fleet && <span>Unassigned Fleet</span>}
                      </div>
                    </td>

                    {/* 3. DRIVER & ROUTE */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, fontSize: '13px', color: '#2563eb' }}>
                        <Icons.User /> {assignedDriver?.name || bk.driver?.name || 'No Driver Assigned'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                        <Icons.MapPin />
                        <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {bk.destination || '—'}
                        </span>
                      </div>
                    </td>

                    {/* 4. SCHEDULE */}
                    <td style={{ verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 600, color: '#059669' }}>
                        <Icons.Clock /> {formatShortDate(bk.start_datetime)}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#94a3b8', marginTop: '2px', paddingLeft: '18px' }}>
                        until {formatShortDate(bk.end_datetime)}
                      </div>
                    </td>

                    {/* 5. STATUS — read-only badge */}
                    <td style={{ verticalAlign: 'middle' }}>
                      {isApproved && (
                        <span className="admin-badge b-pending" style={{ fontSize: '11.5px' }}>
                          Awaiting Dispatch
                        </span>
                      )}
                      {isOngoing && (
                        <span className="admin-badge b-ongoing" style={{ fontSize: '11.5px' }}>
                          Out / On Trip
                        </span>
                      )}
                    </td>

                    {/* 6. ACTION — explicit CTA button */}
                    <td style={{ verticalAlign: 'middle' }}>
                      {isApproved && (
                        <button
                          onClick={() => onMarkOngoing(bk.id)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            padding: '8px 14px', fontSize: '12.5px', fontWeight: 700,
                            background: 'linear-gradient(135deg, #006205, #004a1f)',
                            color: '#fff', border: 'none', borderRadius: '8px',
                            cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.2px',
                            transition: 'opacity 0.15s, transform 0.1s',
                            boxShadow: '0 2px 6px rgba(0,98,5,0.25)',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          <Icons.Dispatch /> Mark Departed
                        </button>
                      )}
                      {isOngoing && (
                        <button
                          onClick={() => onMarkReturned(bk.id)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '7px',
                            padding: '8px 14px', fontSize: '12.5px', fontWeight: 700,
                            background: '#1d4ed8',
                            color: '#fff', border: 'none', borderRadius: '8px',
                            cursor: 'pointer', whiteSpace: 'nowrap', letterSpacing: '0.2px',
                            transition: 'opacity 0.15s, transform 0.1s',
                            boxShadow: '0 2px 6px rgba(29,78,216,0.28)',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                          onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                          <Icons.Return /> Mark Returned
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
