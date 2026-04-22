import React, { useState, useEffect } from 'react';
import { safetyCheckService, vehicleService } from '../services/supabaseService';
import SafetyCheckFormModal from '../components/modals/SafetyCheckFormModal';
import './SafetyChecksPage.css';

const SafetyChecksPage = () => {
  const [safetyChecks, setSafetyChecks] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [filterResult, setFilterResult] = useState('All');

  useEffect(() => {
    loadSafetyChecks();
    loadVehicles();
  }, []);

  const loadSafetyChecks = async () => {
    try {
      const data = await safetyCheckService.getAll();
      setSafetyChecks(data);
    } catch (error) {
      console.error('Error loading safety checks:', error);
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

  const handleAddCheck = () => {
    setSelectedCheck(null);
    setShowModal(true);
  };

  const handleEditCheck = (check) => {
    setSelectedCheck(check);
    setShowModal(true);
  };

  const handleSaveCheck = async (checkData) => {
    try {
      if (selectedCheck) {
        await safetyCheckService.update(selectedCheck.id, checkData);
      } else {
        await safetyCheckService.create(checkData);
      }
      loadSafetyChecks();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving safety check:', error);
    }
  };

  const filteredChecks = filterResult === 'All'
    ? safetyChecks
    : safetyChecks.filter(c => c.result === filterResult);

  return (
    <div className="safety-checks-container">
      <div className="safety-header">
        <h1>Safety Checks</h1>
        <button className="btn-primary" onClick={handleAddCheck}>+ New Check</button>
      </div>

      <div className="safety-filters">
        {['All', 'Passed', 'Failed', 'Pending'].map(result => (
          <button
            key={result}
            className={`filter-btn ${filterResult === result ? 'active' : ''}`}
            onClick={() => setFilterResult(result)}
          >
            {result}
          </button>
        ))}
      </div>

      <div className="safety-table-container">
        <table className="safety-table">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Check Date</th>
              <th>Next Due Date</th>
              <th>Result</th>
              <th>Checked By</th>
              <th>Notes</th>
              <th>Document</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredChecks.map(check => (
              <tr key={check.id}>
                <td>{check.vehicles?.name}</td>
                <td>{check.check_date ? new Date(check.check_date).toLocaleDateString() : '-'}</td>
                <td>{check.next_due_date ? new Date(check.next_due_date).toLocaleDateString() : '-'}</td>
                <td><span className={`status-badge ${check.result.toLowerCase()}`}>{check.result}</span></td>
                <td>{check.checked_by || 'N/A'}</td>
                <td>{check.notes}</td>
                <td>
                  {check.document_url && (
                    <a href={check.document_url} target="_blank" rel="noopener noreferrer" className="doc-link">📄</a>
                  )}
                </td>
                <td>
                  <button className="btn-edit" onClick={() => handleEditCheck(check)}>Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <SafetyCheckFormModal
          check={selectedCheck}
          vehicles={vehicles}
          onSave={handleSaveCheck}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default SafetyChecksPage;
