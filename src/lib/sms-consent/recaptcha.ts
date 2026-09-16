import {
  ConsentSubmissionError,
  createSmsConsentWireRequest,
  type SmsConsentClient,
  type SmsConsentLogicalRequest,
  type SmsConsentTransport,
} from './client'
import { SMS_CONSENT_RECAPTCHA_ACTION } from './constants'

const DEFAULT_READY_TIMEOUT_MS = 10_000

export interface RecaptchaTokenProvider {
  getToken(): Promise<string>
}

export interface RecaptchaEnterpriseApi {
  ready(callback: () => void): void
  execute(
    siteKey: string,
    options: { action: typeof SMS_CONSENT_RECAPTCHA_ACTION },
  ): Promise<string>
}

interface RecaptchaEnterpriseTokenProviderOptions {
  /** Public site key. No private provider credential belongs in the website. */
  siteKey: string
  /**
   * Loads the approved Enterprise browser API. Script origin selection remains
   * an explicit Privacy/Security gate and is deliberately outside this module.
   */
  loadApi: () => Promise<RecaptchaEnterpriseApi>
  readyTimeoutMs?: number
}

export function createRecaptchaEnterpriseTokenProvider({
  siteKey,
  loadApi,
  readyTimeoutMs = DEFAULT_READY_TIMEOUT_MS,
}: RecaptchaEnterpriseTokenProviderOptions): RecaptchaTokenProvider {
  if (!siteKey || siteKey.trim() !== siteKey || readyTimeoutMs <= 0) {
    throw new ConsentSubmissionError(
      'invalid-configuration',
      'Consent submission is temporarily unavailable.',
    )
  }

  return {
    async getToken() {
      try {
        const api = await loadApi()
        await waitUntilReady(api, readyTimeoutMs)
        const token = await api.execute(siteKey, {
          action: SMS_CONSENT_RECAPTCHA_ACTION,
        })

        if (
          typeof token !== 'string' ||
          token.length < 1 ||
          token.length > 8192 ||
          token.includes('\0')
        ) {
          throw new Error('invalid token')
        }

        return token
      } catch {
        throw captchaUnavailable()
      }
    },
  }
}

interface RecaptchaSmsConsentClientOptions {
  transport: SmsConsentTransport
  tokenProvider: RecaptchaTokenProvider
}

export function createRecaptchaSmsConsentClient({
  transport,
  tokenProvider,
}: RecaptchaSmsConsentClientOptions): SmsConsentClient {
  return {
    async submit(
      logicalRequest: SmsConsentLogicalRequest,
      idempotencyKey: string,
    ) {
      let attemptLocalToken: string | undefined

      try {
        try {
          attemptLocalToken = await tokenProvider.getToken()
        } catch {
          throw captchaUnavailable()
        }
        const wireRequest = createSmsConsentWireRequest(
          logicalRequest,
          attemptLocalToken,
        )
        return await transport.submit(wireRequest, idempotencyKey)
      } finally {
        // JavaScript strings cannot be zeroized. Dropping the only local
        // reference ensures retry state and component state never retain it.
        attemptLocalToken = undefined
      }
    },
  }
}

function waitUntilReady(
  api: RecaptchaEnterpriseApi,
  timeoutMs: number,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('reCAPTCHA readiness timed out')),
      timeoutMs,
    )

    try {
      api.ready(() => {
        clearTimeout(timeout)
        resolve()
      })
    } catch {
      clearTimeout(timeout)
      reject(new Error('reCAPTCHA readiness failed'))
    }
  })
}

function captchaUnavailable(): ConsentSubmissionError {
  return new ConsentSubmissionError(
    'captcha-unavailable',
    'Consent submission is temporarily unavailable.',
  )
}
