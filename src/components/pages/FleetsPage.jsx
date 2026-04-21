import React from 'react';

export default function FleetsPage({ fleets }) {
  return (
    <div className="admin-card">
      <div className="admin-card-header"><h3>Fleets</h3></div>
      <table className="admin-table">
        <thead><tr><th>ID</th><th>Name</th><th>Vehicles</th></tr></thead>
        <tbody>
          {fleets.length===0 && <tr><td colSpan={3} className="admin-empty">No fleets.</td></tr>}
          {fleets.map(f=>(
            <tr key={f.id}>
              <td className="admin-muted">#{f.id}</td>
              <td className="admin-bold">{f.name}</td>
              <td><span className="admin-badge b-ongoing">{f.vehicles?.length||0}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
