import Link from 'next/link'
import { SectionHeader } from '@/components/SectionHeader'
import { illustrations } from '@/assets/illustrations'

const aiCapabilities = [
  {
    title: 'Medical-Grade Voice Recognition',
    description: 'Trained on millions of hours of clinical dialogue, our system understands medical terminology, accents, and speaking patterns. It works in noisy environments (hospitals, clinics, homes) and adapts to your voice in real time.',
  },
  {
    title: 'Clinical Intelligence Extraction',
    description: 'Automatically extracts structured medical data: diagnoses (ICD-10), medications with RxNorm codes, dosages, procedures, and vital changes. Understands clinical context—distinguishes a side effect discussion from a medication mention.',
  },
  {
    title: 'Evidence-Based Safety Checks',
    description: 'Every medication is cross-referenced against comprehensive drug interaction databases and contraindication libraries. The system alerts you to potential conflicts before they become dangerous.',
  },
  {
    title: 'Pattern Recognition Engine',
    description: 'Correlates health data across multiple sources: glucose monitors, sleep trackers, wearables, and visits. Detects patterns (glucose spikes after medication changes, sleep disruption with new prescriptions) that single devices can\'t reveal.',
  },
]

const integrations = [
  {
    title: 'Apple Health Integration',
    description: 'Seamlessly pull heart rate, blood pressure, step count, respiratory rate, and body measurements from Apple Health. Your wearable data enriches every visit summary with objective biometric context.',
    metrics: ['Heart Rate', 'Blood Pressure', 'Steps', 'Respiratory Rate', 'Body Temperature'],
  },
  {
    title: 'Continuous Glucose Monitoring',
    description: 'Connect compatible CGM devices and smart rings for real-time glucose trend data. Our intelligence correlates glucose patterns with visit notes, medication changes, and meal timing — building a complete metabolic picture.',
    metrics: ['Real-time Glucose', 'Trend Arrows', 'Time in Range', 'A1C Estimation', 'Pattern Detection'],
  },
  {
    title: 'Sleep Pattern Analysis',
    description: 'Import sleep data from wearable rings, watches, and dedicated sleep trackers. Our ambient intelligence analyzes sleep stages, duration, consistency, and disturbances — then correlates them with health events and medication changes.',
    metrics: ['Sleep Stages', 'Duration & Quality', 'Sleep Latency', 'HRV During Sleep', 'Consistency Score'],
  },
  {
    title: 'Wearable Biosensor Network',
    description: 'From blood oxygen saturation to skin temperature, stress indicators to activity patterns — our platform unifies data from an expanding ecosystem of wearable health sensors into your personal health timeline.',
    metrics: ['SpO2 Levels', 'Skin Temperature', 'Stress Index', 'Activity Zones', 'Recovery Score'],
  },
]

const securityLayers = [
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

export default function Technology() {
  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="relative px-6 pb-20 pt-16">
        <div className="absolute inset-0 hero-sheen" />
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="reveal text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
              Our technology
            </p>
            <h1 className="reveal stagger-1 mt-4 font-[var(--font-fraunces)] text-[clamp(2.4rem,4vw,4.2rem)] leading-[1.08]">
              <span className="text-gradient">Medical intelligence</span> you can trust.
            </h1>
            <p className="reveal stagger-2 mt-6 text-lg leading-relaxed text-[rgba(13,27,42,0.6)]">
              Every interaction—from voice capture to pattern detection to safety checks—is powered by
              clinical-grade AI, comprehensive medical databases, and encryption-by-design security.
              No shortcuts. No generic solutions.
            </p>
          </div>
        </div>
      </section>

      {/* AI Pipeline */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            tag="Core Intelligence"
            title="Built specifically for medicine."
            description="Our AI pipeline is purpose-built for clinical accuracy. Every component—voice recognition, data extraction, interaction checking—is optimized for medical terminology and healthcare workflows."
          />
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {aiCapabilities.map((cap, index) => (
              <div
                key={cap.title}
                className={`reveal rounded-[24px] bg-white/85 p-9 shadow-sm ${
                  index % 2 === 1 ? 'stagger-1' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: 'rgba(10,126,164,0.1)' }}>
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--teal)' }}>
                      <circle cx="10" cy="10" r="8" />
                      <path d="M7 10h6M10 7v6" strokeLinecap="round" />
                    </svg>
                  </span>
                  <h3 className="text-lg font-semibold">{cap.title}</h3>
                </div>
                <p className="mt-5 text-sm leading-relaxed text-[rgba(13,27,42,0.55)]">{cap.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ambient intelligence + connected health */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            tag="Ambient clinical intelligence"
            title="Your health data, woven into one living narrative."
            description="Voice is just the beginning. MyMedVisit integrates with the devices and platforms you already wear and use — building a comprehensive health picture that no single data source could provide alone."
            centered
          />
          <div className="reveal stagger-1 mx-auto mt-12 max-w-5xl">
            <div className="glass-card rounded-[32px] p-6">
              <img src={illustrations.passiveDevices} alt="Ambient intelligence" className="w-full object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Health integrations detail */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            tag="Connected health ecosystem"
            title="Every signal matters."
            description="We pull together data from across your health ecosystem to surface insights that individual devices can't."
          />
          <div className="mt-14 grid gap-8 md:grid-cols-2">
            {integrations.map((item, index) => (
              <div
                key={item.title}
                className={`reveal rounded-[24px] bg-white/85 p-9 shadow-sm ${
                  index % 2 === 1 ? 'stagger-1' : ''
                }`}
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-[rgba(13,27,42,0.55)]">{item.description}</p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {item.metrics.map((metric) => (
                    <span
                      key={metric}
                      className="rounded-full px-3 py-1.5 text-xs font-medium text-[var(--teal-dark)]"
                      style={{ background: 'rgba(10,126,164,0.08)' }}
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Noise suppression callout */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="reveal glass-card rounded-[32px] p-12">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
                  Advanced audio processing
                </p>
                <h2 className="mt-4 font-[var(--font-fraunces)] text-3xl leading-snug md:text-4xl">
                  Crystal clear in any environment.
                </h2>
                <p className="mt-5 leading-relaxed text-[rgba(13,27,42,0.55)]">
                  Our proprietary noise reduction pipeline employs deep neural networks trained
                  specifically on clinical environments — hospital rooms, waiting areas, home settings.
                  Background conversations, medical equipment beeps, and ambient noise are intelligently
                  separated from the speech that matters.
                </p>
              </div>
              <div className="space-y-5">
                {[
                  { label: 'Voice isolation accuracy', value: '97.3%', bar: 97 },
                  { label: 'Background noise reduction', value: '42 dB', bar: 88 },
                  { label: 'Medical term recognition', value: '99.1%', bar: 99 },
                  { label: 'Multi-speaker separation', value: '94.8%', bar: 95 },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[rgba(13,27,42,0.55)]">{stat.label}</span>
                      <span className="font-[var(--font-fraunces)] font-semibold text-[var(--teal-dark)]">{stat.value}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full" style={{ background: 'rgba(10,126,164,0.1)' }}>
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${stat.bar}%`, background: 'linear-gradient(90deg, var(--teal-dark), var(--teal))' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* End-to-end encryption */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            tag="End-to-end encryption"
            title="Your data is yours. Period."
            description="Every byte of health data is encrypted before it leaves your device. Our architecture ensures that even we cannot access your information."
            centered
          />
          <div className="reveal stagger-1 mx-auto mt-12 max-w-5xl">
            <div className="glass-card rounded-[32px] p-6">
              <img src={illustrations.privacyEncryption} alt="Privacy encryption" className="w-full object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Security layers */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            tag="Security architecture"
            title="Four layers of protection."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {securityLayers.map((layer, index) => (
              <div
                key={layer.title}
                className={`reveal rounded-[24px] border border-[rgba(13,27,42,0.08)] bg-white/80 p-8 ${
                  index % 2 === 1 ? 'stagger-1' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-[var(--teal-dark)]" style={{ background: 'rgba(10,126,164,0.1)' }}>
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold">{layer.title}</h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-[rgba(13,27,42,0.55)]">{layer.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personalized responses callout */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="reveal rounded-[28px] bg-[var(--ink)] p-10 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40">Personalized intelligence</p>
              <h3 className="mt-4 font-[var(--font-fraunces)] text-3xl text-[var(--sky)]">Responses tailored to you.</h3>
              <p className="mt-5 leading-relaxed text-white/50">
                Our specialized medical language models don&apos;t just summarize — they contextualize.
                By understanding your medication history, conditions, and health trends, the system
                provides personalized guidance that grows more accurate over time. Combined with
                evidence-based pharmacological databases, it surfaces interactions, contraindications,
                and follow-up recommendations specific to your health profile.
              </p>
            </div>
            <div className="reveal stagger-1 rounded-[28px] p-10" style={{ background: 'linear-gradient(135deg, rgba(10,126,164,0.08), rgba(224,244,246,0.4))' }}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--teal-dark)]">Evidence-based alerts</p>
              <h3 className="mt-4 font-[var(--font-fraunces)] text-3xl">Proactive health guidance.</h3>
              <p className="mt-5 leading-relaxed text-[rgba(13,27,42,0.55)]">
                By combining visit summaries with continuous health data from Apple Health, glucose monitors,
                and sleep trackers, our intelligence can detect patterns and generate evidence-based alerts.
                A glucose spike after a medication change. A sleep disruption correlating with a new prescription.
                The system connects the dots so you and your care team can act early.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 pt-10">
        <div className="mx-auto max-w-4xl">
          <div className="glass-card reveal rounded-[32px] p-12 text-center">
            <h2 className="font-[var(--font-fraunces)] text-4xl">Experience the intelligence firsthand.</h2>
            <p className="mx-auto mt-4 max-w-lg text-[rgba(13,27,42,0.5)]">
              Join early access and see what happens when advanced AI meets personal health care.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="rounded-full bg-[var(--ink)] px-8 py-4 text-sm font-semibold text-white shadow-[var(--shadow)]"
              >
                Get Early Access
              </Link>
              <Link
                href="/how-it-works"
                className="rounded-full border border-[rgba(13,27,42,0.15)] px-8 py-4 text-sm font-semibold text-[var(--ink)]"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
