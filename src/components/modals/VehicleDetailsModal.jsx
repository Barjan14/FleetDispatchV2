import React from 'react';

function condBadge(c) {
  const map = { Good:'b-good', Fair:'b-fair', 'Under Repair':'b-repair', 'Out of Service':'b-out' };
  return map[c] || 'b-out';
}

export default function VehicleDetailsModal({ vehicle, onEdit, onDelete, onClose }) {
  if (!vehicle) return null;

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e=>e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>Vehicle Details</h3>
          <button className="admin-btn admin-btn-outline admin-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-vehicle-detail">
            <div className="admin-vehicle-detail-media" aria-hidden="true"/>
            <div className="admin-vehicle-detail-info">
              <div className="admin-vehicle-detail-title">
                <div>
                  <div className="admin-bold" style={{fontSize:'16px'}}>{vehicle.name}</div>
                  <div className="admin-muted-sm">#{vehicle.id} • {vehicle.plate_number}</div>
                </div>
                <span className={`admin-badge ${condBadge(vehicle.condition)}`}>{vehicle.condition}</span>
              </div>
              <div className="admin-vehicle-detail-grid">
                <div><div className="admin-muted-sm">Model</div><div className="admin-bold">{vehicle.model||'—'}</div></div>
                <div><div className="admin-muted-sm">Year</div><div className="admin-bold">{vehicle.year||'—'}</div></div>
                <div>
                  <div className="admin-muted-sm">Availability</div>
                  <span className={`admin-badge ${vehicle.is_available?'b-approved':'b-rejected'}`}>{vehicle.is_available?'Available':'Unavailable'}</span>
                </div>
              </div>
              <div className="admin-vehicle-detail-actions">
                <button className="admin-btn admin-btn-primary" type="button" onClick={onEdit}>Edit</button>
                <button className="admin-btn admin-btn-danger"  type="button" onClick={()=>onDelete(vehicle.id)}>Delete</button>
              </div>
            </div>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-outline" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
