import React, { useState, useEffect } from 'react';
import { uploadImage, createPreviewUrl, revokePreviewUrl } from '../../utils/imageUpload';

export default function VehicleFormModal({ mode, data, onChange, onSave, onClose }) {
  const isAdd = mode === 'add';

  const [previewUrl, setPreviewUrl] = useState(data.image_url || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    setPreviewUrl(data.image_url || '');
  }, [data.image_url]);

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadError('');

      const preview = createPreviewUrl(file);
      setPreviewUrl(preview);

    const { url } = await uploadImage(
      file,
      'vehicle-images',
      `vehicles/temp`
    );

      onChange(prev => ({ ...prev, image_url: url }));

      revokePreviewUrl(preview);
      setPreviewUrl(url);

    } catch (err) {
      setUploadError(err.message);
      setPreviewUrl(data.image_url || '');
    } finally {
      setUploading(false);
    }
  };

return (
    <div className="admin-overlay" onClick={onClose}>
      {/* Added inline style to make the modal wider for 2 columns, adjust if you already have a class for this! */}
      <div className="admin-modal" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{isAdd ? 'Add Vehicle' : 'Edit Vehicle'}</h3>
          <button className="admin-btn admin-btn-outline admin-close" onClick={onClose} disabled={uploading}>✕</button>
        </div>
        
        {/* NEW: Split Body Container */}
        <div className="admin-modal-body admin-modal-body-split">
          
          {/* LEFT COLUMN: Image Upload */}
          <div className="admin-modal-column-left">
            <div className="admin-form-group" style={{ height: '100%' }}>
              <label>Vehicle Image</label>
              <div className="admin-image-upload-box">
                {previewUrl && (
                  <img 
                    src={previewUrl} 
                    alt="Vehicle preview" 
                    className="admin-preview-img"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={uploading}
                  style={{ display: 'none' }}
                  id="vehicle-image-input"
                />
                <label 
                  htmlFor="vehicle-image-input"
                  style={{
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    display: 'block',
                    padding: '8px',
                    fontWeight: '500'
                  }}
                >
                  {uploading ? 'Uploading...' : previewUrl ? 'Change Image' : 'Click to upload image'}
                </label>
                <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                  Max 5MB • JPEG, PNG, WebP
                </div>
              </div>
              {uploadError && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{uploadError}</span>}
            </div>
          </div>

          {/* RIGHT COLUMN: Form Information */}
          <div className="admin-modal-column-right">
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Vehicle Name *</label>
                <input 
                  value={data.name || ''} 
                  onChange={e => onChange({...data, name: e.target.value})} 
                  placeholder="e.g. Toyota Hilux"
                />
              </div>
              <div className="admin-form-group">
                <label>Plate Number *</label>
                <input 
                  value={data.plate_number || ''} 
                  onChange={e => onChange({...data, plate_number: e.target.value})} 
                  placeholder="e.g. ABC-1234"
                />
              </div>
            </div>
            
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Model</label>
                <input 
                  value={data.model || ''} 
                  onChange={e => onChange({...data, model: e.target.value})} 
                  placeholder="e.g. Hilux Revo"
                />
              </div>
              <div className="admin-form-group">
                <label>Year</label>
                <input 
                  type="number" 
                  value={data.year || ''} 
                  onChange={e => onChange({...data, year: e.target.value})} 
                  placeholder="e.g. 2022"
                />
              </div>
            </div>
            
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Fuel Type</label>
                <select value={data.fuel_type || 'Diesel'} onChange={e => onChange({...data, fuel_type: e.target.value})}>
                  <option>Gasoline</option>
                  <option>Diesel</option>
                  <option>Electric</option>
                  <option>Hybrid</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label>Condition</label>
                <select value={data.condition || 'Good'} onChange={e => onChange({...data, condition: e.target.value})}>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Under Repair</option>
                  <option>Out of Service</option>
                </select>
              </div>
            </div>
            
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Odometer (km)</label>
                <input 
                  type="number" 
                  value={data.odometer_km || 0} 
                  onChange={e => onChange({...data, odometer_km: parseFloat(e.target.value)})} 
                  placeholder="0"
                />
              </div>
              <div className="admin-form-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '10px' }}>
                <label className="admin-checkbox" style={{ margin: 0 }}>
                  <input 
                    type="checkbox" 
                    checked={data.is_available !== false} 
                    onChange={e => onChange({...data, is_available: e.target.checked})}
                  />
                  <span>Available for Booking</span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-outline" onClick={onClose} disabled={uploading}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={onSave} disabled={uploading}>
            {isAdd ? 'Add Vehicle' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}