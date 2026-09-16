import {
  ConsentSubmissionError,
  isDurableSmsConsentReceipt,
  isLowercaseUuidV4,
  isSmsConsentErrorEnvelope,
  isSmsConsentWireRequest,
  type ConsentSubmissionFailureCode,
  type SmsConsentPublicErrorCode,
  type SmsConsentTransport,
} from './client'
import { SMS_CONSENT_ENDPOINT_PATH } from './constants'

interface HttpSmsConsentTransportOptions {
  /** Public API origin/base only. Never put a phone number or consent data here. */
  baseUrl: string
  fetcher?: typeof fetch
  timeoutMs?: number
}

/**
 * Disabled production transport implementation. This module is intentionally
 * excluded from every production compilation graph until integration approval.
 */
export function createHttpSmsConsentTransport({
  baseUrl,
  fetcher = fetch,
  timeoutMs = 10_000,
}: HttpSmsConsentTransportOptions): SmsConsentTransport {
  const endpoint = getSafeEndpoint(baseUrl, SMS_CONSENT_ENDPOINT_PATH)

  return {
    async submit(request, idempotencyKey, signal) {
      if (
        !isLowercaseUuidV4(idempotencyKey) ||
        !isSmsConsentWireRequest(request)
      ) {
        throw new ConsentSubmissionError(
          'invalid-configuration',
          'The consent request could not be prepared.',
        )
      }

      const controller = new AbortController()
      const abortFromLifecycle = () => controller.abort()
      if (signal?.aborted) {
        controller.abort()
      } else {
        signal?.addEventListener('abort', abortFromLifecycle, { once: true })
      }
      const timeout = setTimeout(() => controller.abort(), timeoutMs)

      try {
        let response: Response

        try {
          response = await fetcher(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Idempotency-Key': idempotencyKey,
            },
            body: JSON.stringify(request),
            cache: 'no-store',
            credentials: 'omit',
            mode: 'cors',
            redirect: 'error',
            referrerPolicy: 'no-referrer',
            signal: controller.signal,
          })
        } catch {
          throw new ConsentSubmissionError(
            'network',
            'The consent request could not be confirmed.',
          )
        }

        if (
          response.redirected ||
          response.type === 'opaqueredirect' ||
          !isJsonContentType(response.headers.get('Content-Type')) ||
          !hasNoStore(response.headers.get('Cache-Control'))
        ) {
          throw invalidResponse()
        }

        const body = await readJsonResponse(response)

        if (response.status === 200 || response.status === 201) {
          if (!isDurableSmsConsentReceipt(body, idempotencyKey)) {
            throw invalidResponse()
          }

          return body
        }

        if (!isSmsConsentErrorEnvelope(body, response.status)) {
          throw invalidResponse()
        }

        if (
          response.status === 503 &&
          response.headers.get('Retry-After') !== '5'
        ) {
          throw invalidResponse()
        }

        throw safeSubmissionError(body.error.code)
      } finally {
        clearTimeout(timeout)
        signal?.removeEventListener('abort', abortFromLifecycle)
      }
    },
  }
}

async function readJsonResponse(response: Response): Promise<unknown> {
  try {
    return await response.json()
  } catch {
    throw invalidResponse()
  }
}

function safeSubmissionError(
  publicCode: SmsConsentPublicErrorCode,
): ConsentSubmissionError {
  const safe: Record<
    SmsConsentPublicErrorCode,
    readonly [ConsentSubmissionFailureCode, number?]
  > = {
    invalid_request: ['invalid-request'],
    request_not_allowed: ['request-not-allowed'],
    bot_check_failed: ['bot-check-failed'],
    method_not_allowed: ['method-not-allowed'],
    idempotency_conflict: ['idempotency-conflict'],
    request_too_large: ['request-too-large'],
    unsupported_media_type: ['unsupported-media-type'],
    rate_limited: ['rate-limited'],
    internal_error: ['internal-error'],
    consent_capture_unavailable: ['unavailable', 5_000],
  }
  const [code, retryAfterMs] = safe[publicCode]

  return new ConsentSubmissionError(
    code,
    'The consent request could not be completed.',
    retryAfterMs,
  )
}

function invalidResponse(): ConsentSubmissionError {
  return new ConsentSubmissionError(
    'invalid-response',
    'The consent response could not be verified.',
  )
}

function getSafeEndpoint(baseUrl: string, endpointPath: `/${string}`): string {
  let base: URL

  try {
    base = new URL(baseUrl)
  } catch {
    throw new ConsentSubmissionError(
      'invalid-configuration',
      'The public consent API configuration is invalid.',
    )
  }

  if (
    base.protocol !== 'https:' ||
    base.username ||
    base.password ||
    base.pathname !== '/' ||
    base.search ||
    base.hash ||
    endpointPath.startsWith('//') ||
    endpointPath.includes('\\') ||
    endpointPath.includes('?') ||
    endpointPath.includes('#')
  ) {
    throw new ConsentSubmissionError(
      'invalid-configuration',
      'The public consent API configuration is invalid.',
    )
  }

  const endpoint = new URL(endpointPath, `${base.origin}/`)
  if (endpoint.origin !== base.origin || endpoint.search || endpoint.hash) {
    throw new ConsentSubmissionError(
      'invalid-configuration',
      'The public consent API configuration is invalid.',
    )
  }

  return endpoint.toString()
}

function isJsonContentType(value: string | null): boolean {
  if (value === null) {
    return false
  }

  const parts = value.split(';').map((part) => part.trim().toLowerCase())
  if (parts[0] !== 'application/json') {
    return false
  }

  return parts.slice(1).every((part) => part === 'charset=utf-8')
}

function hasNoStore(value: string | null): boolean {
  return (
    value
      ?.split(',')
      .map((directive) => directive.trim().toLowerCase())
      .includes('no-store') === true
  )
}
