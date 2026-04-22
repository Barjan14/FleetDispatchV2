import React, { useState, useEffect } from 'react';
import { uploadImage } from '../utils/imageUpload';

const FuelRecordFormModal = ({ record, vehicles, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    date: '',
    liters: '',
    cost_per_liter: '',
    total_cost: '',
    odometer_km: '',
    km_per_liter: '',
    station_name: '',
    notes: '',
    receipt_image_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

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

  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadError('');

      const { url } = await uploadImage(file, 'vehicle-images', `fuel-receipts/${formData.vehicle_id}`);
      setFormData(prev => ({
        ...prev,
        receipt_image_url: url
      }));
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{record ? 'Edit Fuel Record' : 'New Fuel Record'}</h2>
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
              <label>Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Liters *</label>
              <input
                type="number"
                name="liters"
                value={formData.liters}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Cost per Liter</label>
              <input
                type="number"
                name="cost_per_liter"
                value={formData.cost_per_liter}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Total Cost</label>
              <input
                type="number"
                name="total_cost"
                value={formData.total_cost}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Odometer (km)</label>
              <input
                type="number"
                name="odometer_km"
                value={formData.odometer_km}
                onChange={handleChange}
                placeholder="0.00"
                step="0.1"
              />
            </div>

            <div className="form-group">
              <label>Efficiency (km/L)</label>
              <input
                type="number"
                name="km_per_liter"
                value={formData.km_per_liter}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Station Name</label>
              <input
                type="text"
                name="station_name"
                value={formData.station_name}
                onChange={handleChange}
                placeholder="Fuel station name"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes"
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Upload Receipt Image</label>
            <div style={{
              border: '2px dashed #ddd',
              borderRadius: '6px',
              padding: '16px',
              textAlign: 'center'
            }}>
              {formData.receipt_image_url && (
                <div style={{ marginBottom: '12px', color: '#10b981' }}>
                  ✓ Receipt uploaded
                </div>
              )}
              <input
                type="file"
                onChange={handleReceiptUpload}
                disabled={uploading}
                style={{ display: 'none' }}
                id="receipt-upload"
                accept="image/*,.pdf"
              />
              <label 
                htmlFor="receipt-upload"
                style={{
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  display: 'block',
                  padding: '8px'
                }}
              >
                {uploading ? 'Uploading...' : 'Click to upload'}
              </label>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                Max 5MB • Images, PDF
              </div>
            </div>
            {uploadError && <span style={{ color: '#ef4444', fontSize: '12px' }}>{uploadError}</span>}
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

export default FuelRecordFormModal;
