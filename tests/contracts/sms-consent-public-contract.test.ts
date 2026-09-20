import { describe, expect, it } from 'vitest'
import {
  createSmsConsentSubmission,
  createSmsConsentWireRequest,
} from '@/lib/sms-consent/client'
import {
  SMS_CONSENT_DISCLOSURE_VERSION,
  SMS_CONSENT_PRIVACY,
  SMS_CONSENT_TERMS,
  SMS_OPT_IN_PAGE_VERSION,
  SMS_OPT_IN_CANONICAL_URL,
  TRANSACTIONAL_MESSAGE_CATEGORIES,
} from '@/lib/sms-consent/constants'
// This import is intentionally resolved by vitest.cross-repo.config.ts to the
// checked-out backend service. It prevents a copied schema from drifting.
// @ts-expect-error The backend service is supplied by the cross-repo test config.
import { parsePublicConsentRequest } from '@sms-consent-backend/publicContract'

const legal = {
  schemaVersion: 'sms-consent-legal-v1',
  disclosureVersion: SMS_CONSENT_DISCLOSURE_VERSION,
  pageVersion: SMS_OPT_IN_PAGE_VERSION,
  termsVersion: SMS_CONSENT_TERMS.version,
  privacyVersion: SMS_CONSENT_PRIVACY.version,
  transactionalMessageCategories: [...TRANSACTIONAL_MESSAGE_CATEGORIES],
  digestSha256: '0'.repeat(64),
} as const

describe('website/backend SMS consent public contract', () => {
  it('accepts the website wire request with exactly the backend ten-field schema', () => {
    const logical = createSmsConsentSubmission('+12025550123', true)
    const wire = createSmsConsentWireRequest(logical, 'enterprise-token')

    expect(Reflect.ownKeys(wire)).toEqual([
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
    ])
    expect(wire).toEqual({
      phoneNumber: '+12025550123',
      disclosureVersion: SMS_CONSENT_DISCLOSURE_VERSION,
      pageVersion: SMS_OPT_IN_PAGE_VERSION,
      pageUrl: SMS_OPT_IN_CANONICAL_URL,
      privacy: SMS_CONSENT_PRIVACY,
      source: 'mymedvisit_web_sms_opt_in',
      terms: SMS_CONSENT_TERMS,
      transactionalMessageCategories: [...TRANSACTIONAL_MESSAGE_CATEGORIES],
      authorizedNumberAttestation: true,
      recaptchaToken: 'enterprise-token',
    })

    const parsed = parsePublicConsentRequest(wire, legal)
    expect(parsed).toMatchObject({ ...wire, canonicalE164: '+12025550123' })
  })

  it.each([
    [
      'missing recaptcha token',
      (value: Record<string, unknown>) => delete value.recaptchaToken,
    ],
    [
      'unexpected field',
      (value: Record<string, unknown>) => (value.extra = true),
    ],
    [
      'wrong attestation',
      (value: Record<string, unknown>) =>
        (value.authorizedNumberAttestation = false),
    ],
  ])('rejects a wire-shape mutation: %s', (_name, mutate) => {
    const wire = createSmsConsentWireRequest(
      createSmsConsentSubmission('+12025550123', true),
      'enterprise-token',
    )
    const value = { ...wire } as Record<string, unknown>
    mutate(value)
    expect(() => parsePublicConsentRequest(value, legal)).toThrow()
  })
})
