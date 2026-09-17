import { describe, expect, it, vi } from 'vitest'
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

const diagnosticCanaries = [
  '+12025550123',
  'token_secret_abc',
  'patient@example.test',
  'oncology follow-up',
  '%2B12025550123',
  'query-secret',
  'fragment-secret',
  '/patients/private-record',
]

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
    page.triggerUnhandledRejection(diagnosticCanaries.join(' '))
    expectRule(monitor, /BROWSER_UNHANDLED_REJECTION/)
  })

  it('fully redacts browser-provided diagnostics and sensitive locations', async () => {
    const { monitor, page } = await harness()
    page.failedRequest({
      failureReason: diagnosticCanaries.join('|'),
      url: `https://unknown.invalid/${diagnosticCanaries[7]}?value=${diagnosticCanaries[5]}#${diagnosticCanaries[6]}`,
    })
    page.emit(
      'console',
      consoleMessage(
        diagnosticCanaries.join(' '),
        `https://example.test/${diagnosticCanaries[0]}/${diagnosticCanaries[1]}`,
      ),
    )
    page.emit(
      'pageerror',
      new Error(`${diagnosticCanaries[2]} ${diagnosticCanaries[3]}`),
    )
    page.emit('crash', { reason: diagnosticCanaries[4] })
    page.emit(
      'console',
      consoleMessage('MMV_BROWSER_UNHANDLED_REJECTION', diagnosticCanaries[7]),
    )

    expectRedactedFailure(monitor)
  })

  it('redacts arbitrary values passed to the diagnostic error boundary', () => {
    const error = new BrowserSecurityError([
      `BROWSER_PAGE_ERROR [page] ${diagnosticCanaries.join(' ')}`,
    ])
    expect(error.message).toBe('BROWSER_DIAGNOSTIC_REDACTED [page]')
    assertNoCanaries(error.message)
  })

  it('writes only opt-in redacted request-failure metadata', async () => {
    const { page } = await harness()
    const previous = process.env.MMV_BROWSER_FAILURE_DIAGNOSTICS
    process.env.MMV_BROWSER_FAILURE_DIAGNOSTICS = '1'
    const write = vi
      .spyOn(process.stderr, 'write')
      .mockImplementation((() => true) as typeof process.stderr.write)
    try {
      page.failedRequest({
        failureReason: diagnosticCanaries.join('|'),
        url: `https://capture.invalid/assets/font.woff2?${diagnosticCanaries[5]}#${diagnosticCanaries[6]}`,
      })
      expect(write).toHaveBeenCalledOnce()
      const line = String(write.mock.calls[0][0])
      const record = JSON.parse(
        line.slice('MMV_BROWSER_FAILURE_DIAGNOSTIC '.length),
      ) as Record<string, unknown>
      expect(record).toMatchObject({
        method: 'POST',
        origin: 'https://capture.invalid',
        pathname: '/assets/font.woff2',
        queryPresent: true,
        fragmentPresent: true,
        resourceType: 'fetch',
        failureReason: 'OTHER_FAILURE',
        navigationRequest: false,
        currentPageRoute: 'UNAPPROVED_ROUTE',
        pageClosed: false,
      })
      assertNoCanaries(line)
    } finally {
      write.mockRestore()
      if (previous === undefined) {
        delete process.env.MMV_BROWSER_FAILURE_DIAGNOSTICS
      } else {
        process.env.MMV_BROWSER_FAILURE_DIAGNOSTICS = previous
      }
    }
  })

  it('does not write request-failure metadata unless explicitly enabled', async () => {
    const { page } = await harness()
    const previous = process.env.MMV_BROWSER_FAILURE_DIAGNOSTICS
    delete process.env.MMV_BROWSER_FAILURE_DIAGNOSTICS
    const write = vi
      .spyOn(process.stderr, 'write')
      .mockImplementation((() => true) as typeof process.stderr.write)
    try {
      page.failedRequest()
      expect(write).not.toHaveBeenCalled()
    } finally {
      write.mockRestore()
      if (previous !== undefined) {
        process.env.MMV_BROWSER_FAILURE_DIAGNOSTICS = previous
      }
    }
  })
})

class FakePage {
  private readonly listeners = new Map<string, Array<(value?: never) => void>>()
  private readonly initScripts: Array<() => void> = []

  async addInitScript(script: () => void): Promise<void> {
    this.initScripts.push(script)
  }

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
      isNavigationRequest: () => false,
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

  triggerUnhandledRejection(reason: unknown): void {
    const windowDescriptor = Object.getOwnPropertyDescriptor(
      globalThis,
      'window',
    )
    const originalConsoleError = console.error
    let rejectionHandler: ((event: { reason: unknown }) => void) | undefined
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        addEventListener: (
          name: string,
          listener: (event: { reason: unknown }) => void,
        ) => {
          if (name === 'unhandledrejection') rejectionHandler = listener
        },
      },
    })
    console.error = (...values: unknown[]) => {
      this.emit('console', consoleMessage(String(values[0] ?? ''), ''))
    }
    try {
      for (const script of this.initScripts) script()
      rejectionHandler?.({ reason })
    } finally {
      console.error = originalConsoleError
      if (windowDescriptor) {
        Object.defineProperty(globalThis, 'window', windowDescriptor)
      } else {
        Reflect.deleteProperty(globalThis, 'window')
      }
    }
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
    assertNoCanaries((error as Error).message)
  }
}

function expectRedactedFailure(monitor: BrowserSecurityMonitor): void {
  try {
    monitor.assertClean()
    throw new Error('expected monitor failure')
  } catch (error) {
    expect(error).toBeInstanceOf(BrowserSecurityError)
    const message = (error as Error).message
    expect(message.split('\n')).toEqual(
      expect.arrayContaining([
        'BROWSER_REQUEST_FAILURE [request]',
        'BROWSER_CONSOLE_ERROR [page]',
        'BROWSER_PAGE_ERROR [page]',
        'BROWSER_PAGE_CRASH [page]',
        'BROWSER_UNHANDLED_REJECTION [page]',
      ]),
    )
    expect(
      message
        .split('\n')
        .every((line) =>
          /^BROWSER_[A-Z_]+ \[(?:page|request|console)\]$/.test(line),
        ),
    ).toBe(true)
    assertNoCanaries(message)
  }
}

function assertNoCanaries(value: string): void {
  for (const canary of diagnosticCanaries) {
    expect(value).not.toContain(canary)
  }
}
