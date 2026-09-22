export const SMS_OPT_IN_CANONICAL_URL = 'https://mymedvisit.app/sms-opt-in'

export const SMS_CONSENT_ENDPOINT_PATH = '/api/v1/sms-consent' as const

export const SMS_CONSENT_RECAPTCHA_ACTION = 'sms_consent_submit' as const

// These values must be replaced only after counsel/compliance approves the exact
// disclosure and policy text. They intentionally do not imply an approval date.
export const HUMAN_REVIEW_REQUIRED =
  'PENDING_LEGAL_AND_COMPLIANCE_REVIEW' as const

// The disclosure/checkbox/page copy was rewritten 2026-09-22 to correct Twilio
// toll-free verification rejection 30513 (explicit SMS-consent checkbox text,
// a separate number-control attestation, and the exact message categories
// submitted for verification). This exact wording was authored/approved
// directly by the founder as a product decision, matching the same pattern
// already used for `product-approved-2026-09-20` - see
// docs/compliance/sms-opt-in-product-approval-record.md. It is not an
// outside-counsel sign-off.
export const SMS_CONSENT_DISCLOSURE_VERSION =
  'product-approved-2026-09-22' as const
export const SMS_OPT_IN_PAGE_VERSION = 'product-approved-2026-09-22' as const

export const SMS_CONSENT_TERMS = {
  reference: 'https://mymedvisit.app/terms',
  version: HUMAN_REVIEW_REQUIRED,
} as const

export const SMS_CONSENT_PRIVACY = {
  reference: 'https://mymedvisit.app/privacy',
  version: HUMAN_REVIEW_REQUIRED,
} as const

export const TRANSACTIONAL_MESSAGE_CATEGORY_TAXONOMY = [
  'one_time_verification_codes',
  'account_security_messages',
  'requested_service_notifications',
] as const

export type TransactionalMessageCategory =
  (typeof TRANSACTIONAL_MESSAGE_CATEGORY_TAXONOMY)[number]

// Proposed initial scope only. It remains inactive and unapproved while the
// literal integration gate below is false.
export const TRANSACTIONAL_MESSAGE_CATEGORIES = [
  'one_time_verification_codes',
] as const satisfies readonly TransactionalMessageCategory[]

export const SMS_CONSENT_SOURCE = 'mymedvisit_web_sms_opt_in' as const

// This is deliberately a code-controlled safety switch. An environment variable
// alone must not connect the form before the remaining integration inputs are
// approved.
export const SMS_CONSENT_INTEGRATION_ENABLED = false as const

export const SMS_CONSENT_PUBLIC_API_BASE_URL_ENV =
  'NEXT_PUBLIC_SMS_CONSENT_API_BASE_URL' as const

export const SMS_CONSENT_RECAPTCHA_SITE_KEY_ENV =
  'NEXT_PUBLIC_SMS_CONSENT_RECAPTCHA_SITE_KEY' as const
