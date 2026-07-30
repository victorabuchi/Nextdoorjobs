export function getToken() {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('nextdoorjobs_token')
}

export function getUser() {
  if (typeof window === 'undefined') return null
  const u = localStorage.getItem('nextdoorjobs_user')
  return u ? JSON.parse(u) : null
}

export function saveAuth(token, user) {
  localStorage.setItem('nextdoorjobs_token', token)
  localStorage.setItem('nextdoorjobs_user', JSON.stringify(user))
}

export function clearAuth() {
  localStorage.removeItem('nextdoorjobs_token')
  localStorage.removeItem('nextdoorjobs_user')
}

export function isLoggedIn() {
  return !!getToken()
}
