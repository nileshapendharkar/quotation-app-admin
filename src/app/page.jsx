'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Users, FileSpreadsheet, Package, Layers, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const res = await apiFetch('/admin/dashboard-stats');
    if (res.success) {
      setStats(res.stats);
      setRecentOrders(res.recentOrders || []);
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar title="Dashboard Overview" />

        <main style={{ padding: '32px', flex: 1 }}>
          {/* Header Banner */}
          <div className="glass-card" style={{ padding: '24px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc' }}>Welcome to Quotation Admin</h2>
              <p style={{ fontSize: '14px', color: '#94a3b8', marginTop: '4px' }}>
                Monitor user quotation requests, manage catalog items, and track dispatch status.
              </p>
            </div>
            <div style={{ padding: '10px 18px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', fontSize: '13px', fontWeight: '700' }}>
              Mode: Quotations Only (No Price)
            </div>
          </div>

          {/* Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Registered Users</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                  <Users size={20} />
                </div>
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc' }}>{loading ? '...' : stats?.totalUsers || 0}</h3>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Total Quotations</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                  <FileSpreadsheet size={20} />
                </div>
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc' }}>{loading ? '...' : stats?.totalOrders || 0}</h3>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Pending Requests</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                  <Clock size={20} />
                </div>
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#f59e0b' }}>{loading ? '...' : stats?.pendingOrders || 0}</h3>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: '600' }}>Products (No Price)</span>
                <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(139, 92, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
                  <Package size={20} />
                </div>
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#f8fafc' }}>{loading ? '...' : stats?.totalProducts || 0}</h3>
            </div>
          </div>

          {/* Recent Orders Section */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc' }}>Recent Quotation Requests</h3>
              <button onClick={() => router.push('/orders')} className="btn-secondary">View All Orders</button>
            </div>

            {recentOrders.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                No recent quotation requests found.
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Order No</th>
                    <th>Customer Name</th>
                    <th>Items Requested</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ fontWeight: '700', color: '#38bdf8' }}>{order.orderNo}</td>
                      <td>
                        <div style={{ fontWeight: '600' }}>{order.userName}</div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>{order.userEmail}</div>
                      </td>
                      <td>
                        {order.items.map(item => (
                          <div key={item.productId} style={{ fontSize: '13px' }}>
                            <strong>{item.productName}</strong> × {item.quantity} units
                          </div>
                        ))}
                      </td>
                      <td style={{ fontSize: '13px', color: '#94a3b8' }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`badge badge-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
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
