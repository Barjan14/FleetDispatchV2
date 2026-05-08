import React from 'react';

// Helper to color-code conditions
function condBadge(c) {
  const map = { Good: 'b-good', Fair: 'b-fair', 'Under Repair': 'b-repair', 'Out of Service': 'b-out' };
  return map[c] || 'b-out';
}

export default function VehicleDetailsModal({ vehicle, onEdit, onDelete, onClose }) {
  if (!vehicle) return null;

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: '850px' }} onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="admin-modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '18px', margin: 0, color: '#0f172a', fontWeight: '800' }}>Vehicle Profile</h3>
          <button className="admin-btn admin-btn-outline" onClick={onClose} style={{ padding: '6px', border: 'none', color: '#64748b' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* BODY: Split Layout using Flexbox */}
        <div className="admin-modal-body" style={{ padding: '32px 24px', display: 'flex', flexWrap: 'wrap', gap: '32px', textAlign: 'left' }}>
          
          {/* LEFT COLUMN: Vehicle Image */}
          <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ 
              width: '100%', 
              aspectRatio: '1 / 1', 
              backgroundColor: '#f8fafc', 
              border: '2px dashed #cbd5e1', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              overflow: 'hidden'
            }}>
              {vehicle.image_url ? (
                <img 
                  src={vehicle.image_url} 
                  alt={vehicle.name} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  <div style={{ fontSize: '13px', fontWeight: '600' }}>No Image Provided</div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Vehicle Information */}
          <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column' }}>
            
            {/* Title & Availability Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px' }}>
              <div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginBottom: '6px', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
                  {vehicle.name}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b', fontWeight: '500' }}>
                  System ID: #{vehicle.id} <span style={{ margin: '0 8px' }}>•</span> Plate: <span style={{ color: '#0f172a', fontWeight: '700' }}>{vehicle.plate_number}</span>
                </div>
              </div>
              <span className={`admin-badge ${vehicle.is_available ? 'b-approved' : 'b-ongoing'}`} style={{ padding: '6px 12px', fontSize: '13px' }}>
                {vehicle.is_available ? 'Currently Available' : 'On Duty / In Use'}
              </span>
            </div>

            {/* Specifications Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 16px', marginBottom: '32px' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '700' }}>Condition</span>
                <span className={`admin-badge ${condBadge(vehicle.condition)}`} style={{ alignSelf: 'flex-start', fontSize: '13px', padding: '4px 10px' }}>
                  {vehicle.condition}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '700' }}>Model</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{vehicle.model || '—'}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '700' }}>Year</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{vehicle.year || '—'}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', fontWeight: '700' }}>Fuel Type</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{vehicle.fuel_type || '—'}</span>
              </div>

            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <button 
                className="admin-btn admin-btn-primary" 
                style={{ flex: 1, padding: '12px', fontSize: '14px' }} 
                type="button" 
                onClick={onEdit}
              >
                Edit Vehicle Settings
              </button>
              <button 
                className="admin-btn admin-btn-danger" 
                style={{ padding: '12px 24px', fontSize: '14px' }} 
                type="button" 
                onClick={() => onDelete(vehicle.id)}
              >
                Delete
              </button>
            </div>

          </div> 
        </div>

      </div>
    </div>
  );
}