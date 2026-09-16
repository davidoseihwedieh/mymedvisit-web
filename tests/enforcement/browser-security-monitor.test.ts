import { describe, expect, it } from 'vitest'
import type { Page } from '@playwright/test'
import {
  BrowserSecurityError,
  BrowserSecurityMonitor,
  type RequestFailureAllowance,
} from '../browser/security-fixture'

const exactAllowance: RequestFailureAllowance = {
  id: 'capture-timeout',
  origin: 'https://capture.invalid',
  pathname: '/api/v1/sms-consent',
  query: '',
  fragment: '',
  method: 'POST',
  resourceType: 'fetch',
  failureReason: 'net::ERR_TIMED_OUT',
  consoleErrors: [
    {
      type: 'error',
      text: 'Failed to load resource: net::ERR_TIMED_OUT',
      locationUrl: 'https://capture.invalid/api/v1/sms-consent',
    },
  ],
}

describe('exact browser security monitor allowances', () => {
  it('consumes one exact request and its exact console allowance once', async () => {
    const { monitor, page } = await harness()
    monitor.expectRequestFailure(exactAllowance)
    page.failedRequest()
    page.consoleError()
    expect(() => monitor.assertClean()).not.toThrow()
  })

  it.each([
    ['wrong method', { method: 'GET' }],
    ['query', { url: 'https://capture.invalid/api/v1/sms-consent?phone=x' }],
    ['fragment', { url: 'https://capture.invalid/api/v1/sms-consent#token' }],
    ['wrong resource type', { resourceType: 'xhr' }],
    ['wrong failure reason', { failureReason: 'net::ERR_FAILED' }],
  ])('rejects %s', async (_label, override) => {
    const { monitor, page } = await harness()
    monitor.expectRequestFailure({ ...exactAllowance, consoleErrors: [] })
    page.failedRequest(override)
    expectRule(
      monitor,
      /BROWSER_(?:REQUEST_FAILURE|ENDPOINT_QUERY_OR_FRAGMENT)/,
    )
  })

  it('rejects an extra otherwise identical failure', async () => {
    const { monitor, page } = await harness()
    monitor.expectRequestFailure({ ...exactAllowance, consoleErrors: [] })
    page.failedRequest()
    page.failedRequest()
    expectRule(monitor, /BROWSER_REQUEST_FAILURE/)
  })

  it('rejects a declared request failure that never occurs', async () => {
    const { monitor } = await harness()
    monitor.expectRequestFailure({ ...exactAllowance, consoleErrors: [] })
    expectRule(monitor, /BROWSER_REQUEST_ALLOWANCE_UNUSED/)
  })

  it('rejects an exact console allowance that is not consumed', async () => {
    const { monitor, page } = await harness()
    monitor.expectRequestFailure(exactAllowance)
    page.failedRequest()
    expectRule(monitor, /BROWSER_CONSOLE_ALLOWANCE_UNUSED/)
  })

  it('does not let one failure consume a second allowance', async () => {
    const { monitor, page } = await harness()
    monitor.expectRequestFailure({ ...exactAllowance, consoleErrors: [] })
    monitor.expectRequestFailure({
      ...exactAllowance,
      id: 'second',
      consoleErrors: [],
    })
    page.failedRequest()
    expectRule(monitor, /BROWSER_REQUEST_ALLOWANCE_UNUSED/)
  })

  it('rejects page crashes', async () => {
    const { monitor, page } = await harness()
    page.emit('crash')
    expectRule(monitor, /BROWSER_PAGE_CRASH/)
  })

  it('rejects unhandled rejections', async () => {
    const { monitor, page } = await harness()
    page.emit('console', consoleMessage('MMV_BROWSER_UNHANDLED_REJECTION', ''))
    expectRule(monitor, /BROWSER_UNHANDLED_REJECTION/)
  })
})

class FakePage {
  private readonly listeners = new Map<string, Array<(value?: never) => void>>()

  async addInitScript(): Promise<void> {}

  on(name: string, listener: (value?: never) => void): this {
    const listeners = this.listeners.get(name) ?? []
    listeners.push(listener)
    this.listeners.set(name, listeners)
    return this
  }

  emit(name: string, value?: unknown): void {
    for (const listener of this.listeners.get(name) ?? []) {
      listener(value as never)
    }
  }

  failedRequest(
    override: {
      failureReason?: string
      method?: string
      resourceType?: string
      url?: string
    } = {},
  ): void {
    const request = {
      failure: () => ({
        errorText: override.failureReason ?? exactAllowance.failureReason,
      }),
      method: () => override.method ?? exactAllowance.method,
      resourceType: () => override.resourceType ?? exactAllowance.resourceType,
      url: () =>
        override.url ?? `${exactAllowance.origin}${exactAllowance.pathname}`,
    }
    this.emit('request', request)
    this.emit('requestfailed', request)
  }

  consoleError(): void {
    this.emit(
      'console',
      consoleMessage(
        exactAllowance.consoleErrors?.[0].text ?? '',
        exactAllowance.consoleErrors?.[0].locationUrl ?? '',
      ),
    )
  }
}

function consoleMessage(text: string, locationUrl: string) {
  return {
    location: () => ({ url: locationUrl }),
    text: () => text,
    type: () => 'error',
  }
}

async function harness(): Promise<{
  monitor: BrowserSecurityMonitor
  page: FakePage
}> {
  const page = new FakePage()
  const monitor = new BrowserSecurityMonitor(page as unknown as Page)
  await monitor.install()
  return { monitor, page }
}

function expectRule(monitor: BrowserSecurityMonitor, rule: RegExp): void {
  try {
    monitor.assertClean()
    throw new Error('expected monitor failure')
  } catch (error) {
    expect(error).toBeInstanceOf(BrowserSecurityError)
    expect((error as Error).message).toMatch(rule)
    expect((error as Error).message).not.toContain('https://')
    expect((error as Error).message).not.toContain('phone=x')
    expect((error as Error).message).not.toContain('#token')
  }
}
