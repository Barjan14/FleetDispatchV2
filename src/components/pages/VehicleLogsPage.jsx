import React from 'react';

export default function VehicleLogsPage({ logs, loading }) {
  if (loading) {
    return (
      <div className="admin-card">
        <div className="admin-card-header"><h3>Vehicle Change Logs</h3></div>
        <div className="admin-empty">Loading logs...</div>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>Vehicle Change Logs <span className="admin-count">{logs.length}</span></h3>
      </div>
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Vehicle</th>
              <th>Change Type</th>
              <th>Field</th>
              <th>Old Value</th>
              <th>New Value</th>
              <th>Admin</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && <tr><td colSpan={8} className="admin-empty">No logs yet.</td></tr>}
            {logs.map(log => (
              <tr key={log.id}>
                <td className="admin-muted"><code>#{log.id}</code></td>
                <td className="admin-bold">{log.vehicle_name || '—'}</td>
                <td>
                  <span className={`admin-badge ${
                    log.change_type === 'create' ? 'b-approved' :
                    log.change_type === 'update' ? 'b-ongoing' :
                    log.change_type === 'delete' ? 'b-rejected' :
                    'b-pending'
                  }`}>
                    {log.change_type}
                  </span>
                </td>
                <td className="admin-muted">{log.field_name || '—'}</td>
                <td className="admin-muted-sm"><code>{log.old_value || '—'}</code></td>
                <td className="admin-muted-sm"><code>{log.new_value || '—'}</code></td>
                <td className="admin-bold">{log.admin_id || 'System'}</td>
                <td className="admin-muted-sm">{new Date(log.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
