import { describe, expect, it, vi } from 'vitest'
import {
  ConsentSubmissionError,
  createHttpSmsConsentClient,
  createSmsConsentSubmission,
  disabledSmsConsentClient,
  isDurableSmsConsentReceipt,
  productionSmsConsentClient,
} from './client'
import {
  SMS_CONSENT_ENDPOINT_PATH,
  SMS_CONSENT_INTEGRATION_ENABLED,
} from './constants'

const idempotencyKey = 'request-123'
const durableReceipt = {
  status: 'persisted' as const,
  evidenceId: 'evidence-123',
  recordedAt: '2026-09-15T12:00:00.000Z',
  idempotencyKey,
}

describe('SMS consent API boundary', () => {
  it('posts only to the configured HTTPS endpoint with idempotency', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(durableReceipt), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )
    const client = createHttpSmsConsentClient({
      baseUrl: 'https://api.example.com',
      fetcher,
    })
    const submission = createSmsConsentSubmission('5555550123')

    await expect(client.submit(submission, idempotencyKey)).resolves.toEqual(
      durableReceipt,
    )

    expect(fetcher).toHaveBeenCalledTimes(1)
    const [url, options] = fetcher.mock.calls[0]
    expect(SMS_CONSENT_ENDPOINT_PATH).toBe('/api/v1/sms-consent')
    expect(url).toBe('https://api.example.com/api/v1/sms-consent')
    expect(url).not.toContain(submission.phoneNumber)
    expect(options).toMatchObject({
      method: 'POST',
      cache: 'no-store',
      credentials: 'omit',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
    })
    expect(JSON.parse(options.body)).toEqual(submission)
  })

  it('treats network ambiguity as failure', async () => {
    const client = createHttpSmsConsentClient({
      baseUrl: 'https://api.example.com',
      fetcher: vi.fn().mockRejectedValue(new TypeError('network failed')),
    })

    await expect(
      client.submit(createSmsConsentSubmission('5555550123'), idempotencyKey),
    ).rejects.toMatchObject({ code: 'network' })
  })

  it.each([
    '2024-02-29T00:00:00.000Z',
    '2026-01-01T00:00:00.000Z',
    '2026-12-31T23:59:59.999Z',
  ])('accepts the canonical UTC timestamp %s', (recordedAt) => {
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
  ])('rejects the non-canonical or impossible timestamp %s', (recordedAt) => {
    expect(
      isDurableSmsConsentReceipt(
        { ...durableReceipt, recordedAt },
        idempotencyKey,
      ),
    ).toBe(false)
  })

  it('rejects non-durable and idempotency-mismatched responses', () => {
    expect(
      isDurableSmsConsentReceipt({
        ...durableReceipt,
        status: 'accepted',
      }, idempotencyKey),
    ).toBe(false)
    expect(
      isDurableSmsConsentReceipt(durableReceipt, 'different-request'),
    ).toBe(false)
    expect(
      isDurableSmsConsentReceipt(durableReceipt, idempotencyKey),
    ).toBe(true)
  })

  it('rejects an unexpected success-response property', () => {
    expect(
      isDurableSmsConsentReceipt(
        { ...durableReceipt, unexpected: 'value' },
        idempotencyKey,
      ),
    ).toBe(false)
  })

  it('rejects missing, inherited, array, null, and wrong-type values', () => {
    const missingEvidenceId: Record<string, unknown> = { ...durableReceipt }
    delete missingEvidenceId.evidenceId
    const inheritedReceipt = Object.create(durableReceipt)

    const invalidValues: unknown[] = [
      missingEvidenceId,
      inheritedReceipt,
      Object.assign([], durableReceipt),
      null,
      { ...durableReceipt, status: true },
      { ...durableReceipt, evidenceId: 123 },
      { ...durableReceipt, recordedAt: 123 },
      { ...durableReceipt, idempotencyKey: 123 },
    ]

    for (const value of invalidValues) {
      expect(isDurableSmsConsentReceipt(value, idempotencyKey)).toBe(false)
    }
  })

  it('rejects unsafe public endpoint configuration', () => {
    expect(() =>
      createHttpSmsConsentClient({
        baseUrl: 'https://api.example.com?unexpected=value',
      }),
    ).toThrowError(ConsentSubmissionError)
  })

  it('keeps production submission code-disabled', () => {
    expect(SMS_CONSENT_INTEGRATION_ENABLED).toBe(false)
    expect(productionSmsConsentClient).toBe(disabledSmsConsentClient)
  })
})
