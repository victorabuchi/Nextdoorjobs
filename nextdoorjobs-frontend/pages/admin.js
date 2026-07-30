import { useEffect, useState } from 'react'
import Head from 'next/head'
import DashboardLayout from '@/components/DashboardLayout'
import api from '@/lib/api'
import { useRequireAuth } from '@/lib/useAuth'

const STATUSES = ['submitted', 'reviewing', 'matched', 'rejected']

export default function Admin() {
  const { user, ready } = useRequireAuth('admin')
  const [tab, setTab] = useState('applications')
  const [listings, setListings] = useState(null)
  const [applications, setApplications] = useState(null)
  const [users, setUsers] = useState(null)

  useEffect(() => {
    if (!ready) return
    api.get('/api/admin/listings').then((res) => setListings(res.data.listings))
    api.get('/api/admin/applications').then((res) => setApplications(res.data.applications))
    api.get('/api/admin/users').then((res) => setUsers(res.data.users))
  }, [ready])

  async function updateStatus(appId, status) {
    setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)))
    await api.patch(`/api/admin/applications/${appId}`, { status })
  }

  if (!ready) return null

  const pendingCount = applications ? applications.filter((a) => a.status === 'submitted' || a.status === 'reviewing').length : 0

  return (
    <>
      <Head>
        <title>Admin | NextdoorJobs</title>
      </Head>

      <DashboardLayout user={user}>
        <div className="dash-head">
          <h1>Staff dashboard</h1>
        </div>

        {users && listings && applications && (
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{users.length}</div>
              <div className="stat-label">Total users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{listings.length}</div>
              <div className="stat-label">Total listings</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{applications.length}</div>
              <div className="stat-label">Total applications</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{pendingCount}</div>
              <div className="stat-label">Pending review</div>
            </div>
          </div>
        )}

        <div className="role-toggle" style={{ marginBottom: 24, width: 480 }}>
          <button type="button" className={tab === 'applications' ? 'active' : ''} onClick={() => setTab('applications')}>
            Applications
          </button>
          <button type="button" className={tab === 'listings' ? 'active' : ''} onClick={() => setTab('listings')}>
            Listings
          </button>
          <button type="button" className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>
            Users
          </button>
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

        {tab === 'users' && (
          !users ? (
            <p>Loading...</p>
          ) : users.length === 0 ? (
            <div className="dash-empty"><p>No users yet.</p></div>
          ) : (
            <div className="dash-list">
              {users.map((u) => (
                <div className="dash-item" key={u.id}>
                  <div className="meta">
                    <h3>{u.full_name}</h3>
                    <p>{u.email} {u.city ? `· ${u.city}, ${u.region}, ${u.country}` : ''}</p>
                  </div>
                  <span className={`status-badge ${u.role === 'admin' ? 'matched' : 'open'}`}>{u.role}</span>
                </div>
              ))}
            </div>
          )
        )}
      </DashboardLayout>
    </>
  )
}
