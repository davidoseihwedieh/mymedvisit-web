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
}) => {
  const monitor = new BrowserSecurityMonitor(page)
  await monitor.install()
  await disableSpeculativeLinkPrefetch(page)
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
      name: /i agree to receive one-time verification code text messages from mymedvisit/i,
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
    'BFCACHE_PERSISTED_EVENT_NOT_OBSERVED',
  ).toBe(1)
  await expect(
    page.getByRole('textbox', { name: /mobile phone number/i }),
  ).toHaveValue('')
  await expect(
    page.getByRole('checkbox', {
      name: /i agree to receive one-time verification code text messages from mymedvisit/i,
    }),
  ).not.toBeChecked()
  await expect(
    page.getByRole('checkbox', {
      name: /i confirm that i am the subscriber/i,
    }),
  ).not.toBeChecked()
  await expect(
    page.getByRole('button', { name: /verify my number/i }),
  ).toBeEnabled()
  monitor.assertClean()
})
