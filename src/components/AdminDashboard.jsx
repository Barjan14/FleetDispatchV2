import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.v2.css';
import { supabase } from '../supabaseClient';

// Page Components
import OverviewPage from './pages/OverviewPage';
import VehiclesPage from './pages/VehiclesPage';
import UsersPage from './pages/UsersPage';
import BookingsPage from './pages/BookingsPage';
import FleetsPage from './pages/FleetsPage';
import VehicleLogsPage from './pages/VehicleLogsPage';

// Modal Components
import VehicleDetailsModal from './modals/VehicleDetailsModal';
import VehicleFormModal from './modals/VehicleFormModal';
import UserFormModal from './modals/UserFormModal';

// Utilities
import { logVehicleChange, logVehicleUpdate, fetchVehicleChangeLogs } from '../utils/vehicleLogger';

const NAV = [
  { key:'overview',  icon:'📊', label:'Overview'  },
  { key:'vehicles',  icon:'🚗', label:'Vehicles'  },
  { key:'users',     icon:'👥', label:'Users'     },
  { key:'bookings',  icon:'📅', label:'Bookings'  },
  { key:'fleets',    icon:'🗂️', label:'Fleets'    },
  { key:'logs',      icon:'📋', label:'Logs'      },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab]               = useState('overview');
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState({ msg:'', type:'' });
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [vehicleSort, setVehicleSort]   = useState('name_asc');

  const [adminUser, setAdminUser] = useState({});
  const [stats, setStats]         = useState({});
  const [vehicles, setVehicles]   = useState([]);
  const [users, setUsers]         = useState([]);
  const [fleets, setFleets]       = useState([]);
  const [bookings, setBookings]   = useState([]);
  const [vehicleLogs, setVehicleLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const [modalType, setModalType] = useState('');
  const [selectedVehicle, setSelectedVehicle]     = useState(null);
  const [selectedUser, setSelectedUser]     = useState(null);

  const [vForm, setVForm] = useState({ name:'', plate_number:'', model:'', year:'', condition:'Good', fleet_id:'' });
  const [uForm, setUForm] = useState({
    username:'', email:'', password:'', is_staff:false,
    profile:{ employee_id:'', department:'', phone:'' }
  });

  // ── sorted vehicles (unchanged logic) ─────────────────────
  const sortedVehicles = React.useMemo(() => {
    const list = [...vehicles];
    switch (vehicleSort) {
      case 'name_desc': list.sort((a,b)=>String(b.name||'').localeCompare(String(a.name||''))); break;
      case 'condition': list.sort((a,b)=>String(a.condition||'').localeCompare(String(b.condition||''))); break;
      case 'available': list.sort((a,b)=>Number(Boolean(b.is_available))-Number(Boolean(a.is_available))); break;
      case 'newest':    list.sort((a,b)=>Number(b.id||0)-Number(a.id||0)); break;
      default:          list.sort((a,b)=>String(a.name||'').localeCompare(String(b.name||'')));
    }
    return list;
  }, [vehicles, vehicleSort]);

  const cycleVehicleSort = () => {
    const order = ['name_asc','name_desc','condition','available','newest'];
    const next  = order[(order.indexOf(vehicleSort)+1) % order.length];
    setVehicleSort(next);
    const label = { name_asc:'Name (A→Z)', name_desc:'Name (Z→A)', condition:'Condition', available:'Availability', newest:'Newest' }[next];
    showToast(`Sorted by: ${label}`, 'ok');
  };

  const showToast = (msg, type='ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg:'', type:'' }), 3000);
  };

  // ── Auth guard ────────────────────────────────────────────
  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') { navigate('/admin-login'); return; }
    const stored = localStorage.getItem('adminUser');
    if (stored) setAdminUser(JSON.parse(stored));
  }, [navigate]);

  // ── Fetch all data from Supabase ──────────────────────────
  const fetchAll = useCallback(async () => {
    // Re-check session is still valid
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      showToast('Session expired. Please log in again.', 'err');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('isAdmin');
      navigate('/admin-login');
      return;
    }

    try {
      // Vehicles
      const { data: v, error: vErr } = await supabase
        .from('vehicles')
        .select('*')
        .order('name');
      if (vErr) throw vErr;

      // Users (employee_profiles)
      const { data: u, error: uErr } = await supabase
        .from('employee_profiles')
        .select('id, user_id, employee_id, department, phone, role')
        .order('created_at');
      if (uErr) throw uErr;

      // Fleets with vehicles relation for count
      const { data: f, error: fErr } = await supabase
        .from('fleets')
        .select('*, vehicles(id)');
      if (fErr) throw fErr;

      // Bookings with nested vehicle + employee_profiles
      const { data: b, error: bErr } = await supabase
        .from('vehicle_bookings')
        .select(`
          *,
          vehicle:vehicles ( id, name, plate_number ),
          employee_profiles!vehicle_bookings_user_id_fkey ( employee_id )
        `)
        .order('created_at', { ascending: false });
      if (bErr) throw bErr;

      // Stats via count queries
      const [
        { count: cV }, { count: cU }, { count: cF },
        { count: cB }, { count: cP }, { count: cO },
      ] = await Promise.all([
        supabase.from('vehicles').select('*',          { count:'exact', head:true }),
        supabase.from('employee_profiles').select('*', { count:'exact', head:true }),
        supabase.from('fleets').select('*',            { count:'exact', head:true }),
        supabase.from('vehicle_bookings').select('*',  { count:'exact', head:true }),
        supabase.from('vehicle_bookings').select('*',  { count:'exact', head:true }).eq('status','Pending'),
        supabase.from('vehicle_bookings').select('*',  { count:'exact', head:true }).eq('status','Ongoing'),
      ]);

      setVehicles(v || []);

      // Shape users to match old Django shape so modal JSX doesn't change
      setUsers((u || []).map(usr => ({
        id:       usr.id,
        user_id:  usr.user_id,
        username: usr.employee_id || usr.user_id?.slice(0,8) || '—',
        email:    '',   // not stored in employee_profiles; omit or fetch separately if needed
        is_staff: usr.role === 'admin',
        profile: {
          employee_id: usr.employee_id || '',
          department:  usr.department  || '',
          phone:       usr.phone       || '',
        },
      })));

      setFleets((f || []).map(fl => ({ ...fl, vehicles: fl.vehicles || [] })));

      // Shape bookings to match old Django shape
      setBookings((b || []).map(bk => ({
        ...bk,
        // keep nested shape the modal/table expects
        user: {
          username: bk.employee_profiles?.employee_id || 'Unknown',
          profile:  { employee_id: bk.employee_profiles?.employee_id || '' },
        },
        vehicle: bk.vehicle || {},
      })));

      setStats({
        totalVehicles:  cV,
        totalUsers:     cU,
        totalFleets:    cF,
        totalBookings:  cB,
        pendingBookings:cP,
        ongoingBookings:cO,
      });

    } catch (e) {
      console.error('Error fetching data:', e);
      showToast('Failed to load data.', 'err');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Fetch vehicle logs when tab changes to logs ────────────
  useEffect(() => {
    if (tab === 'logs') {
      const loadLogs = async () => {
        setLogsLoading(true);
        const logs = await fetchVehicleChangeLogs();
        setVehicleLogs(logs);
        setLogsLoading(false);
      };
      loadLogs();
    }
  }, [tab]);

  const closeModal = () => { 
    setModalType(''); 
    setSelectedVehicle(null); 
    setSelectedUser(null);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminUser');
    navigate('/admin-login');
  };
  // ── VEHICLE CRUD ──────────────────────────────────────────
  const openAddVehicle = () => {
    setVForm({ name:'', plate_number:'', model:'', year:'', condition:'Good', fleet_id:'' });
    setModalType('addVehicle');
  };
  const openEditVehicle = (v) => {
    setVForm({ name:v.name, plate_number:v.plate_number, model:v.model||'', year:v.year||'', condition:v.condition||'Good', fleet_id:v.fleet_id||'' });
    setSelectedVehicle(v); 
    setModalType('editVehicle');
  };
  const saveVehicle = async () => {
    const isEdit = modalType === 'editVehicle';
    const payload = {
      name:         vForm.name,
      plate_number: vForm.plate_number,
      model:        vForm.model,
      year:         vForm.year ? parseInt(vForm.year) : null,
      condition:    vForm.condition,
      fleet_id:     vForm.fleet_id || null,
    };
    
    try {
      if (isEdit) {
        // Log changes before updating
        const oldVehicle = selectedVehicle;
        await logVehicleUpdate(oldVehicle, { ...oldVehicle, ...payload }, adminUser.username || 'admin');
        
        const { error } = await supabase.from('vehicles').update(payload).eq('id', selectedVehicle.id);
        if (error) throw error;
      } else {
        // Log vehicle creation
        const { data, error } = await supabase.from('vehicles').insert(payload).select().single();
        if (error) throw error;
        
        await logVehicleChange(
          'create',
          data.id,
          data.name,
          adminUser.username || 'admin'
        );
      }
      
      showToast(isEdit ? 'Vehicle updated!' : 'Vehicle added!');
      closeModal(); 
      fetchAll();
    } catch (error) {
      showToast('Error: ' + error.message, 'err');
    }
  };

  const deleteVehicle = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    try {
      const vehicle = vehicles.find(v => v.id === id);
      
      // Log vehicle deletion
      if (vehicle) {
        await logVehicleChange(
          'delete',
          id,
          vehicle.name,
          adminUser.username || 'admin'
        );
      }
      
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) throw error;
      
      showToast('Vehicle deleted.'); 
      fetchAll();
    } catch (error) {
      showToast('Error: ' + error.message, 'err');
    }
  };
  // ── USER CRUD ─────────────────────────────────────────────
  const openAddUser = () => {
    setUForm({ username:'', email:'', password:'', is_staff:false, profile:{ employee_id:'', department:'', phone:'' } });
    setModalType('addUser');
  };
  const openEditUser = (u) => {
    setUForm({
      username: u.username,
      email:    u.email,
      password: '',
      is_staff: u.is_staff || false,
      profile: {
        employee_id: u.profile?.employee_id || '',
        department:  u.profile?.department  || '',
        phone:       u.profile?.phone       || '',
      },
    });
    setSelectedUser(u); 
    setModalType('editUser');
  };
  const saveUser = async () => {
    if (!uForm.email) { showToast('Email is required', 'err'); return; }
    const isEdit = modalType === 'editUser';

    try {
      if (isEdit) {
        // Update profile row
        const { error } = await supabase.from('employee_profiles').update({
          employee_id: uForm.profile.employee_id,
          department:  uForm.profile.department,
          phone:       uForm.profile.phone,
          role:        uForm.is_staff ? 'admin' : 'user',
        }).eq('id', selectedUser.id);
        if (error) throw error;
        showToast('User updated!');

      } else {
        // Create auth user via Admin REST (requires service role key in env)
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/admin/users`,
          {
            method: 'POST',
            headers: {
              'Content-Type':  'application/json',
              'apikey':        import.meta.env.VITE_SUPABASE_SERVICE_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_SERVICE_KEY}`,
            },
            body: JSON.stringify({
              email:         uForm.email,
              password:      uForm.password,
              email_confirm: true,
            }),
          }
        );
        const newUser = await res.json();
        if (!res.ok) { showToast('Error: ' + (newUser.message || 'Failed to create user'), 'err'); return; }

        // Update the auto-created profile row
        await supabase.from('employee_profiles').update({
          employee_id: uForm.profile.employee_id,
          department:  uForm.profile.department,
          phone:       uForm.profile.phone,
          role:        uForm.is_staff ? 'admin' : 'user',
        }).eq('user_id', newUser.id);

        showToast('User added!');
      }
      closeModal(); 
      fetchAll();
    } catch (error) {
      showToast('Error: ' + error.message, 'err');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    // id here is the employee_profiles.id (not user_id)
    const { error } = await supabase.from('employee_profiles').delete().eq('id', id);
    if (error) { showToast('Error: ' + error.message, 'err'); return; }
    showToast('User deleted.'); fetchAll();
  };
  // ── BOOKING ACTIONS ───────────────────────────────────────
  const bookingAction = async (id, newStatus, notes='') => {
    const updates = { status: newStatus };
    if (notes) updates.admin_notes = notes;

    const booking = bookings.find(b => b.id === id);

    try {
      if (newStatus === 'Returned') {
        updates.actual_return = new Date().toISOString();
        if (booking?.vehicle_id) await supabase.from('vehicles').update({ is_available: true }).eq('id', booking.vehicle_id);
      }
      if (newStatus === 'Ongoing') {
        if (booking?.vehicle_id) await supabase.from('vehicles').update({ is_available: false }).eq('id', booking.vehicle_id);
      }
      if (newStatus === 'Approved' && booking) {
        const { data: conflicts } = await supabase
          .from('vehicle_bookings')
          .select('id')
          .eq('vehicle_id', booking.vehicle_id)
          .in('status', ['Approved','Ongoing'])
          .lt('start_datetime', booking.end_datetime)
          .gt('end_datetime', booking.start_datetime)
          .neq('id', id);
        if (conflicts?.length > 0) { showToast('Vehicle already booked for that time slot.', 'err'); return; }
      }

      const { error } = await supabase.from('vehicle_bookings').update(updates).eq('id', id);
      if (error) throw error;
      
      showToast(`Booking marked as ${newStatus}!`); 
      fetchAll();
    } catch (error) {
      showToast('Error: ' + error.message, 'err');
    }
  };

  // ── Loading screen (unchanged) ────────────────────────────
  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner">Loading…</div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // JSX — identical to original, zero style changes
  // ─────────────────────────────────────────────────────────
  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-logo">Fleet<span>Dispatch</span></div>
        {NAV.map(n => (
          <div
            key={n.key}
            className={`admin-nav ${tab===n.key?'active':''} ${n.key==='users'?'admin-nav-users':''}`}
            onClick={()=>setTab(n.key)}
          >
            <span className="admin-icon">{n.icon}</span>
            <span>{n.label}</span>
            {n.key==='bookings' && stats.pendingBookings > 0 &&
              <span className="admin-badge-notif">{stats.pendingBookings}</span>}
          </div>
        ))}
        <div className="admin-footer">FleetDispatch v2.0</div>
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <h1>{NAV.find(n=>n.key===tab)?.label}</h1>
          <div className="admin-user-menu">
            <button className="admin-user-btn" onClick={()=>setShowUserMenu(!showUserMenu)}>
              <span className="admin-avatar">{(adminUser.username||'A')[0].toUpperCase()}</span>
              <span>{adminUser.username||'Admin'}</span>
            </button>
            {showUserMenu && (
              <div className="admin-dropdown">
                <button className="admin-dropdown-item" onClick={logout}>Logout</button>
              </div>
            )}
          </div>
        </div>

        {toast.msg && (
          <div className={`admin-toast ${toast.type==='err'?'error':'success'}`}>{toast.msg}</div>
        )}        {/* PAGE CONTENT */}
        {tab==='overview' && <OverviewPage stats={stats} />}
        
        {tab==='vehicles' && (
          <VehiclesPage
            vehicles={vehicles}
            sortedVehicles={sortedVehicles}
            vehicleSort={vehicleSort}
            onCycleSort={cycleVehicleSort}
            onAdd={openAddVehicle}
            onEdit={openEditVehicle}
            onDelete={deleteVehicle}
            onViewDetails={(v) => { setSelectedVehicle(v); setModalType('vehicleDetails'); }}
          />
        )}
        
        {tab==='users' && (
          <UsersPage
            users={users}
            onAdd={openAddUser}
            onEdit={openEditUser}
            onDelete={deleteUser}
          />
        )}
        
        {tab==='bookings' && (
          <BookingsPage
            bookings={bookings}
            onApprove={(id) => bookingAction(id, 'Approved')}
            onReject={(id) => bookingAction(id, 'Rejected')}
            onMarkOngoing={(id) => bookingAction(id, 'Ongoing')}
            onMarkReturned={(id) => bookingAction(id, 'Returned')}
          />
        )}
        
        {tab==='fleets' && <FleetsPage fleets={fleets} />}
        
        {tab==='logs' && (
          <VehicleLogsPage 
            logs={vehicleLogs} 
            loading={logsLoading}
          />
        )}
      </main>      {/* MODALS */}
      {modalType === 'vehicleDetails' && (
        <VehicleDetailsModal
          vehicle={selectedVehicle}
          onEdit={() => setModalType('editVehicle')}
          onDelete={deleteVehicle}
          onClose={closeModal}
        />
      )}

      {(modalType === 'addVehicle' || modalType === 'editVehicle') && (
        <VehicleFormModal
          mode={modalType === 'addVehicle' ? 'add' : 'edit'}
          data={vForm}
          onChange={setVForm}
          onSave={saveVehicle}
          onClose={closeModal}
        />
      )}

      {(modalType === 'addUser' || modalType === 'editUser') && (
        <UserFormModal
          mode={modalType === 'addUser' ? 'add' : 'edit'}
          data={uForm}
          onChange={setUForm}
          onSave={saveUser}
          onClose={closeModal}
        />
      )}
    </div>
  );
}