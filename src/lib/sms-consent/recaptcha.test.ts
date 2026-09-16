import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  disabledSmsConsentClient,
  productionSmsConsentClient,
  createSmsConsentSubmission,
  type SmsConsentTransport,
  type SmsConsentWireRequest,
} from './client'
import {
  SMS_CONSENT_INTEGRATION_ENABLED,
  SMS_CONSENT_RECAPTCHA_ACTION,
} from './constants'
import {
  createRecaptchaEnterpriseTokenProvider,
  createRecaptchaSmsConsentClient,
  type RecaptchaEnterpriseApi,
  type RecaptchaTokenProvider,
} from './recaptcha'

const siteKey = 'synthetic-public-site-key'
const idempotencyKey = '11111111-1111-4111-8111-111111111111'
const logicalRequest = createSmsConsentSubmission('5555550123', true)
const receipt = {
  status: 'persisted' as const,
  evidenceId: 'sce_22222222-2222-4222-8222-222222222222',
  recordedAt: '2026-09-15T12:00:00.000Z',
  idempotencyKey,
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('reCAPTCHA Enterprise token provider', () => {
  it('waits for readiness and executes only the exact action', async () => {
    const events: string[] = []
    const api: RecaptchaEnterpriseApi = {
      ready(callback) {
        events.push('ready')
        callback()
      },
      execute: vi.fn(async (receivedSiteKey, options) => {
        events.push('execute')
        expect(receivedSiteKey).toBe(siteKey)
        expect(options).toEqual({ action: 'sms_consent_submit' })
        return 'attempt-local-token'
      }),
    }
    const loadApi = vi.fn(async () => {
      events.push('load')
      return api
    })
    const provider = createRecaptchaEnterpriseTokenProvider({
      siteKey,
      loadApi,
    })

    await expect(provider.getToken()).resolves.toBe('attempt-local-token')
    expect(SMS_CONSENT_RECAPTCHA_ACTION).toBe('sms_consent_submit')
    expect(events).toEqual(['load', 'ready', 'execute'])
  })

  it.each([
    ['script blocking', () => Promise.reject(new Error('blocked'))],
    [
      'script readiness failure',
      async () => ({
        ready() {
          throw new Error('not ready')
        },
        execute: vi.fn(),
      }),
    ],
    [
      'execution rejection',
      async () => ({
        ready(callback: () => void) {
          callback()
        },
        execute: vi
          .fn()
          .mockRejectedValue(new Error('provider rejected token')),
      }),
    ],
  ])(
    'sanitizes %s without logging provider details',
    async (_name, loadApi) => {
      const consoleError = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      const provider = createRecaptchaEnterpriseTokenProvider({
        siteKey,
        loadApi: loadApi as () => Promise<RecaptchaEnterpriseApi>,
      })

      const error = await provider.getToken().catch((caught: unknown) => caught)

      expect(error).toMatchObject({ code: 'captcha-unavailable' })
      expect(String(error)).toBe(
        'ConsentSubmissionError: Consent submission is temporarily unavailable.',
      )
      expect(consoleError).not.toHaveBeenCalled()
    },
  )

  it('fails safely when readiness never completes', async () => {
    vi.useFakeTimers()
    const execute = vi.fn()
    const provider = createRecaptchaEnterpriseTokenProvider({
      siteKey,
      readyTimeoutMs: 25,
      loadApi: async () => ({
        ready() {},
        execute,
      }),
    })

    const result = provider.getToken().catch((caught: unknown) => caught)
    await vi.advanceTimersByTimeAsync(25)

    await expect(result).resolves.toMatchObject({ code: 'captcha-unavailable' })
    expect(execute).not.toHaveBeenCalled()
  })

  it('aborts readiness and never executes a token after lifecycle invalidation', async () => {
    const execute = vi.fn()
    const controller = new AbortController()
    const provider = createRecaptchaEnterpriseTokenProvider({
      siteKey,
      loadApi: async () => ({
        ready() {},
        execute,
      }),
    })

    const result = provider
      .getToken(controller.signal)
      .catch((error: unknown) => error)
    controller.abort()

    await expect(result).resolves.toMatchObject({ code: 'captcha-unavailable' })
    expect(execute).not.toHaveBeenCalled()
  })

  it.each(['', ' whitespace ', 'token\0value'])(
    'rejects invalid site key or token material %s',
    async (value) => {
      if (value !== 'token\0value') {
        expect(() =>
          createRecaptchaEnterpriseTokenProvider({
            siteKey: value,
            loadApi: vi.fn(),
          }),
        ).toThrowError('Consent submission is temporarily unavailable.')
        return
      }

      const provider = createRecaptchaEnterpriseTokenProvider({
        siteKey,
        loadApi: async () => ({
          ready(callback) {
            callback()
          },
          execute: async () => value,
        }),
      })
      await expect(provider.getToken()).rejects.toMatchObject({
        code: 'captcha-unavailable',
      })
    },
  )
})

describe('token-to-transport boundary', () => {
  it('keeps the token out of logical state and adds it only to the wire request', async () => {
    const tokenProvider: RecaptchaTokenProvider = {
      getToken: vi.fn().mockResolvedValue('attempt-local-token'),
    }
    let receivedRequest: SmsConsentWireRequest | undefined
    const transport: SmsConsentTransport = {
      submit: vi.fn(async (request) => {
        receivedRequest = request
        return receipt
      }),
    }
    const client = createRecaptchaSmsConsentClient({ transport, tokenProvider })

    await expect(
      client.submit(logicalRequest, idempotencyKey),
    ).resolves.toEqual(receipt)

    expect(logicalRequest).not.toHaveProperty('recaptchaToken')
    expect(receivedRequest).toEqual({
      ...logicalRequest,
      recaptchaToken: 'attempt-local-token',
    })
  })

  it('makes no API request when token acquisition fails', async () => {
    const transport: SmsConsentTransport = { submit: vi.fn() }
    const tokenProvider: RecaptchaTokenProvider = {
      getToken: vi
        .fn()
        .mockRejectedValue(
          new Error('synthetic script failure containing private details'),
        ),
    }
    const client = createRecaptchaSmsConsentClient({ transport, tokenProvider })

    await expect(
      client.submit(logicalRequest, idempotencyKey),
    ).rejects.toMatchObject({ code: 'captcha-unavailable' })
    expect(transport.submit).not.toHaveBeenCalled()
  })

  it('propagates one lifecycle signal across token acquisition and transport', async () => {
    const tokenProvider: RecaptchaTokenProvider = {
      getToken: vi.fn().mockResolvedValue('attempt-local-token'),
    }
    const transport: SmsConsentTransport = {
      submit: vi.fn().mockResolvedValue(receipt),
    }
    const controller = new AbortController()
    const client = createRecaptchaSmsConsentClient({ transport, tokenProvider })

    await client.submit(logicalRequest, idempotencyKey, controller.signal)

    expect(tokenProvider.getToken).toHaveBeenCalledWith(controller.signal)
    expect(transport.submit).toHaveBeenCalledWith(
      { ...logicalRequest, recaptchaToken: 'attempt-local-token' },
      idempotencyKey,
      controller.signal,
    )
  })
})

describe('literal production-disable boundary', () => {
  it('cannot be enabled by public environment values', async () => {
    const originalApiBase = process.env.NEXT_PUBLIC_SMS_CONSENT_API_BASE_URL
    const originalSiteKey =
      process.env.NEXT_PUBLIC_SMS_CONSENT_RECAPTCHA_SITE_KEY
    process.env.NEXT_PUBLIC_SMS_CONSENT_API_BASE_URL =
      'https://api.invalid.example'
    process.env.NEXT_PUBLIC_SMS_CONSENT_RECAPTCHA_SITE_KEY = 'not-a-real-key'

    try {
      expect(SMS_CONSENT_INTEGRATION_ENABLED).toBe(false)
      expect(productionSmsConsentClient).toBe(disabledSmsConsentClient)
      await expect(
        productionSmsConsentClient.submit(logicalRequest, idempotencyKey),
      ).rejects.toMatchObject({ code: 'disabled' })
    } finally {
      if (originalApiBase === undefined) {
        delete process.env.NEXT_PUBLIC_SMS_CONSENT_API_BASE_URL
      } else {
        process.env.NEXT_PUBLIC_SMS_CONSENT_API_BASE_URL = originalApiBase
      }
      if (originalSiteKey === undefined) {
        delete process.env.NEXT_PUBLIC_SMS_CONSENT_RECAPTCHA_SITE_KEY
      } else {
        process.env.NEXT_PUBLIC_SMS_CONSENT_RECAPTCHA_SITE_KEY = originalSiteKey
      }
    }
  })
})
