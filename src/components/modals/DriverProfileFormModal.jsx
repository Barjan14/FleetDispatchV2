import React, { useState, useEffect } from 'react';

const DriverProfileFormModal = ({ driver, fleets, vehicles, onSave, onClose }) => {
  const [formData, setFormData] = useState({
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
      setFormData(driver);
    }
  }, [driver]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
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
                  placeholder="License number"
                  required
                />
              </div>

              <div className="form-group">
                <label>License Type *</label>
                <select
                  name="license_type"
                  value={formData.license_type}
                  onChange={handleChange}
                >
                  <option value="A">A (Motorcycle)</option>
                  <option value="B">B (Car)</option>
                  <option value="C">C (Truck)</option>
                  <option value="BE">BE (Car + Trailer)</option>
                  <option value="CE">CE (Truck + Trailer)</option>
                </select>
              </div>

              <div className="form-group">
                <label>License Expiry Date</label>
                <input
                  type="date"
                  name="license_expiry"
                  value={formData.license_expiry}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="tel"
                  name="contact_number"
                  value={formData.contact_number}
                  onChange={handleChange}
                  placeholder="09XX-XXX-XXXX"
                />
              </div>

              <div className="form-group">
                <label>Emergency Contact</label>
                <input
                  type="tel"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  placeholder="Emergency contact number"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Full address"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Assignment & Status</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Assigned Fleet</label>
                <select
                  name="assigned_fleet_id"
                  value={formData.assigned_fleet_id}
                  onChange={handleChange}
                >
                  <option value="">No Fleet Assignment</option>
                  {fleets.map(fleet => (
                    <option key={fleet.id} value={fleet.id}>{fleet.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Assigned Vehicle</label>
                <select
                  name="assigned_vehicle_id"
                  value={formData.assigned_vehicle_id}
                  onChange={handleChange}
                >
                  <option value="">No Vehicle Assignment</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>{vehicle.name} ({vehicle.plate_number})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Availability</label>
                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                >
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Off Duty">Off Duty</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="is_active_driver"
                  checked={formData.is_active_driver}
                  onChange={handleChange}
                />
                <span>Active Driver</span>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes about the driver"
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save">Save Driver</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DriverProfileFormModal;
