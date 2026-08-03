'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Users, Mail, Phone, Building } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const res = await apiFetch('/admin/users');
    if (res.success) setUsers(res.users || []);
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar title="Registered Customer Profiles" />

        <main style={{ padding: '32px', flex: 1 }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', color: '#f8fafc' }}>
              Customer Directory ({users.length})
            </h3>

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>Loading users...</div>
            ) : users.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No registered customers found.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Customer Name</th>
                    <th>Email Address</th>
                    <th>Mobile</th>
                    <th>Company Name</th>
                    <th>Address</th>
                    <th>Registered Date</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: '700', color: '#f8fafc' }}>{u.name}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#38bdf8' }}>
                          <Mail size={14} /> {u.email}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#cbd5e1' }}>
                          <Phone size={14} /> {u.mobile}
                        </div>
                      </td>
                      <td>{u.companyName || 'Individual'}</td>
                      <td style={{ fontSize: '13px', color: '#94a3b8' }}>{u.companyAddress || 'N/A'}</td>
                      <td style={{ fontSize: '13px', color: '#94a3b8' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
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
