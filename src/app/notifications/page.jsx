'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
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
    <AdminLayout
      title="Notifications"
      subtitle="Send updates to every registered customer of the mobile app."
      breadcrumb={['Notifications']}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(22rem, 1fr))', gap: '1.25rem' }}>
        {/* Send broadcast */}
        <div className="ds-card widget">
          <div className="card-head">
            <span className="card-head-ic"><Bell size={22} color="#2f4392" /></span>
            <div className="card-head-text"><div className="card-title">Send Notification Update</div></div>
          </div>

          <form onSubmit={handleSend} className="modal-form">
            <div>
              <label className="form-label">Notification Title</label>
              <input type="text" className="field" placeholder="e.g. Catalog Update: New Water Tanks" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <label className="form-label">Message</label>
              <textarea className="field" rows={4} placeholder="Details about product catalog updates or order processing times..." value={message} onChange={(e) => setMessage(e.target.value)} required />
            </div>
            <div>
              <label className="form-label">Target Audience</label>
              <select className="field" value={targetUser} onChange={(e) => setTargetUser(e.target.value)}>
                <option value="all">All Registered Customers</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '0.4rem' }}>
              {submitting ? 'Broadcasting...' : (<>Send Broadcast <Send size={16} /></>)}
            </button>
          </form>
        </div>

        {/* History */}
        <div className="ds-card widget">
          <div className="card-head">
            <span className="card-head-ic"><Send size={20} color="#2f4392" /></span>
            <div className="card-head-text"><div className="card-title">Notification Log</div></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '32rem', overflowY: 'auto' }}>
            {notifications.length === 0 && <div className="muted-center">No notifications sent yet</div>}
            {notifications.map(n => (
              <div key={n.id} style={{ padding: '0.9rem 1rem', borderRadius: '0.75rem', background: '#f8fbff', border: '1px solid #e3ecf8' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                  <strong style={{ fontSize: '0.92rem', color: '#2f4392', fontWeight: 600 }}>{n.title}</strong>
                  <span style={{ fontSize: '0.72rem', color: '#8a94a6', whiteSpace: 'nowrap' }}>{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#4a5568' }}>{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
