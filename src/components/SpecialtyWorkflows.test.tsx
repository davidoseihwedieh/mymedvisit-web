import { axe } from 'jest-axe'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SpecialtyWorkflows } from './SpecialtyWorkflows'

describe('SpecialtyWorkflows', () => {
  it('presents three equal specialty applications and labels examples synthetic', () => {
    render(<SpecialtyWorkflows />)

    expect(
      screen.getByRole('heading', {
        name: 'One platform. Specialty-specific intelligence.',
      }),
    ).toBeInTheDocument()

    const tabs = within(
      screen.getByRole('tablist', { name: 'Select a specialty workflow' }),
    ).getAllByRole('tab')
    expect(tabs.map((tab) => tab.id)).toEqual([
      'specialty-tab-oncology',
      'specialty-tab-exercise-recovery',
      'specialty-tab-orthopaedics',
    ])
    expect(
      tabs.filter((tab) => tab.getAttribute('aria-selected') === 'true'),
    ).toHaveLength(1)

    for (const label of [
      /most developed/i,
      /concept workflow/i,
      /in development/i,
      /clinically validated/i,
    ]) {
      expect(screen.queryByText(label)).not.toBeInTheDocument()
    }
    expect(
      screen.getAllByText('Synthetic example · not a patient record'),
    ).toHaveLength(1)
    expect(
      screen.getByText(
        /do not represent clinical validation, active deployment/i,
      ),
    ).toBeVisible()
  })

  it('keeps all specialty details selectable by click and keyboard', () => {
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
    expect(
      screen.getByText(/Pain, mobility, function, postoperative recovery/i),
    ).toBeVisible()
    expect(orthopaedics).toHaveAttribute('aria-controls', panel.id)
    expect(panel).toHaveAttribute('aria-labelledby', orthopaedics.id)

    fireEvent.click(exercise)
    expect(exercise).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByText(
        /Exertional symptoms, activity tolerance, recovery patterns/i,
      ),
    ).toBeVisible()

    fireEvent.click(oncology)
    expect(oncology).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByText(/Treatment-related symptoms, patient and caregiver/i),
    ).toBeVisible()
  })

  it('exposes the full platform explanation and has no axe violations', async () => {
    const { container } = render(<SpecialtyWorkflows />)

    expect(
      screen.getByText(/Three applications, one shared platform/i),
    ).toBeVisible()
    expect(
      screen.getByText(/observations, change over time, prioritization/i),
    ).toBeVisible()
    expect((await axe(container)).violations).toEqual([])
  })
})
