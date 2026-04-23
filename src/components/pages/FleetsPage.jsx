import React from 'react';

export default function FleetsPage({ bookings = [] }) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>Active Fleet Assignments</h3>
      </div>
      
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Assignment #</th>
              <th>Driver Name</th>
              <th>Vehicle Name</th>
              <th>Destination</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="admin-empty">No active assignments right now.</td>
              </tr>
            ) : (
              bookings.map((bk) => {
                return (
                  <tr key={bk.id}>
                    <td className="admin-muted-sm">
                      Booking #{bk.id}
                    </td>
                    <td className="admin-bold-sm">
                      {/* ✅ Directly reads the driver from the database relationship! */}
                      {bk.driver?.name || 'No Driver Assigned'}
                    </td>
                    <td>
                      🚗 {bk.vehicle?.name || 'Unknown'}
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