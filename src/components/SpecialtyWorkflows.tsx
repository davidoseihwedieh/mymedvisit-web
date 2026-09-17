'use client'

import { useRef, useState, type KeyboardEvent } from 'react'

const workflows = [
  {
    id: 'oncology',
    name: 'Oncology',
    maturity: 'Most developed pathway',
    description:
      'Treatment-toxicity observations can be viewed over time, including reports from patients and caregivers, to help bring meaningful changes into the care-team conversation.',
    signals: [
      'Treatment toxicity',
      'Patient + caregiver voice',
      'Patient/caregiver escalation',
    ],
    example: [
      { label: 'Voice observation', value: 'Treatment side effect noted' },
      { label: 'Longitudinal change', value: 'A new change is surfaced' },
      { label: 'Care-team action', value: 'Context ready for review' },
    ],
    accent: 'oncology',
  },
  {
    id: 'exercise-recovery',
    name: 'Exercise & Recovery',
    maturity: 'Concept workflow · in development',
    description:
      'A concept for bringing exertional symptoms, recovery, and activity tolerance into one longitudinal view.',
    signals: ['Exertional symptoms', 'Recovery patterns', 'Activity tolerance'],
    example: [
      { label: 'Voice observation', value: 'Effort and symptoms described' },
      { label: 'Longitudinal change', value: 'Recovery compared over time' },
      { label: 'Care-team action', value: 'Context ready for review' },
    ],
    accent: 'exercise',
  },
  {
    id: 'orthopaedics',
    name: 'Orthopaedics',
    maturity: 'Concept workflow · in development',
    description:
      'A concept for following postoperative recovery, mobility, wound concerns, and implant-related change over time.',
    signals: [
      'Postoperative recovery',
      'Mobility + wound concerns',
      'Implant-related change',
    ],
    example: [
      { label: 'Voice observation', value: 'Mobility or recovery described' },
      {
        label: 'Longitudinal change',
        value: 'A change is organized over time',
      },
      { label: 'Care-team action', value: 'Context ready for review' },
    ],
    accent: 'orthopaedics',
  },
] as const

const architecture = [
  {
    title: 'Voice observations',
    description: 'Patient and caregiver context',
  },
  {
    title: 'Longitudinal change',
    description: 'Signals considered over time',
  },
  {
    title: 'Clinical prioritization',
    description: 'Changes organized for review',
  },
  {
    title: 'Care-team action',
    description: 'A clearer starting point for follow-up',
  },
] as const

function WorkflowMark({
  kind,
}: {
  kind: (typeof workflows)[number]['accent']
}) {
  const paths = {
    oncology: (
      <>
        <path d="M12 3v18M3 12h18" />
        <circle cx="12" cy="12" r="8.5" />
      </>
    ),
    exercise: (
      <>
        <path d="M4 12h3l2-6 4 12 2-6h5" />
        <path d="M3 5v14M21 5v14" />
      </>
    ),
    orthopaedics: (
      <>
        <path d="M8 4a2.5 2.5 0 1 0-3.5 3.5l7.9 7.9a2.5 2.5 0 1 0 3.5-3.5L8 4Z" />
        <path d="M16 20a2.5 2.5 0 1 0 3.5-3.5l-2.2-2.2" />
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
            One voice-first foundation
          </p>
          <h2
            className="mt-4 font-[var(--font-fraunces)] text-4xl leading-tight tracking-tight sm:text-5xl"
            id="specialty-workflows-title"
          >
            One platform. Specialty-specific intelligence.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[rgba(13,27,42,0.7)] sm:text-lg">
            Explore how the same architecture can organize a voice observation
            into longitudinal context and a useful starting point for care-team
            review.
          </p>
        </div>

        <div
          aria-label="Select a specialty workflow"
          className="mt-10 grid gap-4 md:grid-cols-3"
          role="tablist"
        >
          {workflows.map((workflow, index) => {
            const isSelected = workflow.id === selected.id
            const isPrimary = workflow.id === 'oncology'
            return (
              <button
                key={workflow.id}
                ref={(element) => {
                  tabRefs.current[index] = element
                }}
                aria-controls="specialty-workflow-panel"
                aria-selected={isSelected}
                className={`group relative flex min-h-[190px] w-full flex-col items-start rounded-[24px] border p-5 text-left shadow-sm transition-[background-color,border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--teal-dark)] motion-reduce:transition-none motion-reduce:hover:transform-none sm:p-6 ${
                  isPrimary
                    ? isSelected
                      ? 'border-[var(--teal)] bg-white shadow-[0_14px_40px_rgba(10,126,164,0.14)] ring-1 ring-[var(--teal)]/20'
                      : 'border-[rgba(10,126,164,0.28)] bg-white/90'
                    : isSelected
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
                <span
                  className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl ${
                    isPrimary
                      ? 'bg-[var(--teal)] text-white'
                      : 'bg-[var(--sky)] text-[var(--teal-dark)]'
                  }`}
                >
                  <WorkflowMark kind={workflow.accent} />
                </span>
                <span className="text-xl font-semibold tracking-tight text-[var(--ink)]">
                  {workflow.name}
                </span>
                <span
                  className={`mt-2 text-xs font-semibold uppercase tracking-[0.12em] ${
                    isPrimary
                      ? 'text-[var(--teal-dark)]'
                      : 'text-[rgba(13,27,42,0.58)]'
                  }`}
                >
                  {workflow.maturity}
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
              {selected.maturity}
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

        <div className="mt-10">
          <p className="text-center text-xs font-semibold uppercase tracking-[0.22em] text-[var(--teal-dark)]">
            Shared architecture
          </p>
          <ol
            aria-label="Shared architecture flow"
            className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          >
            {architecture.map((step, index) => (
              <li
                className="relative rounded-[20px] border border-white/80 bg-white/65 p-4 sm:p-5"
                key={step.title}
              >
                <span className="text-xs font-semibold tabular-nums text-[var(--teal-dark)]">
                  0{index + 1}
                </span>
                <h3 className="mt-2 font-semibold text-[var(--ink)]">
                  {step.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-[rgba(13,27,42,0.62)]">
                  {step.description}
                </p>
                {index < architecture.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute -right-2 top-1/2 z-10 hidden h-4 w-4 -translate-y-1/2 rotate-45 border-r border-t border-[rgba(10,126,164,0.35)] lg:block"
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
