import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SmsOptInClient } from './SmsOptInClient'
import {
  type DurableSmsConsentReceipt,
  type SmsConsentClient,
} from '@/lib/sms-consent/client'
import {
  SMS_CONSENT_PRIVACY,
  SMS_CONSENT_TERMS,
} from '@/lib/sms-consent/constants'

const IDEMPOTENCY_KEY = 'test-idempotency-key'

const durableReceipt: DurableSmsConsentReceipt = {
  status: 'persisted',
  recordId: 'consent-record-1',
  persistedAt: '2026-09-15T12:00:00.000Z',
  idempotencyKey: IDEMPOTENCY_KEY,
}

function createClient(
  implementation: SmsConsentClient['submit'] = vi.fn().mockResolvedValue(durableReceipt),
): SmsConsentClient {
  return { submit: implementation }
}

function renderForm(client = createClient()) {
  return {
    client,
    ...render(
      <SmsOptInClient
        client={client}
        createIdempotencyKey={() => IDEMPOTENCY_KEY}
      />,
    ),
  }
}

async function completeForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByRole('textbox', { name: /mobile phone number/i }),
    '5555550123',
  )
  await user.click(
    screen.getByRole('checkbox', {
      name: /i agree to receive the transactional text messages/i,
    }),
  )
}

beforeEach(() => {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value: true,
  })
})

describe('SMS opt-in form', () => {
  it('starts with consent unchecked', () => {
    renderForm()

    expect(
      screen.getByRole('checkbox', {
        name: /i agree to receive the transactional text messages/i,
      }),
    ).not.toBeChecked()
  })

  it('keeps the production client safely disconnected', async () => {
    const user = userEvent.setup()
    render(
      <SmsOptInClient createIdempotencyKey={() => IDEMPOTENCY_KEY} />,
    )
    await completeForm(user)

    await user.click(screen.getByRole('button', { name: /agree and continue/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Consent submission is not available yet. No consent was sent or recorded.',
    )
    expect(screen.queryByText('Your SMS consent was saved.')).not.toBeInTheDocument()
  })

  it('announces missing fields and focuses the first invalid field', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue(durableReceipt)
    renderForm(createClient(submit))

    await user.click(screen.getByRole('button', { name: /agree and continue/i }))

    expect(screen.getByText('Enter a mobile phone number.')).toBeVisible()
    expect(
      screen.getByText('Check the consent box to agree before continuing.'),
    ).toBeVisible()
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please correct the highlighted fields before continuing.',
    )
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: /mobile phone number/i }),
      ).toHaveFocus()
    })
    expect(submit).not.toHaveBeenCalled()
  })

  it('validates missing consent and focuses the checkbox', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue(durableReceipt)
    renderForm(createClient(submit))

    await user.type(
      screen.getByRole('textbox', { name: /mobile phone number/i }),
      '5555550123',
    )
    await user.click(screen.getByRole('button', { name: /agree and continue/i }))

    expect(
      screen.getByText('Check the consent box to agree before continuing.'),
    ).toBeVisible()
    await waitFor(() => {
      expect(screen.getByRole('checkbox')).toHaveFocus()
    })
    expect(submit).not.toHaveBeenCalled()
  })

  it('does not request consent when the user declines', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue(durableReceipt)
    renderForm(createClient(submit))
    await completeForm(user)

    await user.click(screen.getByRole('button', { name: /no thanks/i }))

    expect(submit).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent(
      'No request was sent and no SMS consent was recorded',
    )
  })

  it('does not request consent for checkbox-only interaction', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue(durableReceipt)
    renderForm(createClient(submit))

    await user.click(screen.getByRole('checkbox'))

    expect(submit).not.toHaveBeenCalled()
  })

  it('supports a keyboard-only affirmative flow', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue(durableReceipt)
    renderForm(createClient(submit))
    const phone = screen.getByRole('textbox', { name: /mobile phone number/i })

    phone.focus()
    await user.keyboard('5555550123')
    await user.tab()
    expect(screen.getByRole('checkbox')).toHaveFocus()
    await user.keyboard(' ')
    await user.tab()
    expect(screen.getByRole('link', { name: /terms of service/i })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: /no thanks/i })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: /agree and continue/i })).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(await screen.findByText('Your SMS consent was saved.')).toBeVisible()
    expect(submit).toHaveBeenCalledTimes(1)
  })

  it('allows at most one in-flight request after duplicate clicks', async () => {
    const user = userEvent.setup()
    let resolveRequest!: (receipt: DurableSmsConsentReceipt) => void
    const submit = vi.fn(
      () =>
        new Promise<DurableSmsConsentReceipt>((resolve) => {
          resolveRequest = resolve
        }),
    )
    renderForm(createClient(submit))
    await completeForm(user)
    const button = screen.getByRole('button', { name: /agree and continue/i })

    await user.dblClick(button)

    expect(submit).toHaveBeenCalledTimes(1)
    expect(button).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent(
      'waiting for durable-persistence confirmation',
    )

    await act(async () => {
      resolveRequest(durableReceipt)
    })
  })

  it('never displays success after a backend or network failure', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockRejectedValue(new TypeError('network failed'))
    renderForm(createClient(submit))
    await completeForm(user)

    await user.click(screen.getByRole('button', { name: /agree and continue/i }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('treated as not recorded')
    expect(screen.queryByText('Your SMS consent was saved.')).not.toBeInTheDocument()
  })

  it('retries an ambiguous failure with the same idempotency key', async () => {
    const user = userEvent.setup()
    const submit = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('network failed'))
      .mockResolvedValueOnce(durableReceipt)
    renderForm(createClient(submit))
    await completeForm(user)
    await user.click(screen.getByRole('button', { name: /agree and continue/i }))
    await screen.findByRole('alert')

    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(await screen.findByText('Your SMS consent was saved.')).toBeVisible()
    expect(submit).toHaveBeenCalledTimes(2)
    expect(submit.mock.calls[0][1]).toBe(IDEMPOTENCY_KEY)
    expect(submit.mock.calls[1][1]).toBe(IDEMPOTENCY_KEY)
    expect(submit.mock.calls[1][0]).toEqual(submit.mock.calls[0][0])
  })

  it('requires a validated durable-persistence receipt before success', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue({
      status: 'accepted',
      recordId: 'not-yet-persisted',
    })
    renderForm(createClient(submit as SmsConsentClient['submit']))
    await completeForm(user)

    await user.click(screen.getByRole('button', { name: /agree and continue/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'treated as not recorded',
    )
    expect(screen.queryByText('Your SMS consent was saved.')).not.toBeInTheDocument()
  })

  it('shows success only for a confirmed durable-persistence response', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue(durableReceipt)
    renderForm(createClient(submit))
    await completeForm(user)

    await user.click(screen.getByRole('button', { name: /agree and continue/i }))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'confirmed that your consent record was durably persisted',
    )
  })

  it('links to the version-referenced Terms and Privacy pages', () => {
    renderForm()

    expect(screen.getByRole('link', { name: /terms of service/i })).toHaveAttribute(
      'href',
      SMS_CONSENT_TERMS.reference,
    )
    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveAttribute(
      'href',
      SMS_CONSENT_PRIVACY.reference,
    )
  })

  it('announces offline state and makes no request', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
    })
    const submit = vi.fn().mockResolvedValue(durableReceipt)
    renderForm(createClient(submit))

    expect(await screen.findByRole('status')).toHaveTextContent('You are offline')
    expect(screen.getByRole('button', { name: /agree and continue/i })).toBeDisabled()
    expect(submit).not.toHaveBeenCalled()
  })

  it('has no detectable axe violations in its initial state', async () => {
    const { container } = renderForm()

    const results = await axe(container)

    expect(results.violations).toEqual([])
  })
})
