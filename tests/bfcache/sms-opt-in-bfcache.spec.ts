import { expect, test } from '@playwright/test'
import { BrowserSecurityMonitor } from '../browser/security-fixture'
import { disableSpeculativeLinkPrefetch } from './browser-environment'

declare global {
  interface Window {
    __mmvPersistedPageShows?: number
  }
}

test('observes a real persisted pageshow before accepting BFCache restoration', async ({
  page,
  context,
}) => {
  const notRestoredReasons: unknown[] = []
  const monitor = new BrowserSecurityMonitor(page)
  await monitor.install()
  await disableSpeculativeLinkPrefetch(page)
  const cdp = await context.newCDPSession(page)
  await cdp.send('Page.enable')
  cdp.on('Page.backForwardCacheNotUsed', (event) => {
    notRestoredReasons.push(event)
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
  monitor.assertClean()
})
