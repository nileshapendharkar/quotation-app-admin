'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Users, Phone, UserPlus, FileSpreadsheet, Trash2, Eye, EyeOff, Search, CheckCircle2, AlertCircle, Upload, Key, X, Settings2, GripVertical } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import * as XLSX from 'xlsx';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showPassMap, setShowPassMap] = useState({});
  const [feedback, setFeedback] = useState({ type: '', msg: '' });

  // Dynamic Columns State
  const [columns, setColumns] = useState([
    { id: 'userId', label: 'User ID / Mobile', visible: true },
    { id: 'password', label: 'Password', visible: true },
    { id: 'name', label: 'Account Name', visible: true },
    { id: 'status', label: 'Status', visible: true },
    { id: 'date', label: 'Created Date', visible: true },
    { id: 'actions', label: 'Actions', visible: true },
  ]);
  const [showColConfig, setShowColConfig] = useState(false);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Single Add form
  const [newUserId, setNewUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newName, setNewName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit form
  const [editUserObj, setEditUserObj] = useState(null);
  const [editPassword, setEditPassword] = useState('');

  // Excel upload state
  const [excelRows, setExcelRows] = useState([]);
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUsers();
    // Load saved columns preference if exists
    const savedCols = localStorage.getItem('nocobase_user_cols');
    if (savedCols) {
      try { setColumns(JSON.parse(savedCols)); } catch(e) {}
    }
  }, []);

  const saveColumns = (newCols) => {
    setColumns(newCols);
    localStorage.setItem('nocobase_user_cols', JSON.stringify(newCols));
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

  // Add Single User
  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserId || !newPassword) return;
    setSubmitting(true);

    const res = await apiFetch('/admin/users', {
      method: 'POST',
      body: JSON.stringify({ userId: newUserId, password: newPassword, name: newName })
    });

    setSubmitting(false);

    if (res.success) {
      setFeedback({ type: 'success', msg: `User ${newUserId} created successfully!` });
      setShowAddModal(false);
      setNewUserId(''); setNewPassword(''); setNewName('');
      fetchUsers();
    } else {
      setFeedback({ type: 'error', msg: res.message || 'Error creating user' });
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
          
          let col1 = (row[0] || '').toString().trim();
          let col2 = (row[1] || '').toString().trim();

          if (i === 0 && (col1.toLowerCase().includes('user') || col2.toLowerCase().includes('pass'))) continue;

          if (col1 && col2) parsed.push({ userId: col1, password: col2 });
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

  // Update User Password
  const handleEditPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!editUserObj || !editPassword) return;
    setSubmitting(true);

    const res = await apiFetch(`/admin/users/${editUserObj.id}`, {
      method: 'PUT',
      body: JSON.stringify({ password: editPassword })
    });

    setSubmitting(false);

    if (res.success) {
      setFeedback({ type: 'success', msg: `Password updated for User ${editUserObj.userId || editUserObj.mobile}` });
      setShowEditModal(false);
      setEditUserObj(null); setEditPassword('');
      fetchUsers();
    } else {
      setFeedback({ type: 'error', msg: res.message || 'Failed to update password' });
    }
  };

  // Delete User
  const handleDeleteUser = async (user) => {
    const userLabel = user.userId || user.mobile || user.name;
    if (!confirm(`Are you sure you want to delete user "${userLabel}"?`)) return;

    const res = await apiFetch(`/admin/users/${user.id}`, { method: 'DELETE' });

    if (res.success) {
      setFeedback({ type: 'success', msg: `User ${userLabel} deleted successfully.` });
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
    return uid.includes(term) || name.includes(term);
  });

  const renderCell = (col, u) => {
    switch (col.id) {
      case 'userId':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', color: '#1677ff', fontSize: '14px' }}>
            <Phone size={15} color="#1677ff" />
            {u.userId || u.mobile}
          </div>
        );
      case 'password':
        const isVisible = showPassMap[u.id];
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontFamily: isVisible ? 'monospace' : 'inherit',
              fontSize: isVisible ? '14px' : '16px',
              letterSpacing: isVisible ? '0' : '2px',
              color: isVisible ? '#52c41a' : '#6b7280'
            }}>
              {isVisible ? (u.plainPassword || '(Hashed)') : '••••••••'}
            </span>
            <button
              type="button"
              onClick={() => toggleShowPass(u.id)}
              style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '2px' }}
              title={isVisible ? 'Hide Password' : 'Show Password'}
            >
              {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        );
      case 'name':
        return <span style={{ color: '#4b5563', fontSize: '14px' }}>{u.name || 'Gouri Customer'}</span>;
      case 'status':
        return (
          <span className={`badge ${u.status === 'Inactive' ? 'badge-cancelled' : 'badge-dispatched'}`}>
            {u.status || 'Active'}
          </span>
        );
      case 'date':
        return <span style={{ fontSize: '13px', color: '#9ca3af' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</span>;
      case 'actions':
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <button
              onClick={() => { setEditUserObj(u); setEditPassword(''); setShowEditModal(true); }}
              className="btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Key size={14} /> Password
            </button>
            <button
              onClick={() => handleDeleteUser(u)}
              className="btn-danger"
              style={{ padding: '6px 10px' }}
              title="Delete User"
            >
              <Trash2 size={15} />
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  const visibleCols = columns.filter(c => c.visible);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
      <Sidebar />
      <Navbar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px' }}>

        {feedback.msg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 20px',
            borderRadius: '6px',
            marginBottom: '24px',
            background: feedback.type === 'success' ? '#f6ffed' : '#fff2f0',
            border: `1px solid ${feedback.type === 'success' ? '#b7eb8f' : '#ffccc7'}`,
            color: feedback.type === 'success' ? '#52c41a' : '#ff4d4f',
            fontSize: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {feedback.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              <span>{feedback.msg}</span>
            </div>
            <X size={18} style={{ cursor: 'pointer' }} onClick={() => setFeedback({ type: '', msg: '' })} />
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '20px', fontWeight: '600' }}>App Users Collection ({users.length})</h1>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>Manage secure access credentials for the Mobile App.</p>
          </div>
        </div>

        <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
            
            <div style={{ position: 'relative', width: '280px' }}>
              <Search size={16} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '10px' }} />
              <input
                type="text"
                className="glass-input"
                style={{ paddingLeft: '36px', height: '36px' }}
                placeholder="Search by User ID or Name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
              <button 
                className="btn-secondary" 
                style={{ height: '36px', padding: '0 12px' }} 
                onClick={() => setShowColConfig(!showColConfig)}
              >
                <Settings2 size={16} style={{ marginRight: '6px', display: 'inline' }} /> Configure Columns
              </button>
              
              {/* Column Configurator Popover */}
              {showColConfig && (
                <div style={{
                  position: 'absolute',
                  top: '44px',
                  right: '250px',
                  width: '280px',
                  background: '#fff',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  padding: '12px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px', color: '#1f2937' }}>
                    Configure Columns (Drag to Reorder)
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {columns.map((col, index) => (
                      <div
                        key={col.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px',
                          background: '#fafafa',
                          border: '1px solid #f0f0f0',
                          borderRadius: '4px',
                          cursor: 'grab'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <GripVertical size={14} color="#9ca3af" />
                          <span style={{ fontSize: '13px', color: '#4b5563' }}>{col.label}</span>
                        </div>
                        <button
                          onClick={() => toggleColumn(col.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: col.visible ? '#1677ff' : '#9ca3af' }}
                        >
                          {col.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                className="btn-secondary"
                style={{ height: '36px', padding: '0 12px', color: '#52c41a', borderColor: '#b7eb8f', background: '#f6ffed' }}
                onClick={() => setShowExcelModal(true)}
              >
                <FileSpreadsheet size={16} style={{ marginRight: '6px', display: 'inline' }} /> Import Excel
              </button>

              <button className="btn-primary" style={{ height: '36px' }} onClick={() => setShowAddModal(true)}>
                <Plus size={16} /> Add user
              </button>
            </div>
          </div>

          {/* Dynamic Data Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {visibleCols.map(col => (
                    <th key={col.id} style={{ padding: '12px 24px', textAlign: col.id === 'actions' ? 'center' : 'left' }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={visibleCols.length} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading users...</td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={visibleCols.length} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No users found.</td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id}>
                      {visibleCols.map(col => (
                        <td key={col.id} style={{ padding: '12px 24px', textAlign: col.id === 'actions' ? 'center' : 'left' }}>
                          {renderCell(col, u)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', color: '#9ca3af', fontSize: '13px' }}>
            Total {filteredUsers.length} users
          </div>
        </div>
      </div>

      {/* Modal: Add Single User */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: '#1f2937' }}>
              Create New App User
            </h3>

            <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>User ID / Mobile Number *</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. 9225087140"
                  value={newUserId}
                  onChange={e => setNewUserId(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>Password *</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. GGi#4321"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>Account Name / Company (Optional)</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Gouri Aqua Plast Customer"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload Excel User List */}
      {showExcelModal && (
        <div className="modal-overlay" onClick={() => { setShowExcelModal(false); setExcelRows([]); setFileName(''); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px', color: '#1f2937' }}>
              Import Users (Excel / CSV)
            </h3>
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '20px' }}>
              Format must contain 2 columns: <strong>Column A: User ID</strong> | <strong>Column B: Password</strong>
            </p>

            <div style={{ border: '1px dashed #d9d9d9', borderRadius: '6px', padding: '24px', textAlign: 'center', background: '#fafafa', marginBottom: '20px' }}>
              <Upload size={32} color="#9ca3af" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '14px', color: '#1f2937', marginBottom: '12px', fontWeight: '500' }}>
                {fileName ? `Selected: ${fileName}` : 'Choose Excel File (.xlsx, .csv)'}
              </p>
              <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileChange} style={{ display: 'none' }} id="excelInput" />
              <label htmlFor="excelInput" className="btn-secondary" style={{ display: 'inline-block', cursor: 'pointer', padding: '6px 12px' }}>
                Browse Files
              </label>
            </div>

            {excelRows.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', color: '#1f2937', marginBottom: '8px', fontWeight: '600' }}>
                  Preview ({excelRows.length} rows)
                </h4>
                <div style={{ maxHeight: '160px', overflowY: 'auto', background: '#f5f5f5', borderRadius: '4px', padding: '8px', border: '1px solid #f0f0f0' }}>
                  <table style={{ width: '100%', fontSize: '12px', textAlign: 'left' }}>
                    <thead>
                      <tr>
                        <th style={{ padding: '4px' }}>User ID</th>
                        <th style={{ padding: '4px' }}>Password</th>
                      </tr>
                    </thead>
                    <tbody>
                      {excelRows.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '4px' }}>{row.userId}</td>
                          <td style={{ padding: '4px', color: '#6b7280' }}>{row.password}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {excelRows.length > 5 && <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px', textAlign: 'center' }}>...and {excelRows.length - 5} more</div>}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button type="button" className="btn-secondary" onClick={() => { setShowExcelModal(false); setExcelRows([]); setFileName(''); }}>Cancel</button>
              <button type="button" className="btn-primary" onClick={handleExcelUpload} disabled={uploading || excelRows.length === 0}>
                {uploading ? 'Importing...' : `Import ${excelRows.length} Users`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit User Password */}
      {showEditModal && editUserObj && (
        <div className="modal-overlay" onClick={() => { setShowEditModal(false); setEditUserObj(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#1f2937' }}>
              Change Password
            </h3>
            <p style={{ fontSize: '13px', color: '#1677ff', marginBottom: '24px', fontWeight: '500' }}>
              User ID: {editUserObj.userId || editUserObj.mobile}
            </p>

            <form onSubmit={handleEditPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#4b5563', marginBottom: '6px' }}>New Password *</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="Enter new password"
                  value={editPassword}
                  onChange={e => setEditPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={() => { setShowEditModal(false); setEditUserObj(null); }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Updating...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
