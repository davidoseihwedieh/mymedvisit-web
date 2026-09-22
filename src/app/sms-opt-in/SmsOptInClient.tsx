'use client'

import Link from 'next/link'
import {
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import {
  ConsentSubmissionError,
  createSmsConsentSubmission,
  isDurableSmsConsentReceipt,
  productionSmsConsentClient,
  type SmsConsentClient,
  type SmsConsentSubmission,
} from '@/lib/sms-consent/client'
import { createBrowserInjectedSmsConsentClient } from '../../lib/sms-consent/browserClientBoundary'
import {
  SMS_CONSENT_PRIVACY,
  SMS_CONSENT_TERMS,
  SMS_OPT_IN_CANONICAL_URL,
} from '@/lib/sms-consent/constants'

type FormPhase = 'idle' | 'submitting' | 'failure' | 'success' | 'declined'

interface FormErrors {
  phone?: string
  consent?: string
  attestation?: string
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
  client,
  createIdempotencyKey = createBrowserIdempotencyKey,
}: SmsOptInClientProps) {
  const activeClient =
    client ??
    createBrowserInjectedSmsConsentClient() ??
    productionSmsConsentClient
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydrationSnapshot,
  )
  const [phone, setPhone] = useState('')
  const [consented, setConsented] = useState(false)
  const [authorizedNumberAttestation, setAuthorizedNumberAttestation] =
    useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [phase, setPhase] = useState<FormPhase>('idle')
  const [failureMessage, setFailureMessage] = useState('')
  const [canRetry, setCanRetry] = useState(false)
  const [retryDelayActive, setRetryDelayActive] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const [lifecycleSuspended, setLifecycleSuspended] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const phoneRef = useRef<HTMLInputElement>(null)
  const consentRef = useRef<HTMLInputElement>(null)
  const attestationRef = useRef<HTMLInputElement>(null)
  const inFlightRef = useRef(false)
  const lastAttemptRef = useRef<SubmissionAttempt | null>(null)
  const retryDelayRef = useRef(false)
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const focusAnimationFrameRef = useRef<number | null>(null)
  const restoreAnimationFrameRef = useRef<number | null>(null)
  const lifecycleEpochRef = useRef(0)
  const activeRequestControllerRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(false)

  const cancelScheduledFocus = useCallback(() => {
    if (focusAnimationFrameRef.current !== null) {
      cancelAnimationFrame(focusAnimationFrameRef.current)
      focusAnimationFrameRef.current = null
    }
  }, [])

  const cancelScheduledRestore = useCallback(() => {
    if (restoreAnimationFrameRef.current !== null) {
      cancelAnimationFrame(restoreAnimationFrameRef.current)
      restoreAnimationFrameRef.current = null
    }
  }, [])

  const clearRetryDelayTimer = useCallback(() => {
    if (retryTimerRef.current !== null) {
      clearTimeout(retryTimerRef.current)
      retryTimerRef.current = null
    }
    retryDelayRef.current = false
    if (mountedRef.current) {
      setRetryDelayActive(false)
    }
  }, [])

  const invalidateAsyncWork = useCallback(() => {
    lifecycleEpochRef.current += 1
    activeRequestControllerRef.current?.abort()
    activeRequestControllerRef.current = null
    inFlightRef.current = false
    cancelScheduledFocus()
    cancelScheduledRestore()
  }, [cancelScheduledFocus, cancelScheduledRestore])

  const resetConsentSession = useCallback(
    (nextPhase: FormPhase = 'idle') => {
      invalidateAsyncWork()
      clearRetryDelayTimer()
      lastAttemptRef.current = null
      setPhone('')
      setConsented(false)
      setAuthorizedNumberAttestation(false)
      setErrors({})
      setFailureMessage('')
      setCanRetry(false)
      setRetryDelayActive(false)
      setIsOnline(browserIsOnline())
      setPhase(nextPhase)
    },
    [clearRetryDelayTimer, invalidateAsyncWork],
  )

  const disableConsentControlsImmediately = useCallback(() => {
    for (const control of formRef.current?.elements ?? []) {
      if (
        control instanceof HTMLInputElement ||
        control instanceof HTMLButtonElement
      ) {
        control.disabled = true
      }
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true

    function updateOnlineState() {
      setIsOnline(navigator.onLine)
    }

    function handlePageHide() {
      // Firefox may restore native form state before React hydrates a history
      // entry. Harden the live controls synchronously before it snapshots them.
      disableConsentControlsImmediately()
      setLifecycleSuspended(true)
      resetConsentSession('idle')
    }

    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        resetConsentSession('idle')
        setLifecycleSuspended(false)
        const epoch = lifecycleEpochRef.current
        restoreAnimationFrameRef.current = requestAnimationFrame(() => {
          restoreAnimationFrameRef.current = null
          if (!mountedRef.current || lifecycleEpochRef.current !== epoch) {
            return
          }
          for (const control of formRef.current?.elements ?? []) {
            if (
              control instanceof HTMLInputElement ||
              control instanceof HTMLButtonElement
            ) {
              control.disabled = false
            }
          }
          const submitButton =
            formRef.current?.querySelector<HTMLButtonElement>(
              'button[type="submit"]',
            )
          if (submitButton && !browserIsOnline()) {
            submitButton.disabled = true
          }
        })
      }
    }

    updateOnlineState()
    window.addEventListener('online', updateOnlineState)
    window.addEventListener('offline', updateOnlineState)
    window.addEventListener('pagehide', handlePageHide)
    window.addEventListener('pageshow', handlePageShow)

    return () => {
      mountedRef.current = false
      window.removeEventListener('online', updateOnlineState)
      window.removeEventListener('offline', updateOnlineState)
      window.removeEventListener('pagehide', handlePageHide)
      window.removeEventListener('pageshow', handlePageShow)
      lifecycleEpochRef.current += 1
      activeRequestControllerRef.current?.abort()
      activeRequestControllerRef.current = null
      inFlightRef.current = false
      lastAttemptRef.current = null
      cancelScheduledFocus()
      cancelScheduledRestore()
      if (retryTimerRef.current !== null) {
        clearTimeout(retryTimerRef.current)
      }
      retryTimerRef.current = null
      retryDelayRef.current = false
    }
  }, [
    cancelScheduledFocus,
    cancelScheduledRestore,
    disableConsentControlsImmediately,
    resetConsentSession,
  ])

  function enforceRetryDelay(milliseconds: number) {
    clearRetryDelayTimer()
    const epoch = lifecycleEpochRef.current
    retryDelayRef.current = true
    setRetryDelayActive(true)
    retryTimerRef.current = setTimeout(() => {
      if (!mountedRef.current || lifecycleEpochRef.current !== epoch) {
        return
      }
      retryTimerRef.current = null
      retryDelayRef.current = false
      setRetryDelayActive(false)
    }, milliseconds)
  }

  function scheduleFocus(target: () => HTMLElement | null) {
    const epoch = lifecycleEpochRef.current
    cancelScheduledFocus()
    focusAnimationFrameRef.current = requestAnimationFrame(() => {
      focusAnimationFrameRef.current = null
      if (mountedRef.current && lifecycleEpochRef.current === epoch) {
        target()?.focus()
      }
    })
  }

  function resetSubmissionFeedback() {
    if (phase === 'failure') {
      setPhase('idle')
      setFailureMessage('')
      setCanRetry(false)
      clearRetryDelayTimer()
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

  function updateAttestation(value: boolean) {
    setAuthorizedNumberAttestation(value)
    setErrors((current) => ({ ...current, attestation: undefined }))
    resetSubmissionFeedback()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!isHydrated || inFlightRef.current) {
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
    if (!authorizedNumberAttestation) {
      nextErrors.attestation =
        'Check the authorization box to confirm you may consent for this number.'
    }

    setErrors(nextErrors)
    setFailureMessage('')
    setCanRetry(false)
    clearRetryDelayTimer()

    if (nextErrors.phone) {
      scheduleFocus(() => phoneRef.current)
      return
    }
    if (nextErrors.consent) {
      scheduleFocus(() => consentRef.current)
      return
    }
    if (nextErrors.attestation) {
      scheduleFocus(() => attestationRef.current)
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
      // The literal true reaches the request only after the independent control
      // has been affirmatively checked and validated above.
      submission: createSmsConsentSubmission(trimmedPhone, true),
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

    const epoch = lifecycleEpochRef.current
    const requestController = new AbortController()
    activeRequestControllerRef.current = requestController
    inFlightRef.current = true
    setPhase('submitting')
    setFailureMessage('')
    setCanRetry(false)

    try {
      const receipt = await activeClient.submit(
        attempt.submission,
        attempt.idempotencyKey,
        requestController.signal,
      )

      if (!isCurrentAsyncWork(epoch, requestController)) {
        return
      }

      if (!isDurableSmsConsentReceipt(receipt, attempt.idempotencyKey)) {
        throw new ConsentSubmissionError(
          'invalid-response',
          'The response did not confirm durable persistence.',
        )
      }

      lastAttemptRef.current = null
      clearRetryDelayTimer()
      setPhone('')
      setConsented(false)
      setAuthorizedNumberAttestation(false)
      setPhase('success')
    } catch (error) {
      if (!isCurrentAsyncWork(epoch, requestController)) {
        return
      }

      const disabled = isDisabledSubmissionError(error)
      const retryable = isRetryableSubmissionError(error)

      if (!retryable) {
        lastAttemptRef.current = null
      }
      if (
        retryable &&
        error instanceof ConsentSubmissionError &&
        error.retryAfterMs !== undefined
      ) {
        enforceRetryDelay(error.retryAfterMs)
      }

      setPhase('failure')
      setCanRetry(retryable)
      setFailureMessage(
        disabled
          ? 'Consent submission is not available yet. No consent was sent or recorded.'
          : 'We could not confirm that your consent was saved. It is being treated as not recorded. You can safely retry this same request.',
      )
    } finally {
      if (isCurrentAsyncWork(epoch, requestController)) {
        activeRequestControllerRef.current = null
        inFlightRef.current = false
      }
    }
  }

  function isCurrentAsyncWork(
    epoch: number,
    controller: AbortController,
  ): boolean {
    return (
      mountedRef.current &&
      lifecycleEpochRef.current === epoch &&
      activeRequestControllerRef.current === controller &&
      !controller.signal.aborted
    )
  }

  async function retry() {
    const attempt = lastAttemptRef.current
    if (!attempt || inFlightRef.current || retryDelayRef.current) {
      return
    }

    await send(attempt)
  }

  function decline() {
    resetConsentSession('declined')
  }

  function reconsider() {
    resetConsentSession('idle')
    scheduleFocus(() => phoneRef.current)
  }

  const submitting = phase === 'submitting'
  const validationErrorCount = [
    errors.phone,
    errors.consent,
    errors.attestation,
  ].filter(Boolean).length

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
                Choose whether to receive MyMedVisit SMS text messages.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[rgba(13,27,42,0.7)] sm:text-lg">
                MyMedVisit may send one-time verification codes, enrollment and
                consent confirmations, visit-preparation reminders, symptom
                check-in reminders, and care-workflow notifications. This page
                is not an enrollment for advertising or promotional messages.
              </p>
              <p className="mt-4 text-sm font-medium text-[var(--teal-dark)]">
                MyMedVisit, operated by SUGARCANEHAYES, is the sender of these
                messages.
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
              Review the disclosure and make your choice
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[rgba(13,27,42,0.68)]">
              Enter your mobile number and affirmatively check both boxes only
              if you want the described SMS messages and may consent for this
              number. You can decline or leave this page without opting in.
            </p>

            {phase === 'declined' ? (
              <div
                className="mt-8 rounded-2xl border border-[rgba(13,27,42,0.15)] bg-white/80 p-5"
                role="status"
                aria-live="polite"
              >
                <h3 className="text-lg font-semibold">
                  You have not opted in.
                </h3>
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
                <h3 className="text-lg font-semibold">
                  Your SMS consent was saved.
                </h3>
                <p className="mt-2 text-sm">
                  MyMedVisit confirmed that your consent record was durably
                  persisted. Reply STOP to any message to opt out.
                </p>
              </div>
            ) : (
              <>
                {!isHydrated && (
                  <p
                    id="sms-form-unavailable"
                    role="status"
                    aria-live="polite"
                    className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-950"
                  >
                    SMS choices are unavailable until this page finishes
                    loading. If JavaScript is disabled or unavailable, this form
                    cannot submit consent. Enable JavaScript and reload to make
                    a choice. No consent has been sent or recorded.
                  </p>
                )}
                <form
                  ref={formRef}
                  className="mt-8 space-y-6"
                  onSubmit={submit}
                  noValidate
                  aria-busy={submitting}
                  aria-describedby={
                    isHydrated ? undefined : 'sms-form-unavailable'
                  }
                >
                  <div>
                    <label
                      htmlFor="sms-phone"
                      className="text-sm font-semibold"
                    >
                      Mobile phone number
                    </label>
                    <input
                      ref={phoneRef}
                      id="sms-phone"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      disabled={!isHydrated || lifecycleSuspended || submitting}
                      value={phone}
                      onChange={(event) => updatePhone(event.target.value)}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={
                        errors.phone ? 'phone-help phone-error' : 'phone-help'
                      }
                      className="mt-2 w-full rounded-2xl border border-[rgba(13,27,42,0.25)] bg-white px-4 py-3 text-base outline-none transition-colors placeholder:text-slate-500 focus:border-[var(--teal-dark)] focus-visible:outline-[var(--teal-dark)] disabled:cursor-not-allowed disabled:opacity-70"
                      placeholder="Enter a mobile number"
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

                  <fieldset className="rounded-2xl border border-[rgba(13,27,42,0.18)] bg-white/80 p-5">
                    <legend className="px-1 text-sm font-semibold">
                      Transactional SMS consent
                    </legend>
                    <div className="mt-1 flex items-start gap-3">
                      <input
                        ref={consentRef}
                        id="sms-consent"
                        type="checkbox"
                        checked={consented}
                        disabled={
                          !isHydrated || lifecycleSuspended || submitting
                        }
                        onChange={(event) =>
                          updateConsent(event.target.checked)
                        }
                        aria-invalid={Boolean(errors.consent)}
                        aria-describedby={
                          errors.consent ? 'consent-error' : undefined
                        }
                        className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer accent-[var(--teal-dark)] focus-visible:outline-[var(--teal-dark)] disabled:cursor-not-allowed"
                      />
                      <label
                        htmlFor="sms-consent"
                        id="sms-consent-label"
                        className="cursor-pointer text-sm font-semibold leading-relaxed"
                      >
                        I agree to receive recurring SMS text messages from
                        MyMedVisit, operated by SUGARCANEHAYES, at the mobile
                        number I provide. Messages may include one-time
                        verification codes, enrollment and consent
                        confirmations, visit-preparation reminders, symptom
                        check-in reminders, and care-workflow notifications.
                        Message frequency varies. Message and data rates may
                        apply. Reply STOP to opt out or HELP for help. Consent
                        to receive text messages is not a condition of
                        purchasing any goods or services.
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

                    <p className="mt-4 pl-9 text-sm text-[rgba(13,27,42,0.72)]">
                      <Link
                        href={SMS_CONSENT_TERMS.reference}
                        className="rounded font-semibold text-[var(--teal-dark)] underline underline-offset-4"
                      >
                        Terms of Service
                      </Link>
                      {' · '}
                      <Link
                        href={SMS_CONSENT_PRIVACY.reference}
                        className="rounded font-semibold text-[var(--teal-dark)] underline underline-offset-4"
                      >
                        Privacy Policy
                      </Link>
                    </p>

                    <div className="mt-6 border-t border-[rgba(13,27,42,0.12)] pt-5">
                      <div className="flex items-start gap-3">
                        <input
                          ref={attestationRef}
                          id="authorized-number-attestation"
                          type="checkbox"
                          checked={authorizedNumberAttestation}
                          disabled={
                            !isHydrated || lifecycleSuspended || submitting
                          }
                          onChange={(event) =>
                            updateAttestation(event.target.checked)
                          }
                          aria-invalid={Boolean(errors.attestation)}
                          aria-describedby={
                            errors.attestation
                              ? 'attestation-description attestation-error'
                              : 'attestation-description'
                          }
                          className="mt-0.5 h-6 w-6 shrink-0 cursor-pointer accent-[var(--teal-dark)] focus-visible:outline-[var(--teal-dark)] disabled:cursor-not-allowed"
                        />
                        <label
                          htmlFor="authorized-number-attestation"
                          className="cursor-pointer text-sm font-semibold leading-relaxed"
                        >
                          I confirm that I am the subscriber or customary user
                          of this mobile number and am authorized to consent to
                          receive text messages at this number.
                        </label>
                      </div>
                      <p
                        id="attestation-description"
                        className="mt-2 pl-9 text-xs text-[rgba(13,27,42,0.65)]"
                      >
                        This statement records an attestation; it does not
                        verify ownership or possession of the number.
                      </p>
                      {errors.attestation && (
                        <p
                          id="attestation-error"
                          className="mt-3 text-sm font-semibold text-red-800"
                        >
                          {errors.attestation}
                        </p>
                      )}
                    </div>
                  </fieldset>

                  {validationErrorCount > 0 && (
                    <div
                      role="alert"
                      aria-live="assertive"
                      className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-900"
                    >
                      Please correct the highlighted field
                      {validationErrorCount === 1 ? '' : 's'} before continuing.
                    </div>
                  )}

                  {!isOnline && (
                    <p
                      role="status"
                      aria-live="polite"
                      className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-950"
                    >
                      You are offline. Reconnect before submitting. No consent
                      has been sent or recorded.
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
                          disabled={submitting || !isOnline || retryDelayActive}
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
                      disabled={!isHydrated || lifecycleSuspended || submitting}
                      className="min-h-12 flex-1 rounded-full border border-[var(--ink)] px-6 py-3 text-sm font-semibold transition-colors hover:bg-[var(--ink)] hover:text-white focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      No thanks
                    </button>
                    <button
                      type="submit"
                      disabled={
                        !isHydrated ||
                        lifecycleSuspended ||
                        submitting ||
                        !isOnline ||
                        (phase === 'failure' && canRetry)
                      }
                      className="min-h-12 flex-1 rounded-full bg-[var(--teal-dark)] px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow)] transition-colors hover:bg-[var(--ink)] focus-visible:outline-[var(--ink)] disabled:cursor-not-allowed disabled:bg-slate-500 disabled:shadow-none"
                    >
                      {submitting
                        ? 'Submitting…'
                        : 'Verify my number and enroll'}
                    </button>
                  </div>
                </form>
              </>
            )}

            <p className="mt-6 text-center text-sm text-[rgba(13,27,42,0.65)]">
              Entering a number or checking either box alone does not opt you
              in. Consent is requested only when you select Verify my number and
              enroll.
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

function subscribeToHydration() {
  return () => {}
}

function getHydratedSnapshot() {
  return true
}

function getServerHydrationSnapshot() {
  return false
}

function createBrowserIdempotencyKey(): string {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error('Secure UUID generation is unavailable.')
  }

  return globalThis.crypto.randomUUID()
}

function isDisabledSubmissionError(error: unknown): boolean {
  return error instanceof ConsentSubmissionError && error.code === 'disabled'
}

function isRetryableSubmissionError(error: unknown): boolean {
  if (!(error instanceof ConsentSubmissionError)) {
    // An unexpected client failure can still follow an ambiguous network send.
    // Preserve the attempt, but never retry it automatically.
    return true
  }

  return [
    'captcha-unavailable',
    'network',
    'invalid-response',
    'bot-check-failed',
    'rate-limited',
    'internal-error',
    'unavailable',
  ].includes(error.code)
}
