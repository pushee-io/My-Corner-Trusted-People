# Session, navigation, public identity and request UX checkpoint — 2026-10-08

## Final automated verification — 2026-10-08

Implementation commit: `b462041b34ee65da5c4b23a3d1c2aea78bf3e759` on [draft PR #171](https://github.com/pushee-io/My-Corner-Trusted-People/pull/171). This receipt is documentation only; application and migration source match that verified commit.

- [Mobile CI 37843689524](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/37843689524): **passed**, including Preview contract, Expo compatibility, formatting, lint, typecheck, 581 tests/103 suites and web bundle export.
- [Database CI 37843689591](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/37843689591): **passed**, clean local Supabase reset plus all SQL/RLS suites. New content-reference checks, existing legal-name-leakage assertion and explicit review-name update regression pass. No privacy assertion or pickup-window constraint was relaxed.
- Local server tests: **77 passed**. Final Android Hermes bundle export of this implementation: **passed**, bundle `entry-18041aba31f6c863d093c8723f4f31b2.hbc`. This was not an EAS/APK build.
- Merge, Preview application of `20261008203711_authorized_content_public_names.sql`, authenticated two-account acceptance, native hard-close and ten full navigation cycles: **pending**. No deployment, identity backfill, production change, paid build or real communication.

The implementation is ready for review. **The user-behavior checkpoint is not complete** until Preview and Android acceptance pass. The next release approval is merge #171 and apply only its named migration to Preview `opeojxwkwwnnncnsuaag`; APK approval comes after Preview acceptance.


Status: implementation and automated verification passed; **not device-accepted or released**.

## Source of truth and investigation

Fetched live main: `4c9cea912f734bc2dcd0b1b5d3ae718f927ffbf6` (#169). Reviewed live PR inventory through #170: #166/#168/#170 are open checkpoint PRs and were not merged or incorporated as code. Relevant prior work: #142 canonical public identity, #153 Feed author resolution (included in subsequent main history), #157 shared Search/keyboard work, #165 verified Home neighborhood. Auth history includes #88 bounded restore, offline-bootstrap and native-cache-key repairs, and session-change race prevention. No AGENTS.md found in repository or parent workspace directories.

Supabase React Native guidance and changelog checked; installed SDK remains 2.75.0. No dependency upgrade, auth storage replacement, new animation library, paid build or production operation.

## Findings and corrections

1. **Auth — frontend boot state.** Native SecureStore, `persistSession`, token refresh and process lock already exist. Welcome swallowed every restoration failure and displayed login even when stored credentials remained valid. The entire restoration, including network detection, is bounded. The hydration screen remains visible until successful navigation so login does not flash. Startup now distinguishes a missing/invalid session from storage/network/profile failure, showing hydration or Retry until resolved. Missing offline routing cache falls through to Supabase session resolution. Invalid auth responses clear routing fallback; external SIGNED_OUT invalidates in-flight reads/cache and returns to authentication. Existing explicit device sign-out and account-change serialization remain. This is a confirmed source defect, not proof every reported hard-close failure had the same cause.
2. **Navigation — frontend/configuration.** Bottom links used `push` even at the same destination; per-screen capability reads removed/reinserted Community and Market tabs. Use native `navigate`, ignore the current destination, dismiss keyboard and keep tab positions stable with authorization-dependent disabled state. Root navigator background matches the theme. Normal TOKEN_REFRESHED rechecks protected data without first blanking it; failure still clears it. No theatrical animation or weakened route/data authorization. Screen lifecycle/media rendering and device-specific performance remain manual acceptance items.
3. **Identity — frontend/backend projection.** Marketplace directly queried RLS-protected base profiles and used self-profile values after writes; Groups used self name vs Group member; Events rendered stale saved snapshots; incoming Hire requests showed Signed-in requester; reviews used stale public_author. All now route to `private.neighbor_name` through existing authorized APIs or a bounded content-reference RPC. No alternate name priority rules or profile directory. RPC enforces active caller, content-specific membership/participant/organizer access and block/account eligibility. It returns only internal mapping ID + canonical name. Existing MediaAvatar/MediaAvatarCollection supplies authorized images; buyer list now renders batched avatars. No identity data is copied/backfilled and no legal fields are queried by the new projection. Post-write name failures display Public name unavailable, distinct from an authorized Neighbor result, and cannot prompt duplicate content submission. Feed post-write name failures use the same honest outage label.
4. **Request acknowledgement — frontend flow.** A text-style toggle becomes a themed 48px-minimum Review and Accept button and native confirmation. The exact statement stays visible: “I understand My Corner shows trust evidence but does not guarantee provider conduct.” Accepted state lives in the existing request/media flow context, survives Create→Review→Back and clears on scope/account change. Direct Review links cannot submit without acceptance. The guard also runs after asynchronous moderation, before request creation. This is a client UX acknowledgement, not a newly claimed database consent ledger.

## Cross-surface identity audit

| Surface | Result |
|---|---|
| Feed/posts/comments | Existing content-scoped feed_author_names + canonical neighbor_name and batched avatars retained; name-read outages after writes display Public name unavailable. |
| Marketplace sellers/buyers/legacy messages | Replaced private base-profile reads with content-scoped canonical names; added buyer avatar collection. |
| Groups posts/comments | Replaced self-only naming and Group member fallback with canonical authorized names. Existing avatars retained. |
| Events organizers/comments/attendees | Resolve current names through visible content; attendee identity remains self/organizer-only. New client stops selecting stored name snapshot columns. |
| Messages/neighbor profiles/own Profile | Existing messaging_api/own_public_name already use neighbor_name; preserved. |
| Hire/provider profile | Business names remain intentional business identity. Incoming requester display now canonical within assigned request authorization. |
| Verified reviews | Existing review page eligibility, pagination, metrics and response permissions preserved; current explicitly approved reviewer name replaces snapshot. The historical review-specific anonymity rule remains: without a public-name consent record, preserve its existing public_author fallback; never newly expose a legacy self-profile value. No reviewer profile ID added to public review output. |
| Notifications | Generic recipient-scoped notification titles do not substitute UUID/email/name; preserved. |
| Search/Ask cards | Content titles and provider business names; Event organizer helper already canonical. No new person fields or AI deployment. |
| Older adapters/moderator evidence | Legacy day2b alternate adapter uses generic Requester; moderator evidence is an existing explicitly authorized workflow. No widening of access or unrelated rewrite. These are not claimed to have completed device acceptance. |

## Risks and release ordering

- The new private definer is necessary to read approved names without broadening base-profile RLS. Its public wrapper is invoker; arbitrary neighbor_name execution remains revoked. New tests cover visible/hidden content, private Groups, uninvited Events, buyer participants, absent public consent, public edits and anonymous access. Base table policies, Job Safety and messaging permissions are unchanged.
- Additional batched name reads may fail independently. Normal reads surface errors; post-write reads use a safe fallback so successful writes are not repeated. No new direct self/private-field fallback is introduced.
- Deploy the reviewed migration before distributing the new mobile source. Existing APK51 continues its old client projections; the reviewed server review-name change is backward compatible.
- Migration `20261008203711_authorized_content_public_names.sql` is committed for review **but not applied**. Preview read-only inspection confirmed dependency helpers exist on `opeojxwkwwnnncnsuaag`. No live test accounts, memberships, quotas or data were changed.
- Founder merge and Preview migration approval remain required under the existing release process. No Edge Function change is needed. A future APK needs separate approval after Preview acceptance; no paid build started.

## Validation and acceptance matrix

Local mobile: **581 tests / 103 suites passed**. Server: **77 passed**. TypeScript passed. Lint: **0 errors / 15 baseline warnings**. Mobile formatting and diff checks passed. Android Hermes bundle export passed (`expo export --platform android`); this is a local bundle check, not an APK or device test. Draft PR [#171](https://github.com/pushee-io/My-Corner-Trusted-People/pull/171). Final Mobile and Database CI passed on `b462041b34ee65da5c4b23a3d1c2aea78bf3e759` (receipt above). First Database CI stopped on the fixture's 24-hour pickup window. The fixture now uses one hour, preserving the eight-hour constraint, with additional service-request/message/block/bounds checks. No production or Preview application data was involved. The second Database run passed the new authorized-content fixtures but caught a genuine review privacy regression in the unconditional resolver integration. The review projection now preserves its stronger historical consent boundary; the existing Legal name leaked assertion remains unchanged, and a separate test confirms explicit public-name edits refresh review names. The final Database CI passed with that correction.

Read-only Preview security advisors were inspected before any deployment. Existing notices include PostGIS `public.spatial_ref_sys` without RLS, three legacy functions with mutable search paths, private tables intentionally denying direct access and existing definer-function advisories. These predate this unapplied migration; this is not a clean-advisors claim. The new functions have fixed empty search paths, explicit active-account/content authorization and revoked anonymous execution. [RLS advisory](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public), [search-path advisory](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable).

| Acceptance | Result |
|---|---|
| Hydration waits; transient profile/backend error offers retry; absent/revoked session opens login | Automated pass. |
| SecureStore routing-cache restart, explicit sign-out, stale reads/account changes | Automated pass using native bridge simulation; actual phone restart/hard-close not observed. |
| Ten navigation cycles/current-tab no-op/stable tab positions/token refresh | Component tests pass; no claim of frame-rate, smoothness or real-device ten-cycle acceptance. |
| Seller/buyer canonical names, fallback, batch limits and account-switch responses | Client tests and Database CI authorization fixtures passed. |
| Groups/Events/private audience boundaries | Database CI passed, including removed membership and uninvited Event denials. |
| Acknowledgement, cancel/direct Review bypass, scope/account reset, retained acceptance | Real flow component tests pass. |
| Android emulator and physical phone manual tests A–F, ten full cycles, two-account Marketplace | **Not run: no adb, connected emulator/device or signed-in Preview test sessions available here.** |
| Preview migration + cross-surface edit/interest acceptance | **Not run: migration awaits review/approval; no real communications sent.** |

The founder's earlier APK51 acceptance is not acceptance of these new changes. The checkpoint cannot be marked complete until actual behavior passes on Preview and the intended Android devices.

## Exact files changed

- `CHANGELOG.md`
- `PLANS.md`
- `docs/AI_NEIGHBORHOOD_ASSISTANT.md`
- `docs/CURRENT_STATE.md`
- `docs/SESSION_CHECKPOINT.md`
- `docs/SESSION_UX_IDENTITY_CHECKPOINT.md`
- `mobile/app/_layout.tsx`
- `mobile/app/hire/request/new.tsx`
- `mobile/app/hire/request/review.tsx`
- `mobile/app/index.tsx`
- `mobile/app/marketplace/listing/[listingId].tsx`
- `mobile/src/__tests__/content-public-names.test.ts`
- `mobile/src/__tests__/day20f-bottom-navigation.test.ts`
- `mobile/src/__tests__/hire-media-flow.test.ts`
- `mobile/src/__tests__/job-report-repository.test.ts`
- `mobile/src/__tests__/marketplace-media-retry.test.ts`
- `mobile/src/__tests__/media-product-screens.test.ts`
- `mobile/src/__tests__/module1.flow.test.ts`
- `mobile/src/__tests__/navigation-continuity.test.ts`
- `mobile/src/__tests__/repository.test.ts`
- `mobile/src/__tests__/request-refresh.test.ts`
- `mobile/src/__tests__/session-startup.test.ts`
- `mobile/src/components/BottomNavigation.tsx`
- `mobile/src/components/media/RequestMediaProvider.tsx`
- `mobile/src/hooks/useProtectedResource.ts`
- `mobile/src/lib/__tests__/auth-session.test.ts`
- `mobile/src/lib/__tests__/native-session-cache.test.ts`
- `mobile/src/lib/auth.ts`
- `mobile/src/lib/community-repository.ts`
- `mobile/src/lib/content-public-names.ts`
- `mobile/src/lib/events-supabase-repository.ts`
- `mobile/src/lib/marketplace-repository.ts`
- `mobile/src/lib/repository.ts`
- `mobile/src/lib/social-group-detail-repository.ts`
- `scripts/db-smoke-test.sh`
- `supabase/migrations/20261008203711_authorized_content_public_names.sql`
- `supabase/tests/authorized_content_public_names.sql`
- `supabase/tests/provider_review_visibility.sql`
