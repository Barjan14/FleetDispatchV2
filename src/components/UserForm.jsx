import { useState } from 'react'
import '../styles/UserForm.css'

/* =========================
   VEHICLES & OPTIONS
   ========================= */
const VEHICLES = [
  { id: '', label: 'Select vehicle type' },
  { id: 'Cargo Truck', label: 'Cargo Truck' },
  { id: 'Delivery Van', label: 'Delivery Van' },
  { id: 'Flatbed', label: 'Flatbed' },
  { id: 'Refrigerated Van', label: 'Refrigerated Van' },
  { id: 'Passenger Van', label: 'Passenger Van' },
  { id: 'Sedan', label: 'Sedan' },
]

const PURPOSES = ['Official', 'Personal']
const DEPARTMENTS = ['Administration', 'Finance', 'HR', 'IT', 'Operations', 'Logistics', 'Marketing', 'Sales', 'Other']

/* =========================
   ICONS
   ========================= */
const TruckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 17h14v-5H5v5z" />
    <path d="M5 12h14" />
    <path d="M19 17l3 3v-3" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
  </svg>
)

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <path d="M5 12l5 5L20 7" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
)

const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
)

const ResetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
)

const LocationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
)

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
)

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
  </svg>
)

/* =========================
   MAIN FORM COMPONENT
   ========================= */

export default function DispatchForm() {
  const today = new Date().toISOString().split('T')[0]

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    email: '',
    employeeName: '',
    department: '',
    requestDate: today,
    departureTime: '08:00',
    returnDate: '',
    returnTime: '',
    origin: 'DAR Region 10',
    destination: '',
    purpose: '',
    purposeDetails: '',
    priority: 'Normal',
  })

  const [submitted, setSubmitted] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const [status, setStatus] = useState('Pending')
  const [errors, setErrors] = useState({})

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }
  const validateStep = () => {
    let newErrors = {}
    
    if (step === 1) {
      if (!form.email) newErrors.email = 'Your email is required'
      if (!form.employeeName) newErrors.employeeName = 'Your name is required'
      if (!form.department) newErrors.department = 'Please select your department'
    }

    if (step === 2) {
      if (!form.requestDate) newErrors.requestDate = 'Request date is required'
      if (!form.departureTime) newErrors.departureTime = 'Departure time is required'
    }

    if (step === 3) {
      if (!form.destination) newErrors.destination = 'Destination is required'
      if (!form.purpose) newErrors.purpose = 'Please select a purpose'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
  const canSubmit =
    form.email &&
    form.employeeName &&
    form.requestDate &&
    form.destination

  function handleNext() {
    if (!validateStep()) return
    setStep(s => s + 1)
  }

  function handleSubmit() {
    if (!validateStep()) return
    setStatus('Dispatched')
    setSubmitted(true)
    setShowSummary(true)
  }
  function handleReset() {
    setForm({
      email: '',
      employeeName: '',
      department: '',
      requestDate: today,
      departureTime: '08:00',
      returnDate: '',
      returnTime: '',
      origin: 'DAR Region 10',
      destination: '',
      purpose: '',
      purposeDetails: '',
      priority: 'Normal',
    })

    setStep(1)
    setSubmitted(false)
    setShowSummary(false)
    setStatus('Pending')
    setErrors({})
  }

  const steps = [
    { num: 1, label: 'Employee Info' },
    { num: 2, label: 'Schedule' },
    { num: 3, label: 'Destination & Purpose' },
  ]

  return (
    <div className="fd-page">
      <div className="fd-container-modern">
        
        {/* HEADER */}
        <header className="fd-header-modern">
          <div className="fd-header-left">
            <div className="fd-logo">
              <TruckIcon />
            </div>
            <div className="fd-header-info">
              <h1>Vehicle Request</h1>
              <span className="fd-date">{new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>
          <div className={`fd-status-badge ${status.toLowerCase()}`}>
            {status}
          </div>
        </header>

        {/* PROGRESS STEPPER */}
        <div className="fd-stepper">
          {steps.map((s, i) => (
            <div key={s.num} className={`fd-step ${step >= s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
              <div className="fd-step-circle">
                {step > s.num ? <CheckIcon /> : s.num}
              </div>
              <span className="fd-step-label">{s.label}</span>
              {i < steps.length - 1 && <div className="fd-step-line" />}
            </div>
          ))}
        </div>

        {/* SUCCESS BANNER */}
        {submitted && (
          <div className="fd-success-banner">
            <CheckIcon />
            <span>Request submitted successfully! Reference: <strong>REQ-{Date.now().toString().slice(-6)}</strong></span>
          </div>
        )}

        {/* SUMMARY CARD */}
        {showSummary && (
          <div className="fd-summary-card">
            <div className="fd-summary-header">
              <h2>Request Summary</h2>
              <span className="fd-ref">REF: REQ-{Date.now().toString().slice(-6)}</span>
            </div>            <div className="fd-summary-grid">
              <div className="fd-summary-item">
                <span className="fd-summary-label">Email Address</span>
                <span className="fd-summary-value">{form.email}</span>
              </div>
              <div className="fd-summary-item">
                <span className="fd-summary-label">Employee Name</span>
                <span className="fd-summary-value">{form.employeeName}</span>
              </div>
              <div className="fd-summary-item">
                <span className="fd-summary-label">Department</span>
                <span className="fd-summary-value">{form.department}</span>
              </div>
              <div className="fd-summary-item">
                <span className="fd-summary-label">Request Date</span>
                <span className="fd-summary-value">{form.requestDate}</span>
              </div>
              <div className="fd-summary-item">
                <span className="fd-summary-label">Departure Time</span>
                <span className="fd-summary-value">{form.departureTime}</span>
              </div>
              <div className="fd-summary-item">
                <span className="fd-summary-label">Return Date</span>
                <span className="fd-summary-value">{form.returnDate || '—'}</span>
              </div>
              <div className="fd-summary-item">
                <span className="fd-summary-label">Return Time</span>
                <span className="fd-summary-value">{form.returnTime || '—'}</span>
              </div>
              <div className="fd-summary-item full">
                <span className="fd-summary-label">Origin</span>
                <span className="fd-summary-value">{form.origin}</span>
              </div>
              <div className="fd-summary-item full">
                <span className="fd-summary-label">Destination</span>
                <span className="fd-summary-value">{form.destination}</span>
              </div>
              <div className="fd-summary-item">
                <span className="fd-summary-label">Purpose</span>
                <span className="fd-summary-value">{form.purpose}</span>
              </div>
              <div className="fd-summary-item">
                <span className="fd-summary-label">Priority</span>
                <span className={`fd-priority ${form.priority.toLowerCase()}`}>{form.priority}</span>
              </div>
              <div className="fd-summary-item full">
                <span className="fd-summary-label">Purpose Details</span>
                <span className="fd-summary-value">{form.purposeDetails || 'None'}</span>
              </div>
            </div>
            <div className="fd-summary-actions">
              <button className="fd-btn fd-btn-outline" onClick={handleReset}>
                Fill Out Again
              </button>
              <button className="fd-btn fd-btn-primary" onClick={() => window.location.href = '/'}>
                Close Request Form
              </button>
            </div>
          </div>
        )}

        {/* FORM CONTENT */}
        {!showSummary && (
          <div className="fd-form-content">
              {/* STEP 1: Employee Info */}
            {step === 1 && (
              <div className="fd-section">
                <div className="fd-section-header">
                  <UserIcon />
                  <h2>Employee Information</h2>
                </div>
                
                <div className="fd-form-grid">
                  <div className="fd-field">
                    <label>Email Address</label>
                    <input 
                      type="email"
                      value={form.email}
                      onChange={e => set('email', e.target.value)}
                      placeholder="Enter your email address"
                      className={errors.email ? 'error' : ''}
                    />
                    {errors.email && <span className="fd-error">{errors.email}</span>}
                  </div>

                  <div className="fd-field">
                    <label>Employee Name</label>
                    <input 
                      type="text"
                      value={form.employeeName}
                      onChange={e => set('employeeName', e.target.value)}
                      placeholder="Enter your full name"
                      className={errors.employeeName ? 'error' : ''}
                    />
                    {errors.employeeName && <span className="fd-error">{errors.employeeName}</span>}
                  </div>

                  <div className="fd-field">
                    <label>Department</label>
                    <select 
                      value={form.department}
                      onChange={e => set('department', e.target.value)}
                      className={errors.department ? 'error' : ''}
                    >
                      <option value="">Select department</option>
                      {DEPARTMENTS.map(d => (
                        <option key={d}>{d}</option>
                      ))}
                    </select>
                    {errors.department && <span className="fd-error">{errors.department}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Schedule */}
            {step === 2 && (
              <div className="fd-section">
                <div className="fd-section-header">
                  <CalendarIcon />
                  <h2>Request Schedule</h2>
                </div>
                
                <div className="fd-form-grid">
                  <div className="fd-field">
                    <label>Request Date</label>
                    <input 
                      type="date"
                      value={form.requestDate}
                      onChange={e => set('requestDate', e.target.value)}
                      className={errors.requestDate ? 'error' : ''}
                    />
                    {errors.requestDate && <span className="fd-error">{errors.requestDate}</span>}
                  </div>

                  <div className="fd-field">
                    <label>Departure Time</label>
                    <input 
                      type="time"
                      value={form.departureTime}
                      onChange={e => set('departureTime', e.target.value)}
                      className={errors.departureTime ? 'error' : ''}
                    />
                    {errors.departureTime && <span className="fd-error">{errors.departureTime}</span>}
                  </div>

                  <div className="fd-field">
                    <label>Return Date (Optional)</label>
                    <input 
                      type="date"
                      value={form.returnDate}
                      onChange={e => set('returnDate', e.target.value)}
                    />
                  </div>

                  <div className="fd-field">
                    <label>Return Time (Optional)</label>
                    <input 
                      type="time"
                      value={form.returnTime}
                      onChange={e => set('returnTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Destination & Purpose */}
            {step === 3 && (
              <div className="fd-section">
                <div className="fd-section-header">
                  <LocationIcon />
                  <h2>Destination & Purpose</h2>
                </div>
                
                <div className="fd-form-grid">
                  <div className="fd-field">
                    <label>Origin / Base</label>
                    <div className="fd-fixed-value">DAR Region 10</div>
                  </div>

                  <div className="fd-field">
                    <label>Destination</label>
                    <input 
                      type="text"
                      value={form.destination}
                      onChange={e => set('destination', e.target.value)}
                      placeholder="Enter your destination address"
                      className={errors.destination ? 'error' : ''}
                    />
                    {errors.destination && <span className="fd-error">{errors.destination}</span>}
                  </div>

                  <div className="fd-field">
                    <label>Purpose</label>
                    <select 
                      value={form.purpose}
                      onChange={e => set('purpose', e.target.value)}
                      className={errors.purpose ? 'error' : ''}
                    >
                      <option value="">Select purpose</option>
                      {PURPOSES.map(p => (
                        <option key={p}>{p}</option>
                      ))}
                    </select>
                    {errors.purpose && <span className="fd-error">{errors.purpose}</span>}
                  </div>

                  <div className="fd-field">
                    <label>Priority Level</label>
                    <select 
                      value={form.priority}
                      onChange={e => set('priority', e.target.value)}
                    >
                      <option>Normal</option>
                      <option>Urgent</option>
                      <option>Scheduled</option>
                    </select>
                  </div>

                  <div className="fd-field full">
                    <label>Purpose Details (Optional)</label>
                    <textarea 
                      value={form.purposeDetails}
                      onChange={e => set('purposeDetails', e.target.value)}
                      placeholder="Provide additional details about your errand or trip..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}        {/* FOOTER */}
        {!showSummary && (
          <footer className="fd-footer-modern">
            <button 
              className="fd-reset-circle"
              onClick={handleReset}
              title="Reset form"
            >
              ↺
            </button>

            <button 
              className="fd-btn fd-btn-ghost"
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              <ArrowLeftIcon />
              Back
            </button>

            <div className="fd-footer-actions">
              {step < 3 && (
                <button className="fd-btn fd-btn-primary" onClick={handleNext}>
                  Next
                  <ArrowRightIcon />
                </button>
              )}

              {step === 3 && (
                <button 
                  className="fd-btn fd-btn-primary"
                  disabled={!canSubmit}
                  onClick={handleSubmit}
                >
                  Submit Request
                  <CheckIcon />
                </button>
              )}
            </div>
          </footer>
        )}

      </div>
    </div>
  )
}