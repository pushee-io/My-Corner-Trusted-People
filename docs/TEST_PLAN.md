# Test Plan

Last updated: 2026-08-02  
Baseline commit: `c2ea1cf` (Events stabilization merged through PR #35)

## Objective

Prove that Module 1 and Events operate across the mobile client, repository boundary, Supabase database, and privacy model without exposing exact locations, bypassing verified-neighborhood access, corrupting attendance, or confusing users.

## Evidence status

- **Implemented:** test source or CI configuration exists in the repository.
- **Executed:** command output from the exact baseline has been captured.
- **Passed:** captured execution completed successfully.
- **Blocked:** required environment, credentials, service, or device was unavailable.

After PR #35, Mobile CI and Database CI passed. Local verification passed formatting, lint with zero errors, strict type checking, 50 Jest suites, 246 tests, and 7 Events stabilization pgTAP assertions. Native build, device, and staging evidence remain outstanding.

## Required release gates

| Gate | Required command or evidence | Current state |
|---|---|---|
| Reproducible install | `cd mobile && npm ci` | Not executed in this audit |
| Formatting | `npm run format` | Passed locally |
| Lint | `npm run lint` with zero errors | Passed locally with warnings only and zero errors |
| Strict types | `npm run typecheck` | Passed locally |
| Unit/integration tests | `npm test -- --runInBand` | Passed locally: 50 suites and 246 tests; Mobile CI passed on PR #35 |
| Expo compatibility | `npx expo-doctor` | Not configured as CI gate |
| Database migration | Apply every migration to a clean PostgreSQL/PostGIS database | CI script supports migrations; run evidence unavailable |
| Module 1/Day 2B/Day 3 RLS | Existing SQL smoke suites | Invoked by `scripts/db-smoke-test.sh` |
| Events RLS | Events SQL smoke suites | Stabilization suite passed locally with 7 assertions; Events suites are not yet invoked by the CI script |
| Native build | Android and iOS preview build | No evidence available |
| Compact/tablet UI | Screenshots and interaction log | Not executed; later uploaded screenshots were unavailable |
| Offline/failure behavior | Network failure and retry scenarios | Events retry/offline behavior not implemented |
| Accessibility | Screen reader, text scaling, focus, 48 dp targets | Source review only |

## Existing Events automated coverage

### Contracts and adapters

- Lifecycle, visibility, moderation, RSVP, organizer role, and permission constants.
- JSON-safe contracts and storage-agnostic drafts.
- Snake-case row mapping and nullable update handling.

### Seeded repository

- Verified-member creation and moderated draft defaults.
- Neighborhood and cluster visibility.
- Precise-location release after confirmed RSVP.
- Capacity and waitlist behavior.
- Owner and co-organizer permissions.
- Idempotent invitations and reports.
- Pending comment moderation.
- Outbox records for invitations, reminders, updates, and cancellation.

### SQL structural smoke

- Required function, policy, trigger, index, and UUID cluster column existence.
- No direct authenticated grant to `event_private_access`.
- No anonymous execution of sensitive functions.
- Explicit authenticated execution grant for RSVP.

## Missing automated coverage

1. The Supabase repository has no behavioral tests with a mocked or local client.
2. The live repository does not implement the complete repository contract consumed by the screens.
3. No Expo component or route tests cover loading, empty, error, retry, create, RSVP, report, reminder, or cancellation flows.
4. The SQL smoke file checks structure but does not exercise real users, JWT claims, RLS visibility, private-location access, capacity races, or organizer permissions.
5. Database CI does not invoke the Events SQL smoke file.
6. There is no test proving the Events feature flag prevents navigation or direct route access.
7. There is no test for unverified users, expired membership, ended membership, or cluster outsiders through the live API.
8. There is no test that an unauthorized `cancel_event_rsvp` call leaves unrelated events and audits unchanged.
9. There is no test proving co-organizers can manage draft/pending events.
10. There is no test for private-location mutation audit records or sensitive-value redaction.
11. There is no concurrency test for the RSVP capacity lock.
12. There is no migration rollback/recovery rehearsal or staging migration evidence.

## Required SQL scenarios

Run each scenario with real `request.jwt.claim.sub` values and seeded profiles:

1. Verified same-neighborhood member sees an approved neighborhood event.
2. Verified same-cluster member sees an approved cluster event.
3. Unverified, expired, ended, and outside-area members cannot read or mutate Events data.
4. Owner and co-organizer permissions match the TypeScript permission table.
5. Owner and co-organizer can read draft/pending events they manage.
6. Attendees cannot read precise access before confirmed RSVP or when release is disabled.
7. Confirmed attendee and organizer private-location reads are returned and audited.
8. Direct table access to private location and outbox remains denied.
9. Concurrent final-capacity RSVPs produce one attendee and one waitlisted result.
10. RSVP cancellation requires an existing caller RSVP or authorized event visibility.
11. Invitations reject self-invites, outsiders, duplicates, and rate-limit excess.
12. Clients cannot set organizer identity, moderation state, attendee count, cluster, outbox, or audit data.
13. Moderators can review reports without exposing private event location by default.
14. Moderators can read and decide pending Events/comments through audited functions; ordinary members cannot.

## Required mobile scenarios

- Verified member lists neighborhood and cluster events from the active membership context.
- User creates a draft with localized date/time controls and clear moderation status.
- Organizer can reopen and edit a pending draft.
- Attendee can choose Going, Interested, Not going, or cancel an RSVP.
- Full event places additional attendees on a waitlist without implying confirmation.
- Report flow captures a reason, confirms submission, and avoids duplicate reports.
- Reminder flow selects a time before the event and handles notification permission denial.
- Exact location remains absent until the approved release condition is met.
- Loading, empty, retryable error, offline, stale cache, and duplicate-tap states are understandable.
- Screen reader labels, text scaling, keyboard focus, and 48 by 48 dp targets pass.
- Compact phone, medium tablet, expanded tablet, portrait, and landscape layouts pass.

## CI corrections

1. Replace `npm install` with `npm ci`.
2. Set `cache-dependency-path` to `mobile/package-lock.json`.
3. Add `npx expo-doctor` and a build verification step.
4. Invoke `supabase/tests/events_rls_smoke.sql` from `scripts/db-smoke-test.sh`.
5. Add functional Events RLS fixtures, not only catalog assertions.
6. Require Mobile CI and Database CI before merge.
7. Capture test counts, workflow URLs, dependency-audit results, and build identifiers in the release checklist.

## Exit criteria for Events development activation

- All P0 and P1 findings in `docs/EVENTS_VERIFICATION_REPORT.md` are fixed.
- The mobile app uses an authenticated live repository implementing the complete Events contract.
- The client feature flag prevents navigation and direct route use while disabled.
- A pre-existing feature-flag row cannot accidentally leave Events enabled during migration.
- All required mobile and database checks pass from a clean checkout.
- A compact Android device and tablet flow pass with verified and unverified accounts.
- The migration and rollback plan are reviewed in staging.
- Founder approval is recorded before any production migration, customer notification, or production verification integration.
