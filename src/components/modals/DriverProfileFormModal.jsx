import React, { useState, useEffect } from 'react';

const DriverProfileFormModal = ({ driver, vehicles, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    license_number: '',
    license_type: 'B',
    license_expiry: '',
    date_of_birth: '',
    contact_number: '',
    emergency_contact: '',
    address: '',
    is_active_driver: true,
    availability: 'Available',
    assigned_fleet_id: '',
    assigned_vehicle_id: '',
    notes: '',
  });

  useEffect(() => {
    if (driver) {
      setFormData({
        ...driver,
        assigned_fleet_id:  driver.assigned_fleet_id  || '',
        assigned_vehicle_id: driver.assigned_vehicle_id || '',
      });
    }
  }, [driver]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;
    if ((name === 'assigned_fleet_id' || name === 'assigned_vehicle_id') && value === '') val = null;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const Field = ({ label, children, full }) => (
    <div className="admin-form-group" style={{ margin: 0, gridColumn: full ? '1 / -1' : undefined }}>
      <label>{label}</label>
      {children}
    </div>
  );

  const Divider = ({ title }) => (
    <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0 0' }}>
      <span style={{ fontSize: '10px', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{title}</span>
      <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
    </div>
  );

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-modal" style={{ maxWidth: '680px', width: '94%' }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="admin-modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
            {driver ? 'Edit Driver Profile' : 'New Driver Profile'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', lineHeight: 0, padding: '4px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit}>
          <div className="admin-modal-body" style={{ padding: '22px 24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

              <Divider title="Personal Information" />

              <Field label="Full Name *">
                <input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Juan Dela Cruz" required />
              </Field>
              <Field label="Date of Birth">
                <input type="date" name="date_of_birth" value={formData.date_of_birth || ''} onChange={handleChange} />
              </Field>
              <Field label="Contact Number">
                <input type="tel" name="contact_number" value={formData.contact_number || ''} onChange={handleChange} placeholder="09XX-XXX-XXXX" />
              </Field>
              <Field label="Emergency Contact">
                <input type="tel" name="emergency_contact" value={formData.emergency_contact || ''} onChange={handleChange} placeholder="Contact person & number" />
              </Field>
              <Field label="Address" full>
                <input name="address" value={formData.address || ''} onChange={handleChange} placeholder="Full residential address" />
              </Field>

              <Divider title="License Information" />

              <Field label="License Number *">
                <input name="license_number" value={formData.license_number} onChange={handleChange} required />
              </Field>
              <Field label="License Type *">
                <select name="license_type" value={formData.license_type} onChange={handleChange}>
                  <option value="A">A — Motorcycle</option>
                  <option value="B">B — Car</option>
                  <option value="C">C — Truck</option>
                  <option value="BE">BE — Car + Trailer</option>
                  <option value="CE">CE — Truck + Trailer</option>
                </select>
              </Field>
              <Field label="License Expiry">
                <input type="date" name="license_expiry" value={formData.license_expiry || ''} onChange={handleChange} />
              </Field>
              <Field label="Availability Status">
                <select name="availability" value={formData.availability} onChange={handleChange}>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </Field>

              <Divider title="Notes" />

              <Field label="Additional Notes" full>
                <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Any relevant notes about this driver..." rows={3} style={{ resize: 'vertical' }} />
              </Field>

            </div>
          </div>

          {/* Footer */}
          <div className="admin-modal-footer" style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <button type="button" className="admin-btn admin-btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="admin-btn admin-btn-primary">
              {driver ? 'Save Changes' : 'Add Driver'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default DriverProfileFormModal;
