# Changelog

All notable project changes are recorded here. Dates use the `Africa/Accra` product timezone.

## Unreleased

### Added

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

- Recorded founder authorization to replace the rejected EAS preview public client key without logging or committing its value.

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

- Approved EAS preview runs `33455069758` and `33455643194` failed closed before build submission because Supabase rejected the configured preview client key with HTTP 401; no paid build was submitted.

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
