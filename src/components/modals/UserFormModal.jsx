import React from 'react';

export default function UserFormModal({ mode, data, onChange, onSave, onClose }) {
  const isAdd = mode === 'add';
  
  return (
    <div className="admin-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e=>e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3>{isAdd ? 'Add User' : 'Edit User'}</h3>
          <button className="admin-btn admin-btn-outline admin-close" onClick={onClose}>✕</button>
        </div>
        <div className="admin-modal-body">
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Username *</label>
              <input 
                value={data.username} 
                onChange={e=>onChange({...data, username:e.target.value})} 
                placeholder="johndoe"
              />
            </div>
            <div className="admin-form-group">
              <label>Employee ID</label>
              <input 
                value={data.profile.employee_id} 
                onChange={e=>onChange({...data, profile:{...data.profile, employee_id:e.target.value}})} 
                placeholder="EMP-001"
              />
            </div>
          </div>
          <div className="admin-form-group">
            <label>Email *</label>
            <input 
              type="email" 
              value={data.email} 
              onChange={e=>onChange({...data, email:e.target.value})} 
              placeholder="john@company.com"
            />
          </div>
          <div className="admin-form-group">
            <label>{isAdd ? 'Password *' : 'New Password (leave blank to keep)'}</label>
            <input 
              type="password" 
              value={data.password} 
              onChange={e=>onChange({...data, password:e.target.value})} 
              placeholder="••••••••"
            />
          </div>
          <div className="admin-form-row">
            <div className="admin-form-group">
              <label>Department</label>
              <input 
                value={data.profile.department} 
                onChange={e=>onChange({...data, profile:{...data.profile, department:e.target.value}})} 
                placeholder="e.g. Logistics"
              />
            </div>
            <div className="admin-form-group">
              <label>Phone</label>
              <input 
                value={data.profile.phone} 
                onChange={e=>onChange({...data, profile:{...data.profile, phone:e.target.value}})} 
                placeholder="09XX-XXX-XXXX"
              />
            </div>
          </div>
          <div className="admin-form-group">
            <label className="admin-checkbox">
              <input 
                type="checkbox" 
                checked={data.is_staff} 
                onChange={e=>onChange({...data, is_staff:e.target.checked})}
              />
              <span>Grant Admin Access</span>
            </label>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-outline" onClick={onClose}>Cancel</button>
          <button className="admin-btn admin-btn-primary" onClick={onSave}>
            {isAdd ? 'Add User' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
