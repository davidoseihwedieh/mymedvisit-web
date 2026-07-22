'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    const form = event.currentTarget
    const formData = new FormData(form)
    const name = [formData.get('firstName'), formData.get('lastName')].filter(Boolean).join(' ')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: formData.get('email'),
          role: formData.get('role'),
          message: formData.get('message'),
        }),
      })
      const data = await res.json()

      if (data.success) {
        setSubmitted(true)
      } else {
        setError(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="relative px-6 pb-16 pt-16">
        <div className="absolute inset-0 hero-sheen" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="reveal text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
              Get early access
            </p>
            <h1 className="reveal stagger-1 mt-4 font-[var(--font-fraunces)] text-[clamp(2.4rem,4vw,4.2rem)] leading-[1.08]">
              Be among the first to{' '}
              <span className="text-gradient">experience clarity</span>.
            </h1>
            <p className="reveal stagger-2 mt-6 text-lg leading-relaxed text-[rgba(13,27,42,0.6)]">
              We&apos;re onboarding families, caregivers, and healthcare professionals who want
              to shape the future of health communication.
            </p>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
            {/* Left: info cards */}
            <div className="space-y-6">
              <div className="reveal rounded-[24px] p-8" style={{ background: 'linear-gradient(135deg, rgba(10,126,164,0.08), rgba(224,244,246,0.4))' }}>
                <h3 className="text-lg font-semibold">For families & patients</h3>
                <p className="mt-3 text-sm leading-relaxed text-[rgba(13,27,42,0.55)]">
                  Request early access to start capturing your doctor visits, building your health
                  journal, and sharing updates with your care circle.
                </p>
              </div>
              <div className="reveal stagger-1 rounded-[24px] bg-white/85 p-8 shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--teal-dark)]">For healthcare professionals</h3>
                <p className="mt-3 text-sm leading-relaxed text-[rgba(13,27,42,0.55)]">
                  Interested in how MyMedVisit can improve patient communication and adherence?
                  We&apos;d love to explore a partnership.
                </p>
              </div>
              <div className="reveal stagger-2 rounded-[24px] bg-[var(--ink)] p-8 text-white">
                <h3 className="text-lg font-semibold">General inquiries</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/50">
                  Questions about our technology, privacy, or anything else?
                  Reach us at{' '}
                  <span className="font-medium text-white/70">hello@mymedvisit.app</span>
                </p>
              </div>
            </div>

            {/* Right: form */}
            <div className="reveal">
              <div className="glass-card rounded-[28px] p-10">
                {submitted ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                    <h3 className="text-xl font-bold text-emerald-900">Request Received!</h3>
                    <p className="mt-2 text-sm text-emerald-700">
                      Thank you for your interest in MyMedVisit. We&apos;ve routed your request to our team and will be in touch shortly.
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="font-[var(--font-fraunces)] text-2xl">Request early access</h2>
                    <p className="mt-2 text-sm text-[rgba(13,27,42,0.45)]">
                      We&apos;ll reach out with next steps within 48 hours.
                    </p>
                    <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-[0.15em] text-[rgba(13,27,42,0.4)]">
                            First name
                          </label>
                          <input
                            name="firstName"
                            type="text"
                            required
                            className="mt-2 w-full rounded-2xl border border-[rgba(13,27,42,0.1)] bg-white/80 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--teal)]"
                            placeholder="Jane"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-semibold uppercase tracking-[0.15em] text-[rgba(13,27,42,0.4)]">
                            Last name
                          </label>
                          <input
                            name="lastName"
                            type="text"
                            className="mt-2 w-full rounded-2xl border border-[rgba(13,27,42,0.1)] bg-white/80 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--teal)]"
                            placeholder="Smith"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.15em] text-[rgba(13,27,42,0.4)]">
                          Email address
                        </label>
                        <input
                          name="email"
                          type="email"
                          required
                          className="mt-2 w-full rounded-2xl border border-[rgba(13,27,42,0.1)] bg-white/80 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--teal)]"
                          placeholder="jane@example.com"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.15em] text-[rgba(13,27,42,0.4)]">
                          I am a...
                        </label>
                        <select
                          name="role"
                          className="mt-2 w-full appearance-none rounded-2xl border border-[rgba(13,27,42,0.1)] bg-white/80 px-4 py-3 text-sm text-[rgba(13,27,42,0.6)] outline-none transition-colors focus:border-[var(--teal)]"
                        >
                          <option value="">Select your role</option>
                          <option value="patient">Patient / Senior</option>
                          <option value="family">Family member / Adult child</option>
                          <option value="caregiver">Caregiver</option>
                          <option value="provider">Healthcare provider</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold uppercase tracking-[0.15em] text-[rgba(13,27,42,0.4)]">
                          Tell us more (optional)
                        </label>
                        <textarea
                          name="message"
                          rows={4}
                          className="mt-2 w-full resize-none rounded-2xl border border-[rgba(13,27,42,0.1)] bg-white/80 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--teal)]"
                          placeholder="What interests you most about MyMedVisit?"
                        />
                      </div>
                      {error && (
                        <p className="text-center text-sm font-medium text-red-600">{error}</p>
                      )}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-[var(--teal)] px-6 py-4 text-sm font-semibold text-white shadow-[var(--shadow)] transition-all disabled:opacity-60"
                      >
                        {loading ? 'Sending...' : 'Request Early Access'}
                      </button>
                      <p className="text-center text-xs text-[rgba(13,27,42,0.3)]">
                        By submitting, you agree to our{' '}
                        <Link href="/privacy" className="underline transition-colors hover:text-[var(--teal)]">
                          Privacy Policy
                        </Link>
                        .
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ mini */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="reveal text-center font-[var(--font-fraunces)] text-3xl">Common questions</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              {
                q: 'Is early access free?',
                a: 'Yes. During the early access period, MyMedVisit is completely free. We\'re focused on building the best experience with your feedback.',
              },
              {
                q: 'What devices are supported?',
                a: 'Currently iOS (iPhone & iPad). Android support is planned for the next phase. The web dashboard is available on any browser.',
              },
              {
                q: 'Is my data safe?',
                a: 'All data is encrypted end-to-end with AES-256. We use zero-knowledge architecture — even we can\'t read your health information.',
              },
              {
                q: 'Can I invite family members?',
                a: 'Yes. You can invite anyone to your care circle and control exactly what they see — full summaries, medication changes, or emergency alerts only.',
              },
            ].map((faq, index) => (
              <div
                key={faq.q}
                className={`reveal rounded-[20px] border border-[rgba(13,27,42,0.08)] bg-white/85 p-7 ${
                  index % 2 === 1 ? 'stagger-1' : ''
                }`}
              >
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[rgba(13,27,42,0.55)]">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
