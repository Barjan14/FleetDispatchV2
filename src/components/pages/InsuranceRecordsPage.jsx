import React, { useState, useEffect } from 'react';
import { insuranceRecordService, vehicleService } from '../services/supabaseService';
import InsuranceRecordFormModal from '../components/modals/InsuranceRecordFormModal';
import './InsuranceRecordsPage.css';

const InsuranceRecordsPage = () => {
  const [insuranceRecords, setInsuranceRecords] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [filterActive, setFilterActive] = useState('All');

  useEffect(() => {
    loadInsuranceRecords();
    loadVehicles();
  }, []);

  const loadInsuranceRecords = async () => {
    try {
      const data = await insuranceRecordService.getAll();
      setInsuranceRecords(data);
    } catch (error) {
      console.error('Error loading insurance records:', error);
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

  const handleAddRecord = () => {
    setSelectedRecord(null);
    setShowModal(true);
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleSaveRecord = async (recordData) => {
    try {
      if (selectedRecord) {
        await insuranceRecordService.update(selectedRecord.id, recordData);
      } else {
        await insuranceRecordService.create(recordData);
      }
      loadInsuranceRecords();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving insurance record:', error);
    }
  };

  const filteredRecords = filterActive === 'All'
    ? insuranceRecords
    : filterActive === 'Active'
      ? insuranceRecords.filter(r => r.is_active)
      : insuranceRecords.filter(r => !r.is_active);

  return (
    <div className="insurance-container">
      <div className="insurance-header">
        <h1>Insurance Records</h1>
        <button className="btn-primary" onClick={handleAddRecord}>+ New Policy</button>
      </div>

      <div className="insurance-filters">
        {['All', 'Active', 'Inactive'].map(status => (
          <button
            key={status}
            className={`filter-btn ${filterActive === status ? 'active' : ''}`}
            onClick={() => setFilterActive(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <div className="insurance-table-container">
        <table className="insurance-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Provider</th>
              <th>Policy Number</th>
              <th>Coverage Type</th>
              <th>Start Date</th>
              <th>Expiry Date</th>
              <th>Premium</th>
              <th>Status</th>
              <th>Document</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map(record => (
              <tr key={record.id}>
                <td>{record.vehicles?.name}</td>
                <td>{record.provider}</td>
                <td>{record.policy_number}</td>
                <td>{record.coverage_type}</td>
                <td>{record.start_date ? new Date(record.start_date).toLocaleDateString() : '-'}</td>
                <td>{record.expiry_date ? new Date(record.expiry_date).toLocaleDateString() : '-'}</td>
                <td>${record.premium_amount?.toFixed(2)}</td>
                <td><span className={`status-badge ${record.is_active ? 'active' : 'inactive'}`}>{record.is_active ? 'Active' : 'Inactive'}</span></td>
                <td>
                  {record.document_url && (
                    <a href={record.document_url} target="_blank" rel="noopener noreferrer" className="doc-link">📄</a>
                  )}
                </td>
                <td>
                  <button className="btn-edit" onClick={() => handleEditRecord(record)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <InsuranceRecordFormModal
          record={selectedRecord}
          vehicles={vehicles}
          onSave={handleSaveRecord}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default InsuranceRecordsPage;
