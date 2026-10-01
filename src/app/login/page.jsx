'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, ArrowRight } from 'lucide-react';
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
    <div className="login-page">
      {/* Left: brand panel (same artwork as the sidebar) */}
      <div className="login-art">
        <div>
          <img src="/design/keep-water-safe.png" alt="Keep your water safe" style={{ width: '12rem', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
        </div>
        <div>
          <p className="tagline">
            Ganesh Gouri Industries Pvt. Ltd. — manage quotations, products, categories and authorized app users from one place.
          </p>
          <img src="/design/login-products.webp" alt="Gouri Aqua Plast products" style={{ width: '100%', maxWidth: '40rem', marginTop: '2rem', display: 'block' }} />
        </div>
      </div>

      {/* Right: sign-in form */}
      <div className="login-panel">
        <div className="login-card">
          <img className="logo" src="/design/logo.png" alt="Gouri Aqua Plast" />
          <h1 className="page-title" style={{ fontSize: '2rem' }}>Admin Sign In</h1>
          <p className="page-subtitle" style={{ fontSize: '0.95rem', marginBottom: '1.8rem' }}>
            User &amp; Quotation Management
          </p>

          {error && <div className="alert error">{error}</div>}

          <form onSubmit={handleLogin} className="modal-form" style={{ gap: '1.2rem' }}>
            <div>
              <label className="form-label">Admin User ID</label>
              <div className="input-ic">
                <User size={18} className="lead-ic" />
                <input type="text" className="field" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="Admin" required />
              </div>
            </div>

            <div>
              <label className="form-label">Password</label>
              <div className="input-ic">
                <Lock size={18} className="lead-ic" />
                <input type="password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '0.4rem', height: '3.2rem' }}>
              {loading ? 'Authenticating...' : (<>Sign In to Dashboard <ArrowRight size={18} /></>)}
            </button>
          </form>

          <div style={{ marginTop: '1.6rem', textAlign: 'center', fontSize: '0.8rem', color: '#8a94a6' }}>
            Water Tanks, Pipes &amp; Fittings — Product Name + Quantity Only
          </div>
        </div>
      </div>
    </div>
  );
}
