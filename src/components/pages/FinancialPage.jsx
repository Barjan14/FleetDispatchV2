import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Palette (matches AdminDashboard.v2.css variables) ─────
const C = {
  primary: '#4f46e5', primaryL: '#eef2ff',
  success: '#10b981', successL: '#ecfdf5',
  danger:  '#ef4444', dangerL:  '#fef2f2',
  warn:    '#f97316', warnL:    '#fff7ed',
  muted:   '#64748b', border:   '#e2e8f0',
  card:    '#ffffff', bg:       '#f1f5f9',
  text:    '#1e293b',
};

// ── Icons ─────────────────────────────────────────────────
const Icons = {
  Download: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Refresh: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
};

// ── CSS Styles ────────────────────────────────────────────
const css = `
  /* ✅ FIXED: Added padding to perfectly match the Overview page and other tabs */
  .fin-root { display: flex; flex-direction: column; gap: 20px; padding: 0 20px 16px 20px; height: 100%; max-height: calc(100vh - 90px); box-sizing: border-box; overflow: hidden; }
  .fin-tabs-container { display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; flex-wrap: wrap; gap: 12px; }
  .fin-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
  .fin-tab { padding: 8px 18px; border-radius: 8px; border: 1.5px solid ${C.border}; background: ${C.card}; color: ${C.muted}; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
  .fin-tab:hover { border-color: ${C.primary}; color: ${C.primary}; }
  .fin-tab.active { background: ${C.primary}; color: #fff; border-color: ${C.primary}; }
  .fin-summary { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; flex-shrink: 0; }
  .fin-stat { background: ${C.card}; border-radius: 12px; padding: 18px 20px; box-shadow: 0 1px 4px rgba(0,0,0,.06); display: flex; align-items: center; gap: 14px; }
  .fin-stat-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; flex-shrink: 0; }
  .fin-stat-info p { font-size: 11px; color: ${C.muted}; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; margin: 0; }
  .fin-stat-info h3 { font-size: 22px; font-weight: 700; margin: 2px 0 0 0; }
  
  .fin-card { background: ${C.card}; border-radius: 12px; box-shadow: 0 1px 4px rgba(0,0,0,.06); display: flex; flex-direction: column; flex: 1 1 auto; min-height: 0; overflow: hidden; }
  .fin-card-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 22px; border-bottom: 1px solid ${C.border}; flex-shrink: 0; background: ${C.card}; }
  .fin-card-header h3 { font-size: 15px; font-weight: 600; margin: 0; }
  .fin-table-container { flex: 1 1 auto; overflow-y: auto; min-height: 0; }
  
  .fin-table { width: 100%; border-collapse: separate; border-spacing: 0; }
  .fin-table thead th { position: sticky; top: 0; background: #f8fafc; z-index: 10; padding: 10px 18px; text-align: left; font-size: 11px; font-weight: 700; color: ${C.muted}; text-transform: uppercase; letter-spacing: .5px; box-shadow: 0 1px 0 ${C.border}; }
  .fin-table td { padding: 12px 18px; font-size: 13px; border-bottom: 1px solid ${C.border}; vertical-align: middle; }
  .fin-table tr:last-child td { border-bottom: none; }
  .fin-table tr:hover td { background: #f8fafc; }
  .fin-empty { text-align: center; color: ${C.muted}; padding: 32px; font-size: 14px; }
  
  .fin-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 600; transition: opacity .15s; }
  .fin-btn:hover { opacity: .85; }
  .fin-btn:disabled { opacity: .5; cursor: not-allowed; }
  .fin-btn-primary { background: ${C.primary}; color: #fff; }
  .fin-btn-danger  { background: ${C.danger};  color: #fff; }
  .fin-btn-ghost   { background: transparent; color: ${C.muted}; border: 1px solid ${C.border}; }
  
  .fin-badge { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .fin-badge-fuel    { background: #dbeafe; color: #1e40af; }
  .fin-badge-repair  { background: #fee2e2; color: #991b1b; }
  .fin-badge-parts   { background: #fef9c3; color: #854d0e; }
  .fin-badge-ins     { background: #d1fae5; color: #065f46; }
  .fin-badge-reg     { background: #ede9fe; color: #5b21b6; }
  .fin-badge-dep     { background: #f1f5f9; color: #475569; }
  .fin-badge-other   { background: #fff7ed; color: #9a3412; }
  .fin-badge-pending  { background: #fef9c3; color: #854d0e; }
  .fin-badge-inprog   { background: #dbeafe; color: #1e40af; }
  .fin-badge-done     { background: #d1fae5; color: #065f46; }
  
  .fin-overlay { position: fixed; inset: 0; background: rgba(15,23,42,.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
  .fin-modal { background: ${C.card}; border-radius: 14px; width: 500px; max-width: 94%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,.15); }
  .fin-modal-head { padding: 16px 22px; border-bottom: 1px solid ${C.border}; font-size: 15px; font-weight: 600; display: flex; align-items: center; justify-content: space-between; flex-shrink: 0; }
  .fin-modal-body { padding: 22px; display: flex; flex-direction: column; gap: 13px; overflow-y: auto; }
  .fin-modal-foot { padding: 14px 22px; border-top: 1px solid ${C.border}; display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0; }
  .fin-fg { display: flex; flex-direction: column; gap: 5px; }
  .fin-fg label { font-size: 12px; font-weight: 600; color: ${C.muted}; }
  .fin-fg input, .fin-fg select, .fin-fg textarea { padding: 8px 11px; border: 1px solid ${C.border}; border-radius: 7px; font-size: 13px; outline: none; font-family: inherit; }
  .fin-fg input:focus, .fin-fg select:focus, .fin-fg textarea:focus { border-color: ${C.primary}; }
  .fin-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }
  .fin-toast { padding: 10px 16px; border-radius: 8px; font-size: 13px; margin-bottom: 4px; }
  .fin-toast.ok  { background: ${C.successL}; color: ${C.success}; }
  .fin-toast.err { background: ${C.dangerL};  color: ${C.danger};  }
  @media(max-width: 768px) { .fin-summary { grid-template-columns: 1fr 1fr; } }
`;

// ── Formatters & Helpers ──────────────────────────────────
const fmt  = (n) => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 });
const fmtD = (d) => d ? new Date(d).toLocaleDateString('en-PH') : '—';

const BADGE_MAP = {
  Fuel: 'fin-badge-fuel', Repair: 'fin-badge-repair', Parts: 'fin-badge-parts',
  Insurance: 'fin-badge-ins', Registration: 'fin-badge-reg',
  Depreciation: 'fin-badge-dep', Other: 'fin-badge-other',
};
const STATUS_BADGE = {
  Pending: 'fin-badge-pending', 'In Progress': 'fin-badge-inprog', Completed: 'fin-badge-done',
};

// ── Export Helpers ────────────────────────────────────────
const generateExcel = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Records");
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

const generatePDF = (title, columns, rows, filename) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 35,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }, 
    styles: { fontSize: 8 },
  });
  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ── Sub-components ────────────────────────────────────────
function SummaryBar({ fuel, maintenance, repairs }) {
  const totalFuel  = fuel.reduce((s, r) => s + Number(r.total_cost || 0), 0);
  const totalMaint = maintenance.reduce((s, r) => s + Number(r.amount || 0), 0);
  const totalRepair= repairs.reduce((s, r) => s + Number(r.repair_cost || 0), 0);
  const grandTotal = totalFuel + totalMaint + totalRepair;

  const stats = [
    { icon: '⛽', label: 'Total Fuel Cost',      value: fmt(totalFuel),   bg: '#dbeafe', color: '#1e40af' },
    { icon: '🔧', label: 'Maintenance Costs',       value: fmt(totalMaint),  bg: '#fef9c3', color: '#854d0e' },
    { icon: '🛠️', label: 'Repair Costs',            value: fmt(totalRepair), bg: '#fee2e2', color: '#991b1b' },
    { icon: '💰', label: 'Total Expenses',          value: fmt(grandTotal),  bg: '#d1fae5', color: '#065f46' },
  ];

  return (
    <div className="fin-summary">
      {stats.map(s => (
        <div className="fin-stat" key={s.label}>
          <div className="fin-stat-icon" style={{ background: s.bg, color: s.color }}>{s.icon}</div>
          <div className="fin-stat-info">
            <p>{s.label}</p>
            <h3 style={{ color: s.color }}>{s.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Fuel Records Tab ──────────────────────────────────────
function FuelTab({ vehicles, refreshKey }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [toast, setToast]     = useState('');
  const [form, setForm]       = useState({
    vehicle_id: '', date: '', liters: '', cost_per_liter: '',
    total_cost: '', odometer_km: '', station_name: '', notes: '',
  });

  const load = useCallback(async () => {
    const { data } = await supabase.from('fuel_records').select('*, vehicles(name, plate_number)').order('date', { ascending: false });
    setRecords(data || []);
    setLoading(false);
  }, []);

  // ✅ Listens to the manual sync button AND initial mount
  useEffect(() => { load(); }, [load, refreshKey]);

  useEffect(() => {
    const channel = supabase.channel('fuel-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fuel_records' }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const exportExcel = () => {
    const data = records.map(r => ({
      'Date': fmtD(r.date),
      'Vehicle': r.vehicles?.name || 'N/A',
      'Plate': r.vehicles?.plate_number || 'N/A',
      'Liters': Number(r.liters || 0).toFixed(2),
      'Cost/L': `PHP ${r.cost_per_liter}`,
      'Total Cost': `PHP ${r.total_cost}`,
      'Odometer': r.odometer_km,
      'Station': r.station_name || 'N/A'
    }));
    generateExcel(data, 'Fuel_Records');
  };

  const exportPDF = () => {
    const cols = ["Date", "Vehicle", "Liters", "Cost/L", "Total Cost", "Odometer", "Station"];
    const rows = records.map(r => [
      fmtD(r.date), r.vehicles?.name || 'N/A', `${Number(r.liters || 0).toFixed(2)} L`,
      fmt(r.cost_per_liter), fmt(r.total_cost), r.odometer_km || '—', r.station_name || '—'
    ]);
    generatePDF("Fuel Cost Records", cols, rows, "Fuel_Records");
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const save = async () => {
    const liters = parseFloat(form.liters) || 0;
    const cpp    = parseFloat(form.cost_per_liter) || 0;
    const { error } = await supabase.from('fuel_records').insert({
      vehicle_id: parseInt(form.vehicle_id), date: form.date, liters, cost_per_liter: cpp,
      total_cost: form.total_cost ? parseFloat(form.total_cost) : liters * cpp,
      odometer_km: form.odometer_km ? parseFloat(form.odometer_km) : null,
      station_name: form.station_name, notes: form.notes,
    });
    if (error) { showToast('Error: ' + error.message); return; }
    showToast('Fuel record added!');
    setModal(false);
    load();
  };

  const del = async (id) => {
    if (!window.confirm('Delete this fuel record?')) return;
    await supabase.from('fuel_records').delete().eq('id', id);
    load();
  };

  const handleFormChange = (field, val) => {
    setForm(f => {
      const next = { ...f, [field]: val };
      if (field === 'liters' || field === 'cost_per_liter') {
        const l = parseFloat(next.liters) || 0;
        const c = parseFloat(next.cost_per_liter) || 0;
        next.total_cost = l && c ? (l * c).toFixed(2) : next.total_cost;
      }
      return next;
    });
  };

  return (
    <>
      {toast && <div className={`fin-toast ok`}>{toast}</div>}
      <div className="fin-card">
        <div className="fin-card-header">
          <h3>⛽ Fuel Records <span style={{ color: C.muted, fontWeight: 400, fontSize: 13 }}>({records.length})</span></h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="fin-btn fin-btn-ghost" onClick={exportExcel} style={{ color: '#16a34a', borderColor: '#bbf7d0' }}><Icons.Download /> Excel</button>
            <button className="fin-btn fin-btn-ghost" onClick={exportPDF} style={{ color: '#dc2626', borderColor: '#fecaca' }}><Icons.Download /> PDF</button>
            <button className="fin-btn fin-btn-primary" onClick={() => { setForm({ vehicle_id:'',date:'',liters:'',cost_per_liter:'',total_cost:'',odometer_km:'',station_name:'',notes:'' }); setModal(true); }}>+ Add Fuel</button>
          </div>
        </div>
        
        <div className="fin-table-container">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Date</th><th>Vehicle</th><th>Liters</th><th>Cost/L</th>
                <th>Total Cost</th><th>Odometer</th><th>Station</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="fin-empty">Loading...</td></tr>}
              {!loading && records.length === 0 && <tr><td colSpan={8} className="fin-empty">No fuel records yet.</td></tr>}
              {records.map(r => (
                <tr key={r.id}>
                  <td>{fmtD(r.date)}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{r.vehicles?.name || '—'}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{r.vehicles?.plate_number}</div>
                  </td>
                  <td>{Number(r.liters || 0).toFixed(2)} L</td>
                  <td>{fmt(r.cost_per_liter)}</td>
                  <td style={{ fontWeight: 600, color: C.primary }}>{fmt(r.total_cost)}</td>
                  <td>{r.odometer_km ? `${Number(r.odometer_km).toLocaleString()} km` : '—'}</td>
                  <td style={{ color: C.muted }}>{r.station_name || '—'}</td>
                  <td><button className="fin-btn fin-btn-danger" onClick={() => del(r.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fin-overlay" onClick={() => setModal(false)}>
          <div className="fin-modal" onClick={e => e.stopPropagation()}>
            <div className="fin-modal-head">
              Add Fuel Record
              <button className="fin-btn fin-btn-ghost" style={{ padding: '3px 9px' }} onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="fin-modal-body">
              <div className="fin-row2">
                <div className="fin-fg">
                  <label>Vehicle *</label>
                  <select value={form.vehicle_id} onChange={e => handleFormChange('vehicle_id', e.target.value)}>
                    <option value="">Select vehicle</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate_number})</option>)}
                  </select>
                </div>
                <div className="fin-fg">
                  <label>Date *</label>
                  <input type="date" value={form.date} onChange={e => handleFormChange('date', e.target.value)} />
                </div>
              </div>
              <div className="fin-row2">
                <div className="fin-fg">
                  <label>Liters *</label>
                  <input type="number" step="0.01" placeholder="e.g. 40.5" value={form.liters} onChange={e => handleFormChange('liters', e.target.value)} />
                </div>
                <div className="fin-fg">
                  <label>Cost per Liter (₱)</label>
                  <input type="number" step="0.01" placeholder="e.g. 65.00" value={form.cost_per_liter} onChange={e => handleFormChange('cost_per_liter', e.target.value)} />
                </div>
              </div>
              <div className="fin-row2">
                <div className="fin-fg">
                  <label>Total Cost (₱) — auto-calculated</label>
                  <input type="number" step="0.01" value={form.total_cost} onChange={e => handleFormChange('total_cost', e.target.value)} />
                </div>
                <div className="fin-fg">
                  <label>Odometer (km)</label>
                  <input type="number" step="0.1" placeholder="e.g. 12500" value={form.odometer_km} onChange={e => handleFormChange('odometer_km', e.target.value)} />
                </div>
              </div>
              <div className="fin-fg">
                <label>Station Name</label>
                <input placeholder="e.g. Petron EDSA" value={form.station_name} onChange={e => handleFormChange('station_name', e.target.value)} />
              </div>
            </div>
            <div className="fin-modal-foot">
              <button className="fin-btn fin-btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="fin-btn fin-btn-primary" onClick={save}>Save Record</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Maintenance Costs Tab ─────────────────────────────────
function MaintenanceTab({ vehicles, refreshKey }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [toast, setToast]     = useState('');
  const [form, setForm]       = useState({
    vehicle_id: '', category: 'Repair', description: '', amount: '', date: '', receipt_ref: '',
  });

  const load = useCallback(async () => {
    const { data } = await supabase.from('maintenance_costs').select('*, vehicles(name, plate_number)').order('date', { ascending: false });
    setRecords(data || []);
    setLoading(false);
  }, []);

  // ✅ Listens to the manual sync button AND initial mount
  useEffect(() => { load(); }, [load, refreshKey]);

  useEffect(() => {
    const channel = supabase.channel('maint-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_costs' }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const exportExcel = () => {
    const data = records.map(r => ({
      'Date': fmtD(r.date), 'Vehicle': r.vehicles?.name || 'N/A', 'Plate': r.vehicles?.plate_number || 'N/A',
      'Category': r.category, 'Description': r.description || 'N/A', 'Amount': `PHP ${r.amount}`, 'Receipt Ref': r.receipt_ref || 'N/A'
    }));
    generateExcel(data, 'Maintenance_Records');
  };

  const exportPDF = () => {
    const cols = ["Date", "Vehicle", "Category", "Description", "Amount", "Receipt Ref"];
    const rows = records.map(r => [fmtD(r.date), r.vehicles?.name || 'N/A', r.category, r.description || '—', fmt(r.amount), r.receipt_ref || '—']);
    generatePDF("Maintenance Records", cols, rows, "Maintenance_Records");
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const save = async () => {
    const { error } = await supabase.from('maintenance_costs').insert({
      vehicle_id: parseInt(form.vehicle_id), category: form.category, description: form.description,
      amount: parseFloat(form.amount) || 0, date: form.date, receipt_ref: form.receipt_ref,
    });
    if (error) { showToast('Error: ' + error.message); return; }
    showToast('Maintenance cost added!');
    setModal(false);
    load();
  };

  const del = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    await supabase.from('maintenance_costs').delete().eq('id', id);
    load();
  };

  return (
    <>
      {toast && <div className="fin-toast ok">{toast}</div>}
      <div className="fin-card">
        <div className="fin-card-header">
          <h3>🔧 Maintenance Costs <span style={{ color: C.muted, fontWeight: 400, fontSize: 13 }}>({records.length})</span></h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="fin-btn fin-btn-ghost" onClick={exportExcel} style={{ color: '#16a34a', borderColor: '#bbf7d0' }}><Icons.Download /> Excel</button>
            <button className="fin-btn fin-btn-ghost" onClick={exportPDF} style={{ color: '#dc2626', borderColor: '#fecaca' }}><Icons.Download /> PDF</button>
            <button className="fin-btn fin-btn-primary" onClick={() => { setForm({ vehicle_id:'',category:'Repair',description:'',amount:'',date:'',receipt_ref:'' }); setModal(true); }}>+ Add Cost</button>
          </div>
        </div>
        
        <div className="fin-table-container">
          <table className="fin-table">
            <thead>
              <tr><th>Date</th><th>Vehicle</th><th>Category</th><th>Description</th><th>Amount</th><th>Receipt Ref</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="fin-empty">Loading...</td></tr>}
              {!loading && records.length === 0 && <tr><td colSpan={7} className="fin-empty">No maintenance costs yet.</td></tr>}
              {records.map(r => (
                <tr key={r.id}>
                  <td>{fmtD(r.date)}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{r.vehicles?.name || '—'}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{r.vehicles?.plate_number}</div>
                  </td>
                  <td><span className={`fin-badge ${BADGE_MAP[r.category] || 'fin-badge-other'}`}>{r.category}</span></td>
                  <td style={{ color: C.muted }}>{r.description || '—'}</td>
                  <td style={{ fontWeight: 600, color: C.warn }}>{fmt(r.amount)}</td>
                  <td style={{ color: C.muted }}>{r.receipt_ref || '—'}</td>
                  <td><button className="fin-btn fin-btn-danger" onClick={() => del(r.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fin-overlay" onClick={() => setModal(false)}>
          <div className="fin-modal" onClick={e => e.stopPropagation()}>
            <div className="fin-modal-head">
              Add Maintenance Cost
              <button className="fin-btn fin-btn-ghost" style={{ padding: '3px 9px' }} onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="fin-modal-body">
              <div className="fin-row2">
                <div className="fin-fg">
                  <label>Vehicle *</label>
                  <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })}>
                    <option value="">Select vehicle</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate_number})</option>)}
                  </select>
                </div>
                <div className="fin-fg">
                  <label>Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {['Fuel','Repair','Parts','Insurance','Registration','Depreciation','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="fin-fg">
                <label>Description</label>
                <input placeholder="e.g. Oil change, tire replacement..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="fin-row2">
                <div className="fin-fg">
                  <label>Amount (₱) *</label>
                  <input type="number" step="0.01" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                </div>
                <div className="fin-fg">
                  <label>Date *</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
                </div>
              </div>
              <div className="fin-fg">
                <label>Receipt Reference</label>
                <input placeholder="e.g. OR-2024-001" value={form.receipt_ref} onChange={e => setForm({ ...form, receipt_ref: e.target.value })} />
              </div>
            </div>
            <div className="fin-modal-foot">
              <button className="fin-btn fin-btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="fin-btn fin-btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Repair Records Tab ────────────────────────────────────
function RepairsTab({ vehicles, refreshKey }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [toast, setToast]     = useState('');
  const [form, setForm]       = useState({
    vehicle_id: '', issue: '', repair_done: '', status: 'Pending',
    shop_name: '', repair_cost: '', date_reported: '', date_resolved: '',
  });

  const load = useCallback(async () => {
    const { data } = await supabase.from('repair_records').select('*, vehicles(name, plate_number)').order('date_reported', { ascending: false });
    setRecords(data || []);
    setLoading(false);
  }, []);

  // ✅ Listens to the manual sync button AND initial mount
  useEffect(() => { load(); }, [load, refreshKey]);

  useEffect(() => {
    const channel = supabase.channel('repair-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'repair_records' }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const exportExcel = () => {
    const data = records.map(r => ({
      'Reported': fmtD(r.date_reported), 'Resolved': fmtD(r.date_resolved) || 'N/A', 'Vehicle': r.vehicles?.name || 'N/A',
      'Issue': r.issue, 'Repair Done': r.repair_done || 'N/A', 'Shop': r.shop_name || 'N/A', 'Cost': `PHP ${r.repair_cost}`, 'Status': r.status
    }));
    generateExcel(data, 'Repair_Records');
  };

  const exportPDF = () => {
    const cols = ["Reported", "Vehicle", "Issue", "Shop", "Cost", "Status"];
    const rows = records.map(r => [fmtD(r.date_reported), r.vehicles?.name || 'N/A', r.issue, r.shop_name || '—', fmt(r.repair_cost), r.status]);
    generatePDF("Repair Records", cols, rows, "Repair_Records");
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const save = async () => {
    const { error } = await supabase.from('repair_records').insert({
      vehicle_id: parseInt(form.vehicle_id), issue: form.issue, repair_done: form.repair_done, status: form.status,
      shop_name: form.shop_name, repair_cost: parseFloat(form.repair_cost) || 0, date_reported: form.date_reported, date_resolved: form.date_resolved || null,
    });
    if (error) { showToast('Error: ' + error.message); return; }
    showToast('Repair record added!');
    setModal(false);
    load();
  };

  const updateStatus = async (id, status) => {
    await supabase.from('repair_records').update({
      status, date_resolved: status === 'Completed' ? new Date().toISOString().split('T')[0] : null,
    }).eq('id', id);
    load();
  };

  const del = async (id) => {
    if (!window.confirm('Delete this repair record?')) return;
    await supabase.from('repair_records').delete().eq('id', id);
    load();
  };

  return (
    <>
      {toast && <div className="fin-toast ok">{toast}</div>}
      <div className="fin-card">
        <div className="fin-card-header">
          <h3>🛠️ Repair Records <span style={{ color: C.muted, fontWeight: 400, fontSize: 13 }}>({records.length})</span></h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="fin-btn fin-btn-ghost" onClick={exportExcel} style={{ color: '#16a34a', borderColor: '#bbf7d0' }}><Icons.Download /> Excel</button>
            <button className="fin-btn fin-btn-ghost" onClick={exportPDF} style={{ color: '#dc2626', borderColor: '#fecaca' }}><Icons.Download /> PDF</button>
            <button className="fin-btn fin-btn-primary" onClick={() => { setForm({ vehicle_id:'',issue:'',repair_done:'',status:'Pending',shop_name:'',repair_cost:'',date_reported:'',date_resolved:'' }); setModal(true); }}>+ Add Repair</button>
          </div>
        </div>
        
        <div className="fin-table-container">
          <table className="fin-table">
            <thead>
              <tr><th>Reported</th><th>Vehicle</th><th>Issue</th><th>Shop</th><th>Cost</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="fin-empty">Loading...</td></tr>}
              {!loading && records.length === 0 && <tr><td colSpan={7} className="fin-empty">No repair records yet.</td></tr>}
              {records.map(r => (
                <tr key={r.id}>
                  <td>{fmtD(r.date_reported)}</td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{r.vehicles?.name || '—'}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{r.vehicles?.plate_number}</div>
                  </td>
                  <td style={{ maxWidth: 180 }}>
                    <div style={{ fontWeight: 500 }}>{r.issue}</div>
                    {r.repair_done && <div style={{ fontSize: 11, color: C.muted }}>{r.repair_done}</div>}
                  </td>
                  <td style={{ color: C.muted }}>{r.shop_name || '—'}</td>
                  <td style={{ fontWeight: 600, color: C.danger }}>{fmt(r.repair_cost)}</td>
                  <td><span className={`fin-badge ${STATUS_BADGE[r.status] || ''}`}>{r.status}</span></td>
                  <td style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {r.status === 'Pending'     && <button className="fin-btn fin-btn-ghost" style={{ fontSize: 12 }} onClick={() => updateStatus(r.id, 'In Progress')}>→ In Progress</button>}
                    {r.status === 'In Progress' && <button className="fin-btn fin-btn-ghost" style={{ fontSize: 12, color: C.success }} onClick={() => updateStatus(r.id, 'Completed')}>✓ Done</button>}
                    <button className="fin-btn fin-btn-danger" onClick={() => del(r.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fin-overlay" onClick={() => setModal(false)}>
          <div className="fin-modal" onClick={e => e.stopPropagation()}>
            <div className="fin-modal-head">
              Add Repair Record
              <button className="fin-btn fin-btn-ghost" style={{ padding: '3px 9px' }} onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="fin-modal-body">
              <div className="fin-row2">
                <div className="fin-fg">
                  <label>Vehicle *</label>
                  <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })}>
                    <option value="">Select vehicle</option>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate_number})</option>)}
                  </select>
                </div>
                <div className="fin-fg">
                  <label>Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option>Pending</option><option>In Progress</option><option>Completed</option>
                  </select>
                </div>
              </div>
              <div className="fin-fg">
                <label>Issue *</label>
                <input placeholder="Describe the issue..." value={form.issue} onChange={e => setForm({ ...form, issue: e.target.value })} />
              </div>
              <div className="fin-fg">
                <label>Repair Done</label>
                <input placeholder="What was repaired..." value={form.repair_done} onChange={e => setForm({ ...form, repair_done: e.target.value })} />
              </div>
              <div className="fin-row2">
                <div className="fin-fg">
                  <label>Shop Name</label>
                  <input placeholder="e.g. ABC Auto Shop" value={form.shop_name} onChange={e => setForm({ ...form, shop_name: e.target.value })} />
                </div>
                <div className="fin-fg">
                  <label>Repair Cost (₱)</label>
                  <input type="number" step="0.01" value={form.repair_cost} onChange={e => setForm({ ...form, repair_cost: e.target.value })} />
                </div>
              </div>
              <div className="fin-row2">
                <div className="fin-fg">
                  <label>Date Reported *</label>
                  <input type="date" value={form.date_reported} onChange={e => setForm({ ...form, date_reported: e.target.value })} />
                </div>
                <div className="fin-fg">
                  <label>Date Resolved</label>
                  <input type="date" value={form.date_resolved} onChange={e => setForm({ ...form, date_resolved: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="fin-modal-foot">
              <button className="fin-btn fin-btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="fin-btn fin-btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Depreciation Tab ──────────────────────────────────────
function DepreciationTab({ vehicles, refreshKey }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [toast, setToast]     = useState('');
  const [form, setForm]       = useState({
    vehicle_id: '', purchase_price: '', purchase_date: '',
    useful_life_years: '10', residual_value: '', depreciation_method: 'Straight-line',
  });

  const load = useCallback(async () => {
    const { data } = await supabase.from('vehicle_depreciation').select('*, vehicles(name, plate_number, year)').order('updated_at', { ascending: false });
    setRecords(data || []);
    setLoading(false);
  }, []);

  // ✅ Listens to the manual sync button AND initial mount
  useEffect(() => { load(); }, [load, refreshKey]);

  useEffect(() => {
    const channel = supabase.channel('depreciation-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicle_depreciation' }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const calcCurrentValue = (purchase_price, residual_value, useful_life_years, purchase_date) => {
    if (!purchase_price || !purchase_date) return null;
    const years = (new Date() - new Date(purchase_date)) / (1000 * 60 * 60 * 24 * 365.25);
    const annualDep = (purchase_price - (residual_value || 0)) / (useful_life_years || 10);
    return Math.max(residual_value || 0, purchase_price - annualDep * years);
  };

  const exportExcel = () => {
    const data = records.map(r => {
      const cv = r.current_value ?? calcCurrentValue(r.purchase_price, r.residual_value, r.useful_life_years, r.purchase_date);
      return {
        'Vehicle': r.vehicles?.name || 'N/A', 'Plate': r.vehicles?.plate_number || 'N/A',
        'Purchase Price': `PHP ${r.purchase_price}`, 'Purchase Date': fmtD(r.purchase_date),
        'Useful Life': `${r.useful_life_years} yrs`, 'Residual Value': `PHP ${r.residual_value}`,
        'Current Value': `PHP ${cv}`, 'Method': r.depreciation_method
      };
    });
    generateExcel(data, 'Depreciation_Records');
  };

  const exportPDF = () => {
    const cols = ["Vehicle", "Purchase Price", "Purchased", "Life", "Residual", "Current Val"];
    const rows = records.map(r => {
      const cv = r.current_value ?? calcCurrentValue(r.purchase_price, r.residual_value, r.useful_life_years, r.purchase_date);
      return [r.vehicles?.name || 'N/A', fmt(r.purchase_price), fmtD(r.purchase_date), `${r.useful_life_years}y`, fmt(r.residual_value), fmt(cv)];
    });
    generatePDF("Vehicle Depreciation", cols, rows, "Depreciation_Records");
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const save = async () => {
    const pp  = parseFloat(form.purchase_price) || 0;
    const rv  = parseFloat(form.residual_value) || 0;
    const uly = parseInt(form.useful_life_years) || 10;
    const cv  = calcCurrentValue(pp, rv, uly, form.purchase_date);

    const { error } = await supabase.from('vehicle_depreciation').upsert({
      vehicle_id: parseInt(form.vehicle_id), purchase_price: pp, purchase_date: form.purchase_date,
      useful_life_years: uly, residual_value: rv, current_value: cv ? parseFloat(cv.toFixed(2)) : null,
      depreciation_method: form.depreciation_method, updated_at: new Date().toISOString(),
    }, { onConflict: 'vehicle_id' });

    if (error) { showToast('Error: ' + error.message); return; }
    showToast('Depreciation record saved!');
    setModal(false);
    load();
  };

  const del = async (id) => {
    if (!window.confirm('Delete depreciation record?')) return;
    await supabase.from('vehicle_depreciation').delete().eq('id', id);
    load();
  };

  return (
    <>
      {toast && <div className="fin-toast ok">{toast}</div>}
      <div className="fin-card">
        <div className="fin-card-header">
          <h3>📉 Vehicle Depreciation <span style={{ color: C.muted, fontWeight: 400, fontSize: 13 }}>({records.length})</span></h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="fin-btn fin-btn-ghost" onClick={exportExcel} style={{ color: '#16a34a', borderColor: '#bbf7d0' }}><Icons.Download /> Excel</button>
            <button className="fin-btn fin-btn-ghost" onClick={exportPDF} style={{ color: '#dc2626', borderColor: '#fecaca' }}><Icons.Download /> PDF</button>
            <button className="fin-btn fin-btn-primary" onClick={() => { setForm({ vehicle_id:'',purchase_price:'',purchase_date:'',useful_life_years:'10',residual_value:'',depreciation_method:'Straight-line' }); setModal(true); }}>+ Add Record</button>
          </div>
        </div>
        
        <div className="fin-table-container">
          <table className="fin-table">
            <thead>
              <tr><th>Vehicle</th><th>Purchase Price</th><th>Purchase Date</th><th>Useful Life</th><th>Residual Value</th><th>Current Value</th><th>Method</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="fin-empty">Loading...</td></tr>}
              {!loading && records.length === 0 && <tr><td colSpan={8} className="fin-empty">No depreciation records yet.</td></tr>}
              {records.map(r => {
                const cv = r.current_value ?? calcCurrentValue(r.purchase_price, r.residual_value, r.useful_life_years, r.purchase_date);
                const pct = r.purchase_price ? ((cv / r.purchase_price) * 100).toFixed(1) : null;
                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{ fontWeight: 500 }}>{r.vehicles?.name || '—'}</div>
                      <div style={{ fontSize: 11, color: C.muted }}>{r.vehicles?.plate_number}</div>
                    </td>
                    <td>{fmt(r.purchase_price)}</td>
                    <td>{fmtD(r.purchase_date)}</td>
                    <td>{r.useful_life_years} yrs</td>
                    <td>{fmt(r.residual_value)}</td>
                    <td>
                      <div style={{ fontWeight: 600, color: cv < r.purchase_price * 0.3 ? C.danger : C.success }}>{fmt(cv)}</div>
                      {pct && <div style={{ fontSize: 11, color: C.muted }}>{pct}% remaining</div>}
                    </td>
                    <td style={{ color: C.muted }}>{r.depreciation_method}</td>
                    <td><button className="fin-btn fin-btn-danger" onClick={() => del(r.id)}>Delete</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <div className="fin-overlay" onClick={() => setModal(false)}>
          <div className="fin-modal" onClick={e => e.stopPropagation()}>
            <div className="fin-modal-head">
              Add Depreciation Record
              <button className="fin-btn fin-btn-ghost" style={{ padding: '3px 9px' }} onClick={() => setModal(false)}>✕</button>
            </div>
            <div className="fin-modal-body">
              <div className="fin-fg">
                <label>Vehicle *</label>
                <select value={form.vehicle_id} onChange={e => setForm({ ...form, vehicle_id: e.target.value })}>
                  <option value="">Select vehicle</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} ({v.plate_number})</option>)}
                </select>
              </div>
              <div className="fin-row2">
                <div className="fin-fg">
                  <label>Purchase Price (₱) *</label>
                  <input type="number" step="0.01" value={form.purchase_price} onChange={e => setForm({ ...form, purchase_price: e.target.value })} />
                </div>
                <div className="fin-fg">
                  <label>Purchase Date *</label>
                  <input type="date" value={form.purchase_date} onChange={e => setForm({ ...form, purchase_date: e.target.value })} />
                </div>
              </div>
              <div className="fin-row2">
                <div className="fin-fg">
                  <label>Useful Life (years)</label>
                  <input type="number" value={form.useful_life_years} onChange={e => setForm({ ...form, useful_life_years: e.target.value })} />
                </div>
                <div className="fin-fg">
                  <label>Residual Value (₱)</label>
                  <input type="number" step="0.01" value={form.residual_value} onChange={e => setForm({ ...form, residual_value: e.target.value })} />
                </div>
              </div>
              <div className="fin-fg">
                <label>Depreciation Method</label>
                <select value={form.depreciation_method} onChange={e => setForm({ ...form, depreciation_method: e.target.value })}>
                  <option>Straight-line</option>
                </select>
              </div>
            </div>
            <div className="fin-modal-foot">
              <button className="fin-btn fin-btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="fin-btn fin-btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Main FinancialPage ────────────────────────────────────
export default function FinancialPage() {
  const [activeTab, setActiveTab] = useState('fuel');
  const [vehicles, setVehicles]   = useState([]);
  const [fuel, setFuel]           = useState([]);
  const [maint, setMaint]         = useState([]);
  const [repairs, setRepairs]     = useState([]);
  
  // ✅ NEW: Sync states
  const [isSyncing, setIsSyncing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadSummaryData = useCallback(async () => {
    const [{ data: vData }, { data: fData }, { data: mData }, { data: rData }] = await Promise.all([
      supabase.from('vehicles').select('id, name, plate_number, year').order('name'),
      supabase.from('fuel_records').select('total_cost'),
      supabase.from('maintenance_costs').select('amount'),
      supabase.from('repair_records').select('repair_cost')
    ]);
    setVehicles(vData || []);
    setFuel(fData || []);
    setMaint(mData || []);
    setRepairs(rData || []);
  }, []);

  useEffect(() => { loadSummaryData(); }, [loadSummaryData]);

  useEffect(() => {
    const channel = supabase.channel('financial-summary-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fuel_records' }, () => { loadSummaryData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_costs' }, () => { loadSummaryData(); })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'repair_records' }, () => { loadSummaryData(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadSummaryData]);

  // ✅ NEW: Handle manual sync click
  const handleSync = async () => {
    setIsSyncing(true);
    await loadSummaryData();
    setRefreshKey(prev => prev + 1); // Trigger the active tab to reload its specific data
    setTimeout(() => setIsSyncing(false), 500); // Tiny visual delay for the user
  };

  const TABS = [
    { key: 'fuel',        label: '⛽ Fuel Records'       },
    { key: 'maintenance', label: '🔧 Maintenance Costs'  },
    { key: 'repairs',     label: '🛠️ Repair Records'     },
    { key: 'depreciation',label: '📉 Depreciation'       },
  ];

  return (
    <div className="fin-root">
      <style>{css}</style>
      <SummaryBar fuel={fuel} maintenance={maint} repairs={repairs} />
      
      {/* ✅ NEW: Tabs and Sync button grouped together */}
      <div className="fin-tabs-container">
        <div className="fin-tabs">
          {TABS.map(t => (
            <button key={t.key} className={`fin-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        
        <button 
          className="fin-btn fin-btn-ghost" 
          onClick={handleSync} 
          disabled={isSyncing}
          style={{ color: C.muted, borderColor: C.border }}
        >
          <Icons.Refresh /> {isSyncing ? 'Syncing...' : 'Sync Data'}
        </button>
      </div>

      {activeTab === 'fuel'         && <FuelTab         vehicles={vehicles} refreshKey={refreshKey} />}
      {activeTab === 'maintenance'  && <MaintenanceTab  vehicles={vehicles} refreshKey={refreshKey} />}
      {activeTab === 'repairs'      && <RepairsTab      vehicles={vehicles} refreshKey={refreshKey} />}
      {activeTab === 'depreciation' && <DepreciationTab vehicles={vehicles} refreshKey={refreshKey} />}
    </div>
  );
}