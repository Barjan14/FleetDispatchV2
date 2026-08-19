import React from 'react';
import { extractRequesterInfo } from '../pages/BookingsPage';

const Icons = {
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  ),
  User: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  ),
  Mail: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
      <polyline points="22,6 12,13 2,6"></polyline>
    </svg>
  ),
  Briefcase: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
    </svg>
  ),
  MapPin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3"></circle>
    </svg>
  ),
  Calendar: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
      <line x1="16" y1="2" x2="16" y2="6"></line>
      <line x1="8" y1="2" x2="8" y2="6"></line>
      <line x1="3" y1="10" x2="21" y2="10"></line>
    </svg>
  ),
  Car: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"></path>
      <circle cx="7" cy="17" r="2"></circle>
      <path d="M9 17h6"></path>
      <circle cx="17" cy="17" r="2"></circle>
    </svg>
  ),
  FileText: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  )
};

const getStatusStyle = (status) => {
  const s = status?.toLowerCase();
  if (s === 'approved' || s === 'ongoing' || s === 'returned' || s === 'completed') 
    return { backgroundColor: '#ecfdf5', color: '#065f46', border: '1px solid #a7f3d0' };
  if (s === 'pending') 
    return { backgroundColor: '#fffbeb', color: '#b45309', border: '1px solid #fde68a' };
  if (s === 'rejected') 
    return { backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' };
  return { backgroundColor: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1' };
};

function formatLongDate(dateString) {
  if (!dateString) return '—';
  const options = { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

const DetailBox = ({ label, value, icon, fullWidth }) => (
  <div style={{ 
    padding: '16px', 
    backgroundColor: '#f8fafc', 
    border: '1px solid #e2e8f0', 
    borderRadius: '12px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '8px',
    gridColumn: fullWidth ? '1 / -1' : 'auto'
  }}>
    <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
      {icon && icon} {label}
    </span>
    <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', lineHeight: '1.4' }}>
      {value}
    </span>
  </div>
);

// ✅ NEW: Added `vehicles = []` prop to allow plate cross-referencing!
export default function BookingDetailsModal({ booking, vehicles = [], onClose }) {
  if (!booking) return null;

  // Uses the full vehicles array to hunt down the plate number
  const reqInfo = extractRequesterInfo(booking, vehicles);

  return (
    <div className="admin-overlay" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(15, 23, 42, 0.65)' }}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', width: '100%', backgroundColor: '#fff', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
        
        <button 
          onClick={onClose} 
          style={{ 
            position: 'absolute', top: '24px', right: '24px', padding: '8px', border: '1px solid #e2e8f0', 
            borderRadius: '12px', backgroundColor: '#f8fafc', color: '#64748b', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
          }}
        >
          <Icons.Close />
        </button>

        <div style={{ padding: '32px 32px 24px 32px', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', paddingRight: '48px' }}>
            <div>
              <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', margin: '0 0 8px 0', letterSpacing: '-0.02em' }}>
                Booking Request
              </h3>
              <div style={{ fontSize: '15px', color: '#64748b', fontWeight: '600' }}>
                Request ID: <span style={{ color: '#0f172a' }}>#{booking.id?.toString().slice(0, 8)}</span>
              </div>
            </div>
            
            <div style={{ 
              ...getStatusStyle(booking.status),
              padding: '8px 16px', 
              borderRadius: '999px', 
              fontSize: '14px', 
              fontWeight: '800',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              {booking.status}
            </div>
          </div>
        </div>

        <div style={{ padding: '32px 32px 48px 32px', display: 'flex', flexDirection: 'column', gap: '32px', maxHeight: '75vh', overflowY: 'auto' }}>
          
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <DetailBox fullWidth icon={<Icons.MapPin />} label="Destination" value={booking.destination || 'Not Specified'} />
              <DetailBox fullWidth icon={<Icons.FileText />} label="Purpose of Trip" value={booking.purpose || 'Not Specified'} />
              <DetailBox icon={<Icons.Calendar />} label="Departure Schedule" value={formatLongDate(booking.start_datetime)} />
              <DetailBox icon={<Icons.Calendar />} label="Return Schedule" value={formatLongDate(booking.end_datetime)} />
            </div>
          </div>

          <div>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '900', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>
              Requester Information
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <DetailBox icon={<Icons.User />} label="Employee Name" value={reqInfo.name} />
              <DetailBox icon={<Icons.Mail />} label="Email Address" value={reqInfo.email} />
              <DetailBox fullWidth icon={<Icons.Briefcase />} label="Office" value={reqInfo.dept} />
            </div>
          </div>

          {(booking.vehicle || booking.driver || booking.vehicle_id) && (
            <div>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '900', color: '#0f172a', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' }}>
                Dispatch Assignment
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <DetailBox 
                  icon={<Icons.Car />} 
                  label="Assigned Vehicle" 
                  value={
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{booking.vehicle?.name || 'Assigned Vehicle'}</span>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>Plate: {reqInfo.plate}</span>
                    </div>
                  } 
                />
                <DetailBox icon={<Icons.User />} label="Assigned Driver" value={booking.driver?.name || '—'} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
