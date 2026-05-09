import React, { useState, useEffect } from 'react';

const RepairRecordFormModal = ({ record, vehicles, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    issue: '',
    repair_done: '',
    status: 'Pending',
    shop_name: '',
    repair_cost: '',
    date_reported: '',
    date_resolved: ''
  });

  useEffect(() => {
    if (record) {
      setFormData(record);
    }
  }, [record]);

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
          <h2>{record ? 'Edit Repair Record' : 'New Repair Record'}</h2>
          <button className="close-btn" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
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
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Issue Description *</label>
            <textarea
              name="issue"
              value={formData.issue}
              onChange={handleChange}
              placeholder="Describe the issue"
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label>Repair Done</label>
            <textarea
              name="repair_done"
              value={formData.repair_done}
              onChange={handleChange}
              placeholder="Describe the repair work completed"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Shop Name</label>
              <input
                type="text"
                name="shop_name"
                value={formData.shop_name}
                onChange={handleChange}
                placeholder="Repair shop name"
              />
            </div>

            <div className="form-group">
              <label>Repair Cost</label>
              <input
                type="number"
                name="repair_cost"
                value={formData.repair_cost}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date Reported *</label>
              <input
                type="date"
                name="date_reported"
                value={formData.date_reported}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Date Resolved</label>
              <input
                type="date"
                name="date_resolved"
                value={formData.date_resolved}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save">Save Record</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RepairRecordFormModal;
