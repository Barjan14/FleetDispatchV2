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
      <div className="admin-modal" style={{ maxWidth: '850px' }} onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="admin-modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '18px', margin: 0, color: '#0f172a', fontWeight: '800' }}>
            {isAdd ? 'Add New Vehicle' : 'Edit Vehicle Settings'}
          </h3>
          <button className="admin-btn admin-btn-outline" onClick={onClose} disabled={uploading} style={{ padding: '6px', border: 'none', color: '#64748b' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        {/* BODY: Split Layout using Flexbox */}
        <div className="admin-modal-body" style={{ padding: '32px 24px', display: 'flex', flexWrap: 'wrap', gap: '32px', textAlign: 'left' }}>
          
          {/* LEFT COLUMN: Image Upload */}
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '15px', fontWeight: '800', color: '#334155', marginBottom: '12px', display: 'block' }}>Vehicle Image</span>
            
            {/* ✅ CHANGED: The main container is now a <label>, making the whole box clickable */}
            <label 
              htmlFor="vehicle-image-input"
              style={{ 
                width: '100%', 
                aspectRatio: '1 / 1', 
                backgroundColor: '#f8fafc', 
                border: previewUrl ? '1px solid #e2e8f0' : '2px dashed #cbd5e1', 
                borderRadius: '16px', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative',
                cursor: uploading ? 'not-allowed' : 'pointer', // Adds the pointer hand
                transition: 'border-color 0.2s'
              }}
            >
              {previewUrl ? (
                <img 
                  src={previewUrl} 
                  alt="Vehicle preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '16px' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
              )}

              {/* Hidden Upload Input */}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={uploading}
                style={{ display: 'none' }}
                id="vehicle-image-input"
              />

              {/* ✅ CHANGED: This is now a <div> instead of a <label> because the parent is already a label */}
              <div 
                style={{
                  position: 'absolute',
                  bottom: previewUrl ? '16px' : 'auto',
                  backgroundColor: previewUrl ? 'rgba(255,255,255,0.9)' : 'transparent',
                  backdropFilter: previewUrl ? 'blur(4px)' : 'none',
                  color: '#0f172a',
                  padding: '8px 16px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: '700',
                  boxShadow: previewUrl ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {uploading ? (
                  <>
                    <span className="spinner" style={{ width: '12px', height: '12px', padding: 0, borderWidth: '2px' }}></span> Uploading...
                  </>
                ) : previewUrl ? (
                  'Change Image'
                ) : (
                  'Click to Upload'
                )}
              </div>
            </label>
            
            {!previewUrl && !uploading && (
              <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '12px', fontWeight: '500' }}>
                Max 5MB • JPEG, PNG, WebP
              </div>
            )}
            {uploadError && <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', textAlign: 'center', fontWeight: '600' }}>{uploadError}</div>}
          </div>

          {/* RIGHT COLUMN: Form Information */}
          <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label>Vehicle Name *</label>
                <input 
                  value={data.name || ''} 
                  onChange={e => onChange({...data, name: e.target.value})} 
                  placeholder="e.g. Toyota Hilux"
                />
              </div>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label>Plate Number *</label>
                <input 
                  value={data.plate_number || ''} 
                  onChange={e => onChange({...data, plate_number: e.target.value})} 
                  placeholder="e.g. ABC-1234"
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label>Model</label>
                <input 
                  value={data.model || ''} 
                  onChange={e => onChange({...data, model: e.target.value})} 
                  placeholder="e.g. Hilux Revo"
                />
              </div>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label>Year</label>
                <input 
                  type="number" 
                  value={data.year || ''} 
                  onChange={e => onChange({...data, year: e.target.value})} 
                  placeholder="e.g. 2022"
                />
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label>Fuel Type</label>
                <select value={data.fuel_type || 'Diesel'} onChange={e => onChange({...data, fuel_type: e.target.value})}>
                  <option>Gasoline</option>
                  <option>Diesel</option>
                  <option>Electric</option>
                  <option>Hybrid</option>
                </select>
              </div>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label>Condition</label>
                <select value={data.condition || 'Good'} onChange={e => onChange({...data, condition: e.target.value})}>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Under Repair</option>
                  <option>Out of Service</option>
                </select>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label>Odometer (km)</label>
                <input 
                  type="number" 
                  value={data.odometer_km || 0} 
                  onChange={e => onChange({...data, odometer_km: parseFloat(e.target.value)})} 
                  placeholder="0"
                />
              </div>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label>Status</label>
                <select 
                  value={data.is_available !== false} 
                  onChange={e => onChange({...data, is_available: e.target.value === 'true'})}
                >
                  <option value={true}>Available</option>
                  <option value={false}>On Duty / In Use</option>
                </select>
              </div>
            </div>
            
          </div>
        </div>
        
        {/* FOOTER */}
        <div className="admin-modal-footer" style={{ padding: '16px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <button className="admin-btn admin-btn-outline" onClick={onClose} disabled={uploading}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={onSave} disabled={uploading}>
            {isAdd ? 'Add Vehicle' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}