import { useState } from 'react'
import '../styles/UserForm.css'
import { supabase } from '../supabaseClient'
import { useNavigate } from 'react-router-dom'

const DEPARTMENTS = ['RD', 'ARDO', 'RPBDD', 'RECORDS', 'LEGAL', 'SPLIT UPTOWN', 'SPLIT DOWNTOWN', 'LTI/LTSP', 'SUPPLY', 'MOTORPOOL', 'COA', 'SPECIAL CONCERNS', 'LD', 'IU', 'RMIC', 'BUDGET/ACCOUNTING', 'CASHIER', 'FINANCE', 'GAD', 'DARAB',  'Other']
const PURPOSES = ['Official', 'Personal']

/* ── Icons ── */
const TruckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 17h14v-5H5v5z" /><path d="M5 12h14" /><path d="M19 17l3 3v-3" />
    <circle cx="7" cy="17" r="2" /><circle cx="17" cy="17" r="2" />
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
const LocationIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
)
const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)
const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4" /><path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
  </svg>
)

/* ── Main Component ── */
export default function DispatchForm() {
  const today = new Date().toISOString().split('T')[0]
  const getCurrentTime = () => {
    const now = new Date()
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  }
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    email: '',
    employeeName: '',
    department: '',
    passengerCount: 1,
    requestDate: today,
    departureTime: getCurrentTime(),
    returnDate: '',
    returnTime: '',
    origin: 'DAR Region 10',
    destination: '',
    purpose: '',
    purposeDetails: '',
    priority: 'Normal',
  })
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionDir, setTransitionDir]     = useState('forward')
  const [submitted, setSubmitted]       = useState(false)
  const [showSummary, setShowSummary]   = useState(false)
  const [status, setStatus]             = useState('Pending')
  const [errors, setErrors]             = useState({})
  const [toastMsg, setToastMsg]         = useState('')
  const [uploading, setUploading]       = useState(false)

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: '' }))
  }

  const validateStep = () => {
    let newErrors = {}
    if (step === 1) {
      if (!form.email)        newErrors.email        = 'Your email is required'
      if (!form.employeeName) newErrors.employeeName = 'Your name is required'
      if (!form.department)   newErrors.department   = 'Please select your department'
      if (!form.passengerCount || Number(form.passengerCount) < 1) newErrors.passengerCount = 'At least 1 passenger required';
    }
    if (step === 2) {
      if (!form.requestDate)    newErrors.requestDate    = 'Request date is required'
      if (!form.departureTime)  newErrors.departureTime  = 'Departure time is required'
    }
    if (step === 3) {
      if (!form.destination) newErrors.destination = 'Destination is required'
      if (!form.purpose)     newErrors.purpose     = 'Please select a purpose'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const canSubmit = form.email && form.employeeName && form.requestDate && form.destination

  function handleNext()   { if (!validateStep()) return; setStep(s => s + 1) }
  function handleSubmit() { if (!validateStep()) return; submitToSupabase() }

  function navigateWithCar(url, dir = 'forward') {
    if (isTransitioning) return
    setTransitionDir(dir)
    setIsTransitioning(true)
    setTimeout(() => navigate(url), 900)
  }

  // ── Back button: go home on step 1, previous step otherwise ──
  function handleBack() {
    if (step === 1) {
      navigateWithCar('/', 'back')
    } else {
      setStep(s => s - 1)
    }
  }

  const submitToSupabase = async () => {
    try {
      setUploading(true)

      let userId
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        userId = session.user.id
      } else {
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously()
        if (anonError) throw new Error(`Auth failed: ${anonError.message}`)
        userId = anonData.user.id
      }

      const startDt = new Date(`${form.requestDate}T${form.departureTime}`).toISOString()
      const endDt   = form.returnDate
        ? new Date(`${form.returnDate}T${form.returnTime || '17:00'}`).toISOString()
        : new Date(new Date(startDt).getTime() + 8 * 60 * 60 * 1000).toISOString()

      const { data: availableVehicles, error: vErr } = await supabase
        .from('vehicles')
        .select('id')
        .eq('is_available', true)
        .limit(1)

      if (vErr) throw vErr
      if (!availableVehicles || availableVehicles.length === 0) {
        throw new Error('No vehicles are currently available. Please contact the admin.')
      }
      const vehicleId = availableVehicles[0].id

      const notesPayload = [
        `Employee: ${form.employeeName}`,
        `Department: ${form.department}`,
        `Passengers: ${form.passengerCount} seater(s) needed`,
        `Priority: ${form.priority}`,
        form.purposeDetails ? `Details: ${form.purposeDetails}` : '',
      ].filter(Boolean).join('\n')

      const { error } = await supabase.from('vehicle_bookings').insert({
        user_id:        userId,
        vehicle_id:     vehicleId,
        email:          form.email,
        purpose:        form.purpose,
        destination:    form.destination,
        start_datetime: startDt,
        end_datetime:   endDt,
        status:         'Pending',
        admin_notes:    notesPayload,
      })

      if (error) throw error

      // ─── INSERT THE NEW CODE HERE ───
      try {
        await supabase.functions.invoke('notify-admin-booking', {
          body: {
            employeeName: form.employeeName,
            department: form.department,
            destination: form.destination,
            purpose: form.purpose,
            startDate: new Date(`${form.requestDate}T${form.departureTime}`).toLocaleString(),
          },
        })
      } catch (notifyError) {
        console.error('Admin notification failed:', notifyError)
        // We don't throw here so the user still sees their booking was successful
      }
      // ────────────────────────────────

      setStatus('Pending')
      setSubmitted(true)
      setShowSummary(true)
      setToastMsg('Request submitted successfully!')
      setTimeout(() => setToastMsg(''), 3000)

    } catch (err) {
      setToastMsg(`Error: ${err.message}`)
      setTimeout(() => setToastMsg(''), 3000)
    } finally {
      setUploading(false)
    }
  }

  function handleReset() {
    setForm({
      email: '', employeeName: '', department: '',
      requestDate: today, departureTime: getCurrentTime(),
      returnDate: '', returnTime: '',
      origin: 'DAR Region 10', destination: '',
      purpose: '', purposeDetails: '', priority: 'Normal',
    })
    setStep(1); setSubmitted(false); setShowSummary(false)
    setStatus('Pending'); setErrors({})
  }

  const steps = [
    { num: 1, label: 'Employee Info' },
    { num: 2, label: 'Schedule' },
    { num: 3, label: 'Destination & Purpose' },
  ]

  return (
    <>
    <div className="fd-page">
      <div className="fd-container-modern">

        {toastMsg && (
          <div style={{
            position: 'fixed', top: 20, right: 20,
            background: toastMsg.includes('Error') ? '#ef4444' : '#10b981',
            color: '#fff', padding: '12px 20px', borderRadius: 6, zIndex: 9999
          }}>{toastMsg}</div>
        )}

        {/* Header */}
        <header className="fd-header-modern">
          <div className="fd-header-left">
            <div className="fd-logo">
              <img src="/assets/images/Company_Logo.png" alt="DAR Logo" />
            </div>
            <div className="fd-header-info">
              <h1>Vehicle Request</h1>
              <span className="fd-date">
                {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
          <div className={`fd-status-badge ${status.toLowerCase()}`}>{status}</div>
        </header>

        {/* Stepper */}
        <div className="fd-stepper">
          {steps.map((s, i) => (
            <div key={s.num} className={`fd-step ${step >= s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
              <div className="fd-step-circle">{step > s.num ? <CheckIcon /> : s.num}</div>
              <span className="fd-step-label">{s.label}</span>
              {i < steps.length - 1 && <div className="fd-step-line" />}
            </div>
          ))}
        </div>

        {/* Success banner */}
        {submitted && (
          <div className="fd-success-banner">
            <CheckIcon />
            <span>Request submitted! Reference: <strong>REQ-{Date.now().toString().slice(-6)}</strong></span>
          </div>
        )}

        {/* Summary */}
        {showSummary && (
          <div className="fd-summary-card">
            <div className="fd-summary-header">
              <h2>Request Summary</h2>
              <span className="fd-ref">REF: REQ-{Date.now().toString().slice(-6)}</span>
            </div>
            <div className="fd-summary-grid">
              <div className="fd-summary-item"><span className="fd-summary-label">Email</span><span className="fd-summary-value">{form.email}</span></div>
              <div className="fd-summary-item"><span className="fd-summary-label">Employee Name</span><span className="fd-summary-value">{form.employeeName}</span></div>
              <div className="fd-summary-item"><span className="fd-summary-label">Department</span><span className="fd-summary-value">{form.department}</span></div>
              <div className="fd-summary-item"><span className="fd-summary-label">Request Date</span><span className="fd-summary-value">{form.requestDate}</span></div>
              <div className="fd-summary-item"><span className="fd-summary-label">Passengers</span><span className="fd-summary-value">{form.passengerCount}</span></div>
              <div className="fd-summary-item"><span className="fd-summary-label">Departure Time</span><span className="fd-summary-value">{form.departureTime}</span></div>
              <div className="fd-summary-item"><span className="fd-summary-label">Return Date</span><span className="fd-summary-value">{form.returnDate || '—'}</span></div>
              <div className="fd-summary-item"><span className="fd-summary-label">Return Time</span><span className="fd-summary-value">{form.returnTime || '—'}</span></div>
              <div className="fd-summary-item full"><span className="fd-summary-label">Origin</span><span className="fd-summary-value">{form.origin}</span></div>
              <div className="fd-summary-item full"><span className="fd-summary-label">Destination</span><span className="fd-summary-value">{form.destination}</span></div>
              <div className="fd-summary-item"><span className="fd-summary-label">Purpose</span><span className="fd-summary-value">{form.purpose}</span></div>
              <div className="fd-summary-item"><span className="fd-summary-label">Priority</span><span className={`fd-priority ${form.priority.toLowerCase()}`}>{form.priority}</span></div>
              <div className="fd-summary-item full"><span className="fd-summary-label">Purpose Details</span><span className="fd-summary-value">{form.purposeDetails || 'None'}</span></div>
            </div>
            <div className="fd-summary-actions">
              <button className="fd-btn fd-btn-outline" onClick={handleReset}>Fill Out Again</button>
              <button className="fd-btn fd-btn-primary" onClick={() => navigateWithCar('/', 'back')}>Close</button>
            </div>
          </div>
        )}

        {/* Form steps */}
        {!showSummary && (
          <div className="fd-form-content">

            {step === 1 && (
              <div className="fd-section">
                <div className="fd-section-header"><UserIcon /><h2>Employee Information</h2></div>
                <div className="fd-form-grid">
                  <div className="fd-field">
                    <label>Email Address</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="Enter your email address" className={errors.email ? 'error' : ''} />
                    {errors.email && <span className="fd-error">{errors.email}</span>}
                  </div>
                  <div className="fd-field">
                    <label>Employee Name</label>
                    <input type="text" value={form.employeeName} onChange={e => set('employeeName', e.target.value)} placeholder="Enter your full name" className={errors.employeeName ? 'error' : ''} />
                    {errors.employeeName && <span className="fd-error">{errors.employeeName}</span>}
                  </div>
                  <div className="fd-field">
                    <label>Office</label>
                    <select value={form.department} onChange={e => set('department', e.target.value)} className={errors.department ? 'error' : ''}>
                      <option value="">Select office</option>
                      {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    {errors.department && <span className="fd-error">{errors.department}</span>}
                  </div>
                  <div className="fd-field">
                    <label>No. of Passengers (Seaters Needed)</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="50"
                      value={form.passengerCount}
                      onChange={e => set('passengerCount', e.target.value)}
                      onBlur={e => set('passengerCount', Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                      className={errors.passengerCount ? 'error' : ''}
                    />
                    {errors.passengerCount && <span className="fd-error">{errors.passengerCount}</span>}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="fd-section">
                <div className="fd-section-header"><CalendarIcon /><h2>Request Schedule</h2></div>
                <div className="fd-form-grid">
                  <div className="fd-field">
                    <label>Request Date</label>
                    <input type="date" value={form.requestDate} onChange={e => set('requestDate', e.target.value)} className={errors.requestDate ? 'error' : ''} />
                    {errors.requestDate && <span className="fd-error">{errors.requestDate}</span>}
                  </div>
                  <div className="fd-field">
                    <label>Departure Time</label>
                    <input type="time" value={form.departureTime} onChange={e => set('departureTime', e.target.value)} className={errors.departureTime ? 'error' : ''} />
                    {errors.departureTime && <span className="fd-error">{errors.departureTime}</span>}
                  </div>
                  <div className="fd-field">
                    <label>Return Date (Optional)</label>
                    <input type="date" value={form.returnDate} onChange={e => set('returnDate', e.target.value)} />
                  </div>
                  <div className="fd-field">
                    <label>Return Time (Optional)</label>
                    <input type="time" value={form.returnTime} onChange={e => set('returnTime', e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="fd-section">
                <div className="fd-section-header"><LocationIcon /><h2>Destination & Purpose</h2></div>
                <div className="fd-form-grid">
                  <div className="fd-field">
                    <label>Origin / Base</label>
                    <div className="fd-fixed-value">DAR Region 10</div>
                  </div>
                  <div className="fd-field">
                    <label>Destination</label>
                    <input type="text" value={form.destination} onChange={e => set('destination', e.target.value)} placeholder="Enter your destination address" className={errors.destination ? 'error' : ''} />
                    {errors.destination && <span className="fd-error">{errors.destination}</span>}
                  </div>
                  <div className="fd-field">
                    <label>Purpose</label>
                    <select value={form.purpose} onChange={e => set('purpose', e.target.value)} className={errors.purpose ? 'error' : ''}>
                      <option value="">Select purpose</option>
                      {PURPOSES.map(p => <option key={p}>{p}</option>)}
                    </select>
                    {errors.purpose && <span className="fd-error">{errors.purpose}</span>}
                  </div>
                  <div className="fd-field">
                    <label>Priority Level</label>
                    <select value={form.priority} onChange={e => set('priority', e.target.value)}>
                      <option>Normal</option>
                      <option>Urgent</option>
                      <option>Scheduled</option>
                    </select>
                  </div>
                  <div className="fd-field full">
                    <label>Purpose Details (Optional)</label>
                    <textarea value={form.purposeDetails} onChange={e => set('purposeDetails', e.target.value)} placeholder="Provide additional details about your errand or trip..." rows={3} />
                  </div>


                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        {!showSummary && (
          <footer className="fd-footer-modern">
            <button className="fd-reset-circle" onClick={handleReset} title="Reset form">↺</button>

            {/* ── Fixed Back button: home on step 1, prev step otherwise ── */}
            <button className="fd-btn fd-btn-ghost" onClick={handleBack}>
              <ArrowLeftIcon /> Back
            </button>

            <div className="fd-footer-actions">
              {step < 3 && (
                <button className="fd-btn fd-btn-primary" onClick={handleNext}>
                  Next <ArrowRightIcon />
                </button>
              )}
              {step === 3 && (
                <button className="fd-btn fd-btn-primary" disabled={!canSubmit || uploading} onClick={handleSubmit}>
                  {uploading ? 'Submitting...' : 'Submit Request'} <CheckIcon />
                </button>
              )}
            </div>
          </footer>
        )}

      </div>
    </div>

      {/* Car flyby — outside page container so it always renders */}
      <div className={`fd-car-transition ${isTransitioning ? 'active' : ''} ${transitionDir === 'back' ? 'reverse' : ''}`} aria-hidden="true">
        <div className="fd-car-runner">
          <img src="/assets/images/car.png" alt="car" />
        </div>
      </div>
    </>
  )
}
