import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import api from '@/lib/api'
import { getUser, isLoggedIn } from '@/lib/auth'

export default function JobListing() {
  const router = useRouter()
  const { id, created } = router.query

  const [listing, setListing] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [applyState, setApplyState] = useState('idle')
  const [applyError, setApplyError] = useState('')

  useEffect(() => {
    if (!id) return
    api.get(`/api/listings/${id}`)
      .then((res) => setListing(res.data.listing))
      .catch(() => setNotFound(true))
  }, [id])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.origin + `/job/${id}`)
    }
  }, [id])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl)
    } catch (err) {
      // clipboard API unavailable, ignore
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleApply() {
    setApplyError('')
    if (!isLoggedIn()) {
      router.push(`/register?role=worker&next=apply&listing=${id}`)
      return
    }
    setApplyState('applying')
    try {
      await api.post('/api/applications', { listing_id: id })
      setApplyState('applied')
    } catch (err) {
      setApplyState('idle')
      setApplyError(err.response?.data?.error || 'Something went wrong. Please try again.')
    }
  }

  const user = getUser()

  if (notFound) {
    return (
      <>
        <Header />
        <section className="listing-page">
          <div className="wrap">
            <div className="listing-missing">
              <h1>This listing link looks incomplete.</h1>
              <p>Ask whoever shared it to resend the full link, or browse open work another way.</p>
              <a href="/" className="btn btn-ghost">Back to home</a>
            </div>
          </div>
        </section>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Job listing | NextdoorJobs</title>
        <meta name="description" content="View this job listing and apply." />
      </Head>

      <Header />

      <section className="listing-page">
        <div className="wrap">
          {created === '1' && (
            <div className="link-box" style={{ maxWidth: 600 }}>
              <input type="text" readOnly value={shareUrl} />
              <button className="btn btn-green" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy link'}
              </button>
            </div>
          )}

          <div className="listing-card">
            <div className="glow"></div>
            {!listing ? (
              <h1>Loading listing...</h1>
            ) : (
              <>
                <h1>{listing.service_type}</h1>
                <p className="location">{listing.city}, {listing.region}, {listing.country}</p>
                {listing.details && <p className="details">{listing.details}</p>}

                {applyError && <div className="form-error visible">{applyError}</div>}

                {listing.status !== 'open' ? (
                  <span className="status-badge closed">Listing closed</span>
                ) : applyState === 'applied' ? (
                  <span className="status-badge matched">Applied</span>
                ) : user?.role === 'client' ? (
                  <p className="hint">Log in as a job seeker to apply for this listing.</p>
                ) : (
                  <button className="btn btn-green" onClick={handleApply} disabled={applyState === 'applying'}>
                    {applyState === 'applying' ? 'Applying...' : 'Apply for this job'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
