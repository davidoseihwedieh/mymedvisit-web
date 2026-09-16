import { expect, test, type Page, type Route } from '@playwright/test'

const phoneNumber = '+12025550123'
const recaptchaOrigin = 'https://recaptcha.invalid'
const captureOrigin = 'https://capture.invalid'
const localOrigin = 'http://127.0.0.1:4173'

interface CapturedRequest {
  method: string
  url: string
  headers: Record<string, string>
  body: Record<string, unknown> | null
}

interface MockState {
  recaptchaRequests: CapturedRequest[]
  captureRequests: CapturedRequest[]
  preflights: CapturedRequest[]
  tokenCount: number
}

interface MockOptions {
  tokenFailure?: 'script-blocked' | 'execution-rejection' | 'invalid-response'
  tokenDelayMs?: number
  captureAttempt?: (
    route: Route,
    request: CapturedRequest,
    attemptNumber: number,
  ) => Promise<boolean>
}

test('pre-hydration and no-JavaScript markup is inert', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: localOrigin,
  })
  const page = await context.newPage()
  await installNoLiveNetworkGuard(page)

  await page.goto('/sms-opt-in')

  await expect(page.locator('#sms-form-unavailable')).toContainText(
    'No consent has been sent or recorded.',
  )
  for (const selector of [
    '#sms-phone',
    '#sms-consent',
    '#authorized-number-attestation',
    'button[type="submit"]',
  ]) {
    await expect(page.locator(selector)).toBeDisabled()
  }
  await expect(page.locator('#sms-phone')).not.toHaveAttribute('name')
  await expect(page.locator('#sms-consent')).not.toHaveAttribute('name')
  await expect(
    page.locator('#authorized-number-attestation'),
  ).not.toHaveAttribute('name')
  expect(page.url()).toBe(`${localOrigin}/sms-opt-in`)
  await context.close()
})

test('hydrates with two unchecked controls and enforces focus order', async ({
  page,
}) => {
  await installSyntheticBoundaries(page)
  await page.goto('/sms-opt-in')

  const phone = page.getByRole('textbox', { name: /mobile phone number/i })
  const consent = page.getByRole('checkbox', {
    name: /i agree to receive the one-time verification-code/i,
  })
  const attestation = page.getByRole('checkbox', {
    name: /i confirm that i am the subscriber/i,
  })
  const submit = page.getByRole('button', { name: /agree and continue/i })

  await expect(consent).not.toBeChecked()
  await expect(attestation).not.toBeChecked()
  await submit.click()
  await expect(phone).toBeFocused()
  await expect(page.getByRole('main').getByRole('alert')).toContainText(
    'highlighted fields',
  )

  await phone.fill(phoneNumber)
  await submit.click()
  await expect(consent).toBeFocused()
  await expect(consent).toHaveAttribute('aria-invalid', 'true')

  await consent.check()
  await submit.click()
  await expect(attestation).toBeFocused()
  await expect(attestation).toHaveAttribute('aria-invalid', 'true')
  await expect(attestation).toHaveAccessibleDescription(
    /does not verify ownership/i,
  )
})

test('accepts mocked 201 persistence with exact CORS and no privacy leakage', async ({
  page,
  context,
}) => {
  const consoleMessages: string[] = []
  page.on('console', (message) => consoleMessages.push(message.text()))
  const state = await installSyntheticBoundaries(page)
  await page.goto('/sms-opt-in')
  await completeForm(page)

  await page.getByRole('button', { name: /agree and continue/i }).click()
  await expect(page.getByText('Your SMS consent was saved.')).toBeVisible()

  expect(state.recaptchaRequests).toHaveLength(1)
  expect(state.recaptchaRequests[0].body).toEqual({
    action: 'sms_consent_submit',
  })
  expect(JSON.stringify(state.recaptchaRequests[0])).not.toContain(phoneNumber)

  expect(state.captureRequests).toHaveLength(1)
  assertExactWireRequest(state.captureRequests[0])

  const idempotencyKey = state.captureRequests[0].headers['idempotency-key']
  const token = state.captureRequests[0].body?.recaptchaToken
  expect(idempotencyKey).toMatch(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  )
  expect(typeof token).toBe('string')
  for (const request of [
    ...state.recaptchaRequests,
    ...state.preflights,
    ...state.captureRequests,
  ]) {
    expect(request.url).not.toContain(phoneNumber)
    expect(request.url).not.toContain(idempotencyKey)
    expect(request.url).not.toContain(String(token))
  }

  expect(page.url()).toBe(`${localOrigin}/sms-opt-in`)
  for (const message of consoleMessages) {
    expect(message).not.toContain(phoneNumber)
    expect(message).not.toContain(idempotencyKey)
    expect(message).not.toContain(String(token))
    expect(message).not.toContain('sce_22222222-2222-4222-8222-222222222222')
  }
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([])
  expect(await page.evaluate(() => Object.keys(sessionStorage))).toEqual([])
  expect(await page.evaluate(async () => caches.keys())).toEqual([])
  expect(await context.cookies()).toEqual([])
})

test('the mocked capture boundary exposes the exact preflight contract', async ({
  page,
}) => {
  const state = await installSyntheticBoundaries(page)
  await page.goto('/sms-opt-in')

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url() === `${captureOrigin}/api/v1/sms-consent` &&
      response.request().method() === 'OPTIONS',
  )
  const status = await page.evaluate(async (url) => {
    const response = await fetch(url, {
      method: 'OPTIONS',
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
    })
    return response.status
  }, `${captureOrigin}/api/v1/sms-consent`)
  const responseHeaders = await (await responsePromise).allHeaders()

  expect(state.preflights).toHaveLength(1)
  expect(status).toBe(204)
  expect(responseHeaders['access-control-allow-origin']).toBe(localOrigin)
  expect(responseHeaders['access-control-allow-methods']).toBe('POST, OPTIONS')
  expect(responseHeaders['access-control-allow-headers']).toBe(
    'Content-Type, Idempotency-Key',
  )
})

test('accepts an exact mocked 200 idempotent replay receipt', async ({
  page,
}) => {
  const state = await installSyntheticBoundaries(page, {
    captureAttempt: async (route, request) => {
      await fulfillCapture(route, request, 200)
      return true
    },
  })
  await page.goto('/sms-opt-in')
  await completeForm(page)

  await page.getByRole('button', { name: /agree and continue/i }).click()

  await expect(page.getByText('Your SMS consent was saved.')).toBeVisible()
  expect(state.captureRequests).toHaveLength(1)
})

test('retries a lost response with a fresh token and stable payload/key', async ({
  page,
}) => {
  const state = await installSyntheticBoundaries(page, {
    captureAttempt: async (route, request, attemptNumber) => {
      if (attemptNumber === 1) {
        await route.abort('timedout')
      } else {
        await fulfillCapture(route, request, 200)
      }
      return true
    },
  })
  await page.goto('/sms-opt-in')
  await completeForm(page)

  await page.getByRole('button', { name: /agree and continue/i }).click()
  await expect(page.getByRole('main').getByRole('alert')).toContainText(
    'treated as not recorded',
  )
  await page.getByRole('button', { name: /try again/i }).click()
  await expect(page.getByText('Your SMS consent was saved.')).toBeVisible()

  expect(state.captureRequests).toHaveLength(2)
  const [first, second] = state.captureRequests
  expect(first.headers['idempotency-key']).toBe(
    second.headers['idempotency-key'],
  )
  const { recaptchaToken: firstToken, ...firstLogical } = first.body ?? {}
  const { recaptchaToken: secondToken, ...secondLogical } = second.body ?? {}
  expect(firstToken).not.toBe(secondToken)
  expect(secondLogical).toEqual(firstLogical)
})

test('fails safely when CAPTCHA is blocked or execution is rejected', async ({
  page,
}) => {
  const blocked = await installSyntheticBoundaries(page, {
    tokenFailure: 'script-blocked',
  })
  await page.goto('/sms-opt-in')
  await completeForm(page)
  await page.getByRole('button', { name: /agree and continue/i }).click()
  await expect(page.getByRole('main').getByRole('alert')).toContainText(
    'treated as not recorded',
  )
  expect(blocked.captureRequests).toHaveLength(0)

  await page.unrouteAll({ behavior: 'wait' })
  const rejected = await installSyntheticBoundaries(page, {
    tokenFailure: 'execution-rejection',
  })
  await page.getByRole('button', { name: /try again/i }).click()
  await expect(page.getByRole('main').getByRole('alert')).toContainText(
    'treated as not recorded',
  )
  expect(rejected.captureRequests).toHaveLength(0)
})

test('recovers from offline state without automatic submission', async ({
  page,
  context,
}) => {
  const state = await installSyntheticBoundaries(page)
  await page.goto('/sms-opt-in')
  await completeForm(page)

  await context.setOffline(true)
  await expect(page.getByText(/you are offline/i)).toBeVisible()
  await expect(
    page.getByRole('button', { name: /agree and continue/i }),
  ).toBeDisabled()
  expect(state.captureRequests).toHaveLength(0)

  await context.setOffline(false)
  await expect(
    page.getByRole('button', { name: /agree and continue/i }),
  ).toBeEnabled()
  await page.getByRole('button', { name: /agree and continue/i }).click()
  await expect(page.getByText('Your SMS consent was saved.')).toBeVisible()
  expect(state.captureRequests).toHaveLength(1)
})

test('synchronous duplicate clicks acquire one token and send one request', async ({
  page,
}) => {
  const state = await installSyntheticBoundaries(page, { tokenDelayMs: 150 })
  await page.goto('/sms-opt-in')
  await completeForm(page)
  const submit = page.getByRole('button', { name: /agree and continue/i })

  await submit.evaluate((element: HTMLButtonElement) => {
    element.click()
    element.click()
  })

  await expect(page.getByText('Your SMS consent was saved.')).toBeVisible()
  expect(state.recaptchaRequests).toHaveLength(1)
  expect(state.captureRequests).toHaveLength(1)
})

test('reflows at mobile, 200%, and 400% zoom-equivalent widths', async ({
  page,
}) => {
  await installSyntheticBoundaries(page)
  // Reducing a 1280-CSS-pixel desktop viewport to 640 and 320 CSS pixels
  // exercises the same responsive reflow thresholds as 200% and 400% zoom.
  for (const width of [640, 320]) {
    await page.setViewportSize({ width, height: 720 })
    await page.goto('/sms-opt-in')

    expect(
      await page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    ).toBe(true)
    for (const control of await page.locator('input, button').all()) {
      const box = await control.boundingBox()
      if (box && (await control.isVisible())) {
        expect(box.height).toBeGreaterThanOrEqual(24)
      }
    }
    const disclosureSize = await page
      .locator('#sms-disclosure')
      .evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).fontSize),
      )
    expect(disclosureSize).toBeGreaterThanOrEqual(14)
  }
})

test('Terms and Privacy links navigate only to their exact canonical paths', async ({
  page,
}) => {
  await installSyntheticBoundaries(page)
  await page.goto('/sms-opt-in')

  const consentGroup = page.getByRole('group', {
    name: /transactional sms consent/i,
  })
  const terms = consentGroup.getByRole('link', { name: /terms of service/i })
  const privacy = consentGroup.getByRole('link', { name: /privacy policy/i })
  await expect(terms).toHaveAttribute('href', 'https://mymedvisit.app/terms')
  await expect(privacy).toHaveAttribute(
    'href',
    'https://mymedvisit.app/privacy',
  )

  await completeForm(page)
  await terms.click()
  await expect(page).toHaveURL('https://mymedvisit.app/terms')
  await page.goBack()
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

  await privacy.click()
  await expect(page).toHaveURL('https://mymedvisit.app/privacy')
})

async function installSyntheticBoundaries(
  page: Page,
  options: MockOptions = {},
): Promise<MockState> {
  const state: MockState = {
    recaptchaRequests: [],
    captureRequests: [],
    preflights: [],
    tokenCount: 0,
  }

  await page.route('**/*', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const captured = capture(
      request.method(),
      request.url(),
      request.headers(),
      request.postData(),
    )

    if (url.origin === localOrigin) {
      await route.continue()
      return
    }

    if (url.origin === recaptchaOrigin) {
      state.recaptchaRequests.push(captured)
      if (options.tokenFailure === 'script-blocked') {
        await route.abort('blockedbyclient')
        return
      }
      if (options.tokenDelayMs) {
        await new Promise((resolve) =>
          setTimeout(resolve, options.tokenDelayMs),
        )
      }
      state.tokenCount += 1
      if (options.tokenFailure === 'execution-rejection') {
        await route.fulfill({
          status: 503,
          headers: {
            'Access-Control-Allow-Origin': localOrigin,
            'Cache-Control': 'no-store',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ error: 'synthetic execution rejection' }),
        })
        return
      }
      await route.fulfill({
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': localOrigin,
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json',
        },
        body:
          options.tokenFailure === 'invalid-response'
            ? JSON.stringify({ unexpected: true })
            : JSON.stringify({ token: `synthetic-token-${state.tokenCount}` }),
      })
      return
    }

    if (url.origin === captureOrigin && request.method() === 'OPTIONS') {
      state.preflights.push(captured)
      await route.fulfill({
        status: 204,
        headers: corsHeaders(),
      })
      return
    }

    if (url.origin === captureOrigin && request.method() === 'POST') {
      state.captureRequests.push(captured)
      const attemptNumber = state.captureRequests.length
      if (
        options.captureAttempt &&
        (await options.captureAttempt(route, captured, attemptNumber))
      ) {
        return
      }
      await fulfillCapture(route, captured, 201)
      return
    }

    if (
      url.origin === 'https://mymedvisit.app' &&
      (url.pathname === '/terms' || url.pathname === '/privacy')
    ) {
      await route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `<main><h1>${url.pathname === '/terms' ? 'Terms' : 'Privacy'}</h1></main>`,
      })
      return
    }

    // Google Fonts and every other non-local destination are blocked. The test
    // suite therefore cannot accidentally contact a live service.
    await route.abort('blockedbyclient')
  })

  return state
}

async function installNoLiveNetworkGuard(page: Page): Promise<void> {
  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url())
    if (url.origin === localOrigin) {
      await route.continue()
    } else {
      await route.abort('blockedbyclient')
    }
  })
}

async function fulfillCapture(
  route: Route,
  request: CapturedRequest,
  status: 200 | 201,
): Promise<void> {
  const idempotencyKey = request.headers['idempotency-key']
  await route.fulfill({
    status,
    headers: {
      ...corsHeaders(),
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      status: 'persisted',
      evidenceId: 'sce_22222222-2222-4222-8222-222222222222',
      recordedAt: '2026-09-15T12:00:00.000Z',
      idempotencyKey,
    }),
  })
}

function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': localOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Idempotency-Key',
    'Access-Control-Max-Age': '600',
    Vary: 'Origin',
  }
}

function capture(
  method: string,
  url: string,
  headers: Record<string, string>,
  postData: string | null,
): CapturedRequest {
  let body: Record<string, unknown> | null = null
  if (postData) {
    try {
      body = JSON.parse(postData) as Record<string, unknown>
    } catch {
      body = null
    }
  }
  return { method, url, headers, body }
}

function assertExactWireRequest(request: CapturedRequest): void {
  expect(Object.keys(request.body ?? {}).sort()).toEqual(
    [
      'phoneNumber',
      'disclosureVersion',
      'pageVersion',
      'pageUrl',
      'privacy',
      'source',
      'terms',
      'transactionalMessageCategories',
      'authorizedNumberAttestation',
      'recaptchaToken',
    ].sort(),
  )
  expect(request.body).toMatchObject({
    phoneNumber,
    pageUrl: 'https://mymedvisit.app/sms-opt-in',
    source: 'mymedvisit_web_sms_opt_in',
    transactionalMessageCategories: ['one_time_verification_codes'],
    authorizedNumberAttestation: true,
  })
  expect(request.headers.cookie).toBeUndefined()
  expect(request.headers.authorization).toBeUndefined()
}

async function completeForm(page: Page): Promise<void> {
  await page
    .getByRole('textbox', { name: /mobile phone number/i })
    .fill(phoneNumber)
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
}
