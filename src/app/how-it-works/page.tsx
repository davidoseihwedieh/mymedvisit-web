import { illustrations } from '@/assets/illustrations'
import Link from 'next/link'

const detailedSteps = [
  {
    num: '01',
    title: 'Record your doctor visit',
    subtitle: 'Capture the conversation naturally',
    description:
      'Open MyMedVisit and tap record. Talk naturally during or after your appointment. No need to take notes. Our system understands medical terminology, handles background noise, and captures everything discussed.',
    details: [
      'Record during the visit or immediately after',
      'Works even in noisy clinic environments',
      'Medical terminology recognized automatically',
      'Data encrypted locally and never leaves your device unencrypted',
    ],
    visual: 'capture',
  },
  {
    num: '02',
    title: 'Get a clinical summary',
    subtitle: 'Structured note focusing on what matters',
    description:
      'Our medical AI transforms your recording into a clean clinical note. Diagnoses, medications, dosages, and recommendations—clearly organized. No small talk, no fluff. Just clinically relevant information you can reference forever.',
    details: [
      'Automatic extraction of diagnoses and clinical findings',
      'Medications with dosages clearly listed',
      'Recommendations and action items prioritized',
      'Ignores pleasantries and non-clinical conversation',
    ],
    visual: 'process',
  },
  {
    num: '03',
    title: 'Query your note with AI',
    subtitle: 'Understand the medical reasoning',
    description:
      'Your clinical note is searchable and queryable. Ask "Why did my doctor recommend this medication?" or "What does this diagnosis mean?" Our AI provides clear answers grounded in medical evidence and your specific situation.',
    details: [
      'Ask questions about diagnoses, medications, recommendations',
      'Get explanations in plain English, not medical jargon',
      'Understand the reasoning behind your doctor\'s choices',
      'Upload lab results and get interpretations',
    ],
    visual: 'review',
  },
  {
    num: '04',
    title: 'Log symptoms, share with family',
    subtitle: 'Better health insights through data',
    description:
      'Log how you feel daily—symptoms, energy levels, concerns. This data helps your clinician make better decisions. Share your visit notes with family who missed the appointment. They can query your notes too. Get AI alerts for concerning symptom combinations.',
    details: [
      'Daily symptom logging improves clinician decision-making',
      'Share visit summaries with loved ones instantly',
      'Family members can query your clinical notes',
      'Red flag alerts if you log a dangerous symptom given your diagnoses',
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
              From doctor visit to{' '}
              <span className="text-gradient">medical understanding</span>.
            </h1>
            <p className="reveal stagger-2 mt-6 text-lg leading-relaxed text-[rgba(13,27,42,0.6)]">
              Record your appointment. Get a searchable clinical note. Query it for medical insights. Log your symptoms. Share with family. That\'s how you take control of your health.
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
            <h2 className="font-[var(--font-fraunces)] text-4xl">Never forget what your doctor said.</h2>
            <p className="mx-auto mt-4 max-w-lg text-[rgba(13,27,42,0.55)]">
              Join early access and start transforming your doctor visits into searchable, queryable medical records you can understand and share.
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
