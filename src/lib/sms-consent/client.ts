import {
  SMS_CONSENT_DISCLOSURE_VERSION,
  SMS_CONSENT_ENDPOINT_PATH,
  SMS_CONSENT_INTEGRATION_ENABLED,
  SMS_CONSENT_PRIVACY,
  SMS_CONSENT_SOURCE,
  SMS_CONSENT_TERMS,
  SMS_OPT_IN_CANONICAL_URL,
  SMS_OPT_IN_PAGE_VERSION,
  TRANSACTIONAL_MESSAGE_CATEGORIES,
  type TransactionalMessageCategory,
} from './constants'

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const EVIDENCE_ID_PATTERN = new RegExp(`^sce_${UUID_V4_PATTERN.source.slice(1, -1)}$`)
const VERSION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/
const UTC_MILLISECOND_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

const EXACT_REQUEST_KEYS = [
  'phoneNumber',
  'disclosureVersion',
  'pageVersion',
  'pageUrl',
  'privacy',
  'source',
  'terms',
  'transactionalMessageCategories',
  'authorizedNumberAttestation',
  'recaptchaToken',
] as const

const EXACT_RECEIPT_KEYS = [
  'status',
  'evidenceId',
  'recordedAt',
  'idempotencyKey',
] as const

const KNOWN_CATEGORIES = new Set<TransactionalMessageCategory>(
  TRANSACTIONAL_MESSAGE_CATEGORIES,
)

export interface SmsConsentLogicalRequest {
  phoneNumber: string
  disclosureVersion: string
  pageVersion: string
  pageUrl: typeof SMS_OPT_IN_CANONICAL_URL
  privacy: {
    reference: typeof SMS_CONSENT_PRIVACY.reference
    version: string
  }
  source: typeof SMS_CONSENT_SOURCE
  terms: {
    reference: typeof SMS_CONSENT_TERMS.reference
    version: string
  }
  transactionalMessageCategories: readonly TransactionalMessageCategory[]
  authorizedNumberAttestation: true
}

/** The only request shape permitted at the HTTP boundary. */
export interface SmsConsentWireRequest extends SmsConsentLogicalRequest {
  recaptchaToken: string
}

// Retain the accepted component-facing name while distinguishing it from the
// ephemeral ten-field wire request.
export type SmsConsentSubmission = SmsConsentLogicalRequest

export interface DurableSmsConsentReceipt {
  status: 'persisted'
  evidenceId: string
  recordedAt: string
  idempotencyKey: string
}

/** High-level client used by the form after the token-provider boundary. */
export interface SmsConsentClient {
  submit(
    submission: SmsConsentLogicalRequest,
    idempotencyKey: string,
  ): Promise<DurableSmsConsentReceipt>
}

/** Low-level HTTP boundary. It accepts only the closed ten-field wire object. */
export interface SmsConsentTransport {
  submit(
    request: SmsConsentWireRequest,
    idempotencyKey: string,
  ): Promise<DurableSmsConsentReceipt>
}

export type ConsentSubmissionFailureCode =
  | 'disabled'
  | 'invalid-configuration'
  | 'captcha-unavailable'
  | 'network'
  | 'invalid-response'
  | 'invalid-request'
  | 'request-not-allowed'
  | 'bot-check-failed'
  | 'method-not-allowed'
  | 'idempotency-conflict'
  | 'request-too-large'
  | 'unsupported-media-type'
  | 'rate-limited'
  | 'internal-error'
  | 'unavailable'

export class ConsentSubmissionError extends Error {
  constructor(
    public readonly code: ConsentSubmissionFailureCode,
    message: string,
    public readonly retryAfterMs?: number,
  ) {
    super(message)
    this.name = 'ConsentSubmissionError'
  }
}

export function createSmsConsentSubmission(
  phoneNumber: string,
): SmsConsentLogicalRequest {
  return {
    phoneNumber,
    disclosureVersion: SMS_CONSENT_DISCLOSURE_VERSION,
    pageVersion: SMS_OPT_IN_PAGE_VERSION,
    pageUrl: SMS_OPT_IN_CANONICAL_URL,
    privacy: SMS_CONSENT_PRIVACY,
    source: SMS_CONSENT_SOURCE,
    terms: SMS_CONSENT_TERMS,
    transactionalMessageCategories: TRANSACTIONAL_MESSAGE_CATEGORIES,
    // Production submission remains disabled. Commit 4 will require this value
    // to come from its own affirmative, initially-unchecked control.
    authorizedNumberAttestation: true,
  }
}

export function createSmsConsentWireRequest(
  logicalRequest: SmsConsentLogicalRequest,
  recaptchaToken: string,
): SmsConsentWireRequest {
  const request: SmsConsentWireRequest = {
    ...logicalRequest,
    recaptchaToken,
  }

  if (!isSmsConsentWireRequest(request)) {
    throw new ConsentSubmissionError(
      'invalid-configuration',
      'The consent request could not be prepared.',
    )
  }

  return request
}

export function isSmsConsentWireRequest(
  value: unknown,
): value is SmsConsentWireRequest {
  try {
    if (!isPlainRecord(value) || !hasExactOwnKeys(value, EXACT_REQUEST_KEYS)) {
      return false
    }

    if (
      !isBoundedString(value.phoneNumber, 1, 64) ||
      hasNulOrControl(value.phoneNumber) ||
      !isVersion(value.disclosureVersion) ||
      !isVersion(value.pageVersion) ||
      value.pageUrl !== SMS_OPT_IN_CANONICAL_URL ||
      value.source !== SMS_CONSENT_SOURCE ||
      value.authorizedNumberAttestation !== true ||
      !isBoundedString(value.recaptchaToken, 1, 8192) ||
      value.recaptchaToken.includes('\0')
    ) {
      return false
    }

    if (
      !isVersionedReference(
        value.privacy,
        SMS_CONSENT_PRIVACY.reference,
      ) ||
      !isVersionedReference(value.terms, SMS_CONSENT_TERMS.reference)
    ) {
      return false
    }

    return isClosedCategoryArray(value.transactionalMessageCategories)
  } catch {
    // Exotic objects and hostile proxies are never accepted at this boundary.
    return false
  }
}

export function isLowercaseUuidV4(value: unknown): value is string {
  return typeof value === 'string' && UUID_V4_PATTERN.test(value)
}

export function isDurableSmsConsentReceipt(
  value: unknown,
  expectedIdempotencyKey: string,
): value is DurableSmsConsentReceipt {
  try {
    if (
      !isPlainRecord(value) ||
      !hasExactOwnKeys(value, EXACT_RECEIPT_KEYS) ||
      !isLowercaseUuidV4(expectedIdempotencyKey)
    ) {
      return false
    }

    return (
      value.status === 'persisted' &&
      typeof value.evidenceId === 'string' &&
      EVIDENCE_ID_PATTERN.test(value.evidenceId) &&
      typeof value.recordedAt === 'string' &&
      isUtcIsoTimestamp(value.recordedAt) &&
      value.idempotencyKey === expectedIdempotencyKey
    )
  } catch {
    return false
  }
}

export type SmsConsentPublicErrorCode =
  | 'invalid_request'
  | 'request_not_allowed'
  | 'bot_check_failed'
  | 'method_not_allowed'
  | 'idempotency_conflict'
  | 'request_too_large'
  | 'unsupported_media_type'
  | 'rate_limited'
  | 'internal_error'
  | 'consent_capture_unavailable'

interface SmsConsentErrorEnvelope {
  error: {
    code: SmsConsentPublicErrorCode
    message: 'Request could not be completed.'
  }
}

const ERROR_CODE_BY_STATUS: Readonly<Record<number, readonly SmsConsentPublicErrorCode[]>> = {
  400: ['invalid_request'],
  403: ['request_not_allowed', 'bot_check_failed'],
  405: ['method_not_allowed'],
  409: ['idempotency_conflict'],
  413: ['request_too_large'],
  415: ['unsupported_media_type'],
  429: ['rate_limited'],
  500: ['internal_error'],
  503: ['consent_capture_unavailable'],
}

export function isSmsConsentErrorEnvelope(
  value: unknown,
  status: number,
): value is SmsConsentErrorEnvelope {
  try {
    if (
      !isPlainRecord(value) ||
      !hasExactOwnKeys(value, ['error']) ||
      !isPlainRecord(value.error) ||
      !hasExactOwnKeys(value.error, ['code', 'message']) ||
      value.error.message !== 'Request could not be completed.' ||
      typeof value.error.code !== 'string'
    ) {
      return false
    }

    return ERROR_CODE_BY_STATUS[status]?.includes(
      value.error.code as SmsConsentPublicErrorCode,
    ) === true
  } catch {
    return false
  }
}

interface HttpSmsConsentTransportOptions {
  /** Public API origin/base only. Never put a phone number or consent data here. */
  baseUrl: string
  fetcher?: typeof fetch
  timeoutMs?: number
}

export function createHttpSmsConsentTransport({
  baseUrl,
  fetcher = fetch,
  timeoutMs = 10_000,
}: HttpSmsConsentTransportOptions): SmsConsentTransport {
  const endpoint = getSafeEndpoint(baseUrl, SMS_CONSENT_ENDPOINT_PATH)

  return {
    async submit(request, idempotencyKey) {
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
      }
    },
  }
}

export const disabledSmsConsentClient: SmsConsentClient = {
  async submit() {
    throw new ConsentSubmissionError(
      'disabled',
      'SMS consent submission is disabled until the remaining integration inputs are approved.',
    )
  },
}

// This literal false gate is the production safety boundary. Public environment
// values cannot construct a transport or connect the form while it remains false.
const approvedProductionClient: SmsConsentClient | null = null

export const productionSmsConsentClient: SmsConsentClient =
  SMS_CONSENT_INTEGRATION_ENABLED && approvedProductionClient
    ? approvedProductionClient
    : disabledSmsConsentClient

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

function isPlainRecord(value: unknown): value is Record<PropertyKey, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype
  )
}

function hasExactOwnKeys(
  value: Record<PropertyKey, unknown>,
  expectedKeys: readonly string[],
): boolean {
  const ownKeys = Reflect.ownKeys(value)

  return (
    ownKeys.length === expectedKeys.length &&
    expectedKeys.every((key) => Object.prototype.hasOwnProperty.call(value, key))
  )
}

function isVersionedReference(value: unknown, reference: string): boolean {
  return (
    isPlainRecord(value) &&
    hasExactOwnKeys(value, ['reference', 'version']) &&
    value.reference === reference &&
    isVersion(value.version)
  )
}

function isClosedCategoryArray(value: unknown): boolean {
  if (
    !Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Array.prototype ||
    value.length < 1 ||
    value.length > 3
  ) {
    return false
  }

  const expectedKeys = [...value.map((_, index) => String(index)), 'length']
  if (
    !hasExactOwnKeys(
      value as unknown as Record<PropertyKey, unknown>,
      expectedKeys,
    )
  ) {
    return false
  }

  const seen = new Set<string>()
  return value.every((category) => {
    if (
      typeof category !== 'string' ||
      !KNOWN_CATEGORIES.has(category as TransactionalMessageCategory) ||
      seen.has(category)
    ) {
      return false
    }
    seen.add(category)
    return true
  })
}

function isVersion(value: unknown): value is string {
  return typeof value === 'string' && VERSION_PATTERN.test(value)
}

function isBoundedString(
  value: unknown,
  minimum: number,
  maximum: number,
): value is string {
  return (
    typeof value === 'string' &&
    value.length >= minimum &&
    value.length <= maximum
  )
}

function hasNulOrControl(value: string): boolean {
  return /[\u0000-\u001f\u007f]/.test(value)
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

function isUtcIsoTimestamp(value: string): boolean {
  if (!UTC_MILLISECOND_PATTERN.test(value)) {
    return false
  }

  const timestamp = Date.parse(value)
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value
}
