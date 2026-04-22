import React from 'react';

export default function UserFormModal({ mode, data, onChange, onSave, onClose }) {
  const isAdd = mode === 'add';

  // 🔒 Safe updater (prevents stale nested state bugs)
  const updateProfile = (field, value) => {
    onChange({
      ...data,
      profile: {
        ...(data.profile || {}),
        [field]: value
      }
    });
  };

  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>

        {/* HEADER */}
        <div className="admin-modal-header">
          <h3>{isAdd ? 'Add User' : 'Edit User'}</h3>
          <button
            className="admin-btn admin-btn-outline admin-close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="admin-modal-body">

          {/* 🔥 EMAIL (READ ONLY - from auth.users) */}
          {!isAdd && (
            <div className="admin-form-group">
              <label>Email</label>
              <input
                value={data.email || ''}
                disabled
              />
            </div>
          )}

          {/* ROW 1 */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Employee ID</label>
              <input
                value={data.profile?.employee_id || ''}
                onChange={e => updateProfile('employee_id', e.target.value)}
                placeholder="EMP-001"
              />
            </div>

            <div className="admin-form-group">
              <label>Phone</label>
              <input
                value={data.profile?.phone || ''}
                onChange={e => updateProfile('phone', e.target.value)}
                placeholder="09XX-XXX-XXXX"
              />
            </div>
          </div>

          {/* ROW 2 */}
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Department</label>
              <input
                value={data.profile?.department || ''}
                onChange={e => updateProfile('department', e.target.value)}
                placeholder="e.g. Logistics"
              />
            </div>

            <div className="admin-form-group">
              <label>Role</label>
              <select
                value={data.is_staff ? 'admin' : 'user'}
                onChange={e =>
                  onChange({
                    ...data,
                    is_staff: e.target.value === 'admin'
                  })
                }
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

        </div>

        {/* FOOTER */}
        <div className="admin-modal-footer">
          <button
            className="admin-btn admin-btn-outline"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="admin-btn admin-btn-primary"
            onClick={onSave}
          >
            {isAdd ? 'Add User' : 'Save Changes'}
          </button>
        </div>

      </div>
    </div>
  );
}