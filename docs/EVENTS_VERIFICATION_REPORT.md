# Events Post-Merge Verification Report

Review date: 2026-08-02  
Baseline: `d44d7d935fd6d29c721d1ab092ed168dc14cb21b`  
Review method: source-level audit through the connected GitHub repository  
Execution limitation: the current repository archive was not mounted, direct clone and npm registry access returned HTTP 403, official web access returned HTTP 401, and GitHub returned no workflow run for the baseline.

## Post-stabilization update

PR #35 was merged as `c2ea1cf` after this original source-level audit. It added the complete runtime Supabase repository, Events feature gating, organizer management, migration protections, error handling, offline behavior, and stabilization tests.

Verified evidence now includes passing Mobile CI and Database CI, local formatting, lint with zero errors, strict type checking, 50 Jest suites, 246 tests, and 7 local Events stabilization pgTAP assertions.

Remaining release blockers include provisional authenticated profile and neighborhood composition, Events SQL suites not being invoked by the database CI script, and missing native build, device, accessibility, and staging evidence. The findings below describe the original `d44d7d9` baseline unless this update explicitly supersedes them.

## Executive verdict - original audit

The merge provides a coherent Events domain prototype and a security-conscious database design. It is **ready for a focused stabilization phase**, but it is **not ready for development feature activation, staging migration, external pilot use, or production deployment**.

The strongest elements are private-location separation, deny-by-default grants, server-derived organizer and cluster fields, atomic capacity handling, idempotency constraints, and an outbox boundary. The principal blocker is architectural: the mobile screens always use the seeded complete repository, while the Supabase repository implements only the smaller Phase 1 interface. CI also does not execute the Events SQL smoke test.

## Scope reviewed

- Events TypeScript contracts and runtime types.
- Seeded and Supabase repositories plus row adapters.
- Event list, create, and detail Expo Router screens.
- Home and bottom-navigation integration.
- Events migration, RLS policies, security-definer functions, triggers, grants, audit, and outbox.
- Events unit tests, SQL smoke file, mobile CI, database CI, and database test runner.
- Events implementation notes, installation notes, README, Tech Radar, Decision Log, and required documentation inventory.

## Findings

### P0 - Live Events architecture is not connected

`mobile/app/events/*` imports the seeded `eventsRepository`. The screens require `CompleteEventsRepository`, including viewer-aware details, interests, reports, reminders, organizer actions, private access, and outbox behavior. `createSupabaseEventsRepository()` implements only `EventsRepository`, the smaller list/create/update/cancel/RSVP contract.

Impact: the merged UI cannot prove authenticated Supabase persistence, RLS behavior, real membership scoping, or private-location access. Enabling the feature would expose a fictional local state flow rather than the intended vertical slice.

Required correction: define one production runtime contract, complete the Supabase implementation, derive the viewer from authenticated profile/membership state, and inject the selected repository from a composition root. Keep seeded data as an explicit development/test implementation.

### P0 - Events RLS smoke is absent from CI execution

`scripts/db-smoke-test.sh` applies all migrations and runs Module 1, Day 2B, and Day 3 SQL suites, but it never runs `supabase/tests/events_rls_smoke.sql`. The workflow name also omits Events.

Impact: a pull request can change Events policies or grants without executing even the structural Events assertions.

Required correction: invoke the Events test file and add functional authenticated-user fixtures. Make the database workflow required before merge.

### P1 - RSVP cancellation can mutate unrelated event timestamps and audits

`cancel_event_rsvp` does not require `can_view_event`, an existing caller RSVP, or even an affected RSVP row before updating the event count and timestamp. As a security-definer function available to authenticated users, a caller with a known event UUID can cause an event update and audit churn without authorization.

Required correction: reject unless the caller has an RSVP for the target event (or is otherwise explicitly authorized), perform the update only when the RSVP state changes, and test that unauthorized calls leave the event and audit tables unchanged.

### P1 - Co-organizers cannot read draft or pending events through RLS

`can_view_event` requires approved moderation and scheduled/completed status before evaluating organizer membership. The separate Events select policy admits `organizer_profile_id`, which covers the owner but not a co-organizer.

Impact: a co-organizer may have edit permission yet be unable to select the draft they are expected to edit.

Required correction: allow any authorized organizer to select its managed event independently of public audience/moderation predicates, with a functional RLS test.

### P1 - The database feature flag is not enforced by the mobile routes

The migration inserts `events = false`, but its conflict clause updates only the description; a pre-existing enabled row would remain enabled. The client feature flag object does not contain Events, Home always renders the link, and direct routes are available.

Required correction: add a server/environment-backed Events flag to runtime composition, navigation, deep-link handling, and repository selection. A disabled flag must fail closed.

### P1 - Human moderation is not operational

Events and comments start in `pending`, but staff cannot select pending Events through `can_view_event`, pending comments are visible only to their authors, and no audited moderator RPC changes event/comment moderation state or resolves reports. The database prevents ordinary clients from self-approving content, which is correct, but no controlled replacement workflow exists.

Required correction: add least-privilege staff read and transition functions, require reasons, create audit events, and test moderator/admin/non-staff behavior. Do not enable user-created Events until the queue can actually be worked.

### P1 - Mobile identity and location are hard-coded

The list and create screens use `east-legon` and `accra-east`; details use `defaultViewer`. This bypasses the existing authentication and membership architecture.

Required correction: load the active verified membership from the authenticated profile context. Never accept caller-controlled neighborhood/cluster values as production authorization evidence.

### P1 - Creation and reminder inputs are prototype-only

The create form exposes a raw ISO timestamp with a fixed 2026 default, uses a free-text area, and does not share a Zod schema with database constraints. The reminder action schedules at the event start rather than at a user-selected lead time.

Required correction: use localized date/time controls, membership-derived area selection, validated capacity, accessible error association, and a reminder lead-time selector.

### P1 - Automated coverage does not cross the real boundary

The existing tests cover contracts, a seeded repository, and adapters. There are no Supabase repository behavior tests, route/component tests, functional RLS users, concurrency tests, build checks, or device evidence. Jest only matches `.test.ts`, not TSX component tests.

Required correction: implement the matrix in `docs/TEST_PLAN.md` and capture exact workflow/build evidence.

### P2 - Seeded and SQL private-access behavior diverge

SQL allows an organizer to read private access. The seeded `forViewer` reveals the precise address only to a confirmed attendee, although it reveals a virtual link to an attendee or organizer.

Required correction: make the test double match the production policy and add parity tests shared by both implementations.

### P2 - Private-access changes are not audited

Reads through `get_event_private_access` create audit records, but `set_event_private_access` does not record who changed the address/link or release setting.

Required correction: audit create/update/clear actions without copying sensitive values into metadata. Define retention and staff-access rules.

### P2 - Events UI is incomplete for expected workflows

The detail route lacks cancel-RSVP/not-going controls, report-reason collection, retry, organizer edit, attendee management, invitation handling, comments, or explicit moderation messaging. Reports use a fixed reason. Error and loading states exist, but offline/retry states do not.

Required correction: finish only the workflows required for the next test question; keep deferred features behind flags.

### P2 - Compact navigation and accessibility need device validation

Bottom navigation has six text-only tabs. Several detail-screen Pressables omit explicit button roles and disabled/busy states. No visual evidence was available for compact or tablet layouts.

Required correction: validate against 320/360/390 dp phones and medium/expanded tablets, test text scaling and screen readers, and consider moving lower-frequency destinations out of the primary tab bar.

### P2 - Dependency and CI reproducibility drift

Mobile CI runs `npm install`, caches from `package.json`, and does not run Expo Doctor or build verification. The manifest uses compatible ranges for several packages despite the exact-version policy. Jest 29 and Babel-Jest 30 are different majors.

Required correction: use `npm ci`, cache `package-lock.json`, align test-tool majors, verify the supported Node version, and add build verification.

### P2 - Documentation overstates readiness

`docs/EVENTS_IMPLEMENTATION.md` describes an opt-in live repository and verification coverage without clearly stating that the screens cannot select the live implementation and that SQL coverage is not in CI. The README remains centered on Day-One Module 1. `TEST_PLAN.md` and `CHANGELOG.md` were absent before this audit. The former Tech Radar described an uninstalled Expo family.

Required correction: merge the documentation in this audit and keep capability claims tied to executable evidence.

## Architecture review

### Consistent decisions

- Types separate public Event data from runtime-only private/access data.
- Draft contracts omit server-owned organizer and moderation fields.
- The adapter isolates snake-case database rows from application types.
- Database triggers derive organizer identity, display name, cluster, moderation state, status, and attendee count.
- Private location/outbox tables are separated from normal authenticated table access.
- A domain outbox decouples transactional event changes from future notification delivery.

### Inconsistencies

- Two repository contracts have different capabilities and no shared production composition root.
- The seeded repository authorizes with caller-provided `EventViewer`; the database authorizes with authenticated server state.
- The live row adapter omits runtime fields such as location type, public meetup point, comments, cover image, interest, and private access.
- Existing TanStack Query and form/validation choices are not used in Events.

Architecture rating: **Amber**. The domain direction is sound; runtime composition and live parity are incomplete.

## Security review

### Positive controls

- RLS is enabled on every Events table.
- Direct authenticated grants to precise access and the outbox are revoked.
- Sensitive functions explicitly revoke anonymous/public execution.
- Private access is returned through a narrow RPC and reads are audited.
- RSVP capacity uses a locked event row and database-derived attendee count.
- Invitations validate audience, prevent self-invites, rate-limit callers, and enforce one pending invite.
- Clients cannot directly write RSVP count, audit data, outbox records, moderation status, or server-owned organizer identity.

### Required hardening

- Authorize RSVP cancellation and avoid no-op event updates.
- Repair co-organizer draft visibility.
- Audit private-access mutations.
- Add functional RLS tests for every role and membership state.
- Add length/format constraints and retention rules for sensitive private-access fields.
- Define staff report-review policies and ensure report resolution cannot reveal private location.
- Add an audited, least-privilege moderation path for pending Events and comments.
- Verify every security-definer function uses a constrained search path and minimum grants after all migrations.

Security rating: **Amber/Red for activation**. The model is strong, but two authorization defects and missing functional evidence block activation.

## Migration review

The migration is transactional and uses normalized tables, enums, foreign keys, checks, partial indexes, RLS, explicit grants, triggers, and RPCs. The RSVP lock is appropriate for capacity consistency. Private data separation is appropriate.

Before staging:

1. Add the corrective migration; do not rewrite the applied migration after an environment has used it.
2. Run from a clean database and from a copy of the current development schema.
3. Exercise real JWT claims and concurrent RSVP transactions.
4. Confirm prior migrations provide `current_profile_id`, membership helpers, clusters, feature flags, and staff-role helpers.
5. Capture schema diff, migration duration, rollback/recovery procedure, and sensitive-data inspection.

Migration rating: **Amber**. Structurally mature, not functionally verified.

## Mobile and UI review

The screens use shared tokens, `Screen`, clear plain-English privacy copy, 48 dp minimum controls, text status labels, loading/empty/error states, and destructive confirmation for organizer cancellation. These align with the product tone.

The experience remains a developer test surface: fixed identities/areas, raw ISO dates, static report reason, no retry, no offline state, no complete attendance management, no flag gate, and no visual/device evidence. The six-tab compact navigation needs testing.

Mobile rating: **Amber/Red for activation**.

## Repository review

The asynchronous interface and adapter are useful foundations. The seeded repository has meaningful domain tests and correctly avoids tying draft types to Supabase.

Production readiness requires eliminating the contract split. Production authorization must never depend on a caller-supplied viewer or query area. Shared conformance tests should run against seeded and Supabase implementations to prevent behavioral drift.

Repository rating: **Red for live use**.

## Testing summary

For the original baseline, source coverage existed without execution evidence. After PR #35, local mobile verification passed formatting, lint with zero errors, strict types, 50 Jest suites, and 246 tests. The Events stabilization pgTAP suite passed all 7 assertions locally, and PR #35 passed Mobile CI and Database CI. The database test runner still does not invoke the Events SQL suites, and native build and device evidence remain unavailable.

Result: Source-level findings remain valid for the original audit baseline. Post-stabilization verification now includes successful Mobile CI, Database CI, local Jest execution, and Events pgTAP verification. Native builds, accessibility validation, and physical-device verification remain outstanding.

## Remaining technical debt

1. Complete and inject the live repository.
2. Fix RSVP cancellation authorization and co-organizer draft visibility.
3. Enforce the feature flag across navigation, routes, and runtime selection.
4. Add functional Events RLS and concurrency tests to CI.
5. Replace hard-coded membership/viewer data with authenticated context.
6. Add validated localized forms, retry/offline behavior, and missing attendance/report controls.
7. Align seeded/live privacy behavior and audit private-access changes.
8. Reconcile Expo documentation, exact version policy, Node support, Jest tooling, and reproducible CI.
9. Update README, architecture/data-model/API documentation, and release checklist for Events.
10. Add Sentry/privacy-safe operational monitoring before an external pilot.

## Cleanup opportunities

- Move test fixtures and `defaultViewer` out of the production repository module.
- Replace duplicated legacy/complete interfaces with capability-focused contracts and one aggregate runtime interface.
- Add a repository factory/composition module; screens should not import a concrete data implementation.
- Centralize date/time formatting, event validation, current membership, async error mapping, and feature flags.
- Replace `as unknown as Href`, non-null assertions, and the redundant `defaultViewer ??` fallback with typed routes and explicit state.
- Rename Database CI to include Events and make the test runner discover SQL suites or maintain an explicit complete manifest.
- Remove stale installation claims after the live boundary and CI are complete.

## Recommended sequence

### Milestone 1 - Events stabilization

1. Fix the P0/P1 findings.
2. Complete the Supabase repository and authenticated composition boundary.
3. Add functional RLS, concurrency, component, and device tests.
4. Run clean mobile/database CI and preview builds.
5. Enable Events only in development after evidence is captured.

### Milestone 2 - Production Verification Services

Choose Production Verification Services before Push Notifications. Verified neighborhood membership controls access to private feeds, cluster events, invitations, and location release. Replacing test-mode verification with a lawful, privacy-reviewed production assurance path improves the correctness of every protected community feature.

Start with phone verification and residence-assurance provider abstractions, consent, audit, re-verification, and manual fallback. Do not activate identity verification, biometrics, background checks, paid vendors, or legal/privacy changes without founder approval and qualified review.

### Milestone 3 - Push Notifications

The outbox is a useful foundation, but delivery should follow verified membership. This milestone should add device-token lifecycle, explicit preferences, quiet hours, consent, idempotent worker delivery, retry/dead-letter behavior, deep-link authorization, redacted payloads, monitoring, and revocation when membership or attendance changes.

## Readiness for the next development phase

- Events activation: **No**.
- Events stabilization: **Yes**.
- Production migration: **No**.
- External pilot: **No**.
- Production Verification Services discovery and vendor evaluation: **Yes, with founder approval gates**.
- Real Push Notifications: **Defer until verification and Events stabilization are complete**.
