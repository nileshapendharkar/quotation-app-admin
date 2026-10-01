'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon, { CalendarCheckIcon } from './Icon';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: <Icon name="home" size={32} color="#fff" /> },
  { name: 'Products', href: '/products', icon: <CalendarCheckIcon size={30} color="#fff" /> },
  { name: 'Categories', href: '/categories', icon: <Icon name="product" size={32} color="#fff" /> },
  { name: 'Orders', href: '/orders', icon: <Icon name="order" size={30} color="#fff" /> },
  { name: 'Users', href: '/users', icon: <Icon name="user" size={30} color="#fff" /> },
];

export default function Sidebar({ onNavigate }) {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src="/design/logo.png" alt="Gouri Aqua Plast" />
        {/* white wave under the logo */}
        <svg viewBox="0 0 280 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0H280V2C214 2 150 6 96 22C62 32 30 40 0 30Z" fill="#fff" />
        </svg>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link${isActive ? ' active' : ''}`}
              onClick={onNavigate}
            >
              <span style={{ width: '2rem', display: 'inline-flex', justifyContent: 'center' }}>{item.icon}</span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      <img className="sidebar-art" src="/design/sidebar-art.png" alt="" aria-hidden="true" />
    </aside>
  );
}
