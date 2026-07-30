import { useEffect, useState } from 'react'
import Head from 'next/head'
import DashboardLayout from '@/components/DashboardLayout'
import api from '@/lib/api'
import { useRequireAuth } from '@/lib/useAuth'

export default function Dashboard() {
  const { user, ready } = useRequireAuth('worker')
  const [applications, setApplications] = useState(null)

  useEffect(() => {
    if (!ready) return
    api.get('/api/applications/mine').then((res) => setApplications(res.data.applications))
  }, [ready])

  if (!ready) return null

  const matchedCount = applications ? applications.filter((a) => a.status === 'matched').length : 0
  const submittedCount = applications ? applications.filter((a) => a.status === 'submitted').length : 0

  return (
    <>
      <Head>
        <title>Your applications | NextdoorJobs</title>
      </Head>

      <DashboardLayout user={user}>
        <div className="dash-head">
          <h1>Hi {user.full_name.split(' ')[0]}, here&apos;s where things stand</h1>
        </div>

        {applications && (
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{applications.length}</div>
              <div className="stat-label">Total applications</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{submittedCount}</div>
              <div className="stat-label">Awaiting review</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{matchedCount}</div>
              <div className="stat-label">Matched</div>
            </div>
          </div>
        )}

        {!applications ? (
          <p>Loading...</p>
        ) : applications.length === 0 ? (
          <div className="dash-empty">
            <p>You haven&apos;t applied to anything yet. Browse a shared listing link to get started.</p>
          </div>
        ) : (
          <div className="dash-list">
            {applications.map((app) => (
              <div className="dash-item" key={app.id}>
                <div className="meta">
                  <h3>{app.service_type}</h3>
                  <p>{app.city}, {app.region}, {app.country}</p>
                </div>
                <div className="actions">
                  <span className={`status-badge ${app.status}`}>{app.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashboardLayout>
    </>
  )
}
