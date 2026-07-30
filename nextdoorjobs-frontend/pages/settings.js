import { useEffect, useState } from 'react'
import Head from 'next/head'
import DashboardLayout from '@/components/DashboardLayout'
import api from '@/lib/api'
import { useRequireAuth } from '@/lib/useAuth'
import { saveAuth, getToken } from '@/lib/auth'

export default function Settings() {
  const { user, ready } = useRequireAuth()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [country, setCountry] = useState('')
  const [workType, setWorkType] = useState('')
  const [profileError, setProfileError] = useState('')
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)

  useEffect(() => {
    if (!ready) return
    setFullName(user.full_name || '')
    setPhone(user.phone || '')
    setCity(user.city || '')
    setRegion(user.region || '')
    setCountry(user.country || '')
    setWorkType(user.work_type || '')
  }, [ready, user])

  if (!ready) return null

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setProfileError('')
    setProfileSaved(false)
    setProfileLoading(true)
    try {
      const res = await api.patch('/api/auth/me', {
        full_name: fullName,
        phone,
        city,
        region,
        country,
        work_type: user.role === 'worker' ? workType : undefined
      })
      saveAuth(getToken(), res.data.user)
      setProfileSaved(true)
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setProfileLoading(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSaved(false)
    setPasswordLoading(true)
    try {
      await api.post('/api/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword
      })
      setPasswordSaved(true)
      setCurrentPassword('')
      setNewPassword('')
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setPasswordLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Settings | NextdoorJobs</title>
      </Head>

      <DashboardLayout user={user}>
        <div className="dash-head">
          <h1>Settings</h1>
        </div>

        <form className="card" onSubmit={handleProfileSubmit} style={{ maxWidth: 560, marginBottom: 28 }}>
          {profileError && <div className="form-error visible">{profileError}</div>}
          {profileSaved && <p style={{ color: 'var(--green-dark)', fontWeight: 600, fontSize: 13.5, marginTop: -10, marginBottom: 20 }}>Profile updated.</p>}

          <div className="field">
            <label htmlFor="full-name">Full name</label>
            <input id="full-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>

          <div className="field">
            <label>Email</label>
            <input type="email" value={user.email} disabled style={{ opacity: 0.6 }} />
            <span className="hint">Email can&apos;t be changed here.</span>
          </div>

          {user.role === 'worker' && (
            <div className="field">
              <label htmlFor="work-type">What kind of work do you do?</label>
              <select id="work-type" value={workType} onChange={(e) => setWorkType(e.target.value)}>
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
            <label>Location</label>
            <div className="row-2">
              <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
              <input type="text" placeholder="State / Province" value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="country">Country</label>
            <select id="country" value={country} onChange={(e) => setCountry(e.target.value)}>
              <option value="" disabled>Select one</option>
              <option value="Canada">Canada</option>
              <option value="United States">United States</option>
            </select>
          </div>

          <div className="field">
            <label htmlFor="phone">Phone or WhatsApp number</label>
            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <button type="submit" className="btn btn-green" disabled={profileLoading}>
            {profileLoading ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        <form className="card" onSubmit={handlePasswordSubmit} style={{ maxWidth: 560 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 18, margin: '0 0 18px' }}>Change password</h3>

          {passwordError && <div className="form-error visible">{passwordError}</div>}
          {passwordSaved && <p style={{ color: 'var(--green-dark)', fontWeight: 600, fontSize: 13.5, marginTop: -10, marginBottom: 20 }}>Password updated.</p>}

          <div className="field">
            <label htmlFor="current-password">Current password</label>
            <input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
          </div>

          <div className="field">
            <label htmlFor="new-password">New password</label>
            <input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={8} />
          </div>

          <button type="submit" className="btn btn-green" disabled={passwordLoading}>
            {passwordLoading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </DashboardLayout>
    </>
  )
}
