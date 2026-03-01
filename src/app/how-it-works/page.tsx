import { illustrations } from '@/assets/illustrations'
import Link from 'next/link'

const detailedSteps = [
  {
    num: '01',
    title: 'Speak naturally',
    subtitle: 'Your words, your pace, your way',
    description:
      'Open MyMedVisit and tap to record. Whether it\'s a quick vital ("blood pressure 120 over 80") or a full doctor visit recap, speak naturally. Our clinical-grade voice system understands medical terminology, accents, and pauses.',
    details: [
      'Quick Commands (5–10 seconds) for vitals and quick metrics',
      'Visit Summarization (up to 60 minutes) for full appointment recaps',
      'Medical vocabulary recognized automatically',
      'Works offline—data encrypts locally and syncs when reconnected',
    ],
    visual: 'capture',
  },
  {
    num: '02',
    title: 'AI understands medicine',
    subtitle: 'Extracts structure, checks for safety',
    description:
      'Your audio is converted to medical-grade text, then processed through specialized intelligence. The system extracts diagnoses (ICD-10), medications with dosages, vital changes, and action items—all while checking every medication against comprehensive drug interaction databases.',
    details: [
      'Automatic extraction of diagnoses, medications, dosages, and follow-ups',
      'Real-time cross-reference with drug interaction libraries',
      'Contraindication and dosage safety checks',
      'Clinical context preserved—it knows the difference between a side effect discussion and a medication mention',
    ],
    visual: 'process',
  },
  {
    num: '03',
    title: 'Patterns become visible',
    subtitle: 'Connected data reveals what single sources can\'t',
    description:
      'Visit summaries combine with your wearable data, glucose monitors, and health apps to build a complete picture. Glucose spikes, sleep disruption, vital trends—the system correlates them with medication changes and visits to surface patterns.',
    details: [
      'Apple Health, wearables, and CGM data automatically integrated',
      'Trends detected across weeks and months, not just individual snapshots',
      'Pattern alerts: "Glucose spike after medication adjustment" or "Sleep disruption linked to new prescription"',
      'Timeline shows how your health responds to changes',
    ],
    visual: 'review',
  },
  {
    num: '04',
    title: 'You stay in control',
    subtitle: 'Share insights, keep your privacy',
    description:
      'Invite family, caregivers, or doctors to receive updates—but only what you choose. Every share is encrypted. Every access is logged. Revoke permissions anytime.',
    details: [
      'Granular controls: choose what each person sees (full visit, meds only, vital trends, alerts only)',
      'End-to-end encryption—we can\'t read it, neither can unauthorized viewers',
      'Family members don\'t need an account for basic access',
      'Full audit trail: see exactly who viewed what, when',
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
            <h2 className="font-[var(--font-fraunces)] text-4xl">See what connected health looks like.</h2>
            <p className="mx-auto mt-4 max-w-lg text-[rgba(13,27,42,0.55)]">
              Join early access and experience how voice, data, and intelligence combine to reveal insights about your health.
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
