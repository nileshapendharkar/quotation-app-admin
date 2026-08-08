'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, User, ArrowRight } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [userId, setUserId] = useState('Admin');
  const [password, setPassword] = useState('GGi#4321');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId, email: userId, password })
    });

    setLoading(false);

    if (res.success) {
      if (res.user.role !== 'admin') {
        setError('Access denied. Admin credentials required.');
        return;
      }
      localStorage.setItem('admin_token', res.token);
      localStorage.setItem('admin_user', JSON.stringify(res.user));
      router.push('/');
    } else {
      setError(res.message || 'Login failed');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '440px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #38bdf8, #3b82f6)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            marginBottom: '16px'
          }}>
            <Shield size={28} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#f8fafc' }}>Gouri Aqua Plast Admin</h1>
          <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>
            Ganesh Gouri Industries Pvt. Ltd. — User & Quotation Management
          </p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#fca5a5',
            fontSize: '13px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '8px', fontWeight: '600' }}>
              Admin User ID
            </label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="text"
                className="glass-input"
                style={{ paddingLeft: '44px' }}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Admin"
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', color: '#cbd5e1', marginBottom: '8px', fontWeight: '600' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '14px' }} />
              <input
                type="password"
                className="glass-input"
                style={{ paddingLeft: '44px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '14px' }}
          >
            {loading ? 'Authenticating...' : (
              <>Sign In to Dashboard <ArrowRight size={18} /></>
            )}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
          Water Tanks, Pipes & Fittings — Product Name + Quantity Only
        </div>
      </div>
    </div>
  );
}

