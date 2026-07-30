import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import api from '@/lib/api'
import { useRequireAuth } from '@/lib/useAuth'

export default function Hire() {
  const router = useRouter()
  const { user, ready } = useRequireAuth('client')

  const [serviceType, setServiceType] = useState('')
  const [city, setCity] = useState('')
  const [region, setRegion] = useState('')
  const [country, setCountry] = useState('')
  const [details, setDetails] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!ready) return null

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!serviceType || !city || !region || !country) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/api/listings', {
        service_type: serviceType,
        city,
        region,
        country,
        details
      })
      router.push(`/job/${res.data.listing.id}?created=1`)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Create a job listing | NextdoorJobs</title>
      </Head>

      <Header />

      <section className="form-page">
        <div className="wrap">
          <div className="form-head">
            <p className="eyebrow">For homeowners</p>
            <h1>Create a job listing</h1>
            <p>Tell us what you need and where. You&apos;ll get a link to share, and anyone who opens it can view the listing and apply.</p>
          </div>

          <form className="card" onSubmit={handleSubmit}>
            {error && <div className="form-error visible">{error}</div>}

            <div className="field">
              <label htmlFor="service-type">What do you need help with?</label>
              <select id="service-type" value={serviceType} onChange={(e) => setServiceType(e.target.value)} required>
                <option value="" disabled>Select one</option>
                <option value="House Sitting">House Sitting</option>
                <option value="Pet Sitting">Pet Sitting</option>
                <option value="Cleaning">Cleaning</option>
                <option value="Housekeeping">Housekeeping</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="field">
              <label>Where do you need help?</label>
              <div className="row-2">
                <input type="text" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required />
                <input type="text" placeholder="State / Province" value={region} onChange={(e) => setRegion(e.target.value)} required />
              </div>
              <span className="hint">Shown on the public listing. This is what applicants see.</span>
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
              <label htmlFor="details">
                Job details <span className="hint" style={{ display: 'inline', margin: 0 }}>(shown on the listing, optional)</span>
              </label>
              <textarea
                id="details"
                placeholder="Dates, frequency, pets, home size: whatever helps people decide if it's a fit."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-green form-submit" disabled={loading}>
              {loading ? 'Creating listing...' : 'Create listing'}
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </>
  )
}
