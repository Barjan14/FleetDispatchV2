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

function statusLabel(v) {
  if (v.condition === 'Out of Service') return 'Out of Service';
  if (v.condition === 'Under Repair') return 'Under Repair';
  return v.is_available ? 'Available' : 'On Duty';
}

const FUEL_STYLE = {
  Gasoline: { bg: '#fef9c3', color: '#854d0e' },
  Diesel:   { bg: '#f1f5f9', color: '#475569' },
  Electric: { bg: '#dbeafe', color: '#1d4ed8' },
  Hybrid:   { bg: '#dcfce7', color: '#15803d' },
};

function FuelTag({ type }) {
  const s = FUEL_STYLE[type] || FUEL_STYLE.Diesel;
  return (
    <span style={{ background: s.bg, color: s.color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, whiteSpace: 'nowrap' }}>
      {type || 'N/A'}
    </span>
  );
}

function CarIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
    </svg>
  );
}

export default function VehiclesPage({
  vehicles,
  sortedVehicles,
  vehicleSort,
  onCycleSort,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
}) {
  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>Vehicles <span className="admin-count">{vehicles.length}</span></h3>
        <div className="admin-actions">
          <select
            className="admin-btn admin-btn-outline"
            value={vehicleSort}
            onChange={(e) => onCycleSort(e.target.value)}
          >
            <option value="name_asc">Name (A–Z)</option>
            <option value="name_desc">Name (Z–A)</option>
            <option value="year_desc">Newest Year</option>
            <option value="year_asc">Oldest Year</option>
            <option value="status">Availability</option>
          </select>
          <button className="admin-btn admin-btn-primary" onClick={onAdd}>+ Add Vehicle</button>
        </div>
      </div>

      <div className="admin-vehicle-grid">
        {vehicles.length === 0 && <div className="admin-empty">No vehicles yet.</div>}

        {sortedVehicles.map(v => (
          <button key={v.id} type="button" className="admin-vehicle-card" onClick={() => onViewDetails(v)}>

            {/* Colored status header */}
            <div className={`admin-vehicle-header ${headerClass(v)}`}>
              <div className="admin-vheader-icon">
                <CarIcon />
              </div>
              <div className="admin-vheader-info">
                <span className="admin-vheader-name">{v.name}</span>
                <span className="admin-vheader-sub">{v.model} · {v.year}</span>
              </div>
              <span className="admin-vheader-status">{statusLabel(v)}</span>
            </div>

            <div className="admin-vehicle-body">
              {/* License plate */}
              <div className="admin-plate-wrap">
                <span className="admin-plate">{v.plate_number}</span>
              </div>

              <div className="admin-vehicle-title-row">
                <div className="admin-vehicle-title">
                  <span className="admin-bold">{v.name}</span>
                  <span className="admin-muted-sm">ID #{v.id}</span>
                </div>
                <span className={`admin-badge ${condBadge(v.condition)}`}>{v.condition}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <FuelTag type={v.fuel_type} />
                <span className="admin-muted-sm">{v.model} {v.year}</span>
              </div>

              <div className="admin-vehicle-actions" onClick={e => e.stopPropagation()}>
                <button className="admin-btn admin-btn-primary" type="button" onClick={() => onEdit(v)}>Edit</button>
                <button className="admin-btn admin-btn-danger"  type="button" onClick={() => onDelete(v.id)}>Delete</button>
              </div>
            </div>

          </button>
        ))}
      </div>
    </div>
  );
}
