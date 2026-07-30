import Head from 'next/head'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <>
      <Head>
        <title>NextdoorJobs | Local help, right on your street</title>
        <meta
          name="description"
          content="House sitting, pet care, cleaning, and housekeeping, matched by neighbourhood across Canada and the US."
        />
      </Head>

      <Header />

      <section className="hero">
        <div className="wrap">
          <p className="eyebrow">Serving neighbourhoods across Canada &amp; the US</p>
          <h1>Local help, right on your street.</h1>
          <p className="lede">
            House sitting, pet care, cleaning, and housekeeping, matched to your neighbourhood, not to an algorithm.
          </p>

          <div className="split">
            <Link href="/register?role=worker" className="split-panel for-work">
              <div className="glow"></div>
              <h2>I want to work</h2>
              <p>List what you do and where. We&apos;ll reach out when a job opens up near you.</p>
              <span className="go">FIND WORK</span>
            </Link>
            <div className="split-fence"></div>
            <Link href="/register?role=client" className="split-panel for-hire">
              <div className="glow"></div>
              <h2>I need help</h2>
              <p>Post a job in minutes, then share the link so people nearby can apply.</p>
              <span className="go">CREATE A LISTING</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="wrap">
        <div className="streetline">
          <span className="lit"></span><span></span><span></span>
          <span className="lit"></span><span></span><span></span><span className="lit"></span>
        </div>
      </div>

      <section className="steps">
        <div className="wrap">
          <h2>How it works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="num">01</div>
              <h3>Post or apply</h3>
              <p>Homeowners create a job listing. Workers list their skills and area.</p>
            </div>
            <div className="step">
              <div className="num">02</div>
              <h3>Share the link</h3>
              <p>Every listing gets its own link. Send it around and anyone can view it and apply.</p>
            </div>
            <div className="step">
              <div className="num">03</div>
              <h3>We connect you</h3>
              <p>Applications come to us first, so we reach out and make the match.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
