import { expect, test } from '@playwright/test'

declare global {
  interface Window {
    __mmvPersistedPageShows?: number
  }
}

test('observes a real persisted pageshow before accepting BFCache restoration', async ({
  page,
  context,
}) => {
  const runtimeFailures: string[] = []
  const notRestoredReasons: unknown[] = []
  const cdp = await context.newCDPSession(page)
  await cdp.send('Page.enable')
  cdp.on('Page.backForwardCacheNotUsed', (event) => {
    notRestoredReasons.push(event)
  })
  page.on('console', (message) => {
    if (message.type() === 'error' || /hydration/i.test(message.text())) {
      runtimeFailures.push(`console ${message.type()}`)
    }
  })
  page.on('pageerror', () => runtimeFailures.push('pageerror'))
  page.on('requestfailed', (request) => {
    const url = new URL(request.url())
    // Next's production Link prefetcher cancels these exact same-origin HEAD
    // probes during navigation. No other method, resource type, route, origin,
    // query, fragment, or failure reason is allowed through this exception.
    const expectedNextPrefetchCancellation =
      request.method() === 'HEAD' &&
      request.resourceType() === 'fetch' &&
      url.origin === 'http://127.0.0.1:4180' &&
      url.search === '' &&
      url.hash === '' &&
      new Set([
        '/',
        '/about',
        '/contact',
        '/how-it-works',
        '/privacy',
        '/technology',
        '/terms',
      ]).has(url.pathname) &&
      request.failure()?.errorText === 'net::ERR_ABORTED'
    if (expectedNextPrefetchCancellation) {
      return
    }
    runtimeFailures.push(
      `requestfailed ${request.method()} ${request.resourceType()} ${url.origin}${url.pathname} search=${JSON.stringify(url.search)} ${request.failure()?.errorText ?? 'unknown'}`,
    )
  })
  await page.addInitScript(() => {
    window.__mmvPersistedPageShows = 0
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        window.__mmvPersistedPageShows =
          (window.__mmvPersistedPageShows ?? 0) + 1
      }
    })
  })

  await page.goto('/sms-opt-in')
  await page.waitForLoadState('networkidle')
  await page
    .getByRole('textbox', { name: /mobile phone number/i })
    .fill('+12025550123')
  await page
    .getByRole('checkbox', {
      name: /i agree to receive the one-time verification-code/i,
    })
    .check()
  await page
    .getByRole('checkbox', {
      name: /i confirm that i am the subscriber/i,
    })
    .check()

  await page.goto('/terms')
  await page.evaluate(() => window.history.back())
  await expect.poll(() => page.url()).toBe('http://127.0.0.1:4180/sms-opt-in')
  await expect
    .poll(() => page.evaluate(() => window.__mmvPersistedPageShows))
    .toBe(1)

  expect(
    await page.evaluate(() => window.__mmvPersistedPageShows),
    `Chromium did not restore from BFCache: ${JSON.stringify(notRestoredReasons)}`,
  ).toBe(1)
  await expect(
    page.getByRole('textbox', { name: /mobile phone number/i }),
  ).toHaveValue('')
  await expect(
    page.getByRole('checkbox', {
      name: /i agree to receive the one-time verification-code/i,
    }),
  ).not.toBeChecked()
  await expect(
    page.getByRole('checkbox', {
      name: /i confirm that i am the subscriber/i,
    }),
  ).not.toBeChecked()
  await expect(
    page.getByRole('button', { name: /agree and continue/i }),
  ).toBeEnabled()
  expect(runtimeFailures).toEqual([])
})
