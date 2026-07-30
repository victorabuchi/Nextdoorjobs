import { useEffect, useState } from 'react'
import Head from 'next/head'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
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

  return (
    <>
      <Head>
        <title>Your applications | NextdoorJobs</title>
      </Head>

      <Header />

      <section className="dash-page">
        <div className="wrap">
          <div className="dash-head">
            <h1>Hi {user.full_name.split(' ')[0]}, here&apos;s where things stand</h1>
          </div>

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
        </div>
      </section>

      <Footer />
    </>
  )
}
