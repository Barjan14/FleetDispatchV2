import React, { useState } from 'react';
import '../styles/UserDashboard.css';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('request');
  const [formData, setFormData] = useState({
    purpose: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    additionalNotes: '',
  });
  const [submissions, setSubmissions] = useState([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    try {
      // Combine date and time
      const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

      const response = await fetch('http://localhost:8000/api/user/bookings/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          purpose: formData.purpose,
          start_datetime: startDateTime.toISOString(),
          end_datetime: endDateTime.toISOString(),
          admin_notes: formData.additionalNotes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmissions([...submissions, data]);
        setFormData({
          purpose: '',
          startDate: '',
          startTime: '',
          endDate: '',
          endTime: '',
          additionalNotes: '',
        });
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      } else {
        alert('Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Error submitting request');
    }
  };

  return (
    <div className="user-dashboard">
      {/* Header */}
      <header className="user-dashboard-header">
        <div className="header-content">
          <h1>User Dashboard</h1>
          <p className="user-greeting">Welcome, {user.username || 'User'}!</p>
        </div>
        <button className="logout-btn" onClick={() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/';
        }}>
          Logout
        </button>
      </header>

      {/* Navigation Tabs */}
      <nav className="user-nav-tabs">
        <button
          className={`nav-tab ${activeTab === 'request' ? 'active' : ''}`}
          onClick={() => setActiveTab('request')}
        >
          📋 New Request
        </button>
        <button
          className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          📜 My Requests
        </button>
      </nav>

      {/* Main Content */}
      <main className="user-dashboard-content">
        {activeTab === 'request' && (
          <section className="request-section">
            <div className="section-header">
              <h2>Request Vehicle Booking</h2>
              <p>Fill out the form below to request a vehicle. Your request will be reviewed by an admin.</p>
            </div>

            {submitSuccess && (
              <div className="success-message">
                ✅ Request submitted successfully! Your booking is pending admin approval.
              </div>
            )}

            <form className="request-form" onSubmit={handleSubmitRequest}>
              {/* Purpose */}
              <div className="form-group">
                <label htmlFor="purpose" className="form-label">Purpose of Request *</label>
                <textarea
                  id="purpose"
                  name="purpose"
                  className="form-input textarea"
                  placeholder="Describe the purpose of your vehicle request..."
                  value={formData.purpose}
                  onChange={handleInputChange}
                  required
                  rows="4"
                />
              </div>

              {/* Date and Time - Start */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate" className="form-label">Start Date *</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    className="form-input"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="startTime" className="form-label">Start Time *</label>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    className="form-input"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Date and Time - End */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="endDate" className="form-label">End Date *</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    className="form-input"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="endTime" className="form-label">End Time *</label>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    className="form-input"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Additional Notes */}
              <div className="form-group">
                <label htmlFor="additionalNotes" className="form-label">Additional Notes</label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  className="form-input textarea"
                  placeholder="Any additional information for the admin..."
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              {/* Submit Button */}
              <button type="submit" className="submit-btn">
                📤 Submit Request
              </button>
            </form>
          </section>
        )}

        {activeTab === 'history' && (
          <section className="history-section">
            <div className="section-header">
              <h2>My Booking Requests</h2>
              <p>View all your vehicle booking requests and their status.</p>
            </div>

            {submissions.length === 0 ? (
              <div className="empty-state">
                <p>📭 No requests yet</p>
                <p className="empty-state-subtitle">Submit your first vehicle booking request above.</p>
              </div>
            ) : (
              <div className="requests-list">
                {submissions.map((request, index) => (
                  <div key={index} className="request-card">
                    <div className="request-header">
                      <h3>Request #{index + 1}</h3>
                      <span className={`status-badge ${request.status?.toLowerCase() || 'pending'}`}>
                        {request.status || 'Pending'}
                      </span>
                    </div>
                    <div className="request-details">
                      <p><strong>Purpose:</strong> {request.purpose}</p>
                      <p><strong>Start:</strong> {new Date(request.start_datetime).toLocaleString()}</p>
                      <p><strong>End:</strong> {new Date(request.end_datetime).toLocaleString()}</p>
                      {request.admin_notes && (
                        <p><strong>Admin Notes:</strong> {request.admin_notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;