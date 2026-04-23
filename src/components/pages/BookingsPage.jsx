import React, { useState } from 'react';

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

export default function BookingsPage({
  bookings = [],
  vehicles = [],
  drivers = [],
  onApprove,
  onReject,
  onMarkOngoing,
  onMarkReturned,
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

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>
          Vehicle Bookings 
          <span className="admin-count">
            {(bookings || []).filter(b => b.status === 'Pending').length}
          </span>
        </h3>
      </div>

      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Booking ID</th>
              <th>Email</th>
              <th>Vehicle</th>
              <th>Purpose</th>
              <th>Destination</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Status</th>
              <th>Admin Notes</th>
              <th>Assign</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {bookings.length === 0 && (
              <tr>
                <td colSpan={11} className="admin-empty">No bookings yet.</td>
              </tr>
            )}

            {bookings.map(b => {
              // ✅ FIX 1: Ensure requested vehicle remains in list even if not "Available"
              const availableVehicles = vehicles.filter(v => 
                v.is_available || v.id === b.vehicle_id
              );

              // ✅ FIX 2: Ensure current driver remains in list even if not "Available"
              const availableDrivers = drivers.filter(d => 
                d.availability === 'Available' || d.id === b.driver_id
              );

              // ✅ FIX 3: Removed Number() conversion to support UUIDs
              const selectedVehicle = assignments[b.id]?.vehicleId ?? b.vehicle_id ?? '';
              const selectedDriver = assignments[b.id]?.driverId ?? b.driver_id ?? '';

              return (
                <tr key={b.id}>
                  <td className="admin-muted">#{b.id?.toString().slice(0, 8)}</td>

                  <td>
                    <div className="admin-muted-sm">
                      {b.email || b.user?.email || 'Unknown'}
                    </div>
                  </td>

                  <td>
                    <div className="admin-bold">{b.vehicle?.name || '—'}</div>
                    <div className="admin-muted-sm">{b.vehicle?.plate_number}</div>
                  </td>

                  <td className="admin-muted-sm">{b.purpose || '—'}</td>
                  <td className="admin-muted-sm">{b.destination || '—'}</td>

                  <td className="admin-muted-sm">
                    {new Date(b.start_datetime).toLocaleString()}
                  </td>

                  <td className="admin-muted-sm">
                    {new Date(b.end_datetime).toLocaleString()}
                  </td>

                  <td>
                    <span className={`admin-badge ${bookBadge(b.status)}`}>
                      {b.status}
                    </span>
                  </td>

                  <td
                    className="admin-muted-sm"
                    style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    title={b.admin_notes || 'No notes'}
                  >
                    {b.admin_notes || '—'}
                  </td>

                  {/* ASSIGNMENT SECTION */}
                  <td>
                    {b.status === 'Pending' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        
                        {/* VEHICLE SELECT */}
                        <select
                          value={selectedVehicle}
                          onChange={(e) => setAssignment(b.id, 'vehicleId', e.target.value)}
                          className="admin-btn admin-btn-outline"
                        >
                          <option value="">Select Vehicle</option>
                          {availableVehicles.map(v => (
                            <option key={v.id} value={v.id}>
                              {v.name} ({v.plate_number})
                            </option>
                          ))}
                        </select>

                        {/* DRIVER SELECT - Now uses the 'name' column */}
                        <select
                          value={selectedDriver}
                          onChange={(e) => setAssignment(b.id, 'driverId', e.target.value)}
                          className="admin-btn admin-btn-outline"
                        >
                          <option value="">Select Driver</option>
                          {availableDrivers.map(d => (
                            <option key={d.id} value={d.id}>
                              {d.name ? d.name : `Driver #${d.id?.toString().slice(0, 5)}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    {b.status !== 'Pending' && (
                       <div className="admin-muted-sm">
                          <div>V: {b.vehicle?.name || 'N/A'}</div>
                          <div>D: {b.driver?.name || 'N/A'}</div>
                       </div>
                    )}
                  </td>

                  {/* ACTIONS SECTION */}
                  <td className="admin-actions">
                    {b.status === 'Pending' && (
                      <>
                        <button
                          className="admin-btn admin-btn-success"
                          onClick={() => {
                            if (!selectedVehicle || !selectedDriver) {
                              alert('Please assign both vehicle and driver first.');
                              return;
                            }
                            onApprove(b.id, selectedVehicle, selectedDriver);
                          }}
                        >
                          Approve
                        </button>

                        <button
                          className="admin-btn admin-btn-danger"
                          onClick={() => onReject(b.id)}
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {b.status === 'Approved' && (
                      <button
                        className="admin-btn admin-btn-warning"
                        onClick={() => onMarkOngoing(b.id)}
                      >
                        Ongoing
                      </button>
                    )}

                    {b.status === 'Ongoing' && (
                      <button
                        className="admin-btn admin-btn-outline"
                        onClick={() => onMarkReturned(b.id)}
                      >
                        Returned
                      </button>
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