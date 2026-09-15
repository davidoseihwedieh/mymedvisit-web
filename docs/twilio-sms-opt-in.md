# Transactional SMS opt-in readiness

## Current safe state

- Public and canonical page URL: `https://mymedvisit.app/sms-opt-in`.
- QR destination: exactly `https://mymedvisit.app/sms-opt-in`. Scanning it opens the page and is not consent.
- The consent checkbox is controlled and initially unchecked. It is never preselected.
- Entering a number, checking the box, scanning the QR code, leaving the page, or selecting **No thanks** does not submit consent.
- The browser form is connected to `disabledSmsConsentClient`. It cannot contact a service or claim persistence.
- The route is `noindex,follow` while the form is disconnected. This keeps the unfinished flow out of search results without preventing reviewers or users with the URL from opening it.
- Route metadata declares exactly `https://mymedvisit.app/sms-opt-in` as canonical. Because this app uses Next.js static export, its source middleware is disabled in the exported artifact; the hosting/domain layer must be verified to ensure that exact canonical URL resolves without redirecting to `www`.

Do not enable submission merely because an endpoint or environment variable exists. The contract, security controls, legal language, retention behavior, and production verification below must all be approved first.

## Public workflow

1. A user enters a mobile number.
2. The user reviews the transactional-only disclosure and the Terms and Privacy links.
3. The user affirmatively checks the unchecked consent box.
4. Only **Agree and continue** may create a consent request.
5. The button and form controls are disabled during a request. A synchronous in-flight guard also prevents duplicate submissions before React rerenders.
6. The UI may show success only after a response confirms durable persistence and echoes the request's idempotency key.
7. Any network error, timeout, non-2xx response, malformed response, or ambiguous outcome is displayed and treated as **not recorded**. A retry reuses the original payload and idempotency key.

The page clears the entered phone number after success or decline. It never puts the number or consent data in a URL and the client/API boundary contains no logging calls.

## Central consent constants

Client-safe, non-secret values live in `src/lib/sms-consent/constants.ts`:

- canonical page URL;
- disclosure and page versions;
- Terms version and reference;
- Privacy version and reference;
- consent source; and
- transactional message categories.

The disclosure, page, Terms, and Privacy versions currently equal `PENDING_LEGAL_AND_COMPLIANCE_REVIEW`. This is intentional. Do not replace them with dates or approval claims until counsel/compliance supplies the identifiers for the exact approved text.

The current categories are:

- one-time verification codes;
- account-security messages; and
- requested service notifications.

Any category change requires corresponding disclosure, policy, message-template, backend allowlist, and version updates.

## Preliminary backend contract (not approved)

The typed boundary in `src/lib/sms-consent/client.ts` is a proposed client contract, not authorization to connect it. The final endpoint method, path, authentication/abuse controls, request schema, and response schema remain backend decisions.

### Transport assumptions

- HTTPS `POST` only.
- No phone number, consent value, record ID, or idempotency key in the URL or query string.
- `Content-Type: application/json`.
- `Idempotency-Key: <browser-generated UUID>`.
- No browser credentials by default (`credentials: omit`). If an authenticated contract is chosen, security review and boundary changes are required.
- No redirects, no referrer, and no caching.
- Ten-second client timeout unless the approved contract specifies otherwise.
- Cross-origin deployment, if approved, must allow only expected website origins and required headers/methods. It must not use permissive CORS with credentials.

### Proposed request body

```json
{
  "phoneNumber": "user-entered value; backend normalization contract pending",
  "disclosureVersion": "PENDING_LEGAL_AND_COMPLIANCE_REVIEW",
  "pageVersion": "PENDING_LEGAL_AND_COMPLIANCE_REVIEW",
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
  "transactionalMessageCategories": [
    "one_time_verification_codes",
    "account_security_messages",
    "requested_service_notifications"
  ]
}
```

The backend must decide whether the browser sends an E.164 number or an unnormalized user entry. The current boundary trims surrounding whitespace only. The endpoint must reject invalid/non-mobile numbers and either normalize them or return a field-safe validation result without reflecting the number.

### Proposed durable-success response

```json
{
  "status": "persisted",
  "recordId": "opaque-nonempty-record-id",
  "persistedAt": "server-generated-UTC-ISO-timestamp-ending-in-Z",
  "idempotencyKey": "same-value-as-request-header"
}
```

All four fields are required by the current validator. The idempotency key must match the request. A generic `accepted`, queued, or 2xx response is not success. If durable persistence is asynchronous, the frontend contract must be redesigned so it does not display success before a durable record is confirmed.

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

No environment variable is currently required because the production form is deliberately disconnected.

If security review approves a separate public API origin, use the non-secret build-time variable:

```text
NEXT_PUBLIC_SMS_CONSENT_API_BASE_URL
```

This must contain only an approved HTTPS public base/origin—never credentials, tokens, a Cloud Run service URL chosen ad hoc, path parameters, query parameters, or sensitive data. The exact endpoint path remains part of the unconfirmed contract and is passed separately to `createHttpSmsConsentClient`.

Before connecting the route, a developer must make a reviewed code change that:

1. supplies the approved endpoint path and the public base URL;
2. replaces `disabledSmsConsentClient` in the rendered component with the configured HTTP client;
3. changes the code-controlled `SMS_CONSENT_INTEGRATION_ENABLED` safety switch only after all approvals (an environment variable alone must not enable submission);
4. replaces every pending version constant with counsel-approved identifiers;
5. adds contract/integration tests against an isolated fake or preview endpoint using only reserved test numbers; and
6. makes the explicit, reviewed indexing decision. If indexing is approved, update both general and Google bot metadata from `index: false` to `index: true`.

Do not store secrets in `NEXT_PUBLIC_*`; Next.js embeds these values in browser assets.

## Sample transactional messages

- `MyMedVisit verification code: 123456. This code expires soon. Reply STOP to opt out. HELP for help.`
- `MyMedVisit: Your requested account-security notification is ready. Reply STOP to opt out. HELP for help.`
- `MyMedVisit: Your requested care-related service notification is available. Reply STOP to opt out. HELP for help.`

These examples contain no patient symptoms, diagnoses, appointment details, real credentials, or real phone numbers. They are examples only; final templates require legal/compliance and provider approval.

## Local and preview verification

Use test numbers only, such as `(555) 555-0123`, and no PHI.

1. From a clean dependency install, run:

   ```sh
   npm ci
   npm run typecheck
   npm test
   npm run lint:sms
   npm run build
   npm audit --omit=dev --audit-level=high
   git diff --check
   ```

   Also run repository-wide `npm run lint`. The ESLint configuration
   grandfathers the `react/no-unescaped-entities` rule only for four legacy page
   files that predate this track; the SMS files retain the full
   `next/core-web-vitals` rules. Existing legacy `<img>` optimization warnings
   remain visible and should be handled in their own website-maintenance track.
   The production dependency audit must also pass before release. At the time of
   this handoff, the current Next.js 14 dependency tree reports high/critical
   advisories whose complete npm-recommended remediation is a breaking framework
   upgrade; that upgrade is outside this SMS-only track and has not been applied.

2. Serve the static export locally without changing platform configuration:

   ```sh
   python3 -m http.server 3000 --directory out
   ```

3. Open `http://localhost:3000/sms-opt-in/` and verify at 320, 375, 768, 1024, and 1440 CSS pixels, portrait and landscape where relevant. Confirm there is no horizontal scrolling, clipped disclosure, overlapping content, or undersized control.
4. At 200% browser zoom, confirm the layout reflows and all controls/text remain available.
5. Keyboard only: tab through the QR link, phone field, checkbox, Terms, Privacy, decline, and submit controls. Confirm the focus ring is always visible; Space toggles the checkbox; Enter submits only from the submit control/form; and focus moves to the first invalid field.
6. With a screen reader, confirm headings/landmarks, phone help/error association, checkbox disclosure, alert announcements, loading status, offline status, decline status, and durable-success status.
7. Confirm initial checkbox state is unchecked after reload and back/forward navigation.
8. Confirm entering a number, checking only the box, selecting **No thanks**, and going offline create no request.
9. With the current disabled client, a complete submit must say no consent was sent or recorded and must never show success.
10. Decode the QR using at least two physical devices/camera apps and confirm it opens exactly `https://mymedvisit.app/sms-opt-in` with no query or fragment. The automated test also decodes the SVG payload.
11. Inspect generated `out/sms-opt-in.html` for the exact canonical URL, title, description, and `noindex, follow` robots value. Search generated output and browser network requests to confirm no phone number appears in URLs.

## Production verification after approvals (not performed here)

1. Confirm the approved release artifact, environment, endpoint origin/path, versions, and indexing choice with two reviewers.
2. Confirm `https://mymedvisit.app/sms-opt-in` returns the page without redirecting to `www`, while unrelated apex routes retain existing redirect behavior.
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

- Approval of the exact opt-in disclosure, button labels, decline wording, success wording, and sample message templates.
- Authoritative version identifiers for the disclosure/page, Terms, and Privacy text. Do not infer them from existing “Last updated” dates.
- Whether and how the legal pages' displayed update dates change when the SMS sections are approved.
- Reconciliation of the existing age language: the Terms say users must be at least 13, while the Privacy Policy says the app is not intended for people under 18.
- Confirmation that all three categories are strictly transactional and that “requested service notifications” is sufficiently specific.
- Approved sender identity, message frequency statement, carrier rate statement, STOP/HELP flows, help contact, quiet-hours requirements, and supported countries.
- Whether consent records or phone numbers are regulated health/personal data in each operating jurisdiction, plus retention/deletion/access rules.
- Whether the Privacy language about sale/sharing and Twilio processing is complete and accurate for the final data flow and vendors.
- Relationship between website consent, account ownership/number verification, in-app notification preferences, prior consent, number reassignment, and provider-side opt-out state.
- Whether the public page should be indexed after the flow is live. It remains `noindex,follow` until that decision is approved.
- Provider campaign/toll-free verification approval and the exact evidence/screenshots required.

Counsel, compliance, security, privacy, and the endpoint owner must approve their respective items before production submission is enabled.
