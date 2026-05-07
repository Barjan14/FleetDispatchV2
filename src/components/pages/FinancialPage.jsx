import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Design tokens ─────────────────────────────────────────
const C = {
  primary:  '#4f46e5', primaryL: '#eef2ff', primaryD: '#3730a3',
  success:  '#10b981', successL: '#ecfdf5',
  danger:   '#ef4444', dangerL:  '#fef2f2',
  warn:     '#f97316', warnL:    '#fff7ed',
  amber:    '#f59e0b', amberL:   '#fffbeb',
  blue:     '#3b82f6', blueL:    '#eff6ff',
  muted:    '#64748b', border:   '#e2e8f0',
  card:     '#ffffff', bg:       '#f1f5f9',
  text:     '#1e293b', textSub:  '#94a3b8',
};

// ── Icons ─────────────────────────────────────────────────
const Icons = {
  Download: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Refresh: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  Fuel: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16" /><path d="M2 22h14" />
      <path d="M15 4h1a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h0a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2v-5" />
      <rect x="6" y="8" width="4" height="4" rx="1" />
    </svg>
  ),
  Wrench: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  DollarSign: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  ),
  Check: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
};

// ── CSS ───────────────────────────────────────────────────
const css = `
  @keyframes finFadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes finSlideIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
  @keyframes finSpin    { to { transform:rotate(360deg); } }
  @keyframes finBarGrow { from { width:0; } to { width:var(--bar-w,60%); } }

  .fin-root {
    display:flex; flex-direction:column; gap:18px;
    padding:0 20px 16px; height:100%; max-height:calc(100vh - 90px);
    box-sizing:border-box; overflow:hidden;
    animation:finFadeUp .3s ease both;
  }

  /* ─── Summary cards ─── */
  .fin-summary { display:grid; grid-template-columns:repeat(4,1fr); gap:14px; flex-shrink:0; }
  .fin-stat {
    background:${C.card}; border-radius:14px; padding:18px 20px;
    box-shadow:0 1px 3px rgba(0,0,0,.06),0 2px 10px rgba(0,0,0,.04);
    border:1px solid ${C.border};
    display:flex; flex-direction:column; gap:14px;
    position:relative; overflow:hidden;
    transition:box-shadow .2s,transform .2s;
  }
  .fin-stat::before {
    content:''; position:absolute; top:0; left:0; right:0; height:3px;
    background:var(--stat-accent,${C.primary});
  }
  .fin-stat:hover { box-shadow:0 6px 20px rgba(0,0,0,.1); transform:translateY(-2px); }
  .fin-stat-top  { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
  .fin-stat-icon {
    width:46px; height:46px; border-radius:12px; flex-shrink:0;
    display:flex; align-items:center; justify-content:center;
    background:var(--stat-bg,${C.primaryL}); color:var(--stat-accent,${C.primary});
  }
  .fin-stat-label { font-size:11px; color:${C.muted}; font-weight:600; text-transform:uppercase; letter-spacing:.6px; }
  .fin-stat-value { font-size:21px; font-weight:700; color:${C.text}; letter-spacing:-.4px; margin-top:4px; line-height:1.2; }
  .fin-stat-sub   { font-size:11px; color:${C.textSub}; margin-top:3px; }
  .fin-stat-bar   { height:3px; background:${C.border}; border-radius:99px; overflow:hidden; }
  .fin-stat-bar-fill { height:100%; border-radius:99px; background:var(--stat-accent,${C.primary}); animation:finBarGrow .9s .25s ease both; }

  /* ─── Tabs bar ─── */
  .fin-tabs-container {
    display:flex; justify-content:space-between; align-items:center;
    flex-shrink:0; flex-wrap:wrap; gap:10px;
    border-bottom:1.5px solid ${C.border}; padding-bottom:0;
  }
  .fin-tabs { display:flex; }
  .fin-tab {
    padding:10px 18px; border:none; border-radius:0;
    border-bottom:2.5px solid transparent; margin-bottom:-1.5px;
    background:transparent; color:${C.muted}; font-size:13px; font-weight:600;
    cursor:pointer; transition:color .18s,border-color .18s,background .15s; white-space:nowrap;
  }
  .fin-tab:hover  { color:${C.primary}; background:rgba(79,70,229,.04); }
  .fin-tab.active { color:${C.primary}; border-bottom-color:${C.primary}; }
  .fin-tabs-container .fin-btn { margin-bottom:-1.5px; }

  /* ─── Card ─── */
  .fin-card {
    background:${C.card}; border-radius:14px;
    box-shadow:0 1px 3px rgba(0,0,0,.06),0 2px 10px rgba(0,0,0,.04);
    border:1px solid ${C.border};
    display:flex; flex-direction:column; flex:1 1 auto; min-height:0; overflow:hidden;
  }
  .fin-card-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:14px 20px; border-bottom:1px solid ${C.border}; flex-shrink:0;
    background:linear-gradient(to right,#fafbfc,${C.card});
  }
  .fin-card-title   { display:flex; align-items:center; gap:10px; }
  .fin-card-header h3 { font-size:14px; font-weight:700; margin:0; color:${C.text}; }
  .fin-card-count {
    font-size:11px; color:${C.textSub}; font-weight:600;
    background:${C.bg}; padding:2px 8px; border-radius:20px; border:1px solid ${C.border};
  }
  .fin-card-actions   { display:flex; gap:8px; align-items:center; }
  .fin-table-container { flex:1 1 auto; overflow-y:auto; min-height:0; }

  /* ─── Table ─── */
  .fin-table { width:100%; border-collapse:separate; border-spacing:0; }
  .fin-table thead th {
    position:sticky; top:0; z-index:10; background:#f8fafc;
    padding:9px 18px; text-align:left; font-size:11px; font-weight:700;
    color:${C.muted}; text-transform:uppercase; letter-spacing:.6px;
    border-bottom:1.5px solid ${C.border};
  }
  .fin-table td { padding:12px 18px; font-size:13px; border-bottom:1px solid ${C.border}; vertical-align:middle; color:${C.text}; }
  .fin-table tr:last-child td { border-bottom:none; }
  .fin-table tbody tr { transition:background .1s; }
  .fin-table tbody tr:hover td { background:#f8fafc; }
  .fin-cell-name  { font-weight:600; color:${C.text}; }
  .fin-cell-sub   { font-size:11px; color:${C.textSub}; margin-top:2px; }
  .fin-cell-muted { color:${C.muted}; font-size:13px; }
  .fin-empty { text-align:center; color:${C.textSub}; padding:56px 32px; font-size:14px; }

  /* ─── Buttons ─── */
  .fin-btn {
    display:inline-flex; align-items:center; gap:6px;
    padding:7px 14px; border:none; border-radius:8px;
    cursor:pointer; font-size:12px; font-weight:600; transition:all .15s; white-space:nowrap;
  }
  .fin-btn:disabled { opacity:.5; cursor:not-allowed; }
  .fin-btn-primary  { background:${C.primary}; color:#fff; }
  .fin-btn-primary:hover:not(:disabled)  { background:${C.primaryD}; }
  .fin-btn-ghost    { background:transparent; color:${C.muted}; border:1.5px solid ${C.border}; }
  .fin-btn-ghost:hover:not(:disabled)    { background:${C.bg}; color:${C.text}; border-color:#cbd5e1; }
  .fin-btn-sm       { padding:5px 10px; font-size:11px; border-radius:6px; }
  .fin-btn-icon {
    width:30px; height:30px; padding:0; border-radius:7px;
    background:transparent; border:1.5px solid transparent; color:${C.textSub};
    display:inline-flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .fin-btn-icon:hover:not(:disabled) { background:${C.dangerL}; color:${C.danger}; border-color:#fecaca; }
  .fin-btn-outline-blue  { background:transparent; color:${C.blue};    border:1.5px solid #bfdbfe; }
  .fin-btn-outline-blue:hover:not(:disabled)  { background:${C.blueL}; }
  .fin-btn-outline-green { background:transparent; color:${C.success}; border:1.5px solid #a7f3d0; }
  .fin-btn-outline-green:hover:not(:disabled) { background:${C.successL}; }
  .fin-spin { animation:finSpin .7s linear infinite; display:inline-flex; }

  /* ─── Badges ─── */
  .fin-badge { display:inline-block; padding:3px 9px; border-radius:20px; font-size:11px; font-weight:600; }
  .fin-badge-fuel    { background:#fef3c7; color:#92400e; }
  .fin-badge-repair  { background:#fee2e2; color:#991b1b; }
  .fin-badge-parts   { background:#e0f2fe; color:#0c4a6e; }
  .fin-badge-ins     { background:#d1fae5; color:#065f46; }
  .fin-badge-reg     { background:#ede9fe; color:#5b21b6; }
  .fin-badge-dep     { background:#f1f5f9; color:#475569; }
  .fin-badge-other   { background:#fff7ed; color:#9a3412; }
  .fin-badge-pending { background:#fef9c3; color:#854d0e; }
  .fin-badge-inprog  { background:#dbeafe; color:#1e40af; }
  .fin-badge-done    { background:#d1fae5; color:#065f46; }

  /* ─── Modal ─── */
  .fin-overlay {
    position:fixed; inset:0; background:rgba(15,23,42,.5);
    backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
    display:flex; align-items:center; justify-content:center; z-index:1000;
    animation:finFadeUp .15s ease both;
  }
  .fin-modal {
    background:${C.card}; border-radius:16px; width:500px; max-width:94%;
    max-height:90vh; display:flex; flex-direction:column;
    box-shadow:0 24px 64px rgba(0,0,0,.2),0 0 0 1px rgba(0,0,0,.06);
    animation:finFadeUp .2s ease both;
  }
  .fin-modal-head {
    padding:18px 22px; border-bottom:1px solid ${C.border};
    font-size:15px; font-weight:700; color:${C.text};
    display:flex; align-items:center; justify-content:space-between; flex-shrink:0;
  }
  .fin-modal-close {
    width:28px; height:28px; border-radius:6px; border:none;
    background:transparent; color:${C.muted}; cursor:pointer; font-size:18px; line-height:1;
    display:flex; align-items:center; justify-content:center; transition:all .15s;
  }
  .fin-modal-close:hover { background:${C.bg}; color:${C.text}; }
  .fin-modal-body { padding:22px; display:flex; flex-direction:column; gap:14px; overflow-y:auto; }
  .fin-modal-foot {
    padding:14px 22px; border-top:1px solid ${C.border};
    display:flex; justify-content:flex-end; gap:10px; flex-shrink:0;
    background:#fafbfc; border-radius:0 0 16px 16px;
  }

  /* ─── Form ─── */
  .fin-fg { display:flex; flex-direction:column; gap:5px; }
  .fin-fg label { font-size:11px; font-weight:700; color:${C.muted}; text-transform:uppercase; letter-spacing:.4px; }
  .fin-fg input,.fin-fg select,.fin-fg textarea {
    padding:9px 12px; border:1.5px solid ${C.border}; border-radius:8px;
    font-size:13px; outline:none; font-family:inherit; color:${C.text};
    background:${C.card}; transition:border-color .15s,box-shadow .15s;
  }
  .fin-fg input:focus,.fin-fg select:focus,.fin-fg textarea:focus {
    border-color:${C.primary}; box-shadow:0 0 0 3px ${C.primaryL};
  }
  .fin-row2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

  /* ─── Toast ─── */
  .fin-toast {
    padding:12px 16px; border-radius:10px; font-size:13px; font-weight:500;
    border-left:4px solid; display:flex; align-items:center; gap:8px;
    animation:finSlideIn .25s ease both; flex-shrink:0;
    box-shadow:0 2px 8px rgba(0,0,0,.08);
  }
  .fin-toast.ok  { background:${C.successL}; color:#065f46; border-color:${C.success}; }
  .fin-toast.err { background:${C.dangerL};  color:#991b1b; border-color:${C.danger};  }

  @media(max-width:768px) { .fin-summary { grid-template-columns:1fr 1fr; } }
`;

// ── Formatters ────────────────────────────────────────────
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

// ── Export helpers ────────────────────────────────────────
const generateExcel = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook  = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Records');
  const buf  = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

const generatePDF = (title, columns, rows, filename) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text(title, 14, 20);
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
  autoTable(doc, {
    head: [columns], body: rows, startY: 35, theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] }, styles: { fontSize: 8 },
  });
  doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
};

// ── Summary bar ───────────────────────────────────────────
function SummaryBar({ fuel, maintenance, repairs }) {
  const totalFuel   = fuel.reduce((s, r)         => s + Number(r.total_cost  || 0), 0);
  const totalMaint  = maintenance.reduce((s, r)  => s + Number(r.amount      || 0), 0);
  const totalRepair = repairs.reduce((s, r)      => s + Number(r.repair_cost || 0), 0);
  const grandTotal  = totalFuel + totalMaint + totalRepair;
  const pct = (n) => grandTotal ? `${Math.round(n / grandTotal * 100)}%` : '0%';
  const pl  = (n, w) => `${n} ${w}${n !== 1 ? 's' : ''}`;

  const stats = [
    { icon: <Icons.Fuel />,          label: 'Total Fuel Cost',    value: fmt(totalFuel),   sub: pl(fuel.length, 'record'),        accent: '#f59e0b', bg: '#fffbeb', barW: pct(totalFuel)   },
    { icon: <Icons.Wrench />,        label: 'Maintenance Costs',  value: fmt(totalMaint),  sub: pl(maintenance.length, 'record'), accent: '#3b82f6', bg: '#eff6ff', barW: pct(totalMaint)  },
    { icon: <Icons.AlertTriangle />, label: 'Repair Costs',       value: fmt(totalRepair), sub: pl(repairs.length, 'record'),     accent: '#ef4444', bg: '#fef2f2', barW: pct(totalRepair) },
    { icon: <Icons.DollarSign />,    label: 'Total Expenses',     value: fmt(grandTotal),  sub: 'all categories',                 accent: '#4f46e5', bg: '#eef2ff', barW: '100%'           },
  ];

  return (
    <div className="fin-summary">
      {stats.map(s => (
        <div className="fin-stat" key={s.label} style={{ '--stat-accent': s.accent, '--stat-bg': s.bg }}>
          <div className="fin-stat-top">
            <div>
              <div className="fin-stat-label">{s.label}</div>
              <div className="fin-stat-value">{s.value}</div>
              <div className="fin-stat-sub">{s.sub}</div>
            </div>
            <div className="fin-stat-icon">{s.icon}</div>
          </div>
          <div className="fin-stat-bar">
            <div className="fin-stat-bar-fill" style={{ '--bar-w': s.barW }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Fuel Records tab ──────────────────────────────────────
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

  useEffect(() => { load(); }, [load, refreshKey]);

  useEffect(() => {
    const ch = supabase.channel('fuel-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fuel_records' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const exportExcel = () => {
    const data = records.map(r => ({
      'Date': fmtD(r.date), 'Vehicle': r.vehicles?.name || 'N/A', 'Plate': r.vehicles?.plate_number || 'N/A',
      'Liters': Number(r.liters || 0).toFixed(2), 'Cost/L': `PHP ${r.cost_per_liter}`,
      'Total Cost': `PHP ${r.total_cost}`, 'Odometer': r.odometer_km, 'Station': r.station_name || 'N/A',
    }));
    generateExcel(data, 'Fuel_Records');
  };

  const exportPDF = () => {
    const cols = ['Date', 'Vehicle', 'Liters', 'Cost/L', 'Total Cost', 'Odometer', 'Station'];
    const rows = records.map(r => [
      fmtD(r.date), r.vehicles?.name || 'N/A', `${Number(r.liters || 0).toFixed(2)} L`,
      fmt(r.cost_per_liter), fmt(r.total_cost), r.odometer_km || '—', r.station_name || '—',
    ]);
    generatePDF('Fuel Cost Records', cols, rows, 'Fuel_Records');
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
      {toast && <div className="fin-toast ok"><Icons.Check />{toast}</div>}
      <div className="fin-card">
        <div className="fin-card-header">
          <div className="fin-card-title">
            <h3>⛽ Fuel Records</h3>
            <span className="fin-card-count">{records.length}</span>
          </div>
          <div className="fin-card-actions">
            <button className="fin-btn fin-btn-ghost" onClick={exportExcel} style={{ color: '#16a34a', borderColor: '#bbf7d0' }}><Icons.Download /> Excel</button>
            <button className="fin-btn fin-btn-ghost" onClick={exportPDF}   style={{ color: '#dc2626', borderColor: '#fecaca' }}><Icons.Download /> PDF</button>
            <button className="fin-btn fin-btn-primary" onClick={() => { setForm({ vehicle_id:'',date:'',liters:'',cost_per_liter:'',total_cost:'',odometer_km:'',station_name:'',notes:'' }); setModal(true); }}>+ Add Fuel</button>
          </div>
        </div>

        <div className="fin-table-container">
          <table className="fin-table">
            <thead>
              <tr>
                <th>Date</th><th>Vehicle</th><th>Liters</th><th>Cost / L</th>
                <th>Total Cost</th><th>Odometer</th><th>Station</th><th></th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="fin-empty">Loading…</td></tr>}
              {!loading && records.length === 0 && <tr><td colSpan={8} className="fin-empty">No fuel records yet.</td></tr>}
              {records.map(r => (
                <tr key={r.id}>
                  <td>{fmtD(r.date)}</td>
                  <td>
                    <div className="fin-cell-name">{r.vehicles?.name || '—'}</div>
                    <div className="fin-cell-sub">{r.vehicles?.plate_number}</div>
                  </td>
                  <td>{Number(r.liters || 0).toFixed(2)} L</td>
                  <td>{fmt(r.cost_per_liter)}</td>
                  <td style={{ fontWeight: 700, color: C.amber }}>{fmt(r.total_cost)}</td>
                  <td className="fin-cell-muted">{r.odometer_km ? `${Number(r.odometer_km).toLocaleString()} km` : '—'}</td>
                  <td className="fin-cell-muted">{r.station_name || '—'}</td>
                  <td>
                    <button className="fin-btn fin-btn-icon" onClick={() => del(r.id)} title="Delete record">
                      <Icons.Trash />
                    </button>
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
              Add Fuel Record
              <button className="fin-modal-close" onClick={() => setModal(false)}>✕</button>
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

// ── Maintenance Costs tab ─────────────────────────────────
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

  useEffect(() => { load(); }, [load, refreshKey]);

  useEffect(() => {
    const ch = supabase.channel('maint-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_costs' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const exportExcel = () => {
    const data = records.map(r => ({
      'Date': fmtD(r.date), 'Vehicle': r.vehicles?.name || 'N/A', 'Plate': r.vehicles?.plate_number || 'N/A',
      'Category': r.category, 'Description': r.description || 'N/A', 'Amount': `PHP ${r.amount}`, 'Receipt Ref': r.receipt_ref || 'N/A',
    }));
    generateExcel(data, 'Maintenance_Records');
  };

  const exportPDF = () => {
    const cols = ['Date', 'Vehicle', 'Category', 'Description', 'Amount', 'Receipt Ref'];
    const rows = records.map(r => [fmtD(r.date), r.vehicles?.name || 'N/A', r.category, r.description || '—', fmt(r.amount), r.receipt_ref || '—']);
    generatePDF('Maintenance Records', cols, rows, 'Maintenance_Records');
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
      {toast && <div className="fin-toast ok"><Icons.Check />{toast}</div>}
      <div className="fin-card">
        <div className="fin-card-header">
          <div className="fin-card-title">
            <h3>🔧 Maintenance Costs</h3>
            <span className="fin-card-count">{records.length}</span>
          </div>
          <div className="fin-card-actions">
            <button className="fin-btn fin-btn-ghost" onClick={exportExcel} style={{ color: '#16a34a', borderColor: '#bbf7d0' }}><Icons.Download /> Excel</button>
            <button className="fin-btn fin-btn-ghost" onClick={exportPDF}   style={{ color: '#dc2626', borderColor: '#fecaca' }}><Icons.Download /> PDF</button>
            <button className="fin-btn fin-btn-primary" onClick={() => { setForm({ vehicle_id:'',category:'Repair',description:'',amount:'',date:'',receipt_ref:'' }); setModal(true); }}>+ Add Cost</button>
          </div>
        </div>

        <div className="fin-table-container">
          <table className="fin-table">
            <thead>
              <tr><th>Date</th><th>Vehicle</th><th>Category</th><th>Description</th><th>Amount</th><th>Receipt Ref</th><th></th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="fin-empty">Loading…</td></tr>}
              {!loading && records.length === 0 && <tr><td colSpan={7} className="fin-empty">No maintenance costs yet.</td></tr>}
              {records.map(r => (
                <tr key={r.id}>
                  <td>{fmtD(r.date)}</td>
                  <td>
                    <div className="fin-cell-name">{r.vehicles?.name || '—'}</div>
                    <div className="fin-cell-sub">{r.vehicles?.plate_number}</div>
                  </td>
                  <td><span className={`fin-badge ${BADGE_MAP[r.category] || 'fin-badge-other'}`}>{r.category}</span></td>
                  <td className="fin-cell-muted">{r.description || '—'}</td>
                  <td style={{ fontWeight: 700, color: C.blue }}>{fmt(r.amount)}</td>
                  <td className="fin-cell-muted">{r.receipt_ref || '—'}</td>
                  <td>
                    <button className="fin-btn fin-btn-icon" onClick={() => del(r.id)} title="Delete record">
                      <Icons.Trash />
                    </button>
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
              Add Maintenance Cost
              <button className="fin-modal-close" onClick={() => setModal(false)}>✕</button>
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
                <input placeholder="e.g. Oil change, tire replacement…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
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

// ── Repair Records tab ────────────────────────────────────
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

  useEffect(() => { load(); }, [load, refreshKey]);

  useEffect(() => {
    const ch = supabase.channel('repair-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'repair_records' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const exportExcel = () => {
    const data = records.map(r => ({
      'Reported': fmtD(r.date_reported), 'Resolved': fmtD(r.date_resolved) || 'N/A',
      'Vehicle': r.vehicles?.name || 'N/A', 'Issue': r.issue,
      'Repair Done': r.repair_done || 'N/A', 'Shop': r.shop_name || 'N/A',
      'Cost': `PHP ${r.repair_cost}`, 'Status': r.status,
    }));
    generateExcel(data, 'Repair_Records');
  };

  const exportPDF = () => {
    const cols = ['Reported', 'Vehicle', 'Issue', 'Shop', 'Cost', 'Status'];
    const rows = records.map(r => [fmtD(r.date_reported), r.vehicles?.name || 'N/A', r.issue, r.shop_name || '—', fmt(r.repair_cost), r.status]);
    generatePDF('Repair Records', cols, rows, 'Repair_Records');
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const save = async () => {
    const { error } = await supabase.from('repair_records').insert({
      vehicle_id: parseInt(form.vehicle_id), issue: form.issue, repair_done: form.repair_done,
      status: form.status, shop_name: form.shop_name, repair_cost: parseFloat(form.repair_cost) || 0,
      date_reported: form.date_reported, date_resolved: form.date_resolved || null,
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
      {toast && <div className="fin-toast ok"><Icons.Check />{toast}</div>}
      <div className="fin-card">
        <div className="fin-card-header">
          <div className="fin-card-title">
            <h3>🛠️ Repair Records</h3>
            <span className="fin-card-count">{records.length}</span>
          </div>
          <div className="fin-card-actions">
            <button className="fin-btn fin-btn-ghost" onClick={exportExcel} style={{ color: '#16a34a', borderColor: '#bbf7d0' }}><Icons.Download /> Excel</button>
            <button className="fin-btn fin-btn-ghost" onClick={exportPDF}   style={{ color: '#dc2626', borderColor: '#fecaca' }}><Icons.Download /> PDF</button>
            <button className="fin-btn fin-btn-primary" onClick={() => { setForm({ vehicle_id:'',issue:'',repair_done:'',status:'Pending',shop_name:'',repair_cost:'',date_reported:'',date_resolved:'' }); setModal(true); }}>+ Add Repair</button>
          </div>
        </div>

        <div className="fin-table-container">
          <table className="fin-table">
            <thead>
              <tr><th>Reported</th><th>Vehicle</th><th>Issue</th><th>Shop</th><th>Cost</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={7} className="fin-empty">Loading…</td></tr>}
              {!loading && records.length === 0 && <tr><td colSpan={7} className="fin-empty">No repair records yet.</td></tr>}
              {records.map(r => (
                <tr key={r.id}>
                  <td>{fmtD(r.date_reported)}</td>
                  <td>
                    <div className="fin-cell-name">{r.vehicles?.name || '—'}</div>
                    <div className="fin-cell-sub">{r.vehicles?.plate_number}</div>
                  </td>
                  <td style={{ maxWidth: 180 }}>
                    <div className="fin-cell-name">{r.issue}</div>
                    {r.repair_done && <div className="fin-cell-sub">{r.repair_done}</div>}
                  </td>
                  <td className="fin-cell-muted">{r.shop_name || '—'}</td>
                  <td style={{ fontWeight: 700, color: C.danger }}>{fmt(r.repair_cost)}</td>
                  <td><span className={`fin-badge ${STATUS_BADGE[r.status] || ''}`}>{r.status}</span></td>
                  <td style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    {r.status === 'Pending'     && <button className="fin-btn fin-btn-sm fin-btn-outline-blue"  onClick={() => updateStatus(r.id, 'In Progress')}>→ In Progress</button>}
                    {r.status === 'In Progress' && <button className="fin-btn fin-btn-sm fin-btn-outline-green" onClick={() => updateStatus(r.id, 'Completed')}>✓ Done</button>}
                    <button className="fin-btn fin-btn-icon" onClick={() => del(r.id)} title="Delete record"><Icons.Trash /></button>
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
              <button className="fin-modal-close" onClick={() => setModal(false)}>✕</button>
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
                <input placeholder="Describe the issue…" value={form.issue} onChange={e => setForm({ ...form, issue: e.target.value })} />
              </div>
              <div className="fin-fg">
                <label>Repair Done</label>
                <input placeholder="What was repaired…" value={form.repair_done} onChange={e => setForm({ ...form, repair_done: e.target.value })} />
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

// ── Depreciation tab ──────────────────────────────────────
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

  useEffect(() => { load(); }, [load, refreshKey]);

  useEffect(() => {
    const ch = supabase.channel('depreciation-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vehicle_depreciation' }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [load]);

  const calcCurrentValue = (purchase_price, residual_value, useful_life_years, purchase_date) => {
    if (!purchase_price || !purchase_date) return null;
    const years    = (new Date() - new Date(purchase_date)) / (1000 * 60 * 60 * 24 * 365.25);
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
        'Current Value': `PHP ${cv}`, 'Method': r.depreciation_method,
      };
    });
    generateExcel(data, 'Depreciation_Records');
  };

  const exportPDF = () => {
    const cols = ['Vehicle', 'Purchase Price', 'Purchased', 'Life', 'Residual', 'Current Val'];
    const rows = records.map(r => {
      const cv = r.current_value ?? calcCurrentValue(r.purchase_price, r.residual_value, r.useful_life_years, r.purchase_date);
      return [r.vehicles?.name || 'N/A', fmt(r.purchase_price), fmtD(r.purchase_date), `${r.useful_life_years}y`, fmt(r.residual_value), fmt(cv)];
    });
    generatePDF('Vehicle Depreciation', cols, rows, 'Depreciation_Records');
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
      {toast && <div className="fin-toast ok"><Icons.Check />{toast}</div>}
      <div className="fin-card">
        <div className="fin-card-header">
          <div className="fin-card-title">
            <h3>📉 Vehicle Depreciation</h3>
            <span className="fin-card-count">{records.length}</span>
          </div>
          <div className="fin-card-actions">
            <button className="fin-btn fin-btn-ghost" onClick={exportExcel} style={{ color: '#16a34a', borderColor: '#bbf7d0' }}><Icons.Download /> Excel</button>
            <button className="fin-btn fin-btn-ghost" onClick={exportPDF}   style={{ color: '#dc2626', borderColor: '#fecaca' }}><Icons.Download /> PDF</button>
            <button className="fin-btn fin-btn-primary" onClick={() => { setForm({ vehicle_id:'',purchase_price:'',purchase_date:'',useful_life_years:'10',residual_value:'',depreciation_method:'Straight-line' }); setModal(true); }}>+ Add Record</button>
          </div>
        </div>

        <div className="fin-table-container">
          <table className="fin-table">
            <thead>
              <tr><th>Vehicle</th><th>Purchase Price</th><th>Purchase Date</th><th>Useful Life</th><th>Residual Value</th><th>Current Value</th><th>Method</th><th></th></tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={8} className="fin-empty">Loading…</td></tr>}
              {!loading && records.length === 0 && <tr><td colSpan={8} className="fin-empty">No depreciation records yet.</td></tr>}
              {records.map(r => {
                const cv  = r.current_value ?? calcCurrentValue(r.purchase_price, r.residual_value, r.useful_life_years, r.purchase_date);
                const pct = r.purchase_price ? ((cv / r.purchase_price) * 100).toFixed(1) : null;
                return (
                  <tr key={r.id}>
                    <td>
                      <div className="fin-cell-name">{r.vehicles?.name || '—'}</div>
                      <div className="fin-cell-sub">{r.vehicles?.plate_number}</div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{fmt(r.purchase_price)}</td>
                    <td>{fmtD(r.purchase_date)}</td>
                    <td className="fin-cell-muted">{r.useful_life_years} yrs</td>
                    <td>{fmt(r.residual_value)}</td>
                    <td>
                      <div style={{ fontWeight: 700, color: cv < r.purchase_price * 0.3 ? C.danger : C.success }}>{fmt(cv)}</div>
                      {pct && <div className="fin-cell-sub">{pct}% remaining</div>}
                    </td>
                    <td className="fin-cell-muted">{r.depreciation_method}</td>
                    <td>
                      <button className="fin-btn fin-btn-icon" onClick={() => del(r.id)} title="Delete record"><Icons.Trash /></button>
                    </td>
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
              <button className="fin-modal-close" onClick={() => setModal(false)}>✕</button>
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
  const [activeTab, setActiveTab]   = useState('fuel');
  const [vehicles, setVehicles]     = useState([]);
  const [fuel, setFuel]             = useState([]);
  const [maint, setMaint]           = useState([]);
  const [repairs, setRepairs]       = useState([]);
  const [isSyncing, setIsSyncing]   = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadSummaryData = useCallback(async () => {
    const [{ data: vData }, { data: fData }, { data: mData }, { data: rData }] = await Promise.all([
      supabase.from('vehicles').select('id, name, plate_number, year').order('name'),
      supabase.from('fuel_records').select('total_cost'),
      supabase.from('maintenance_costs').select('amount'),
      supabase.from('repair_records').select('repair_cost'),
    ]);
    setVehicles(vData || []);
    setFuel(fData || []);
    setMaint(mData || []);
    setRepairs(rData || []);
  }, []);

  useEffect(() => { loadSummaryData(); }, [loadSummaryData]);

  useEffect(() => {
    const ch = supabase.channel('financial-summary-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fuel_records' },        () => loadSummaryData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'maintenance_costs' },   () => loadSummaryData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'repair_records' },      () => loadSummaryData())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [loadSummaryData]);

  const handleSync = async () => {
    setIsSyncing(true);
    await loadSummaryData();
    setRefreshKey(prev => prev + 1);
    setTimeout(() => setIsSyncing(false), 500);
  };

  const TABS = [
    { key: 'fuel',         label: '⛽ Fuel Records'      },
    { key: 'maintenance',  label: '🔧 Maintenance Costs' },
    { key: 'repairs',      label: '🛠️ Repair Records'    },
    { key: 'depreciation', label: '📉 Depreciation'      },
  ];

  return (
    <div className="fin-root">
      <style>{css}</style>

      <SummaryBar fuel={fuel} maintenance={maint} repairs={repairs} />

      <div className="fin-tabs-container">
        <div className="fin-tabs">
          {TABS.map(t => (
            <button key={t.key} className={`fin-tab ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
              {t.label}
            </button>
          ))}
        </div>
        <button className="fin-btn fin-btn-ghost" onClick={handleSync} disabled={isSyncing}>
          <span style={{ display: 'inline-flex', animation: isSyncing ? 'finSpin .7s linear infinite' : 'none' }}>
            <Icons.Refresh />
          </span>
          {isSyncing ? 'Syncing…' : 'Sync Data'}
        </button>
      </div>

      {activeTab === 'fuel'         && <FuelTab         vehicles={vehicles} refreshKey={refreshKey} />}
      {activeTab === 'maintenance'  && <MaintenanceTab  vehicles={vehicles} refreshKey={refreshKey} />}
      {activeTab === 'repairs'      && <RepairsTab      vehicles={vehicles} refreshKey={refreshKey} />}
      {activeTab === 'depreciation' && <DepreciationTab vehicles={vehicles} refreshKey={refreshKey} />}
    </div>
  );
}
