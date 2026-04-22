import React from 'react';

function bookBadge(s) {
  const map = { Pending:'b-pending', Approved:'b-approved', Rejected:'b-rejected', Ongoing:'b-ongoing', Returned:'b-returned' };
  return map[s] || '';
}

export default function BookingsPage({
  bookings,
  onApprove,
  onReject,
  onMarkOngoing,
  onMarkReturned,
}) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>Vehicle Bookings <span className="admin-count">{bookings.filter(b=>b.status==='Pending').length} pending</span></h3>
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length===0 && <tr><td colSpan={10} className="admin-empty">No bookings yet.</td></tr>}
            {bookings.map(b=>(
              <tr key={b.id}>
                <td className="admin-muted">#{b.id}</td>
                <td>
                  <div className="admin-muted-sm">{b.email || b.user?.email || 'Unknown'}</div>
                </td>
                <td>
                  <div className="admin-bold">{b.vehicle?.name}</div>
                  <div className="admin-muted-sm">{b.vehicle?.plate_number}</div>
                </td>
                <td className="admin-muted-sm">{b.purpose || '—'}</td>
                <td className="admin-muted-sm">{b.destination || '—'}</td>
                <td className="admin-muted-sm">{new Date(b.start_datetime).toLocaleString()}</td>
                <td className="admin-muted-sm">{new Date(b.end_datetime).toLocaleString()}</td>
                <td><span className={`admin-badge ${bookBadge(b.status)}`}>{b.status}</span></td>
                <td className="admin-muted-sm" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={b.admin_notes || 'No notes'}>
                  {b.admin_notes || '—'}
                </td>
                <td className="admin-actions">
                  {b.status==='Pending'  && <>
                    <button className="admin-btn admin-btn-success" onClick={()=>onApprove(b.id)}>Approve</button>
                    <button className="admin-btn admin-btn-danger" onClick={()=>onReject(b.id)}>Reject</button>
                  </>}
                  {b.status==='Approved' && <button className="admin-btn admin-btn-warning" onClick={()=>onMarkOngoing(b.id)}>Ongoing</button>}
                  {b.status==='Ongoing'  && <button className="admin-btn admin-btn-outline" onClick={()=>onMarkReturned(b.id)}>Returned</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
