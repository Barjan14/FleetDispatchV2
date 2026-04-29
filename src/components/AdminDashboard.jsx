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
import InsurancePage from './pages/InsurancePage';
import SafetyChecksPage from './pages/SafetyChecksPage';

// Modal Components
import VehicleDetailsModal from './modals/VehicleDetailsModal';
import VehicleFormModal from './modals/VehicleFormModal';
import UserFormModal from './modals/UserFormModal';
import BookingDetailsModal from './modals/BookingDetailsModal';

// Utilities
import { logVehicleChange, logVehicleUpdate, fetchVehicleChangeLogs } from '../utils/vehicleLogger';

const NAV = [
  { key: 'overview',  icon: '📊', label: 'Overview'           },
  { key: 'users',     icon: '👥', label: 'Users'              },
  { key: 'vehicles',  icon: '🚗', label: 'Vehicles'           },
  { key: 'drivers',   icon: '🚛', label: 'Drivers'            },
  { key: 'bookings',  icon: '📅', label: 'Bookings'           },
  { key: 'fleets',    icon: '🗂️', label: 'Fleets'             },
  { key: 'logs',      icon: '📋', label: 'Logs'               },
  { key: 'financial', icon: '💰', label: 'Financial Data'     },
  { key: 'insurance', icon: '🛡️', label: 'Insurance Records'  },
  { key: 'safety',    icon: '✅', label: 'Safety Checks'      },
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

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [tab, setTab]                   = useState('overview');
  const [loading, setLoading]           = useState(true);   // only true on first load
  const [isFetching, setIsFetching]     = useState(false);  // silent background refresh
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

  // ── Ref to track if first load is done ───────────────────
  const initialLoadDone = useRef(false);

  // ── Toast ─────────────────────────────────────────────────
  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  // ── Auth guard ────────────────────────────────────────────
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/admin-login');
      return;
    }
    const stored = localStorage.getItem('adminUser');
    if (stored) setAdminUser(JSON.parse(stored));
  }, [navigate]);

  // ── Fetch all data ────────────────────────────────────────
  // KEY FIX: On first load → show spinner (setLoading)
  // On subsequent refreshes → update data silently (setIsFetching)
  // This prevents BookingsPage from unmounting/remounting on refresh
  const fetchAll = useCallback(async () => {
    // First load: show full spinner
    // Subsequent: silent background fetch, page stays visible
    if (initialLoadDone.current) {
      setIsFetching(true);
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin-login');
        return;
      }

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

      // ✅ Update state in one batch — minimizes re-renders
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
      // First load done — flip the ref so future calls are silent
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

  // ── Realtime subscription for bookings ───────────────────
  // This updates bookings in the background without resetting the page
  useEffect(() => {
    const channel = supabase
      .channel('bookings-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'vehicle_bookings' },
        () => {
          // Silent refresh — page stays visible, no flicker
          fetchAll();
        }
      )
      .subscribe();

    return () => {
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
    } catch (err) {
      showToast(err.message, 'err');
    }
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
    } catch (err) {
      showToast(err.message, 'err');
    }
  };

  // ── Booking Actions (MERGED: availability + email) ────────
  const bookingAction = async (id, status, vehicleId = null, driverId = null) => {
    const booking = bookings.find(x => x.id === id);
    if (!booking) return;

    const updates = { status };

    try {
      // 1. Update vehicle & driver availability
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

      // 2. Update the booking row
      const { error } = await supabase.from('vehicle_bookings').update(updates).eq('id', id);
      if (error) throw error;

      // 3. Send email notification (Approved or Rejected)
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
            startDate:   booking.start_datetime,
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

  // ── Loading state (first load only) ──────────────────────
  if (loading) return (
    <div className="admin-loading">
      <div className="spinner">Loading System...</div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-logo">Fleet<span>Dispatch</span></div>
        {NAV.map(n => (
          <div
            key={n.key}
            className={`admin-nav ${tab === n.key ? 'active' : ''}`}
            onClick={() => setTab(n.key)}
          >
            <span className="admin-icon">{n.icon}</span>
            <span>{n.label}</span>
            {n.key === 'bookings' && stats.pendingBookings > 0 && (
              <span className="admin-badge-notif">{stats.pendingBookings}</span>
            )}
          </div>
        ))}
        <div className="admin-footer">FleetDispatch v2.0</div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <h1>{NAV.find(n => n.key === tab)?.label}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Subtle refresh indicator — no page flicker */}
            {isFetching && (
              <span style={{ fontSize: 12, color: '#94a3b8', animation: 'pulse 1s infinite' }}>
                ↻ Syncing...
              </span>
            )}
            <div className="admin-user-menu">
              <button className="admin-user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
                <span className="admin-avatar">{(adminUser.username || 'A')[0].toUpperCase()}</span>
                <span>{adminUser.username || 'Admin'}</span>
              </button>
              {showUserMenu && (
                <div className="admin-dropdown">
                  <button className="admin-dropdown-item" onClick={logout}>Logout</button>
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

        {/* ✅ All pages always mounted, just hidden via CSS display:none */}
        {/* This prevents remounting/state reset on every fetchAll */}
        <div style={{ display: tab === 'overview'  ? 'block' : 'none' }}>
          <OverviewPage
            stats={stats}
            bookings={bookings}
            vehicles={vehicles}
            drivers={drivers}
            onNavigate={setTab}
          />
        </div>

        <div style={{ display: tab === 'vehicles' ? 'block' : 'none' }}>
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

        <div style={{ display: tab === 'users' ? 'block' : 'none' }}>
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

        {/* ✅ BookingsPage stays mounted — no more page reset on data refresh */}
        <div style={{ display: tab === 'bookings' ? 'block' : 'none' }}>
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

        <div style={{ display: tab === 'drivers' ? 'block' : 'none' }}>
          <DriversPage
            drivers={drivers}
            fleets={fleets}
            vehicles={vehicles}
            onRefresh={fetchAll}
          />
        </div>

        <div style={{ display: tab === 'fleets' ? 'block' : 'none' }}>
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

        <div style={{ display: tab === 'logs' ? 'block' : 'none' }}>
          <VehicleLogsPage
            logs={vehicleLogs}
            loading={logsLoading}
            tripLogs={tripLogs}
            onRefresh={fetchLogsSilently}
          />
        </div>

        <div style={{ display: tab === 'financial' ? 'block' : 'none' }}>
          <FinancialPage />
        </div>

        <div style={{ display: tab === 'insurance' ? 'block' : 'none' }}>
          <InsurancePage />
        </div>

        <div style={{ display: tab === 'safety' ? 'block' : 'none' }}>
          <SafetyChecksPage />
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