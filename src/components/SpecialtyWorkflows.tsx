'use client'

import { useRef, useState, type KeyboardEvent } from 'react'

const workflows = [
  {
    id: 'genitourinary-oncology',
    name: 'Genitourinary Oncology',
    description:
      'Toxicity that evolves between infusions of modern combination therapy: neuropathy, skin changes, fatigue, high blood sugar, and immune-related symptoms, reported by the patient and caregiver as they happen.',
    signals: [
      'Treatment-related symptoms',
      'Patient + caregiver observations',
      'Time-stamped onset',
    ],
    example: [
      { label: 'Observation', value: 'Caregiver notes new numbness in feet' },
      { label: 'Clarification', value: 'Onset, severity, and effect on walking asked' },
      { label: 'Care-team workflow', value: 'Structured report ready for review' },
    ],
    accent: 'gu',
  },
  {
    id: 'breast-oncology',
    name: 'Breast Oncology',
    description:
      'Symptom reporting for adults receiving systemic therapy, with patient, caregiver, and clinician priorities kept distinct and every report traceable to its source.',
    signals: [
      'Symptom severity and trajectory',
      'Patient and caregiver priorities',
      'Source-linked reports',
    ],
    example: [
      { label: 'Observation', value: 'Patient describes worsening fatigue' },
      { label: 'Clarification', value: 'Fever, intake, and daily function asked' },
      { label: 'Care-team workflow', value: 'Structured report ready for review' },
    ],
    accent: 'breast',
  },
  {
    id: 'pulmonary',
    name: 'Pulmonary / COPD',
    description:
      'After a COPD exacerbation, changes in oxygen saturation, activity, and sleep against a personal baseline prompt a short, targeted check-in with the patient or caregiver, with local air quality and heat added for context.',
    signals: [
      'Wearable and phone signals',
      'Targeted symptom check-in',
      'Air quality and heat context',
    ],
    example: [
      { label: 'Observation', value: 'Activity and oxygen below personal baseline' },
      { label: 'Clarification', value: 'Rescue inhaler use and sputum change asked' },
      { label: 'Care-team workflow', value: 'Structured report ready for review' },
    ],
    accent: 'pulmonary',
  },
  {
    id: 'rural-rpm',
    name: 'Rural Remote Monitoring',
    description:
      'Remote monitoring for adults with hypertension, heart failure, or diabetes and for pregnancy and postpartum care, using cellular-connected devices that need no smartphone or home internet.',
    signals: [
      'Blood pressure, weight, glucose',
      'Pregnancy and postpartum care',
      'Works without home internet',
    ],
    example: [
      { label: 'Observation', value: 'Postpartum blood pressure reading rises' },
      { label: 'Clarification', value: 'Headache and vision symptoms asked' },
      { label: 'Care-team workflow', value: 'Escalated to the monitoring nurse' },
    ],
    accent: 'rpm',
  },
] as const

function WorkflowMark({
  kind,
}: {
  kind: (typeof workflows)[number]['accent']
}) {
  const paths = {
    gu: (
      <>
        <path d="M12 3v18M3 12h18" />
        <circle cx="12" cy="12" r="8.5" />
      </>
    ),
    breast: (
      <>
        <path d="M12 3c-2.5 0-4 2-4 4 0 3 4 6 4 6s4-3 4-6c0-2-1.5-4-4-4Z" />
        <path d="M10 12.5 6 21M14 12.5l4 8.5" />
      </>
    ),
    pulmonary: (
      <>
        <path d="M12 3v8M12 11c-1 0-2 1-2 2" />
        <path d="M10 6.5C7 6 4 9 4 14c0 3 1 5 3 5s3-2 3-4v-4" />
        <path d="M14 6.5c3-.5 6 2.5 6 7.5 0 3-1 5-3 5s-3-2-3-4v-4" />
      </>
    ),
    rpm: (
      <>
        <path d="M3 11 12 4l9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M7.5 15h2l1.5-3 2 5 1.5-2h2" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.7"
      viewBox="0 0 24 24"
    >
      {paths[kind]}
    </svg>
  )
}

export function SpecialtyWorkflows() {
  const [selectedId, setSelectedId] = useState<string>(workflows[0].id)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const selected =
    workflows.find((workflow) => workflow.id === selectedId) ?? workflows[0]

  function handleTabKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    let nextIndex: number | undefined
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % workflows.length
    if (event.key === 'ArrowLeft')
      nextIndex = (index - 1 + workflows.length) % workflows.length
    if (event.key === 'Home') nextIndex = 0
    if (event.key === 'End') nextIndex = workflows.length - 1
    if (nextIndex === undefined) return

    event.preventDefault()
    const next = workflows[nextIndex]
    setSelectedId(next.id)
    tabRefs.current[nextIndex]?.focus()
  }

  return (
    <section
      aria-labelledby="specialty-workflows-title"
      className="relative isolate overflow-hidden px-5 py-20 sm:px-6 md:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_left,_rgba(10,126,164,0.12),_transparent_55%),linear-gradient(180deg,_rgba(242,247,255,0.82),_rgba(255,255,255,0.42))]"
      />
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--teal-dark)]">
            Four programs, one shared platform
          </p>
          <h2
            className="mt-4 font-[var(--font-fraunces)] text-4xl leading-tight tracking-tight sm:text-5xl"
            id="specialty-workflows-title"
          >
            One platform. Specialty-specific intelligence.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[rgba(13,27,42,0.7)] sm:text-lg">
            Each program brings its own clinical questions and escalation rules
            to the same platform foundation: observations, change over time,
            prioritization, and care-team review. These examples are synthetic
            and do not represent clinical validation, active deployment, or institutional
            partnership.
          </p>
        </div>

        <div
          aria-label="Select a specialty workflow"
          className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          role="tablist"
        >
          {workflows.map((workflow, index) => {
            const isSelected = workflow.id === selected.id
            return (
              <button
                key={workflow.id}
                ref={(element) => {
                  tabRefs.current[index] = element
                }}
                aria-controls="specialty-workflow-panel"
                aria-selected={isSelected}
                className={`group relative flex min-h-[170px] w-full flex-col items-start rounded-[24px] border p-5 text-left shadow-sm transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--teal-dark)] motion-reduce:transition-none motion-reduce:hover:transform-none sm:p-6 ${
                  isSelected
                    ? 'border-[var(--teal)] bg-white shadow-[var(--shadow)] ring-1 ring-[var(--teal)]/15'
                    : 'border-white/80 bg-white/65 hover:border-[rgba(10,126,164,0.3)]'
                }`}
                id={`specialty-tab-${workflow.id}`}
                onClick={() => setSelectedId(workflow.id)}
                onKeyDown={(event) => handleTabKeyDown(event, index)}
                role="tab"
                tabIndex={isSelected ? 0 : -1}
                type="button"
              >
                <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--sky)] text-[var(--teal-dark)]">
                  <WorkflowMark kind={workflow.accent} />
                </span>
                <span className="text-xl font-semibold tracking-tight text-[var(--ink)]">
                  {workflow.name}
                </span>
                {isSelected && (
                  <span className="sr-only" aria-live="polite">
                    Selected
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div
          aria-labelledby={`specialty-tab-${selected.id}`}
          className="mt-5 grid gap-8 overflow-hidden rounded-[28px] border border-white/80 bg-white/80 p-6 shadow-[var(--shadow)] backdrop-blur-sm md:grid-cols-[1.05fr_0.95fr] md:gap-10 md:p-9"
          id="specialty-workflow-panel"
          role="tabpanel"
          tabIndex={0}
        >
          <div className="flex flex-col justify-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--teal-dark)]">
              Specialty application
            </p>
            <h3 className="mt-3 font-[var(--font-fraunces)] text-3xl leading-tight sm:text-4xl">
              {selected.name}
            </h3>
            <p className="mt-4 max-w-xl leading-relaxed text-[rgba(13,27,42,0.72)]">
              {selected.description}
            </p>
            <ul
              aria-label={`${selected.name} workflow focus`}
              className="mt-6 flex flex-wrap gap-2"
            >
              {selected.signals.map((signal) => (
                <li
                  key={signal}
                  className="rounded-full border border-[rgba(10,126,164,0.16)] bg-[var(--sky)]/70 px-3 py-1.5 text-sm font-medium text-[var(--ink)]"
                >
                  {signal}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[22px] bg-[var(--ink)] p-5 text-white sm:p-6">
            <div className="flex items-center justify-between gap-3 border-b border-white/15 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                  Illustrative sequence
                </p>
                <h4 className="mt-1 text-sm font-semibold">
                  Synthetic example · not a patient record
                </h4>
              </div>
              <span
                aria-hidden="true"
                className="h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-300"
              />
            </div>
            <ol className="mt-5 space-y-4">
              {selected.example.map((item, index) => (
                <li className="flex gap-3" key={item.label}>
                  <span className="relative flex w-6 shrink-0 justify-center">
                    <span className="z-10 flex h-6 w-6 items-center justify-center rounded-full border border-cyan-200/40 bg-white/10 text-xs font-semibold text-cyan-100">
                      {index + 1}
                    </span>
                    {index < selected.example.length - 1 && (
                      <span
                        aria-hidden="true"
                        className="absolute left-1/2 top-7 h-7 w-px -translate-x-1/2 bg-white/20"
                      />
                    )}
                  </span>
                  <span className="min-w-0 pb-1">
                    <span className="block text-xs font-medium text-white/55">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-sm font-medium text-white/95">
                      {item.value}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  )
}
