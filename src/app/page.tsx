import Link from 'next/link'
import { illustrations } from '@/assets/illustrations'

const steps = [
  {
    title: 'Record your doctor visit',
    description: 'Capture the conversation naturally. Open the app and tap record—no need to take notes. Our system understands medical terminology and captures everything discussed, even in noisy clinics.',
    icon: (
      <img src={illustrations.heroVoiceCapture} alt="Record your doctor visit" className="h-[210px] w-[210px] object-contain" />
    ),
  },
  {
    title: 'Get a clinical summary',
    description: 'Structured note focusing on what matters. Diagnoses, medications, dosages, and recommendations—clearly organized and easy to reference. No small talk, no fluff.',
    icon: (
      <img src={illustrations.aiProcessing} alt="Get a clinical summary" className="h-[210px] w-[210px] object-contain" />
    ),
  },
  {
    title: 'Query your note with AI',
    description: 'Understand the medical reasoning. Ask questions like "Why did my doctor recommend this medication?" and get clear answers grounded in medical evidence and your specific situation.',
    icon: (
      <img src={illustrations.healthJournal} alt="Query your note with AI" className="h-[210px] w-[210px] object-contain" />
    ),
  },
  {
    title: 'Log symptoms, share with family',
    description: 'Better health insights through data. Log how you feel daily—symptoms, energy, concerns. Share visit notes with family. Get AI alerts for concerning symptom combinations.',
    icon: (
      <img src={illustrations.familySharing} alt="Log symptoms, share with family" className="h-[210px] w-[210px] object-contain" />
    ),
  },
]

const features = [
  {
    title: 'Clinical Voice Recognition',
    description: 'Trained on actual doctor-patient conversations, our system understands medical terminology, regional accents, and clinical shorthand. Works perfectly in noisy environments—hospitals, clinics, even home settings.',
  },
  {
    title: 'Clinical Note Generation',
    description: 'Transforms your recording into a clean, structured clinical note. Automatically extracts diagnoses, medications, dosages, and recommendations. Filters out pleasantries and focuses only on clinically relevant information.',
  },
  {
    title: 'Medical AI Reasoning',
    description: 'When you ask your clinical note a question, our AI explains the medical reasoning behind your doctor\'s recommendations. Uses evidence-based medical knowledge to help you understand your diagnosis and treatment plan.',
  },
  {
    title: 'Symptom Intelligence & Red Flag Detection',
    description: 'When you log daily symptoms, the system understands your known diagnoses and flags dangerous combinations. Example: hypertension + sudden vision loss = amaurosis fugax alert. Urges you to seek emergency care.',
  },
  {
    title: 'Apple Health Integration',
    description: 'Seamlessly pull heart rate, blood pressure, step count, respiratory rate, and body measurements from Apple Health. Your wearable data enriches every visit summary with objective biometric context.',
  },
  {
    title: 'Continuous Glucose Monitoring',
    description: 'Connect compatible CGM devices and smart rings for real-time glucose trend data. Our intelligence correlates glucose patterns with visit notes, medication changes, and meal timing — building a complete metabolic picture.',
  },
  {
    title: 'Sleep Pattern Analysis',
    description: 'Import sleep data from wearable rings, watches, and dedicated sleep trackers. Our ambient intelligence analyzes sleep stages, duration, consistency, and disturbances — then correlates them with health events and medication changes.',
  },
  {
    title: 'Wearable Biosensor Network',
    description: 'From blood oxygen saturation to skin temperature, stress indicators to activity patterns — our platform unifies data from an expanding ecosystem of wearable health sensors into your personal health timeline.',
  },
  {
    title: 'On-device encryption',
    description: 'All voice data and health information are encrypted with AES-256 before leaving your device. The encryption keys are generated and stored locally — we never have access to them.',
  },
  {
    title: 'Zero-knowledge processing',
    description: 'Our AI processes anonymized, encrypted data. We cannot read your health information. The system is architectured so that even our own engineers cannot access patient data.',
  },
  {
    title: 'Granular access control',
    description: 'You define exactly who sees what. Share full visit summaries with your daughter, medication changes with your caregiver, and vitals trends with your physician — each with independently revocable access.',
  },
  {
    title: 'Complete audit trail',
    description: 'Every access, share, and modification is logged with cryptographic timestamps. You can see exactly who viewed your data, when, and what they saw. Full transparency, full control.',
  },
]

const useCases = [
  {
    title: 'For patients',
    description: 'Stop forgetting what your doctor said. Never again ask "wait, did they say twice daily or once?" Understand your diagnosis and medications. Make informed choices about your health.',
  },
  {
    title: 'For adult children with aging parents',
    description: 'Your parents live 1,000 miles away. They can\'t tell you exactly what their cardiologist said. MyMedVisit sends you their visit summary. You query it. You understand their diagnosis. You advocate for them even from afar.',
  },
  {
    title: 'For busy caregivers',
    description: 'You care deeply but can\'t make every appointment. Get the clinical notes. Query them for insights. Know when something is truly urgent vs. routine. Be the advocate your loved one needs.',
  },
]

const faqs = [
  {
    title: 'Will MyMedVisit actually understand medical terminology?',
    description: 'Yes. Our system is trained specifically on clinical conversations. It understands medical terminology, extracts relevant diagnoses and medications, and ignores small talk.',
  },
  {
    title: 'Can I really query my visit notes with AI?',
    description: 'Absolutely. Ask questions like "Why did my doctor recommend this medication?" or "What does this diagnosis mean for my daily life?" Our AI uses medical evidence to provide clear, accurate explanations.',
  },
  {
    title: 'What happens if I log a dangerous symptom?',
    description: 'MyMedVisit knows your conditions from your visit summaries. If you log a symptom that\'s concerning given your diagnoses, we alert you to seek medical attention. Example: hypertension + sudden vision loss = emergency alert.',
  },
  {
    title: 'Can my family really understand medical records?',
    description: 'Yes. They get your clinical summaries and can query them just like you do. Our AI explains complex medical information in plain English. No medical degree required to understand your care.',
  },
]

export default function Home() {
  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-0 hero-sheen" />

      {/* Hero */}
      <section className="relative px-6 pb-20 pt-16 sm:pt-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-14">
          <div className="grid items-start gap-10 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="space-y-6">
              <p className="reveal text-sm font-semibold uppercase tracking-[0.5em] text-[var(--teal-dark)]">
                B E Y O N D<span style={{ letterSpacing: '1.5em' }} /> I N F O R M A T I O N —   C O N T E X T
              </p>
              <h1 className="reveal stagger-1 font-[var(--font-fraunces)] text-[clamp(2.6rem,4vw,4.4rem)] leading-[1.05]">
                <span className="text-gradient">Your health data finally makes sense.</span>
              </h1>
              <p className="reveal stagger-2 max-w-xl text-lg text-[rgba(13,27,42,0.74)]">
                Summarize your appointment. Get a searchable clinical note. Ask the note questions to medical insights. Share with family. Log your symptoms to share at your next visit. That's how you take control of your health.
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
              <p className="reveal stagger-4 text-base italic font-medium text-[rgba(13,27,42,0.85)] max-w-xl leading-relaxed">
                Studies show that 40-80% of medical information provided by healthcare practitioners is forgotten immediately. The greater the amount of information presented, the lower the proportion recalled correctly.
              </p>
            </div>

            {/* Glass card mockup with dashboard screenshot */}
            <div className="relative">
              <div className="glass-card reveal rounded-[32px] p-2 flex items-center justify-center overflow-hidden min-h-[500px] lg:min-h-[600px]">
                <img src={illustrations.dashboardScreen} alt="Dashboard screenshot" className="w-full h-full object-contain rounded-xl scale-[0.36]" />
              </div>
              <div className="absolute -right-8 -top-8 hidden h-28 w-28 rounded-full bg-[var(--warm)]/50 blur-2xl lg:block" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - 4 Steps */}
      <section className="px-6 py-20 bg-gradient-to-b from-transparent to-white/50">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 flex flex-col gap-4">
            <p className="reveal text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
              How it works
            </p>
            <h2 className="reveal stagger-1 font-[var(--font-fraunces)] text-4xl leading-tight md:text-5xl">
              Four steps to better health understanding.
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className={`reveal flex flex-col gap-4 ${
                  index === 0
                    ? ''
                    : index === 1
                      ? 'stagger-1'
                      : index === 2
                        ? 'stagger-2'
                        : 'stagger-3'
                }`}
              >
                <div className="relative">
                  <div className="glass-card rounded-[24px] p-6 flex items-center justify-center min-h-[200px]">
                    {step.icon}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute -right-4 top-1/2 h-0.5 w-8 bg-gradient-to-r from-[var(--teal)]/50 to-transparent transform -translate-y-1/2 translate-x-full" />
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold text-[var(--teal)] bg-[var(--teal)]/10 rounded-full w-6 h-6 flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold leading-tight">{step.title}</h3>
                  <p className="text-sm text-[rgba(13,27,42,0.7)] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sharing flow SVG */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-4 items-center text-center">
            <p className="reveal text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
              Secure collaboration
            </p>
            <h2 className="reveal stagger-1 font-[var(--font-fraunces)] text-4xl leading-tight md:text-5xl">
              Intelligence without loss of control.
            </h2>
            <p className="reveal stagger-2 max-w-2xl text-lg text-[rgba(13,27,42,0.6)]">
              Share granular updates with family, caregivers, or providers. Everything encrypted end-to-end.
              You decide who sees what, and can revoke access instantly.
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
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="reveal space-y-4">
            <div className="rounded-[28px] bg-white/80 p-8 shadow-sm">
              <h2 className="font-[var(--font-fraunces)] text-3xl">
                Medical visits are impossible to remember.
              </h2>
              <p className="mt-4 text-[rgba(13,27,42,0.72)]">
                Your doctor explains your diagnosis, changes your medication, suggests lifestyle changes. You nod. You leave. Three days later, you can't recall exactly what they said. Was it take this pill twice daily or once? Why did they say to avoid salt?
              </p>
            </div>
          </div>
          <div className="reveal stagger-1 space-y-4">
            <div className="rounded-[28px] bg-[var(--ink)] p-8 text-white shadow-[var(--shadow)]">
              <h2 className="font-[var(--font-fraunces)] text-3xl">
                MyMedVisit captures the moment.
              </h2>
              <p className="mt-4 text-white/80">
                Record your visit. We generate a clinical note—clear, searchable, permanently saved. Query it weeks later: "Why did my doctor recommend this medication?" Our AI explains the clinical reasoning.
              </p>
            </div>
            <div className="glass-card rounded-[28px] p-6 flex items-center justify-center min-h-[180px]">
              <img src={illustrations.voiceToSummary} alt="Voice to clinical summary transformation" className="w-full max-w-[240px] object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Four steps */}
      {/* Four steps section removed: duplicate hero section deleted */}

      {/* Privacy & Accessibility */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div className="reveal flex flex-col gap-8">
              <div className="rounded-[28px] bg-white/85 p-8 shadow-sm">
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
              <div className="rounded-[28px] bg-[var(--teal)]/10 p-8">
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
            <div className="reveal stagger-1">
              <div className="glass-card rounded-[28px] p-8 flex items-center justify-center min-h-[360px]">
                <img src={illustrations.privacyEncryption} alt="Privacy and encryption" className="w-full max-w-[280px] object-contain" />
              </div>
            </div>
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
                  Ready to understand your health
                </p>
                <h2 className="mt-3 font-[var(--font-fraunces)] text-4xl">
                  Never forget what your doctor said again.
                </h2>
                <p className="mt-3 text-sm text-[rgba(13,27,42,0.7)]">
                  Join early access. Record your next appointment. Get a clinical summary. Query it with questions. Understand your health on your terms.
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
