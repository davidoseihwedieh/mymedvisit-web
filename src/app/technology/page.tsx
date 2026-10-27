import Link from 'next/link'
import { SectionHeader } from '@/components/SectionHeader'
import { illustrations } from '@/assets/illustrations'

const aiCapabilities = [
  {
    title: 'Voice and text capture',
    description: 'Patients and caregivers describe what changed in their own words, by voice or text. Spoken language is detected automatically, and each report is time-stamped and attributed to the person who gave it.',
  },
  {
    title: 'Adaptive clarification',
    description: 'The platform identifies what is missing from a report — onset, severity, trajectory, effect on daily function — and asks a short, targeted follow-up instead of a fixed questionnaire.',
  },
  {
    title: 'Source-linked evidence',
    description: 'Patient statements, caregiver observations, and device readings stay separate and traceable. Disagreements are surfaced rather than averaged, and the system can say “not enough information” rather than force a grade.',
  },
  {
    title: 'Tiered safety screening',
    description: 'Reports are screened against program-specific, clinician-approved rules. Screening never lowers an urgent result, and anyone reporting a severe symptom is directed to emergency care rather than asked to wait for review.',
  },
]

const integrations = [
  {
    title: 'Phone and wearable data',
    description: 'With permission, the app reads data from Apple Health on iPhone and Health Connect on Android, compared against each person’s own baseline.',
    metrics: ['Heart Rate', 'Blood Pressure', 'Oxygen Saturation', 'Steps', 'Sleep', 'Weight', 'Glucose'],
  },
  {
    title: 'Cellular-connected devices',
    description: 'For participants without a smartphone or home internet, readings can come from cellular-connected devices that transmit automatically with nothing more than a power outlet.',
    metrics: ['Blood Pressure Cuffs', 'Scales', 'Glucose Meters', 'No Wi-Fi Required'],
  },
  {
    title: 'Electronic health record',
    description: 'SMART on FHIR connectivity to Epic brings in conditions, medications, vitals, and care-team context with provenance. Standalone clinician tools serve practices on other systems.',
    metrics: ['SMART on FHIR', 'Epic', 'Provenance'],
  },
  {
    title: 'Research data capture',
    description: 'Structured outputs for research protocols, including REDCap workflows, version-locked study configurations, and audit trails suitable for prospective evaluation.',
    metrics: ['REDCap', 'Version Locking', 'Audit Trail'],
  },
]

const securityLayers = [
  {
    title: 'Encryption',
    description: 'Health data is encrypted in transit and at rest, and sensitive information stored on the device is kept in encrypted storage.',
  },
  {
    title: 'Role-based access',
    description: 'Clinical queues and records are limited to authorized clinical roles within each participating program. Patients and caregivers see only what they are permitted to see.',
  },
  {
    title: 'Permission-based sharing',
    description: 'Caregiver access is invited, role-based, and revocable. Family members never receive clinical information automatically.',
  },
  {
    title: 'Audit trail',
    description: 'Access, sharing, and clinical actions are logged, so every escalation can be traced from receipt to documented outcome.',
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
              One platform for <span className="text-gradient">between-visit information</span>.
            </h1>
            <p className="reveal stagger-2 mt-6 text-lg leading-relaxed text-[rgba(13,27,42,0.6)]">
              A shared foundation for capture, clarification, safety screening, and care-team review.
              Each clinical program adds its own questions, thresholds, and escalation paths.
              Clinicians make every clinical decision.
            </p>
          </div>
        </div>
      </section>

      {/* AI Pipeline */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            tag="The platform"
            title="From an incomplete report to a reviewable one."
            description="A first report such as “I feel worse” rarely says enough to act on. The platform captures it, asks for what is missing, keeps every fact tied to its source, and places a structured report in front of the care team."
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
            tag="Connected data"
            title="Reports, devices, and the record in one timeline."
            description="What patients and caregivers report is read alongside device readings and health-record context, so a change can be seen in full rather than one stream at a time. MyMedVisit is user-activated and does not listen continuously."
            centered
          />
          <div className="reveal stagger-1 mx-auto mt-12 max-w-5xl">
            <div className="glass-card rounded-[32px] p-6">
              <img src={illustrations.passiveDevices} alt="Connected data sources" className="w-full object-contain" />
            </div>
          </div>
        </div>
      </section>

      {/* Health integrations detail */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            tag="Integrations"
            title="Built to fit existing care and research workflows."
            description="Data sources and outputs are configured per program, so a remote-monitoring service and a research protocol can run on the same foundation."
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
            tag="Privacy and security"
            title="Protected by design, governed by the program."
            description="Each deployment runs under the participating organization’s consent, privacy, and clinical governance, with access limited to the people responsible for care."
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
            title="Four safeguards."
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
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40">Human in the loop</p>
              <h3 className="mt-4 font-[var(--font-fraunces)] text-3xl text-[var(--sky)]">Clinicians decide.</h3>
              <p className="mt-5 leading-relaxed text-white/50">
                MyMedVisit organizes information for review; it does not diagnose, prescribe, or change care.
                Candidate signals enter a ring-fenced escalation queue where each item is claimed by a named
                clinician, worked, and closed only with a documented outcome. Nothing is silently dropped,
                and duplicate submissions cannot create duplicate alerts.
              </p>
            </div>
            <div className="reveal stagger-1 rounded-[28px] p-10" style={{ background: 'linear-gradient(135deg, rgba(10,126,164,0.08), rgba(224,244,246,0.4))' }}>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--teal-dark)]">Built for evaluation</p>
              <h3 className="mt-4 font-[var(--font-fraunces)] text-3xl">Measurable from day one.</h3>
              <p className="mt-5 leading-relaxed text-[rgba(13,27,42,0.55)]">
                Clinical rules, models, and settings can be version-locked for a study. Every report keeps its
                timestamps and sources, so programs can measure what matters: how complete reports are, how
                quickly the care team learns of a change, alert burden, and the effort asked of patients,
                caregivers, and staff.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 pt-10">
        <div className="mx-auto max-w-4xl">
          <div className="glass-card reveal rounded-[32px] p-12 text-center">
            <h2 className="font-[var(--font-fraunces)] text-4xl">See the platform with your workflow in mind.</h2>
            <p className="mx-auto mt-4 max-w-lg text-[rgba(13,27,42,0.5)]">
              We offer live demonstrations with synthetic participants for clinical programs, investigators, and health systems.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="rounded-full bg-[var(--ink)] px-8 py-4 text-sm font-semibold text-white shadow-[var(--shadow)]"
              >
                Request a Demonstration
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
