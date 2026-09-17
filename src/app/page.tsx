import type { Metadata } from 'next'
import Link from 'next/link'
import { illustrations } from '@/assets/illustrations'
import FAQProviderConsent from '@/components/FAQProviderConsent'
import HeroSection from '@/components/HeroSection'
import SchemaMarkup from '@/components/SchemaMarkup'
import { SpecialtyWorkflows } from '@/components/SpecialtyWorkflows'

export const metadata: Metadata = {
  title: 'MyMedVisit — Longitudinal clinical context',
  description:
    'Patient and caregiver observations organized into longitudinal context to support appropriate care-team workflows.',
  openGraph: {
    title: 'MyMedVisit — Longitudinal clinical context',
    description:
      'Patient and caregiver observations organized into longitudinal context to support appropriate care-team workflows.',
    type: 'website',
    url: 'https://mymedvisit.app',
  },
}

const workflow = [
  {
    name: 'Listen',
    description:
      'Capture patient and caregiver observations naturally by voice.',
  },
  {
    name: 'Understand',
    description:
      'Organize observations into a longitudinal picture of symptoms, function, and change.',
  },
  {
    name: 'Prioritize',
    description:
      'Apply specialty-specific clinical logic to identify information that may require attention.',
  },
  {
    name: 'Act',
    description:
      'Support escalation, review, and documented care-team action through the appropriate workflow.',
  },
]

const faqs = [
  {
    question:
      'Does MyMedVisit diagnose conditions or replace clinical judgment?',
    answer:
      'No. MyMedVisit is designed to organize patient and caregiver observations and support appropriate review. It does not replace advice, diagnosis, or decisions from a qualified healthcare professional.',
  },
  {
    question:
      'What should I do if I have a dangerous or rapidly worsening symptom?',
    answer:
      'Do not wait for an app to identify or respond to an urgent problem. If symptoms are severe or rapidly worsening, contact emergency services or a qualified healthcare professional. MyMedVisit is intended to support information organization and care-team review; it does not diagnose or guarantee detection of every urgent concern.',
  },
  {
    question: 'Can a caregiver contribute observations?',
    answer:
      'Patient and caregiver observations can offer different or complementary perspectives. Any sharing of information with another person should be intentional and permission-based; family members do not automatically receive clinical information.',
  },
  {
    question: 'How is my information shared?',
    answer:
      'Sharing should happen only through options you choose and authorize. Review the available controls before sharing information, and share only with people you intend to include.',
  },
]

export default function Home() {
  return (
    <>
      <SchemaMarkup />
      <main className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 hero-sheen" />

        <HeroSection />

        <section
          aria-labelledby="shared-workflow-title"
          className="bg-gradient-to-b from-transparent to-white/50 px-6 py-20"
        >
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
                A shared workflow
              </p>
              <h2
                className="mt-4 font-[var(--font-fraunces)] text-4xl leading-tight md:text-5xl"
                id="shared-workflow-title"
              >
                From everyday observations to care-team action.
              </h2>
            </div>

            <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {workflow.map((step, index) => (
                <li className="glass-card rounded-[24px] p-6" key={step.name}>
                  <span className="text-xs font-semibold tabular-nums text-[var(--teal-dark)]">
                    0{index + 1}
                  </span>
                  <h3 className="mt-4 font-[var(--font-fraunces)] text-2xl">
                    {step.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[rgba(13,27,42,0.72)]">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
            <p className="mt-5 max-w-3xl text-sm leading-relaxed text-[rgba(13,27,42,0.62)]">
              Information is organized to support appropriate human review—not
              to diagnose, guarantee detection, or replace clinical judgment.
            </p>
          </div>
        </section>

        <section aria-labelledby="dyadic-title" className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
                The dyadic model
              </p>
              <h2
                className="mt-4 font-[var(--font-fraunces)] text-4xl leading-tight md:text-5xl"
                id="dyadic-title"
              >
                Two perspectives. One longitudinal clinical picture.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-[rgba(13,27,42,0.68)]">
                Patients and caregivers may notice different or complementary
                changes between visits. Bringing those observations into context
                can help make the timeline more useful for care-team review.
              </p>
            </div>

            <div className="mt-10 grid items-center gap-5 lg:grid-cols-[1fr_auto_1.1fr]">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <article className="rounded-[22px] border border-[rgba(10,126,164,0.16)] bg-white/85 p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal-dark)]">
                    Observation stream 01
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">Patient voice</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[rgba(13,27,42,0.68)]">
                    How symptoms, function, and daily life feel between visits.
                  </p>
                </article>
                <article className="rounded-[22px] border border-[rgba(10,126,164,0.16)] bg-white/85 p-6 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--teal-dark)]">
                    Observation stream 02
                  </p>
                  <h3 className="mt-2 text-xl font-semibold">
                    Caregiver perspective
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[rgba(13,27,42,0.68)]">
                    Changes another person may notice from a different point of
                    view.
                  </p>
                </article>
              </div>

              <div
                aria-hidden="true"
                className="hidden text-3xl text-[var(--teal)] lg:block"
              >
                →
              </div>

              <div className="relative overflow-hidden rounded-[28px] bg-[var(--ink)] p-7 text-white shadow-[var(--shadow)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  Shared longitudinal picture
                </p>
                <h3 className="mt-2 font-[var(--font-fraunces)] text-2xl">
                  Observations, connected over time
                </h3>
                <div className="mt-7 space-y-4 border-l border-cyan-100/30 pl-5">
                  {[
                    'Patient and caregiver perspectives',
                    'Symptoms, function, and change',
                    'Context for care-team review',
                  ].map((item, index) => (
                    <div className="relative" key={item}>
                      <span
                        aria-hidden="true"
                        className="absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full bg-emerald-300 ring-4 ring-[var(--ink)]"
                      />
                      <p className="text-sm font-medium text-white/90">
                        {item}
                      </p>
                      <span className="sr-only">
                        Timeline point {index + 1}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-6 border-t border-white/15 pt-4 text-sm leading-relaxed text-white/70">
                  Sharing remains intentional and permission-based. Family
                  members do not automatically receive clinical information.
                </p>
              </div>
            </div>
          </div>
        </section>

        <SpecialtyWorkflows />

        <section aria-labelledby="privacy-title" className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div className="flex flex-col gap-6">
                <div className="rounded-[28px] bg-white/85 p-8 shadow-sm">
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
                    Privacy & user control
                  </p>
                  <h2
                    className="mt-3 font-[var(--font-fraunces)] text-3xl"
                    id="privacy-title"
                  >
                    Your observations. Your sharing decisions.
                  </h2>
                  <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[rgba(13,27,42,0.7)]">
                    <li>
                      <span aria-hidden="true">• </span>Choose whether to share
                      information and who you intend to include.
                    </li>
                    <li>
                      <span aria-hidden="true">• </span>Family and caregivers do
                      not automatically receive clinical information.
                    </li>
                    <li>
                      <span aria-hidden="true">• </span>Review available sharing
                      controls before sharing.
                    </li>
                  </ul>
                </div>
                <div className="rounded-[28px] bg-[var(--teal)]/10 p-8">
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
                    Designed for clarity
                  </p>
                  <h2 className="mt-3 font-[var(--font-fraunces)] text-3xl">
                    Accessible by design.
                  </h2>
                  <p className="mt-4 text-sm leading-relaxed text-[rgba(13,27,42,0.7)]">
                    Clear language, readable type, calm contrast, and a
                    voice-first approach support a straightforward experience.
                  </p>
                </div>
              </div>
              <div>
                <div className="glass-card flex min-h-[300px] items-center justify-center rounded-[28px] p-8">
                  <img
                    src={illustrations.privacyEncryption}
                    alt="Illustration representing privacy and user control"
                    className="w-full max-w-[280px] object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="faq-title" className="px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col gap-4">
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
                FAQ
              </p>
              <h2
                className="font-[var(--font-fraunces)] text-4xl"
                id="faq-title"
              >
                Clear answers, thoughtful boundaries.
              </h2>
            </div>
            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              {faqs.map((faq) => (
                <article
                  className="rounded-[20px] border border-[rgba(13,27,42,0.1)] bg-white/85 p-6"
                  key={faq.question}
                >
                  <h3 className="text-lg font-semibold">{faq.question}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[rgba(13,27,42,0.7)]">
                    {faq.answer}
                  </p>
                </article>
              ))}
            </div>
            <FAQProviderConsent />
          </div>
        </section>

        <section aria-labelledby="final-cta-title" className="px-6 pb-24 pt-10">
          <div className="mx-auto max-w-6xl">
            <div className="glass-card rounded-[32px] p-8 sm:p-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[var(--teal-dark)]">
                    Make the time between visits count
                  </p>
                  <h2
                    className="mt-3 max-w-3xl font-[var(--font-fraunces)] text-4xl"
                    id="final-cta-title"
                  >
                    A clearer picture starts with what you notice.
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[rgba(13,27,42,0.7)]">
                    Explore the platform or get in touch to learn more about the
                    MyMedVisit approach.
                  </p>
                </div>
                <div className="flex w-full max-w-sm flex-col gap-3">
                  <Link
                    href="/contact"
                    className="rounded-full bg-[var(--teal)] px-6 py-3 text-center text-sm font-semibold text-white shadow-[var(--shadow)] transition-colors hover:bg-[var(--teal-dark)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--teal-dark)]"
                  >
                    Request Early Access
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
