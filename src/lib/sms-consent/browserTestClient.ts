import {
  ConsentSubmissionError,
  createHttpSmsConsentTransport,
  type SmsConsentClient,
} from './client'
import { SMS_CONSENT_RECAPTCHA_ACTION } from './constants'
import { createRecaptchaSmsConsentClient } from './recaptcha'

const LOCAL_CAPTURE_ORIGIN = 'https://capture.invalid'
const LOCAL_RECAPTCHA_URL = 'https://recaptcha.invalid/token'

/**
 * Local browser-test adapter only. It cannot be selected in a production build,
 * never loads Google, and uses reserved .invalid origins that tests intercept
 * before any network access.
 */
export function createLocalBrowserTestClient(): SmsConsentClient | null {
  if (
    process.env.NODE_ENV !== 'development' ||
    process.env.NEXT_PUBLIC_SMS_CONSENT_BROWSER_TEST_MODE !== 'local-mock' ||
    typeof window === 'undefined' ||
    !isLoopbackHostname(window.location.hostname)
  ) {
    return null
  }

  const transport = createHttpSmsConsentTransport({
    baseUrl: LOCAL_CAPTURE_ORIGIN,
  })

  return createRecaptchaSmsConsentClient({
    transport,
    tokenProvider: {
      async getToken() {
        let response: Response
        try {
          response = await fetch(LOCAL_RECAPTCHA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
            body: JSON.stringify({ action: SMS_CONSENT_RECAPTCHA_ACTION }),
            cache: 'no-store',
            credentials: 'omit',
            redirect: 'error',
            referrerPolicy: 'no-referrer',
          })
        } catch {
          throw unavailable()
        }

        if (
          response.status !== 200 ||
          response.redirected ||
          response.headers.get('Content-Type') !== 'application/json' ||
          response.headers.get('Cache-Control') !== 'no-store'
        ) {
          throw unavailable()
        }

        let body: unknown
        try {
          body = await response.json()
        } catch {
          throw unavailable()
        }

        if (
          !isPlainRecord(body) ||
          Reflect.ownKeys(body).length !== 1 ||
          !Object.prototype.hasOwnProperty.call(body, 'token') ||
          typeof body.token !== 'string'
        ) {
          throw unavailable()
        }

        return body.token
      },
    },
  })
}

function isLoopbackHostname(hostname: string): boolean {
  return (
    hostname === '127.0.0.1' || hostname === 'localhost' || hostname === '::1'
  )
}

function isPlainRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

function unavailable(): ConsentSubmissionError {
  return new ConsentSubmissionError(
    'captcha-unavailable',
    'Consent submission is temporarily unavailable.',
  )
}
