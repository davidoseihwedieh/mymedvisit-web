import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const specialtySource = readFileSync(
  new URL('../../src/components/SpecialtyWorkflows.tsx', import.meta.url),
  'utf8',
)

describe('specialty content policy', () => {
  it('keeps exactly four equal specialty applications and the approved cardiovascular scope', () => {
    for (const specialty of [
      "id: 'oncology'",
      "id: 'exercise-recovery'",
      "id: 'orthopaedics'",
      "id: 'cardiovascular'",
    ]) {
      expect(specialtySource).toContain(specialty)
    }

    expect(specialtySource).toContain('Four applications, one shared platform')
    expect(specialtySource).toContain(
      'Longitudinal symptoms, functional tolerance, medication-related observations, recovery patterns, and meaningful changes between encounters.',
    )
    expect(specialtySource).toMatch(
      /grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4/,
    )
  })

  it('does not assign maturity or make prohibited affiliation or clinical claims', () => {
    expect(specialtySource).not.toMatch(
      /most developed|concept workflow|concept in development|in development|physiologic monitoring|arrhythmia detection|autonomous emergency triage/i,
    )
    expect(specialtySource).toMatch(
      /do not represent\s+clinical validation, active deployment, or institutional\s+partnership\./,
    )
  })
})
