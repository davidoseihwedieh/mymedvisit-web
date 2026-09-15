import {
  SMS_CONSENT_DISCLOSURE_VERSION,
  SMS_CONSENT_INTEGRATION_ENABLED,
  SMS_CONSENT_PRIVACY,
  SMS_CONSENT_SOURCE,
  SMS_CONSENT_TERMS,
  SMS_OPT_IN_CANONICAL_URL,
  SMS_OPT_IN_PAGE_VERSION,
  TRANSACTIONAL_MESSAGE_CATEGORIES,
} from './constants'

export interface SmsConsentSubmission {
  phoneNumber: string
  disclosureVersion: string
  pageVersion: string
  pageUrl: typeof SMS_OPT_IN_CANONICAL_URL
  privacy: {
    reference: string
    version: string
  }
  source: typeof SMS_CONSENT_SOURCE
  terms: {
    reference: string
    version: string
  }
  transactionalMessageCategories: readonly string[]
}

export interface DurableSmsConsentReceipt {
  status: 'persisted'
  recordId: string
  persistedAt: string
  idempotencyKey: string
}

export interface SmsConsentClient {
  submit(
    submission: SmsConsentSubmission,
    idempotencyKey: string,
  ): Promise<DurableSmsConsentReceipt>
}

export type ConsentSubmissionFailureCode =
  | 'disabled'
  | 'invalid-configuration'
  | 'network'
  | 'rejected'
  | 'invalid-response'

export class ConsentSubmissionError extends Error {
  constructor(
    public readonly code: ConsentSubmissionFailureCode,
    message: string,
  ) {
    super(message)
    this.name = 'ConsentSubmissionError'
  }
}

export function createSmsConsentSubmission(phoneNumber: string): SmsConsentSubmission {
  return {
    phoneNumber,
    disclosureVersion: SMS_CONSENT_DISCLOSURE_VERSION,
    pageVersion: SMS_OPT_IN_PAGE_VERSION,
    pageUrl: SMS_OPT_IN_CANONICAL_URL,
    privacy: SMS_CONSENT_PRIVACY,
    source: SMS_CONSENT_SOURCE,
    terms: SMS_CONSENT_TERMS,
    transactionalMessageCategories: TRANSACTIONAL_MESSAGE_CATEGORIES,
  }
}

export function isDurableSmsConsentReceipt(
  value: unknown,
  expectedIdempotencyKey?: string,
): value is DurableSmsConsentReceipt {
  if (!isRecord(value)) {
    return false
  }

  if (
    value.status !== 'persisted' ||
    !isNonEmptyString(value.recordId) ||
    !isNonEmptyString(value.persistedAt) ||
    !isUtcIsoTimestamp(value.persistedAt) ||
    !isNonEmptyString(value.idempotencyKey)
  ) {
    return false
  }

  return expectedIdempotencyKey === undefined || value.idempotencyKey === expectedIdempotencyKey
}

interface HttpSmsConsentClientOptions {
  /** Public API origin/base only. Never put a phone number or consent data here. */
  baseUrl: string
  /** Contract-approved POST path, supplied by the integration layer. */
  endpointPath: `/${string}`
  fetcher?: typeof fetch
  timeoutMs?: number
}

export function createHttpSmsConsentClient({
  baseUrl,
  endpointPath,
  fetcher = fetch,
  timeoutMs = 10_000,
}: HttpSmsConsentClientOptions): SmsConsentClient {
  const endpoint = getSafeEndpoint(baseUrl, endpointPath)

  return {
    async submit(submission, idempotencyKey) {
      if (!isNonEmptyString(idempotencyKey)) {
        throw new ConsentSubmissionError(
          'invalid-configuration',
          'A non-empty idempotency key is required.',
        )
      }

      const controller = new AbortController()
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
            body: JSON.stringify(submission),
            cache: 'no-store',
            credentials: 'omit',
            mode: 'cors',
            redirect: 'error',
            referrerPolicy: 'no-referrer',
            signal: controller.signal,
          })
        } catch {
          // A timeout or other network error is ambiguous. It is never success;
          // callers may retry the same submission with the same idempotency key.
          throw new ConsentSubmissionError(
            'network',
            'The consent request could not be confirmed.',
          )
        }

        if (!response.ok) {
          throw new ConsentSubmissionError(
            'rejected',
            'The consent request was not accepted.',
          )
        }

        let body: unknown
        try {
          body = await response.json()
        } catch {
          throw new ConsentSubmissionError(
            'invalid-response',
            'The consent response could not be verified.',
          )
        }

        if (!isDurableSmsConsentReceipt(body, idempotencyKey)) {
          throw new ConsentSubmissionError(
            'invalid-response',
            'The consent response did not confirm durable persistence.',
          )
        }

        return body
      } finally {
        clearTimeout(timeout)
      }
    },
  }
}

export const disabledSmsConsentClient: SmsConsentClient = {
  async submit() {
    throw new ConsentSubmissionError(
      'disabled',
      'SMS consent submission is disabled until the endpoint contract is approved.',
    )
  },
}

// This is the only client used by the production component. Supplying public
// configuration cannot connect the form by accident: an approved client and
// the separately reviewed safety switch are both required.
const approvedProductionClient: SmsConsentClient | null = null

export const productionSmsConsentClient: SmsConsentClient =
  SMS_CONSENT_INTEGRATION_ENABLED && approvedProductionClient
    ? approvedProductionClient
    : disabledSmsConsentClient

function getSafeEndpoint(baseUrl: string, endpointPath: `/${string}`): string {
  let base: URL

  try {
    base = new URL(baseUrl)
  } catch {
    throw new ConsentSubmissionError(
      'invalid-configuration',
      'The public consent API base URL is invalid.',
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
      'The public consent API endpoint is not safe to use.',
    )
  }

  const endpoint = new URL(endpointPath, `${base.origin}/`)
  if (endpoint.origin !== base.origin) {
    throw new ConsentSubmissionError(
      'invalid-configuration',
      'The consent API endpoint must use the configured public origin.',
    )
  }

  return endpoint.toString()
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isUtcIsoTimestamp(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)) {
    return false
  }

  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp)
}
