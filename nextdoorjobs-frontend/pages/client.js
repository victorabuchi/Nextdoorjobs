import { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import api from '@/lib/api'
import { useRequireAuth } from '@/lib/useAuth'

export default function ClientDashboard() {
  const { user, ready } = useRequireAuth('client')
  const [listings, setListings] = useState(null)
  const [expanded, setExpanded] = useState(null)
  const [applicants, setApplicants] = useState({})

  useEffect(() => {
    if (!ready) return
    api.get('/api/listings/mine').then((res) => setListings(res.data.listings))
  }, [ready])

  async function toggleExpand(listingId) {
    if (expanded === listingId) {
      setExpanded(null)
      return
    }
    setExpanded(listingId)
    if (!applicants[listingId]) {
      const res = await api.get(`/api/applications/listing/${listingId}`)
      setApplicants((prev) => ({ ...prev, [listingId]: res.data.applications }))
    }
  }

  if (!ready) return null

  const openCount = listings ? listings.filter((l) => l.status === 'open').length : 0
  const totalApplicants = listings ? listings.reduce((sum, l) => sum + l.applicant_count, 0) : 0

  return (
    <>
      <Head>
        <title>Your listings | NextdoorJobs</title>
      </Head>

      <DashboardLayout user={user}>
        <div className="dash-head">
          <h1>Hi {user.full_name.split(' ')[0]}, here are your listings</h1>
          <Link href="/hire" className="btn btn-green">Create a listing</Link>
        </div>

        {listings && (
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{listings.length}</div>
              <div className="stat-label">Total listings</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{openCount}</div>
              <div className="stat-label">Open</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalApplicants}</div>
              <div className="stat-label">Total applicants</div>
            </div>
          </div>
        )}

        {!listings ? (
          <p>Loading...</p>
        ) : listings.length === 0 ? (
          <div className="dash-empty">
            <p>You haven&apos;t posted a listing yet.</p>
          </div>
        ) : (
          <div className="dash-list">
            {listings.map((listing) => (
              <div key={listing.id}>
                <div className="dash-item">
                  <div className="meta">
                    <h3>{listing.service_type}</h3>
                    <p>{listing.city}, {listing.region}, {listing.country} &middot; {listing.applicant_count} applicant{listing.applicant_count === 1 ? '' : 's'}</p>
                  </div>
                  <div className="actions">
                    <span className={`status-badge ${listing.status}`}>{listing.status}</span>
                    <button className="btn btn-ghost" onClick={() => toggleExpand(listing.id)}>
                      {expanded === listing.id ? 'Hide applicants' : 'View applicants'}
                    </button>
                  </div>
                </div>

                {expanded === listing.id && (
                  <div className="dash-item" style={{ marginTop: -6, borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
                    {!applicants[listing.id] ? (
                      <p>Loading applicants...</p>
                    ) : applicants[listing.id].length === 0 ? (
                      <p style={{ color: 'var(--text-muted)' }}>No applicants yet.</p>
                    ) : (
                      <div style={{ width: '100%' }}>
                        {applicants[listing.id].map((a) => (
                          <div className="applicant-row" key={a.id}>
                            <div className="meta">
                              <strong>{a.full_name}</strong>
                              <p>{a.email}{a.phone ? ` · ${a.phone}` : ''}</p>
                            </div>
                            <span className={`status-badge ${a.status}`}>{a.status}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </>
  )
}
