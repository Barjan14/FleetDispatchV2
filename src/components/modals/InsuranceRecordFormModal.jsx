import React, { useState, useEffect } from 'react';
import { uploadImage } from '../utils/imageUpload';

const InsuranceRecordFormModal = ({ record, vehicles, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    provider: '',
    policy_number: '',
    coverage_type: '',
    start_date: '',
    expiry_date: '',
    premium_amount: '',
    is_active: true,
    document_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (record) {
      setFormData(record);
    }
  }, [record]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadError('');

      const { url } = await uploadImage(file, 'vehicle-images', `insurance/${formData.vehicle_id}`);
      setFormData(prev => ({
        ...prev,
        document_url: url
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
          <h2>{record ? 'Edit Insurance Policy' : 'New Insurance Policy'}</h2>
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
              <label>Provider</label>
              <input
                type="text"
                name="provider"
                value={formData.provider}
                onChange={handleChange}
                placeholder="Insurance provider name"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Policy Number</label>
              <input
                type="text"
                name="policy_number"
                value={formData.policy_number}
                onChange={handleChange}
                placeholder="Policy number"
              />
            </div>

            <div className="form-group">
              <label>Coverage Type</label>
              <input
                type="text"
                name="coverage_type"
                value={formData.coverage_type}
                onChange={handleChange}
                placeholder="e.g., Comprehensive, Third Party"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Expiry Date</label>
              <input
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Premium Amount</label>
              <input
                type="number"
                name="premium_amount"
                value={formData.premium_amount}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <span>Active Policy</span>
            </label>
          </div>

          <div className="form-group">
            <label>Upload Policy Document</label>
            <div style={{
              border: '2px dashed #ddd',
              borderRadius: '6px',
              padding: '16px',
              textAlign: 'center'
            }}>
              {formData.document_url && (
                <div style={{ marginBottom: '12px', color: '#10b981' }}>
                  ✓ Document uploaded
                </div>
              )}
              <input
                type="file"
                onChange={handleDocumentUpload}
                disabled={uploading}
                style={{ display: 'none' }}
                id="policy-doc"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <label 
                htmlFor="policy-doc"
                style={{
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  display: 'block',
                  padding: '8px'
                }}
              >
                {uploading ? 'Uploading...' : 'Click to upload'}
              </label>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                Max 5MB • PDF, Images, Word docs
              </div>
            </div>
            {uploadError && <span style={{ color: '#ef4444', fontSize: '12px' }}>{uploadError}</span>}
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-save">Save Policy</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InsuranceRecordFormModal;
