import { describe, expect, it, vi } from 'vitest'
import {
  ConsentSubmissionError,
  createHttpSmsConsentTransport,
  createSmsConsentSubmission,
  createSmsConsentWireRequest,
  disabledSmsConsentClient,
  isDurableSmsConsentReceipt,
  isLowercaseUuidV4,
  isSmsConsentErrorEnvelope,
  isSmsConsentWireRequest,
  productionSmsConsentClient,
  type ConsentSubmissionFailureCode,
  type SmsConsentPublicErrorCode,
} from './client'
import {
  SMS_CONSENT_ENDPOINT_PATH,
  SMS_CONSENT_INTEGRATION_ENABLED,
  SMS_CONSENT_PRIVACY,
  SMS_CONSENT_SOURCE,
  SMS_CONSENT_TERMS,
  SMS_OPT_IN_CANONICAL_URL,
} from './constants'

const idempotencyKey = '11111111-1111-4111-8111-111111111111'
const differentIdempotencyKey = '33333333-3333-4333-8333-333333333333'
const phoneNumber = '5555550123'
const recaptchaToken = 'synthetic-recaptcha-token'
const durableReceipt = {
  status: 'persisted' as const,
  evidenceId: 'sce_22222222-2222-4222-8222-222222222222',
  recordedAt: '2026-09-15T12:00:00.000Z',
  idempotencyKey,
}
const logicalRequest = createSmsConsentSubmission(phoneNumber, true)
const wireRequest = createSmsConsentWireRequest(logicalRequest, recaptchaToken)

function jsonResponse(
  body: unknown,
  status = 201,
  additionalHeaders: HeadersInit = {},
): Response {
  return new Response(
    status === 204 || status === 205 ? null : JSON.stringify(body),
    {
      status,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'private, no-store',
        ...Object.fromEntries(new Headers(additionalHeaders)),
      },
    },
  )
}

function createTransport(fetcher: typeof fetch) {
  return createHttpSmsConsentTransport({
    baseUrl: 'https://api.example.com',
    fetcher,
  })
}

describe('SMS consent closed request boundary', () => {
  it('constructs a stable nine-field logical request and an exact ten-field wire request', () => {
    expect(Reflect.ownKeys(logicalRequest)).toEqual([
      'phoneNumber',
      'disclosureVersion',
      'pageVersion',
      'pageUrl',
      'privacy',
      'source',
      'terms',
      'transactionalMessageCategories',
      'authorizedNumberAttestation',
    ])
    expect(Reflect.ownKeys(wireRequest)).toEqual([
      ...Reflect.ownKeys(logicalRequest),
      'recaptchaToken',
    ])
    expect(wireRequest).toMatchObject({
      phoneNumber,
      pageUrl: SMS_OPT_IN_CANONICAL_URL,
      privacy: SMS_CONSENT_PRIVACY,
      source: SMS_CONSENT_SOURCE,
      terms: SMS_CONSENT_TERMS,
      authorizedNumberAttestation: true,
      recaptchaToken,
    })
    expect(wireRequest.transactionalMessageCategories).toEqual([
      'one_time_verification_codes',
    ])
    expect(isSmsConsentWireRequest(wireRequest)).toBe(true)
  })

  it.each([
    [
      'false attestation',
      { ...wireRequest, authorizedNumberAttestation: false },
    ],
    [
      'string attestation',
      { ...wireRequest, authorizedNumberAttestation: 'true' },
    ],
    [
      'missing token',
      (() => {
        const value: Record<string, unknown> = { ...wireRequest }
        delete value.recaptchaToken
        return value
      })(),
    ],
    ['empty token', { ...wireRequest, recaptchaToken: '' }],
    ['NUL token', { ...wireRequest, recaptchaToken: 'token\0value' }],
    ['extra root field', { ...wireRequest, consent: true }],
    ['body idempotency key', { ...wireRequest, idempotencyKey }],
    [
      'extra privacy field',
      {
        ...wireRequest,
        privacy: { ...wireRequest.privacy, extra: true },
      },
    ],
    [
      'extra terms field',
      {
        ...wireRequest,
        terms: { ...wireRequest.terms, extra: true },
      },
    ],
    [
      'duplicate category',
      {
        ...wireRequest,
        transactionalMessageCategories: [
          'one_time_verification_codes',
          'one_time_verification_codes',
        ],
      },
    ],
    [
      'unknown category',
      {
        ...wireRequest,
        transactionalMessageCategories: ['marketing'],
      },
    ],
    [
      'empty categories',
      {
        ...wireRequest,
        transactionalMessageCategories: [],
      },
    ],
    [
      'control-character phone',
      { ...wireRequest, phoneNumber: '555\n5550123' },
    ],
  ])('rejects %s', (_name, value) => {
    expect(isSmsConsentWireRequest(value)).toBe(false)
  })

  it('rejects inherited, symbol-bearing, exotic, sparse, and hostile proxy values', () => {
    const inherited = Object.create(wireRequest)
    const symbolBearing = { ...wireRequest, [Symbol('secret')]: 'unexpected' }
    const nullPrototype = Object.assign(Object.create(null), wireRequest)
    const sparseCategories = new Array(2)
    sparseCategories[1] = 'one_time_verification_codes'
    const sparse = {
      ...wireRequest,
      transactionalMessageCategories: sparseCategories,
    }
    const hostileProxy = new Proxy(wireRequest, {
      ownKeys() {
        throw new Error('must not escape')
      },
    })

    for (const value of [
      inherited,
      symbolBearing,
      nullPrototype,
      sparse,
      hostileProxy,
    ]) {
      expect(isSmsConsentWireRequest(value)).toBe(false)
    }
  })

  it('rejects invalid wire input before fetch', async () => {
    const fetcher = vi.fn<typeof fetch>()
    const transport = createTransport(fetcher)

    await expect(
      transport.submit(
        { ...wireRequest, authorizedNumberAttestation: false } as never,
        idempotencyKey,
      ),
    ).rejects.toMatchObject({ code: 'invalid-configuration' })
    expect(fetcher).not.toHaveBeenCalled()
  })
})

describe('SMS consent HTTP transport', () => {
  it.each([201, 200])(
    'accepts only exact durable persistence on HTTP %s',
    async (status) => {
      const fetcher = vi
        .fn<typeof fetch>()
        .mockResolvedValue(jsonResponse(durableReceipt, status))
      const transport = createTransport(fetcher)

      await expect(
        transport.submit(wireRequest, idempotencyKey),
      ).resolves.toEqual(durableReceipt)

      expect(fetcher).toHaveBeenCalledTimes(1)
      const [url, options] = fetcher.mock.calls[0]
      expect(SMS_CONSENT_ENDPOINT_PATH).toBe('/api/v1/sms-consent')
      expect(url).toBe('https://api.example.com/api/v1/sms-consent')
      expect(url).not.toContain(phoneNumber)
      expect(url).not.toContain(idempotencyKey)
      expect(url).not.toContain(recaptchaToken)
      expect(options).toMatchObject({
        method: 'POST',
        cache: 'no-store',
        credentials: 'omit',
        mode: 'cors',
        redirect: 'error',
        referrerPolicy: 'no-referrer',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': idempotencyKey,
        },
      })
      expect(Reflect.ownKeys(options?.headers as object)).toEqual([
        'Content-Type',
        'Idempotency-Key',
      ])
      expect(JSON.parse(String(options?.body))).toEqual(wireRequest)
    },
  )

  it.each([202, 203, 204, 205, 206, 207, 208, 226])(
    'rejects unsupported success-like HTTP status %s',
    async (status) => {
      const transport = createTransport(
        vi
          .fn<typeof fetch>()
          .mockResolvedValue(
            jsonResponse(status === 204 ? null : durableReceipt, status),
          ),
      )

      await expect(
        transport.submit(wireRequest, idempotencyKey),
      ).rejects.toMatchObject({ code: 'invalid-response' })
    },
  )

  it('treats timeout or other network failure as ambiguous without leaking details', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const transport = createTransport(
      vi
        .fn<typeof fetch>()
        .mockRejectedValue(
          new TypeError(`network failed for ${phoneNumber} ${recaptchaToken}`),
        ),
    )

    const error = await transport
      .submit(wireRequest, idempotencyKey)
      .catch((caught: unknown) => caught)

    expect(error).toMatchObject({ code: 'network' })
    expect(String(error)).not.toContain(phoneNumber)
    expect(String(error)).not.toContain(recaptchaToken)
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('aborts an in-flight fetch when its lifecycle signal is invalidated', async () => {
    let fetchSignal: AbortSignal | null = null
    const fetcher = vi.fn<typeof fetch>((_input, init) => {
      fetchSignal = init?.signal ?? null
      return new Promise<Response>((_resolve, reject) => {
        fetchSignal?.addEventListener(
          'abort',
          () => reject(new DOMException('Aborted', 'AbortError')),
          { once: true },
        )
      })
    })
    const transport = createTransport(fetcher)
    const lifecycle = new AbortController()

    const result = transport
      .submit(wireRequest, idempotencyKey, lifecycle.signal)
      .catch((error: unknown) => error)
    lifecycle.abort()

    await expect(result).resolves.toMatchObject({ code: 'network' })
    expect(fetcher.mock.calls[0][1]?.signal?.aborted).toBe(true)
    expect(fetcher).toHaveBeenCalledTimes(1)
  })

  it.each([
    ['missing content type', { 'Content-Type': '' }],
    ['wrong content type', { 'Content-Type': 'text/plain' }],
    [
      'non-UTF-8 charset',
      { 'Content-Type': 'application/json; charset=iso-8859-1' },
    ],
    ['missing no-store', { 'Cache-Control': '' }],
  ])('rejects a response with %s', async (_name, headers) => {
    const response = jsonResponse(durableReceipt)
    for (const [name, value] of Object.entries(headers)) {
      value ? response.headers.set(name, value) : response.headers.delete(name)
    }
    const transport = createTransport(
      vi.fn<typeof fetch>().mockResolvedValue(response),
    )

    await expect(
      transport.submit(wireRequest, idempotencyKey),
    ).rejects.toMatchObject({ code: 'invalid-response' })
  })

  it('rejects a redirected response even if its body otherwise looks valid', async () => {
    const response = jsonResponse(durableReceipt)
    Object.defineProperty(response, 'redirected', { value: true })
    const transport = createTransport(
      vi.fn<typeof fetch>().mockResolvedValue(response),
    )

    await expect(
      transport.submit(wireRequest, idempotencyKey),
    ).rejects.toMatchObject({ code: 'invalid-response' })
  })

  it('rejects malformed JSON without logging its contents', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    const response = new Response(`not-json-${phoneNumber}-${recaptchaToken}`, {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    })
    const transport = createTransport(
      vi.fn<typeof fetch>().mockResolvedValue(response),
    )

    const error = await transport
      .submit(wireRequest, idempotencyKey)
      .catch((caught: unknown) => caught)

    expect(error).toMatchObject({ code: 'invalid-response' })
    expect(String(error)).not.toContain(phoneNumber)
    expect(String(error)).not.toContain(recaptchaToken)
    expect(consoleError).not.toHaveBeenCalled()
    consoleError.mockRestore()
  })

  it('rejects proxy-derived JSON values returned by a hostile fetch double', async () => {
    const response = jsonResponse(durableReceipt)
    const hostileBody = new Proxy(durableReceipt, {
      getPrototypeOf() {
        throw new Error('must not escape')
      },
    })
    vi.spyOn(response, 'json').mockResolvedValue(hostileBody)
    const transport = createTransport(
      vi.fn<typeof fetch>().mockResolvedValue(response),
    )

    await expect(
      transport.submit(wireRequest, idempotencyKey),
    ).rejects.toMatchObject({ code: 'invalid-response' })
  })

  it.each([
    'http://api.example.com',
    'https://user:password@api.example.com',
    'https://api.example.com/path',
    'https://api.example.com?unexpected=value',
    'https://api.example.com#fragment',
  ])('rejects unsafe public endpoint configuration %s', (baseUrl) => {
    expect(() => createHttpSmsConsentTransport({ baseUrl })).toThrowError(
      ConsentSubmissionError,
    )
  })
})

describe('durable success validation', () => {
  it.each([
    '2024-02-29T00:00:00.000Z',
    '2026-01-01T00:00:00.000Z',
    '2026-12-31T23:59:59.999Z',
  ])('accepts canonical UTC timestamp %s', (recordedAt) => {
    expect(
      isDurableSmsConsentReceipt(
        { ...durableReceipt, recordedAt },
        idempotencyKey,
      ),
    ).toBe(true)
  })

  it.each([
    '2026-02-30T12:00:00.000Z',
    '2026-01-01T24:00:00.000Z',
    '2026-02-29T12:00:00.000Z',
    '2026-00-01T12:00:00.000Z',
    '2026-13-01T12:00:00.000Z',
    '2026-01-00T12:00:00.000Z',
    '2026-01-32T12:00:00.000Z',
    '2026-01-01T23:60:00.000Z',
    '2026-01-01T23:59:60.000Z',
    '2026-01-01T23:59:59Z',
    '2026-01-01T23:59:59.000+00:00',
  ])('rejects non-canonical or impossible timestamp %s', (recordedAt) => {
    expect(
      isDurableSmsConsentReceipt(
        { ...durableReceipt, recordedAt },
        idempotencyKey,
      ),
    ).toBe(false)
  })

  it.each([
    ['wrong status', { ...durableReceipt, status: 'accepted' }],
    ['bad evidence prefix', { ...durableReceipt, evidenceId: 'evidence-123' }],
    [
      'uppercase UUID',
      {
        ...durableReceipt,
        evidenceId: 'sce_22222222-2222-4222-8222-22222222222A',
      },
    ],
    [
      'wrong UUID version',
      {
        ...durableReceipt,
        evidenceId: 'sce_22222222-2222-3222-8222-222222222222',
      },
    ],
    [
      'mismatched key',
      { ...durableReceipt, idempotencyKey: differentIdempotencyKey },
    ],
    ['extra field', { ...durableReceipt, phoneNumber }],
    ['symbol field', { ...durableReceipt, [Symbol('extra')]: true }],
    ['array', Object.assign([], durableReceipt)],
    ['null', null],
  ])('rejects %s', (_name, value) => {
    expect(isDurableSmsConsentReceipt(value, idempotencyKey)).toBe(false)
  })

  it('rejects missing, inherited, wrong-type, and proxy values', () => {
    const missing: Record<string, unknown> = { ...durableReceipt }
    delete missing.evidenceId
    const inherited = Object.create(durableReceipt)
    const hostileProxy = new Proxy(durableReceipt, {
      getPrototypeOf() {
        throw new Error('must not escape')
      },
    })

    for (const value of [
      missing,
      inherited,
      hostileProxy,
      { ...durableReceipt, evidenceId: 123 },
      { ...durableReceipt, recordedAt: 123 },
      { ...durableReceipt, idempotencyKey: 123 },
    ]) {
      expect(isDurableSmsConsentReceipt(value, idempotencyKey)).toBe(false)
    }
  })

  it.each([idempotencyKey, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'])(
    'accepts lowercase UUIDv4 key %s',
    (value) => {
      expect(isLowercaseUuidV4(value)).toBe(true)
    },
  )

  it.each([
    'request-123',
    'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA',
    '11111111-1111-3111-8111-111111111111',
    '11111111-1111-4111-7111-111111111111',
    ` ${idempotencyKey}`,
    `${idempotencyKey} `,
  ])('rejects invalid idempotency key %s', (value) => {
    expect(isLowercaseUuidV4(value)).toBe(false)
  })
})

describe('closed generic error contract', () => {
  const cases: Array<
    readonly [number, SmsConsentPublicErrorCode, ConsentSubmissionFailureCode]
  > = [
    [400, 'invalid_request', 'invalid-request'],
    [403, 'request_not_allowed', 'request-not-allowed'],
    [403, 'bot_check_failed', 'bot-check-failed'],
    [405, 'method_not_allowed', 'method-not-allowed'],
    [409, 'idempotency_conflict', 'idempotency-conflict'],
    [413, 'request_too_large', 'request-too-large'],
    [415, 'unsupported_media_type', 'unsupported-media-type'],
    [429, 'rate_limited', 'rate-limited'],
    [500, 'internal_error', 'internal-error'],
    [503, 'consent_capture_unavailable', 'unavailable'],
  ]

  it.each(cases)(
    'accepts only HTTP %s with %s and maps it safely',
    async (status, publicCode, clientCode) => {
      const response = jsonResponse(
        {
          error: {
            code: publicCode,
            message: 'Request could not be completed.',
          },
        },
        status,
        status === 503 ? { 'Retry-After': '5' } : {},
      )
      const transport = createTransport(
        vi.fn<typeof fetch>().mockResolvedValue(response),
      )

      const error = await transport
        .submit(wireRequest, idempotencyKey)
        .catch((caught: unknown) => caught)

      expect(error).toMatchObject({ code: clientCode })
      expect(String(error)).toBe(
        'ConsentSubmissionError: The consent request could not be completed.',
      )
      if (status === 503) {
        expect(error).toMatchObject({ retryAfterMs: 5_000 })
      }
    },
  )

  it.each([
    ['mismatched status and code', 400, 'rate_limited'],
    ['unknown status', 418, 'invalid_request'],
    ['unknown code', 400, 'phone_not_found'],
  ])('rejects %s', async (_name, status, code) => {
    const transport = createTransport(
      vi.fn<typeof fetch>().mockResolvedValue(
        jsonResponse(
          {
            error: { code, message: 'Request could not be completed.' },
          },
          status,
        ),
      ),
    )

    await expect(
      transport.submit(wireRequest, idempotencyKey),
    ).rejects.toMatchObject({ code: 'invalid-response' })
  })

  it.each([
    [
      'extra envelope field',
      {
        error: {
          code: 'invalid_request',
          message: 'Request could not be completed.',
        },
        phoneNumber,
      },
    ],
    [
      'extra error field',
      {
        error: {
          code: 'invalid_request',
          message: 'Request could not be completed.',
          reason: recaptchaToken,
        },
      },
    ],
    [
      'reflected message',
      {
        error: {
          code: 'invalid_request',
          message: `Invalid ${phoneNumber}`,
        },
      },
    ],
    [
      'inherited envelope',
      Object.create({
        error: {
          code: 'invalid_request',
          message: 'Request could not be completed.',
        },
      }),
    ],
    [
      'symbol property',
      {
        error: {
          code: 'invalid_request',
          message: 'Request could not be completed.',
        },
        [Symbol('correlation')]: 'secret',
      },
    ],
  ])('rejects %s without reflecting it', (_name, value) => {
    expect(isSmsConsentErrorEnvelope(value, 400)).toBe(false)
  })

  it('requires the fixed Retry-After header on 503', async () => {
    const response = jsonResponse(
      {
        error: {
          code: 'consent_capture_unavailable',
          message: 'Request could not be completed.',
        },
      },
      503,
    )
    const transport = createTransport(
      vi.fn<typeof fetch>().mockResolvedValue(response),
    )

    await expect(
      transport.submit(wireRequest, idempotencyKey),
    ).rejects.toMatchObject({ code: 'invalid-response' })
  })
})

describe('production safety boundary', () => {
  it('keeps production submission literally code-disabled', () => {
    expect(SMS_CONSENT_INTEGRATION_ENABLED).toBe(false)
    expect(productionSmsConsentClient).toBe(disabledSmsConsentClient)
  })
})
