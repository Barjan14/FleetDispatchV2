import React, { useState, useEffect } from 'react';
import { uploadImage, createPreviewUrl, revokePreviewUrl } from '../../utils/imageUpload';

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const SpinnerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'vmSpin .7s linear infinite' }}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
  </svg>
);

export default function VehicleFormModal({ mode, data, onChange, onSave, onClose }) {
  const isAdd = mode === 'add';

  const [previewUrl, setPreviewUrl] = useState(data.image_url || '');
  const [uploading, setUploading]   = useState(false);
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
      const { url } = await uploadImage(file, 'vehicle-images', 'vehicles/temp');
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

  const set = (field, val) => onChange({ ...data, [field]: val });

  return (
    <>
      <style>{`
        @keyframes vmSpin { to { transform: rotate(360deg); } }
        .vm-upload-zone:hover .vm-upload-overlay { opacity: 1; }
      `}</style>

      <div className="admin-overlay" onClick={onClose}>
        <div className="admin-modal" style={{ maxWidth: '780px', width: '94%' }} onClick={e => e.stopPropagation()}>

          {/* Header */}
          <div className="admin-modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '16px', margin: 0, color: '#0f172a', fontWeight: 800 }}>
              {isAdd ? 'Add New Vehicle' : 'Edit Vehicle'}
            </h3>
            <button className="admin-btn admin-btn-outline" onClick={onClose} disabled={uploading}
              style={{ padding: '5px', border: 'none', color: '#94a3b8', lineHeight: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="admin-modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Image upload — full-width landscape strip */}
            <div>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Vehicle Photo
              </span>
              <label
                htmlFor="vehicle-image-input"
                className="vm-upload-zone"
                style={{
                  display: 'block', width: '100%', height: '160px',
                  borderRadius: '10px', overflow: 'hidden', position: 'relative',
                  border: previewUrl ? '1px solid #e2e8f0' : '2px dashed #cbd5e1',
                  background: previewUrl ? '#000' : '#f8fafc',
                  cursor: uploading ? 'not-allowed' : 'pointer',
                }}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Vehicle" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.92 }} />
                ) : (
                  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#94a3b8' }}>
                    <UploadIcon />
                    <span style={{ fontSize: '12px', fontWeight: 600 }}>Click to upload vehicle photo</span>
                    <span style={{ fontSize: '11px', color: '#cbd5e1' }}>JPEG, PNG, WebP — max 5 MB</span>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="vm-upload-overlay" style={{
                  position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: previewUrl ? 0 : 0, transition: 'opacity 0.18s',
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '6px 16px', borderRadius: '999px', backdropFilter: 'blur(4px)' }}>
                    Change Photo
                  </span>
                </div>

                {/* Uploading indicator */}
                {uploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '12px', fontWeight: 700, color: '#475569' }}>
                    <SpinnerIcon /> Uploading…
                  </div>
                )}

                <input type="file" accept="image/*" onChange={handleImageSelect} disabled={uploading} style={{ display: 'none' }} id="vehicle-image-input" />
              </label>
              {uploadError && (
                <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: '#ef4444', fontWeight: 600 }}>{uploadError}</p>
              )}
            </div>

            {/* Form fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label>Vehicle Name *</label>
                <input value={data.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Toyota Hilux" />
              </div>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label>Plate Number *</label>
                <input value={data.plate_number || ''} onChange={e => set('plate_number', e.target.value)} placeholder="e.g. ABC-1234" />
              </div>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label>Model</label>
                <input value={data.model || ''} onChange={e => set('model', e.target.value)} placeholder="e.g. Hilux Revo" />
              </div>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label>Year</label>
                <input type="number" value={data.year || ''} onChange={e => set('year', e.target.value)} placeholder="e.g. 2022" />
              </div>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label>Fuel Type</label>
                <select value={data.fuel_type || 'Diesel'} onChange={e => set('fuel_type', e.target.value)}>
                  <option>Gasoline</option>
                  <option>Diesel</option>
                  <option>Electric</option>
                  <option>Hybrid</option>
                </select>
              </div>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label>Condition</label>
                <select value={data.condition || 'Good'} onChange={e => set('condition', e.target.value)}>
                  <option>Good</option>
                  <option>Fair</option>
                  <option>Under Repair</option>
                  <option>Out of Service</option>
                </select>
              </div>
              <div className="admin-form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
                <label>Availability Status</label>
                <select value={data.is_available !== false} onChange={e => set('is_available', e.target.value === 'true')}>
                  <option value="true">Available</option>
                  <option value="false">On Duty / In Use</option>
                </select>
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="admin-modal-footer" style={{ padding: '14px 24px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
            <button className="admin-btn admin-btn-outline" onClick={onClose} disabled={uploading}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={onSave} disabled={uploading}>
              {isAdd ? 'Add Vehicle' : 'Save Changes'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
