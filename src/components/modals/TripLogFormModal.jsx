import React, { useState, useEffect } from 'react';

const TripLogFormModal = ({ trip, vehicles, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    origin: '',
    destination: '',
    purpose: '',
    status: 'Scheduled',
    start_datetime: '',
    end_datetime: '',
    odometer_start: '',
    odometer_end: ''
  });

  useEffect(() => {
    if (trip) {
      setFormData(trip);
    }
  }, [trip]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{trip ? 'Edit Trip Log' : 'New Trip Log'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Vehicle *</label>
              <select
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleChange}
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.plate_number})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Status *</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Origin</label>
              <input
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                placeholder="Starting location"
              />
            </div>

            <div className="form-group">
              <label>Destination</label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder="Destination location"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Purpose</label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Trip purpose"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date & Time *</label>
              <input
                type="datetime-local"
                name="start_datetime"
                value={formData.start_datetime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date & Time</label>
              <input
                type="datetime-local"
                name="end_datetime"
                value={formData.end_datetime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Odometer Start (km)</label>
              <input
                type="number"
                name="odometer_start"
                value={formData.odometer_start}
                onChange={handleChange}
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Odometer End (km)</label>
              <input
                type="number"
                name="odometer_end"
                value={formData.odometer_end}
                onChange={handleChange}
                step="0.1"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save">Save Trip</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TripLogFormModal;
