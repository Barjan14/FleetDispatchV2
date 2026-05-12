import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../supabaseClient';

// ── Icons ──────────────────────────────────────────────────────────────────
const Icons = {
  Car:     () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>,
  User:    () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Check:   () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
  Bar:     () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>,
  Prev:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>,
  Next:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
  Wallet:  () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
  X:       () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Pin:     () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  Clock:   () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  UserSm:  () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  CarSm:   () => <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>,
  Alert:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Cal:     () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  Road:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h10l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17" r="2.5"/><circle cx="16.5" cy="17" r="2.5"/></svg>,
  ArrowUp: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>,
  ArrowDn: () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>,
  Target:  () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
};

// ── Constants ──────────────────────────────────────────────────────────────
const STATUS_CFG = {
  Pending:   { label: 'Pending',   cls: 'b-pending',  chipBg: '#fef3c7', chipColor: '#92400e', dot: '#f59e0b' },
  Approved:  { label: 'Scheduled', cls: 'b-approved', chipBg: '#dcfce7', chipColor: '#15803d', dot: '#16a34a' },
  Ongoing:   { label: 'On Trip',   cls: 'b-ongoing',  chipBg: '#fef3c7', chipColor: '#92400e', dot: '#d97706' },
  Returned:  { label: 'Returned',  cls: 'b-returned', chipBg: '#f1f5f9', chipColor: '#475569', dot: '#94a3b8' },
  Completed: { label: 'Returned',  cls: 'b-returned', chipBg: '#f1f5f9', chipColor: '#475569', dot: '#94a3b8' },
  Rejected:  { label: 'Rejected',  cls: 'b-out',      chipBg: '#fee2e2', chipColor: '#b91c1c', dot: '#ef4444' },
};

const DEPT_COLORS = { IT: '#3b82f6', HR: '#10b981', Sales: '#f59e0b', Logistics: '#8b5cf6', Executive: '#ec4899' };
const getDeptColor = (d) => DEPT_COLORS[d] || '#64748b';

const fmt    = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ── Helpers ────────────────────────────────────────────────────────────────
function extractName(b) {
  if (b.admin_notes) {
    const m = b.admin_notes.match(/Employee:\s*(.*?)(?=\s*(?:Dep:|Dept:|Department:|Plate:|Plate No:|$))/i);
    if (m?.[1]) return m[1].trim();
  }
  return b.employee_name || b.name || b.user?.name || '—';
}
function extractDept(b) {
  return b.department || b.position || b.user?.profile?.department || b.user?.department || '';
}
function fmtTime(dt) {
  if (!dt) return '';
  return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function overdueFor(endDt) {
  const diff = Date.now() - new Date(endDt).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h === 0) return `${m}m overdue`;
  if (h < 24)  return `${h}h${m > 0 ? ` ${m}m` : ''} overdue`;
  return `${Math.floor(h / 24)}d overdue`;
}

// ── Sub-components ─────────────────────────────────────────────────────────
function StatusChip({ count, cfg }) {
  if (!count) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize: '9px', fontWeight: 800, lineHeight: '1', color: cfg.chipColor, background: cfg.chipBg, border: `1px solid ${cfg.dot}33`, borderRadius: '4px', padding: '1px 3px' }}>
      <span style={{ width: 4, height: 4, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {count}
    </span>
  );
}

function BookingRow({ b }) {
  const dept = extractDept(b);
  const name = extractName(b);
  const sc   = STATUS_CFG[b.status] || { label: b.status, cls: '', dot: '#94a3b8' };
  return (
    <div style={{ padding: '7px 9px', borderRadius: '7px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '3px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 700, fontSize: '12px', color: '#0f172a', minWidth: 0 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: getDeptColor(dept), flexShrink: 0 }} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</span>
        </div>
        <span className={`admin-badge ${sc.cls}`} style={{ fontSize: '10px', padding: '1px 6px', flexShrink: 0 }}>{sc.label}</span>
      </div>
      {(b.vehicle?.name || b.driver?.name) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '11px', color: '#64748b', paddingLeft: '12px' }}>
          {b.vehicle?.name && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Icons.CarSm /> {b.vehicle.name}</span>}
          {b.driver?.name  && <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}><Icons.UserSm /> {b.driver.name}</span>}
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#94a3b8', paddingLeft: '12px' }}>
        {b.destination
          ? <span style={{ display: 'flex', alignItems: 'center', gap: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}><Icons.Pin />{b.destination}</span>
          : <span style={{ fontStyle: 'italic' }}>{b.purpose || 'No destination'}</span>
        }
        {b.start_datetime && <span style={{ display: 'flex', alignItems: 'center', gap: '3px', flexShrink: 0 }}><Icons.Clock />{fmtTime(b.start_datetime)}</span>}
      </div>
    </div>
  );
}

function DaySection({ title, items, accentColor }) {
  if (!items.length) return null;
  return (
    <div>
      <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.07em', color: accentColor, marginBottom: '5px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
        {title} <span style={{ fontWeight: 600, color: '#94a3b8', fontSize: '10px', letterSpacing: 0, textTransform: 'none' }}>({items.length})</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {items.map(b => <BookingRow key={b.id} b={b} />)}
      </div>
    </div>
  );
}

// Compact trip row for Today's Schedule
function TripRow({ b, mode }) {
  const name = extractName(b);
  const time = mode === 'depart' ? fmtTime(b.start_datetime) : fmtTime(b.end_datetime);
  const Icon = mode === 'depart' ? Icons.ArrowUp : Icons.ArrowDn;
  const timeColor = mode === 'depart' ? '#15803d' : '#d97706';
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px', minWidth: '48px', flexShrink: 0, fontWeight: 800, fontSize: '10.5px', color: timeColor, paddingTop: '1px' }}>
        <Icon />{time}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: '11.5px', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {b.vehicle?.name || 'Vehicle'}
        </div>
        <div style={{ fontSize: '10.5px', color: '#94a3b8', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }}>{name}</span>
          {b.destination && (
            <span style={{ display: 'flex', alignItems: 'center', gap: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '90px' }}>
              <Icons.Pin />{b.destination}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function OverviewPage({ stats = {}, bookings = [], vehicles = [], drivers = [], onNavigate }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [finances, setFinances]       = useState({ fuel: 0, maint: 0, repair: 0, total: 0 });

  const goTo = (tab) => { if (onNavigate) onNavigate(tab); };

  // ── Financial live fetch (current month only) ─────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const now   = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        const [fR, mR, rR] = await Promise.all([
          supabase.from('fuel_records').select('total_cost').gte('date', start).lte('date', end),
          supabase.from('maintenance_costs').select('amount').gte('date', start).lte('date', end),
          supabase.from('repair_records').select('repair_cost').gte('date_reported', start).lte('date_reported', end),
        ]);
        const fuel   = (fR.data || []).reduce((a, r) => a + Number(r.total_cost  || 0), 0);
        const maint  = (mR.data || []).reduce((a, r) => a + Number(r.amount      || 0), 0);
        const repair = (rR.data || []).reduce((a, r) => a + Number(r.repair_cost || 0), 0);
        setFinances({ fuel, maint, repair, total: fuel + maint + repair });
      } catch (e) { console.error('Financial overview error', e); }
    };
    load();
    const ch = supabase.channel('overview-finances-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fuel_records' },       load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_costs' },  load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'repair_records' },     load)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  // ── Core computed values ───────────────────────────────────────────────
  const availableVehicles = vehicles.filter(v =>  v.is_available).length;
  const onTripVehicles    = vehicles.filter(v => !v.is_available).length;
  const availableDrivers  = drivers.filter(d => d.availability === 'Available').length;
  const onTripDrivers     = drivers.filter(d => d.availability === 'On Trip').length;
  const goodVehicles      = vehicles.filter(v => v.condition === 'Good').length;
  const fairVehicles      = vehicles.filter(v => v.condition === 'Fair').length;
  const repairVehicles    = vehicles.filter(v => v.condition !== 'Good' && v.condition !== 'Fair').length;

  // This month's completed trips
  const thisMonthCompleted = useMemo(() => {
    const now = new Date();
    return bookings.filter(b => {
      if (b.status !== 'Returned' && b.status !== 'Completed') return false;
      const d = new Date(b.end_datetime);
      return !isNaN(d) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [bookings]);

  // Vehicles currently on the road
  const activeTrips = useMemo(() => bookings.filter(b => b.status === 'Ongoing'), [bookings]);

  // OVERDUE: Ongoing past their scheduled end_datetime
  const overdueBookings = useMemo(() =>
    bookings.filter(b => b.status === 'Ongoing' && b.end_datetime && new Date(b.end_datetime) < new Date()),
    [bookings]
  );

  // Today's departures (Approved, scheduled to depart today)
  const todayDepartures = useMemo(() => {
    const start = new Date(); start.setHours(0,0,0,0);
    const end   = new Date(); end.setHours(23,59,59,999);
    return bookings
      .filter(b => b.status === 'Approved' && b.start_datetime && new Date(b.start_datetime) >= start && new Date(b.start_datetime) <= end)
      .sort((a, b) => new Date(a.start_datetime) - new Date(b.start_datetime));
  }, [bookings]);

  // Today's expected returns (Ongoing, end_datetime is today)
  const todayReturns = useMemo(() => {
    const start = new Date(); start.setHours(0,0,0,0);
    const end   = new Date(); end.setHours(23,59,59,999);
    return bookings
      .filter(b => b.status === 'Ongoing' && b.end_datetime && new Date(b.end_datetime) >= start && new Date(b.end_datetime) <= end)
      .sort((a, b) => new Date(a.end_datetime) - new Date(b.end_datetime));
  }, [bookings]);

  const upcomingTrips = bookings.filter(b => b.status === 'Approved').length;

  // ── Calendar ───────────────────────────────────────────────────────────
  const year            = currentDate.getFullYear();
  const month           = currentDate.getMonth();
  const daysInMonth     = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const totalSlots      = firstDayOfMonth + daysInMonth > 35 ? 42 : 35;
  const todayFlat       = new Date().setHours(0,0,0,0);
  const realNow         = new Date();
  const isViewingCurrentMonth = year === realNow.getFullYear() && month === realNow.getMonth();

  const getBookingsForDay = (day) => {
    const target = new Date(year, month, day).setHours(0,0,0,0);
    return bookings.filter(b => {
      if (!b.start_datetime || !b.end_datetime) return false;
      const s = new Date(b.start_datetime).setHours(0,0,0,0);
      const e = new Date(b.end_datetime).setHours(0,0,0,0);
      return target >= s && target <= e;
    });
  };

  // ── Day detail ─────────────────────────────────────────────────────────
  const selIsToday = selectedDay &&
    todayFlat === new Date(selectedDay.year, selectedDay.month, selectedDay.day).setHours(0,0,0,0);

  const selectedDayBookings = useMemo(() => {
    if (!selectedDay) return [];
    const target = new Date(selectedDay.year, selectedDay.month, selectedDay.day).setHours(0,0,0,0);
    return bookings.filter(b => {
      if (!b.start_datetime) return false;
      const s = new Date(b.start_datetime).setHours(0,0,0,0);
      const e = b.end_datetime ? new Date(b.end_datetime).setHours(0,0,0,0) : s;
      return target >= s && target <= e;
    });
  }, [selectedDay, bookings]);

  const pendingBks  = selectedDayBookings.filter(b => b.status === 'Pending');
  const approvedBks = selectedDayBookings.filter(b => b.status === 'Approved');
  const ongoingBks  = selectedDayBookings.filter(b => b.status === 'Ongoing');
  const returnedBks = selectedDayBookings.filter(b => b.status === 'Returned' || b.status === 'Completed');

  const handleDayClick = (dayNum) => {
    if (selectedDay?.day === dayNum && selectedDay?.month === month && selectedDay?.year === year)
      setSelectedDay(null);
    else
      setSelectedDay({ day: dayNum, month, year });
  };

  const jumpToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  // ── Hover helpers (stat cards) ─────────────────────────────────────────
  const hoverIn  = (e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(2,6,23,0.10)'; };
  const hoverOut = (e) => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = ''; };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '20px 20px 16px 20px', display: 'flex', flexDirection: 'column', gap: '10px', height: 'calc(100vh - 90px)', boxSizing: 'border-box', overflow: 'hidden' }}>

      {/* ── 1. STAT CARDS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', flexShrink: 0 }}>

        {/* Available Vehicles */}
        <div className="admin-card" onClick={() => goTo('vehicles')} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
          style={{ margin: 0, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '4px solid #006205', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: '#dcfce7', color: '#006205', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icons.Car /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, letterSpacing: '0.05em', fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase' }}>Available Vehicles</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
              {availableVehicles} <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>/ {vehicles.length}</span>
            </div>
            <div style={{ fontSize: '10.5px', color: onTripVehicles > 0 ? '#d97706' : '#94a3b8', fontWeight: 600, marginTop: '1px' }}>
              {onTripVehicles > 0 ? `${onTripVehicles} currently on trip` : 'All available'}
            </div>
          </div>
        </div>

        {/* Available Drivers */}
        <div className="admin-card" onClick={() => goTo('drivers')} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
          style={{ margin: 0, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '4px solid #006205', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: '#dcfce7', color: '#006205', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icons.User /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, letterSpacing: '0.05em', fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase' }}>Available Drivers</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>
              {availableDrivers} <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>/ {drivers.length}</span>
            </div>
            <div style={{ fontSize: '10.5px', color: onTripDrivers > 0 ? '#d97706' : '#94a3b8', fontWeight: 600, marginTop: '1px' }}>
              {onTripDrivers > 0 ? `${onTripDrivers} on trip` : 'All available'}
            </div>
          </div>
        </div>

        {/* This month's completed trips */}
        <div className="admin-card" onClick={() => goTo({ tab: 'bookings', filter: 'completed' })} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
          style={{ margin: 0, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px', borderLeft: '4px solid #94a3b8', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}>
          <div style={{ width: 40, height: 40, borderRadius: '10px', backgroundColor: '#f1f5f9', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Icons.Check /></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, letterSpacing: '0.05em', fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase' }}>Completed Trips</div>
            <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', lineHeight: 1.1 }}>{thisMonthCompleted}</div>
            <div style={{ fontSize: '10.5px', color: '#94a3b8', fontWeight: 600, marginTop: '1px' }}>
              {SHORT_MONTHS[realNow.getMonth()]} {realNow.getFullYear()}
            </div>
          </div>
        </div>

        {/* Vehicle Condition */}
        <div className="admin-card" onClick={() => goTo('vehicles')} onMouseEnter={hoverIn} onMouseLeave={hoverOut}
          style={{ margin: 0, padding: '10px 14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', borderLeft: repairVehicles > 0 ? '4px solid #ef4444' : '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
            <span style={{ fontWeight: 700, letterSpacing: '0.05em', fontSize: '9.5px', color: '#64748b', textTransform: 'uppercase' }}>Vehicle Condition</span>
            <Icons.Bar />
          </div>
          {vehicles.length > 0 ? (
            <>
              <div style={{ display: 'flex', height: '7px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden', marginBottom: '5px', gap: '1px' }}>
                {goodVehicles   > 0 && <div style={{ flex: goodVehicles,   backgroundColor: '#10b981', transition: 'flex 0.3s' }} />}
                {fairVehicles   > 0 && <div style={{ flex: fairVehicles,   backgroundColor: '#f59e0b', transition: 'flex 0.3s' }} />}
                {repairVehicles > 0 && <div style={{ flex: repairVehicles, backgroundColor: '#ef4444', transition: 'flex 0.3s' }} />}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontWeight: 700 }}>
                <span style={{ color: '#10b981' }}>{goodVehicles} Good</span>
                <span style={{ color: '#d97706' }}>{fairVehicles} Fair</span>
                <span style={{ color: '#dc2626' }}>{repairVehicles} Rep</span>
              </div>
              {repairVehicles > 0 && (
                <div style={{ fontSize: '10px', color: '#b91c1c', fontWeight: 700, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Icons.Alert /> {repairVehicles} need{repairVehicles === 1 ? 's' : ''} attention
                </div>
              )}
            </>
          ) : (
            <div style={{ fontStyle: 'italic', fontSize: '11px', color: '#94a3b8' }}>No vehicles</div>
          )}
        </div>

      </div>

      {/* ── 2. CURRENTLY ACTIVE STRIP ── */}
      {activeTrips.length > 0 && (
        <div onClick={() => goTo('fleets')} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', background: 'linear-gradient(90deg, #004a1f 0%, #006205 100%)', borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #006205', boxShadow: '0 1px 6px rgba(0,98,5,0.22)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 14px', background: 'rgba(0,0,0,0.18)', flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#fdd117', boxShadow: '0 0 6px #fdd117', animation: 'ovPulse 1.6s ease-in-out infinite', display: 'inline-block' }} />
            <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#ffffff', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{activeTrips.length} ON THE ROAD</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', overflowX: 'auto', scrollbarWidth: 'none' }}>
            {activeTrips.map(b => (
              <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', padding: '3px 10px 3px 8px', border: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
                <Icons.Road />
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#f0fdf4', whiteSpace: 'nowrap' }}>{b.vehicle?.name || 'Vehicle'}</span>
                {b.driver?.name && <span style={{ fontSize: '10.5px', color: '#bbf7d0', whiteSpace: 'nowrap' }}>· {b.driver.name}</span>}
                {b.destination && <>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '10px' }}>→</span>
                  <span style={{ fontSize: '10.5px', color: '#dcfce7', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.destination}</span>
                </>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. CALENDAR + MISSION CONTROL ── */}
      <div style={{ display: 'flex', gap: '12px', flex: 1, minHeight: 0 }}>

        {/* ── CALENDAR ── */}
        <div className="admin-card" style={{ margin: 0, flex: 3, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

          {/* Header */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button className="admin-btn admin-btn-outline" style={{ padding: '2px 6px' }}
                onClick={() => { setCurrentDate(new Date(year, month - 1, 1)); setSelectedDay(null); }}
              ><Icons.Prev /></button>
              <h3 style={{ margin: 0, minWidth: '115px', textAlign: 'center', fontSize: '14px' }}>{MONTHS[month]} {year}</h3>
              <button className="admin-btn admin-btn-outline" style={{ padding: '2px 6px' }}
                onClick={() => { setCurrentDate(new Date(year, month + 1, 1)); setSelectedDay(null); }}
              ><Icons.Next /></button>
              {/* Jump to today — only shown when viewing a different month */}
              {!isViewingCurrentMonth && (
                <button onClick={jumpToToday} style={{ fontSize: '10.5px', fontWeight: 700, color: '#006205', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', padding: '3px 9px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  Today
                </button>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              {[{ label: 'Pending', color: '#f59e0b' }, { label: 'Scheduled', color: '#16a34a' }, { label: 'On Trip', color: '#d97706' }, { label: 'Returned', color: '#94a3b8' }]
                .map(({ label, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, color: '#64748b' }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: color }} />{label}
                  </div>
                ))}
              {selectedDay && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', color: '#006205', fontWeight: 700, borderLeft: '1px solid #e2e8f0', paddingLeft: '10px' }}>
                  <Icons.Cal />
                  {new Date(selectedDay.year, selectedDay.month, selectedDay.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} selected
                  <button onClick={() => setSelectedDay(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 1px', color: '#94a3b8', display: 'flex', alignItems: 'center' }}><Icons.X /></button>
                </div>
              )}
            </div>
          </div>

          {/* Day headers */}
          <div style={{ padding: '5px 8px 2px', flexShrink: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center' }}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                <div key={d} style={{ fontWeight: 800, fontSize: '10.5px', color: '#94a3b8', letterSpacing: '0.04em' }}>{d}</div>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div style={{ padding: '3px 8px 8px', flex: 1, minHeight: 0 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridTemplateRows: `repeat(${totalSlots / 7}, 1fr)`, gap: '3px', height: '100%' }}>
              {Array.from({ length: totalSlots }).map((_, i) => {
                const dayNum  = i - firstDayOfMonth + 1;
                const inMonth = dayNum > 0 && dayNum <= daysInMonth;

                if (!inMonth) return <div key={`ph-${i}`} style={{ borderRadius: '6px' }} />;

                const isToday    = todayFlat === new Date(year, month, dayNum).setHours(0,0,0,0);
                const isSelected = selectedDay?.day === dayNum && selectedDay?.month === month && selectedDay?.year === year;
                const dayBks     = getBookingsForDay(dayNum);
                const total      = dayBks.length;
                const counts     = {
                  pending:  dayBks.filter(b => b.status === 'Pending').length,
                  approved: dayBks.filter(b => b.status === 'Approved').length,
                  ongoing:  dayBks.filter(b => b.status === 'Ongoing').length,
                  returned: dayBks.filter(b => b.status === 'Returned' || b.status === 'Completed').length,
                };

                // Has overdue booking on this day?
                const hasOverdue = dayBks.some(b => b.status === 'Ongoing' && b.end_datetime && new Date(b.end_datetime) < new Date());

                let bg = '#ffffff', border = '1px solid #e8edf5', numColor = '#334155', numWeight = 600;
                if (isToday && isSelected)       { bg = '#ecfdf5'; border = '2px solid #006205'; }
                else if (isToday)                { bg = '#f0fdf4'; border = '2px solid #006205'; }
                else if (isSelected)             { bg = '#f0fdf4'; border = '2px solid #006205'; }
                else if (hasOverdue)             { bg = '#fff7f7'; border = '1px solid #fca5a5'; }
                else if (total > 0)              { bg = '#fafcff'; border = '1px solid #d1fae5'; }
                if (isToday || isSelected)       { numColor = '#006205'; numWeight = 900; }
                else if (total > 0)              { numWeight = 700; }

                const tooltip = total > 0
                  ? `${MONTHS[month]} ${dayNum}: ${counts.pending ? counts.pending + ' pending ' : ''}${counts.approved ? counts.approved + ' scheduled ' : ''}${counts.ongoing ? counts.ongoing + ' on trip ' : ''}${counts.returned ? counts.returned + ' returned' : ''}${hasOverdue ? ' ⚠ OVERDUE' : ''}`.trim()
                  : `${MONTHS[month]} ${dayNum}`;

                return (
                  <div key={dayNum} title={tooltip} onClick={() => handleDayClick(dayNum)}
                    onMouseEnter={e => { if (!isSelected && !isToday) { e.currentTarget.style.backgroundColor = '#f1f5f9'; e.currentTarget.style.borderColor = '#94a3b8'; } }}
                    onMouseLeave={e => { if (!isSelected && !isToday) { e.currentTarget.style.backgroundColor = hasOverdue ? '#fff7f7' : total > 0 ? '#fafcff' : '#ffffff'; e.currentTarget.style.borderColor = hasOverdue ? '#fca5a5' : total > 0 ? '#dde5f5' : '#e8edf5'; } }}
                    style={{ padding: '3px 4px', borderRadius: '6px', border, backgroundColor: bg, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer', transition: 'background 0.1s, border-color 0.1s', overflow: 'hidden', minHeight: 0 }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '11.5px', fontWeight: numWeight, color: numColor, lineHeight: 1 }}>{dayNum}</span>
                      {total > 0 && (
                        <span style={{ fontSize: '8px', fontWeight: 800, lineHeight: '1', color: (isToday || isSelected) ? '#006205' : hasOverdue ? '#b91c1c' : '#64748b', background: (isToday || isSelected) ? '#dcfce7' : hasOverdue ? '#fee2e2' : '#f1f5f9', borderRadius: '10px', padding: '1px 4px' }}>
                          {total}
                        </span>
                      )}
                    </div>
                    {total > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', marginTop: '2px' }}>
                        <StatusChip count={counts.pending}  cfg={STATUS_CFG.Pending}  />
                        <StatusChip count={counts.approved} cfg={STATUS_CFG.Approved} />
                        <StatusChip count={counts.ongoing}  cfg={STATUS_CFG.Ongoing}  />
                        <StatusChip count={counts.returned} cfg={STATUS_CFG.Returned} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {!selectedDay && (
            <div style={{ padding: '3px 12px 5px', borderTop: '1px solid #f1f5f9', flexShrink: 0, textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: '#cbd5e1', fontStyle: 'italic' }}>Click any date to view booking details</span>
            </div>
          )}
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          flex: 1, minHeight: 0,
          display: 'flex', flexDirection: 'column', gap: '10px',
          overflowY: selectedDay ? 'hidden' : 'auto',
        }}>

          {selectedDay ? (
            /* ── DAY DETAIL PANEL ── */
            <div className="admin-card" style={{ margin: 0, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
              <div style={{ padding: '10px 12px', borderBottom: '1px solid #e2e8f0', flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                      {new Date(selectedDay.year, selectedDay.month, selectedDay.day).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      {selectedDay.year} · {selectedDayBookings.length} booking{selectedDayBookings.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {selIsToday && <span style={{ fontSize: '10px', fontWeight: 700, color: '#006205', background: '#dcfce7', border: '1px solid #86efac', borderRadius: '20px', padding: '2px 8px' }}>Today</span>}
                    <button onClick={() => setSelectedDay(null)} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', padding: '4px 6px', display: 'flex', alignItems: 'center', color: '#64748b' }}><Icons.X /></button>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedDayBookings.length === 0 ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', paddingTop: '24px' }}>
                    <Icons.Cal />
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8' }}>No bookings on this day</div>
                  </div>
                ) : (
                  <>
                    {selIsToday && pendingBks.length > 0 && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.07em', color: '#92400e', textTransform: 'uppercase', marginBottom: '5px', background: '#fef9c3', padding: '4px 8px', borderRadius: '6px', border: '1px solid #fde68a' }}>
                          <Icons.Alert /> Awaiting Approval ({pendingBks.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {pendingBks.map(b => <BookingRow key={b.id} b={b} />)}
                        </div>
                      </div>
                    )}
                    <DaySection title="Scheduled"  items={approvedBks} accentColor="#15803d" />
                    <DaySection title="On Trip"    items={ongoingBks}  accentColor="#d97706" />
                    <DaySection title="Returned"   items={returnedBks} accentColor="#475569" />
                    {!selIsToday && pendingBks.length > 0 && <DaySection title="Pending" items={pendingBks} accentColor="#92400e" />}
                  </>
                )}
              </div>

              {selectedDayBookings.length > 0 && (
                <div style={{ padding: '8px 12px', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
                  <button onClick={() => goTo('bookings')} style={{ width: '100%', padding: '6px', fontSize: '11.5px', fontWeight: 700, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', cursor: 'pointer', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <Icons.Cal /> View all in Bookings
                  </button>
                </div>
              )}
            </div>

          ) : (
            /* ── MISSION CONTROL ── */
            <>

              {/* ① OVERDUE ALERT — shown only when vehicles are past their return time */}
              {overdueBookings.length > 0 && (
                <div className="admin-card" onClick={() => goTo('fleets')} style={{ margin: 0, flexShrink: 0, cursor: 'pointer', border: '1px solid #fca5a5', background: '#fff1f2', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 12px', background: '#fee2e2', borderBottom: '1px solid #fca5a5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icons.Alert />
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#b91c1c', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                      {overdueBookings.length} Vehicle{overdueBookings.length > 1 ? 's' : ''} Overdue
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#dc2626', fontWeight: 600 }}>→ Fleets</span>
                  </div>
                  <div style={{ padding: '6px 12px 8px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {overdueBookings.map(b => (
                      <div key={b.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontWeight: 700, fontSize: '12px', color: '#0f172a' }}>{b.vehicle?.name || 'Vehicle'}</span>
                          {b.driver?.name && <span style={{ fontSize: '11px', color: '#64748b' }}> · {b.driver.name}</span>}
                        </div>
                        <span style={{ fontSize: '10.5px', fontWeight: 800, color: '#b91c1c', whiteSpace: 'nowrap', background: '#fee2e2', padding: '1px 6px', borderRadius: '10px', border: '1px solid #fca5a5' }}>
                          {overdueFor(b.end_datetime)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ② TODAY'S SCHEDULE */}
              <div className="admin-card" style={{ margin: 0, flexShrink: 0, overflow: 'hidden' }}>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Icons.Target />
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>Today's Schedule</span>
                  </div>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>
                    {realNow.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <div style={{ padding: '8px 12px 10px' }}>
                  {todayDepartures.length === 0 && todayReturns.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '12px 0', fontSize: '11.5px', color: '#cbd5e1', fontStyle: 'italic' }}>No departures or returns scheduled today</div>
                  ) : (
                    <>
                      {todayDepartures.length > 0 && (
                        <div style={{ marginBottom: todayReturns.length > 0 ? '10px' : 0 }}>
                          <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icons.ArrowUp /> Departures ({todayDepartures.length})
                          </div>
                          {todayDepartures.map(b => <TripRow key={b.id} b={b} mode="depart" />)}
                        </div>
                      )}
                      {todayReturns.length > 0 && (
                        <div>
                          <div style={{ fontSize: '9.5px', fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Icons.ArrowDn /> Returns Due ({todayReturns.length})
                          </div>
                          {todayReturns.map(b => <TripRow key={b.id} b={b} mode="return" />)}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* ③ DISPATCH OPERATIONS */}
              <div className="admin-card" style={{ margin: 0, flexShrink: 0, overflow: 'hidden' }}>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>Dispatch Operations</span>
                </div>
                <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {[
                    { label: 'Pending Approvals', sub: 'Awaiting review',   count: stats.pendingBookings || 0, bg: '#fffbeb', border: '#fde68a', color: '#92400e', num: '#d97706', tab: 'bookings' },
                    { label: 'Scheduled Trips',   sub: 'Ready for dispatch', count: upcomingTrips,             bg: '#f0fdf4', border: '#bbf7d0', color: '#166534', num: '#16a34a', tab: 'fleets'   },
                    { label: 'Ongoing Trips',     sub: 'On the road',        count: stats.ongoingBookings || 0, bg: '#fffbeb', border: '#fde68a', color: '#92400e', num: '#d97706', tab: 'fleets'   },
                  ].map(({ label, sub, count, bg, border, color, num, tab }) => (
                    <div key={label} onClick={() => goTo(tab)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', backgroundColor: bg, border: `1px solid ${border}`, borderRadius: '8px', cursor: 'pointer' }}>
                      <div>
                        <div style={{ fontWeight: 700, color, fontSize: '12.5px', lineHeight: 1.2 }}>{label}</div>
                        <div style={{ fontSize: '10.5px', color, opacity: 0.75 }}>{sub}</div>
                      </div>
                      <span style={{ fontSize: '20px', fontWeight: 900, color: num, lineHeight: 1 }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ④ FINANCIAL SUMMARY */}
              <div className="admin-card" onClick={() => goTo('financial')} style={{ margin: 0, flexShrink: 0, cursor: 'pointer', overflow: 'hidden' }}>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>Financial Summary</span>
                    <span style={{ marginLeft: '7px', fontSize: '10px', fontWeight: 700, color: '#475569', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '20px', padding: '1px 7px' }}>
                      {MONTHS[realNow.getMonth()]} {realNow.getFullYear()}
                    </span>
                  </div>
                  <Icons.Wallet />
                </div>
                <div style={{ padding: '10px 14px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px', lineHeight: 1 }}>{fmt(finances.total)}</span>
                    <span style={{ fontSize: '9.5px', color: '#94a3b8', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '2px' }}>{finances.total === 0 ? 'NO EXPENSES YET' : 'THIS MONTH'}</span>
                  </div>

                  {/* Visual breakdown bar */}
                  {finances.total > 0 && (
                    <div style={{ display: 'flex', height: '5px', borderRadius: '3px', overflow: 'hidden', gap: '1px', marginBottom: '8px' }}>
                      {finances.fuel   > 0 && <div style={{ flex: finances.fuel,   background: '#006205', transition: 'flex 0.4s' }} />}
                      {finances.maint  > 0 && <div style={{ flex: finances.maint,  background: '#d97706', transition: 'flex 0.4s' }} />}
                      {finances.repair > 0 && <div style={{ flex: finances.repair, background: '#dc2626', transition: 'flex 0.4s' }} />}
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {[
                      { label: 'Fuel',        value: finances.fuel,   color: '#166534', dot: '#006205' },
                      { label: 'Maintenance', value: finances.maint,  color: '#854d0e', dot: '#d97706' },
                      { label: 'Repairs',     value: finances.repair, color: '#991b1b', dot: '#dc2626' },
                    ].map(({ label, value, color, dot }) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 700 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot, flexShrink: 0 }} />
                          {label}
                        </span>
                        <span style={{ color }}>{fmt(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes ovPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}
