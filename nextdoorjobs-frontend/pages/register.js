import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import api from '@/lib/api'
import { saveAuth } from '@/lib/auth'

export default function Register() {
  const router = useRouter()
  const [role, setRole] = useState('worker')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [country, setCountry] = useState('')
  const [workType, setWorkType] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!router.isReady) return
    if (router.query.role === 'client' || router.query.role === 'worker') {
      setRole(router.query.role)
    }
  }, [router.isReady, router.query.role])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!fullName || !email || !password || !city || !region || !country) {
      setError('Please fill in all required fields.')
      return
    }
    if (role === 'worker' && !workType) {
      setError('Please select what kind of work you do.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/api/auth/register', {
        full_name: fullName,
        email,
        password,
        role,
        phone,
        city,
        region,
        country,
        work_type: role === 'worker' ? workType : undefined
      })
      saveAuth(res.data.token, res.data.user)

      const { next, listing } = router.query
      if (role === 'worker' && next === 'apply' && listing) {
        try {
          await api.post('/api/applications', { listing_id: listing })
        } catch (applyErr) {
          // Account is created either way; surface the apply failure on the dashboard instead of blocking registration.
        }
        router.push('/dashboard')
      } else if (role === 'client') {
        router.push('/hire')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Create an account | NextdoorJobs</title>
      </Head>

      <Header />

      <section className="auth-page">
        <div className="wrap" style={{ maxWidth: 560, width: '100%' }}>
          <div className="form-head">
            <p className="eyebrow">{role === 'worker' ? 'For job seekers' : 'For homeowners'}</p>
            <h1>{role === 'worker' ? 'Find work near you' : 'Create a job listing'}</h1>
            <p>
              {role === 'worker'
                ? "Tell us what you do and where. We'll reach out when a job matches."
                : "Tell us what you need and where. You'll get a link to share once you're in."}
            </p>
          </div>

          <form className="card" onSubmit={handleSubmit}>
            {error && <div className="form-error visible">{error}</div>}

            <div className="role-toggle">
              <button type="button" className={role === 'worker' ? 'active' : ''} onClick={() => setRole('worker')}>
                I want to work
              </button>
              <button type="button" className={role === 'client' ? 'active' : ''} onClick={() => setRole('client')}>
                I need help
              </button>
            </div>

            {role === 'worker' && (
              <div className="field">
                <label htmlFor="work-type">What kind of work do you do?</label>
                <select id="work-type" value={workType} onChange={(e) => setWorkType(e.target.value)} required>
                  <option value="" disabled>Select one</option>
                  <option value="House Sitting">House Sitting</option>
                  <option value="Pet Sitting">Pet Sitting</option>
                  <option value="Cleaning">Cleaning</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}

            <div className="field">
              <label>Where are you {role === 'worker' ? 'based' : 'located'}?</label>
              <div className="row-2">
                <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                <input type="text" placeholder="State / Province" value={region} onChange={(e) => setRegion(e.target.value)} required />
              </div>
            </div>

            <div className="field">
              <label htmlFor="country">Country</label>
              <select id="country" value={country} onChange={(e) => setCountry(e.target.value)} required>
                <option value="" disabled>Select one</option>
                <option value="Canada">Canada</option>
                <option value="United States">United States</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="full-name">Full name</label>
              <input id="full-name" type="text" placeholder="Jane Smith" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" placeholder="jane@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="field">
              <label htmlFor="phone">Phone or WhatsApp number</label>
              <input id="phone" type="tel" placeholder="+1 555 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>

            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" placeholder="At least 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
            </div>

            <button type="submit" className="btn btn-green form-submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account? <a href="/login">Log in</a>
          </p>
        </div>
      </section>

      <Footer />
    </>
  )
}
