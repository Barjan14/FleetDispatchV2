import React from 'react';

function condBadge(c) {
  const map = { Good: 'b-good', Fair: 'b-fair', 'Under Repair': 'b-repair', 'Out of Service': 'b-out' };
  return map[c] || 'b-out';
}

function headerClass(v) {
  if (v.condition === 'Out of Service') return 'vcard-out';
  if (v.condition === 'Under Repair') return 'vcard-repair';
  if (!v.is_available) return 'vcard-duty';
  return 'vcard-available';
}

function CarIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>
  );
}

function DetailRow({ label, value, children }) {
  return (
    <div className="vdetail-row">
      <span className="vdetail-label">{label}</span>
      <span className="vdetail-value">{children ?? value ?? '—'}</span>
    </div>
  );
}

export default function VehicleDetailsModal({ vehicle, onEdit, onDelete, onClose }) {
  if (!vehicle) return null;

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div className="admin-modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '17px', margin: 0, color: '#0f172a', fontWeight: '800' }}>Vehicle Profile</h3>
          <button className="admin-btn admin-btn-outline" onClick={onClose} style={{ padding: '6px', border: 'none', color: '#64748b' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* COLORED IDENTITY BANNER */}
        <div className={`vdetail-banner ${headerClass(vehicle)}`}>
          <div className="vdetail-banner-icon">
            <CarIcon />
          </div>
          <div className="vdetail-banner-text">
            <span className="vdetail-banner-name">{vehicle.name}</span>
            <span className="vdetail-banner-sub">{vehicle.model} · {vehicle.year}</span>
          </div>
          <div className="vdetail-banner-right">
            <span className="vdetail-avail-badge">
              {vehicle.condition === 'Out of Service' ? 'Out of Service'
                : vehicle.condition === 'Under Repair' ? 'Under Repair'
                : vehicle.is_available ? 'Available' : 'On Duty'}
            </span>
            <span className="vdetail-id">ID #{vehicle.id}</span>
          </div>
        </div>

        {/* LICENSE PLATE */}
        <div className="vdetail-plate-row">
          <span className="vdetail-plate-label">Plate Number</span>
          <span className="admin-plate admin-plate-lg">{vehicle.plate_number}</span>
        </div>

        {/* SPECS GRID */}
        <div className="admin-modal-body" style={{ padding: '0 24px 24px' }}>
          <div className="vdetail-specs">
            <DetailRow label="Condition">
              <span className={`admin-badge ${condBadge(vehicle.condition)}`}>{vehicle.condition}</span>
            </DetailRow>
            <DetailRow label="Model" value={vehicle.model} />
            <DetailRow label="Year" value={vehicle.year} />
            <DetailRow label="Fuel Type" value={vehicle.fuel_type} />
          </div>

          {/* ACTIONS */}
          <div style={{ display: 'flex', gap: '12px', paddingTop: '20px', borderTop: '1px solid #e2e8f0', marginTop: '20px' }}>
            <button
              className="admin-btn admin-btn-primary"
              style={{ flex: 1, padding: '11px', fontSize: '14px' }}
              type="button"
              onClick={onEdit}
            >
              Edit Vehicle
            </button>
            <button
              className="admin-btn admin-btn-danger"
              style={{ padding: '11px 24px', fontSize: '14px' }}
              type="button"
              onClick={() => onDelete(vehicle.id)}
            >
              Delete
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
