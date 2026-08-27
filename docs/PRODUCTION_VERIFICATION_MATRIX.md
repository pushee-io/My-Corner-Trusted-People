# Production Verification Matrix

Last verified: 2026-08-27
Target market: Ghana
Status: readiness and sandbox verification only; production activation is not approved

## Operating Rules

- Do not send real SMS, buy verification credits, activate identity checks, or process real identity documents without explicit founder approval.
- Do not expose service-role, SMS-provider, identity-provider, or OpenAI credentials in the mobile application.
- Do not label a person trusted solely from an automated decision.
- Keep exact addresses, identity inputs, credential documents, and safety evidence private and access-controlled.
- Every high-impact rejection or enforcement decision requires human review and an appeal path.
- Production verification requires evidence from the exact deployed environment and exact mobile build.

## Readiness Matrix

| Area | Current evidence | Production blocker | Required verification | Approval gate |
| --- | --- | --- | --- | --- |
| Phone and SMS | Ghana +233 normalization exists. Test provider is now restricted to explicit local development. | No real server-backed OTP provider is configured. | Sandbox send, verify, resend, expiry, rate-limit, duplicate-account, SIM-change, delivery-failure, and Ghana carrier tests. | Provider account, sender ID, pricing, and first real SMS require founder approval. |
| Identity | Test-only assurance screens exist. No Ghana Card image is collected by the prototype. | No approved vendor, consent, retention schedule, or human-review workflow. | Sandbox Ghana Card/passport/voter-ID cases, mismatch handling, liveness failure, manual review, deletion, audit, and appeal. | Activating identity verification or background checks requires founder approval and legal/privacy review. |
| Address | GhanaPost GPS format validation, private labels, and exact-address warnings exist. | Address is client-local and is not proof of residence. No approved official GhanaPost GPS API integration is documented. | Server-side encrypted storage, RLS, access logging, deletion, broad-area derivation, and post-confirmation disclosure tests. | Real address collection and any third-party address API require privacy review and founder approval. |
| Provider credentials | Trust-signal model supports moderator-reviewed evidence. | No credential intake, expiry, issuer verification, or revocation workflow. | Private upload, malware/file validation, moderator queue, expiry reminders, revocation, audit, and public evidence-label tests. | Publicly displaying a credential requires verified evidence and moderator approval. |
| Content moderation | Deterministic placeholder rules exist; AI flag defaults off. | No server-side OpenAI moderation call, image screening, model-event log, human queue, or appeals integration. | Edge Function timeout/fallback, text/image evaluation set, false-positive review, human decision, appeal, and cost/latency measurements. | Enabling customer-facing enforcement requires founder approval of policy and thresholds. |
| Job safety session | Reporting and status history exist in adjacent flows. | No formal safety-session record, check-in workflow, escalation policy, or sensitive-evidence retention controls. | Start/end session, trusted contact opt-in, missed check-in, emergency limitation copy, report linkage, access audit, deletion, and offline recovery. | Real notifications or emergency escalation communications require founder approval. |
| Marketplace security | Verified-neighborhood access, private image bucket, signed URLs, pickup-state RPCs, private pickup details, participant messaging, and audit tables exist. | Listings can be created with moderation status `not_run`; adversarial live RLS and upload tests are incomplete. | Cross-neighborhood reads, seller/buyer impersonation, blocked listing access, unsafe image, metadata stripping, oversize file, duplicate pickup, private-detail timing, message injection, report, and audit tests. | Marketplace production enablement requires all P0/P1 cases to pass. |

## Recommended Provider Direction

### Phone OTP

For the fastest supported Supabase path, evaluate Twilio, MessageBird, and Vonage in sandbox because Supabase supports them natively. Hubtel is Ghana-focused and exposes SMS/OTP APIs, but requires a custom server-side Send SMS Hook or separate verification service.

Selection evidence must include Ghana delivery rates, sender-ID approval, per-message cost, retry behavior, support, data-processing terms, and test coverage on major Ghana networks.

### Identity

Evaluate Smile ID in sandbox for Ghana Card, passport, and voter-ID support. Start with the minimum verification product that meets the product need. Do not collect a selfie or identity image until consent, retention, deletion, access-control, incident-response, and human-review requirements are approved.

Identity completion may create a factual signal such as `Identity check completed`. It must never create an unconditional trust guarantee.

### Address

Keep GhanaPost GPS optional and private. Until an official approved API and contract are verified, accept user-entered codes only, validate their format, and do not claim that a syntactically valid code proves residence.

### Moderation

Implement moderation in a Supabase Edge Function using `omni-moderation-latest` for supported text and image inputs. Combine model results with deterministic rules, store model/version/time/reason, and route uncertain or high-impact cases to human review. Never automatically ban solely from the model result.

## Verification Order

1. Keep all prototype verification mechanisms fail-closed in Preview and Production.
2. Complete Marketplace adversarial RLS, media, pickup privacy, and moderation tests.
3. Build the server-side moderation adapter and evaluation harness behind a disabled feature flag.
4. Define the job-safety session data model, privacy boundaries, and non-emergency disclaimer.
5. Select an SMS sandbox provider and approve limited test spend.
6. Select an identity sandbox provider only after privacy/legal review and explicit founder approval.
7. Run compact-phone and tablet acceptance against the exact staging build.
8. Require a production release review before enabling any live provider.

## Current Decisions

- No production provider has been activated.
- No real SMS has been sent.
- No real identity document has been collected.
- No real address has been submitted for verification.
- No automated trust score is permitted.
- Events Preview acceptance is complete and does not constitute production approval.
