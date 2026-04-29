import React from 'react';

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
  )
};

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
              <th>Assignment</th>
              <th>Assigned Vehicle</th>
              <th>Dispatch Details</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={4} className="admin-empty" style={{ padding: '40px' }}>
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

                return (
                  <tr key={bk.id} style={{ transition: 'background-color 0.2s' }}>
                    
                    {/* 1. ASSIGNMENT ID */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <div className="admin-bold" style={{ color: '#4b5563' }}>#{bk.id}</div>
                    </td>
                    
                    {/* 2. VEHICLE DETAILS (Vehicle + Fleet) */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <div className="admin-bold" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icons.Car /> {vehicle?.name || 'Unknown Vehicle'}
                      </div>
                      <div className="admin-muted-sm" style={{ paddingLeft: '20px' }}>
                        {fleet?.name || 'Unassigned Fleet'}
                      </div>
                    </td>

                    {/* 3. DISPATCH DETAILS (Driver + Destination) */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <div className="admin-bold-sm" style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icons.User /> {assignedDriver?.name || 'No Driver Assigned'}
                      </div>
                      <div className="admin-muted-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <Icons.MapPin /> {bk.destination || '—'}
                      </div>
                    </td>
                    
                    {/* 4. ACTIONS (✅ Fixed: Removed className="admin-actions" and added flex div) */}
                    <td style={{ verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {bk.status === 'Approved' && (
                          <button 
                            className="admin-btn admin-btn-primary"
                            style={{ width: '100px', fontWeight: 'bold' }}
                            onClick={() => onMarkOngoing(bk.id)}
                          >
                            Ongoing
                          </button>
                        )}

                        {bk.status === 'Ongoing' && (
                          <button 
                            className="admin-btn admin-btn-success"
                            style={{ 
                              width: '100px', 
                              fontWeight: 'bold', 
                              backgroundColor: '#16a34a',
                              color: 'white',
                              borderColor: '#16a34a'
                            }}
                            onClick={() => onMarkReturned(bk.id)}
                          >
                            Complete
                          </button>
                        )}
                      </div>
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