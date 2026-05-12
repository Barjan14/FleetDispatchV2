import React, { useState } from 'react';
import DriverProfileFormModal from '../modals/DriverProfileFormModal';
import { supabase } from '../../supabaseClient';

const STATUS_META = {
  Available: { badge: 'b-approved',  dot: '#16a34a' },
  'On Trip':  { badge: 'b-ongoing',   dot: '#d97706' },
  'On Leave': { badge: 'b-pending',   dot: '#f59e0b' },
  'Off Duty': { badge: 'b-returned',  dot: '#94a3b8' },
  Suspended:  { badge: 'b-rejected',  dot: '#ef4444' },
};

const AVATAR_COLORS = ['#6366f1', '#0891b2', '#059669', '#d97706', '#7c3aed', '#0f172a', '#be185d', '#0369a1'];

function DriverAvatar({ name }) {
  const initials = (name || '?').split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();
  const color = AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length];
  return <div className="driver-avatar" style={{ background: color }}>{initials}</div>;
}

function ExpiryCell({ expiry }) {
  if (!expiry) return <span className="admin-muted-sm">—</span>;
  const date = new Date(expiry);
  const daysLeft = Math.ceil((date - new Date()) / 86400000);
  const fmt = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  if (daysLeft <= 0)  return <span className="expiry-danger">{fmt}<span className="expiry-tag expiry-tag-danger">Expired</span></span>;
  if (daysLeft <= 60) return <span className="expiry-warn">{fmt}<span className="expiry-tag expiry-tag-warn">{daysLeft}d</span></span>;
  return <span className="admin-muted-sm">{fmt}</span>;
}

const ALL_STATUSES = ['All', 'Available', 'On Trip', 'On Leave', 'Off Duty', 'Suspended'];

export default function DriversPage({ drivers = [], vehicles = [], onRefresh }) {
  const [showModal, setShowModal]       = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');

  const handleAddDriver = () => { setSelectedDriver(null); setShowModal(true); };
  const handleEditDriver = (d) => { setSelectedDriver(d); setShowModal(true); };

  const handleSaveDriver = async (driverData) => {
    try {
      const cleaned = { ...driverData };
      ['assigned_fleet_id', 'assigned_vehicle_id', 'license_expiry', 'date_of_birth',
       'contact_number', 'emergency_contact', 'address', 'notes'].forEach(f => {
        if (cleaned[f] === '' || cleaned[f] === undefined) cleaned[f] = null;
      });
      delete cleaned.email;
      delete cleaned.password;

      const { error } = selectedDriver
        ? await supabase.from('driver_profiles').update(cleaned).eq('id', selectedDriver.id)
        : await supabase.from('driver_profiles').insert([cleaned]);

      if (error) throw error;
      onRefresh?.();
      setShowModal(false);
      setSelectedDriver(null);
    } catch (err) {
      console.error('Error saving driver:', err);
      alert(`Save failed: ${err.message}`);
    }
  };

  const counts = ALL_STATUSES.reduce((acc, s) => {
    acc[s] = s === 'All' ? drivers.length : drivers.filter(d => d.availability === s).length;
    return acc;
  }, {});

  const filtered = filterStatus === 'All' ? drivers : drivers.filter(d => d.availability === filterStatus);

  return (
    <div className="admin-card">
      {/* HEADER */}
      <div className="admin-card-header">
        <h3>Drivers <span className="admin-count">{drivers.length}</span></h3>
        <button className="admin-btn admin-btn-primary" onClick={handleAddDriver}>+ Add Driver</button>
      </div>

      {/* STATUS FILTER BAR */}
      <div className="driver-filter-bar">
        {ALL_STATUSES.map(s => {
          const meta = STATUS_META[s];
          return (
            <button
              key={s}
              className={`driver-filter-tab${filterStatus === s ? ' active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {meta && <span className="driver-filter-dot" style={{ background: meta.dot }} />}
              {s}
              <span className="driver-filter-count">{counts[s]}</span>
            </button>
          );
        })}
      </div>

      {/* TABLE */}
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Driver</th>
              <th>License</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Assigned Vehicle</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="driver-empty-state">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span>No drivers found{filterStatus !== 'All' ? ` with status "${filterStatus}"` : ''}.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map(driver => {
                const vehicle = vehicles.find(v => String(v.id) === String(driver.assigned_vehicle_id));
                const meta = STATUS_META[driver.availability] || { badge: 'b-returned', dot: '#94a3b8' };
                return (
                  <tr
                    key={driver.id}
                    onClick={() => handleEditDriver(driver)}
                    style={{ cursor: 'pointer' }}
                    className="admin-table-row-hover"
                  >
                    {/* Driver name + contact */}
                    <td>
                      <div className="driver-name-cell">
                        <DriverAvatar name={driver.name} />
                        <div>
                          <div className="driver-name">{driver.name || '—'}</div>
                          <div className="driver-contact">{driver.contact_number || 'No contact'}</div>
                        </div>
                      </div>
                    </td>

                    {/* License type badge + number */}
                    <td>
                      <span className="license-type-badge">{driver.license_type || '—'}</span>
                      <div className="license-number">{driver.license_number || '—'}</div>
                    </td>

                    {/* Expiry with warnings */}
                    <td><ExpiryCell expiry={driver.license_expiry} /></td>

                    {/* Availability status */}
                    <td>
                      <span className={`admin-badge ${meta.badge}`}>
                        {driver.availability || '—'}
                      </span>
                    </td>

                    {/* Assigned vehicle */}
                    <td>
                      {vehicle
                        ? <span className="vehicle-assign-chip">{vehicle.name}<span className="vehicle-chip-plate">{vehicle.plate_number}</span></span>
                        : <span className="unassigned-chip">Unassigned</span>
                      }
                    </td>

                    {/* Active status */}
                    <td>
                      <span className={`admin-badge ${driver.is_active_driver ? 'b-approved' : 'b-rejected'}`}>
                        {driver.is_active_driver ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <DriverProfileFormModal
          driver={selectedDriver}
          vehicles={vehicles}
          onSave={handleSaveDriver}
          onClose={() => { setShowModal(false); setSelectedDriver(null); }}
        />
      )}
    </div>
  );
}
