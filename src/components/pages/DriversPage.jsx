import React, { useState, useEffect } from 'react';
import { driverProfileService, fleetService, vehicleService } from '../../services/supabaseService';
import DriverProfileFormModal from '../modals/DriverProfileFormModal';

const DriversPage = () => {
  const [drivers, setDrivers] = useState([]);
  const [fleets, setFleets] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [filterAvailability, setFilterAvailability] = useState('All');

  useEffect(() => {
    loadDrivers();
    loadFleets();
    loadVehicles();
  }, []);

  const loadDrivers = async () => {
    try {
      const data = await driverProfileService.getAll();
      setDrivers(data || []);
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  };

  const loadFleets = async () => {
    try {
      const data = await fleetService.getAll();
      setFleets(data || []);
    } catch (error) {
      console.error('Error loading fleets:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getAll();
      setVehicles(data || []);
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

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
      // --- DATA CLEANUP STEP (FIXES THE 400 ERROR) ---
      // We create a copy and ensure empty strings are converted to NULL
      // so the database doesn't reject them as "invalid format".
      const cleanedData = { ...driverData };
      
      const fieldsToNullify = [
        'assigned_fleet_id', 
        'assigned_vehicle_id', 
        'license_expiry', 
        'date_of_birth',
        'contact_number',
        'emergency_contact',
        'address',
        'notes'
      ];

      fieldsToNullify.forEach(field => {
        if (cleanedData[field] === '' || cleanedData[field] === undefined) {
          cleanedData[field] = null;
        }
      });

      // Remove any auth fields that might have leaked in from old state
      delete cleanedData.email;
      delete cleanedData.password;
      // ----------------------------------------------

      if (selectedDriver) {
        await driverProfileService.update(selectedDriver.id, cleanedData);
      } else {
        await driverProfileService.create(cleanedData);
      }

      await loadDrivers();
      setShowModal(false);
      setSelectedDriver(null);
    } catch (error) {
      console.error('Error saving driver:', error);
      alert(`Save failed: ${error.message || 'Check browser console for details'}`);
    }
  };

  const filteredDrivers =
    filterAvailability === 'All'
      ? drivers
      : drivers.filter((d) => d.availability === filterAvailability);

  return (
    <div className="admin-card">

      {/* HEADER */}
      <div className="admin-card-header">
        <h3>
          Driver Profiles
          <span className="admin-count">{drivers.length}</span>
        </h3>

        <button
          className="admin-btn admin-btn-primary"
          onClick={handleAddDriver}
        >
          + Add Driver
        </button>
      </div>

      {/* FILTERS */}
      <div style={{ padding: '10px' }}>
        {['All', 'Available', 'On Trip', 'On Leave', 'Off Duty', 'Suspended'].map(status => (
          <button
            key={status}
            className={`admin-btn ${
              filterAvailability === status
                ? 'admin-btn-primary'
                : 'admin-btn-outline'
            }`}
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
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredDrivers.length === 0 && (
              <tr>
                <td colSpan={9} className="admin-empty">
                  No drivers found.
                </td>
              </tr>
            )}

            {filteredDrivers.map((driver) => {
              const assignedVehicle = vehicles.find(
                (v) => v.id === driver.assigned_vehicle_id
              );
              const assignedFleet = fleets.find(
                (f) => f.id === driver.assigned_fleet_id
              );

              return (
                <tr key={driver.id}>
                  <td className="admin-bold">
                    {driver.name || '—'}
                  </td>

                  <td className="admin-muted">
                    {driver.license_type || '—'}
                  </td>

                  <td className="admin-muted-sm">
                    {driver.license_expiry
                      ? new Date(driver.license_expiry).toLocaleDateString()
                      : '—'}
                  </td>

                  <td className="admin-muted-sm">
                    {driver.contact_number || '—'}
                  </td>

                  <td>
                    <span
                      className={`admin-badge ${
                        driver.availability === 'Available'
                          ? 'b-approved'
                          : driver.availability === 'On Trip'
                          ? 'b-ongoing'
                          : driver.availability === 'Suspended'
                          ? 'b-rejected'
                          : 'b-pending'
                      }`}
                    >
                      {driver.availability}
                    </span>
                  </td>

                  <td className="admin-muted-sm">
                    {assignedVehicle?.name || '—'}
                  </td>

                  <td className="admin-muted-sm">
                    {assignedFleet?.name || '—'}
                  </td>

                  <td>
                    {driver.is_active_driver ? '✓' : '✗'}
                  </td>

                  <td className="admin-actions">
                    <button
                      className="admin-btn admin-btn-warning"
                      onClick={() => handleEditDriver(driver)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
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
};

export default DriversPage;