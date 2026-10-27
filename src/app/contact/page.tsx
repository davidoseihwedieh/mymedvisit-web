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
    const name = [formData.get('firstName'), formData.get('lastName')]
      .filter(Boolean)
      .join(' ')

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
              Contact
            </p>
            <h1 className="reveal stagger-1 mt-4 font-[var(--font-fraunces)] text-[clamp(2.4rem,4vw,4.2rem)] leading-[1.08]">
              Let&apos;s talk about{' '}
              <span className="text-gradient">your program</span>.
            </h1>
            <p className="reveal stagger-2 mt-6 text-lg leading-relaxed text-[rgba(13,27,42,0.6)]">
              We work with clinicians, investigators, health systems, and public health programs.
              Tell us about your population and workflow.
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
                <h2 className="text-lg font-semibold">For clinical programs and health systems</h2>
                <p className="mt-3 text-sm leading-relaxed text-[rgba(13,27,42,0.55)]">
                  Remote monitoring, symptom reporting, or between-visit follow-up for a defined
                  population. We offer live demonstrations with synthetic participants.
                </p>
              </div>
              <div className="reveal stagger-1 rounded-[24px] bg-white/85 p-8 shadow-sm">
                <h2 className="text-lg font-semibold text-[var(--teal-dark)]">For investigators</h2>
                <p className="mt-3 text-sm leading-relaxed text-[rgba(13,27,42,0.55)]">
                  Research collaborations, site partnerships, and grant-funded studies. The platform
                  supports version-locked configurations, REDCap workflows, and audit trails.
                </p>
              </div>
              <div className="reveal stagger-2 rounded-[24px] bg-[var(--ink)] p-8 text-white">
                <h2 className="text-lg font-semibold">General inquiries</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/50">
                  Patients and caregivers: MyMedVisit is offered through participating care programs.
                  For other questions about the platform or privacy, reach us at{' '}
                  <span className="font-medium text-white/70">hello@mymedvisit.app</span>
                </p>
              </div>
            </div>

            {/* Right: form */}
            <div className="reveal">
              <div className="glass-card rounded-[28px] p-10">
                {submitted ? (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                    <h2 className="text-xl font-bold text-emerald-900">Message received</h2>
                    <p className="mt-2 text-sm text-emerald-700">
                      Thank you for your interest in MyMedVisit. We&apos;ve routed your message to our team and will be in touch shortly.
                    </p>
                  </div>
                ) : (
                  <>
                    <h2 className="font-[var(--font-fraunces)] text-2xl">Get in touch</h2>
                    <p className="mt-2 text-sm text-[rgba(13,27,42,0.45)]">
                      Please do not include personal health information in this form.
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
                        <label
                          htmlFor="contact-role"
                          className="text-xs font-semibold uppercase tracking-[0.15em] text-[rgba(13,27,42,0.4)]"
                        >
                          I am a...
                        </label>
                        <select
                          id="contact-role"
                          name="role"
                          className="mt-2 w-full appearance-none rounded-2xl border border-[rgba(13,27,42,0.1)] bg-white/80 px-4 py-3 text-sm text-[rgba(13,27,42,0.6)] outline-none transition-colors focus:border-[var(--teal)]"
                        >
                          <option value="">Select your role</option>
                          <option value="clinician">Clinician</option>
                          <option value="investigator">Researcher / investigator</option>
                          <option value="health-system">Health system or clinical program leader</option>
                          <option value="public-health">Payer or public health program</option>
                          <option value="patient-caregiver">Patient or caregiver</option>
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
                          placeholder="Your population, setting, and what you hope to learn or improve"
                        />
                      </div>
                      {error && (
                        <p className="text-center text-sm font-medium text-red-600">
                          {error}
                        </p>
                      )}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-full bg-[var(--teal)] px-6 py-4 text-sm font-semibold text-white shadow-[var(--shadow)] transition-all disabled:opacity-60"
                      >
                        {loading ? 'Sending...' : 'Send Message'}
                      </button>
                      <p className="text-center text-xs text-[rgba(13,27,42,0.3)]">
                        By submitting, you agree to our{' '}
                        <Link
                          href="/privacy"
                          className="underline transition-colors hover:text-[var(--teal)]"
                        >
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
          <h2 className="reveal text-center font-[var(--font-fraunces)] text-3xl">
            Common questions
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {[
              {
                q: 'Can I download MyMedVisit from the App Store?',
                a: 'Not yet. MyMedVisit is offered through participating clinics, health systems, and research programs, so every participant is connected to a responsible care team.',
              },
              {
                q: 'What devices are supported?',
                a: 'An iOS and Android app for patients and caregivers, cellular-connected devices for participants without a smartphone or home internet, and browser-based tools for care teams.',
              },
              {
                q: 'How is health information protected?',
                a: 'Data is encrypted in transit and at rest, access to clinical records is limited to authorized roles, and access and clinical actions are logged.',
              },
              {
                q: 'Can caregivers take part?',
                a: 'Yes, with permission. Caregivers can be invited to report what they observe, and their reports stay separate from the patient\'s own. Access is role-based and can be revoked.',
              },
            ].map((faq, index) => (
              <div
                key={faq.q}
                className={`reveal rounded-[20px] border border-[rgba(13,27,42,0.08)] bg-white/85 p-7 ${
                  index % 2 === 1 ? 'stagger-1' : ''
                }`}
              >
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-3 text-sm leading-relaxed text-[rgba(13,27,42,0.55)]">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
