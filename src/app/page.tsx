import Link from 'next/link'
import { illustrations } from '@/assets/illustrations'

const steps = [
  {
    title: 'Speak naturally',
    description: 'Describe a visit or say a quick metric. No typing, no menus.',
    icon: (
      <img src={illustrations.heroVoiceCapture} alt="Speak naturally" className="h-[140px] w-[140px] object-contain" />
    ),
  },
  {
    title: 'AI extracts meaning',
    description: 'Summaries, medications, and action items — created in seconds.',
    icon: (
      <img src={illustrations.aiProcessing} alt="AI extracts meaning" className="h-[140px] w-[140px] object-contain" />
    ),
  },
  {
    title: 'Share with care',
    description: 'Encrypted updates to family, caregivers, or providers — on your terms.',
    icon: (
      <img src={illustrations.familySharing} alt="Share with care" className="h-[140px] w-[140px] object-contain" />
    ),
  },
]

const features = [
  {
    title: 'Visit summaries',
    description: 'Clear, readable notes after every appointment.',
  },
  {
    title: 'Health journal & trends',
    description: 'Track vitals, symptoms, and mood in one calm timeline.',
  },
  {
    title: 'Family sharing',
    description: 'Invite trusted family members to receive updates.',
  },
  {
    title: 'Medication tracking',
    description: 'Keep lists, reminders, and adherence insights together.',
  },
  {
    title: 'Privacy by design',
    description: 'Automatic PII anonymization before cloud analysis.',
  },
  {
    title: 'Offline resilience',
    description: 'Retry-safe uploads keep your data secure even on weak signal.',
  },
]

const useCases = [
  {
    title: 'For seniors',
    description: 'A simple voice-first companion that remembers the details.',
  },
  {
    title: 'For adult children',
    description: 'Stay informed without hovering or overwhelming your loved one.',
  },
  {
    title: 'For caregivers',
    description: 'Create a shared view of outcomes, meds, and care plans.',
  },
]

const faqs = [
  {
    title: 'Do I need to type?',
    description: 'No. MyMedVisit is voice-first. Speak naturally or tap once to start.',
  },
  {
    title: 'Who sees my data?',
    description: 'Only you and the people you invite. Sharing is always optional.',
  },
  {
    title: 'Does it work for long visits?',
    description: 'Yes. It supports short commands and full-length visit summaries.',
  },
  {
    title: 'Can I use it between appointments?',
    description: 'Absolutely. Log symptoms, vitals, and notes any time.',
  },
]

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 hero-sheen" />

      {/* Hero */}
      <section className="relative px-6 pb-20 pt-16 sm:pt-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-14">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <p className="reveal text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
                Voice-first health intelligence
              </p>
              <h1 className="reveal stagger-1 font-[var(--font-fraunces)] text-[clamp(2.6rem,4vw,4.4rem)] leading-[1.05]">
                Your health,{' '}
                <span className="text-gradient">remembered</span>
                {' '}— by voice.
              </h1>
              <p className="reveal stagger-2 max-w-xl text-lg text-[rgba(13,27,42,0.74)]">
                Speak naturally about your doctor visit. Our intelligence captures every detail,
                creates clear summaries, and shares them with the people who care — securely.
              </p>
              <div className="reveal stagger-3 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="rounded-full bg-[var(--ink)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow)]"
                >
                  Get Early Access
                </Link>
                <Link
                  href="/how-it-works"
                  className="rounded-full border border-[rgba(13,27,42,0.2)] px-6 py-3 text-sm font-semibold text-[var(--ink)]"
                >
                  See How It Works
                </Link>
              </div>
              <div className="reveal stagger-4 grid grid-cols-3 gap-6 pt-6 text-sm">
                <div>
                  <p className="font-[var(--font-fraunces)] text-2xl">2 min</p>
                  <p className="text-[rgba(13,27,42,0.7)]">to log a visit</p>
                </div>
                <div>
                  <p className="font-[var(--font-fraunces)] text-2xl">60 min</p>
                  <p className="text-[rgba(13,27,42,0.7)]">max visit length</p>
                </div>
                <div>
                  <p className="font-[var(--font-fraunces)] text-2xl">1 tap</p>
                  <p className="text-[rgba(13,27,42,0.7)]">to share</p>
                </div>
              </div>
            </div>

            {/* Glass card mockup */}
            <div className="relative">
              <div className="glass-card reveal rounded-[32px] p-6">
                <div className="flex items-center justify-between text-sm font-semibold text-[rgba(13,27,42,0.6)]">
                  <span>Visit Summary</span>
                  <span>Today</span>
                </div>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl bg-white/70 p-4 shadow-sm">
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--teal-dark)]">
                      Key updates
                    </p>
                    <p className="mt-2 text-sm">
                      Blood pressure stable, medication adjusted, follow-up in
                      30 days.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-dashed border-[rgba(13,27,42,0.2)] p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-[rgba(13,27,42,0.6)]">
                      Next Steps
                    </p>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li>&bull; Start evening dose</li>
                      <li>&bull; Log daily glucose</li>
                      <li>&bull; Share summary with daughter</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-6 rounded-2xl bg-[var(--sky)]/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[rgba(13,27,42,0.6)]">
                    Voice capture
                  </p>
                  <div className="mt-3 h-12 rounded-full bg-white/80 px-4 py-2">
                    <div className="pulse-wave waveform h-full w-full rounded-full" />
                  </div>
                </div>
              </div>
              <div className="absolute -right-8 -top-8 hidden h-28 w-28 rounded-full bg-[var(--warm)]/50 blur-2xl lg:block" />
            </div>
          </div>
        </div>
      </section>

      {/* Sharing flow SVG */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 items-center text-center">
            <p className="reveal text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
              How sharing works
            </p>
            <h2 className="reveal stagger-1 font-[var(--font-fraunces)] text-4xl leading-tight md:text-5xl">
              From your voice to your care circle.
            </h2>
            <p className="reveal stagger-2 max-w-2xl text-lg text-[rgba(13,27,42,0.6)]">
              Every visit summary is encrypted end-to-end. You control exactly who sees what.
            </p>
          </div>
          <div className="reveal stagger-1 mx-auto mt-12 max-w-5xl">
            <div className="glass-card rounded-[32px] p-8">
              <img src={illustrations.familySharing} alt="How sharing works" className="w-full object-contain" />
            </div>
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/technology"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--teal-dark)] transition-colors hover:text-[var(--teal)]"
            >
              Explore our technology stack
              <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10m-4-4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div className="reveal rounded-[28px] bg-white/80 p-8 shadow-sm">
            <h2 className="font-[var(--font-fraunces)] text-3xl">
              Visits are overwhelming.
            </h2>
            <p className="mt-3 text-[rgba(13,27,42,0.72)]">
              Notes get lost, instructions blur together, and families worry
              they missed the real story.
            </p>
          </div>
          <div className="reveal stagger-1 rounded-[28px] bg-[var(--ink)] p-8 text-white shadow-[var(--shadow)]">
            <h2 className="font-[var(--font-fraunces)] text-3xl">
              MyMedVisit turns speech into clarity.
            </h2>
            <p className="mt-3 text-white/80">
              Speak once. We capture the visit, summarize it, and organize
              everything for the people you trust.
            </p>
          </div>
        </div>
      </section>

      {/* Three steps */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
              How it works
            </p>
            <h2 className="font-[var(--font-fraunces)] text-4xl">
              Three calm steps.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`reveal rounded-[24px] bg-white/90 p-6 text-center shadow-sm ${
                  index === 1 ? 'stagger-1' : index === 2 ? 'stagger-2' : ''
                }`}
              >
                <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-2xl" style={{ background: 'rgba(10,126,164,0.08)' }}>
                  {step.icon}
                </div>
                <p className="mt-5 font-[var(--font-fraunces)] text-xs text-[rgba(13,27,42,0.25)]">0{index + 1}</p>
                <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm text-[rgba(13,27,42,0.7)]">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--teal-dark)] transition-colors hover:text-[var(--teal)]"
            >
              See the full walkthrough
              <svg className="h-4 w-4" fill="none" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2">
                <path d="M3 8h10m-4-4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Two voice pipelines */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="reveal">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
              Two voice pipelines
            </p>
            <h2 className="mt-3 font-[var(--font-fraunces)] text-4xl">
              Built for quick moments and full visits.
            </h2>
            <p className="mt-4 text-[rgba(13,27,42,0.7)]">
              Capture a 5-second metric or summarize a 30-minute visit. Each pipeline
              is optimized for clarity and comfort.
            </p>
          </div>
          <div className="grid gap-5">
            <div className="reveal rounded-[24px] border border-[rgba(13,27,42,0.12)] bg-white/80 p-6">
              <h3 className="text-lg font-semibold">Quick Commands</h3>
              <p className="mt-2 text-sm text-[rgba(13,27,42,0.7)]">
                1–10 seconds, instant logging.
              </p>
              <div className="mt-4 space-y-2 rounded-2xl bg-[var(--mist)]/70 p-4 text-sm">
                <p>&ldquo;Blood pressure 120 over 80.&rdquo;</p>
                <p>&ldquo;Log temperature 98.6.&rdquo;</p>
                <p>&ldquo;Medication taken at 8 PM.&rdquo;</p>
              </div>
            </div>
            <div className="reveal stagger-1 rounded-[24px] border border-[rgba(13,27,42,0.12)] bg-white/80 p-6">
              <h3 className="text-lg font-semibold">Visit Summarization</h3>
              <p className="mt-2 text-sm text-[rgba(13,27,42,0.7)]">
                10–60 minutes, structured summary.
              </p>
              <div className="mt-4 space-y-2 rounded-2xl bg-[var(--mist)]/70 p-4 text-sm">
                <p>&ldquo;Cardiology visit, review of lab results.&rdquo;</p>
                <p>&ldquo;New plan: reduce sodium and monitor weight.&rdquo;</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
              Features
            </p>
            <h2 className="font-[var(--font-fraunces)] text-4xl">
              Everything seniors and families need.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`reveal rounded-[22px] bg-white/85 p-6 shadow-sm ${
                  index % 3 === 1 ? 'stagger-1' : index % 3 === 2 ? 'stagger-2' : ''
                }`}
              >
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-3 text-sm text-[rgba(13,27,42,0.7)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature teaser cards */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="reveal rounded-[28px] bg-[var(--teal)]/8 p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--teal-dark)]">Intelligence</p>
              <h3 className="mt-3 font-[var(--font-fraunces)] text-2xl">Cutting-edge AI that understands medicine.</h3>
              <p className="mt-4 text-sm leading-relaxed text-[rgba(13,27,42,0.55)]">
                Proprietary voice recognition, clinical NLP, and specialized medical knowledge bases
                work together to capture what matters.
              </p>
              <Link
                href="/technology"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--teal-dark)] hover:text-[var(--teal)]"
              >
                Our technology
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2">
                  <path d="M2 7h10m-4-4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
            <div className="reveal stagger-1 rounded-[28px] bg-white/85 p-10 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--teal-dark)]">Privacy</p>
              <h3 className="mt-3 font-[var(--font-fraunces)] text-2xl">End-to-end encrypted. Always.</h3>
              <p className="mt-4 text-sm leading-relaxed text-[rgba(13,27,42,0.55)]">
                Your health data is encrypted on-device before it ever leaves your phone.
                We can&apos;t read it. No one can — except you and the people you choose.
              </p>
            </div>
            <div className="reveal stagger-2 rounded-[28px] bg-[var(--ink)] p-10 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40">Family</p>
              <h3 className="mt-3 font-[var(--font-fraunces)] text-2xl">Built for every care circle.</h3>
              <p className="mt-4 text-sm leading-relaxed text-white/55">
                Seniors, adult children, caregivers, and providers — everyone gets the view they need,
                nothing more.
              </p>
              <Link
                href="/about"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white/60 hover:text-white/80"
              >
                Our story
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 14 14" stroke="currentColor" strokeWidth="2">
                  <path d="M2 7h10m-4-4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy & Accessibility */}
      <section className="px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-2">
          <div className="reveal rounded-[28px] bg-white/85 p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
              Privacy & trust
            </p>
            <h2 className="mt-3 font-[var(--font-fraunces)] text-3xl">
              Privacy-first by design.
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-[rgba(13,27,42,0.7)]">
              <li>&bull; Automatic anonymization before cloud processing.</li>
              <li>&bull; Consent checks before sharing or analysis.</li>
              <li>&bull; You control who receives each update.</li>
            </ul>
          </div>
          <div className="reveal stagger-1 rounded-[28px] bg-[var(--teal)]/10 p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
              Designed for clarity
            </p>
            <h2 className="mt-3 font-[var(--font-fraunces)] text-3xl">
              Senior-friendly by default.
            </h2>
            <p className="mt-4 text-sm text-[rgba(13,27,42,0.7)]">
              Large text, calm contrast, and voice-first workflows keep the
              experience simple without sacrificing depth.
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
              Use cases
            </p>
            <h2 className="font-[var(--font-fraunces)] text-4xl">
              Built for every care circle.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {useCases.map((useCase, index) => (
              <div
                key={useCase.title}
                className={`reveal rounded-[22px] bg-white/90 p-6 shadow-sm ${
                  index === 1 ? 'stagger-1' : index === 2 ? 'stagger-2' : ''
                }`}
              >
                <h3 className="text-lg font-semibold">{useCase.title}</h3>
                <p className="mt-3 text-sm text-[rgba(13,27,42,0.7)]">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
              FAQ
            </p>
            <h2 className="font-[var(--font-fraunces)] text-4xl">
              Quick answers.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {faqs.map((faq, index) => (
              <div
                key={faq.title}
                className={`reveal rounded-[20px] border border-[rgba(13,27,42,0.1)] bg-white/85 p-6 ${
                  index % 2 === 1 ? 'stagger-1' : ''
                }`}
              >
                <h3 className="text-lg font-semibold">{faq.title}</h3>
                <p className="mt-3 text-sm text-[rgba(13,27,42,0.7)]">
                  {faq.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 pt-10">
        <div className="mx-auto max-w-6xl">
          <div className="glass-card reveal rounded-[32px] p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
                  Ready to try
                </p>
                <h2 className="mt-3 font-[var(--font-fraunces)] text-4xl">
                  Make healthcare easier to remember.
                </h2>
                <p className="mt-3 text-sm text-[rgba(13,27,42,0.7)]">
                  Join early access and bring clarity to every appointment.
                </p>
              </div>
              <div className="flex w-full max-w-sm flex-col gap-3">
                <Link
                  href="/contact"
                  className="rounded-full bg-[var(--teal)] px-6 py-3 text-center text-sm font-semibold text-white shadow-[var(--shadow)]"
                >
                  Request Early Access
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
