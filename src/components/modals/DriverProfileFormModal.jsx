import React, { useState, useEffect } from 'react';

const DriverProfileFormModal = ({ driver, fleets, vehicles, onSave, onClose }) => {
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
    notes: ''
  });

  useEffect(() => {
    if (driver) {
      setFormData({
        ...driver,
        assigned_fleet_id: driver.assigned_fleet_id || '',
        assigned_vehicle_id: driver.assigned_vehicle_id || ''
      });
    }
  }, [driver]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;

    if ((name === 'assigned_fleet_id' || name === 'assigned_vehicle_id') && value === '') {
      finalValue = null;
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-large">
        <div className="modal-header">
          <h2>{driver ? 'Edit Driver Profile' : 'New Driver Profile'}</h2>
          <button type="button" className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* PERSONAL INFORMATION */}
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Juan Dela Cruz"
                  required
                />
              </div>
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number || ''}
                  onChange={handleChange}
                  placeholder="09XX-XXX-XXXX"
                />
              </div>
              <div className="form-group">
                <label>Emergency Contact</label>
                <input
                  type="tel"
                  name="emergency_contact"
                  value={formData.emergency_contact || ''}
                  onChange={handleChange}
                  placeholder="Contact person & number"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder="Full residential address"
              />
            </div>
          </div>

          {/* LICENSE INFORMATION */}
          <div className="form-section">
            <h3>License Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>License Number *</label>
                <input
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>License Type *</label>
                <select name="license_type" value={formData.license_type} onChange={handleChange}>
                  <option value="A">A (Motorcycle)</option>
                  <option value="B">B (Car)</option>
                  <option value="C">C (Truck)</option>
                  <option value="BE">BE (Car + Trailer)</option>
                  <option value="CE">CE (Truck + Trailer)</option>
                </select>
              </div>
              <div className="form-group">
                <label>License Expiry</label>
                <input
                  type="date"
                  name="license_expiry"
                  value={formData.license_expiry || ''}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* ASSIGNMENT & STATUS */}
          <div className="form-section">
            <h3>Assignment & Status</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Assigned Fleet</label>
                <select 
                  name="assigned_fleet_id" 
                  value={formData.assigned_fleet_id || ''} 
                  onChange={handleChange}
                >
                  <option value="">No Fleet Assignment</option>
                  {fleets.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Assigned Vehicle</label>
                <select 
                  name="assigned_vehicle_id" 
                  value={formData.assigned_vehicle_id || ''} 
                  onChange={handleChange}
                >
                  <option value="">No Vehicle Assignment</option>
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.plate_number})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Availability Status</label>
                <select name="availability" value={formData.availability} onChange={handleChange}>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
            
              {/* THE TOGGLE BUTTON */}
                  <div className="form-group">
                    <label>Employment Status</label>
                    <div className="status-toggle-container">
                      <button
                        type="button"
                        className={`toggle-status-btn ${formData.is_active_driver ? 'is-active' : 'is-inactive'}`}
                        onClick={() => setFormData(prev => ({ ...prev, is_active_driver: !prev.is_active_driver }))}
                      >
                        <span className="status-dot"></span>
                        {formData.is_active_driver ? 'Active Driver' : 'Inactive Driver'}
                      </button>
                    </div>
                  </div>
                </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              placeholder="Additional notes..."
              rows={2}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save">
              {driver ? 'Update Driver Profile' : 'Save New Driver'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverProfileFormModal;