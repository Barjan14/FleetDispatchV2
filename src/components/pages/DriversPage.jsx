import React, { useState, useEffect } from 'react';
import { driverProfileService, fleetService, vehicleService } from '../services/supabaseService';
import DriverProfileFormModal from '../components/modals/DriverProfileFormModal';
import './DriversPage.css';

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
      setDrivers(data);
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  };

  const loadFleets = async () => {
    try {
      const data = await fleetService.getAll();
      setFleets(data);
    } catch (error) {
      console.error('Error loading fleets:', error);
    }
  };

  const loadVehicles = async () => {
    try {
      const data = await vehicleService.getAll();
      setVehicles(data);
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
      if (selectedDriver) {
        await driverProfileService.update(selectedDriver.id, driverData);
      } else {
        await driverProfileService.create(driverData);
      }
      loadDrivers();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving driver:', error);
    }
  };

  const filteredDrivers = filterAvailability === 'All'
    ? drivers
    : drivers.filter(d => d.availability === filterAvailability);

  return (
    <div className="drivers-container">
      <div className="drivers-header">
        <h1>Driver Profiles</h1>
        <button className="btn-primary" onClick={handleAddDriver}>+ Add Driver</button>
      </div>

      <div className="drivers-filters">
        {['All', 'Available', 'On Trip', 'On Leave', 'Off Duty', 'Suspended'].map(status => (
          <button
            key={status}
            className={`filter-btn ${filterAvailability === status ? 'active' : ''}`}
            onClick={() => setFilterAvailability(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="drivers-table-container">
        <table className="drivers-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>License Type</th>
              <th>License Expiry</th>
              <th>Contact</th>
              <th>Availability</th>
              <th>Assigned Vehicle</th>
              <th>Fleet</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.map(driver => {
              const assignedVehicle = vehicles.find(v => v.id === driver.assigned_vehicle_id);
              const assignedFleet = fleets.find(f => f.id === driver.assigned_fleet_id);
              
              return (
                <tr key={driver.id}>
                  <td>{driver.contact_number || 'N/A'}</td>
                  <td>{driver.license_type || 'N/A'}</td>
                  <td>{driver.license_expiry ? new Date(driver.license_expiry).toLocaleDateString() : '-'}</td>
                  <td>{driver.contact_number}</td>
                  <td><span className={`status-badge ${driver.availability.toLowerCase().replace(' ', '-')}`}>{driver.availability}</span></td>
                  <td>{assignedVehicle?.name || 'Unassigned'}</td>
                  <td>{assignedFleet?.name || 'Unassigned'}</td>
                  <td>{driver.is_active_driver ? '✓' : '✗'}</td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEditDriver(driver)}>Edit</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <DriverProfileFormModal
          driver={selectedDriver}
          fleets={fleets}
          vehicles={vehicles}
          onSave={handleSaveDriver}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default DriversPage;
