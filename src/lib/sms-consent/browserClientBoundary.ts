import type { SmsConsentClient } from './client'

/**
 * Production boundary. A development-only Webpack alias replaces this module
 * for local intercepted browser tests; production always returns null.
 */
export function createBrowserInjectedSmsConsentClient(): SmsConsentClient | null {
  return null
}
