import React from 'react';

export default function FleetsPage({ bookings = [], fleets = [], vehicles = [], drivers = [] }) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>Active Fleet Assignments</h3>
        <span className="admin-count">{bookings.length}</span>
      </div>
      
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Assignment #</th>
              <th>Vehicle Name</th>
              <th>Fleet Group</th>
              <th>Assigned Driver</th>
              <th>Destination</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-empty">No active assignments right now.</td>
              </tr>
            ) : (
              bookings.map((bk) => {
                
                // 1. Get the vehicle details from the booking
                const vehicle = vehicles.find(v => v.id === bk.vehicle_id) || bk.vehicle;
                
                // 2. Get the fleet details using the vehicle's fleet_id
                const fleet = fleets.find(f => f.id === vehicle?.fleet_id);

                // ✅ MAGIC FIX: Ignore the booking's driver! 
                // Instead, look at the Driver Profiles table to see who is ASSIGNED to this specific vehicle or fleet.
                const assignedDriver = drivers.find(d => 
                  String(d.assigned_vehicle_id) === String(vehicle?.id) || 
                  (fleet && String(d.assigned_fleet_id) === String(fleet.id))
                );

                return (
                  <tr key={bk.id}>
                    <td className="admin-muted-sm">
                      Booking #{bk.id}
                    </td>
                    
                    <td className="admin-bold">
                      🚗 {vehicle?.name || 'Unknown Vehicle'}
                    </td>

                    <td className="admin-muted-sm">
                      {fleet?.name || 'Unassigned Fleet'}
                    </td>

                    {/* Displays the driver found via Fleet/Vehicle Assignment */}
                    <td className="admin-bold-sm" style={{ color: '#2563eb' }}>
                      {assignedDriver?.name || 'No Driver Assigned'}
                    </td>
                    
                    <td className="admin-muted-sm" style={{ fontStyle: 'italic' }}>
                      📍 {bk.destination || '—'}
                    </td>
                    
                    <td>
                      <span className={`admin-badge-mini ${bk.status === 'Ongoing' ? 'b-ongoing' : 'b-approved'}`}>
                        {bk.status}
                      </span>
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