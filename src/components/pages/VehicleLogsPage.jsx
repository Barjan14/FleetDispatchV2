import React, { useState, useMemo, useRef, useEffect } from 'react';
import { exportToXlsx } from '../../utils/exportExcel';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '../../supabaseClient';

const Icons = {
  Car: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  ),
  User: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  MapPin: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  ArrowRight: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  ),
  Download: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Warning: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Trash: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" /><path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  ),
  Calendar: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
};

function formatShortDate(dateString) {
  if (!dateString) return '—';
  const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function getStatusBadge(status) {
  const map = { Scheduled: 'b-pending', Ongoing: 'b-ongoing', Completed: 'b-approved', Cancelled: 'b-rejected' };
  return map[status] || 'b-pending';
}

function getMonthKey(dateString) {
  if (!dateString) return 'Unknown';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Indeterminate checkbox helper
function IndeterminateCheckbox({ checked, indeterminate, onChange, style }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} style={style} />;
}

export default function VehicleLogsPage({ logs = [], loading, tripLogs = [], onRefresh }) {
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const sortedLogs = useMemo(() => {
    const list = [...tripLogs];
    switch (sortOrder) {
      case 'newest': return list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'oldest': return list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      case 'status': return list.sort((a, b) => String(a.status).localeCompare(String(b.status)));
      default: return list;
    }
  }, [tripLogs, sortOrder]);

  // Group sorted logs by month, preserving sort order
  const groupedByMonth = useMemo(() => {
    const groups = new Map();
    sortedLogs.forEach(log => {
      const key = getMonthKey(log.created_at);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(log);
    });
    return [...groups.entries()];
  }, [sortedLogs]);

  const allIds = useMemo(() => new Set(sortedLogs.map(l => l.id)), [sortedLogs]);
  const allSelected = allIds.size > 0 && selectedIds.size === allIds.size;
  const someSelected = selectedIds.size > 0 && selectedIds.size < allIds.size;

  const toggleAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(allIds));
  };

  const toggleOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleMonth = (monthLogs) => {
    const monthIds = monthLogs.map(l => l.id);
    const allMonthSelected = monthIds.every(id => selectedIds.has(id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allMonthSelected) {
        monthIds.forEach(id => next.delete(id));
      } else {
        monthIds.forEach(id => next.add(id));
      }
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setDeleting(true);
    try {
      const ids = [...selectedIds];
      const { error } = await supabase.from('trip_logs').delete().in('id', ids);
      if (error) throw error;
      setSelectedIds(new Set());
      setShowConfirm(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const exportToExcel = () => {
    const dataToExport = sortedLogs.map(log => ({
      'Log ID': log.id,
      'Purpose': log.purpose || 'N/A',
      'Vehicle': log.vehicles?.name || log.vehicle?.name || 'N/A',
      'Driver': log.driver_name || 'N/A',
      'Origin': log.origin || 'N/A',
      'Destination': log.destination || 'N/A',
      'Start Time': formatShortDate(log.start_datetime),
      'End Time': formatShortDate(log.end_datetime),
      'Status': log.status,
      'Date Logged': new Date(log.created_at).toLocaleDateString()
    }));
    if (dataToExport.length === 0) return;
    const headers = Object.keys(dataToExport[0]);
    const rows = dataToExport.map(item => Object.values(item).map(v => String(v ?? '')));
    exportToXlsx([headers, ...rows], 'Trip Logs', `Trip_Logs_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Vehicle Trip Logs Report", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    const tableColumn = ["ID", "Vehicle", "Driver", "Route", "Schedule", "Status"];
    const tableRows = sortedLogs.map(log => [
      `#${log.id}`,
      log.vehicles?.name || log.vehicle?.name || 'N/A',
      log.driver_name || 'N/A',
      `${log.origin} -> ${log.destination}`,
      `${formatShortDate(log.start_datetime)}`,
      log.status
    ]);
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] },
      styles: { fontSize: 8 },
    });
    doc.save(`Trip_Logs_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="admin-card">
        <div className="admin-card-header"><h3>Trip Logs</h3></div>
        <div className="admin-empty">Loading logs...</div>
      </div>
    );
  }

  return (
    <>
      <div className="admin-card">
        {/* HEADER */}
        <div className="admin-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h3>
            Trip Logs
            <span className="admin-count">{tripLogs.length}</span>
          </h3>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Delete selected */}
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                className="admin-btn"
                style={{
                  padding: '6px 14px', fontSize: '12px', fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                <Icons.Trash /> Delete Selected ({selectedIds.size})
              </button>
            )}

            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" onClick={exportToExcel} className="admin-btn admin-btn-outline"
                style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', borderColor: '#bbf7d0' }}>
                <Icons.Download /> Excel
              </button>
              <button type="button" onClick={exportToPDF} className="admin-btn admin-btn-outline"
                style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#dc2626', borderColor: '#fecaca' }}>
                <Icons.Download /> PDF
              </button>
            </div>

            <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 2px' }} />

            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Sort:</span>
            <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}
              className="admin-btn admin-btn-outline"
              style={{ padding: '6px 12px', fontSize: '12px', cursor: 'pointer', backgroundColor: '#fff' }}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {/* STORAGE REMINDER BANNER */}
        <div style={{
          margin: '0 20px 16px',
          padding: '12px 16px',
          background: '#fffbeb',
          border: '1px solid #fcd34d',
          borderRadius: '10px',
          display: 'flex',
          gap: '12px',
          alignItems: 'flex-start',
        }}>
          <span style={{ color: '#d97706', marginTop: '1px', flexShrink: 0 }}>
            <Icons.Warning />
          </span>
          <div>
            <div style={{ fontWeight: 700, fontSize: '13px', color: '#92400e', marginBottom: '2px' }}>
              Storage Reminder — Free Tier Database
            </div>
            <div style={{ fontSize: '12px', color: '#78350f', lineHeight: '1.6' }}>
              You are using a free-tier database with limited storage. Export your logs regularly using the <strong>Excel</strong> or <strong>PDF</strong> buttons above, then select and delete older records to prevent the database from getting full.
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="admin-table-scroll">
          <table className="admin-table" style={{ fontSize: '13px' }}>
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>
                  <IndeterminateCheckbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={toggleAll}
                    style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: '#006205' }}
                  />
                </th>
                <th>Log Info</th>
                <th>Assignment</th>
                <th>Route</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Logged At</th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-empty" style={{ padding: '40px' }}>No trip logs recorded yet.</td>
                </tr>
              ) : (
                groupedByMonth.map(([month, monthLogs]) => {
                  const monthIds = monthLogs.map(l => l.id);
                  const allMonthSelected = monthIds.every(id => selectedIds.has(id));
                  const someMonthSelected = monthIds.some(id => selectedIds.has(id)) && !allMonthSelected;

                  return (
                    <React.Fragment key={month}>
                      {/* Month divider row */}
                      <tr>
                        <td colSpan={7} style={{
                          padding: '8px 16px',
                          background: '#f1f5f9',
                          borderTop: '2px solid #e2e8f0',
                          borderBottom: '1px solid #e2e8f0',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ color: '#64748b' }}><Icons.Calendar /></span>
                              <span style={{ fontWeight: 800, fontSize: '12px', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                                {month}
                              </span>
                              <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                                · {monthLogs.length} log{monthLogs.length !== 1 ? 's' : ''}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleMonth(monthLogs)}
                              style={{
                                fontSize: '11px', fontWeight: 600,
                                color: allMonthSelected ? '#dc2626' : '#2563eb',
                                background: 'none', border: 'none', cursor: 'pointer',
                                padding: '2px 6px', borderRadius: '4px',
                              }}
                            >
                              {allMonthSelected ? 'Deselect All' : someMonthSelected ? 'Select Rest' : 'Select All'}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Log rows for this month */}
                      {monthLogs.map(log => (
                        <tr key={log.id} style={{ background: selectedIds.has(log.id) ? '#fef9ec' : undefined }}>
                          <td style={{ textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(log.id)}
                              onChange={() => toggleOne(log.id)}
                              style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: '#006205' }}
                            />
                          </td>
                          <td>
                            <div className="admin-bold">#{log.id}</div>
                            <div className="admin-muted-sm" style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {log.purpose || 'No Purpose'}
                            </div>
                          </td>
                          <td>
                            <div className="admin-bold-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Icons.Car /> {log.vehicles?.name || log.vehicle?.name || 'Unknown'}
                            </div>
                            <div className="admin-muted-sm" style={{ color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Icons.User /> {log.driver_name || 'Unknown'}
                            </div>
                          </td>
                          <td>
                            <div className="admin-bold" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Icons.MapPin /> {log.origin || '—'}
                            </div>
                            <div className="admin-muted-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Icons.ArrowRight /> {log.destination || '—'}
                            </div>
                          </td>
                          <td>
                            <div className="admin-bold-sm" style={{ color: '#059669' }}>{formatShortDate(log.start_datetime)}</div>
                            <div className="admin-muted-sm">to {formatShortDate(log.end_datetime)}</div>
                          </td>
                          <td>
                            <span className={`admin-badge ${getStatusBadge(log.status)}`} style={{ fontSize: '12px' }}>{log.status}</span>
                          </td>
                          <td className="admin-muted-sm">{formatShortDate(log.created_at)}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CONFIRMATION MODAL */}
      {showConfirm && (
        <div className="admin-overlay" onClick={() => !deleting && setShowConfirm(false)}>
          <div className="admin-modal" style={{ maxWidth: '440px' }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ padding: '18px 24px', borderBottom: '1px solid #f1f5f9' }}>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a' }}>Confirm Deletion</h3>
              {!deleting && (
                <button onClick={() => setShowConfirm(false)} className="close-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                padding: '12px 14px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca',
              }}>
                <span style={{ color: '#dc2626', flexShrink: 0, marginTop: '1px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </span>
                <div style={{ fontSize: '13px', color: '#7f1d1d', lineHeight: '1.55' }}>
                  You are about to permanently delete <strong>{selectedIds.size} log{selectedIds.size !== 1 ? 's' : ''}</strong>. This cannot be undone.
                  <br />
                  <span style={{ color: '#dc2626', fontWeight: 700 }}>Make sure you have exported these records first.</span>
                </div>
              </div>

              <div style={{ fontSize: '12.5px', color: '#64748b', lineHeight: '1.6' }}>
                To export before deleting, close this dialog and use the <strong>Excel</strong> or <strong>PDF</strong> export buttons in the toolbar.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 24px', borderTop: '1px solid #f1f5f9', background: '#fafafa' }}>
              <button className="btn-cancel" onClick={() => setShowConfirm(false)} disabled={deleting}>
                Cancel
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={deleting}
                style={{
                  padding: '9px 20px', fontSize: '13.5px', fontWeight: 700,
                  background: deleting ? '#fca5a5' : '#ef4444', color: '#fff',
                  border: 'none', borderRadius: '8px', cursor: deleting ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  transition: 'background 0.15s',
                }}
              >
                <Icons.Trash />
                {deleting ? 'Deleting...' : `Delete ${selectedIds.size} Log${selectedIds.size !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
