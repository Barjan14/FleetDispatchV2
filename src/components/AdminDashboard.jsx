import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.v2.css';
import { supabase } from '../supabaseClient';

// ─── helper badges (unchanged) ──────────────────────────────
function condBadge(c) {
  const map = { Good:'b-good', Fair:'b-fair', 'Under Repair':'b-repair', 'Out of Service':'b-out' };
  return map[c] || 'b-out';
}
function bookBadge(s) {
  const map = { Pending:'b-pending', Approved:'b-approved', Rejected:'b-rejected', Ongoing:'b-ongoing', Returned:'b-returned' };
  return map[s] || '';
}

const NAV = [
  { key:'overview',  icon:'📊', label:'Overview'  },
  { key:'vehicles',  icon:'🚗', label:'Vehicles'  },
  { key:'users',     icon:'👥', label:'Users'     },
  { key:'bookings',  icon:'📅', label:'Bookings'  },
  { key:'fleets',    icon:'🗂️', label:'Fleets'    },
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

  const [modal, setModal] = useState('');
  const [sel, setSel]     = useState(null);

  const [vForm, setVForm] = useState({ name:'', plate_number:'', model:'', year:'', condition:'Good', fleet_id:'' });
  // uForm mirrors old shape so modal JSX stays identical
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

  const closeModal = () => { setModal(''); setSel(null); };

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
    setModal('addVehicle');
  };
  const openEditVehicle = (v) => {
    setVForm({ name:v.name, plate_number:v.plate_number, model:v.model||'', year:v.year||'', condition:v.condition||'Good', fleet_id:v.fleet_id||'' });
    setSel(v); setModal('editVehicle');
  };

  const saveVehicle = async () => {
    const isEdit = modal === 'editVehicle';
    const payload = {
      name:         vForm.name,
      plate_number: vForm.plate_number,
      model:        vForm.model,
      year:         vForm.year ? parseInt(vForm.year) : null,
      condition:    vForm.condition,
      fleet_id:     vForm.fleet_id || null,
    };
    const { error } = isEdit
      ? await supabase.from('vehicles').update(payload).eq('id', sel.id)
      : await supabase.from('vehicles').insert(payload);
    if (error) { showToast('Error: ' + error.message, 'err'); return; }
    showToast(isEdit ? 'Vehicle updated!' : 'Vehicle added!');
    closeModal(); fetchAll();
  };

  const deleteVehicle = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (error) { showToast('Error: ' + error.message, 'err'); return; }
    showToast('Vehicle deleted.'); fetchAll();
  };

  // ── USER CRUD ─────────────────────────────────────────────
  const openAddUser = () => {
    setUForm({ username:'', email:'', password:'', is_staff:false, profile:{ employee_id:'', department:'', phone:'' } });
    setModal('addUser');
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
    setSel(u); setModal('editUser');
  };

  const saveUser = async () => {
    if (!uForm.email) { showToast('Email is required', 'err'); return; }
    const isEdit = modal === 'editUser';

    if (isEdit) {
      // Update profile row
      const { error } = await supabase.from('employee_profiles').update({
        employee_id: uForm.profile.employee_id,
        department:  uForm.profile.department,
        phone:       uForm.profile.phone,
        role:        uForm.is_staff ? 'admin' : 'user',
      }).eq('id', sel.id);
      if (error) { showToast('Error: ' + error.message, 'err'); return; }
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
    closeModal(); fetchAll();
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
    if (error) { showToast('Error: ' + error.message, 'err'); return; }
    showToast(`Booking marked as ${newStatus}!`); fetchAll();
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
        )}

        {/* OVERVIEW */}
        {tab==='overview' && (
          <div className="admin-stats-grid">
            {[
              {icon:'🚗', label:'Vehicles', value:stats.totalVehicles||0},
              {icon:'👥', label:'Users',    value:stats.totalUsers||0},
              {icon:'🗂️', label:'Fleets',   value:stats.totalFleets||0},
              {icon:'📅', label:'Pending',  value:stats.pendingBookings||0},
            ].map(s=>(
              <div className="admin-stat-card" key={s.label}>
                <div className="admin-stat-icon">{s.icon}</div>
                <div className="admin-stat-info"><p>{s.label}</p><h2>{s.value}</h2></div>
              </div>
            ))}
          </div>
        )}

        {/* VEHICLES */}
        {tab==='vehicles' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Vehicles <span className="admin-count">{vehicles.length}</span></h3>
              <div className="admin-actions">
                <button className="admin-btn admin-btn-outline" type="button" onClick={cycleVehicleSort} title="Cycle sort order">⇅ Sort</button>
                <button className="admin-btn admin-btn-primary" onClick={openAddVehicle}>+ Add Vehicle</button>
              </div>
            </div>
            <div className="admin-vehicle-grid">
              {vehicles.length===0 && <div className="admin-empty">No vehicles yet.</div>}
              {sortedVehicles.map(v => (
                <button key={v.id} type="button" className="admin-vehicle-card" onClick={()=>{setSel(v);setModal('vehicleDetails');}}>
                  <div className="admin-vehicle-media"><div className="admin-vehicle-img" aria-hidden="true"/></div>
                  <div className="admin-vehicle-body">
                    <div className="admin-vehicle-title-row">
                      <div className="admin-vehicle-title">
                        <span className="admin-bold">{v.name}</span>
                        <span className="admin-muted-sm">#{v.id} • {v.plate_number}</span>
                      </div>
                      <span className={`admin-badge ${condBadge(v.condition)}`}>{v.condition}</span>
                    </div>
                    <div className="admin-vehicle-meta">
                      <span className="admin-muted">{v.model} {v.year}</span>
                      <span className={`admin-badge ${v.is_available?'b-approved':'b-rejected'}`}>{v.is_available?'Available':'Unavailable'}</span>
                    </div>
                    <div className="admin-vehicle-actions" onClick={e=>e.stopPropagation()}>
                      <button className="admin-btn admin-btn-primary" type="button" onClick={()=>openEditVehicle(v)}>Edit</button>
                      <button className="admin-btn admin-btn-danger"  type="button" onClick={()=>deleteVehicle(v.id)}>Delete</button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* USERS */}
        {tab==='users' && (
          <div className="admin-card admin-card-compact">
            <div className="admin-card-header">
              <h3>Users <span className="admin-count">{users.length}</span></h3>
              <button className="admin-btn admin-btn-primary" onClick={openAddUser}>+ Add User</button>
            </div>
            <div className="admin-table-scroll">
              <table className="admin-table">
                <thead>
                  <tr><th>ID</th><th>Username</th><th>Email</th><th>Department</th><th>Role</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {users.length===0 && <tr><td colSpan={6} className="admin-empty">No users yet.</td></tr>}
                  {users.map(u=>(
                    <tr key={u.id}>
                      <td><code className="admin-code">#{u.id}</code></td>
                      <td className="admin-bold">{u.username}</td>
                      <td className="admin-muted">{u.email||'—'}</td>
                      <td className="admin-muted">{u.profile?.department||'—'}</td>
                      <td><span className={`admin-badge ${u.is_staff?'b-approved':'b-ongoing'}`}>{u.is_staff?'Admin':'User'}</span></td>
                      <td className="admin-actions">
                        <button className="admin-btn admin-btn-primary" onClick={()=>openEditUser(u)}>Edit</button>
                        <button className="admin-btn admin-btn-danger"  onClick={()=>deleteUser(u.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* BOOKINGS */}
        {tab==='bookings' && (
          <div className="admin-card">
            <div className="admin-card-header">
              <h3>Bookings <span className="admin-count">{bookings.filter(b=>b.status==='Pending').length} pending</span></h3>
            </div>
            <table className="admin-table">
              <thead>
                <tr><th>ID</th><th>Employee</th><th>Vehicle</th><th>Start</th><th>End</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {bookings.length===0 && <tr><td colSpan={7} className="admin-empty">No bookings yet.</td></tr>}
                {bookings.map(b=>(
                  <tr key={b.id}>
                    <td className="admin-muted">#{b.id}</td>
                    <td>
                      <div className="admin-bold">{b.user?.username}</div>
                      <div className="admin-muted-sm">{b.user?.profile?.employee_id||'No EMP ID'}</div>
                    </td>
                    <td>
                      <div className="admin-bold">{b.vehicle?.name}</div>
                      <div className="admin-muted-sm">{b.vehicle?.plate_number}</div>
                    </td>
                    <td className="admin-muted-sm">{new Date(b.start_datetime).toLocaleString()}</td>
                    <td className="admin-muted-sm">{new Date(b.end_datetime).toLocaleString()}</td>
                    <td><span className={`admin-badge ${bookBadge(b.status)}`}>{b.status}</span></td>
                    <td className="admin-actions">
                      {b.status==='Pending'  && <><button className="admin-btn admin-btn-success" onClick={()=>bookingAction(b.id,'Approved')}>Approve</button><button className="admin-btn admin-btn-danger" onClick={()=>bookingAction(b.id,'Rejected')}>Reject</button></>}
                      {b.status==='Approved' && <button className="admin-btn admin-btn-warning" onClick={()=>bookingAction(b.id,'Ongoing')}>Mark Ongoing</button>}
                      {b.status==='Ongoing'  && <button className="admin-btn admin-btn-outline" onClick={()=>bookingAction(b.id,'Returned')}>Mark Returned</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* FLEETS */}
        {tab==='fleets' && (
          <div className="admin-card">
            <div className="admin-card-header"><h3>Fleets</h3></div>
            <table className="admin-table">
              <thead><tr><th>ID</th><th>Name</th><th>Vehicles</th></tr></thead>
              <tbody>
                {fleets.length===0 && <tr><td colSpan={3} className="admin-empty">No fleets.</td></tr>}
                {fleets.map(f=>(
                  <tr key={f.id}>
                    <td className="admin-muted">#{f.id}</td>
                    <td className="admin-bold">{f.name}</td>
                    <td><span className="admin-badge b-ongoing">{f.vehicles?.length||0}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* VEHICLE DETAILS MODAL */}
      {modal==='vehicleDetails' && sel && (
        <div className="admin-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e=>e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Vehicle Details</h3>
              <button className="admin-btn admin-btn-outline admin-close" onClick={closeModal}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-vehicle-detail">
                <div className="admin-vehicle-detail-media" aria-hidden="true"/>
                <div className="admin-vehicle-detail-info">
                  <div className="admin-vehicle-detail-title">
                    <div>
                      <div className="admin-bold" style={{fontSize:'16px'}}>{sel.name}</div>
                      <div className="admin-muted-sm">#{sel.id} • {sel.plate_number}</div>
                    </div>
                    <span className={`admin-badge ${condBadge(sel.condition)}`}>{sel.condition}</span>
                  </div>
                  <div className="admin-vehicle-detail-grid">
                    <div><div className="admin-muted-sm">Model</div><div className="admin-bold">{sel.model||'—'}</div></div>
                    <div><div className="admin-muted-sm">Year</div><div className="admin-bold">{sel.year||'—'}</div></div>
                    <div>
                      <div className="admin-muted-sm">Availability</div>
                      <span className={`admin-badge ${sel.is_available?'b-approved':'b-rejected'}`}>{sel.is_available?'Available':'Unavailable'}</span>
                    </div>
                  </div>
                  <div className="admin-vehicle-detail-actions">
                    <button className="admin-btn admin-btn-primary" type="button" onClick={()=>setModal('editVehicle')}>Edit</button>
                    <button className="admin-btn admin-btn-danger"  type="button" onClick={()=>deleteVehicle(sel.id)}>Delete</button>
                  </div>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-outline" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT VEHICLE MODAL */}
      {(modal==='addVehicle'||modal==='editVehicle') && (
        <div className="admin-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e=>e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{modal==='addVehicle'?'Add Vehicle':'Edit Vehicle'}</h3>
              <button className="admin-btn admin-btn-outline admin-close" onClick={closeModal}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-row">
                <div className="admin-form-group"><label>Vehicle Name *</label><input value={vForm.name} onChange={e=>setVForm({...vForm,name:e.target.value})} placeholder="e.g. Toyota Hilux"/></div>
                <div className="admin-form-group"><label>Plate Number *</label><input value={vForm.plate_number} onChange={e=>setVForm({...vForm,plate_number:e.target.value})} placeholder="e.g. ABC-1234"/></div>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group"><label>Model</label><input value={vForm.model} onChange={e=>setVForm({...vForm,model:e.target.value})} placeholder="e.g. Hilux Revo"/></div>
                <div className="admin-form-group"><label>Year</label><input type="number" value={vForm.year} onChange={e=>setVForm({...vForm,year:e.target.value})} placeholder="e.g. 2022"/></div>
              </div>
              <div className="admin-form-group">
                <label>Condition</label>
                <select value={vForm.condition} onChange={e=>setVForm({...vForm,condition:e.target.value})}>
                  <option>Good</option><option>Fair</option><option>Under Repair</option><option>Out of Service</option>
                </select>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-outline" onClick={closeModal}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={saveVehicle}>{modal==='addVehicle'?'Add Vehicle':'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT USER MODAL */}
      {(modal==='addUser'||modal==='editUser') && (
        <div className="admin-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e=>e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{modal==='addUser'?'Add User':'Edit User'}</h3>
              <button className="admin-btn admin-btn-outline admin-close" onClick={closeModal}>✕</button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-row">
                <div className="admin-form-group"><label>Username *</label><input value={uForm.username} onChange={e=>setUForm({...uForm,username:e.target.value})} placeholder="johndoe"/></div>
                <div className="admin-form-group"><label>Employee ID</label><input value={uForm.profile.employee_id} onChange={e=>setUForm({...uForm,profile:{...uForm.profile,employee_id:e.target.value}})} placeholder="EMP-001"/></div>
              </div>
              <div className="admin-form-group"><label>Email *</label><input type="email" value={uForm.email} onChange={e=>setUForm({...uForm,email:e.target.value})} placeholder="john@company.com"/></div>
              <div className="admin-form-group">
                <label>{modal==='editUser'?'New Password (leave blank to keep)':'Password *'}</label>
                <input type="password" value={uForm.password} onChange={e=>setUForm({...uForm,password:e.target.value})} placeholder="••••••••"/>
              </div>
              <div className="admin-form-row">
                <div className="admin-form-group"><label>Department</label><input value={uForm.profile.department} onChange={e=>setUForm({...uForm,profile:{...uForm.profile,department:e.target.value}})} placeholder="e.g. Logistics"/></div>
                <div className="admin-form-group"><label>Phone</label><input value={uForm.profile.phone} onChange={e=>setUForm({...uForm,profile:{...uForm.profile,phone:e.target.value}})} placeholder="09XX-XXX-XXXX"/></div>
              </div>
              <div className="admin-form-group">
                <label className="admin-checkbox">
                  <input type="checkbox" checked={uForm.is_staff} onChange={e=>setUForm({...uForm,is_staff:e.target.checked})}/>
                  <span>Grant Admin Access</span>
                </label>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-outline" onClick={closeModal}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={saveUser}>{modal==='addUser'?'Add User':'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}