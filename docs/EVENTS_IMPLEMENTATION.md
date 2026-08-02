# Events implementation

Date prepared: 2026-08-01

## Delivered phases

1. Phase 1 contracts: lifecycle, visibility, moderation, RSVP, organizer roles, and asynchronous repository boundary.
2. Domain behavior: visibility authorization, organizer permissions, capacity and waitlist behavior, idempotent invitations and reports, comments, reminders, updates, and cancellation.
3. Supabase boundary: storage adapters plus an opt-in live repository. The seeded repository remains the safe default while the `events` feature flag is disabled.
4. Database and security: normalized event tables, private-location separation, RLS, security-definer RPCs, atomic capacity checks, audit history, and a notification outbox.
5. Mobile experience: event list, create-event draft, event details, RSVP, interest, reminder, report, loading, empty, and error states.
6. Navigation: Events is available from Home and is recognized as part of Community navigation.
7. Verification: contract, repository, adapter, runtime smoke, and SQL policy smoke coverage.

## Privacy and trust decisions

- Only a general area is stored on the public event row.
- Precise addresses and virtual links are stored in `event_private_access`, which has no direct authenticated-client grant.
- Private access is returned only by `get_event_private_access` to an organizer or a confirmed attendee when the organizer enabled release.
- Every precise-location access creates an audit record.
- Invitations never create membership or attendance.
- Event and comment moderation begins in a pending state.
- Reports are idempotent per reporter and event and remain available for human review.
- The mobile client cannot approve moderation, change attendee counts, or write to the outbox directly.

## Activation sequence

1. Apply the migration to local Supabase.
2. Run `supabase/tests/events_rls_smoke.sql` with the local test harness.
3. Run mobile formatting, linting, type checking, and all Jest tests.
4. Test the screens with verified same-neighborhood, same-cluster, organizer, attendee, outsider, moderator, and unverified accounts.
5. Enable the `events` feature flag only in development after all checks pass.

Do not apply this migration to production or enable production notifications without founder approval and a reviewed deployment plan.

## Deferred production services

- Real push delivery remains deferred; events write privacy-safe records to `domain_event_outbox`.
- Event cover upload reuses the shared media architecture but is not wired into these first screens.
- Automatic waitlist promotion is deliberately deferred so an RSVP cancellation cannot notify or reveal location to a person without an explicit tested workflow.
