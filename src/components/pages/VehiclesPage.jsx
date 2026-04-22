import React from 'react';

function condBadge(c) {
  const map = { Good:'b-good', Fair:'b-fair', 'Under Repair':'b-repair', 'Out of Service':'b-out' };
  return map[c] || 'b-out';
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
          <button className="admin-btn admin-btn-outline" type="button" onClick={onCycleSort} title="Cycle sort order">⇅ Sort</button>
          <button className="admin-btn admin-btn-primary" onClick={onAdd}>+ Add Vehicle</button>
        </div>
      </div>
      <div className="admin-vehicle-grid">
        {vehicles.length===0 && <div className="admin-empty">No vehicles yet.</div>}        {sortedVehicles.map(v => (
          <button key={v.id} type="button" className="admin-vehicle-card" onClick={()=>onViewDetails(v)}>
            <div className="admin-vehicle-media">
              <div 
                className={`admin-vehicle-img ${v.image_url ? 'has-image' : ''}`}
                aria-hidden="true"
                data-image-url={v.image_url}
                style={v.image_url ? {
                  backgroundImage: `url("${v.image_url}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat'
                } : {}}
              />
            </div>
            <div className="admin-vehicle-body">
              <div className="admin-vehicle-title-row">
                <div className="admin-vehicle-title">
                  <span className="admin-bold">{v.name}</span>
                  <span className="admin-muted-sm">#{v.id} • {v.plate_number}</span>
                </div>
                <span className={`admin-badge ${condBadge(v.condition)}`}>{v.condition}</span>
              </div>
              <div className="admin-vehicle-meta">
                <span className="admin-muted">{v.model} {v.year}</span>
                <span className={`admin-badge ${v.is_available?'b-approved':'b-rejected'}`}>{v.is_available?'Available':'Unavailable'}</span>
              </div>
              <div className="admin-vehicle-actions" onClick={e=>e.stopPropagation()}>
                <button className="admin-btn admin-btn-primary" type="button" onClick={()=>onEdit(v)}>Edit</button>
                <button className="admin-btn admin-btn-danger"  type="button" onClick={()=>onDelete(v.id)}>Delete</button>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
