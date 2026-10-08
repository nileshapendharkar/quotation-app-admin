'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Icon from '@/components/Icon';
import { StatCard, Pagination, EmptyState, RoundGlyph, getUrlQuery, dailySeries } from '@/components/ui';
import { Phone, FileSpreadsheet, Eye, EyeOff, Search, CheckCircle2, AlertCircle, Upload, X, GripVertical, MapPin, Globe, Play } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import * as XLSX from 'xlsx';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showPassMap, setShowPassMap] = useState({});
  const [feedback, setFeedback] = useState({ type: '', msg: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // List of Indian States & UTs for user location drop-downs
  const INDIAN_STATES = [
    'Maharashtra', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'Delhi', 'Uttar Pradesh',
    'Rajasthan', 'Madhya Pradesh', 'Telangana', 'West Bengal', 'Punjab', 'Haryana',
    'Kerala', 'Andhra Pradesh', 'Bihar', 'Assam', 'Odisha', 'Goa', 'Chhattisgarh',
    'Jharkhand', 'Himachal Pradesh', 'Uttarakhand', 'Other'
  ];

  // Dynamic Columns State
  const [columns, setColumns] = useState([
    { id: 'userId', label: 'User ID', visible: true },
    { id: 'password', label: 'Password', visible: true },
    { id: 'name', label: 'Account Name', visible: true },
    { id: 'companyAddress', label: 'Company Physical Address', visible: true },
    { id: 'state', label: 'State', visible: true },
    { id: 'status', label: 'Status (Active/Inactive)', visible: true },
    { id: 'date', label: 'Created Date', visible: true },
    { id: 'actions', label: 'Actions', visible: true },
  ]);
  const [showColConfig, setShowColConfig] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Single Add form state
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [newCompanyAddress, setNewCompanyAddress] = useState('');
  const [newState, setNewState] = useState('Maharashtra');
  const [newStatus, setNewStatus] = useState('Active');
  const [submitting, setSubmitting] = useState(false);

  // Edit form state
  const [editUserObj, setEditUserObj] = useState(null);
  const [editUserId, setEditUserId] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editName, setEditName] = useState('');
  const [editCompanyAddress, setEditCompanyAddress] = useState('');
  const [editState, setEditState] = useState('Maharashtra');
  const [editStatus, setEditStatus] = useState('Active');

  // Excel upload state
  const [excelRows, setExcelRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const q = getUrlQuery('q');
    if (q) setSearch(q);
    fetchUsers();
    const savedCols = localStorage.getItem('nocobase_user_cols_v3');
    if (savedCols) {
      try { setColumns(JSON.parse(savedCols)); } catch(e) {}
    }
  }, []);

  const saveColumns = (newCols) => {
    setColumns(newCols);
    localStorage.setItem('nocobase_user_cols_v3', JSON.stringify(newCols));
  };

  const fetchUsers = async () => {
    setLoading(true);
    const res = await apiFetch('/admin/users');
    if (res.success) {
      setUsers(res.users || []);
    } else {
      setFeedback({ type: 'error', msg: res.message || 'Failed to fetch users' });
    }
    setLoading(false);
  };

  const toggleShowPass = (id) => {
    setShowPassMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // One-click status toggle (Active <-> Inactive) directly syncing to MongoDB
  const handleToggleStatus = async (u) => {
    const nextStatus = u.status === 'Inactive' ? 'Active' : 'Inactive';
    const res = await apiFetch(`/admin/users/${u.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: nextStatus })
    });

    if (res.success) {
      setFeedback({ type: 'success', msg: `User "${u.userId || u.name}" status updated to ${nextStatus} and synced to MongoDB!` });
      fetchUsers();
    } else {
      setFeedback({ type: 'error', msg: res.message || 'Failed to update user status' });
    }
  };

  // Add Single User
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserId || !newPassword) return;
    setSubmitting(true);

    const res = await apiFetch('/admin/users', {
      method: 'POST',
      body: JSON.stringify({ 
        userId: newUserId, 
        password: newPassword, 
        name: newName,
        companyAddress: newCompanyAddress,
        state: newState,
        status: newStatus
      })
    });

    setSubmitting(false);

    if (res.success) {
      setFeedback({ type: 'success', msg: `User "${newUserId}" created and synced to MongoDB!` });
      setShowAddModal(false);
      setNewUserId(''); setNewPassword(''); setNewName(''); setNewCompanyAddress(''); setNewState('Maharashtra'); setNewStatus('Active');
      fetchUsers();
    } else {
      setFeedback({ type: 'error', msg: res.message || 'Error creating user' });
    }
  };

  // Open Edit Modal
  const openEditModal = (u) => {
    setEditUserObj(u);
    setEditUserId(u.userId || u.mobile || '');
    setEditPassword('');
    setEditName(u.name || '');
    setEditCompanyAddress(u.companyAddress || '');
    setEditState(u.state || 'Maharashtra');
    setEditStatus(u.status || 'Active');
    setShowEditModal(true);
  };

  // Submit Edit Form
  const handleEditUserSubmit = async (e) => {
    e.preventDefault();
    if (!editUserObj) return;
    setSubmitting(true);

    const payload = {
      userId: editUserId,
      name: editName,
      companyAddress: editCompanyAddress,
      state: editState,
      status: editStatus
    };
    if (editPassword) {
      payload.password = editPassword;
    }

    const res = await apiFetch(`/admin/users/${editUserObj.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    setSubmitting(false);

    if (res.success) {
      setFeedback({ type: 'success', msg: `User "${editUserId}" updated and synced to MongoDB!` });
      setShowEditModal(false);
      setEditUserObj(null);
      fetchUsers();
    } else {
      setFeedback({ type: 'error', msg: res.message || 'Failed to update user' });
    }
  };

  // Process Excel File Selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const parsed = [];
        for (let i = 0; i < rawJson.length; i++) {
          const row = rawJson[i];
          if (!row || row.length === 0) continue;
          
          let col1 = (row[0] || '').toString().trim(); // User ID
          let col2 = (row[1] || '').toString().trim(); // Password
          let col3 = (row[2] || '').toString().trim(); // Account Name
          let col4 = (row[3] || '').toString().trim(); // Company Physical Address
          let col5 = (row[4] || '').toString().trim(); // State
          let col6 = (row[5] || '').toString().trim(); // Status

          if (i === 0 && (col1.toLowerCase().includes('user') || col2.toLowerCase().includes('pass'))) continue;

          if (col1 && col2) {
            parsed.push({ 
              userId: col1, 
              password: col2,
              name: col3,
              companyAddress: col4,
              state: col5,
              status: col6 || 'Active'
            });
          }
        }
        setExcelRows(parsed);
      } catch (err) {
        setFeedback({ type: 'error', msg: 'Failed to parse Excel file. Ensure valid .xlsx/.csv format.' });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Submit Excel Import
  const handleExcelUpload = async () => {
    if (excelRows.length === 0) return;
    setUploading(true);

    const res = await apiFetch('/admin/users/upload-excel', {
      method: 'POST',
      body: JSON.stringify({ usersList: excelRows })
    });

    setUploading(false);

    if (res.success) {
      setFeedback({ type: 'success', msg: res.message });
      setShowExcelModal(false);
      setExcelRows([]); setFileName('');
      fetchUsers();
    } else {
      setFeedback({ type: 'error', msg: res.message || 'Failed to upload users from Excel' });
    }
  };

  // Remove / Delete User from Admin Panel
  const handleDeleteUser = async (user) => {
    const userLabel = user.userId || user.mobile || user.name;
    if (!confirm(`Are you sure you want to remove user "${userLabel}"? This will permanently remove access and sync directly to MongoDB.`)) return;

    const res = await apiFetch(`/admin/users/${user.id}`, { method: 'DELETE' });

    if (res.success) {
      setFeedback({ type: 'success', msg: `User ${userLabel} removed successfully from Admin Panel and MongoDB.` });
      fetchUsers();
    } else {
      setFeedback({ type: 'error', msg: res.message || 'Failed to delete user' });
    }
  };

  // Drag and drop handlers for column configurator
  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    e.target.style.opacity = '0.5';
  };
  const handleDragEnd = (e) => e.target.style.opacity = '1';
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (sourceIndex === targetIndex) return;

    const newCols = [...columns];
    const [draggedItem] = newCols.splice(sourceIndex, 1);
    newCols.splice(targetIndex, 0, draggedItem);
    saveColumns(newCols);
  };
  const toggleColumn = (id) => {
    const newCols = columns.map(c => c.id === id ? { ...c, visible: !c.visible } : c);
    saveColumns(newCols);
  };

  const filteredUsers = users.filter(u => {
    const term = search.toLowerCase();
    const uid = (u.userId || u.mobile || '').toLowerCase();
    const name = (u.name || '').toLowerCase();
    const addr = (u.companyAddress || '').toLowerCase();
    const st = (u.state || '').toLowerCase();
    return uid.includes(term) || name.includes(term) || addr.includes(term) || st.includes(term);
  });


  const COLUMN_LABELS = {
    userId: 'User ID', password: 'Password', name: 'Account Name', companyAddress: 'Company Physical Address',
    state: 'State', status: 'Status (Active/Inactive)', date: 'Created Date', actions: 'Actions',
  };

  const renderCell = (col, u) => {
    switch (col.id) {
      case 'userId':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1060ff', fontWeight: 500 }}>
            <Phone size={15} />
            {u.userId || u.mobile}
          </div>
        );
      case 'password': {
        const isVisible = showPassMap[u.id];
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              fontFamily: isVisible ? 'monospace' : 'inherit',
              letterSpacing: isVisible ? 0 : '2px',
              color: isVisible ? '#12a150' : '#6b7280'
            }}>
              {isVisible ? (u.plainPassword || '(Hashed)') : '••••••••'}
            </span>
            <button
              type="button"
              onClick={() => toggleShowPass(u.id)}
              style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', display: 'flex' }}
              title={isVisible ? 'Hide Password' : 'Show Password'}
            >
              {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        );
      }
      case 'name':
        return <span style={{ fontWeight: 500 }}>{u.name || 'Account'}</span>;
      case 'companyAddress':
        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.4rem', maxWidth: '16rem' }}>
            <MapPin size={14} color="#9ca3af" style={{ marginTop: 3, flexShrink: 0 }} />
            <span style={{ fontSize: '0.88rem', color: '#4b5563', lineHeight: 1.4 }}>{u.companyAddress || u.companyName || 'N/A'}</span>
          </div>
        );
      case 'state':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Globe size={14} color="#3c51af" />
            <span style={{ fontSize: '0.9rem' }}>{u.state || 'Maharashtra'}</span>
          </div>
        );
      case 'status': {
        const isActive = u.status !== 'Inactive';
        return (
          <div className="status-wrap" style={{ justifyContent: 'center' }}>
            <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>{isActive ? 'Active' : 'Inactive'}</span>
            <button
              className={`switch${isActive ? ' on' : ''}`}
              onClick={() => handleToggleStatus(u)}
              title={`Click to set ${isActive ? 'Inactive' : 'Active'}`}
              aria-label={`Set ${isActive ? 'Inactive' : 'Active'}`}
            />
          </div>
        );
      }
      case 'date':
        return <span style={{ color: '#6b7280' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</span>;
      case 'actions':
        return (
          <div className="row-actions">
            <button onClick={() => openEditModal(u)} className="btn btn-sm btn-soft-blue" title="Edit user credentials & address">
              <Icon name="editing" size={18} /> Edit
            </button>
            <button onClick={() => handleDeleteUser(u)} className="btn btn-sm btn-soft-red" title="Remove user">
              <Icon name="bin" size={18} /> Delete
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const visibleCols = columns.filter(c => c.visible);
  const centered = (id) => ['status', 'date', 'actions', 'state'].includes(id);
  const pagedUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);

  // Stat card numbers
  const activeCount = users.filter(u => u.status !== 'Inactive').length;
  const inactiveCount = users.length - activeCount;
  const now = new Date();
  const addedThisMonth = users.filter(u => {
    if (!u.createdAt) return false;
    const d = new Date(u.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const show = (n) => (loading ? '…' : n);

  return (
    <AdminLayout
      title="Users"
      subtitle="Manage access credentials"
    >
      <div className="stat-grid" style={{ marginTop: '-0.6rem' }}>
        <StatCard compact tone="indigo" icon={<Icon name="group" size={36} />} value={show(users.length)} label="Total App Users" sub="Authorized users in system" spark={dailySeries(users)} />
        <StatCard compact tone="mint" icon={<RoundGlyph bg="#0aa53f"><Play size={18} fill="#fff" strokeWidth={0} style={{ marginLeft: 3 }} /></RoundGlyph>} value={show(activeCount)} label="Active Users" sub="Currently active" />
        <StatCard compact tone="red" icon={<Icon name="pause" size={38} color="#ef3340" />} value={show(inactiveCount)} label="Inactive Users" sub="Not active" />
        <StatCard compact tone="purple" icon={<Icon name="crowd-of-users" size={40} />} value={show(addedThisMonth.length)} label="Added This Month" sub="New registrations" spark={dailySeries(addedThisMonth, 31)} />
      </div>

      <div className="ds-card" style={{ marginTop: '1.25rem' }}>
        {feedback.msg && (
          <div className={`alert ${feedback.type === 'success' ? 'success' : 'error'}`} style={{ margin: '1rem 1.25rem 0' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {feedback.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              {feedback.msg}
            </span>
            <button onClick={() => setFeedback({ type: '', msg: '' })} aria-label="Dismiss"><X size={16} /></button>
          </div>
        )}

        {/* Action toolbar */}
        <div className="toolbar" style={{ padding: '1.35rem 1.4rem 1.1rem' }}>
          <div className="search-field" style={{ width: '30.6rem', maxWidth: '100%' }}>
            <Search size={20} strokeWidth={2.4} className="search-ic" />
            <input
              type="text"
              placeholder="Search User ID, Name, Address, State..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className="toolbar-group" style={{ gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <button className="btn btn-outline" style={{ minWidth: '14.6rem' }} onClick={() => setShowColConfig(!showColConfig)}>
                <Icon name="setting" size={24} /> Configure Columns
              </button>

              {showColConfig && (
                <div className="popover">
                  <div className="popover-title">Configure Columns (drag to reorder)</div>
                  {columns.map((col, index) => (
                    <div
                      key={col.id}
                      className="col-row"
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <GripVertical size={14} color="#9ca3af" /> {COLUMN_LABELS[col.id] || col.label}
                      </span>
                      <button onClick={() => toggleColumn(col.id)} style={{ color: col.visible ? '#0d6efd' : '#9ca3af' }}>
                        {col.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button className="btn btn-success-soft" style={{ minWidth: '11.6rem' }} onClick={() => setShowExcelModal(true)}>
              <FileSpreadsheet size={22} /> Import Excel
            </button>

            <button className="btn btn-primary" style={{ minWidth: '10.4rem' }} onClick={() => setShowAddModal(true)}>
              <Icon name="plus" size={22} /> Add User
            </button>
          </div>
        </div>

        {/* Data table */}
        <div className="table-wrap">
          <table className="ds-table">
            <thead>
              <tr>
                {visibleCols.map(col => (
                  <th key={col.id} className={centered(col.id) ? 'center' : ''} style={col.id === 'userId' ? { paddingLeft: '2rem' } : undefined}>
                    {COLUMN_LABELS[col.id] || col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={visibleCols.length} className="empty-cell">Loading authorized users...</td></tr>
              ) : pagedUsers.map(u => (
                <tr key={u.id}>
                  {visibleCols.map(col => (
                    <td key={col.id} className={centered(col.id) ? 'center' : ''} style={col.id === 'userId' ? { paddingLeft: '2rem' } : undefined}>
                      {col.id === 'state' ? <div style={{ display: 'inline-flex' }}>{renderCell(col, u)}</div> : renderCell(col, u)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && filteredUsers.length === 0 && (
          <EmptyState
            image="/design/empty-users.png"
            title={users.length ? 'No users match your search' : 'No users found'}
            text={users.length ? 'Try a different User ID, name, address or state.' : 'Add app users one by one, or import them from an Excel sheet.'}
            action={<button className="btn btn-primary" onClick={() => setShowAddModal(true)}><Icon name="plus" size={22} /> Add User</button>}
          />
        )}

        <Pagination
          page={page}
          pageSize={pageSize}
          total={filteredUsers.length}
          onPageChange={setPage}
          onPageSizeChange={(n) => { setPageSize(n); setPage(1); }}
          itemLabel="users"
        />
      </div>

      {/* Modal: Add User */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '31rem' }}>
            <h3 className="modal-title">Add Authorized App User</h3>

            <form onSubmit={handleAddUser} className="modal-form">
              <div>
                <label className="form-label">User ID / Mobile Number *</label>
                <input type="text" className="field" placeholder="e.g. 9225087140" value={newUserId} onChange={e => setNewUserId(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Password *</label>
                <input type="text" className="field" placeholder="e.g. Pass#1234" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Account Name</label>
                <input type="text" className="field" placeholder="e.g. Ramesh Hardware Store" value={newName} onChange={e => setNewName(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Company Physical Address</label>
                <textarea className="field" rows={3} placeholder="e.g. Plot No 45, MIDC Industrial Area, Jalgaon" value={newCompanyAddress} onChange={e => setNewCompanyAddress(e.target.value)} />
              </div>
              <div className="form-grid-2">
                <div>
                  <label className="form-label">State</label>
                  <select className="field" value={newState} onChange={e => setNewState(e.target.value)}>
                    {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Status - Active/Inactive</label>
                  <select className="field" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                    <option value="Active">Active (Can Login & Submit Quotes)</option>
                    <option value="Inactive">Inactive (Access Blocked)</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add & Sync MongoDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit User */}
      {showEditModal && editUserObj && (
        <div className="modal-overlay" onClick={() => { setShowEditModal(false); setEditUserObj(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '31rem' }}>
            <h3 className="modal-title">Edit Authorized User</h3>

            <form onSubmit={handleEditUserSubmit} className="modal-form">
              <div>
                <label className="form-label">User ID *</label>
                <input type="text" className="field" value={editUserId} onChange={e => setEditUserId(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Password (leave blank to keep unchanged)</label>
                <input type="text" className="field" placeholder="Enter new password to reset" value={editPassword} onChange={e => setEditPassword(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Account Name</label>
                <input type="text" className="field" value={editName} onChange={e => setEditName(e.target.value)} />
              </div>
              <div>
                <label className="form-label">Company Physical Address</label>
                <textarea className="field" rows={3} value={editCompanyAddress} onChange={e => setEditCompanyAddress(e.target.value)} />
              </div>
              <div className="form-grid-2">
                <div>
                  <label className="form-label">State</label>
                  <select className="field" value={editState} onChange={e => setEditState(e.target.value)}>
                    {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Status - Active/Inactive</label>
                  <select className="field" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                    <option value="Active">Active (Can Login & Submit Quotes)</option>
                    <option value="Inactive">Inactive (Access Blocked)</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => { setShowEditModal(false); setEditUserObj(null); }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save & Sync MongoDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Excel User List */}
      {showExcelModal && (
        <div className="modal-overlay" onClick={() => { setShowExcelModal(false); setExcelRows([]); setFileName(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '36rem' }}>
            <h3 className="modal-title">Import Users (Excel / CSV)</h3>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '-0.6rem', marginBottom: '1.1rem' }}>
              Columns: <strong>A: User ID</strong> | <strong>B: Password</strong> | <strong>C: Account Name</strong> | <strong>D: Physical Address</strong> | <strong>E: State</strong> | <strong>F: Status (Active/Inactive)</strong>
            </p>

            <div className="dropzone">
              <Upload size={30} color="#8a94a6" style={{ marginBottom: '0.6rem' }} />
              <p style={{ fontSize: '0.92rem', marginBottom: '0.8rem', fontWeight: 500 }}>
                {fileName ? `Selected: ${fileName}` : 'Choose Excel File (.xlsx, .csv)'}
              </p>
              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} style={{ display: 'none' }} id="excelInput" />
              <label htmlFor="excelInput" className="btn btn-sm btn-outline" style={{ cursor: 'pointer' }}>Browse Files</label>
            </div>

            {excelRows.length > 0 && (
              <div style={{ marginBottom: '1.2rem' }}>
                <h4 style={{ fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 600 }}>Preview ({excelRows.length} rows)</h4>
                <div style={{ maxHeight: '10rem', overflowY: 'auto', background: '#f8fafd', borderRadius: '0.5rem', padding: '0.5rem', border: '1px solid #edf0f5' }}>
                  <table style={{ width: '100%', fontSize: '0.75rem', textAlign: 'left' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: 4 }}>User ID</th>
                        <th style={{ padding: 4 }}>Password</th>
                        <th style={{ padding: 4 }}>Account Name</th>
                        <th style={{ padding: 4 }}>Address</th>
                        <th style={{ padding: 4 }}>State</th>
                        <th style={{ padding: 4 }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {excelRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: 4 }}>{row.userId}</td>
                          <td style={{ padding: 4, color: '#6b7280' }}>{row.password}</td>
                          <td style={{ padding: 4 }}>{row.name || '-'}</td>
                          <td style={{ padding: 4 }}>{row.companyAddress || '-'}</td>
                          <td style={{ padding: 4 }}>{row.state || '-'}</td>
                          <td style={{ padding: 4 }}>{row.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {excelRows.length > 5 && <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: 6, textAlign: 'center' }}>...and {excelRows.length - 5} more</div>}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={() => { setShowExcelModal(false); setExcelRows([]); setFileName(''); }}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleExcelUpload} disabled={uploading || excelRows.length === 0}>
                {uploading ? 'Importing...' : `Import ${excelRows.length} Users & Sync`}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
