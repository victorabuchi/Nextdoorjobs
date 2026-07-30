import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import api from '@/lib/api'
import { saveAuth } from '@/lib/auth'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post('/api/auth/login', { email, password })
      saveAuth(res.data.token, res.data.user)

      const role = res.data.user?.role
      if (role === 'admin') router.push('/admin')
      else if (role === 'client') router.push('/client')
      else router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Log in | NextdoorJobs</title>
      </Head>

      <Header />

      <section className="auth-page">
        <div className="wrap" style={{ maxWidth: 560, width: '100%' }}>
          <div className="form-head">
            <h1>Welcome back</h1>
            <p>Log in to see your applications, listings, or dashboard.</p>
          </div>

          <form className="card" onSubmit={handleSubmit}>
            {error && <div className="form-error visible">{error}</div>}

            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <button type="submit" className="btn btn-green form-submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="auth-footer">
            New to NextdoorJobs? <a href="/register">Create an account</a>
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}
