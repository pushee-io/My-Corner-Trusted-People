# Changelog

All notable project changes are recorded here. Dates use the `Africa/Accra` product timezone.

## Unreleased

### Added

- Tappable Groups directory summaries and a dedicated group-detail route.
- Member-only group comments and likes using the existing social-group model.
- Privacy-aware sharing and validated group-post reporting into human moderation.
- Forward-only Supabase engagement migration and focused seeded/live-boundary tests.
- Comprehensive Events post-merge verification report.
- Events testing matrix, release gates, SQL scenarios, mobile scenarios, and CI corrections.
- Repository-baseline dependency radar with explicit source and verification status.

### Changed

- Moved posting and post actions out of the Groups directory and into `/groups/[groupId]`.
- Preserved group creation, membership requests, Events, restored navigation, and all existing migrations.
- Corrected the documented implementation baseline to Expo 54.0.37, React Native 0.81.5, and React 19.1.0.
- Recorded that Events remains disabled pending live-repository parity, functional RLS verification, feature gating, and device testing.
- Recommended Production Verification Services after an Events stabilization milestone, ahead of Push Notifications.

### Known limitations

- Events now use the runtime Supabase repository, but authenticated profile, neighborhood, and cluster composition still use provisional values.
- The Supabase Events repository does not implement the complete runtime contract used by the screens.
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
