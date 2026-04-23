import React from 'react';

function condBadge(c) {
  const map = { Good: 'b-good', Fair: 'b-fair', 'Under Repair': 'b-repair', 'Out of Service': 'b-out' };
  return map[c] || 'b-out';
}

export default function VehicleDetailsModal({ vehicle, onEdit, onDelete, onClose }) {
  if (!vehicle) return null;

  return (
    <div className="admin-overlay" onClick={onClose}>
      {/* Set a max-width so the modal has enough room for two columns */}
      <div className="admin-modal" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
        
        <div className="admin-modal-header">
          <h3>Vehicle Details</h3>
          <button className="admin-btn admin-btn-outline admin-close" onClick={onClose}>✕</button>
        </div>
        
        {/* Using the 2-column split class we made earlier! */}
        <div className="admin-modal-body admin-modal-body-split">
          
          {/* LEFT COLUMN: Vehicle Image */}
          <div className="admin-modal-column-left">
            <div className="admin-vehicle-detail-media">
              {vehicle.image_url ? (
                <img 
                  src={vehicle.image_url} 
                  alt={vehicle.name} 
                  className="admin-vehicle-detail-img" 
                />
              ) : (
                <div className="admin-vehicle-img-placeholder">No Image Available</div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Vehicle Information */}
          <div className="admin-modal-column-right">
            <div className="admin-vehicle-detail-info">
              
              {/* Title & Badge */}
              <div className="admin-vehicle-detail-title-row">
                <div>
                  <div className="admin-bold" style={{ fontSize: '20px', marginBottom: '4px', color: '#111827' }}>
                    {vehicle.name}
                  </div>
                  <div className="admin-muted-sm">
                    #{vehicle.id} • Plate: {vehicle.plate_number}
                  </div>
                </div>
                <span className={`admin-badge ${condBadge(vehicle.condition)}`}>
                  {vehicle.condition}
                </span>
              </div>

              {/* Data Grid */}
              <div className="admin-vehicle-detail-grid">
                <div className="admin-detail-item">
                  <span className="admin-muted-sm">Model</span>
                  <span className="admin-bold">{vehicle.model || '—'}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-muted-sm">Year</span>
                  <span className="admin-bold">{vehicle.year || '—'}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-muted-sm">Fuel Type</span>
                  <span className="admin-bold">{vehicle.fuel_type || '—'}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-muted-sm">Odometer</span>
                  <span className="admin-bold">{vehicle.odometer_km ? `${vehicle.odometer_km} km` : '—'}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-muted-sm">Availability</span>
                  {/* ✅ Changed b-rejected to b-ongoing */}
                  <span className={`admin-badge ${vehicle.is_available ? 'b-approved' : 'b-ongoing'}`}>
                    {vehicle.is_available ? 'Available' : 'On Duty'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="admin-vehicle-detail-actions">
                <button className="admin-btn admin-btn-primary" type="button" onClick={onEdit}>Edit Vehicle</button>
                <button className="admin-btn admin-btn-danger" type="button" onClick={() => onDelete(vehicle.id)}>Delete Vehicle</button>
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