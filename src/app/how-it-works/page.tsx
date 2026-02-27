import { illustrations } from '@/assets/illustrations'
import Link from 'next/link'

const detailedSteps = [
  {
    num: '01',
    title: 'Capture with your voice',
    subtitle: 'Speak naturally — the way you already do',
    description:
      'Open MyMedVisit, tap once, and speak. Whether you\'re summarizing a quick blood pressure reading or an entire doctor\'s visit, our voice pipeline is optimized for natural speech — accents, pauses, medical terminology, and all.',
    details: [
      'Two modes: Quick Commands (1–10 sec) and Visit Summarization (up to 60 min)',
      'Advanced noise suppression isolates your voice in any environment',
      'Offline-capable — data is encrypted and synced when you reconnect',
      'No training required — the system adapts to you',
    ],
    visual: 'capture',
  },
  {
    num: '02',
    title: 'Intelligence extracts meaning',
    subtitle: 'Proprietary AI pipelines turn speech into structured health data',
    description:
      'Your visit is processed through multiple layers of specialized intelligence. Voice is converted to text with medical-grade accuracy, then analyzed to extract diagnoses, medications, vitals, action items, and emotional context.',
    details: [
      'Multi-stage voice-to-text pipeline tuned for clinical vocabulary',
      'Automatic extraction of medications, dosages, and scheduling',
      'Intelligent summarization that preserves clinical nuance',
      'Evidence-based cross-referencing with pharmacological databases',
    ],
    visual: 'process',
  },
  {
    num: '03',
    title: 'Review your insights',
    subtitle: 'Clear summaries that make sense',
    description:
      'Every visit becomes a structured summary: key updates, next steps, medication changes, and follow-up dates. Your health journal builds over time, revealing trends that single visits can\'t show.',
    details: [
      'Visit summaries organized by date, provider, and specialty',
      'Timeline view shows vitals and symptoms trending over weeks',
      'Medication list auto-updates with each visit',
      'Alerts for potential interactions or missed follow-ups',
    ],
    visual: 'review',
  },
  {
    num: '04',
    title: 'Share with those who care',
    subtitle: 'Keep your care circle informed — on your terms',
    description:
      'Invite family members, caregivers, or providers to receive updates. You control exactly what they see: full summaries, medication changes only, or emergency alerts. Revoke access anytime.',
    details: [
      'Granular sharing controls — by person, by visit, by data type',
      'Family members get their own view (no account required for basic access)',
      'Emergency contact auto-alerts for critical changes',
      'HIPAA-aligned sharing with full audit trail',
    ],
    visual: 'share',
  },
]

export default function HowItWorks() {
  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="relative px-6 pb-20 pt-16">
        <div className="absolute inset-0 hero-sheen" />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="reveal text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
              How it works
            </p>
            <h1 className="reveal stagger-1 mt-4 font-[var(--font-fraunces)] text-[clamp(2.4rem,4vw,4.2rem)] leading-[1.08]">
              From voice to clarity in{' '}
              <span className="text-gradient">four simple steps</span>.
            </h1>
            <p className="reveal stagger-2 mt-6 text-lg leading-relaxed text-[rgba(13,27,42,0.6)]">
              MyMedVisit was designed so that the hardest part of managing your health
              is already done — you just have to speak.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="space-y-24">
            {detailedSteps.map((step, index) => (
              <div
                key={step.num}
                className="grid items-start gap-12 lg:grid-cols-2"
              >
                <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                  <div className="reveal">
                    <span className="font-[var(--font-fraunces)] text-6xl text-[rgba(10,126,164,0.15)]">{step.num}</span>
                    <h2 className="mt-2 font-[var(--font-fraunces)] text-3xl">{step.title}</h2>
                    <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--teal-dark)]">
                      {step.subtitle}
                    </p>
                    <p className="mt-5 leading-relaxed text-[rgba(13,27,42,0.6)]">{step.description}</p>
                  </div>
                  <ul className="reveal stagger-1 mt-8 space-y-4">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-start gap-3 text-sm text-[rgba(13,27,42,0.6)]">
                        <span className="mt-1.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full" style={{ background: 'rgba(10,126,164,0.1)' }}>
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--teal)' }}>
                            <path d="M2 6l3 3 5-5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`reveal stagger-2 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div className="glass-card rounded-[28px] p-8">
                    {step.visual === 'capture' && (
                      <img src={illustrations.heroVoiceCapture} alt="Voice capture" className="w-full object-contain" />
                    )}
                    {step.visual === 'process' && (
                      <img src={illustrations.aiProcessing} alt="AI processing" className="w-full object-contain no-shadow-bg" />
                    )}
                    {step.visual === 'review' && (
                      <img src={illustrations.healthJournal} alt="Health journal" className="w-full object-contain" />
                    )}
                    {step.visual === 'share' && (
                      <img src={illustrations.familySharing} alt="Family sharing" className="w-full object-contain" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 pt-16">
        <div className="mx-auto max-w-4xl">
          <div className="glass-card reveal rounded-[32px] p-12 text-center">
            <h2 className="font-[var(--font-fraunces)] text-4xl">Ready to simplify your health journey?</h2>
            <p className="mx-auto mt-4 max-w-lg text-[rgba(13,27,42,0.55)]">
              Join early access and experience what it&apos;s like when your health information works for you.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="rounded-full bg-[var(--ink)] px-8 py-4 text-sm font-semibold text-white shadow-[var(--shadow)]"
              >
                Get Early Access
              </Link>
              <Link
                href="/technology"
                className="rounded-full border border-[rgba(13,27,42,0.15)] px-8 py-4 text-sm font-semibold text-[var(--ink)]"
              >
                Explore the Technology
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
