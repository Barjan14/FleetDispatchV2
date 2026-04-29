import React, { useState } from 'react';

// Compacted SVG Icons (scaled down slightly from 24px to 20px)
const Icons = {
  Car: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>,
  User: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  CheckCircle: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  BarChart: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"></line><line x1="18" y1="20" x2="18" y2="4"></line><line x1="6" y1="20" x2="6" y2="16"></line></svg>,
  ChevronLeft: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg>,
  ChevronRight: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
};

// Department Colors for Calendar Legend
const getDeptColor = (dept) => {
  const colors = {
    'IT': '#3b82f6',        // Blue
    'HR': '#10b981',        // Emerald
    'Sales': '#f59e0b',     // Amber
    'Logistics': '#8b5cf6', // Purple
    'Executive': '#ec4899', // Pink
  };
  return colors[dept] || '#64748b'; // Gray fallback
};

export default function OverviewPage({ stats = {}, bookings = [], vehicles = [], drivers = [], onNavigate }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Safe navigation helper
  const goTo = (tab) => {
    if (onNavigate) onNavigate(tab);
  };

  // Calculations for Top Boxes
  const availableVehicles = vehicles.filter(v => v.is_available).length;
  const inUseVehicles = vehicles.length - availableVehicles;
  const availableDrivers = drivers.filter(d => d.availability === 'Available').length;
  const completedTrips = bookings.filter(b => b.status === 'Returned' || b.status === 'Completed').length;

  // Condition Calculations for the Bar Graph
  const goodCondition = vehicles.filter(v => v.condition === 'Good').length;
  const fairCondition = vehicles.filter(v => v.condition === 'Fair').length;
  const repairCondition = vehicles.filter(v => v.condition !== 'Good' && v.condition !== 'Fair').length; 

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Determines if calendar needs 5 or 6 rows to fit the days
  const totalSlots = firstDayOfMonth + daysInMonth > 35 ? 42 : 35;

  const getBookingsForDay = (day) => {
    const targetDate = new Date(year, month, day).setHours(0,0,0,0);
    return bookings.filter(b => {
      if (!b.start_datetime || !b.end_datetime) return false;
      const start = new Date(b.start_datetime).setHours(0,0,0,0);
      const end = new Date(b.end_datetime).setHours(0,0,0,0);
      return targetDate >= start && targetDate <= end;
    });
  };

  return (
    // ✅ STRICT HEIGHT ENFORCEMENT: Reduced gaps, added boxSizing and overflow hidden.
    <div style={{ padding: '0 20px 16px 20px', display: 'flex', flexDirection: 'column', gap: '12px', height: 'calc(100vh - 90px)', boxSizing: 'border-box', overflow: 'hidden' }}>
      
      {/* ================= 1. TOP 4 DASHBOARD BOXES ================= */}
      {/* ✅ COMPACTED: Shorter height, smaller gaps */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', flexShrink: 0 }}>
        
        {/* Box 1: Available Vehicles */}
        <div 
          className="admin-card" 
          onClick={() => goTo('vehicles')}
          style={{ margin: 0, padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '4px solid #10b981', cursor: 'pointer' }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icons.Car /></div>
          <div>
            <div className="admin-muted-sm" style={{ fontWeight: '700', letterSpacing: '0.05em', fontSize: '10px' }}>AVAILABLE VEHICLES</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>{availableVehicles} <span style={{ fontSize: '12px', color: '#94a3b8' }}>/ {vehicles.length}</span></div>
          </div>
        </div>

        {/* Box 2: Available Drivers */}
        <div 
          className="admin-card" 
          onClick={() => goTo('drivers')}
          style={{ margin: 0, padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '4px solid #3b82f6', cursor: 'pointer' }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icons.User /></div>
          <div>
            <div className="admin-muted-sm" style={{ fontWeight: '700', letterSpacing: '0.05em', fontSize: '10px' }}>AVAILABLE DRIVERS</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>{availableDrivers} <span style={{ fontSize: '12px', color: '#94a3b8' }}>/ {drivers.length}</span></div>
          </div>
        </div>

        {/* Box 3: Booked Completed */}
        <div 
          className="admin-card" 
          onClick={() => goTo('logs')}
          style={{ margin: 0, padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '4px solid #8b5cf6', cursor: 'pointer' }}
        >
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: '#f5f3ff', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icons.CheckCircle /></div>
          <div>
            <div className="admin-muted-sm" style={{ fontWeight: '700', letterSpacing: '0.05em', fontSize: '10px' }}>COMPLETED TRIPS</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', lineHeight: '1' }}>{completedTrips}</div>
          </div>
        </div>

        {/* Box 4: Vehicle Condition Bar Graph */}
        <div 
          className="admin-card" 
          onClick={() => goTo('vehicles')}
          style={{ margin: 0, padding: '8px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#64748b' }}>
            <span className="admin-muted-sm" style={{ fontWeight: '700', letterSpacing: '0.05em', fontSize: '10px' }}>VEHICLE CONDITION</span>
            <Icons.BarChart />
          </div>
          {vehicles.length > 0 ? (
            <>
              <div style={{ display: 'flex', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '4px' }}>
                <div style={{ width: `${(goodCondition / vehicles.length) * 100}%`, backgroundColor: '#10b981' }} title="Good" />
                <div style={{ width: `${(fairCondition / vehicles.length) * 100}%`, backgroundColor: '#f59e0b' }} title="Fair" />
                <div style={{ width: `${(repairCondition / vehicles.length) * 100}%`, backgroundColor: '#ef4444' }} title="Repair" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: '700' }}>
                <span style={{ color: '#10b981' }}>{goodCondition} Good</span>
                <span style={{ color: '#d97706' }}>{fairCondition} Fair</span>
                <span style={{ color: '#dc2626' }}>{repairCondition} Rep</span>
              </div>
            </>
          ) : (
            <div className="admin-muted-sm" style={{ fontStyle: 'italic', fontSize: '11px' }}>No data</div>
          )}
        </div>

      </div>

      {/* ================= 2. CALENDAR & WIDGETS ================= */}
      <div style={{ display: 'flex', gap: '12px', flex: 1, minHeight: 0 }}>
        
        {/* LEFT: CALENDAR MODULE */}
        <div className="admin-card" style={{ margin: 0, flex: 3, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          
          <div className="admin-card-header" style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button className="admin-btn admin-btn-outline" style={{ padding: '2px 6px' }} onClick={() => setCurrentDate(new Date(year, month - 1, 1))}><Icons.ChevronLeft /></button>
              <h3 style={{ margin: 0, minWidth: '110px', textAlign: 'center', fontSize: '14px' }}>{monthNames[month]} {year}</h3>
              <button className="admin-btn admin-btn-outline" style={{ padding: '2px 6px' }} onClick={() => setCurrentDate(new Date(year, month + 1, 1))}><Icons.ChevronRight /></button>
            </div>
            
            {/* Calendar Legend */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['IT', 'HR', 'Sales', 'Logistics', 'Executive'].map(dept => (
                <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: '700', color: '#64748b' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getDeptColor(dept) }} /> {dept}
                </div>
              ))}
            </div>
          </div>
          
          {/* Calendar Body Grid */}
          <div style={{ padding: '8px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', paddingBottom: '4px', flexShrink: 0 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="admin-muted-sm" style={{ fontWeight: '800', fontSize: '11px' }}>{day}</div>
              ))}
            </div>

            {/* ✅ COMPACTED: Reduced gaps and padding inside cells so 6 rows don't overflow */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: `repeat(${totalSlots / 7}, 1fr)`, gap: '4px', flex: 1, minHeight: 0 }}>
              {Array.from({ length: totalSlots }).map((_, i) => {
                const dayNumber = i - firstDayOfMonth + 1;
                const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
                const isToday = isCurrentMonth && new Date().setHours(0,0,0,0) === new Date(year, month, dayNumber).setHours(0,0,0,0);
                
                if (!isCurrentMonth) {
                  return <div key={`empty-${i}`} style={{ borderRadius: '4px', backgroundColor: '#f8fafc', border: '1px solid #f1f5f9' }} />;
                }

                const dayBookings = getBookingsForDay(dayNumber);

                return (
                  <div key={dayNumber} style={{ padding: '4px', borderRadius: '4px', border: isToday ? '2px solid #006205' : '1px solid #e2e8f0', backgroundColor: isToday ? '#f0fdf4' : '#ffffff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <span style={{ fontSize: '11px', fontWeight: isToday ? '900' : '700', color: isToday ? '#006205' : '#334155' }}>
                      {dayNumber}
                    </span>
                    
                    {/* Booking Dots (Slightly smaller, showing fewer to save vertical space) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '2px' }}>
                      {dayBookings.slice(0, 4).map((b, index) => {
                        const dept = b.department || b.user?.department || 'Unknown';
                        return (
                          <div key={index} title={`${dept}: ${b.purpose || 'Trip'}`} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getDeptColor(dept) }} />
                        );
                      })}
                      {dayBookings.length > 4 && <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 'bold', lineHeight: '6px' }}>+</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: INSIGHT WIDGETS */}
        {/* ✅ COMPACTED: Scaled down fonts and paddings on the right sidebar */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
          
          <div className="admin-card" style={{ margin: 0, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className="admin-card-header" style={{ backgroundColor: '#f8fafc', padding: '8px 12px', flexShrink: 0 }}>
              <h3 style={{ fontSize: '12px', margin: 0 }}>Needs Attention</h3>
            </div>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minHeight: 0 }}>
              
              <div 
                onClick={() => goTo('bookings')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', cursor: 'pointer' }}
              >
                <div>
                  <div className="admin-bold" style={{ color: '#92400e', fontSize: '13px' }}>Pending Approvals</div>
                  <div className="admin-muted-sm" style={{ color: '#b45309', fontSize: '11px' }}>Awaiting review</div>
                </div>
                <h2 style={{ margin: 0, color: '#d97706', fontSize: '24px' }}>{stats.pendingBookings || 0}</h2>
              </div>
            </div>
          </div>

          <div className="admin-card" style={{ margin: 0, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div className="admin-card-header" style={{ backgroundColor: '#f8fafc', padding: '8px 12px', flexShrink: 0 }}>
              <h3 style={{ fontSize: '12px', margin: 0 }}>Live Operations</h3>
            </div>
            <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minHeight: 0 }}>
              
              <div 
                onClick={() => goTo('fleets')}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', cursor: 'pointer' }}
              >
                <div>
                  <div className="admin-bold" style={{ color: '#1e40af', fontSize: '13px' }}>Ongoing Trips</div>
                  <div className="admin-muted-sm" style={{ color: '#2563eb', fontSize: '11px' }}>On the road</div>
                </div>
                <h2 style={{ margin: 0, color: '#3b82f6', fontSize: '24px' }}>{stats.ongoingBookings || 0}</h2>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}