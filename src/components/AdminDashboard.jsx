import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.v2.css';
import { supabase } from '../supabaseClient';

// ─── HELPER BADGES ──────────────────────────────────────────
function condBadge(c) {
  const map = { Good: 'b-good', Fair: 'b-fair', 'Under Repair': 'b-repair', 'Out of Service': 'b-out' };
  return map[c] || 'b-out';
}
function bookBadge(s) {
  const map = { Pending: 'b-pending', Approved: 'b-approved', Rejected: 'b-rejected', Ongoing: 'b-ongoing', Returned: 'b-returned' };
  return map[s] || '';
}

const NAV = [
  { key: 'overview', icon: '📊', label: 'Overview' },
  { key: 'vehicles', icon: '🚗', label: 'Vehicles' },
  { key: 'users', icon: '👥', label: 'Users' },
  { key: 'bookings', icon: '📅', label: 'Bookings' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ msg: '', type: '' });
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [adminUser, setAdminUser] = useState({});
  const [stats, setStats] = useState({});
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [modal, setModal] = useState('');
  const [sel, setSel] = useState(null);

  // Forms
  const [uForm, setUForm] = useState({ email: '', password: '', is_staff: false, profile: { employee_id: '', department: '' } });
  const [vForm, setVForm] = useState({ name: '', plate_number: '', model: '', year: '', condition: 'Good' });

  const showToast = (msg, type = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  useEffect(() => {
    if (localStorage.getItem('isAdmin') !== 'true') { navigate('/admin-login'); return; }
    const stored = localStorage.getItem('adminUser');
    if (stored) setAdminUser(JSON.parse(stored));
  }, [navigate]);

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
      showToast('Failed to load data.', 'err');
    } finally {
      setLoading(false);
    }
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
  };

  const saveUser = async () => {
    try {
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

  return (
    <div className="admin-root">
      <aside className="admin-sidebar">
        <div className="admin-logo">Fleet<span>Dispatch</span></div>
        {NAV.map(n => (
          <div key={n.key} className={`admin-nav ${tab === n.key ? 'active' : ''}`} onClick={() => setTab(n.key)}>
            <span className="admin-icon">{n.icon}</span>
            <span>{n.label}</span>
          </div>
        ))}
      </aside>

      <main className="admin-main">
        <div className="admin-topbar">
          <h1>{NAV.find(n => n.key === tab)?.label}</h1>
          <button className="admin-user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>{adminUser.username || 'Admin'}</button>
        </div>

        {toast.msg && <div className={`admin-toast ${toast.type === 'err' ? 'error' : 'success'}`}>{toast.msg}</div>}

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
      )}
    </div>
  );
}