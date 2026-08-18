'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Bell, LayoutDashboard, Package, Layers, FileSpreadsheet, Users, LogOut, Search, SettingOutlined } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Categories', href: '/categories', icon: Layers },
    { name: 'Orders', href: '/orders', icon: FileSpreadsheet },
    { name: 'Users', href: '/users', icon: Users },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  return (
    <header style={{
      height: '48px',
      backgroundColor: '#001529',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      boxShadow: '0 1px 4px rgba(0,21,41,.08)'
    }}>
      {/* Left: Logo & Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          marginRight: '32px',
          cursor: 'pointer' 
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '4px',
            background: '#1890ff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            G
          </div>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#fff', letterSpacing: '0.5px' }}>
            Admin Dashboard
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
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
                  gap: '6px',
                  padding: '0 16px',
                  height: '100%',
                  textDecoration: 'none',
                  fontSize: '14px',
                  color: isActive ? '#fff' : 'rgba(255, 255, 255, 0.65)',
                  backgroundColor: isActive ? '#1890ff' : 'transparent',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = '#fff';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
                }}
              >
                <Icon size={16} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', height: '100%' }}>
        <div style={{ cursor: 'pointer', color: 'rgba(255, 255, 255, 0.65)' }}>
          <Search size={16} />
        </div>
        <Link href="/notifications" style={{ cursor: 'pointer', color: 'rgba(255, 255, 255, 0.65)' }}>
          <Bell size={16} />
        </Link>
        <div 
          onClick={handleLogout}
          style={{ cursor: 'pointer', color: 'rgba(255, 255, 255, 0.65)' }} 
          title="Logout"
        >
          <LogOut size={16} />
        </div>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          cursor: 'pointer'
        }}>
          <User size={14} />
        </div>
      </div>
    </header>
  );
}
