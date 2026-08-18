'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { FileSpreadsheet, Download, Settings2, GripVertical, Eye, EyeOff } from 'lucide-react';
import { apiFetch, API_BASE } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  // Dynamic Columns State
  const [columns, setColumns] = useState([
    { id: 'orderNo', label: 'Order #', visible: true },
    { id: 'customer', label: 'Customer Info', visible: true },
    { id: 'items', label: 'Requested Items', visible: true },
    { id: 'date', label: 'Date', visible: true },
    { id: 'status', label: 'Status', visible: true },
    { id: 'actions', label: 'Actions', visible: true },
  ]);
  const [showColConfig, setShowColConfig] = useState(false);

  useEffect(() => {
    fetchOrders();
    // Load saved columns preference if exists
    const savedCols = localStorage.getItem('nocobase_order_cols');
    if (savedCols) {
      try { setColumns(JSON.parse(savedCols)); } catch(e) {}
    }
  }, [activeTab]);

  const saveColumns = (newCols) => {
    setColumns(newCols);
    localStorage.setItem('nocobase_order_cols', JSON.stringify(newCols));
  };

  const fetchOrders = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    const res = await apiFetch(`/orders/admin/all-orders?status=${activeTab}`);
    if (res.success) setOrders(res.orders || []);
    if (showLoading) setLoading(false);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const previousOrders = [...orders];
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    const res = await apiFetch(`/orders/admin/status/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    
    if (res.success) {
      fetchOrders(false);
    } else {
      alert(res.message || 'Failed to update status. Rolling back changes...');
      setOrders(previousOrders);
    }
  };

  const handleDownloadPDF = (orderId, orderNo) => {
    const token = localStorage.getItem('admin_token');
    const url = `${API_BASE}/orders/download-pdf/${orderId}`;
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `Quotation_${orderNo}.pdf`;
        link.click();
      })
      .catch(err => alert('PDF download failed'));
  };

  // Drag and drop handlers for column configurator
  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
  };

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

  const renderCell = (col, order) => {
    switch (col.id) {
      case 'orderNo':
        return <span style={{ fontWeight: '500', color: '#1677ff' }}>{order.orderNo}</span>;
      case 'customer':
        return (
          <>
            <div style={{ fontWeight: '500', color: '#1f2937' }}>{order.userName}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>{order.userEmail} | {order.userMobile}</div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{order.companyName}</div>
          </>
        );
      case 'items':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {order.items.map((item, i) => (
              <div key={i} style={{ fontSize: '13px', background: '#fafafa', border: '1px solid #f0f0f0', padding: '4px 8px', borderRadius: '4px' }}>
                <strong>{item.productName}{item.size ? ` (Size: ${item.size})` : ''}</strong>
                <span style={{ color: '#1677ff', fontWeight: '600', marginLeft: '8px' }}>
                  × {item.quantity}
                </span>
              </div>
            ))}
          </div>
        );
      case 'date':
        return <span style={{ fontSize: '13px', color: '#6b7280' }}>{new Date(order.createdAt).toLocaleDateString()}</span>;
      case 'status':
        return (
          <select
            value={order.status}
            onChange={(e) => handleStatusChange(order.id, e.target.value)}
            className={`badge badge-${order.status.toLowerCase()}`}
            style={{ padding: '4px 8px', fontWeight: '600', fontSize: '12px', outline: 'none', cursor: 'pointer' }}
          >
            <option value="Pending">Pending</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        );
      case 'actions':
        return (
          <button
            onClick={() => handleDownloadPDF(order.id, order.orderNo)}
            className="btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', margin: '0 auto' }}
          >
            <Download size={14} /> PDF
          </button>
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

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '600' }}>Quotation Requests</h1>
        </div>

        <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          
          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['All', 'Pending', 'Dispatched', 'Cancelled'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={activeTab === tab ? 'btn-primary' : 'btn-secondary'}
                  style={{ height: '36px' }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative' }}>
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
                  right: '0',
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
                    <td colSpan={visibleCols.length} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>Loading requests...</td>
                  </tr>
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={visibleCols.length} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No {activeTab} requests found.</td>
                  </tr>
                ) : (
                  orders.map(order => (
                    <tr key={order.id}>
                      {visibleCols.map(col => (
                        <td key={col.id} style={{ padding: '12px 24px', textAlign: col.id === 'actions' ? 'center' : 'left' }}>
                          {renderCell(col, order)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', color: '#9ca3af', fontSize: '13px' }}>
            Total {orders.length} items
          </div>
        </div>
      </div>
    </div>
  );
}
