import { axe } from 'jest-axe'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SpecialtyWorkflows } from './SpecialtyWorkflows'

describe('SpecialtyWorkflows', () => {
  it('presents four equal program applications and labels examples synthetic', () => {
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
      'specialty-tab-genitourinary-oncology',
      'specialty-tab-breast-oncology',
      'specialty-tab-pulmonary',
      'specialty-tab-rural-rpm',
    ])
    for (const name of [
      'Genitourinary Oncology',
      'Breast Oncology',
      'Pulmonary / COPD',
      'Rural Remote Monitoring',
    ]) {
      expect(screen.getByRole('tab', { name: new RegExp(name) })).toBeVisible()
    }
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

  it('keeps all program details selectable by click and keyboard', () => {
    render(<SpecialtyWorkflows />)

    const gu = screen.getByRole('tab', { name: /Genitourinary Oncology/i })
    const breast = screen.getByRole('tab', { name: /Breast Oncology/i })
    const pulmonary = screen.getByRole('tab', { name: /Pulmonary \/ COPD/i })
    const rpm = screen.getByRole('tab', { name: /Rural Remote Monitoring/i })
    const tablist = screen.getByRole('tablist', {
      name: 'Select a specialty workflow',
    })
    const panel = screen.getByRole('tabpanel')

    expect(within(tablist).getAllByRole('tab')).toHaveLength(4)
    expect(gu).toHaveAttribute('aria-controls', panel.id)
    expect(panel).toHaveAttribute('aria-labelledby', gu.id)

    breast.focus()
    fireEvent.keyDown(breast, { key: 'ArrowRight' })

    expect(pulmonary).toHaveFocus()
    expect(pulmonary).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByRole('heading', { name: 'Pulmonary / COPD', level: 3 }),
    ).toBeVisible()
    expect(
      screen.getByText(/After a COPD exacerbation, changes in oxygen saturation/i),
    ).toBeVisible()
    expect(pulmonary).toHaveAttribute('aria-controls', panel.id)
    expect(panel).toHaveAttribute('aria-labelledby', pulmonary.id)

    fireEvent.click(breast)
    expect(breast).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByText(/Symptom reporting for adults receiving systemic therapy/i),
    ).toBeVisible()

    fireEvent.click(rpm)
    expect(rpm).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByRole('heading', { name: 'Rural Remote Monitoring', level: 3 }),
    ).toBeVisible()
    expect(screen.getByText('Works without home internet')).toBeVisible()

    fireEvent.keyDown(rpm, { key: 'ArrowRight' })
    expect(gu).toHaveFocus()
    expect(gu).toHaveAttribute('aria-selected', 'true')
    fireEvent.keyDown(gu, { key: 'End' })
    expect(rpm).toHaveFocus()
    expect(rpm).toHaveAttribute('aria-selected', 'true')

    fireEvent.click(gu)
    expect(gu).toHaveAttribute('aria-selected', 'true')
    expect(
      screen.getByText(/Toxicity that evolves between infusions/i),
    ).toBeVisible()
  })

  it('exposes the full platform explanation and has no axe violations', async () => {
    const { container } = render(<SpecialtyWorkflows />)

    expect(
      screen.getByText(/Four programs, one shared platform/i),
    ).toBeVisible()
    expect(
      screen.getByText(/observations, change over time,\s+prioritization/i),
    ).toBeVisible()

    for (const name of [
      'Genitourinary Oncology',
      'Breast Oncology',
      'Pulmonary / COPD',
      'Rural Remote Monitoring',
    ]) {
      const tab = screen.getByRole('tab', { name: new RegExp(name) })
      fireEvent.click(tab)
      expect(tab).toHaveAttribute('aria-selected', 'true')
      expect((await axe(container)).violations).toEqual([])
    }
  })
})
