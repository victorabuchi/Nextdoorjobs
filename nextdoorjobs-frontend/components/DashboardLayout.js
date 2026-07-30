import Link from 'next/link'
import { useRouter } from 'next/router'
import NotificationBell from '@/components/NotificationBell'
import { clearAuth } from '@/lib/auth'

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.14.42.4.79.74 1.06.34.27.75.44 1.18.44H21a2 2 0 0 1 0 4h-.09c-.43 0-.84.17-1.18.44" />
    </svg>
  )
}

const NAV_BY_ROLE = {
  worker: [
    { href: '/dashboard', label: 'Applications', icon: ListIcon },
    { href: '/settings', label: 'Settings', icon: GearIcon }
  ],
  client: [
    { href: '/client', label: 'Listings', icon: ListIcon },
    { href: '/settings', label: 'Settings', icon: GearIcon }
  ],
  admin: [
    { href: '/admin', label: 'Dashboard', icon: GridIcon },
    { href: '/settings', label: 'Settings', icon: GearIcon }
  ]
}

export default function DashboardLayout({ user, children }) {
  const router = useRouter()

  function handleLogout() {
    clearAuth()
    router.push('/')
  }

  const navItems = NAV_BY_ROLE[user?.role] || []
  const initial = user?.full_name ? user.full_name.charAt(0).toUpperCase() : '?'

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <Link href="/" className="logo">
          <img src="/img/logo.png" alt="NextdoorJobs" className="mark" />
          <span className="wordmark">NextdoorJobs</span>
        </Link>

        <nav className="app-nav">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={router.pathname === item.href ? 'active' : ''}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="app-sidebar-footer">
          <div className="app-user">
            <div className="avatar">{initial}</div>
            <div>
              <div className="name">{user?.full_name}</div>
              <div className="email">{user?.email}</div>
            </div>
          </div>
          <button className="btn btn-ghost app-logout-btn" onClick={handleLogout}>Log out</button>
        </div>
      </aside>

      <div className="app-main">
        <div className="app-topbar">
          <NotificationBell />
        </div>
        <div className="dash-content">{children}</div>
      </div>
    </div>
  )
}
