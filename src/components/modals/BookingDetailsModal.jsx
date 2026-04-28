import React from 'react';

// Reusing the same sleek icons for consistency
const Icons = {
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  User: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  MapPin: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  ),
  Calendar: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  Car: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
      <circle cx="7" cy="17" r="2"></circle>
      <path d="M9 17h6"></path>
      <circle cx="17" cy="17" r="2"></circle>
    </svg>
  ),
};

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

function formatLongDate(dateString) {
  if (!dateString) return '—';
  const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

// ✅ THIS IS THE LINE VITE WAS LOOKING FOR!
export default function BookingDetailsModal({ booking, onClose }) {
  if (!booking) return null;

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        
        {/* HEADER */}
        <div className="admin-modal-header" style={{ padding: '20px 24px' }}>
          <div>
            <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Booking Request <span style={{ color: '#64748b', fontWeight: '500' }}>#{booking.id?.toString().slice(0, 8)}</span>
            </h3>
          </div>
          <button className="admin-btn admin-btn-outline" onClick={onClose} style={{ padding: '6px', border: 'none' }}>
            <Icons.Close />
          </button>
        </div>

        {/* BODY */}
        <div className="admin-modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Status Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '14px', fontWeight: '700', color: '#334155' }}>Current Status</span>
            <span className={`admin-badge ${bookBadge(booking.status)}`} style={{ fontSize: '13px', padding: '6px 14px' }}>
              {booking.status}
            </span>
          </div>

          {/* Section 1: Requester Details */}
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Requester Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div className="admin-detail-item">
                <span className="admin-muted-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.User /> Email Address</span>
                <span className="admin-bold">{booking.email || booking.user?.email || 'Unknown User'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Trip Details */}
          <div>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Trip Details
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              
              <div className="admin-detail-item">
                <span className="admin-muted-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.MapPin /> Destination</span>
                <span className="admin-bold" style={{ fontSize: '15px' }}>{booking.destination || '—'}</span>
              </div>

              <div className="admin-detail-item">
                <span className="admin-muted-sm">Purpose of Trip</span>
                <span style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5' }}>{booking.purpose || '—'}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                <div className="admin-detail-item">
                  <span className="admin-muted-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.Calendar /> Departure Date</span>
                  <span className="admin-bold" style={{ color: '#059669' }}>{formatLongDate(booking.start_datetime)}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-muted-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.Calendar /> Return Date</span>
                  <span className="admin-bold" style={{ color: '#0f172a' }}>{formatLongDate(booking.end_datetime)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Assignment Info (Only shows if assigned) */}
          {(booking.vehicle || booking.driver) && (
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Dispatch Assignment
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div className="admin-detail-item">
                  <span className="admin-muted-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.Car /> Assigned Vehicle</span>
                  <span className="admin-bold">{booking.vehicle?.name || '—'}</span>
                  <span className="admin-muted-sm" style={{ fontSize: '11px' }}>{booking.vehicle?.plate_number}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-muted-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.User /> Assigned Driver</span>
                  <span className="admin-bold" style={{ color: '#2563eb' }}>{booking.driver?.name || '—'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Section 4: Admin Notes */}
          {booking.admin_notes && (
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Admin Notes
              </h4>
              <div style={{ background: '#fef3c7', padding: '16px', borderRadius: '12px', border: '1px solid #fde68a', color: '#92400e', fontSize: '14px', lineHeight: '1.5' }}>
                {booking.admin_notes}
              </div>
            </div>
          )}

        </div>

        {/* FOOTER */}
        <div className="admin-modal-footer" style={{ padding: '16px 24px', background: '#f8fafc' }}>
          <button className="admin-btn admin-btn-outline" onClick={onClose} style={{ width: '100px' }}>
            Close
          </button>
        </div>

      </div>
    </div>
  );
}