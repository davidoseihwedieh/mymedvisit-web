import type { Page } from '@playwright/test'

/**
 * Link prefetch is unrelated to consent lifecycle behavior and its speculative
 * cancellation count varies with scheduler timing. Keep it from starting in
 * this dedicated lifecycle harness; all ordinary browser projects exercise the
 * unmodified IntersectionObserver and navigation behavior.
 */
export async function disableSpeculativeLinkPrefetch(
  page: Page,
): Promise<void> {
  await page.addInitScript(() => {
    class NoopIntersectionObserver implements IntersectionObserver {
      readonly root = null
      readonly rootMargin = '0px'
      readonly thresholds = [0]

      disconnect(): void {}
      observe(): void {}
      takeRecords(): IntersectionObserverEntry[] {
        return []
      }
      unobserve(): void {}
    }

    Object.defineProperty(window, 'IntersectionObserver', {
      configurable: true,
      value: NoopIntersectionObserver,
      writable: true,
    })
  })
}
