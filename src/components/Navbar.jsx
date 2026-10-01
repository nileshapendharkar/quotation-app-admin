'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, ChevronDown, LogOut, Menu, Search, User } from 'lucide-react';

// Where the global header search can send the admin.
const SEARCH_TARGETS = [
  { label: 'Products', href: '/products' },
  { label: 'Quotations', href: '/orders' },
  { label: 'Users', href: '/users' },
  { label: 'Categories', href: '/categories' },
];

// Top bar shown on every admin page: page title, global search, notifications, profile.
export default function Navbar({ title, eyebrow, subtitle, onMenuClick }) {
  const router = useRouter();
  const [term, setTerm] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [admin, setAdmin] = useState({ name: 'Admin' });
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('admin_user') || 'null');
      if (saved) setAdmin({ name: saved.name || saved.userId || 'Admin' });
    } catch (e) {}

    const closeMenus = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', closeMenus);
    return () => document.removeEventListener('mousedown', closeMenus);
  }, []);

  const goSearch = (href) => {
    const q = term.trim();
    setSearchOpen(false);
    router.push(q ? `${href}?q=${encodeURIComponent(q)}` : href);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    router.push('/login');
  };

  return (
    <header className="topbar">
      <button className="icon-circle menu-toggle" onClick={onMenuClick} aria-label="Open menu" style={{ border: 'none', cursor: 'pointer' }}>
        <Menu size={20} />
      </button>

      <div className={`page-titles${eyebrow ? '' : ' no-eyebrow'}`}>
        {eyebrow && <div className="page-eyebrow">{eyebrow}</div>}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>

      <div className="topbar-search" ref={searchRef}>
        <Search size={22} strokeWidth={2.4} className="search-ic" />
        <input
          type="text"
          placeholder="Search quotations, products, users..."
          value={term}
          onChange={(e) => { setTerm(e.target.value); setSearchOpen(!!e.target.value.trim()); }}
          onFocus={() => term.trim() && setSearchOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') goSearch('/products');
            if (e.key === 'Escape') setSearchOpen(false);
          }}
        />
        {searchOpen && (
          <div className="search-menu">
            {SEARCH_TARGETS.map((t) => (
              <button key={t.href} type="button" onClick={() => goSearch(t.href)}>
                <Search size={14} color="#8a94a6" />
                <span>Search “<b>{term.trim()}</b>” in {t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="topbar-spacer" />

      <div className="topbar-actions">
        <Link href="/notifications" className="icon-circle" title="Notifications">
          <Bell size={22} fill="#2f4392" strokeWidth={1.6} />
          <span className="dot">1</span>
        </Link>

        <div ref={profileRef} style={{ position: 'relative' }}>
          <button className="profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
            <span className="profile-avatar"><User size={24} fill="#2f4392" /></span>
            <span className="profile-text">
              <strong>{admin.name}</strong>
              <span>Administrator</span>
            </span>
            <ChevronDown size={18} color="#2f4392" />
          </button>

          {profileOpen && (
            <div className="profile-menu">
              <Link href="/notifications" onClick={() => setProfileOpen(false)}>
                <Bell size={16} /> Notifications
              </Link>
              <button className="danger" onClick={handleLogout}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
