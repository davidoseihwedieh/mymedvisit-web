import { test as base, type Page, type Request } from '@playwright/test'

export interface ConsoleAllowance {
  locationUrl: string
  text: string
  type: 'error'
}

export interface RequestFailureAllowance {
  id: string
  origin: string
  pathname: string
  query: ''
  fragment: ''
  method: string
  resourceType: string
  failureReason: string
  consoleErrors?: readonly ConsoleAllowance[]
}

interface TrackedRequestFailure extends RequestFailureAllowance {
  consumed: boolean
}

interface TrackedConsoleError extends ConsoleAllowance {
  consumed: boolean
  requestAllowanceId: string
}

interface ProtectedEndpoint {
  origin: string
  pathname: string
}

const defaultProtectedEndpoints: readonly ProtectedEndpoint[] = [
  { origin: 'https://capture.invalid', pathname: '/api/v1/sms-consent' },
  { origin: 'https://recaptcha.invalid', pathname: '/token' },
]

export class BrowserSecurityError extends Error {
  constructor(readonly rules: readonly string[]) {
    super(rules.join('\n'))
    this.name = 'BrowserSecurityError'
  }
}

export class BrowserSecurityMonitor {
  private readonly expectedRequestFailures: TrackedRequestFailure[] = []
  private readonly expectedConsoleErrors: TrackedConsoleError[] = []
  private readonly violations: string[] = []

  constructor(
    private readonly page: Page,
    private readonly protectedEndpoints = defaultProtectedEndpoints,
  ) {}

  async install(): Promise<void> {
    await this.page.addInitScript(() => {
      window.addEventListener('unhandledrejection', () => {
        console.error('MMV_BROWSER_UNHANDLED_REJECTION')
      })
    })

    this.page.on('request', (request) => this.inspectRequest(request))
    this.page.on('console', (message) => {
      const text = message.text()
      if (text === 'MMV_BROWSER_UNHANDLED_REJECTION') {
        this.violations.push('BROWSER_UNHANDLED_REJECTION [page]')
      } else if (/hydration/i.test(text)) {
        this.violations.push('BROWSER_HYDRATION_CONSOLE [page]')
      } else if (
        message.type() === 'error' &&
        !this.consumeExpectedConsoleError({
          locationUrl: message.location().url,
          text,
          type: 'error',
        })
      ) {
        this.violations.push(
          `BROWSER_CONSOLE_ERROR ${safePath(message.location().url)}`,
        )
      }
    })
    this.page.on('pageerror', () => {
      this.violations.push('BROWSER_PAGE_ERROR [page]')
    })
    this.page.on('crash', () => {
      this.violations.push('BROWSER_PAGE_CRASH [page]')
    })
    this.page.on('requestfailed', (request) => {
      if (!this.consumeExpectedRequestFailure(request)) {
        this.violations.push(
          `BROWSER_REQUEST_FAILURE ${safePath(request.url())}`,
        )
      }
    })
  }

  expectRequestFailure(allowance: RequestFailureAllowance): void {
    if (
      !allowance.id ||
      allowance.query !== '' ||
      allowance.fragment !== '' ||
      this.expectedRequestFailures.some(({ id }) => id === allowance.id)
    ) {
      throw new BrowserSecurityError(['BROWSER_ALLOWANCE_INVALID [request]'])
    }
    this.expectedRequestFailures.push({ ...allowance, consumed: false })
    for (const consoleError of allowance.consoleErrors ?? []) {
      this.expectedConsoleErrors.push({
        ...consoleError,
        consumed: false,
        requestAllowanceId: allowance.id,
      })
    }
  }

  assertClean(): void {
    const rules = [...this.violations]
    for (const request of this.expectedRequestFailures) {
      if (!request.consumed) {
        rules.push('BROWSER_REQUEST_ALLOWANCE_UNUSED [request]')
      }
    }
    for (const consoleError of this.expectedConsoleErrors) {
      if (!consoleError.consumed) {
        rules.push('BROWSER_CONSOLE_ALLOWANCE_UNUSED [console]')
      }
    }
    if (rules.length > 0) {
      throw new BrowserSecurityError(rules)
    }
  }

  private inspectRequest(request: Request): void {
    let url
    try {
      url = new URL(request.url())
    } catch {
      this.violations.push('BROWSER_REQUEST_URL_INVALID [request]')
      return
    }
    if (
      this.protectedEndpoints.some(
        ({ origin, pathname }) =>
          url.origin === origin && url.pathname === pathname,
      ) &&
      (url.search !== '' || url.hash !== '')
    ) {
      this.violations.push(`BROWSER_ENDPOINT_QUERY_OR_FRAGMENT ${url.pathname}`)
    }
  }

  private consumeExpectedRequestFailure(request: Request): boolean {
    let url
    try {
      url = new URL(request.url())
    } catch {
      return false
    }
    const failureReason = request.failure()?.errorText ?? ''
    const candidates = this.expectedRequestFailures.filter(
      (entry) =>
        !entry.consumed &&
        entry.origin === url.origin &&
        entry.pathname === url.pathname &&
        entry.query === url.search &&
        entry.fragment === url.hash &&
        entry.method === request.method() &&
        entry.resourceType === request.resourceType() &&
        entry.failureReason === failureReason,
    )
    if (candidates.length === 0) return false
    candidates[0].consumed = true
    return true
  }

  private consumeExpectedConsoleError(actual: ConsoleAllowance): boolean {
    const candidates = this.expectedConsoleErrors.filter((entry) => {
      const request = this.expectedRequestFailures.find(
        ({ id }) => id === entry.requestAllowanceId,
      )
      return (
        !entry.consumed &&
        request?.consumed === true &&
        entry.type === actual.type &&
        entry.text === actual.text &&
        entry.locationUrl === actual.locationUrl
      )
    })
    if (candidates.length !== 1) return false
    candidates[0].consumed = true
    return true
  }
}

function safePath(value: string): string {
  try {
    return new URL(value).pathname || '[page]'
  } catch {
    return '[page]'
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

export { expect } from '@playwright/test'
