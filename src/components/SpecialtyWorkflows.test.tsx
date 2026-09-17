import { axe } from 'jest-axe'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SpecialtyWorkflows } from './SpecialtyWorkflows'

describe('SpecialtyWorkflows', () => {
  it('presents Oncology as the most developed pathway and labels other paths in development', () => {
    render(<SpecialtyWorkflows />)

    expect(
      screen.getByRole('heading', {
        name: 'One platform. Specialty-specific intelligence.',
      }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('tab', { name: /Oncology.*Most developed pathway/i }),
    ).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByRole('tab', { name: /Exercise & Recovery.*in development/i }),
    ).toBeVisible()
    expect(
      screen.getByRole('tab', { name: /Orthopaedics.*in development/i }),
    ).toBeVisible()
    expect(
      screen.getByText(/Synthetic example · not a patient record/),
    ).toBeVisible()
  })

  it('selects workflows by click and keyboard while keeping the panel relationship accessible', () => {
    render(<SpecialtyWorkflows />)

    const oncology = screen.getByRole('tab', { name: /Oncology/i })
    const exercise = screen.getByRole('tab', { name: /Exercise & Recovery/i })
    const orthopaedics = screen.getByRole('tab', { name: /Orthopaedics/i })
    const tablist = screen.getByRole('tablist', {
      name: 'Select a specialty workflow',
    })
    const panel = screen.getByRole('tabpanel')

    expect(within(tablist).getAllByRole('tab')).toHaveLength(3)
    expect(oncology).toHaveAttribute('aria-controls', panel.id)
    expect(panel).toHaveAttribute('aria-labelledby', oncology.id)

    exercise.focus()
    fireEvent.keyDown(exercise, { key: 'ArrowRight' })

    expect(orthopaedics).toHaveFocus()
    expect(orthopaedics).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByRole('heading', { name: 'Orthopaedics', level: 3 }),
    ).toBeVisible()
    expect(orthopaedics).toHaveAttribute('aria-controls', panel.id)
    expect(panel).toHaveAttribute('aria-labelledby', orthopaedics.id)

    fireEvent.click(exercise)
    expect(exercise).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByText(
        /exertional symptoms, recovery, and activity tolerance/i,
      ),
    ).toBeVisible()
  })

  it('exposes the shared four-step architecture and has no axe violations', async () => {
    const { container } = render(<SpecialtyWorkflows />)
    const architecture = screen.getByRole('list', {
      name: 'Shared architecture flow',
    })

    expect(within(architecture).getByText('Voice observations')).toBeVisible()
    expect(within(architecture).getByText('Longitudinal change')).toBeVisible()
    expect(
      within(architecture).getByText('Clinical prioritization'),
    ).toBeVisible()
    expect(within(architecture).getByText('Care-team action')).toBeVisible()
    expect((await axe(container)).violations).toEqual([])
  })
})
