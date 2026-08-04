'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { FileSpreadsheet, Download, RefreshCw, CheckCircle, Clock, XCircle } from 'lucide-react';
import { apiFetch, API_BASE } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    const res = await apiFetch(`/orders/admin/all-orders?status=${activeTab}`);
    if (res.success) setOrders(res.orders || []);
    setLoading(false);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    const res = await apiFetch(`/orders/admin/status/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    if (res.success) {
      fetchOrders();
    } else {
      alert(res.message || 'Failed to update status');
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar title="Quotation Request Orders" />

        <main style={{ padding: '32px', flex: 1 }}>
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            {['All', 'Pending', 'Dispatched', 'Cancelled'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={activeTab === tab ? 'btn-primary' : 'btn-secondary'}
                style={{ padding: '10px 20px' }}
              >
                {tab} Requests
              </button>
            ))}
          </div>

          {/* Orders Table */}
          <div className="glass-card" style={{ padding: '24px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading requests...</div>
            ) : orders.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No {activeTab} quotation requests found.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Order / Quotation #</th>
                    <th>Customer & Company</th>
                    <th>Requested Products & Quantity</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: '700', color: '#38bdf8' }}>{order.orderNo}</td>
                      <td>
                        <div style={{ fontWeight: '700', color: '#f8fafc' }}>{order.userName}</div>
                        <div style={{ fontSize: '12px', color: '#94a3b8' }}>{order.userEmail} | {order.userMobile}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{order.companyName}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {order.items.map((item, i) => (
                            <div key={i} style={{ fontSize: '13px', background: 'rgba(255,255,255,0.03)', padding: '6px 10px', borderRadius: '6px' }}>
                              <strong>{item.productName}{item.size ? ` (Size: ${item.size})` : ''}</strong>
                              <span style={{ color: '#38bdf8', fontWeight: '700', marginLeft: '8px' }}>
                                × {item.quantity} Units
                              </span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: '13px', color: '#94a3b8' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            background: order.status === 'Pending' ? 'rgba(245, 158, 11, 0.2)' : order.status === 'Dispatched' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                            color: order.status === 'Pending' ? '#f59e0b' : order.status === 'Dispatched' ? '#10b981' : '#ef4444',
                            border: '1px solid var(--border-glass)',
                            fontWeight: '700',
                            fontSize: '12px',
                            outline: 'none'
                          }}
                        >
                          <option value="Pending" style={{ background: '#0f172a', color: '#f59e0b' }}>Pending</option>
                          <option value="Dispatched" style={{ background: '#0f172a', color: '#10b981' }}>Dispatched</option>
                          <option value="Cancelled" style={{ background: '#0f172a', color: '#ef4444' }}>Cancelled</option>
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDownloadPDF(order.id, order.orderNo)}
                          className="btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Download size={14} /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
