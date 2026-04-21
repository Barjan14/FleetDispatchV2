import React from 'react';

export default function VehicleFormModal({ mode, data, onChange, onSave, onClose }) {
  const isAdd = mode === 'add';
  
  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e=>e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{isAdd ? 'Add Vehicle' : 'Edit Vehicle'}</h3>
          <button className="admin-btn admin-btn-outline admin-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Vehicle Name *</label>
              <input 
                value={data.name} 
                onChange={e=>onChange({...data, name:e.target.value})} 
                placeholder="e.g. Toyota Hilux"
              />
            </div>
            <div className="admin-form-group">
              <label>Plate Number *</label>
              <input 
                value={data.plate_number} 
                onChange={e=>onChange({...data, plate_number:e.target.value})} 
                placeholder="e.g. ABC-1234"
              />
            </div>
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Model</label>
              <input 
                value={data.model} 
                onChange={e=>onChange({...data, model:e.target.value})} 
                placeholder="e.g. Hilux Revo"
              />
            </div>
            <div className="admin-form-group">
              <label>Year</label>
              <input 
                type="number" 
                value={data.year} 
                onChange={e=>onChange({...data, year:e.target.value})} 
                placeholder="e.g. 2022"
              />
            </div>
          </div>
          <div className="admin-form-group">
            <label>Condition</label>
            <select value={data.condition} onChange={e=>onChange({...data, condition:e.target.value})}>
              <option>Good</option>
              <option>Fair</option>
              <option>Under Repair</option>
              <option>Out of Service</option>
            </select>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-outline" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={onSave}>
            {isAdd ? 'Add Vehicle' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
