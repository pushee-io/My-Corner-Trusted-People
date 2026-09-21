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
