# Events Verification — 2026-08-12

## Outcome

Events is structurally ready for a controlled staging verification, but it remains correctly disabled by default. This review did not activate the client flag, database flag, production notifications, or any paid service.

## Evidence Reviewed

- All Events routes use `EventsFeatureGate`.
- Client access fails closed unless `EXPO_PUBLIC_FEATURE_EVENTS=enabled`.
- Seeded Events is allowed only when all three development conditions are explicit.
- The runtime repository selects Supabase for enabled non-seeded operation and falls closed when configuration is unavailable.
- Home and bottom navigation hide Events while the runtime flag is disabled.
- Database CI runs the base Events RLS smoke test and stabilization test.
- Mobile coverage includes contracts, seeded domain behavior, Supabase mapping, live runtime behavior, offline caching, queued idempotent writes, feature gating, and route boundaries.
- Precise event location and virtual links are modeled separately from public area labels and are revealed only to authorized viewers.
- Event mutations use server-side functions and database authorization rather than caller-supplied ownership.

## Verified Behaviors

| Area | Result | Evidence |
|---|---|---|
| Default feature state | Pass | Client flag requires exact `enabled`; database gate remains separate |
| Direct-route protection | Pass | Index, create, detail, and edit routes use the feature gate |
| Production repository selection | Pass | Seeded mode requires development plus two explicit environment values |
| Neighborhood visibility | Pass | Existing RLS suites cover neighborhood, cluster, invitation, organizer, and staff access |
| Organizer authorization | Pass | Role permissions and server-side transition functions are covered |
| RSVP capacity and idempotency | Pass | Repository and stabilization suites cover attendee counts, waitlist, and retries |
| Sensitive location | Pass with staging gate | Public area label is separate; precise location is authorization-bound |
| Offline behavior | Pass at unit level | Cached reads and queued idempotent mutations are covered |
| Moderation and reports | Pass at contract/RLS level | Human moderation boundary and audit records exist |
| Real notifications | Not verified | Outbox exists; delivery remains intentionally pending |
| Device usability | Not verified | Requires an approved preview build and staging data |
| Production Supabase | Not verified | No production deployment or flag activation was authorized |

## Configuration Required for Staging

1. Apply all Supabase migrations to a non-production staging project.
2. Set the database Events feature flag to enabled for staging.
3. Set `EXPO_PUBLIC_FEATURE_EVENTS=enabled`.
4. Keep `EXPO_PUBLIC_EVENTS_REPOSITORY=supabase`.
5. Keep `EXPO_PUBLIC_EVENTS_ALLOW_SEEDED_DEVELOPMENT=false`.
6. Use fictional staging accounts and locations.
7. Build one approved internal Android preview.
8. Do not enable production notification delivery.

## Device Test Script

1. Sign in as a verified requester and confirm Events appears.
2. Browse neighborhood and immediate-cluster events.
3. Confirm direct links fail closed when the database flag is disabled.
4. Create a draft; force-close and reopen; confirm the draft persists.
5. Edit, schedule, and cancel an organizer-owned event.
6. RSVP, cancel, hit capacity, and verify waitlist behavior.
7. Confirm a non-member cannot view a neighborhood event.
8. Confirm precise location and virtual link are hidden until authorized.
9. Add and report a comment; confirm pending moderation state.
10. Disable connectivity, verify cached read labeling, queue one mutation, reconnect, and confirm one server result.
11. Test compact Android, tablet width, large text, and screen reader.
12. Confirm no exact address, private link, report narrative, or auth token appears in logs, analytics, or notifications.

## Remaining Gates

- Staging migration evidence.
- Staging client and database flag evidence.
- Android device verification.
- Slow/offline field verification beyond unit tests.
- Production notification provider selection and testing.
- Privacy and security review for any future event media or background location.

## Decision

Keep Events disabled in production. After Groups membership is accepted, perform the staging steps above and record screenshots, test identities, build ID, commit SHA, and defects. Production activation requires a separate founder decision.
