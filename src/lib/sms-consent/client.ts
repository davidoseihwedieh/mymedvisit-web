import {
  SMS_CONSENT_DISCLOSURE_VERSION,
  SMS_CONSENT_INTEGRATION_ENABLED,
  SMS_CONSENT_PRIVACY,
  SMS_CONSENT_SOURCE,
  SMS_CONSENT_TERMS,
  SMS_OPT_IN_CANONICAL_URL,
  SMS_OPT_IN_PAGE_VERSION,
  TRANSACTIONAL_MESSAGE_CATEGORY_TAXONOMY,
  TRANSACTIONAL_MESSAGE_CATEGORIES,
  type TransactionalMessageCategory,
} from './constants'
import { createHttpSmsConsentTransport } from './httpTransport'
import {
  createRecaptchaSmsConsentClient,
  createRecaptchaEnterpriseTokenProvider,
  type RecaptchaEnterpriseApi,
} from './recaptcha'

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const EVIDENCE_ID_PATTERN = new RegExp(
  `^sce_${UUID_V4_PATTERN.source.slice(1, -1)}$`,
)
const VERSION_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/
const UTC_MILLISECOND_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

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
  TRANSACTIONAL_MESSAGE_CATEGORY_TAXONOMY,
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
    signal?: AbortSignal,
  ): Promise<DurableSmsConsentReceipt>
}

/** Low-level HTTP boundary. It accepts only the closed ten-field wire object. */
export interface SmsConsentTransport {
  submit(
    request: SmsConsentWireRequest,
    idempotencyKey: string,
    signal?: AbortSignal,
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
  authorizedNumberAttestation: true,
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
    authorizedNumberAttestation,
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
      !isVersionedReference(value.privacy, SMS_CONSENT_PRIVACY.reference) ||
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

const ERROR_CODE_BY_STATUS: Readonly<
  Record<number, readonly SmsConsentPublicErrorCode[]>
> = {
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

    return (
      ERROR_CODE_BY_STATUS[status]?.includes(
        value.error.code as SmsConsentPublicErrorCode,
      ) === true
    )
  } catch {
    return false
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

// This literal false gate is the production safety boundary. The production
// wiring is complete so that a separately reviewed change can flip the gate;
// environment values cannot construct a transport while it remains false.
const approvedProductionClient: SmsConsentClient | null =
  SMS_CONSENT_INTEGRATION_ENABLED
    ? createRecaptchaSmsConsentClient({
        transport: createHttpSmsConsentTransport({
          baseUrl: requirePublicApiBaseUrl(),
        }),
        tokenProvider: {
          getToken: async (signal) => {
            const siteKey = requireRecaptchaSiteKey()
            return createRecaptchaEnterpriseTokenProvider({
              siteKey,
              loadApi: loadRecaptchaEnterpriseApi,
            }).getToken(signal)
          },
        },
      })
    : null

export const productionSmsConsentClient: SmsConsentClient =
  SMS_CONSENT_INTEGRATION_ENABLED && approvedProductionClient
    ? approvedProductionClient
    : disabledSmsConsentClient

function requirePublicApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_SMS_CONSENT_API_BASE_URL
  if (!value) {
    throw new ConsentSubmissionError(
      'invalid-configuration',
      'The consent API configuration is invalid.',
    )
  }
  return value
}

function requireRecaptchaSiteKey(): string {
  const value = process.env.NEXT_PUBLIC_SMS_CONSENT_RECAPTCHA_SITE_KEY
  if (!value) {
    throw new ConsentSubmissionError(
      'invalid-configuration',
      'The reCAPTCHA configuration is invalid.',
    )
  }
  return value
}

let recaptchaApiPromise: Promise<RecaptchaEnterpriseApi> | undefined

function loadRecaptchaEnterpriseApi(): Promise<RecaptchaEnterpriseApi> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('reCAPTCHA is only available in a browser'))
  }
  if (recaptchaApiPromise) return recaptchaApiPromise

  recaptchaApiPromise = new Promise<RecaptchaEnterpriseApi>(
    (resolve, reject) => {
      const existing = (
        window as Window & {
          grecaptcha?: { enterprise?: RecaptchaEnterpriseApi }
        }
      ).grecaptcha?.enterprise
      if (existing) {
        resolve(existing)
        return
      }
      const script = document.createElement('script')
      script.src =
        'https://www.google.com/recaptcha/enterprise.js?render=explicit'
      script.async = true
      script.onload = () => {
        const api = (
          window as Window & {
            grecaptcha?: { enterprise?: RecaptchaEnterpriseApi }
          }
        ).grecaptcha?.enterprise
        api ? resolve(api) : reject(new Error('reCAPTCHA API unavailable'))
      }
      script.onerror = () =>
        reject(new Error('reCAPTCHA script failed to load'))
      document.head.appendChild(script)
    },
  )
  return recaptchaApiPromise
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
    expectedKeys.every((key) =>
      Object.prototype.hasOwnProperty.call(value, key),
    )
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

function isUtcIsoTimestamp(value: string): boolean {
  if (!UTC_MILLISECOND_PATTERN.test(value)) {
    return false
  }

  const timestamp = Date.parse(value)
  return (
    Number.isFinite(timestamp) && new Date(timestamp).toISOString() === value
  )
}
