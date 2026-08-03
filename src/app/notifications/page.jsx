'use client';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Bell, Send } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetUser, setTargetUser] = useState('all');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const res = await apiFetch('/admin/notifications');
    if (res.success) setNotifications(res.notifications || []);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!title || !message) return;
    setSubmitting(true);

    const res = await apiFetch('/admin/notifications', {
      method: 'POST',
      body: JSON.stringify({ title, message, targetUser })
    });

    setSubmitting(false);

    if (res.success) {
      setTitle('');
      setMessage('');
      fetchNotifications();
      alert('Notification sent successfully!');
    } else {
      alert(res.message || 'Failed to send notification');
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar title="Notification System" />

        <main style={{ padding: '32px', flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Send Broadcast Box */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Bell color="#38bdf8" /> Send Notification Update
            </h3>

            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Notification Title</label>
                <input
                  type="text"
                  className="glass-input"
                  placeholder="e.g. Catalog Update: New Safety Helmets"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Message</label>
                <textarea
                  className="glass-input"
                  rows={4}
                  placeholder="Details about product catalog updates or order processing times..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '6px' }}>Target Audience</label>
                <select className="glass-input" value={targetUser} onChange={(e) => setTargetUser(e.target.value)}>
                  <option value="all" style={{ background: '#0f172a' }}>All Registered Customers</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" disabled={submitting} style={{ marginTop: '10px', justifyContent: 'center' }}>
                {submitting ? 'Broadcasting...' : (
                  <>Send Broadcast <Send size={16} /></>
                )}
              </button>
            </form>
          </div>

          {/* History */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', color: '#f8fafc' }}>
              Notification Log
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '500px', overflowY: 'auto' }}>
              {notifications.map(n => (
                <div key={n.id} style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <strong style={{ fontSize: '14px', color: '#38bdf8' }}>{n.title}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{new Date(n.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#cbd5e1' }}>{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
