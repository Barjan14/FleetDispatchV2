import React from 'react';

export default function FleetsPage({ fleets = [], bookings = [] }) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>Fleets Overview</h3>
      </div>
      
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fleet ID</th>
              <th>Fleet Name</th>
              <th>Total Vehicles</th>
              <th>Active Assignments (Approved/Ongoing)</th>
            </tr>
          </thead>
          <tbody>
            {fleets.length === 0 && (
              <tr>
                <td colSpan={4} className="admin-empty">No fleets found.</td>
              </tr>
            )}

            {fleets.map((f) => {
              // 1. Get IDs of all vehicles belonging to THIS fleet
              const fleetVehicleIds = (f.vehicles || []).map(v => v.id);

              // 2. Filter bookings that are Approved/Ongoing AND use a vehicle from this fleet
              const activeFleetBookings = bookings.filter(b => 
                (b.status === 'Approved' || b.status === 'Ongoing') && 
                fleetVehicleIds.includes(b.vehicle_id)
              );

              return (
                <tr key={f.id}>
                  <td className="admin-muted">#{f.id}</td>
                  <td className="admin-bold">{f.name}</td>
                  
                  <td>
                    <span className="admin-badge b-ongoing">
                      {f.vehicles?.length || 0} Vehicles
                    </span>
                  </td>

                  <td>
                    {activeFleetBookings.length === 0 ? (
                      <span className="admin-muted-sm">No active assignments</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {activeFleetBookings.map(bk => (
                          <div key={bk.id} className="admin-assignment-box">
                            <div className="admin-bold-sm">
                              🚗 {bk.vehicle?.name || 'Unknown'} 
                              <span className={`admin-badge-mini ${bk.status === 'Ongoing' ? 'b-ongoing' : 'b-approved'}`}>
                                {bk.status}
                              </span>
                            </div>
                            <div className="admin-muted-sm">
                              👤 Driver: <strong>{bk.driver?.name || 'No Driver Assigned'}</strong>
                            </div>
                            <div className="admin-muted-sm" style={{ fontStyle: 'italic' }}>
                              📍 To: {bk.destination}
                            </div>
                          </div>
                        ))}
                      </div>
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