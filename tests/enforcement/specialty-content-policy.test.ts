import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const specialtySource = readFileSync(
  new URL('../../src/components/SpecialtyWorkflows.tsx', import.meta.url),
  'utf8',
)

describe('specialty content policy', () => {
  it('keeps exactly four equal program applications and the approved pulmonary scope', () => {
    for (const specialty of [
      "id: 'genitourinary-oncology'",
      "id: 'breast-oncology'",
      "id: 'pulmonary'",
      "id: 'rural-rpm'",
    ]) {
      expect(specialtySource).toContain(specialty)
    }

    expect(specialtySource).toContain('Four programs, one shared platform')
    expect(specialtySource).toContain(
      'After a COPD exacerbation, drift in oxygen, activity, and sleep from a personal baseline prompts a short check-in, with local air quality and heat for context.',
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
