# Events implementation

Date prepared: 2026-08-01

## Delivered phases

1. Phase 1 contracts: lifecycle, visibility, moderation, RSVP, organizer roles, and asynchronous repository boundary.
2. Domain behavior: visibility authorization, organizer permissions, capacity and waitlist behavior, idempotent invitations and reports, comments, reminders, updates, and cancellation.
3. Supabase boundary: a complete authenticated runtime repository plus an explicit seeded development repository.
4. Database and security: normalized event tables, private-location separation, RLS, security-definer RPCs, atomic capacity checks, audit history, and a notification outbox.
5. Mobile experience: responsive event list, create-event draft, event details, RSVP, interest, comments, reminder, report, loading, empty, and retryable error states.
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

1. Apply all migrations through `20260821180000_provision_events_feature_flag.sql` to development Supabase.
2. Run the database smoke harness, including Events RLS and feature-flag tests.
3. Run mobile formatting, linting, type checking, all Jest tests, and a web export.
4. Set `EXPO_PUBLIC_FEATURE_EVENTS=enabled` and `EXPO_PUBLIC_EVENTS_REPOSITORY=supabase` in the local development app only.
5. Enable the database switch in the development project SQL editor only:

   ```sql
   update public.feature_flags
   set enabled = true, updated_at = now()
   where key = 'events';
   ```

6. Test verified same-neighborhood, same-cluster, organizer, attendee, outsider, moderator, and unverified access.
7. Capture compact Android phone plus tablet portrait and landscape evidence before merging.

Do not enable the production Events flag or production notifications without founder approval and a reviewed deployment plan.

## Deferred production services

- Real push delivery remains deferred; events write privacy-safe records to `domain_event_outbox`.
- Event cover upload reuses the shared media architecture but is not wired into these first screens.
- Automatic waitlist promotion is deliberately deferred so an RSVP cancellation cannot notify or reveal location to a person without an explicit tested workflow.
