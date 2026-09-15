'use client'

import Link from 'next/link'
import { FormEvent, useEffect, useRef, useState } from 'react'
import {
  ConsentSubmissionError,
  createSmsConsentSubmission,
  isDurableSmsConsentReceipt,
  productionSmsConsentClient,
  type SmsConsentClient,
  type SmsConsentSubmission,
} from '@/lib/sms-consent/client'
import {
  SMS_CONSENT_PRIVACY,
  SMS_CONSENT_TERMS,
  SMS_OPT_IN_CANONICAL_URL,
} from '@/lib/sms-consent/constants'

type FormPhase = 'idle' | 'submitting' | 'failure' | 'success' | 'declined'

interface FormErrors {
  phone?: string
  consent?: string
}

interface SubmissionAttempt {
  submission: SmsConsentSubmission
  idempotencyKey: string
}

interface SmsOptInClientProps {
  client?: SmsConsentClient
  createIdempotencyKey?: () => string
}

export function SmsOptInClient({
  client = productionSmsConsentClient,
  createIdempotencyKey = createBrowserIdempotencyKey,
}: SmsOptInClientProps) {
  const [phone, setPhone] = useState('')
  const [consented, setConsented] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [phase, setPhase] = useState<FormPhase>('idle')
  const [failureMessage, setFailureMessage] = useState('')
  const [canRetry, setCanRetry] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const phoneRef = useRef<HTMLInputElement>(null)
  const consentRef = useRef<HTMLInputElement>(null)
  const inFlightRef = useRef(false)
  const lastAttemptRef = useRef<SubmissionAttempt | null>(null)

  useEffect(() => {
    function updateOnlineState() {
      setIsOnline(navigator.onLine)
    }

    updateOnlineState()
    window.addEventListener('online', updateOnlineState)
    window.addEventListener('offline', updateOnlineState)

    return () => {
      window.removeEventListener('online', updateOnlineState)
      window.removeEventListener('offline', updateOnlineState)
    }
  }, [])

  function resetSubmissionFeedback() {
    if (phase === 'failure') {
      setPhase('idle')
      setFailureMessage('')
      setCanRetry(false)
      lastAttemptRef.current = null
    }
  }

  function updatePhone(value: string) {
    setPhone(value)
    setErrors((current) => ({ ...current, phone: undefined }))
    resetSubmissionFeedback()
  }

  function updateConsent(value: boolean) {
    setConsented(value)
    setErrors((current) => ({ ...current, consent: undefined }))
    resetSubmissionFeedback()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (inFlightRef.current) {
      return
    }

    const nextErrors: FormErrors = {}
    const trimmedPhone = phone.trim()

    if (!trimmedPhone) {
      nextErrors.phone = 'Enter a mobile phone number.'
    }
    if (!consented) {
      nextErrors.consent = 'Check the consent box to agree before continuing.'
    }

    setErrors(nextErrors)
    setFailureMessage('')
    setCanRetry(false)

    if (nextErrors.phone) {
      requestAnimationFrame(() => phoneRef.current?.focus())
      return
    }
    if (nextErrors.consent) {
      requestAnimationFrame(() => consentRef.current?.focus())
      return
    }

    if (!browserIsOnline()) {
      setPhase('failure')
      setFailureMessage(
        'You appear to be offline. No consent was sent or recorded. Reconnect, then try again.',
      )
      return
    }

    let idempotencyKey: string
    try {
      idempotencyKey = createIdempotencyKey()
    } catch {
      setPhase('failure')
      setFailureMessage(
        'This browser could not prepare a secure request. No consent was sent or recorded.',
      )
      return
    }

    const attempt = {
      submission: createSmsConsentSubmission(trimmedPhone),
      idempotencyKey,
    }
    lastAttemptRef.current = attempt
    await send(attempt)
  }

  async function send(attempt: SubmissionAttempt) {
    if (inFlightRef.current) {
      return
    }

    if (!browserIsOnline()) {
      setPhase('failure')
      setFailureMessage(
        'You appear to be offline. No consent was sent or recorded. Reconnect, then try again.',
      )
      setCanRetry(true)
      return
    }

    inFlightRef.current = true
    setPhase('submitting')
    setFailureMessage('')
    setCanRetry(false)

    try {
      const receipt = await client.submit(
        attempt.submission,
        attempt.idempotencyKey,
      )

      if (!isDurableSmsConsentReceipt(receipt, attempt.idempotencyKey)) {
        throw new ConsentSubmissionError(
          'invalid-response',
          'The response did not confirm durable persistence.',
        )
      }

      lastAttemptRef.current = null
      setPhone('')
      setConsented(false)
      setPhase('success')
    } catch (error) {
      const disabled =
        error instanceof ConsentSubmissionError && error.code === 'disabled'

      setPhase('failure')
      setCanRetry(!disabled)
      setFailureMessage(
        disabled
          ? 'Consent submission is not available yet. No consent was sent or recorded.'
          : 'We could not confirm that your consent was saved. It is being treated as not recorded. You can safely retry this same request.',
      )
    } finally {
      inFlightRef.current = false
    }
  }

  async function retry() {
    const attempt = lastAttemptRef.current
    if (!attempt || inFlightRef.current) {
      return
    }

    await send(attempt)
  }

  function decline() {
    if (inFlightRef.current) {
      return
    }

    lastAttemptRef.current = null
    setPhone('')
    setConsented(false)
    setErrors({})
    setFailureMessage('')
    setCanRetry(false)
    setPhase('declined')
  }

  function reconsider() {
    setPhase('idle')
    requestAnimationFrame(() => phoneRef.current?.focus())
  }

  const submitting = phase === 'submitting'

  return (
    <main className="overflow-hidden">
      <section className="relative px-4 pb-10 pt-12 sm:px-6 sm:pb-12 sm:pt-20 lg:pt-24">
        <div className="absolute inset-0 hero-sheen" aria-hidden="true" />
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--teal-dark)] sm:tracking-[0.3em]">
                MyMedVisit SMS preferences
              </p>
              <h1 className="mt-4 max-w-3xl font-[var(--font-fraunces)] text-[clamp(2.35rem,8vw,4.8rem)] leading-[1.05]">
                Stay in the loop about your account and requested care.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[rgba(13,27,42,0.7)] sm:text-lg">
                MyMedVisit may send transactional text messages for
                authentication, account security, and service notifications you
                request. This page is not an enrollment for advertising or
                promotional messages.
              </p>
              <p className="mt-4 text-sm font-medium text-[var(--teal-dark)]">
                MyMedVisit is the sender.
              </p>
            </div>

            <aside
              className="glass-card rounded-[24px] p-5 sm:rounded-[28px] sm:p-8"
              aria-labelledby="qr-heading"
            >
              <h2
                id="qr-heading"
                className="font-[var(--font-fraunces)] text-2xl"
              >
                Open this page on your phone
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[rgba(13,27,42,0.65)]">
                Scanning the code opens the opt-in page; it does not provide
                consent by itself.
              </p>
              <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                {/* The QR must be served byte-for-byte as the tested static SVG. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/sms-opt-in-qr.svg"
                  width="220"
                  height="220"
                  className="h-auto w-[min(220px,70vw)] rounded-lg bg-white p-3"
                  alt="QR code linking to the MyMedVisit SMS opt-in page"
                />
                <a
                  className="max-w-full break-all rounded text-sm font-semibold text-[var(--teal-dark)] underline underline-offset-4"
                  href={SMS_OPT_IN_CANONICAL_URL}
                >
                  {SMS_OPT_IN_CANONICAL_URL}
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section
        className="px-4 py-8 sm:px-6 sm:py-10"
        aria-labelledby="consent-heading"
      >
        <div className="mx-auto max-w-3xl">
          <div className="glass-card rounded-[24px] p-5 sm:rounded-[28px] sm:p-10">
            <h2
              id="consent-heading"
              className="font-[var(--font-fraunces)] text-3xl"
            >
              Choose whether to receive SMS
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[rgba(13,27,42,0.68)]">
              Enter your mobile number and affirmatively check the box only if
              you want these transactional messages. You can decline or leave
              this page without opting in.
            </p>

            {phase === 'declined' ? (
              <div
                className="mt-8 rounded-2xl border border-[rgba(13,27,42,0.15)] bg-white/80 p-5"
                role="status"
                aria-live="polite"
              >
                <h3 className="text-lg font-semibold">You have not opted in.</h3>
                <p className="mt-2 text-sm text-[rgba(13,27,42,0.7)]">
                  No request was sent and no SMS consent was recorded from this
                  page.
                </p>
                <button
                  type="button"
                  onClick={reconsider}
                  className="mt-5 rounded-full border border-[var(--ink)] px-5 py-3 text-sm font-semibold transition-colors hover:bg-[var(--ink)] hover:text-white focus-visible:outline-[var(--ink)]"
                >
                  Change my choice
                </button>
              </div>
            ) : phase === 'success' ? (
              <div
                className="mt-8 rounded-2xl border border-emerald-700/30 bg-emerald-50 p-5 text-emerald-950"
                role="status"
                aria-live="polite"
              >
                <h3 className="text-lg font-semibold">Your SMS consent was saved.</h3>
                <p className="mt-2 text-sm">
                  MyMedVisit confirmed that your consent record was durably
                  persisted. Reply STOP to any message to opt out.
                </p>
              </div>
            ) : (
              <form
                className="mt-8 space-y-6"
                onSubmit={submit}
                noValidate
                aria-busy={submitting}
              >
                <div>
                  <label htmlFor="sms-phone" className="text-sm font-semibold">
                    Mobile phone number
                  </label>
                  <input
                    ref={phoneRef}
                    id="sms-phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    disabled={submitting}
                    value={phone}
                    onChange={(event) => updatePhone(event.target.value)}
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={
                      errors.phone ? 'phone-help phone-error' : 'phone-help'
                    }
                    className="mt-2 w-full rounded-2xl border border-[rgba(13,27,42,0.25)] bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-slate-500 focus:border-[var(--teal-dark)] focus-visible:outline-[var(--teal-dark)] disabled:cursor-not-allowed disabled:opacity-70"
                    placeholder="(555) 555-0123"
                  />
                  <p
                    id="phone-help"
                    className="mt-2 text-xs text-[rgba(13,27,42,0.65)]"
                  >
                    Use a mobile number that can receive SMS. Do not include
                    health information.
                  </p>
                  {errors.phone && (
                    <p
                      id="phone-error"
                      className="mt-2 text-sm font-semibold text-red-800"
                    >
                      {errors.phone}
                    </p>
                  )}
                </div>

                <fieldset
                  className="rounded-2xl border border-[rgba(13,27,42,0.18)] bg-white/80 p-5"
                  aria-describedby={
                    errors.consent
                      ? 'sms-disclosure consent-error'
                      : 'sms-disclosure'
                  }
                >
                  <legend className="px-1 text-sm font-semibold">
                    Transactional SMS consent
                  </legend>
                  <p
                    id="sms-disclosure"
                    className="text-sm leading-relaxed text-[rgba(13,27,42,0.82)]"
                  >
                    MyMedVisit may send one-time verification codes,
                    account-security messages, and requested service
                    notifications. Message frequency varies. Message and data
                    rates may apply. Reply STOP to opt out and HELP for help.
                    Consent is not a condition of purchase and does not authorize
                    advertising or promotional messages.
                  </p>
                  <div className="mt-4 flex items-start gap-3">
                    <input
                      ref={consentRef}
                      id="sms-consent"
                      name="sms-consent"
                      type="checkbox"
                      checked={consented}
                      disabled={submitting}
                      onChange={(event) => updateConsent(event.target.checked)}
                      aria-invalid={Boolean(errors.consent)}
                      aria-describedby={
                        errors.consent
                          ? 'sms-disclosure consent-error'
                          : 'sms-disclosure'
                      }
                      className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer accent-[var(--teal-dark)] focus-visible:outline-[var(--teal-dark)] disabled:cursor-not-allowed"
                    />
                    <label
                      htmlFor="sms-consent"
                      className="cursor-pointer text-sm font-semibold leading-relaxed"
                    >
                      I agree to receive the transactional text messages
                      described above at the mobile number I provided.
                    </label>
                  </div>
                  {errors.consent && (
                    <p
                      id="consent-error"
                      className="mt-3 text-sm font-semibold text-red-800"
                    >
                      {errors.consent}
                    </p>
                  )}
                  <p className="mt-4 text-sm text-[rgba(13,27,42,0.72)]">
                    Review the{' '}
                    <Link
                      href={SMS_CONSENT_TERMS.reference}
                      className="rounded font-semibold text-[var(--teal-dark)] underline underline-offset-4"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href={SMS_CONSENT_PRIVACY.reference}
                      className="rounded font-semibold text-[var(--teal-dark)] underline underline-offset-4"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </fieldset>

                {(errors.phone || errors.consent) && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900"
                  >
                    Please correct the highlighted field
                    {errors.phone && errors.consent ? 's' : ''} before
                    continuing.
                  </div>
                )}

                {!isOnline && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-950"
                  >
                    You are offline. Reconnect before submitting. No consent has
                    been sent or recorded.
                  </p>
                )}

                {submitting && (
                  <p
                    role="status"
                    aria-live="polite"
                    className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm font-medium text-sky-950"
                  >
                    Submitting your choice and waiting for durable-persistence
                    confirmation…
                  </p>
                )}

                {phase === 'failure' && failureMessage && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900"
                  >
                    <p>{failureMessage}</p>
                    {canRetry && (
                      <button
                        type="button"
                        onClick={retry}
                        disabled={submitting || !isOnline}
                        className="mt-4 rounded-full border border-red-800 px-5 py-2.5 font-semibold transition-colors hover:bg-red-900 hover:text-white focus-visible:outline-red-900 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Try again
                      </button>
                    )}
                  </div>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={decline}
                    disabled={submitting}
                    className="min-h-12 flex-1 rounded-full border border-[var(--ink)] px-6 py-3 text-sm font-semibold transition-colors hover:bg-[var(--ink)] hover:text-white focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    No thanks
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !isOnline || (phase === 'failure' && canRetry)}
                    className="min-h-12 flex-1 rounded-full bg-[var(--teal-dark)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow)] transition-colors hover:bg-[var(--ink)] focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:bg-slate-500 disabled:shadow-none"
                  >
                    {submitting ? 'Submitting…' : 'Agree and continue'}
                  </button>
                </div>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-[rgba(13,27,42,0.65)]">
              Entering a number or checking the box alone does not opt you in.
              Consent is requested only when you select Agree and continue.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}

function browserIsOnline(): boolean {
  return typeof navigator === 'undefined' || navigator.onLine
}

function createBrowserIdempotencyKey(): string {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error('Secure UUID generation is unavailable.')
  }

  return globalThis.crypto.randomUUID()
}
