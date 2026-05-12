import React from 'react';

export default function VehicleFormModal({ mode, data, onChange, onSave, onClose }) {
  const isAdd = mode === 'add';
  const set = (field, val) => onChange({ ...data, [field]: val });

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: '680px', width: '94%' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="admin-modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '16px', margin: 0, color: '#0f172a', fontWeight: 800 }}>
            {isAdd ? 'Add New Vehicle' : 'Edit Vehicle'}
          </h3>
          <button className="admin-btn admin-btn-outline" onClick={onClose}
            style={{ padding: '5px', border: 'none', color: '#94a3b8', lineHeight: 0 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="admin-modal-body" style={{ padding: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="admin-form-group" style={{ margin: 0 }}>
              <label>Vehicle Name *</label>
              <input value={data.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Toyota Hilux" />
            </div>
            <div className="admin-form-group" style={{ margin: 0 }}>
              <label>Plate Number *</label>
              <input value={data.plate_number || ''} onChange={e => set('plate_number', e.target.value)} placeholder="e.g. ABC-1234" />
            </div>
            <div className="admin-form-group" style={{ margin: 0 }}>
              <label>Model</label>
              <input value={data.model || ''} onChange={e => set('model', e.target.value)} placeholder="e.g. Hilux Revo" />
            </div>
            <div className="admin-form-group" style={{ margin: 0 }}>
              <label>Year</label>
              <input type="number" value={data.year || ''} onChange={e => set('year', e.target.value)} placeholder="e.g. 2022" />
            </div>
            <div className="admin-form-group" style={{ margin: 0 }}>
              <label>Fuel Type</label>
              <select value={data.fuel_type || 'Diesel'} onChange={e => set('fuel_type', e.target.value)}>
                <option>Gasoline</option>
                <option>Diesel</option>
                <option>Electric</option>
                <option>Hybrid</option>
              </select>
            </div>
            <div className="admin-form-group" style={{ margin: 0 }}>
              <label>Condition</label>
              <select value={data.condition || 'Good'} onChange={e => set('condition', e.target.value)}>
                <option>Good</option>
                <option>Fair</option>
                <option>Under Repair</option>
                <option>Out of Service</option>
              </select>
            </div>
            <div className="admin-form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
              <label>Availability Status</label>
              <select value={data.is_available !== false} onChange={e => set('is_available', e.target.value === 'true')}>
                <option value="true">Available</option>
                <option value="false">On Duty / In Use</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="admin-modal-footer" style={{ padding: '14px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <button className="admin-btn admin-btn-outline" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={onSave}>
            {isAdd ? 'Add Vehicle' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}
