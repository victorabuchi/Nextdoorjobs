import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getUser, clearAuth } from '@/lib/auth'

export default function Header() {
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  function handleLogout(e) {
    e.preventDefault()
    clearAuth()
    setUser(null)
    router.push('/')
  }

  const dashboardHref = user?.role === 'admin' ? '/admin' : user?.role === 'client' ? '/client' : '/dashboard'

  return (
    <header className="site-header">
      <div className="wrap">
        <Link href="/" className="logo">
          <img src="/img/logo.png" alt="NextdoorJobs" className="mark" />
          <span className="wordmark">NextdoorJobs</span>
        </Link>
        <nav className="header-nav">
          {user ? (
            <>
              <Link href={dashboardHref}>Dashboard</Link>
              <a href="#" onClick={handleLogout}>Log out</a>
            </>
          ) : (
            <>
              <Link href="/register?role=worker">Find work</Link>
              <Link href="/register?role=client">Hire someone</Link>
              <Link href="/login">Log in</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
