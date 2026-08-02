# Changelog

All notable project changes are recorded here. Dates use the `Africa/Accra` product timezone.

## Unreleased

### Added

- Comprehensive Events post-merge verification report.
- Events testing matrix, release gates, SQL scenarios, mobile scenarios, and CI corrections.
- Repository-baseline dependency radar with explicit source and verification status.

### Changed

- Corrected the documented implementation baseline to Expo 54.0.34, React Native 0.81.5, and React 19.1.0.
- Recorded that Events remains disabled pending live-repository parity, functional RLS verification, feature gating, and device testing.
- Recommended Production Verification Services after an Events stabilization milestone, ahead of Push Notifications.

### Known limitations

- The merged Events screens use a seeded repository and hard-coded test viewer/location values.
- The Supabase Events repository does not implement the complete runtime contract used by the screens.
- Database CI applies the Events migration but does not invoke the Events RLS smoke file.
- Pending Events/comments do not yet have an operational, audited moderator workflow.
- No passing workflow, local database run, native build, or device-test evidence was available for commit `d44d7d9` during this audit.

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
