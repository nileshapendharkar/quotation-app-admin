'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { Home } from 'lucide-react';

/**
 * Page shell for every admin screen (matches the designer layout):
 *   left blue sidebar | header (title, search, bell, profile) | page content
 *
 * Props
 *  - title, subtitle, eyebrow ("Welcome Back!")
 *  - breadcrumb: array of labels shown after the home icon, e.g. ['Users', 'Authorized App Users']
 *  - aside: anything to show in the second header row (count chip, dashboard filters ...)
 */
export default function AdminLayout({ title, subtitle, eyebrow, breadcrumb, aside, children }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Every admin page needs a login token – send the user to /login if it is missing.
  useEffect(() => {
    if (!localStorage.getItem('admin_token')) router.replace('/login');
  }, [router]);


  return (
    <div className={`app-shell${sidebarOpen ? ' sidebar-open' : ''}`}>
      <Sidebar onNavigate={() => setSidebarOpen(false)} />
      <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />

      <main className="main">
        <div className="main-decor" aria-hidden="true">
          <img className="splash" src="/design/water-splash.png" alt="" />
          <img className="keep-safe" src="/design/keep-water-safe.png" alt="" />
          <img className="tank" src="/design/header-tank.png" alt="" />
        </div>

        <div className="page-head">
          <Navbar title={title} eyebrow={eyebrow} subtitle={subtitle} onMenuClick={() => setSidebarOpen(true)} />

          {/* second header row: breadcrumb and/or page specific actions */}
          {(aside || (breadcrumb && breadcrumb.length > 0)) && (
            <div className="page-head-row2">
              {breadcrumb && breadcrumb.length > 0 ? (
                <div className="crumb-col">
                  <div className="breadcrumb">
                    <Link href="/" aria-label="Dashboard"><Home size={22} strokeWidth={1.8} /></Link>
                    {breadcrumb.map((b, i) => (
                      <span key={i}>/ {b}</span>
                    ))}
                  </div>
                </div>
              ) : null}
              {aside && <div className="aside-col">{aside}</div>}
            </div>
          )}
        </div>

        {children}
      </main>
    </div>
  );
}
