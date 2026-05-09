import React, { useState, useEffect } from 'react';
import { uploadImage } from '../utils/imageUpload';

const SafetyCheckFormModal = ({ check, vehicles, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    vehicle_id: '',
    check_date: '',
    next_due_date: '',
    result: 'Pending',
    notes: '',
    document_url: ''
  });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    if (check) {
      setFormData(check);
    }
  }, [check]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadError('');

      const { url } = await uploadImage(file, 'vehicle-images', `safety-checks/${formData.vehicle_id}`);
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
          <h2>{check ? 'Edit Safety Check' : 'New Safety Check'}</h2>
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
              <label>Result *</label>
              <select
                name="result"
                value={formData.result}
                onChange={handleChange}
              >
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Check Date</label>
              <input
                type="date"
                name="check_date"
                value={formData.check_date}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Next Due Date</label>
              <input
                type="date"
                name="next_due_date"
                value={formData.next_due_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Safety check notes"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Upload Document (optional)</label>
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
                id="doc-upload"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <label 
                htmlFor="doc-upload"
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
            <button type="submit" className="btn-save">Save Check</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SafetyCheckFormModal;
