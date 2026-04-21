import React from 'react';

export default function UsersPage({
  users,
  onAdd,
  onEdit,
  onDelete,
}) {
  return (
    <div className="admin-card admin-card-compact">
      <div className="admin-card-header">
        <h3>Users <span className="admin-count">{users.length}</span></h3>
        <button className="admin-btn admin-btn-primary" onClick={onAdd}>+ Add User</button>
      </div>
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Username</th><th>Email</th><th>Department</th><th>Role</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.length===0 && <tr><td colSpan={6} className="admin-empty">No users yet.</td></tr>}
            {users.map(u=>(
              <tr key={u.id}>
                <td><code className="admin-code">#{u.id}</code></td>
                <td className="admin-bold">{u.username}</td>
                <td className="admin-muted">{u.email||'—'}</td>
                <td className="admin-muted">{u.profile?.department||'—'}</td>
                <td><span className={`admin-badge ${u.is_staff?'b-approved':'b-ongoing'}`}>{u.is_staff?'Admin':'User'}</span></td>
                <td className="admin-actions">
                  <button className="admin-btn admin-btn-primary" onClick={()=>onEdit(u)}>Edit</button>
                  <button className="admin-btn admin-btn-danger"  onClick={()=>onDelete(u.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
