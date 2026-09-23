## 2026-09-23 — Verified review experience implemented

- Added post-completion review entry, accessible 1–5 stars, title/body/recommendation and experience guidance; provider review list, real aggregate summary, one response, reporting and moderator decisions.
- Added private My Activity with request history and reviews written. Draft text clears with account-session changes and is not persisted or included in analytics.
- Local typecheck, all 453 tests and web export passed; lint has zero errors and 15 existing warnings. Backend PR #106 remains gated on Database CI; Preview migration remains blocked by auto-review. No native test/build is claimed.

## 2026-09-23 — Verified reviews and private messaging checkpoint

- Audit main: `ecb7811054cb61ff174a159e40a1bf1929171c78`. Reuse `reviews`, Marketplace conversations/messages, `blocks`, `notifications`, `domain_event_outbox`, masked identity and protected resource lifecycle.
- First implementation: completed-job review security, public projection, one review per job, seven-day audited edits until response, provider reply, report/moderation and content-free notification events. Require both Job Safety completion confirmations so a forged Completed request cannot create a Verified Job review.
- Backend review feature defaults off. Auto-review rejected deployment to connected project `opeojxwkwwnnncnsuaag` as a live schema/access-control change; no migration or flag was applied. Continue implementation and isolated Database CI; deployment requires explicit target/migration approval.
- No APK build authorized. Review and messaging native phone/tablet acceptance remains pending. See `docs/REVIEWS_MESSAGING.md` for scope and checkpoint status.

## 2026-09-21 — Replacement-icon Preview APK built and verified

- One approved build completed successfully: source `2e3f9913c8800f6575e5e2da89dfe3003e851b4f`, EAS `3df2be28-e78a-4fdc-8cbb-95abe4e334c2`, APK workflow `35620057933`, Mobile CI `35620057872`.
- Download: https://expo.dev/artifacts/eas/YrUT3UNvSI4dQSdrDQxFG9nk6hvlTVvikJ2-v-9EMiU.apk
- File `my-corner-preview-2e3f991.apk`, 71,944,794 bytes; SHA-256 `5abf89a6273618cddd65f94d3ec460b663890e5992782b2c5a9afcd599f1b846`.
- Verified source commit, Preview backend, application ID, media bytecode and exact replacement navigation font (`res/JS.ttf`). Archive integrity passed. Android version 38 supersedes 37, with the same package and signing certificate as `1c0dd00`; install using `adb install -r` or Android's Update prompt.
- Phone/tablet visual acceptance remains pending: confirm Hire person/checkmark and Community hands/heart icons in active/inactive states, navigation, and Structure with AI. Preview AI remains enabled; this build does not change backend configuration.
- Evidence: `docs/evidence/navigation-icons-preview-2026-09-21.json`. This one-build approval is consumed; no further paid build is authorized.

## 2026-09-21 — Replacement-icon Preview APK authorized

- Founder explicitly approved one new APK after PR #105 merged: "i approve a new APK build".
- Build latest merged main with the supplied Hire and Neighborhood icons, retaining the existing Preview backend, signing configuration and automatic Android version increment. Preview AI remains enabled.
- One explicit build-trigger commit submits the APK. Release gates and APK checks include byte-for-byte verification of the bundled replacement icon font.
- Build result and download evidence pending. Phone/tablet acceptance remains pending; no production deployment is included.

## 2026-09-21 — Founder-supplied navigation artwork

- Replaced the Hire footer glyph with the supplied person/checkmark and the Community footer glyph with the supplied Neighborhood hands/heart artwork.
- Preserved the original PNGs and traced scalable vector glyphs into a 31 KB bundled font using the existing Expo icon library. No new app dependencies; active/inactive colors, labels, routes, capability gates and 48 dp targets are retained.
- Local typecheck and all 446 tests passed; lint reports zero errors and the existing 15 warnings. Glyphs visually inspected at 24, 48 and 96 px in both selection colors. Formatting and Android Hermes export also passed; the exported font matches the committed asset. PR #105 merged at `3ccb95a19a51c74b194bef616388015785f4bad9` after Mobile CI passed for both push and PR (`35619442320`, `35619459962`). Font rebuild is deterministic.
- These client changes are not in the existing `1c0dd00` APK. A new paid APK needs fresh founder approval; no build was triggered. Native phone/tablet acceptance is pending that build. Preview AI remains enabled as recorded below.

## 2026-09-21 — Live AI structuring verified and enabled

- After the founder confirmed API credit availability, one authenticated fictional sink-leak request returned HTTP 200 with `enabled: true` and valid title, description, urgency, missing information and safety warning fields.
- Preview `ai_service_request_structurer` is now TRUE. This supersedes earlier missing-secret and HTTP 429 blockers; the exact earlier 429 subtype was not established.
- Response title: Water Leak Under Kitchen Sink. Response description: There is water leaking under the kitchen sink that started this morning. Urgency: flexible. The result remains a suggestion for explicit user review; the test did not submit a service request.
- The quota counter recorded one call. Test session logout returned HTTP 204; temporary Auth user/profile were removed, zero fixture rows verified, and enabled flag read back true.
- PR #104 safe diagnostics merged at `3e1f9d74ad25f1e29835a61a60cfda0ff380604f` after Media Functions and Database CI passed. Eleven server tests and Deno check passed.
- Existing approved APK `1c0dd00` supports this server activation; no new APK is needed or was built. Phone/tablet AI UI acceptance remains pending: Create Request → enter text → Structure with AI → review/apply/edit → submit only when explicitly chosen.

## 2026-09-21 — AI settings detected; upstream HTTP 429 blocks activation

- Founder reported both Preview secrets saved. Authenticated availability check returned HTTP 200 / available=true, confirming the function sees its key/model and enabled flag.
- Two fictional sink-leak attempts returned HTTP 503 from the Edge Function; the second diagnostic established upstream OpenAI HTTP 429. No successful suggestion is claimed. The filtered diagnostic did not establish a particular credit/rate/spend subtype.
- Per the two-attempt limit, no further content requests were made. The Preview AI database flag is restored to false. Both test sessions were logged out; temporary Auth user and profile removed, with zero remaining fixture rows verified.
- Required next step: founder checks OpenAI API credits and project/organization limits; then retry one fictional request. Do not rotate the key solely for this 429. No new APK is required.
- Preview function v5 adds fixed allowlisted diagnostic reason codes and upstream HTTP status, preserving the generic user error. No upstream message, secret or request content is returned. Eleven server tests and Deno check passed. Changes are published for review in the AI diagnostics PR.

## 2026-09-21 — Merge complete; one new Preview APK authorized

- Founder explicitly requested merge and approved one new APK build after the three media retests passed.
- PR #102 merged at `35cfdda2469dec6ff8385c0f8c9770b8a0c8482f`; PR #103 merged into main at `6e29fbebf13d48870660fd80cc7dcc76e71e3031`.
- Merged source tree `7e4fa61dca3e1dd61fb80c951fe2c1c7167e21b9` exactly matches the tested PR #103 tree. Mobile, Database, Media Functions and Job Safety CI passed at `2e964e0`.
- This build authorization supersedes earlier draft/build holds. The explicit build-trigger commit starts exactly one EAS Preview APK using the existing workflow and signing credentials, with an incremented Android version.
- New phone/tablet acceptance remains pending. AI runtime configuration still returned 503; its database flag remains off and manual request submission is supported. No production deployment is authorized.
- The approved APK is BUILT AND VERIFIED: source `1c0dd00`, EAS `be2f266e-ec74-45ba-a757-a0c743328b8f`, workflow `35608359612`. File `my-corner-preview-1c0dd00.apk`, 71,938,470 bytes; SHA-256 `f21ecb90933cd1a8416891851614b319d13cf9f983db92a30bb49d8d865d6d70`.
- Download and full provenance: `docs/evidence/vc-reliability-preview-2026-09-21.json`. Source, backend, app ID, archive and embedded media/UX markers verified. This build approval is consumed. Next: install as an update and perform the phone/tablet retest; no new paid build without approval.

## 2026-09-21 — Focused media retest passed; reliability/UX implementation

- Founder reported all three corrected `62e3cec` APK retests passed: video centering, playback/close/background stability, and Hire attachment Review/Back/submit/readback.
- Live main at audit: `debd1995ce5f599549d16ea932a04e639b1f411d`; implementation builds on PR #102's `d26d7abb14417f4d0bb4811fdeb1d929fe41625c` source.
- New reliability/UX work: shared protected refresh for request/status/safety screens; all active requests; authorized live Search; icon navigation; native Invite Friend; distinct registration; server-backed, explicitly reviewed AI suggestions with manual fallback.
- The audited provider-only account has no verified residence; the other account is a verified resident/provider/moderator. Existing account roles and memberships remain unchanged.
- Published draft PR #103, stacked on #102. Implementation commit `c4c23ca` passed Mobile, Database, Media Functions and Job Safety CI. Preview registration/allowance migrations and structurer function v1 deployed; SQL verification passed. New registration also blocks client edits to phone verification.
- Authenticated AI availability returned HTTP 503 with the Preview flag enabled; server key/model configuration remains blocked. The AI database flag was restored to false and temporary test identity/profile removed. New native acceptance and final-head CI/review remain gates. No additional APK has been built or authorized.
- See `docs/VC_RELIABILITY_UX.md` for findings, file/test mapping, configuration and the two-device test plan. This entry supersedes stale earlier current-state/next-action statements.

# Changelog

All notable project changes are recorded here. Dates use the `Africa/Accra` product timezone.

## Unreleased

### Verification and active work (2026-09-18)

- Built and verified the single approved corrected Preview APK from `62e3cec`, EAS build `7cbb3fcf-36e0-4ce7-85dc-620a3b8ba68c`. Source provenance, archive integrity, application ID, Preview backend and repaired media/Hire bytecode checks passed. The download and SHA-256 are recorded in `docs/VC_MEDIA_PRODUCT_INTEGRATION.md`; focused phone/tablet retesting remains pending.
- Repaired the connected-media device findings in source: center portrait video previews/playback in a responsive frame, avoid pausing an already released native player on Close video, and replace the Hire Create request photo placeholder with real photo/video selection shared through Review. Added 12 regression cases (419 tests across 81 mobile suites). These changes are included in corrected APK `62e3cec` and await device retest; PR #102 stays draft.
- Connected shared media to Profile, Neighborhood Feed, Hire, Groups, Events and Marketplace; PR #102 remains draft pending connected-screen device acceptance.
- Added retry-safe parent submission, immutable Marketplace photo retry paths, and protection against account changes and repeated submission taps. Mobile regression coverage now totals 407 tests across 80 suites; six media processing/security tests also pass.
- Built and verified the authorized Preview APK from `5d801dd`, EAS build `214b0a28-2476-4271-aabc-2c07faa4c1a3`. Source-commit, product-media bytecode, application ID, Preview environment and archive checks passed. See `docs/VC_MEDIA_PRODUCT_INTEGRATION.md` for the download, checksum and outstanding device checks.
- Repaired both PR #102 foundation review findings and added 12 component/transport regressions before product-screen integration.
- Added durable private media cleanup, scheduled worker authenticated by single-use tickets, and safe local picker-cache disposal.
- Verified 22 Preview HTTP cases and eight Storage API deletion jobs with fictional fixtures; removed test accounts and restored the upload flag to off.
- Matched repository migration filenames to the recorded Preview deployment versions without rewriting remote migration history.

- Recorded completed native verification and the PR #101 offline-session repair.
- Prepared the requested shared media foundation locally, with private storage/RPC policies, metadata processing, native controls and focused tests.
- Published the founder-approved media foundation in draft PR #102 at `f17ad80`. Media deployment and a new APK remain separate checkpoints.


### Fixed

- Close expanded private photos during authorization refresh; reject stale selections and late responses after access, parent or account changes.
- Resume media processing or a missing video poster when signed-upload preflight reports an already-uploaded original, preserving immutable paths and non-upserting uploads.
- Reject new requests that target inactive or retired provider profiles, preventing stale cached provider IDs from creating unreachable assignments.
- Validate provider availability before mobile submission and instruct the requester to refresh when a cached provider is no longer active.

- Reconciled the fictional Preview provider account with the documented Kwame PipeCare seed profile through a forward-only, idempotent migration.
- Preserved all provider profiles and request history while auditing the previous fictional account-link removal.
- Added a database regression that recreates the observed Ama Spark Works mismatch and verifies the repaired provider contract.


### Added

- A verified Android Preview APK for commit `5eb06091e8352f949f7c78d87674f74b40833011`, EAS build `2f82dcdc-df32-459e-9690-5a236ec4d46b`, with application, staging-project, bytecode, hash, and provenance checks.
- A server-controlled Job Safety Session with consent-based exact-location release, assigned-provider authorization, arrival confirmation, expiring one-time codes, server-owned status transitions, two-party completion, encrypted sensitive fields, scoped RPCs, and audit events.
- Combined Marketplace and job-safety authorization verification in the clean Database CI path.
- A dedicated Marketplace moderator queue with open, reviewing, resolved, and all filters.
- Marketplace report detail review with approve, flag, and block-listing controls, controlled reasons, confirmation, and audit history.
- A forward-only moderator migration with role-gated RPCs, RLS policies, append-only audit records, and pgTAP structural checks.

- RLS-authorized Event comments in the live and seeded detail flows.
- Retryable, user-safe Events availability states and responsive tablet event cards.
- A fail-closed Events feature-flag provision migration and database smoke test.
- Tappable Groups directory summaries and a dedicated group-detail route.
- Member-only group comments and likes using the existing social-group model.
- Privacy-aware sharing and validated group-post reporting into human moderation.
- Forward-only Supabase engagement migration and focused seeded/live-boundary tests.
- Comprehensive Events post-merge verification report.
- Events testing matrix, release gates, SQL scenarios, mobile scenarios, and CI corrections.
- Repository-baseline dependency radar with explicit source and verification status.

### Changed

- Reconciled Trusted Hire routing so only eligible submitted/viewed requests expose accept/decline actions and accepted/active jobs enter the shared safety session.
- Reconciled durable continuity documents to live `main` after PR #84.
- Correct preview Supabase verification so publishable API keys are not sent as Bearer JWTs; legacy anon JWT verification remains supported.

- Recorded founder approval for one paid Android EAS preview build and its fail-closed verification workflow.

- Added a durable native verification report separating passed source/CI evidence from blocked real-device evidence.

- Give shared error-state retry actions explicit button semantics and a 48 dp minimum target.

- Allow supported native tablets to rotate between portrait and landscape by using Expo's stable no-lock orientation setting.

- Merged PR #70's systematic web-safe navigation migration after immutable-head, CI, mergeability, and manual browser replay verification.
- Restored durable project continuity documents and advanced the exact next checkpoint to native compact/tablet/accessibility verification.

- Prepared Events for explicit development activation without enabling staging or production.
- Reconciled Events documentation with the complete authenticated Supabase runtime repository.
- Moved posting and post actions out of the Groups directory and into `/groups/[groupId]`.
- Preserved group creation, membership requests, Events, restored navigation, and all existing migrations.
- Corrected the documented implementation baseline to Expo 54.0.37, React Native 0.81.5, and React 19.1.0.
- Recorded that Events remains disabled pending live-repository parity, functional RLS verification, feature gating, and device testing.
- Recommended Production Verification Services after an Events stabilization milestone, ahead of Push Notifications.

### Known limitations

- The single approved Android Preview build is complete and verified; installation and real-device compact/tablet/accessibility evidence remain pending.
- Earlier EAS preview runs `33455069758` and `33455643194` failed before submission; the repaired workflow later completed the single authorized build in run `33535507405`.

- The Marketplace moderator migration is prepared locally but has not been applied to Preview; Preview application and device verification require separate founder approval.
- Blocking in this slice hides a listing and does not ban or permanently restrict the seller account.

- Events remains fail-closed until both the client flag and the environment-specific database flag are enabled.
- Development activation and native compact/tablet evidence remain required for this cycle.
- Database CI now performs a clean Supabase reset and enforces all three Events pgTAP suites with 31 assertions.
- Pending Events/comments do not yet have an operational, audited moderator workflow.
- Events stabilization passed local formatting, lint with zero errors, type checking, 51 Jest suites, 250 tests, a clean Supabase reset, all legacy SQL checks, and 31 Events pgTAP assertions. Native build and device evidence remain outstanding.

## 2026-08-02 - Events vertical slice merge

### Added

- Events domain and runtime contracts for lifecycle, visibility, moderation, organizer roles, attendance, invitations, comments, reports, reminders, and outbox events.
- Seeded Events repository and Supabase row adapter/repository boundary.
- Event list, create-draft, and detail routes with Home and Community navigation.
- Events database migration with private-location separation, RLS, security-definer RPCs, capacity locking, audit events, and notification outbox.
- Unit tests for contracts, seeded repository behavior, and Supabase mapping.
- Structural Events SQL smoke checks.

### Security

- Denied direct authenticated access to precise event locations and the domain outbox.
- Restricted exact-location reads to organizers or confirmed attendees when release is enabled.
- Added audit records for precise-location reads.
- Added verified-neighborhood and cluster audience rules, invitation checks, rate limiting, and idempotency constraints.

### Deferred

- Live complete Events repository wiring.
- Production feature activation and staging migration.
- Real push delivery, cover upload, automatic waitlist promotion, and production moderation workflow.
