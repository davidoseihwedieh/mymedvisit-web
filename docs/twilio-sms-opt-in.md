# Transactional SMS opt-in readiness

## 2026-09-22 hotfix for Twilio toll-free verification rejection 30513

Twilio rejected toll-free verification for `+18337254061` (SUGARCANEHAYES)
with reason code 30513 ("Opt-in - Consent for messaging is a requirement for
service"). This revision corrects the opt-in page's language and
presentation only: an explicit SMS-consent checkbox naming the sender
(MyMedVisit, operated by SUGARCANEHAYES) and the exact message categories
submitted for verification, a separate number-control attestation checkbox,
and Terms/Privacy links displayed immediately beneath the consent checkbox
rather than combined with it. It does **not** enable the backend, send any
SMS, or claim that consent was recorded - see "Current safe state" below,
which is unchanged by this revision. The exact wording was authored/approved
directly by the founder as a product decision (matching
`product-approved-2026-09-20`'s precedent in
`docs/compliance/sms-opt-in-product-approval-record.md`), not an
outside-counsel sign-off.

**Known, deliberately out-of-scope gap:** the disclosure/checkbox now names
five message categories (one-time verification codes, enrollment and
consent confirmations, visit-preparation reminders, symptom check-in
reminders, and care-workflow notifications). The technical wire contract's
`transactionalMessageCategories` allowlist (`src/lib/sms-consent/constants.ts`,
see "Central consent constants" below) still contains only
`one_time_verification_codes` - expanding it is a backend-allowlist change,
which this hotfix explicitly does not make. This is safe only because the
integration remains fully disabled (`SMS_CONSENT_INTEGRATION_ENABLED =
false`): nothing is ever actually submitted, so there is no live request for
the broader disclosure to contradict. Do not enable the backend without
first reconciling this gap - either by expanding the allowlist to match the
disclosure, or by narrowing the disclosure back to what the allowlist
supports.

## Current safe state

- Public and canonical page URL: `https://mymedvisit.app/sms-opt-in`.
- QR destination: exactly `https://mymedvisit.app/sms-opt-in`. Scanning it opens the page and is not consent.
- The SMS-consent and authorized-number-attestation checkboxes are separate, controlled, initially unchecked controls. Neither is ever preselected. Terms of Service and Privacy Policy links are displayed immediately beneath the SMS-consent checkbox as plain links, never combined with SMS-consent acceptance into one statement.
- The server-rendered phone field and both checkboxes have no serializable names and remain disabled until React confirms hydration. If JavaScript is unavailable, the page explains that no consent can be submitted.
- Entering a number, checking the box, scanning the QR code, leaving the page, or selecting **No thanks** does not submit consent.
- The browser form is connected to `disabledSmsConsentClient` in every production build. The literal `SMS_CONSENT_INTEGRATION_ENABLED = false` gate prevents API/site-key environment values from constructing an HTTP transport, loading Google, executing reCAPTCHA, contacting a capture service, or claiming persistence.
- The route is `noindex,follow` while the form is disconnected. This keeps the unfinished flow out of search results without preventing reviewers or users with the URL from opening it.
- Route metadata declares exactly `https://mymedvisit.app/sms-opt-in` as canonical. Because this app uses Next.js static export and has no application middleware for host redirects, the hosting/domain layer must be verified to ensure that exact canonical URL resolves with the approved host behavior.

Do not enable submission merely because an endpoint or environment variable exists. The contract, security controls, legal language, retention behavior, and production verification below must all be approved first.

## Public workflow

1. A user enters a mobile number using the visibly labeled phone field.
2. The user reviews the SMS-consent checkbox's own disclosure text (sender/legal-applicant identity, exact message categories, frequency, rates, STOP/HELP, and the not-a-condition-of-purchase statement) and, immediately beneath it, the separate Terms of Service and Privacy Policy links.
3. The user separately checks the unchecked SMS-consent and authorized-number-attestation controls. Checking one never checks or implies the other, and neither implies acceptance of the Terms or Privacy links.
4. Only **Verify my number and enroll** may create a consent request; leaving the SMS-consent checkbox unchecked always blocks submission and focuses that checkbox, regardless of the attestation checkbox's state.
5. The button and form controls are disabled during a request. A synchronous in-flight guard also prevents duplicate submissions before React rerenders.
6. The UI may show success only after a response confirms durable persistence and echoes the request's idempotency key.
7. Any network error, timeout, disallowed status, malformed response, or ambiguous outcome is displayed and treated as **not recorded**. An explicit approved retry reuses the stable nine-field logical payload and idempotency key but obtains a fresh reCAPTCHA token for the new HTTP attempt.

The page clears the entered phone number after success or decline. It never puts the number or consent data in a URL and the client/API boundary contains no logging calls.

The page also invalidates and aborts active work on `pagehide`, unmount,
decline, reset, and persisted `pageshow`. A lifecycle generation prevents a
token or client promise created before navigation from changing restored UI.
A persisted restore always returns the phone and both controls to an empty,
unchecked, enabled post-hydration state and discards validation, feedback,
retry identity, timers, and loading state. Pre-hydration and no-JavaScript
controls remain inert.

## Central consent constants

Client-safe, non-secret values live in `src/lib/sms-consent/constants.ts`:

- canonical page URL;
- disclosure and page versions;
- Terms version and reference;
- Privacy version and reference;
- consent source; and
- transactional message categories.

The disclosure and page versions equal `product-approved-2026-09-22` -
minted for the 2026-09-22 Twilio-30513 copy hotfix described above, following
the same founder-approval pattern as `product-approved-2026-09-20`. The Terms
and Privacy versions still equal `PENDING_LEGAL_AND_COMPLIANCE_REVIEW`; this
hotfix does not touch Terms/Privacy content. Do not replace the Terms/Privacy
placeholders with dates or approval claims until counsel/compliance supplies
the identifiers for that exact approved text.

The closed technical taxonomy (`src/lib/sms-consent/constants.ts`) remains:

- one-time verification codes;
- account-security messages; and
- requested service notifications.

The proposed, unapproved initial website request contains exactly
`one_time_verification_codes`. The other taxonomy members remain deferred. Any
category change requires corresponding disclosure, policy, backend allowlist,
and version updates; outbound message templates remain outside capture-only v1.
**This taxonomy is unchanged by the 2026-09-22 hotfix above** - the visible
disclosure now names five categories for toll-free verification review, but
the technical allowlist intentionally still only contains
`one_time_verification_codes` until the backend is separately extended. See
the hotfix section's "known, deliberately out-of-scope gap" note.

## Approved technical contract; production values remain unapproved

The capture-only technical contract is frozen by the backend design, but this
document and its implementation do not authorize connection or production
capture. The future canonical endpoint is HTTPS
`https://api.mymedvisit.app/api/v1/sms-consent`. Its deployment, public routing,
approved origins, reCAPTCHA key/host, policy allowlists, and production
authorization remain unresolved gates.

### Transport assumptions

- HTTPS `POST` only.
- No phone number, consent value, record ID, or idempotency key in the URL or query string.
- `Content-Type: application/json`.
- `Idempotency-Key: <browser-generated UUID>`.
- No browser credentials by default (`credentials: omit`). If an authenticated contract is chosen, security review and boundary changes are required.
- No redirects, no referrer, and no caching.
- Ten-second client timeout.
- Cross-origin deployment must allow only separately approved exact origins and `Content-Type, Idempotency-Key` for `POST, OPTIONS`. It must omit credentialed CORS.

### Exact closed ten-field request body

```json
{
  "phoneNumber": "user-entered value; backend normalization contract pending",
  "disclosureVersion": "product-approved-2026-09-22",
  "pageVersion": "product-approved-2026-09-22",
  "pageUrl": "https://mymedvisit.app/sms-opt-in",
  "privacy": {
    "reference": "https://mymedvisit.app/privacy",
    "version": "PENDING_LEGAL_AND_COMPLIANCE_REVIEW"
  },
  "source": "mymedvisit_web_sms_opt_in",
  "terms": {
    "reference": "https://mymedvisit.app/terms",
    "version": "PENDING_LEGAL_AND_COMPLIANCE_REVIEW"
  },
  "transactionalMessageCategories": ["one_time_verification_codes"],
  "authorizedNumberAttestation": true,
  "recaptchaToken": "<fresh single-use reCAPTCHA Enterprise token>"
}
```

All ten root properties are required and additional properties are forbidden.
`authorizedNumberAttestation` must be literal `true`. The browser may send the
accepted user entry; the backend performs authoritative E.164 normalization and
returns only generic validation failures. The reCAPTCHA token exists only in the
attempt-local wire request and is excluded from the stable logical payload.

### Exact durable-success response

```json
{
  "status": "persisted",
  "evidenceId": "sce_22222222-2222-4222-8222-222222222222",
  "recordedAt": "server-generated canonical UTC timestamp such as 2026-09-15T12:00:00.000Z",
  "idempotencyKey": "11111111-1111-4111-8111-111111111111"
}
```

These are the only permitted fields. HTTP `201` means initial persistence and
HTTP `200` means exact idempotent replay; every other status, including another
2xx status, is failure. `evidenceId` must be `sce_` plus a lowercase UUIDv4. The
idempotency key must match byte-for-byte. `recordedAt` must exactly round-trip
through canonical millisecond UTC. Extra, inherited, symbol, proxy-derived,
malformed, reflected, wrong-content-type, redirected, or cacheable responses are
rejected.

Every application error has only `error.code` plus the fixed message `Request
could not be completed.` The client validates the exact status/code pairing but
never displays or logs the backend code, body, phone, token, score, reason, or
correlation detail. `503 consent_capture_unavailable` requires
`Retry-After: 5`. Definitive 400, request-not-allowed 403, 405, 409, 413, and 415
responses are not retried automatically or offered as an unchanged retained
attempt.

### reCAPTCHA attempt lifecycle

- The action is exactly `sms_consent_submit`.
- Validation completes before token acquisition.
- Every actual HTTP attempt obtains a fresh token immediately before building
  the wire object.
- No token is retained in React state, refs, retry state, storage, a URL,
  navigation, analytics, or logs.
- Network ambiguity, malformed success, 429, 500, 503, and approved retryable
  CAPTCHA failure retain the logical payload/key while discarding the token.
- Script blocking, readiness failure, or execution rejection is generic failure
  and makes no capture request.
- Production currently loads no reCAPTCHA script. Script host, presentation,
  public site key, and cookie treatment remain approval gates.

### Persistence and security assumptions requiring confirmation

The approved endpoint must:

- atomically enforce idempotency so retries cannot create duplicate consent records;
- generate the authoritative UTC persistence timestamp on the server;
- store the exact approved disclosure/page/policy versions and category allowlist;
- retain an auditable affirmative-consent record plus current revocation status;
- define how STOP/HELP provider events update or supersede consent state;
- return the same durable result for a repeated idempotency key and identical payload, and reject key reuse with a different payload;
- rate-limit and protect the public endpoint from automated abuse without leaking whether a number is registered;
- encrypt/protect phone numbers and consent records under the approved data classification and retention policy;
- never write raw phone numbers, request bodies, or consent payloads to application, proxy, CDN, WAF, analytics, error-tracking, or tracing logs; and
- use safe, non-reflective errors. The frontend intentionally does not display backend response bodies.

## Environment and connection plan

No environment variable is currently required because the production form is deliberately disconnected. Browser tests use only a development-and-loopback-restricted `.invalid` adapter intercepted before network access; it cannot be selected by a production build.

If security review approves a separate public API origin, use the non-secret build-time variable:

```text
NEXT_PUBLIC_SMS_CONSENT_API_BASE_URL
```

This must eventually equal exactly `https://api.mymedvisit.app`—never
credentials, tokens, a Cloud Run URL, path, query, or sensitive data. A separate
public `NEXT_PUBLIC_SMS_CONSENT_RECAPTCHA_SITE_KEY` may be supplied only after
the key and host treatment are approved. Neither environment value can change
the literal disabled gate.

Before connecting the route, a developer must make a reviewed code change that:

1. supplies the approved public base URL for the canonical `/api/v1/sms-consent` endpoint;
2. installs the approved reCAPTCHA loader/site key and exact host policy;
3. supplies the approved production HTTP client behind the code gate;
4. changes `SMS_CONSENT_INTEGRATION_ENABLED` only after every gate and a separate evidence-bound production authorization;
5. replaces every pending version constant with approved immutable identifiers and matching server allowlists;
6. proves CORS, security headers, privacy leakage, staging, readiness, rollback, and exact release-candidate evidence; and
7. makes the explicit reviewed indexing decision.

Do not store secrets in `NEXT_PUBLIC_*`; Next.js embeds these values in browser assets.

### Production graph and artifact enforcement

The production Webpack compilation applies a fail-closed module-graph plugin to
the client and server graphs. It classifies canonical resolved resource paths
and inspects Webpack `ExternalModule` request metadata even when `resource` is
absent. External request, user request, identifier, readable identifier,
external type, and exposed dependency request metadata are normalized without
invoking getters. The accepted Webpack external types are the exact raw string
values `commonjs`, `commonjs2`, `module`, `import`, and `node-commonjs`; type
validation performs no trimming, case folding, Unicode normalization, or
coercion. Missing, non-string, accessor-backed, proxied, or otherwise
noncanonical types fail the compilation. Traversal, loader, query, fragment,
encoded, whitespace, control-character, case-alias, and normalization-ambiguous
requests fail closed. A relative Webpack `userRequest` containing traversal is accepted only
when canonical resolution proves it stays inside the same approved production
package as its external package request.
Package externals are closed against `dependencies` in `package.json`; every
`devDependencies` package and a small explicit transitive test-tool denylist is
forbidden. The policy also rejects Jest, Vitest, Testing Library, Playwright,
axe adapters, test runners, and mock tooling (including their test-tool
namespaces). A package duplicated across production and development dependency
sets invalidates the policy. Only the five listed Webpack external types,
recognized Node built-ins, and approved production dependencies are accepted;
unknown bare package externals fail closed. Reports include sorted external
identities, external type, and classification, and the verifier reclassifies
each entry under the same policy.

The plugin rejects the browser-test client, disabled HTTP transport, reCAPTCHA
boundary, and test/fixture/support modules whether resolved locally or
externalized. The intercepted browser-test adapter is selected only through a
development-only alias; it is never a production import. Reports are cleared
before each required `npm run build` sequence, and the production compilation
itself fails for a forbidden module before report verification. The reports
are deterministic consistency evidence, not a cryptographic attestation of
which compiler produced them: standalone report verification can validate a
fabricated safe report. Therefore CI and release builds must use the mandatory
`npm run build` sequence (preparation, both client/server production
compilations, then verification), not the verifier alone. The compiler graph
is the authoritative module-absence control.

The generated-artifact scanner has a different purpose: it enumerates every
regular output artifact and detects literal or supported encoded privacy leaks
in text, JavaScript constants, inline executable scripts, structured data, and
approved binary types. Its finite decoding and constant-folding checks are
defense in depth; they do not claim to determine arbitrary JavaScript behavior
or replace the compiler graph.

## Sample transactional messages

One sample per category named in the 2026-09-22 SMS-consent checkbox
disclosure, matching it exactly for toll-free verification submission:

- One-time verification codes: `MyMedVisit verification code: 123456. This code expires soon. Reply STOP to opt out. HELP for help.`
- Enrollment and consent confirmations: `MyMedVisit: You're enrolled to receive SMS messages from MyMedVisit, operated by SUGARCANEHAYES. Reply STOP to opt out. HELP for help.`
- Visit-preparation reminders: `MyMedVisit: A visit-preparation reminder is ready in your account. Reply STOP to opt out. HELP for help.`
- Symptom check-in reminders: `MyMedVisit: This is your requested symptom check-in reminder. Reply STOP to opt out. HELP for help.`
- Care-workflow notifications: `MyMedVisit: A care-workflow notification is available in your account. Reply STOP to opt out. HELP for help.`

These examples contain no patient symptoms, diagnoses, appointment details, real credentials, or real phone numbers. They are examples only; final templates require legal/compliance and provider approval. As noted above, the technical backend only sends the first of these today (`one_time_verification_codes`); the other four are disclosed here for toll-free verification review and require a corresponding backend-allowlist change before any of them could ever actually be sent - the integration remains fully disabled regardless.

## Local and preview verification

Use only synthetic reserved numbers supplied by the test fixtures, and no PHI.

1. From a clean dependency install, run:

   ```sh
   npm ci
   npm run typecheck
   npm test
   npm run format:check:sms
   npm run lint:sms
   npm run build
   npm run verify:module-graph
   npm run verify:sms-artifacts
   npm run verify:qr
   npm run audit:production
   npm run audit:development
   npm run test:browser
   npm run test:bfcache
   git diff --check
   ```

   Also run repository-wide `npm run lint`. The ESLint configuration
   grandfathers the `react/no-unescaped-entities` rule only for four legacy page
   files that predate this track; the SMS files retain the full
   `next/core-web-vitals` rules. Existing legacy `<img>` optimization warnings
   remain visible and should be handled in their own website-maintenance track.
   The production dependency audit must also pass before release. This branch
   retains Next.js `16.3.3`, React/React DOM `19.2.8`, PostCSS `8.5.23`, and
   nanoid `3.3.19`; rerun the audit from a clean lockfile install rather than
   relying on these recorded versions alone. Development-only findings remain a
   separately enforced through the exact, expiring
   `security/development-audit-policy.json`; new, changed, or expired
   advisories fail CI. The production audit remains a zero-finding gate.

   Playwright 1.63 disables BFCache by default and its documented
   `page.goBack()`/`page.goForward()` helpers are not proof of BFCache. The
   regular three-engine suite therefore enforces lifecycle behavior with real
   `PageTransitionEvent` instances and separately checks back/forward
   navigation for hydration/runtime failures. The dedicated headed Chromium
   config removes Playwright's `--disable-back-forward-cache` default, blocks
   external DNS, and passes only after the browser itself emits
   `pageshow.persisted === true`; CI supplies a virtual display. It does not
   substitute a reload result.

2. Serve the static export locally without changing platform configuration:

   ```sh
   npx --yes serve@14.2.5 out --listen 3000 --no-clipboard
   ```

3. Open `http://localhost:3000/sms-opt-in` without a trailing slash. Confirm the routing-aware static server returns the SMS page rather than the exported React Server Component directory, then verify at 320, 375, 768, 1024, and 1440 CSS pixels, portrait and landscape where relevant. Confirm there is no horizontal scrolling, clipped disclosure, overlapping content, or undersized control.
4. At 200% browser zoom, confirm the layout reflows and all controls/text remain available.
5. Keyboard only: tab through the QR link, phone field, checkbox, Terms, Privacy, decline, and submit controls. Confirm the focus ring is always visible; Space toggles the checkbox; Enter submits only from the submit control/form; and focus moves to the first invalid field.
6. With a screen reader, confirm headings/landmarks, phone help/error association, checkbox disclosure, alert announcements, loading status, offline status, decline status, and durable-success status.
7. Confirm both checkbox states are unchecked after reload and back/forward navigation.
8. Confirm entering a number, checking either or both boxes without submit, selecting **No thanks**, and going offline create no request.
9. With the current literal disabled client, a complete submit must load no Google script, make no API request, say no consent was sent or recorded, and never show success.
10. Decode the QR using at least two physical devices/camera apps and confirm it opens exactly `https://mymedvisit.app/sms-opt-in` with no query or fragment. The automated test also decodes the SVG payload.
11. Inspect generated `out/sms-opt-in.html` for the exact canonical URL, title, description, and `noindex, follow` robots value. Search generated output and browser network requests to confirm no phone number appears in URLs.
12. Run `npm run test:browser`. Its `.invalid` CAPTCHA/capture routes are intercepted before network access and exercise no-JavaScript state, focus order, 201/200, lost-response retry with fresh tokens, CORS preflight, offline recovery, duplicate clicks, navigation, responsive layout, and privacy leakage across installed engines.

## Production verification after approvals (not performed here)

1. Confirm the approved release artifact, environment, endpoint origin/path, versions, and indexing choice with two reviewers.
2. Confirm `https://mymedvisit.app/sms-opt-in` returns the page and that apex/`www` behavior matches the separately approved hosting policy; do not assume application middleware provides a redirect.
3. Repeat the viewport, zoom, keyboard, screen-reader, QR, metadata, and offline checks above on the production URL.
4. Submit once with an approved reserved/test number. Confirm the UI remains loading until durable persistence is returned.
5. Through an approved, access-controlled backend verification path, confirm exactly one record has the normalized test number/reference, categories, exact versions, server UTC timestamp, source, page URL, correlation/idempotency data, and revocation state.
6. Double-submit and retry an intentionally interrupted test request. Confirm at most one durable record and the same idempotent response.
7. Force non-2xx, timeout, malformed, mismatched-idempotency, and offline cases. None may display success.
8. Confirm raw numbers and consent payloads do not appear in browser analytics, URLs, CDN/proxy/WAF logs, application logs, traces, error monitoring, or provider diagnostics beyond approved protected storage.
9. Verify STOP and HELP end to end using the approved message templates and confirm revocation propagation.
10. Capture provider-review screenshots only after the wording and policies are approved. Include sender, transactional categories, frequency, rates, STOP/HELP, optional-consent statement, unchecked control, and Terms/Privacy links.

## Rollback

If a release is unhealthy or any persistence/logging/compliance check fails:

1. Immediately disable the website integration with the code-controlled switch and release the disconnected form state. Do not rely only on removing a browser-visible environment value.
2. Roll back the website to the last known-good deployment/artifact using the normal platform rollback procedure. Do not rewrite Git history.
3. Disable or restrict the consent endpoint through the approved backend runbook; do not delete consent records or logs as part of a website rollback.
4. Preserve idempotency/audit records and investigate ambiguous requests as not confirmed in the UI.
5. Re-run the full local/preview suite and production read-only checks before re-enabling.

The current disconnected branch can also be retained as the safe website fallback: it validates the choice but explicitly reports that no consent was sent or recorded.

## Unresolved legal/compliance decisions

- Approval of the exact opt-in disclosure, button labels, decline wording, success wording, and sample message templates. The SMS-consent checkbox, attestation checkbox, decline wording, and CTA label were founder-approved 2026-09-22 as `product-approved-2026-09-22` (see the hotfix section above); this is still not an outside-counsel sign-off.
- Authoritative version identifiers for the Terms and Privacy text specifically. Do not infer them from existing "Last updated" dates. (The disclosure/page identifier is resolved above; Terms/Privacy remain `PENDING_LEGAL_AND_COMPLIANCE_REVIEW`.)
- Whether and how the legal pages' displayed update dates change when the SMS sections are approved.
- Reconciliation of the existing age language: the Terms say users must be at least 13, while the Privacy Policy says the app is not intended for people under 18.
- Approval of the five disclosed message categories as the backend's _enabled_ subset - the 2026-09-22 disclosure names all five for toll-free verification review, but the technical allowlist (`TRANSACTIONAL_MESSAGE_CATEGORIES`) still only contains `one_time_verification_codes`, and the whole integration remains disabled regardless. Expanding the allowlist to actually match the disclosure is a separate, not-yet-made decision.
- Approved sender identity, message frequency statement, carrier rate statement, STOP/HELP flows, help contact, quiet-hours requirements, and supported countries.
- Whether consent records or phone numbers are regulated health/personal data in each operating jurisdiction, plus retention/deletion/access rules.
- Whether the Privacy language about sale/sharing and Twilio processing is complete and accurate for the final data flow and vendors.
- Relationship between website consent, account ownership/number verification, in-app notification preferences, prior consent, number reassignment, and provider-side opt-out state.
- Whether the public page should be indexed after the flow is live. It remains `noindex,follow` until that decision is approved.
- Approved reCAPTCHA script host/presentation, site key, `_GRECAPTCHA` treatment, exact production CORS origins, and final CSP additions. No broad Google CSP is guessed here.
- Provider campaign/toll-free verification approval and the exact evidence/screenshots required.

Counsel, compliance, security, privacy, and the endpoint owner must approve their respective items before production submission is enabled.
