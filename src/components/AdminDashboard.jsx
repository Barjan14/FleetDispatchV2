<<<<<<< HEAD
import React, { useState, useEffect, useCallback } from 'react';
=======
import React, { useState, useEffect, useCallback, useMemo } from 'react';
>>>>>>> Iyanu
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.v2.css';
import { supabase } from '../supabaseClient';

<<<<<<< HEAD
// ─── HELPER BADGES ──────────────────────────────────────────
function condBadge(c) {
  const map = { Good: 'b-good', Fair: 'b-fair', 'Under Repair': 'b-repair', 'Out of Service': 'b-out' };
  return map[c] || 'b-out';
}
function bookBadge(s) {
  const map = { Pending: 'b-pending', Approved: 'b-approved', Rejected: 'b-rejected', Ongoing: 'b-ongoing', Returned: 'b-returned' };
  return map[s] || '';
}
=======
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
>>>>>>> Iyanu

const NAV = [
  { key: 'overview', icon: '📊', label: 'Overview' },
  { key: 'vehicles', icon: '🚗', label: 'Vehicles' },
<<<<<<< HEAD
  { key: 'users', icon: '👥', label: 'Users' },
  { key: 'bookings', icon: '📅', label: 'Bookings' },
=======
  { key: 'users',    icon: '👥', label: 'Users'    },
  { key: 'bookings', icon: '📅', label: 'Bookings' },
  { key: 'fleets',   icon: '🗂️', label: 'Fleets'   },
  { key: 'logs',     icon: '📋', label: 'Logs'     },
>>>>>>> Iyanu
];

export default function AdminDashboard() {
  const navigate = useNavigate();
<<<<<<< HEAD
=======
  
  // UI State
>>>>>>> Iyanu
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: '', type: '' });
  const [showUserMenu, setShowUserMenu] = useState(false);
<<<<<<< HEAD

=======
  const [vehicleSort, setVehicleSort] = useState('name_asc');

  // Data State
>>>>>>> Iyanu
  const [adminUser, setAdminUser] = useState({});
  const [stats, setStats] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
<<<<<<< HEAD
  const [bookings, setBookings] = useState([]);

  const [modal, setModal] = useState('');
  const [sel, setSel] = useState(null);

  // Forms
  const [uForm, setUForm] = useState({ email: '', password: '', is_staff: false, profile: { employee_id: '', department: '' } });
  const [vForm, setVForm] = useState({ name: '', plate_number: '', model: '', year: '', condition: 'Good' });

=======
  const [fleets, setFleets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [vehicleLogs, setVehicleLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Modal State
  const [modalType, setModalType] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  // Form State
  const [vForm, setVForm] = useState({ 
    name: '', 
    plate_number: '', 
    model: '', 
    year: '', 
    fuel_type: 'Diesel',
    condition: 'Good', 
    odometer_km: 0,
    is_available: true,
    fleet_id: '',
    image_url: '' // <-- ADD THIS
  });
  const [uForm, setUForm] = useState({
    username: '', 
    is_staff: false,
    profile: { employee_id: '', department: '', phone: '' }
  });

  // ── Helper: Show Toast ──────────────────────────────────────
>>>>>>> Iyanu
  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

<<<<<<< HEAD
  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') { navigate('/admin-login'); return; }
=======
  // ── Auth Guard ────────────────────────────────────────────
  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      navigate('/admin-login');
      return;
    }
>>>>>>> Iyanu
    const stored = localStorage.getItem('adminUser');
    if (stored) setAdminUser(JSON.parse(stored));
  }, [navigate]);

<<<<<<< HEAD
  const fetchAll = useCallback(async () => {
    try {
      const [vRes, uRes, bRes] = await Promise.all([
        supabase.from('vehicles').select('*').order('name'),
        supabase.from('employee_profiles').select('*').order('created_at'),
        supabase.from('vehicle_bookings').select('*, vehicles(name), employee_profiles(employee_id)').order('created_at', { ascending: false })
      ]);

      setVehicles(vRes.data || []);
      setUsers(uRes.data || []);
      setBookings(bRes.data || []);
      
      setStats({
        totalVehicles: vRes.data?.length || 0,
        totalUsers: uRes.data?.length || 0,
        pendingBookings: bRes.data?.filter(b => b.status === 'Pending').length || 0
      });
    } catch (e) {
=======
  // ── Data Fetching ──────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin-login');
        return;
      }

      const [vRes, uRes, fRes, bRes, cV, cU, cF, cB, cP, cO] = await Promise.all([
        supabase.from('vehicles').select('*').order('name'),
        supabase.from('employee_profiles').select('*').order('created_at'),
        supabase.from('fleets').select('*, vehicles(id)'),
        supabase.from('vehicle_bookings').select(`
          *,
          vehicles ( id, name, plate_number ),
          employee_profiles!vehicle_bookings_user_id_fkey ( employee_id )
        `).order('created_at', { ascending: false }),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }),
        supabase.from('employee_profiles').select('*', { count: 'exact', head: true }),
        supabase.from('fleets').select('*', { count: 'exact', head: true }),
        supabase.from('vehicle_bookings').select('*', { count: 'exact', head: true }),
        supabase.from('vehicle_bookings').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
        supabase.from('vehicle_bookings').select('*', { count: 'exact', head: true }).eq('status', 'Ongoing'),
      ]);

      setVehicles(vRes.data || []);
      
      setUsers((uRes.data || []).map(usr => ({
        id: usr.id,
        user_id: usr.user_id,
        username: usr.employee_id || '—',
        is_staff: usr.role === 'admin',
        profile: {
          employee_id: usr.employee_id || '',
          department: usr.department || '',
          phone: usr.phone || '',
        },
      })));

      setFleets((fRes.data || []).map(fl => ({ ...fl, vehicles: fl.vehicles || [] })));

      setBookings((bRes.data || []).map(bk => ({
        ...bk,
        user: {
          username: bk.employee_profiles?.employee_id || 'Unknown',
          profile: { employee_id: bk.employee_profiles?.employee_id || '' },
        },
        vehicle: bk.vehicles || {}, 
      })));

      setStats({
        totalVehicles: cV.count || 0,
        totalUsers: cU.count || 0,
        totalFleets: cF.count || 0,
        totalBookings: cB.count || 0,
        pendingBookings: cP.count || 0,
        ongoingBookings: cO.count || 0,
      });

    } catch (e) {
      console.error('Fetch Error:', e);
>>>>>>> Iyanu
      showToast('Failed to load data.', 'err');
    } finally {
      setLoading(false);
    }
<<<<<<< HEAD
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const closeModal = () => { setModal(''); setSel(null); };

  // ── VEHICLE ACTIONS ───────────────────────────────────────
  const openAddVehicle = () => {
    setVForm({ name: '', plate_number: '', model: '', year: '', condition: 'Good' });
    setSel(null);
    setModal('vForm');
  };

  const saveVehicle = async () => {
    try {
      const payload = { ...vForm, year: vForm.year ? parseInt(vForm.year) : null };
      const { error } = sel 
        ? await supabase.from('vehicles').update(payload).eq('id', sel.id)
        : await supabase.from('vehicles').insert([payload]);

      if (error) throw error;
      showToast(sel ? 'Vehicle updated!' : 'Vehicle added!');
      closeModal(); fetchAll();
    } catch (err) { showToast(err.message, 'err'); }
  };

  // ── USER ACTIONS (Direct Create) ─────────────────────────
  const openAddUser = () => {
    setUForm({ email: '', password: '', is_staff: false, profile: { employee_id: '', department: '' } });
    setSel(null);
    setModal('uForm');
=======
  }, [navigate]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Sorting ───────────────────────────────────────────────
  const sortedVehicles = useMemo(() => {
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
    const next = order[(order.indexOf(vehicleSort)+1) % order.length];
    setVehicleSort(next);
    const label = { name_asc:'Name (A→Z)', name_desc:'Name (Z→A)', condition:'Condition', available:'Availability', newest:'Newest' }[next];
    showToast(`Sorted by: ${label}`, 'ok');
  };
  // ── Vehicle CRUD ──────────────────────────────────────────
  const openAddVehicle = () => {
    setVForm({ 
      name: '', plate_number: '', model: '', year: '', 
      fuel_type: 'Diesel', condition: 'Good', odometer_km: 0,
      is_available: true, fleet_id: '',
      image_url: '' // <-- ADD THIS
    });
    setModalType('addVehicle');
  };

  const openEditVehicle = (v) => {
    setVForm({ ...v, year: v.year?.toString() || '' });
    setSelectedVehicle(v);
    setModalType('editVehicle');
  };
  const saveVehicle = async () => {
    const isEdit = modalType === 'editVehicle';

    const payload = { 
      name: vForm.name, 
      plate_number: vForm.plate_number, 
      model: vForm.model, 
      year: vForm.year ? parseInt(vForm.year) : null,
      fuel_type: vForm.fuel_type,
      condition: vForm.condition,
      odometer_km: parseFloat(vForm.odometer_km) || 0,
      is_available: vForm.is_available !== false,
      fleet_id: vForm.fleet_id || null,
      image_url: vForm.image_url
    };

    try {
      if (isEdit) {
        const vehicleId = selectedVehicle?.id;

        if (!vehicleId) {
          showToast('No vehicle selected', 'err');
          return;
        }

        await logVehicleUpdate(
          selectedVehicle,
          { ...selectedVehicle, ...payload },
          adminUser.username || 'admin'
        );

        const { error } = await supabase
          .from('vehicles')
          .update(payload)
          .eq('id', vehicleId);

        if (error) throw error;

      } else {
        const { data, error } = await supabase
          .from('vehicles')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;

        await logVehicleChange(
          'create',
          data.id,
          data.name,
          adminUser.username || 'admin'
        );
      }

      showToast('Vehicle saved successfully');
      setModalType('');
      fetchAll();

    } catch (err) {
      showToast(err.message, 'err');
    }
  };
  const handleDeleteVehicle = async (id) => {
    if (window.confirm('Delete this vehicle?')) {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) showToast(error.message, 'err');
      else { showToast('Vehicle removed'); fetchAll(); }
    }
  };

  // ── User CRUD ─────────────────────────────────────────────
  const openEditUser = (u) => {
    setSelectedUser(u);
    setUForm({
      username: u.username,
      is_staff: u.is_staff,
      profile: u.profile
    });
    setModalType('editUser');
>>>>>>> Iyanu
  };

  const saveUser = async () => {
    try {
<<<<<<< HEAD
      if (sel) {
        const { error } = await supabase.from('employee_profiles').update({
          employee_id: uForm.profile.employee_id,
          department: uForm.profile.department,
          role: uForm.is_staff ? 'admin' : 'user',
        }).eq('id', sel.id);
        if (error) throw error;
      } else {
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: uForm.email, password: uForm.password, email_confirm: true 
        });
        if (authError) throw authError;

        const { error: pErr } = await supabase.from('employee_profiles').insert([{
          user_id: authData.user.id, employee_id: uForm.profile.employee_id,
          department: uForm.profile.department, role: uForm.is_staff ? 'admin' : 'user'
        }]);
        if (pErr) throw pErr;
      }
      showToast('Success!'); closeModal(); fetchAll();
    } catch (err) { showToast(err.message, 'err'); }
  };

  if (loading) return <div className="admin-loading">Loading...</div>;
=======
      const { error } = await supabase.from('employee_profiles').update({
        employee_id: uForm.profile.employee_id,
        department: uForm.profile.department,
        phone: uForm.profile.phone,
        role: uForm.is_staff ? 'admin' : 'user'
      }).eq('id', selectedUser.id);
      
      if (error) throw error;
      showToast('User updated');
      setModalType('');
      fetchAll();
    } catch (err) { showToast(err.message, 'err'); }
  };

  // ── Bookings ──────────────────────────────────────────────
  const bookingAction = async (id, status) => {
    const booking = bookings.find(x => x.id === id);
    const updates = { status };
    
    try {
      if (status === 'Returned') {
        updates.actual_return = new Date().toISOString();
        await supabase.from('vehicles').update({ is_available: true }).eq('id', booking.vehicle_id);
      }
      if (status === 'Ongoing') {
        await supabase.from('vehicles').update({ is_available: false }).eq('id', booking.vehicle_id);
      }

      const { error } = await supabase.from('vehicle_bookings').update(updates).eq('id', id);
      if (error) throw error;
      showToast(`Booking ${status}`);
      fetchAll();
    } catch (err) { showToast(err.message, 'err'); }
  };

  // ── Logout ───────────────────────────────────────────────
  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.clear();
    navigate('/admin-login');
  };

  if (loading) return <div className="admin-loading"><div className="spinner">Loading System...</div></div>;
>>>>>>> Iyanu

  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-logo">Fleet<span>Dispatch</span></div>
        {NAV.map(n => (
          <div key={n.key} className={`admin-nav ${tab === n.key ? 'active' : ''}`} onClick={() => setTab(n.key)}>
            <span className="admin-icon">{n.icon}</span>
            <span>{n.label}</span>
<<<<<<< HEAD
          </div>
        ))}
=======
            {n.key === 'bookings' && stats.pendingBookings > 0 && <span className="admin-badge-notif">{stats.pendingBookings}</span>}
          </div>
        ))}
        <div className="admin-footer">FleetDispatch v2.0</div>
>>>>>>> Iyanu
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <h1>{NAV.find(n => n.key === tab)?.label}</h1>
<<<<<<< HEAD
          <button className="admin-user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>{adminUser.username || 'Admin'}</button>
=======
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
>>>>>>> Iyanu
        </div>

        {toast.msg && <div className={`admin-toast ${toast.type === 'err' ? 'error' : 'success'}`}>{toast.msg}</div>}

<<<<<<< HEAD
        {tab === 'overview' && (
          <div className="admin-stats-grid">
            <div className="admin-stat-card"><h2>{stats.totalVehicles}</h2><p>Total Vehicles</p></div>
            <div className="admin-stat-card"><h2>{stats.totalUsers}</h2><p>Total Users</p></div>
            <div className="admin-stat-card"><h2>{stats.pendingBookings}</h2><p>Pending Requests</p></div>
          </div>
        )}

        {tab === 'vehicles' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Vehicle List</h3>
              <button className="admin-btn admin-btn-primary" onClick={openAddVehicle}>+ Add Vehicle</button>
            </div>
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Plate</th><th>Condition</th><th>Actions</th></tr></thead>
              <tbody>
                {vehicles.map(v => (
                  <tr key={v.id}>
                    <td>{v.name}</td>
                    <td>{v.plate_number}</td>
                    <td><span className={`admin-badge ${condBadge(v.condition)}`}>{v.condition}</span></td>
                    <td><button className="admin-btn" onClick={() => { setSel(v); setVForm(v); setModal('vForm'); }}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'users' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>System Users</h3>
              <button className="admin-btn admin-btn-primary" onClick={openAddUser}>+ Add User</button>
            </div>
            <table className="admin-table">
              <thead><tr><th>Employee ID</th><th>Dept</th><th>Role</th><th>Actions</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}><td>{u.employee_id}</td><td>{u.department}</td><td>{u.role}</td><td><button className="admin-btn" onClick={() => { setSel(u); setUForm({ ...uForm, profile: u, is_staff: u.role === 'admin' }); setModal('uForm'); }}>Edit</button></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* ── MODALS ── */}
      {modal === 'vForm' && (
        <div className="admin-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{sel ? 'Edit Vehicle' : 'Add Vehicle'}</h3>
            <div className="admin-modal-body">
              <label>Vehicle Name</label>
              <input className="admin-input" value={vForm.name} onChange={e => setVForm({...vForm, name: e.target.value})} />
              <label>Plate Number</label>
              <input className="admin-input" value={vForm.plate_number} onChange={e => setVForm({...vForm, plate_number: e.target.value})} />
              <label>Condition</label>
              <select className="admin-input" value={vForm.condition} onChange={e => setVForm({...vForm, condition: e.target.value})}>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Under Repair">Under Repair</option>
              </select>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-primary" onClick={saveVehicle}>Save Vehicle</button>
            </div>
          </div>
        </div>
      )}

      {modal === 'uForm' && (
        <div className="admin-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{sel ? 'Edit User' : 'Add User'}</h3>
            <div className="admin-modal-body">
              {!sel && (
                <>
                  <label>Email</label>
                  <input className="admin-input" type="email" value={uForm.email} onChange={e => setUForm({...uForm, email: e.target.value})} />
                  <label>Password</label>
                  <input className="admin-input" type="password" value={uForm.password} onChange={e => setUForm({...uForm, password: e.target.value})} />
                </>
              )}
              <label>Employee ID</label>
              <input className="admin-input" value={uForm.profile.employee_id} onChange={e => setUForm({...uForm, profile: {...uForm.profile, employee_id: e.target.value}})} />
              <label>Department</label>
              <input className="admin-input" value={uForm.profile.department} onChange={e => setUForm({...uForm, profile: {...uForm.profile, department: e.target.value}})} />
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-primary" onClick={saveUser}>{sel ? 'Update' : 'Create User'}</button>
            </div>
          </div>
        </div>
=======
        {tab === 'overview' && <OverviewPage stats={stats} />}
        
        {tab === 'vehicles' && (
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
        )}

        {tab === 'users' && (
          <UsersPage 
            users={users} 
            onAdd={() => setModalType('addUser')} 
            onEdit={openEditUser} 
            onDelete={(id) => { if(window.confirm('Delete user?')) supabase.from('employee_profiles').delete().eq('id', id).then(fetchAll); }} 
          />
        )}

        {tab === 'bookings' && (
          <BookingsPage 
            bookings={bookings} 
            onApprove={(id) => bookingAction(id, 'Approved')} 
            onReject={(id) => bookingAction(id, 'Rejected')} 
            onMarkOngoing={(id) => bookingAction(id, 'Ongoing')} 
            onMarkReturned={(id) => bookingAction(id, 'Returned')} 
          />
        )}

        {tab === 'fleets' && <FleetsPage fleets={fleets} />}
        
        {tab === 'logs' && (
          <VehicleLogsPage 
            logs={vehicleLogs} 
            loading={logsLoading} 
            onRefresh={() => fetchVehicleChangeLogs().then(setVehicleLogs)} 
          />
        )}
      </main>

      {/* Modals Section */}
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
>>>>>>> Iyanu
      )}
    </div>
  );
}