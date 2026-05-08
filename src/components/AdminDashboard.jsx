import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.v2.css';
import { supabase } from '../supabaseClient';

// Page Components
import OverviewPage from './pages/OverviewPage';
import VehiclesPage from './pages/VehiclesPage';
import UsersPage from './pages/UsersPage';
import BookingsPage from './pages/BookingsPage';
import DriversPage from './pages/DriversPage';
import FleetsPage from './pages/FleetsPage';
import VehicleLogsPage from './pages/VehicleLogsPage';
import FinancialPage from './pages/FinancialPage';


// Modal Components
import VehicleDetailsModal from './modals/VehicleDetailsModal';
import VehicleFormModal from './modals/VehicleFormModal';
import UserFormModal from './modals/UserFormModal';
import BookingDetailsModal from './modals/BookingDetailsModal';

// Utilities
import { logVehicleChange, logVehicleUpdate, fetchVehicleChangeLogs } from '../utils/vehicleLogger';

const NAV_ICONS = {
  overview: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="18" y="3" width="4" height="18" rx="1"/>
      <rect x="10" y="8" width="4" height="13" rx="1"/>
      <rect x="2" y="13" width="4" height="8" rx="1"/>
    </svg>
  ),
  users: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  vehicles: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h10l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
      <circle cx="7.5" cy="17" r="2"/>
      <circle cx="16.5" cy="17" r="2"/>
    </svg>
  ),
  drivers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" rx="2"/>
      <path d="M16 8h4l3 3v3h-7V8z"/>
      <circle cx="5.5" cy="18.5" r="2.5"/>
      <circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  bookings: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2"/>
      <path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  ),
  fleets: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  logs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  ),
  financial: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
      <polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
};

const NAV = [
  { key: 'overview',  label: 'Overview'      },
  { key: 'users',     label: 'Users'         },
  { key: 'vehicles',  label: 'Vehicles'      },
  { key: 'drivers',   label: 'Drivers'       },
  { key: 'bookings',  label: 'Bookings'      },
  { key: 'fleets',    label: 'Fleets'        },
  { key: 'logs',      label: 'Logs'          },
  { key: 'financial', label: 'Financial Data'},
];

const normalizeVehicleLogs = (logs) =>
  (logs || []).map(log => {
    const oldData = log.old_data || {};
    const newData = log.new_data || {};
    return {
      id:           log.id,
      vehicle_name: log.vehicle_name,
      change_type:  log.action_type,
      admin_id:     log.changed_by,
      created_at:   log.created_at,
      field_name:   Object.keys(newData).find(k => oldData[k] !== newData[k]) || '—',
      old_value:    JSON.stringify(oldData) || '—',
      new_value:    JSON.stringify(newData) || '—',
    };
  });

// ── Helper: format departure time for email ───────────────
const formatDepartureTime = (datetime) => {
  if (!datetime) return 'N/A';
  return new Date(datetime).toLocaleString('en-US', {
    weekday: 'short',
    month:   'short',
    day:     'numeric',
    year:    'numeric',
    hour:    '2-digit',
    minute:  '2-digit',
    hour12:  true,
  });
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [tab, setTab]                   = useState('overview');
  const [loading, setLoading]           = useState(true);
  const [isFetching, setIsFetching]     = useState(false);
  const [toast, setToast]               = useState({ msg: '', type: '' });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [vehicleSort, setVehicleSort]   = useState('name_asc');

  const [adminUser, setAdminUser]             = useState({});
  const [stats, setStats]                     = useState({});
  const [vehicles, setVehicles]               = useState([]);
  const [users, setUsers]                     = useState([]);
  const [drivers, setDrivers]                 = useState([]);
  const [fleets, setFleets]                   = useState([]);
  const [bookings, setBookings]               = useState([]);
  const [ongoingBookings, setOngoingBookings] = useState([]);

  const [vehicleLogs, setVehicleLogs] = useState([]);
  const [tripLogs, setTripLogs]       = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [modalType, setModalType]             = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedUser, setSelectedUser]       = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [vForm, setVForm] = useState({
    name: '', plate_number: '', model: '', year: '',
    fuel_type: 'Diesel', condition: 'Good', odometer_km: 0,
    is_available: true, fleet_id: '', image_url: '',
  });
  const [uForm, setUForm] = useState({
    username: '', is_staff: false,
    profile: { employee_id: '', department: '', phone: '' },
  });

  const initialLoadDone = useRef(false);
  // ── Debounce timer ref — prevents rapid-fire refreshes ───
  const debounceTimer = useRef(null);

  // ── Toast ─────────────────────────────────────────────────
  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  // ── Auth guard ────────────────────────────────────────────
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) { navigate('/admin-login'); return; }
    const stored = localStorage.getItem('adminUser');
    if (stored) setAdminUser(JSON.parse(stored));
  }, [navigate]);

  // ── Fetch all data ────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (initialLoadDone.current) setIsFetching(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/admin-login'); return; }

      const [vRes, uRes, fRes, bRes, dRes, cV, cU, cF, cB, cP, cO] = await Promise.all([
        supabase.from('vehicles').select('*').order('name'),
        supabase.from('employee_profiles').select('*').order('created_at'),
        supabase.from('fleets').select('*, vehicles(id)'),
        supabase
          .from('vehicle_bookings')
          .select(`
            *,
            vehicle:vehicles ( id, name, fleet_id ),
            driver:driver_profiles (
              id, user_id, name, availability, assigned_vehicle_id
            )
          `)
          .order('start_datetime', { ascending: false }),
        supabase.from('driver_profiles').select('*').order('name'),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }),
        supabase.from('employee_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('fleets').select('*', { count: 'exact', head: true }),
        supabase.from('vehicle_bookings').select('*', { count: 'exact', head: true }),
        supabase.from('vehicle_bookings').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('vehicle_bookings').select('*', { count: 'exact', head: true }).eq('status', 'Ongoing'),
      ]);

      setVehicles(vRes.data || []);
      setDrivers(dRes.data || []);
      setBookings(bRes.data || []);

      setUsers((uRes.data || []).map(usr => ({
        id:       usr.id,
        user_id:  usr.user_id,
        username: usr.employee_id || '—',
        is_staff: usr.role === 'admin',
        profile: {
          employee_id: usr.employee_id || '',
          department:  usr.department  || '',
          phone:       usr.phone       || '',
        },
      })));

      setFleets((fRes.data || []).map(fl => ({ ...fl, vehicles: fl.vehicles || [] })));
      setOngoingBookings((bRes.data || []).filter(b => b.status === 'Ongoing' || b.status === 'Approved'));

      setStats({
        totalVehicles:   cV.count || 0,
        totalUsers:      cU.count || 0,
        totalFleets:     cF.count || 0,
        totalBookings:   cB.count || 0,
        pendingBookings: cP.count || 0,
        ongoingBookings: cO.count || 0,
      });

    } catch (e) {
      console.error('Fetch Error:', e);
      showToast('Failed to refresh data.', 'err');
    } finally {
      if (!initialLoadDone.current) {
        initialLoadDone.current = true;
        setLoading(false);
      }
      setIsFetching(false);
    }
  }, [navigate]);

  // ── Silent log refresh ────────────────────────────────────
  const fetchLogsSilently = useCallback(async () => {
    try {
      const [vehicleRes, tripRes] = await Promise.all([
        fetchVehicleChangeLogs().then(res => res.data),
        supabase
          .from('trip_logs')
          .select('*, vehicles(id, name)')
          .order('created_at', { ascending: false }),
      ]);
      setVehicleLogs(normalizeVehicleLogs(vehicleRes || []));
      setTripLogs(tripRes.data || []);
    } catch (err) {
      console.error('Failed silent log update', err);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (tab === 'logs') {
      setLogsLoading(true);
      fetchLogsSilently().finally(() => setLogsLoading(false));
    }
  }, [tab, fetchLogsSilently]);

  // ── Realtime subscription with debounce ───────────────────
  // Debounce prevents multiple rapid fetchAll() calls when
  // several DB rows update at once (e.g. approve booking updates
  // vehicle_bookings + vehicles + driver_profiles simultaneously)
  useEffect(() => {
    const channel = supabase
      .channel('bookings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicle_bookings' },
        () => {
          // Clear any pending timer and reset — only fires once
          // after the last change, not once per change
          if (debounceTimer.current) clearTimeout(debounceTimer.current);
          debounceTimer.current = setTimeout(() => {
            fetchAll();
          }, 800); // wait 800ms after last change before refreshing
        }
      )
      .subscribe((status) => {
        console.log('Realtime status:', status);
      });

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      supabase.removeChannel(channel);
    };
  }, [fetchAll]);

  // ── Sorted vehicles ───────────────────────────────────────
  const sortedVehicles = useMemo(() => {
    const list = [...vehicles];
    switch (vehicleSort) {
      case 'name_desc': list.sort((a, b) => String(b.name || '').localeCompare(String(a.name || ''))); break;
      case 'condition': list.sort((a, b) => String(a.condition || '').localeCompare(String(b.condition || ''))); break;
      case 'available': list.sort((a, b) => Number(Boolean(b.is_available)) - Number(Boolean(a.is_available))); break;
      case 'newest':    list.sort((a, b) => Number(b.id || 0) - Number(a.id || 0)); break;
      default:          list.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    }
    return list;
  }, [vehicles, vehicleSort]);

  const cycleVehicleSort = () => {
    const order = ['name_asc', 'name_desc', 'condition', 'available', 'newest'];
    const next  = order[(order.indexOf(vehicleSort) + 1) % order.length];
    setVehicleSort(next);
    const label = {
      name_asc: 'Name (A→Z)', name_desc: 'Name (Z→A)',
      condition: 'Condition',  available: 'Availability', newest: 'Newest',
    }[next];
    showToast(`Sorted by: ${label}`, 'ok');
  };

  // ── Vehicle CRUD ──────────────────────────────────────────
  const openAddVehicle = () => {
    setVForm({
      name: '', plate_number: '', model: '', year: '',
      fuel_type: 'Diesel', condition: 'Good', odometer_km: 0,
      is_available: true, fleet_id: '', image_url: '',
    });
    setModalType('addVehicle');
  };

  const openEditVehicle = (v) => {
    setVForm({ ...v, year: v.year?.toString() || '' });
    setSelectedVehicle(v);
    setModalType('editVehicle');
  };

  const saveVehicle = async () => {
    const isEdit  = modalType === 'editVehicle';
    const payload = {
      name:         vForm.name,
      plate_number: vForm.plate_number,
      model:        vForm.model,
      year:         vForm.year ? parseInt(vForm.year) : null,
      fuel_type:    vForm.fuel_type,
      condition:    vForm.condition,
      odometer_km:  parseFloat(vForm.odometer_km) || 0,
      is_available: vForm.is_available !== false,
      fleet_id:     vForm.fleet_id || null,
      image_url:    vForm.image_url,
    };

    try {
      if (isEdit) {
        if (!selectedVehicle?.id) return showToast('No vehicle selected', 'err');
        await logVehicleUpdate(selectedVehicle, { ...selectedVehicle, ...payload }, adminUser.username || 'admin');
        const { error } = await supabase.from('vehicles').update(payload).eq('id', selectedVehicle.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('vehicles').insert(payload).select().single();
        if (error) throw error;
        await logVehicleChange('create', data.id, data.name, adminUser.username || 'admin');
      }
      showToast('Vehicle saved successfully');
      setModalType('');
      fetchAll();
    } catch (err) { showToast(err.message, 'err'); }
  };

  const handleDeleteVehicle = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) showToast(error.message, 'err');
    else { showToast('Vehicle removed'); fetchAll(); }
  };

  // ── User CRUD ─────────────────────────────────────────────
  const openAddUser = () => {
    setSelectedUser(null);
    setUForm({ username: '', is_staff: false, profile: { employee_id: '', department: '', phone: '' } });
    setModalType('addUser');
  };

  const openEditUser = (u) => {
    setSelectedUser(u);
    setUForm({ username: u.username, is_staff: u.is_staff, profile: u.profile });
    setModalType('editUser');
  };

  const saveUser = async () => {
    try {
      const isEdit  = modalType === 'editUser';
      const payload = {
        employee_id: uForm.profile.employee_id,
        department:  uForm.profile.department,
        phone:       uForm.profile.phone,
        role:        uForm.is_staff ? 'admin' : 'user',
      };

      let error;
      if (isEdit) {
        if (!selectedUser?.id) return showToast('No user selected', 'err');
        ({ error } = await supabase.from('employee_profiles').update(payload).eq('id', selectedUser.id));
      } else {
        ({ error } = await supabase.from('employee_profiles').insert([payload]));
      }

      if (error) throw error;
      showToast(isEdit ? 'User updated' : 'User added');
      setModalType('');
      fetchAll();
    } catch (err) { showToast(err.message, 'err'); }
  };

  // ── Booking Actions (availability + formatted email) ──────
  const bookingAction = async (id, status, vehicleId = null, driverId = null) => {
    const booking = bookings.find(x => x.id === id);
    if (!booking) return;

    const updates = { status };

    try {
      if (status === 'Approved') {
        if (vehicleId) updates.vehicle_id = vehicleId;
        if (driverId)  updates.driver_id  = driverId;
        if (vehicleId) await supabase.from('vehicles')
          .update({ is_available: false }).eq('id', vehicleId);
        if (driverId) await supabase.from('driver_profiles')
          .update({ availability: 'On Trip', assigned_vehicle_id: vehicleId }).eq('id', driverId);
      }

      if (status === 'Ongoing') {
        if (booking.vehicle_id) await supabase.from('vehicles')
          .update({ is_available: false }).eq('id', booking.vehicle_id);
        if (booking.driver_id) await supabase.from('driver_profiles')
          .update({ availability: 'On Trip', assigned_vehicle_id: booking.vehicle_id }).eq('id', booking.driver_id);
      }

      if (status === 'Returned') {
        updates.actual_return = new Date().toISOString();
        if (booking.vehicle_id) await supabase.from('vehicles')
          .update({ is_available: true }).eq('id', booking.vehicle_id);
        if (booking.driver_id) await supabase.from('driver_profiles')
          .update({ availability: 'Available', assigned_vehicle_id: null }).eq('id', booking.driver_id);
      }

      const { error } = await supabase.from('vehicle_bookings').update(updates).eq('id', id);
      if (error) throw error;

      if (status === 'Approved' || status === 'Rejected') {
        const assignedVehicle = vehicles.find(v => String(v.id) === String(vehicleId));
        const assignedDriver  = drivers.find(d => String(d.id) === String(driverId));

        console.log(`Triggering ${status} email for:`, booking.email || booking.user?.email);

        const { error: funcError } = await supabase.functions.invoke('send-approval-email', {
          body: {
            userEmail:   booking.email || booking.user?.email,
            status:      status,
            vehicleName: assignedVehicle?.name || 'N/A',
            driverName:  assignedDriver?.name  || 'N/A',
            destination: booking.destination   || 'Your Destination',
            startDate:   formatDepartureTime(booking.start_datetime),
          },
        });

        if (funcError) {
          console.error('Edge Function Error:', funcError);
          showToast(`Booking ${status}, but email failed to send.`, 'err');
          fetchAll();
          return;
        }
      }

      showToast(`Booking ${status}`);
      fetchAll();
    } catch (err) {
      console.error('Booking Action Error:', err);
      showToast(err.message, 'err');
    }
  };

  // ── Logout ────────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/admin-login');
  };

  // ── First load screen ─────────────────────────────────────
  if (loading) return (
    <div className="admin-loading">
      <div className="admin-loading-logos">
        <img src="/assets/images/DAR-FLEET.png" alt="DAR Fleet" className="admin-loading-logo" />
        <span className="admin-loading-x">×</span>
        <img src="/assets/images/PQ-LOGO.png" alt="PQ" className="admin-loading-logo" />
      </div>
      <p className="admin-loading-label">Loading System...</p>
      <div className="admin-loading-road">
        <div className="admin-loading-car">
          <img src="/assets/images/car.png" alt="" />
        </div>
      </div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          {/* Primary brand — large app-icon style */}
          <div className="admin-logo-primary">
            <img src="/assets/images/DAR-FLEET.png" alt="DAR FleetDispatch" className="admin-logo-main-img" />
          </div>
          {/* Separator */}
          <div className="admin-logo-sep">
            <span />
            <span className="admin-logo-x">×</span>
            <span />
          </div>
          {/* Secondary brand — small with label */}
          <div className="admin-logo-secondary">
            <div className="admin-logo-pq-wrap">
              <img src="/assets/images/PQ-LOGO.png" alt="Penta Quail" className="admin-logo-pq-img" />
            </div>
            <span className="admin-logo-pq-label">PENTA QUAIL</span>
          </div>
        </div>
        {NAV.map(n => (
          <div
            key={n.key}
            className={`admin-nav ${tab === n.key ? 'active' : ''}`}
            onClick={() => setTab(n.key)}
          >
            <span className="admin-icon">{NAV_ICONS[n.key]}</span>
            <span>{n.label}</span>
            {n.key === 'bookings' && stats.pendingBookings > 0 && (
              <span className="admin-badge-notif">{stats.pendingBookings}</span>
            )}
          </div>
        ))}
        <div className="admin-footer">
          <span className="admin-footer-brand">DAR 10 Fleet Dispatch</span>
          <span className="admin-footer-x">×</span>
          <span className="admin-footer-partner">Penta Quail</span>
          <span className="admin-footer-year">© 2026</span>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <h1>{NAV.find(n => n.key === tab)?.label}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isFetching && (
              <span style={{ fontSize: 12, color: '#94a3b8' }}>↻ Syncing...</span>
            )}
            <div className="admin-user-menu">
              <button className="admin-user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                <span className="admin-avatar">{(adminUser.username || 'A')[0].toUpperCase()}</span>
                <div className="admin-user-info">
                  <span className="admin-user-name">{adminUser.username || 'Admin'}</span>
                  <span className="admin-user-role">Administrator</span>
                </div>
                <svg className={`admin-user-chevron ${showUserMenu ? 'open' : ''}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="admin-dropdown">
                  {/* Profile header */}
                  <div className="admin-dropdown-profile">
                    <span className="admin-avatar admin-avatar-lg">{(adminUser.username || 'A')[0].toUpperCase()}</span>
                    <div>
                      <div className="admin-dropdown-username">{adminUser.username || 'Admin'}</div>
                      <span className="admin-dropdown-role-badge">Administrator</span>
                    </div>
                  </div>

                  <div className="admin-dropdown-divider" />

                  {/* Logout */}
                  <button className="admin-dropdown-item admin-dropdown-logout" onClick={logout}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {toast.msg && (
          <div className={`admin-toast ${toast.type === 'err' ? 'error' : 'success'}`}>
            {toast.msg}
          </div>
        )}

        <div style={{ display: tab === 'overview'  ? 'block' : 'none' }}>
          <OverviewPage
            stats={stats}
            bookings={bookings}
            vehicles={vehicles}
            drivers={drivers}
            onNavigate={setTab}
          />
        </div>

        <div style={{ display: tab === 'vehicles' ? 'block' : 'none', paddingTop: '20px' }}>
          <VehiclesPage
            vehicles={vehicles}
            sortedVehicles={sortedVehicles}
            vehicleSort={vehicleSort}
            onCycleSort={cycleVehicleSort}
            onAdd={openAddVehicle}
            onEdit={openEditVehicle}
            onDelete={handleDeleteVehicle}
            onViewDetails={(v) => { setSelectedVehicle(v); setModalType('vehicleDetails'); }}
          />
        </div>

        <div style={{ display: tab === 'users' ? 'block' : 'none', paddingTop: '20px' }}>
          <UsersPage
            users={users}
            onAdd={openAddUser}
            onEdit={openEditUser}
            onDelete={(id) => {
              if (window.confirm('Delete user?'))
                supabase.from('employee_profiles').delete().eq('id', id).then(fetchAll);
            }}
          />
        </div>

        <div style={{ display: tab === 'bookings' ? 'block' : 'none', paddingTop: '20px' }}>
          <BookingsPage
            bookings={bookings}
            vehicles={vehicles}
            drivers={drivers}
            onApprove={(id, vId, dId) => bookingAction(id, 'Approved', vId, dId)}
            onReject={(id)            => bookingAction(id, 'Rejected')}
            onRefresh={fetchAll}
            onViewDetails={(b) => { setSelectedBooking(b); setModalType('bookingDetails'); }}
          />
        </div>

        <div style={{ display: tab === 'drivers' ? 'block' : 'none', paddingTop: '20px' }}>
          <DriversPage
            drivers={drivers}
            fleets={fleets}
            vehicles={vehicles}
            onRefresh={fetchAll}
          />
        </div>

        <div style={{ display: tab === 'fleets' ? 'block' : 'none', paddingTop: '20px' }}>
          <FleetsPage
            bookings={ongoingBookings}
            fleets={fleets}
            vehicles={vehicles}
            drivers={drivers}
            onMarkOngoing={(id)  => bookingAction(id, 'Ongoing')}
            onMarkReturned={(id) => bookingAction(id, 'Returned')}
            onRefresh={fetchAll}
          />
        </div>

        <div style={{ display: tab === 'logs' ? 'block' : 'none', paddingTop: '20px' }}>
          <VehicleLogsPage
            logs={vehicleLogs}
            loading={logsLoading}
            tripLogs={tripLogs}
            onRefresh={fetchLogsSilently}
          />
        </div>

        <div style={{ display: tab === 'financial' ? 'block' : 'none', paddingTop: '20px' }}>
          <FinancialPage />
        </div>

      </main>

      {/* ── Modals ── */}
      {modalType === 'bookingDetails' && (
        <BookingDetailsModal
          booking={selectedBooking}
          vehicles={vehicles}
          onClose={() => { setModalType(''); setSelectedBooking(null); }}
        />
      )}

      {modalType === 'vehicleDetails' && (
        <VehicleDetailsModal
          vehicle={selectedVehicle}
          onEdit={() => openEditVehicle(selectedVehicle)}
          onClose={() => setModalType('')}
        />
      )}

      {(modalType === 'addVehicle' || modalType === 'editVehicle') && (
        <VehicleFormModal
          mode={modalType === 'addVehicle' ? 'add' : 'edit'}
          data={vForm}
          onChange={setVForm}
          onSave={saveVehicle}
          onClose={() => setModalType('')}
        />
      )}

      {(modalType === 'addUser' || modalType === 'editUser') && (
        <UserFormModal
          mode={modalType === 'addUser' ? 'add' : 'edit'}
          data={uForm}
          onChange={setUForm}
          onSave={saveUser}
          onClose={() => setModalType('')}
        />
      )}
    </div>
  );
}