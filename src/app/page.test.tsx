import { axe } from 'jest-axe'
import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import Home from './page'

describe('homepage platform narrative', () => {
  it('presents the shared workflow, dyadic model, and three equal specialty applications', () => {
    render(<Home />)

    expect(
      screen.getByRole('heading', {
        name: 'Turn life between visits into information your care team can act on.',
        level: 1,
      }),
    ).toBeVisible()
    expect(
      screen.getByText(
        'MyMedVisit captures patient and caregiver observations by voice, identifies meaningful change over time, and helps connect emerging concerns with the appropriate care workflow.',
      ),
    ).toBeVisible()

    const workflowSection = screen.getByRole('region', {
      name: 'From everyday observations to care-team action.',
    })
    const workflow = within(workflowSection).getByRole('list')
    expect(within(workflow).getByText('Listen')).toBeVisible()
    expect(within(workflow).getByText('Understand')).toBeVisible()
    expect(within(workflow).getByText('Prioritize')).toBeVisible()
    expect(within(workflow).getByText('Act')).toBeVisible()
    expect(
      screen.getByRole('heading', {
        name: 'Two perspectives. One longitudinal clinical picture.',
      }),
    ).toBeVisible()

    const tablist = screen.getByRole('tablist', {
      name: 'Select a specialty workflow',
    })
    expect(within(tablist).getAllByRole('tab')).toHaveLength(3)
    expect(
      screen.queryByText(/most developed|concept workflow|in development/i),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(
        /Medical visits are impossible to remember|captures the moment/i,
      ),
    ).not.toBeInTheDocument()
  })

  it('has no accessibility violations and retains safe recording guidance', async () => {
    const { container } = render(<Home />)

    expect(
      screen.getByText(
        /follow the healthcare organization’s policies and the laws that apply/i,
      ),
    ).toBeVisible()
    expect(
      screen.getByText(
        /does not diagnose or guarantee detection of every urgent concern/i,
      ),
    ).toBeVisible()
    expect((await axe(container)).violations).toEqual([])
  })
})
