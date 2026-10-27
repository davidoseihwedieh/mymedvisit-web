import Link from 'next/link'
import { SectionHeader } from '@/components/SectionHeader'

const values = [
  {
    title: 'Clinicians decide',
    description: 'MyMedVisit organizes information for review. It does not diagnose, prescribe, or change care, and every escalation ends with a documented decision by a qualified person.',
  },
  {
    title: 'Two voices, kept distinct',
    description: 'Patients and caregivers often notice different parts of the same change. We keep each account separate and attributed rather than merging them into one answer.',
  },
  {
    title: 'Evidence before claims',
    description: 'Platform readiness is not clinical validation. We test against strong comparators, publish what we measure, and say plainly what has not yet been shown.',
  },
  {
    title: 'Access for everyone',
    description: 'Voice-first reporting, caregiver participation, multilingual support, and devices that work without a smartphone or home internet, so reporting does not depend on digital confidence.',
  },
]

const milestones = [
  {
    phase: 'Platform',
    title: 'A shared foundation',
    description: 'An iOS and Android beta with voice and text reporting, patient–caregiver workflows, phone and wearable data, SMART on FHIR connectivity to Epic, REDCap integration, tiered safety screening, and a clinician escalation queue.',
  },
  {
    phase: 'Testing',
    title: 'Formative evaluation',
    description: 'Formative home testing and structured benchmark evaluations of triage and clarification. These establish technical function, not clinical effectiveness.',
  },
  {
    phase: 'Programs',
    title: 'Clinical applications in preparation',
    description: 'Research and service programs in genitourinary oncology, breast oncology, recovery after COPD exacerbations, and rural remote monitoring for chronic disease and perinatal care.',
  },
  {
    phase: 'Next',
    title: 'Prospective evaluation',
    description: 'Protocol-driven studies that ask whether the platform produces more complete reports and earlier appropriate action than portals and fixed questionnaires, without adding burden for care teams.',
  },
]

export default function About() {
  return (
    <main className="overflow-hidden">
      {/* Hero */}
      <section className="relative px-6 pb-20 pt-16">
        <div className="absolute inset-0 hero-sheen" />
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="reveal text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
              About MyMedVisit
            </p>
            <h1 className="reveal stagger-1 mt-4 font-[var(--font-fraunces)] text-[clamp(2.4rem,4vw,4.2rem)] leading-[1.08]">
              Built by physicians for{' '}
              <span className="text-gradient">the time between visits</span>.
            </h1>
            <p className="reveal stagger-2 mt-6 text-lg leading-relaxed text-[rgba(13,27,42,0.6)]">
              Clinically important change usually happens at home, days before anyone on the care
              team hears about it. We build the tools that close that gap.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="reveal glass-card rounded-[32px] p-12">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">Our mission</p>
              <h2 className="mt-4 font-[var(--font-fraunces)] text-3xl leading-snug md:text-4xl">
                Turn what patients and caregivers notice into information a care team can act on, safely and without adding burden.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="reveal">
              <SectionHeader tag="The problem" title="First reports rarely say enough." />
              <div className="mt-6 space-y-4 leading-relaxed text-[rgba(13,27,42,0.6)]">
                <p>
                  “I feel worse” or “more short of breath” leaves out what a clinician needs to judge
                  urgency: when it started, how severe it is, whether it is getting worse, and what it
                  stops someone from doing. Portals and fixed questionnaires record that a symptom
                  exists, but they cannot ask the next question.
                </p>
                <p>
                  Remote monitoring adds numbers, but numbers alone often become alarms that no one
                  can interpret. Care teams need fewer, better reports, not more data.
                </p>
              </div>
            </div>
            <div className="reveal stagger-1">
              <div className="rounded-[28px] bg-[var(--ink)] p-10 text-white shadow-[var(--shadow)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/40">Our approach</p>
                <h3 className="mt-4 font-[var(--font-fraunces)] text-3xl text-[var(--sky)]">Ask for what is missing.</h3>
                <p className="mt-5 leading-relaxed text-white/55">
                  MyMedVisit captures a report in the person’s own words, reads it alongside device
                  data and the health record, asks a short follow-up for the missing facts, and hands
                  the care team a structured, source-linked report to review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader tag="Our principles" title="What guides everything we build." centered />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {values.map((value, index) => (
              <div
                key={value.title}
                className={`reveal rounded-[24px] bg-white/85 p-8 shadow-sm ${
                  index % 2 === 1 ? 'stagger-1' : ''
                }`}
              >
                <h3 className="text-xl font-semibold">{value.title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-[rgba(13,27,42,0.6)]">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Where we are */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <SectionHeader tag="Where we are" title="From platform to programs." />
          <div className="mt-12 space-y-6">
            {milestones.map((m, index) => (
              <div
                key={m.phase}
                className={`reveal grid gap-6 lg:grid-cols-[180px_1fr] ${index % 2 === 1 ? 'stagger-1' : ''}`}
              >
                <div className="flex lg:justify-end">
                  <span className="inline-block rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--teal-dark)]" style={{ background: 'rgba(10,126,164,0.1)' }}>
                    {m.phase}
                  </span>
                </div>
                <div className="rounded-[24px] border border-[rgba(13,27,42,0.08)] bg-white/80 p-8">
                  <h3 className="text-xl font-semibold">{m.title}</h3>
                  <p className="mt-3 leading-relaxed text-[rgba(13,27,42,0.6)]">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="reveal glass-card rounded-[32px] p-12">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">Leadership</p>
                <h2 className="mt-4 font-[var(--font-fraunces)] text-3xl leading-snug md:text-4xl">
                  David Osei-Hwedieh, MD, PhD
                </h2>
                <p className="mt-2 text-sm font-semibold uppercase tracking-[0.2em] text-[rgba(13,27,42,0.45)]">
                  Founder and Chief Executive Officer
                </p>
              </div>
              <div className="space-y-4 leading-relaxed text-[rgba(13,27,42,0.6)]">
                <p>
                  A physician-scientist who founded MyMedVisit to make the changes patients and
                  caregivers notice between visits visible, and usable, for the clinicians
                  responsible for their care.
                </p>
                <p>
                  MyMedVisit is a trade name of SugarcaneHayes, LLC, based in Randolph, Massachusetts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 pt-10">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="reveal font-[var(--font-fraunces)] text-4xl">Work with us.</h2>
          <p className="reveal stagger-1 mt-4 text-[rgba(13,27,42,0.5)]">
            We partner with clinicians, investigators, health systems, and public health programs
            to configure and evaluate the platform for specific populations.
          </p>
          <div className="reveal stagger-2 mt-8 flex flex-wrap justify-center gap-4">
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
              Explore the Platform
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
