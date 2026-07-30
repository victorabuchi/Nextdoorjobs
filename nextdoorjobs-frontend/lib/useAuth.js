import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { getUser, isLoggedIn } from './auth'

export function useRequireAuth(requiredRole) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login')
      return
    }
    const cached = getUser()
    if (requiredRole && cached?.role !== requiredRole) {
      router.replace('/login')
      return
    }
    setUser(cached)
    setReady(true)
  }, [router, requiredRole])

  return { user, ready }
}
