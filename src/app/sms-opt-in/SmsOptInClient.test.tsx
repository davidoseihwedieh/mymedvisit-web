import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { SmsOptInClient } from './SmsOptInClient'
import {
  ConsentSubmissionError,
  type DurableSmsConsentReceipt,
  type SmsConsentClient,
  type SmsConsentTransport,
  type SmsConsentWireRequest,
} from '@/lib/sms-consent/client'
import {
  SMS_CONSENT_PRIVACY,
  SMS_CONSENT_TERMS,
} from '@/lib/sms-consent/constants'
import {
  createRecaptchaSmsConsentClient,
  type RecaptchaTokenProvider,
} from '@/lib/sms-consent/recaptcha'

const IDEMPOTENCY_KEY = '11111111-1111-4111-8111-111111111111'
const SECOND_IDEMPOTENCY_KEY = '33333333-3333-4333-8333-333333333333'

const durableReceipt: DurableSmsConsentReceipt = {
  status: 'persisted',
  evidenceId: 'sce_22222222-2222-4222-8222-222222222222',
  recordedAt: '2026-09-15T12:00:00.000Z',
  idempotencyKey: IDEMPOTENCY_KEY,
}

let liveFetch = vi.fn()

function createClient(
  implementation: SmsConsentClient['submit'] = vi
    .fn()
    .mockResolvedValue(durableReceipt),
): SmsConsentClient {
  return { submit: implementation }
}

function renderForm(
  client = createClient(),
  createIdempotencyKey = () => IDEMPOTENCY_KEY,
) {
  return {
    client,
    ...render(
      <SmsOptInClient
        client={client}
        createIdempotencyKey={createIdempotencyKey}
      />,
    ),
  }
}

async function expectNoAxeViolations(container: HTMLElement) {
  expect((await axe(container)).violations).toEqual([])
}

async function completeForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    screen.getByRole('textbox', { name: /mobile phone number/i }),
    '5555550123',
  )
  await user.click(
    screen.getByRole('checkbox', {
      name: /i agree to receive the one-time verification-code/i,
    }),
  )
  await user.click(
    screen.getByRole('checkbox', {
      name: /i confirm that i am the subscriber/i,
    }),
  )
}

function dispatchPersistedTransition(type: 'pagehide' | 'pageshow') {
  const event = new PageTransitionEvent(type, { persisted: true })
  expect(event).toBeInstanceOf(PageTransitionEvent)
  expect(event.persisted).toBe(true)
  window.dispatchEvent(event)
}

async function restoreFromBfcache() {
  await act(async () => {
    dispatchPersistedTransition('pagehide')
    dispatchPersistedTransition('pageshow')
  })
}

beforeEach(() => {
  liveFetch = vi.fn()
  vi.stubGlobal('fetch', liveFetch)
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value: true,
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('SMS opt-in form', () => {
  it('starts with consent and number attestation independently unchecked', () => {
    renderForm()

    expect(
      screen.getByRole('checkbox', {
        name: /i agree to receive the one-time verification-code/i,
      }),
    ).not.toBeChecked()
    expect(
      screen.getByRole('checkbox', {
        name: /i confirm that i am the subscriber/i,
      }),
    ).not.toBeChecked()
  })

  it('keeps the production client safely disconnected', async () => {
    const user = userEvent.setup()
    render(<SmsOptInClient createIdempotencyKey={() => IDEMPOTENCY_KEY} />)
    await completeForm(user)

    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Consent submission is not available yet. No consent was sent or recorded.',
    )
    expect(
      screen.queryByText('Your SMS consent was saved.'),
    ).not.toBeInTheDocument()
  })

  it('announces missing fields and focuses the first invalid field', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue(durableReceipt)
    renderForm(createClient(submit))

    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )

    expect(screen.getByText('Enter a mobile phone number.')).toBeVisible()
    expect(
      screen.getByText('Check the consent box to agree before continuing.'),
    ).toBeVisible()
    expect(
      screen.getByText(
        'Check the authorization box to confirm you may consent for this number.',
      ),
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
    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )

    expect(
      screen.getByText('Check the consent box to agree before continuing.'),
    ).toBeVisible()
    await waitFor(() => {
      expect(
        screen.getByRole('checkbox', {
          name: /i agree to receive the one-time verification-code/i,
        }),
      ).toHaveFocus()
    })
    expect(submit).not.toHaveBeenCalled()
  })

  it('validates missing number authorization independently and focuses it third', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue(durableReceipt)
    renderForm(createClient(submit))

    await user.type(
      screen.getByRole('textbox', { name: /mobile phone number/i }),
      '5555550123',
    )
    await user.click(
      screen.getByRole('checkbox', {
        name: /i agree to receive the one-time verification-code/i,
      }),
    )
    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )

    expect(
      screen.getByText(
        'Check the authorization box to confirm you may consent for this number.',
      ),
    ).toBeVisible()
    await waitFor(() => {
      expect(
        screen.getByRole('checkbox', {
          name: /i confirm that i am the subscriber/i,
        }),
      ).toHaveFocus()
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

    await user.click(
      screen.getByRole('checkbox', {
        name: /i agree to receive the one-time verification-code/i,
      }),
    )
    await user.click(
      screen.getByRole('checkbox', {
        name: /i confirm that i am the subscriber/i,
      }),
    )

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
    expect(
      screen.getByRole('checkbox', {
        name: /i agree to receive the one-time verification-code/i,
      }),
    ).toHaveFocus()
    await user.keyboard(' ')
    await user.tab()
    expect(
      screen.getByRole('checkbox', {
        name: /i confirm that i am the subscriber/i,
      }),
    ).toHaveFocus()
    await user.keyboard(' ')
    await user.tab()
    expect(
      screen.getByRole('link', { name: /terms of service/i }),
    ).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('link', { name: /privacy policy/i })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: /no thanks/i })).toHaveFocus()
    await user.tab()
    expect(
      screen.getByRole('button', { name: /agree and continue/i }),
    ).toHaveFocus()
    await user.keyboard('{Enter}')

    expect(await screen.findByText('Your SMS consent was saved.')).toBeVisible()
    expect(submit).toHaveBeenCalledTimes(1)
  })

  it('clears an idle consent session after a genuine persisted page lifecycle', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue(durableReceipt)
    renderForm(createClient(submit))
    await completeForm(user)

    await restoreFromBfcache()

    expect(
      screen.getByRole('textbox', { name: /mobile phone number/i }),
    ).toHaveValue('')
    expect(
      screen.getByRole('checkbox', {
        name: /i agree to receive the one-time verification-code/i,
      }),
    ).not.toBeChecked()
    expect(
      screen.getByRole('checkbox', {
        name: /i confirm that i am the subscriber/i,
      }),
    ).not.toBeChecked()
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: /agree and continue/i }),
      ).toBeEnabled(),
    )
    expect(submit).not.toHaveBeenCalled()
  })

  it('clears validation feedback on a persisted restoration without submitting', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue(durableReceipt)
    renderForm(createClient(submit))
    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )
    expect(screen.getByRole('alert')).toHaveTextContent('highlighted fields')

    await restoreFromBfcache()

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Enter a mobile phone number.'),
    ).not.toBeInTheDocument()
    expect(submit).not.toHaveBeenCalled()
  })

  it('aborts loading work and ignores its delayed completion after persisted restoration', async () => {
    const user = userEvent.setup()
    let resolveRequest!: (receipt: DurableSmsConsentReceipt) => void
    const submit = vi.fn(
      (_submission, _key, signal?: AbortSignal) =>
        new Promise<DurableSmsConsentReceipt>((resolve) => {
          expect(signal?.aborted).toBe(false)
          resolveRequest = resolve
        }),
    )
    renderForm(createClient(submit))
    await completeForm(user)
    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )
    expect(
      screen.getByText(/waiting for durable-persistence confirmation/i),
    ).toBeVisible()
    const signal = submit.mock.calls[0][2]

    await restoreFromBfcache()

    expect(signal?.aborted).toBe(true)
    expect(
      screen.getByRole('textbox', { name: /mobile phone number/i }),
    ).toHaveValue('')
    expect(
      screen.queryByText(/durable-persistence confirmation/i),
    ).not.toBeInTheDocument()
    await act(async () => resolveRequest(durableReceipt))
    expect(
      screen.queryByText('Your SMS consent was saved.'),
    ).not.toBeInTheDocument()
    expect(submit).toHaveBeenCalledTimes(1)
  })

  it('discards ambiguous retry identity and stale retry success on persisted restoration', async () => {
    const user = userEvent.setup()
    let resolveRetry!: (receipt: DurableSmsConsentReceipt) => void
    const submit = vi
      .fn<SmsConsentClient['submit']>()
      .mockRejectedValueOnce(new TypeError('network failed'))
      .mockImplementationOnce(
        (_submission, _key, signal) =>
          new Promise<DurableSmsConsentReceipt>((resolve) => {
            expect(signal?.aborted).toBe(false)
            resolveRetry = resolve
          }),
      )
    renderForm(createClient(submit))
    await completeForm(user)
    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )
    await screen.findByRole('alert')
    await user.click(screen.getByRole('button', { name: /try again/i }))
    expect(submit).toHaveBeenCalledTimes(2)
    const retrySignal = submit.mock.calls[1][2]

    await restoreFromBfcache()

    expect(retrySignal?.aborted).toBe(true)
    expect(
      screen.queryByRole('button', { name: /try again/i }),
    ).not.toBeInTheDocument()
    await act(async () => resolveRetry(durableReceipt))
    expect(
      screen.queryByText('Your SMS consent was saved.'),
    ).not.toBeInTheDocument()
    expect(submit).toHaveBeenCalledTimes(2)
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

    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('treated as not recorded')
    expect(
      screen.queryByText('Your SMS consent was saved.'),
    ).not.toBeInTheDocument()
  })

  it('retries an ambiguous failure with the same idempotency key', async () => {
    const user = userEvent.setup()
    const submit = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('network failed'))
      .mockResolvedValueOnce(durableReceipt)
    renderForm(createClient(submit))
    await completeForm(user)
    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )
    await screen.findByRole('alert')

    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(await screen.findByText('Your SMS consent was saved.')).toBeVisible()
    expect(submit).toHaveBeenCalledTimes(2)
    expect(submit.mock.calls[0][1]).toBe(IDEMPOTENCY_KEY)
    expect(submit.mock.calls[1][1]).toBe(IDEMPOTENCY_KEY)
    expect(submit.mock.calls[1][0]).toEqual(submit.mock.calls[0][0])
  })

  it('uses a fresh CAPTCHA token while preserving the logical payload and key after a lost response', async () => {
    const user = userEvent.setup()
    const getToken = vi
      .fn<RecaptchaTokenProvider['getToken']>()
      .mockResolvedValueOnce('fresh-token-one')
      .mockResolvedValueOnce('fresh-token-two')
    const requests: SmsConsentWireRequest[] = []
    const keys: string[] = []
    const transport: SmsConsentTransport = {
      submit: vi
        .fn<SmsConsentTransport['submit']>()
        .mockImplementationOnce(async (request, key) => {
          requests.push(request)
          keys.push(key)
          throw new ConsentSubmissionError(
            'network',
            'The consent request could not be confirmed.',
          )
        })
        .mockImplementationOnce(async (request, key) => {
          requests.push(request)
          keys.push(key)
          return durableReceipt
        }),
    }
    const client = createRecaptchaSmsConsentClient({
      transport,
      tokenProvider: { getToken },
    })
    renderForm(client)
    await completeForm(user)

    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )
    await screen.findByRole('alert')
    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(await screen.findByText('Your SMS consent was saved.')).toBeVisible()
    expect(getToken).toHaveBeenCalledTimes(2)
    expect(keys).toEqual([IDEMPOTENCY_KEY, IDEMPOTENCY_KEY])
    expect(requests[0].recaptchaToken).toBe('fresh-token-one')
    expect(requests[1].recaptchaToken).toBe('fresh-token-two')
    const { recaptchaToken: firstToken, ...firstLogical } = requests[0]
    const { recaptchaToken: secondToken, ...secondLogical } = requests[1]
    expect(firstToken).not.toBe(secondToken)
    expect(secondLogical).toEqual(firstLogical)
  })

  it('invalidates a retained attempt when the phone changes and creates a new UUID', async () => {
    const user = userEvent.setup()
    const submit = vi
      .fn<SmsConsentClient['submit']>()
      .mockRejectedValueOnce(
        new ConsentSubmissionError(
          'network',
          'The consent request could not be confirmed.',
        ),
      )
      .mockResolvedValueOnce({
        ...durableReceipt,
        idempotencyKey: SECOND_IDEMPOTENCY_KEY,
      })
    const createIdempotencyKey = vi
      .fn()
      .mockReturnValueOnce(IDEMPOTENCY_KEY)
      .mockReturnValueOnce(SECOND_IDEMPOTENCY_KEY)
    renderForm(createClient(submit), createIdempotencyKey)
    await completeForm(user)
    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )
    await screen.findByRole('alert')

    const phone = screen.getByRole('textbox', { name: /mobile phone number/i })
    await user.clear(phone)
    await user.type(phone, '5555550199')
    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )

    expect(await screen.findByText('Your SMS consent was saved.')).toBeVisible()
    expect(createIdempotencyKey).toHaveBeenCalledTimes(2)
    expect(submit.mock.calls[0][1]).toBe(IDEMPOTENCY_KEY)
    expect(submit.mock.calls[1][1]).toBe(SECOND_IDEMPOTENCY_KEY)
    expect(submit.mock.calls[1][0].phoneNumber).toBe('5555550199')
  })

  it('invalidates a retained attempt when SMS consent changes', async () => {
    const user = userEvent.setup()
    const submit = vi
      .fn<SmsConsentClient['submit']>()
      .mockRejectedValueOnce(
        new ConsentSubmissionError(
          'network',
          'The consent request could not be confirmed.',
        ),
      )
      .mockResolvedValueOnce({
        ...durableReceipt,
        idempotencyKey: SECOND_IDEMPOTENCY_KEY,
      })
    const createIdempotencyKey = vi
      .fn()
      .mockReturnValueOnce(IDEMPOTENCY_KEY)
      .mockReturnValueOnce(SECOND_IDEMPOTENCY_KEY)
    renderForm(createClient(submit), createIdempotencyKey)
    await completeForm(user)
    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )
    await screen.findByRole('alert')

    const consent = screen.getByRole('checkbox', {
      name: /i agree to receive the one-time verification-code/i,
    })
    await user.click(consent)
    await user.click(consent)
    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )

    expect(await screen.findByText('Your SMS consent was saved.')).toBeVisible()
    expect(submit.mock.calls.map((call) => call[1])).toEqual([
      IDEMPOTENCY_KEY,
      SECOND_IDEMPOTENCY_KEY,
    ])
  })

  it('invalidates a retained attempt when the number attestation changes', async () => {
    const user = userEvent.setup()
    const submit = vi
      .fn<SmsConsentClient['submit']>()
      .mockRejectedValueOnce(
        new ConsentSubmissionError(
          'network',
          'The consent request could not be confirmed.',
        ),
      )
      .mockResolvedValueOnce({
        ...durableReceipt,
        idempotencyKey: SECOND_IDEMPOTENCY_KEY,
      })
    const createIdempotencyKey = vi
      .fn()
      .mockReturnValueOnce(IDEMPOTENCY_KEY)
      .mockReturnValueOnce(SECOND_IDEMPOTENCY_KEY)
    renderForm(createClient(submit), createIdempotencyKey)
    await completeForm(user)
    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )
    await screen.findByRole('alert')

    const attestation = screen.getByRole('checkbox', {
      name: /i confirm that i am the subscriber/i,
    })
    await user.click(attestation)
    await user.click(attestation)
    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )

    expect(await screen.findByText('Your SMS consent was saved.')).toBeVisible()
    expect(submit.mock.calls.map((call) => call[1])).toEqual([
      IDEMPOTENCY_KEY,
      SECOND_IDEMPOTENCY_KEY,
    ])
    expect(submit.mock.calls[1][0].authorizedNumberAttestation).toBe(true)
  })

  it('preserves the retained attempt while offline and retries after recovery', async () => {
    const user = userEvent.setup()
    const submit = vi
      .fn<SmsConsentClient['submit']>()
      .mockRejectedValueOnce(
        new ConsentSubmissionError(
          'network',
          'The consent request could not be confirmed.',
        ),
      )
      .mockResolvedValueOnce(durableReceipt)
    renderForm(createClient(submit))
    await completeForm(user)
    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )
    await screen.findByRole('alert')

    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
    })
    window.dispatchEvent(new Event('offline'))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /try again/i })).toBeDisabled(),
    )

    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: true,
    })
    window.dispatchEvent(new Event('online'))
    const retry = screen.getByRole('button', { name: /try again/i })
    await waitFor(() => expect(retry).toBeEnabled())
    await user.click(retry)

    expect(await screen.findByText('Your SMS consent was saved.')).toBeVisible()
    expect(submit.mock.calls.map((call) => call[1])).toEqual([
      IDEMPOTENCY_KEY,
      IDEMPOTENCY_KEY,
    ])
  })

  it('honors the fixed five-second retry delay for an unavailable response', async () => {
    const user = userEvent.setup()
    const submit = vi
      .fn<SmsConsentClient['submit']>()
      .mockRejectedValueOnce(
        new ConsentSubmissionError(
          'unavailable',
          'The consent request could not be completed.',
          5_000,
        ),
      )
      .mockResolvedValueOnce(durableReceipt)
    renderForm(createClient(submit))
    await completeForm(user)
    vi.useFakeTimers()
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: /agree and continue/i }),
      )
      await Promise.resolve()
    })

    const retry = screen.getByRole('button', { name: /try again/i })
    expect(retry).toBeDisabled()
    await act(async () => vi.advanceTimersByTimeAsync(4_999))
    expect(retry).toBeDisabled()
    await act(async () => vi.advanceTimersByTimeAsync(1))
    expect(retry).toBeEnabled()
    vi.useRealTimers()
    await user.click(retry)

    expect(await screen.findByText('Your SMS consent was saved.')).toBeVisible()
  })

  it.each([
    'captcha-unavailable',
    'network',
    'invalid-response',
    'bot-check-failed',
    'rate-limited',
    'internal-error',
    'unavailable',
  ] as const)('offers an explicit retry for %s', async (code) => {
    const user = userEvent.setup()
    const submit = vi
      .fn()
      .mockRejectedValue(
        new ConsentSubmissionError(
          code,
          'The consent request could not be completed.',
        ),
      )
    renderForm(createClient(submit))
    await completeForm(user)
    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )

    expect(
      await screen.findByRole('button', { name: /try again/i }),
    ).toBeVisible()
  })

  it.each([
    'invalid-request',
    'request-not-allowed',
    'method-not-allowed',
    'idempotency-conflict',
    'request-too-large',
    'unsupported-media-type',
  ] as const)('does not retry the definitive %s response', async (code) => {
    const user = userEvent.setup()
    const submit = vi
      .fn()
      .mockRejectedValue(
        new ConsentSubmissionError(
          code,
          'The consent request could not be completed.',
        ),
      )
    renderForm(createClient(submit))
    await completeForm(user)
    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )

    await screen.findByRole('alert')
    expect(
      screen.queryByRole('button', { name: /try again/i }),
    ).not.toBeInTheDocument()
    expect(submit).toHaveBeenCalledTimes(1)
  })

  it('prevents duplicate token acquisition and transport calls', async () => {
    const user = userEvent.setup()
    let resolveToken!: (token: string) => void
    const getToken = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveToken = resolve
        }),
    )
    const transport: SmsConsentTransport = {
      submit: vi.fn().mockResolvedValue(durableReceipt),
    }
    const client = createRecaptchaSmsConsentClient({
      transport,
      tokenProvider: { getToken },
    })
    renderForm(client)
    await completeForm(user)
    const submit = screen.getByRole('button', { name: /agree and continue/i })

    await user.dblClick(submit)

    expect(getToken).toHaveBeenCalledTimes(1)
    expect(transport.submit).not.toHaveBeenCalled()
    await act(async () => resolveToken('fresh-token'))
    expect(transport.submit).toHaveBeenCalledTimes(1)
  })

  it('requires a validated durable-persistence receipt before success', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue({
      status: 'accepted',
      evidenceId: 'not-yet-persisted',
    })
    renderForm(createClient(submit as SmsConsentClient['submit']))
    await completeForm(user)

    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'treated as not recorded',
    )
    expect(
      screen.queryByText('Your SMS consent was saved.'),
    ).not.toBeInTheDocument()
  })

  it('never displays success for a normalized but impossible timestamp', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue({
      ...durableReceipt,
      recordedAt: '2026-02-30T12:00:00.000Z',
    })
    renderForm(createClient(submit))
    await completeForm(user)

    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'treated as not recorded',
    )
    expect(
      screen.queryByText('Your SMS consent was saved.'),
    ).not.toBeInTheDocument()
    expect(liveFetch).not.toHaveBeenCalled()
  })

  it('shows success only for a confirmed durable-persistence response', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue(durableReceipt)
    renderForm(createClient(submit))
    await completeForm(user)

    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )

    expect(await screen.findByRole('status')).toHaveTextContent(
      'confirmed that your consent record was durably persisted',
    )
  })

  it('links to the version-referenced Terms and Privacy pages', () => {
    renderForm()

    expect(
      screen.getByRole('link', { name: /terms of service/i }),
    ).toHaveAttribute('href', SMS_CONSENT_TERMS.reference)
    expect(
      screen.getByRole('link', { name: /privacy policy/i }),
    ).toHaveAttribute('href', SMS_CONSENT_PRIVACY.reference)
  })

  it('announces offline state and makes no request', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
    })
    const submit = vi.fn().mockResolvedValue(durableReceipt)
    renderForm(createClient(submit))

    expect(await screen.findByRole('status')).toHaveTextContent(
      'You are offline',
    )
    expect(
      screen.getByRole('button', { name: /agree and continue/i }),
    ).toBeDisabled()
    expect(submit).not.toHaveBeenCalled()
  })

  it('has no detectable axe violations in its initial state', async () => {
    const { container } = renderForm()

    await expectNoAxeViolations(container)
    expect(liveFetch).not.toHaveBeenCalled()
  })

  it('has no detectable axe violations with validation errors', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue(durableReceipt)
    const { container } = renderForm(createClient(submit))

    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )
    await screen.findByRole('alert')

    await expectNoAxeViolations(container)
    expect(submit).not.toHaveBeenCalled()
    expect(liveFetch).not.toHaveBeenCalled()
  })

  it('has no detectable axe violations while loading', async () => {
    const user = userEvent.setup()
    let resolveRequest!: (receipt: DurableSmsConsentReceipt) => void
    const submit = vi.fn(
      () =>
        new Promise<DurableSmsConsentReceipt>((resolve) => {
          resolveRequest = resolve
        }),
    )
    const { container } = renderForm(createClient(submit))
    await completeForm(user)

    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )
    await screen.findByText(/waiting for durable-persistence confirmation/i)

    await expectNoAxeViolations(container)
    expect(submit).toHaveBeenCalledTimes(1)
    expect(liveFetch).not.toHaveBeenCalled()

    await act(async () => {
      resolveRequest(durableReceipt)
    })
  })

  it('has no detectable axe violations while offline', async () => {
    Object.defineProperty(window.navigator, 'onLine', {
      configurable: true,
      value: false,
    })
    const submit = vi.fn().mockResolvedValue(durableReceipt)
    const { container } = renderForm(createClient(submit))

    await screen.findByText(
      'You are offline. Reconnect before submitting. No consent has been sent or recorded.',
    )

    await expectNoAxeViolations(container)
    expect(submit).not.toHaveBeenCalled()
    expect(liveFetch).not.toHaveBeenCalled()
  })

  it('has no detectable axe violations after a generic failure', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockRejectedValue(new TypeError('network failed'))
    const { container } = renderForm(createClient(submit))
    await completeForm(user)

    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )
    await screen.findByRole('alert')

    await expectNoAxeViolations(container)
    expect(submit).toHaveBeenCalledTimes(1)
    expect(liveFetch).not.toHaveBeenCalled()
  })

  it('has no detectable axe violations during an ambiguous retry', async () => {
    const user = userEvent.setup()
    let resolveRetry!: (receipt: DurableSmsConsentReceipt) => void
    const submit = vi
      .fn()
      .mockRejectedValueOnce(new TypeError('network failed'))
      .mockImplementationOnce(
        () =>
          new Promise<DurableSmsConsentReceipt>((resolve) => {
            resolveRetry = resolve
          }),
      )
    const { container } = renderForm(createClient(submit))
    await completeForm(user)
    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )
    await screen.findByRole('alert')

    await user.click(screen.getByRole('button', { name: /try again/i }))
    await screen.findByText(/waiting for durable-persistence confirmation/i)

    await expectNoAxeViolations(container)
    expect(submit).toHaveBeenCalledTimes(2)
    expect(submit.mock.calls[0][1]).toBe(IDEMPOTENCY_KEY)
    expect(submit.mock.calls[1][1]).toBe(IDEMPOTENCY_KEY)
    expect(liveFetch).not.toHaveBeenCalled()

    await act(async () => {
      resolveRetry(durableReceipt)
    })
  })

  it('has no detectable axe violations after decline', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue(durableReceipt)
    const { container } = renderForm(createClient(submit))
    await completeForm(user)

    await user.click(screen.getByRole('button', { name: /no thanks/i }))
    await screen.findByText('You have not opted in.')

    await expectNoAxeViolations(container)
    expect(submit).not.toHaveBeenCalled()
    expect(liveFetch).not.toHaveBeenCalled()
  })

  it('has no detectable axe violations after durable success', async () => {
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue(durableReceipt)
    const { container } = renderForm(createClient(submit))
    await completeForm(user)

    await user.click(
      screen.getByRole('button', { name: /agree and continue/i }),
    )
    await screen.findByText('Your SMS consent was saved.')

    await expectNoAxeViolations(container)
    expect(submit).toHaveBeenCalledTimes(1)
    expect(liveFetch).not.toHaveBeenCalled()
  })
})
