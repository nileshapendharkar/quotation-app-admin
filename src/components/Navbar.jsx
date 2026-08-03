'use client';
import { User, Bell, ShieldCheck } from 'lucide-react';

export default function Navbar({ title = 'Dashboard Overview' }) {
  return (
    <header style={{
      height: '70px',
      borderBottom: '1px solid var(--border-glass)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: 'rgba(11, 15, 25, 0.6)',
      backdropFilter: 'blur(12px)'
    }}>
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#f8fafc' }}>{title}</h1>
        <span style={{ fontSize: '12px', color: '#94a3b8' }}>Product Quotation App Admin Console</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          fontSize: '12px',
          fontWeight: '700'
        }}>
          <ShieldCheck size={14} /> Zero Price Mode Active
        </div>

        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid var(--border-glass)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#38bdf8'
        }}>
          <User size={20} />
        </div>
      </div>
    </header>
  );
}
