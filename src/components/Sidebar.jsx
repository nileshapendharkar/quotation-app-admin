'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Layers, 
  FileSpreadsheet, 
  Bell, 
  Users, 
  LogOut,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products (No Price)', href: '/products', icon: Package },
    { name: 'Categories', href: '/categories', icon: Layers },
    { name: 'Quotation Orders', href: '/orders', icon: FileSpreadsheet },
    { name: 'Notifications', href: '/notifications', icon: Bell },
    { name: 'Customers', href: '/users', icon: Users },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  return (
    <aside style={{
      width: '260px',
      background: 'rgba(15, 23, 42, 0.95)',
      borderRight: '1px solid var(--border-glass)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      {/* Brand Header */}
      <div style={{ padding: '0 12px 24px 12px', borderBottom: '1px solid var(--border-glass)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #38bdf8, #3b82f6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000',
            fontWeight: '800',
            fontSize: '18px'
          }}>
            Q
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#f8fafc' }}>Quotation Admin</h2>
            <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '600' }}>Strictly No Prices</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#38bdf8' : '#94a3b8',
                background: isActive ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                border: isActive ? '1px solid rgba(56, 189, 248, 0.25)' : '1px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={18} color={isActive ? '#38bdf8' : '#94a3b8'} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Policy Notice Box */}
      <div style={{
        background: 'rgba(56, 189, 248, 0.05)',
        border: '1px dashed rgba(56, 189, 248, 0.3)',
        borderRadius: '12px',
        padding: '14px',
        margin: '16px 0',
        fontSize: '12px',
        color: '#cbd5e1'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#38bdf8', fontWeight: '700', marginBottom: '4px' }}>
          <ShieldAlert size={14} /> Quotation Policy
        </div>
        All catalog items and requests operate on <strong>Product Name + Quantity</strong> only. Price fields are strictly prohibited.
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          width: '100%',
          padding: '12px 16px',
          borderRadius: '10px',
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#fca5a5',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        <LogOut size={18} />
        Sign Out Admin
      </button>
    </aside>
  );
}
