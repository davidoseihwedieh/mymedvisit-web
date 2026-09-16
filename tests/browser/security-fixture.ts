import { expect, test as base, type Page, type Request } from '@playwright/test'

interface ExpectedRequestFailure {
  remaining: number
  url: string
}

interface ExpectedConsoleError {
  remaining: number
  url: string
}

export class BrowserSecurityMonitor {
  private readonly expectedRequestFailures: ExpectedRequestFailure[] = []
  private readonly expectedConsoleErrors: ExpectedConsoleError[] = []
  private readonly unexpectedFailures: string[] = []

  constructor(private readonly page: Page) {}

  async install(): Promise<void> {
    await this.page.addInitScript(() => {
      window.addEventListener('unhandledrejection', () => {
        console.error('MMV_BROWSER_UNHANDLED_REJECTION')
      })
    })

    this.page.on('console', (message) => {
      const text = message.text()
      if (/hydration/i.test(text)) {
        this.unexpectedFailures.push(
          `hydration console output at ${message.location().url || 'unknown location'}`,
        )
      } else if (
        message.type() === 'error' &&
        !this.consumeExpectedConsoleError(message.location().url)
      ) {
        this.unexpectedFailures.push(
          `console error at ${message.location().url || 'unknown location'}`,
        )
      }
    })
    this.page.on('pageerror', () => {
      this.unexpectedFailures.push('uncaught page error or rejected promise')
    })
    this.page.on('crash', () => {
      this.unexpectedFailures.push('page crash')
    })
    this.page.on('requestfailed', (request) => {
      if (!this.consumeExpectedRequestFailure(request)) {
        this.unexpectedFailures.push(
          `unexpected failed ${request.method()} request to ${safeRequestLabel(request.url())}`,
        )
      }
    })
  }

  expectRequestFailure(url: string): void {
    this.expectedRequestFailures.push({ remaining: 1, url })
  }

  allowConsoleErrorAt(url: string, count = 1): void {
    this.expectedConsoleErrors.push({ remaining: count, url })
  }

  assertClean(): void {
    expect(this.unexpectedFailures, 'browser runtime failures').toEqual([])
    expect(
      this.expectedRequestFailures.filter(({ remaining }) => remaining !== 0),
      'declared request-failure expectations must be exact and consumed',
    ).toEqual([])
  }

  private consumeExpectedRequestFailure(request: Request): boolean {
    const expected = this.expectedRequestFailures.find(
      (entry) =>
        entry.remaining > 0 &&
        exactOriginAndPath(entry.url) === exactOriginAndPath(request.url()),
    )
    if (!expected) {
      return false
    }
    expected.remaining -= 1
    return true
  }

  private consumeExpectedConsoleError(url: string): boolean {
    const expected = this.expectedConsoleErrors.find((entry) => {
      if (entry.remaining <= 0) {
        return false
      }
      if (entry.url === url) {
        return true
      }
      return (
        url === '' &&
        this.expectedRequestFailures.some(
          (failure) =>
            failure.remaining === 0 &&
            exactOriginAndPath(failure.url) === exactOriginAndPath(entry.url),
        )
      )
    })
    if (!expected) {
      return false
    }
    expected.remaining -= 1
    return true
  }
}

function exactOriginAndPath(url: string): string {
  const parsed = new URL(url)
  return `${parsed.origin}${parsed.pathname}`
}

function safeRequestLabel(url: string): string {
  try {
    const parsed = new URL(url)
    return `${parsed.origin}${parsed.pathname}`
  } catch {
    return 'an invalid URL'
  }
}

export const test = base.extend<{
  securityMonitor: BrowserSecurityMonitor
}>({
  securityMonitor: [
    async ({ page }, use) => {
      const monitor = new BrowserSecurityMonitor(page)
      await monitor.install()
      await use(monitor)
      monitor.assertClean()
    },
    { auto: true },
  ],
})

export { expect }
