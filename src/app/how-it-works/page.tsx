import { illustrations } from '@/assets/illustrations'
import Link from 'next/link'

const detailedSteps = [
  {
    num: '01',
    title: 'Enroll through a care program',
    subtitle: 'Connected to a responsible care team',
    description:
      'Participants join through a clinic, health system, or research program, not an app store. Every participant is linked to a care team and an escalation path before any data is collected.',
    details: [
      'Institution-issued invitation and identity verification',
      'Program-specific consent and emergency instructions',
      'Optional, permissioned caregiver enrollment',
      'Smartphone app or cellular devices, whichever fits the participant',
    ],
    visual: 'capture',
  },
  {
    num: '02',
    title: 'Capture what changes between visits',
    subtitle: 'Reports, devices, and context',
    description:
      'Patients and caregivers report changes by voice or text when they notice them. Phone, wearable, or cellular-device readings arrive alongside, and health-record context comes in through SMART on FHIR where the program connects it.',
    details: [
      'User-activated voice or text; never continuous listening',
      'Patient and caregiver reports kept separate and attributed',
      'Readings compared against each person’s own baseline',
      'Language detection for multilingual reporting',
    ],
    visual: 'process',
  },
  {
    num: '03',
    title: 'Clarify and screen',
    subtitle: 'Ask for what is missing',
    description:
      'When a report leaves out what a clinician needs — onset, severity, trajectory, effect on daily function — the platform asks a short follow-up. Program-specific rules then screen the completed report.',
    details: [
      'Targeted follow-up instead of a fixed questionnaire',
      'Clinician-approved rules for each program',
      'Screening never lowers an urgent result',
      'Severe symptoms are directed to emergency care at once',
    ],
    visual: 'review',
  },
  {
    num: '04',
    title: 'Review, act, and document',
    subtitle: 'Clinicians stay in charge',
    description:
      'Structured reports enter a ring-fenced escalation queue. A named clinician claims each item, decides what to do, and closes it only with a documented outcome. Programs can report on completeness, timeliness, and alert burden.',
    details: [
      'Every escalation claimed, worked, and closed with an outcome',
      'Source-linked statements, device trends, and open questions in one view',
      'Audit trail from receipt to resolution',
      'Program and study reporting',
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
              From a change at home to{' '}
              <span className="text-gradient">care-team action</span>.
            </h1>
            <p className="reveal stagger-2 mt-6 text-lg leading-relaxed text-[rgba(13,27,42,0.6)]">
              The same four steps run in every program, whether it is oncology symptom monitoring,
              recovery after a COPD exacerbation, or rural remote monitoring. Only the clinical
              questions, thresholds, and escalation paths change.
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
            <h2 className="font-[var(--font-fraunces)] text-4xl">Bring the time between visits into view.</h2>
            <p className="mx-auto mt-4 max-w-lg text-[rgba(13,27,42,0.55)]">
              We work with clinical programs, investigators, and health systems to configure the platform for a specific population and workflow.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="rounded-full bg-[var(--ink)] px-8 py-4 text-sm font-semibold text-white shadow-[var(--shadow)]"
              >
                Talk With Us
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
