import { useEffect, useState } from 'react'
import Head from 'next/head'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import api from '@/lib/api'
import { useRequireAuth } from '@/lib/useAuth'

const STATUSES = ['submitted', 'reviewing', 'matched', 'rejected']

export default function Admin() {
  const { user, ready } = useRequireAuth('admin')
  const [tab, setTab] = useState('applications')
  const [listings, setListings] = useState(null)
  const [applications, setApplications] = useState(null)

  useEffect(() => {
    if (!ready) return
    api.get('/api/admin/listings').then((res) => setListings(res.data.listings))
    api.get('/api/admin/applications').then((res) => setApplications(res.data.applications))
  }, [ready])

  async function updateStatus(appId, status) {
    setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)))
    await api.patch(`/api/admin/applications/${appId}`, { status })
  }

  if (!ready) return null

  return (
    <>
      <Head>
        <title>Admin | NextdoorJobs</title>
      </Head>

      <Header />

      <section className="dash-page">
        <div className="wrap">
          <div className="dash-head">
            <h1>Staff dashboard</h1>
            <div className="role-toggle" style={{ marginBottom: 0, width: 320 }}>
              <button type="button" className={tab === 'applications' ? 'active' : ''} onClick={() => setTab('applications')}>
                Applications
              </button>
              <button type="button" className={tab === 'listings' ? 'active' : ''} onClick={() => setTab('listings')}>
                Listings
              </button>
            </div>
          </div>

          {tab === 'applications' && (
            !applications ? (
              <p>Loading...</p>
            ) : applications.length === 0 ? (
              <div className="dash-empty"><p>No applications yet.</p></div>
            ) : (
              <div className="dash-list">
                {applications.map((app) => (
                  <div className="dash-item" key={app.id}>
                    <div className="meta">
                      <h3>{app.worker_name} &rarr; {app.service_type}</h3>
                      <p>{app.worker_email} &middot; {app.city}, {app.region}, {app.country}</p>
                    </div>
                    <div className="actions">
                      <select
                        className="status-select"
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {tab === 'listings' && (
            !listings ? (
              <p>Loading...</p>
            ) : listings.length === 0 ? (
              <div className="dash-empty"><p>No listings yet.</p></div>
            ) : (
              <div className="dash-list">
                {listings.map((listing) => (
                  <div className="dash-item" key={listing.id}>
                    <div className="meta">
                      <h3>{listing.service_type}</h3>
                      <p>{listing.city}, {listing.region}, {listing.country} &middot; {listing.client_name} ({listing.client_email}) &middot; {listing.applicant_count} applicant{listing.applicant_count === 1 ? '' : 's'}</p>
                    </div>
                    <span className={`status-badge ${listing.status}`}>{listing.status}</span>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </section>

      <Footer />
    </>
  )
}
