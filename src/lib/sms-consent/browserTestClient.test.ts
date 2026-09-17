import { afterEach, describe, expect, it, vi } from 'vitest'
import { createLocalBrowserTestClient } from './browserTestClient'

describe('local browser-test adapter boundary', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('cannot be selected in a production build even when every public value is set', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('NEXT_PUBLIC_SMS_CONSENT_BROWSER_TEST_MODE', 'local-mock')
    vi.stubEnv('NEXT_PUBLIC_SMS_CONSENT_API_BASE_URL', 'https://api.invalid')
    vi.stubEnv(
      'NEXT_PUBLIC_SMS_CONSENT_RECAPTCHA_SITE_KEY',
      'synthetic-public-key',
    )

    expect(createLocalBrowserTestClient()).toBeNull()
  })

  it('cannot be selected by API or site-key values alone', () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('NEXT_PUBLIC_SMS_CONSENT_API_BASE_URL', 'https://api.invalid')
    vi.stubEnv(
      'NEXT_PUBLIC_SMS_CONSENT_RECAPTCHA_SITE_KEY',
      'synthetic-public-key',
    )
    vi.stubEnv('NEXT_PUBLIC_SMS_CONSENT_BROWSER_TEST_MODE', 'not-local-mock')

    expect(createLocalBrowserTestClient()).toBeNull()
  })
})
