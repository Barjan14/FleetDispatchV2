import React, { useState } from 'react';
import DriverProfileFormModal from '../modals/DriverProfileFormModal';
import { supabase } from '../../supabaseClient'; 

export default function DriversPage({ 
  drivers = [], 
  fleets = [], 
  vehicles = [], 
  onRefresh 
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [filterAvailability, setFilterAvailability] = useState('All');

  const handleAddDriver = () => {
    setSelectedDriver(null);
    setShowModal(true);
  };

  const handleEditDriver = (driver) => {
    setSelectedDriver(driver);
    setShowModal(true);
  };

  const handleSaveDriver = async (driverData) => {
    try {
      const cleanedData = { ...driverData };
      
      const fieldsToNullify = [
        'assigned_fleet_id', 'assigned_vehicle_id', 
        'license_expiry', 'date_of_birth', 'contact_number',
        'emergency_contact', 'address', 'notes'
      ];

      fieldsToNullify.forEach(field => {
        if (cleanedData[field] === '' || cleanedData[field] === undefined) {
          cleanedData[field] = null;
        }
      });

      delete cleanedData.email;
      delete cleanedData.password;

      let error;
      if (selectedDriver) {
        const res = await supabase.from('driver_profiles').update(cleanedData).eq('id', selectedDriver.id);
        error = res.error;
      } else {
        const res = await supabase.from('driver_profiles').insert([cleanedData]);
        error = res.error;
      }

      if (error) throw error;
      if (onRefresh) onRefresh();
      
      setShowModal(false);
      setSelectedDriver(null);
    } catch (error) {
      console.error('Error saving driver:', error);
      alert(`Save failed: ${error.message}`);
    }
  };

  const filteredDrivers = filterAvailability === 'All'
    ? drivers
    : drivers.filter((d) => d.availability === filterAvailability);

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h3>
          Driver Profiles
          <span className="admin-count">{drivers.length}</span>
        </h3>
        <button className="admin-btn admin-btn-primary" onClick={handleAddDriver}>
          + Add Driver
        </button>
      </div>

      {/* FILTERS */}
      <div style={{ padding: '10px' }}>
        {['All', 'Available', 'On Trip', 'On Leave', 'Off Duty', 'Suspended'].map(status => (
          <button
            key={status}
            className={`admin-btn ${filterAvailability === status ? 'admin-btn-primary' : 'admin-btn-outline'}`}
            onClick={() => setFilterAvailability(status)}
            style={{ marginRight: '8px', marginBottom: '8px' }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <div className="admin-table-scroll">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>License Type</th>
              <th>License Expiry</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Vehicle</th>
              <th>Fleet</th>
              <th>Active</th>
              {/* REMOVED: <th>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan={9} className="admin-empty">No drivers found.</td>
              </tr>
            ) : (
              filteredDrivers.map((driver) => {
                // Find assigned vehicle and fleet names
                const assignedVehicle = vehicles.find((v) => String(v.id) === String(driver.assigned_vehicle_id));
                const assignedFleet = fleets.find((f) => String(f.id) === String(driver.assigned_fleet_id));

                return (
              <tr 
                key={driver.id} 
                onClick={() => handleEditDriver(driver)}
                style={{ cursor: 'pointer' }}
                className="admin-table-row-hover"
              >
                <td className="admin-bold">{driver.name || '—'}</td>
                <td className="admin-muted">{driver.license_type || '—'}</td>
                <td className="admin-muted-sm">
                  {driver.license_expiry ? new Date(driver.license_expiry).toLocaleDateString() : '—'}
                </td>
                <td className="admin-muted-sm">{driver.contact_number || '—'}</td>
                <td>
                  <span className={`admin-badge ${
                    driver.availability === 'Available' ? 'b-approved'
                    : driver.availability === 'On Trip' ? 'b-ongoing'
                    : driver.availability === 'Suspended' ? 'b-rejected'
                    : 'b-pending'
                  }`}>
                    {driver.availability}
                  </span>
                </td>
                <td className="admin-muted-sm">{assignedVehicle?.name || '—'}</td>
                <td className="admin-muted-sm">{assignedFleet?.name || '—'}</td>
                <td>{driver.is_active_driver ? '✓' : '✗'}</td>
                {/* REMOVED: <td className="admin-actions">...</td> */}
              </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <DriverProfileFormModal
          driver={selectedDriver}
          fleets={fleets}
          vehicles={vehicles}
          onSave={handleSaveDriver}
          onClose={() => {
            setShowModal(false);
            setSelectedDriver(null);
          }}
        />
      )}
    </div>
  );
}