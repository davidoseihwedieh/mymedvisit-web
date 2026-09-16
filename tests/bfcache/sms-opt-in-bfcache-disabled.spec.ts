import { expect, test } from '@playwright/test'
import { BrowserSecurityMonitor } from '../browser/security-fixture'
import { disableSpeculativeLinkPrefetch } from './browser-environment'

declare global {
  interface Window {
    __mmvPersistedPageShows?: number
  }
}

test('negative control does not mislabel reload-style history as BFCache', async ({
  page,
  context,
}) => {
  const monitor = new BrowserSecurityMonitor(page)
  await monitor.install()
  await disableSpeculativeLinkPrefetch(page)
  const notRestoredReasons: unknown[] = []
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
  await page.goto('/terms')
  await page.evaluate(() => window.history.back())
  await expect.poll(() => page.url()).toBe('http://127.0.0.1:4180/sms-opt-in')
  await page.waitForTimeout(250)

  expect(await page.evaluate(() => window.__mmvPersistedPageShows)).toBe(0)
  expect(notRestoredReasons.length).toBeGreaterThan(0)
  monitor.assertClean()
})
