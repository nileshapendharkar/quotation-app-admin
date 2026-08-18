'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import { ShoppingCart, Ticket, Users, FileText } from 'lucide-react';
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
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-body)' }}>
      <Sidebar />
      <Navbar />
      
      <main style={{ padding: '24px', flex: 1 }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>Dashboard</h1>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          
          {/* Top Left: Numbers Card */}
          <div className="glass-card" style={{ flex: '1 1 300px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#1890ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingCart size={24} />
                </div>
                <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: '500' }}>Order</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#1890ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ticket size={24} />
                </div>
                <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: '500' }}>Tickets</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#1890ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={24} />
                </div>
                <span style={{ fontSize: '13px', color: '#4b5563', fontWeight: '500' }}>Users</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f0f0f0', paddingTop: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Users</div>
                <div style={{ fontSize: '24px', fontWeight: '500' }}>{loading ? '...' : stats?.totalUsers || 0}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Pending</div>
                <div style={{ fontSize: '24px', fontWeight: '500' }}>{loading ? '...' : stats?.pendingOrders || 0}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Orders</div>
                <div style={{ fontSize: '24px', fontWeight: '500' }}>{loading ? '...' : stats?.totalOrders || 0}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px' }}>Products</div>
                <div style={{ fontSize: '24px', fontWeight: '500' }}>{loading ? '...' : stats?.totalProducts || 0}</div>
              </div>
            </div>
          </div>

          {/* Top Middle: Top Selling Products */}
          <div className="glass-card" style={{ flex: '1 1 300px', padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Top selling products</h3>
            <table>
              <thead>
                <tr>
                  <th style={{ padding: '8px 12px', background: '#fafafa', border: 'none', color: '#4b5563' }}>Selling</th>
                  <th style={{ padding: '8px 12px', background: '#fafafa', border: 'none', color: '#4b5563' }}>Product</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>12</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>UPVC Pipes</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>8</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>Water Tanks</td>
                </tr>
                <tr>
                  <td style={{ padding: '12px', borderBottom: 'none' }}>6</td>
                  <td style={{ padding: '12px', borderBottom: 'none' }}>CPVC Fittings</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Top Right: Top Customers */}
          <div className="glass-card" style={{ flex: '1 1 300px', padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Top customers</h3>
            <table>
              <thead>
                <tr>
                  <th style={{ padding: '8px 12px', background: '#fafafa', border: 'none', color: '#4b5563' }}>Quotations</th>
                  <th style={{ padding: '8px 12px', background: '#fafafa', border: 'none', color: '#4b5563' }}>Customer</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.slice(0, 3).map((order, i) => (
                  <tr key={order.id || i}>
                    <td style={{ padding: '12px', borderBottom: i === 2 ? 'none' : '1px solid #f0f0f0' }}>{order.items?.length || 1} items</td>
                    <td style={{ padding: '12px', borderBottom: i === 2 ? 'none' : '1px solid #f0f0f0' }}>{order.userName}</td>
                  </tr>
                ))}
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="2" style={{ padding: '12px', color: '#9ca3af', textAlign: 'center' }}>No customers yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section: Charts and Recent Orders */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', marginTop: '24px' }}>
          
          <div className="glass-card" style={{ flex: '1 1 400px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600' }}>Recent Quotation Requests</h3>
              <select className="glass-input" style={{ width: 'auto', padding: '4px 8px' }}>
                <option>All Status</option>
                <option>Pending</option>
              </select>
            </div>
            
            {recentOrders.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#9ca3af' }}>No recent requests found.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th style={{ padding: '8px 12px', background: '#fafafa', border: 'none', color: '#4b5563' }}>Order No</th>
                    <th style={{ padding: '8px 12px', background: '#fafafa', border: 'none', color: '#4b5563' }}>Customer</th>
                    <th style={{ padding: '8px 12px', background: '#fafafa', border: 'none', color: '#4b5563' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>{order.orderNo}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>{order.userName}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f0f0f0' }}>
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

          <div className="glass-card" style={{ flex: '1 1 400px', padding: '24px', minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '16px' }}>Category Popularity (Mock Chart)</h3>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: '20px', gap: '8px' }}>
              <div style={{ width: '40px', height: '120px', background: '#1677ff' }}></div>
              <div style={{ width: '40px', height: '180px', background: '#36cfc9' }}></div>
              <div style={{ width: '40px', height: '60px', background: '#ffc53d' }}></div>
              <div style={{ width: '40px', height: '140px', background: '#ff7a45' }}></div>
              <div style={{ width: '40px', height: '160px', background: '#f759ab' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: '12px', color: '#9ca3af' }}>
              <span>Pipes</span>
              <span>Tanks</span>
              <span>CPVC</span>
              <span>UPVC</span>
              <span>Faucets</span>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
