# Home redesign — founder review pending

Authoritative specification: `docs/ui-reference/home/HOME_UI_SPEC.md`, read in full at `86b5bbe5154fc98fb13fa967836428e49f8c4f52`.
Baseline main: `e2edcbe2df8d1c7d2be351a3efe665a6abca33f7`.
Branch: `codex/home-feed-comments-2026`. PR: #180. This corrects Home only; existing Feed/comments work remains on the PR.

## Source and gap review

The approved reference PNG was inspected. The current-home JPEG was present but its binary content was unavailable through the connector; no repeat attempts. All four approved character PNGs exist. Home uses the supplied woman-in-kente asset without altering it.

Before: shared brand/actions header, separate location, AI pill, Hire/Provider/Feed destination grid, expanded Active Requests, Past Requests, Explore destination grid, Your corner links, moderation grid.

After: compact My Corner/location header with message and notification icons, featured approved AI character with neighborhood greeting/input/inline send, full-width Hire Trusted Local Help, one authorized Feed card, horizontal Marketplace previews, authorized Agency broadcast, compact request counts and expandable complete lists. Provider inbox and moderator tools remain capability-gated. Groups/Events remain accessible through existing My Activity navigation; optional previews are omitted. BottomNavigation is unchanged.

| Target | Original gap | Implementation |
| --- | --- | --- |
| Header | Location separate; no notification count | Home-specific header slot preserves shared Back handling |
| AI | Plain pill | Approved character, contextual greeting, inline input/send |
| Hire | Small destination | One full-width primary CTA, same Hire route |
| Feed | Navigation only | One authorized post with public avatar/name, time, bounded text, media, engagement indicators, exact post route |
| Marketplace | Navigation only | Up to six authorized image/title/price cards, exact listing routes |
| Agency | Navigation only | One current approved broadcast, agency identity and neutral information styling |
| Requests | Oversized sections | Compact Active/Past counts; both collapsed initially, all requests accessible |
| Directory clutter | Two destination grids | Removed; important role-specific tools retained compactly |
| Bottom navigation | Already implemented | Unchanged |

## Data and privacy

- Neighborhood: existing `loadVerifiedNeighborhood` / canonical `neighborhood_search_context`.
- AI: existing `loadAskContext`; Home sends once through the existing Ask request/quota/error flow. Search-originated questions still require their original explicit confirmation.
- Feed: `getCurrentNeighborhood`, `listNeighborhoodFeedPosts` with a limit of one, canonical `feed_author_names`, existing authorized media API and public avatar component. No invented verification badge or external share action.
- Marketplace: `getMarketplaceNeighborhood`, `listMarketplaceListings` limited to six before identity/image hydration; same authorized signed listing images and detail routes. No private pickup data queried.
- Agency: existing live read repository with the signed-in capability context; seeded fallback rejected; approved, nonblocked, nonfuture and unexpired results only. No inferred emergency severity.
- Messages: `loadUnread` through session-aware messaging resource.
- Notifications: unread entries from existing `loadNotifications`; its API returns up to 100 recent entries, so accessibility wording explicitly calls this recent updates. Missing/error data does not invent a zero.
- Requests: unchanged requester repository, canonical partition/order and provider resolution; complete counts and lists retained.
- Groups: existing group repositories and My Activity routes. Events: existing feature-gated runtime repository and routes.

No authentication, RPC, RLS, schema, backend, Production or signing configuration changes. Protected resources clear on account/focus/background changes. Community sections unmount when capabilities disappear; Home AI draft is keyed to session/context. The new read limits default to the existing 50-item behavior for other screens.

Performance: independent section loading/errors; one Feed parent plus its media, six Marketplace parents; no auto-playing video or animation. Refresh/focus rechecks access. Requests retain their existing 10-second refresh; preview content does not poll. Marketplace thumbnails reuse existing signed originals (bounded count/render size, no new server thumbnail transform).

## Validation

Validated application commit: `85f830d6b9cbd307d6749fa471ed7d1b06047935`.

- [Mobile PR CI 38027730135](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/38027730135): PASSED.
- [Exact-source push CI 38027726702](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/38027726702): PASSED.
- 678 tests across 112 suites passed, including existing navigation, request, privacy, identity, Feed, Marketplace and new Home regressions.
- TypeScript and formatting passed. ESLint passed with 0 errors and 15 pre-existing warnings.
- Expo Doctor 18/18; Preview contract; web export and Android export passed.
- [Database/RLS CI 38027730120](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/38027730120): PASSED against an isolated CI database. No Preview or Production database deployment.
- Supabase Preview deployment remains skipped; it is not an automated test failure.

An initial verification pass caught four missing link props, formatting issues, a screenshot-harness network import and stale Events-on-Home assertions. These were fixed. Events checks now verify Home -> My Activity -> Events plus the unchanged client/runtime gates, rather than demanding the directory-style shortcut removed by the authoritative specification. No unresolved automated failures remain.

Test-only component screenshots render the actual Home screen via React Native Web at compact phone, standard phone, tablet, larger text, empty and error states. They are not native Android, signed-in Preview or physical-device evidence. Fixtures exist only in tests/capture scripts.

The local shell failed to return even a basic command; no emulator capture loop is running. Native Android keyboard, scroll, actual images and live-data behavior remain NOT YET TESTED. No device settings were changed.

## Founder acceptance

Home is not complete and is not approved for merge. Founder visual approval is required. No APK was built. APK56 predates this redesign and cannot validate it; a newly approved Preview binary would be needed for final physical-device verification unless an existing development client can load this exact source.


## Reviewed visual evidence

All six PNGs below were actually opened and inspected. They render the implemented components, not generated mockups. The sample author, post, listing artwork/prices, broadcast and counts are TEST FIXTURES from the capture script, never production app data.

| Capture | Dimensions | Observation |
| --- | --- | --- |
| [Standard phone](evidence/home-redesign/home-phone.png) | 390 x 844 | Brand/location/actions, featured AI, inline send, Hire and Feed visible in first viewport |
| [Compact phone](evidence/home-redesign/home-compact.png) | 320 x 760 | Header actions wrap; readable Feed; fixed tabs; no observed overlap |
| [Tablet](evidence/home-redesign/home-tablet.png) | 840 x 1100 | Bounded content width; Agency and compact requests visible |
| [Larger text simulation](evidence/home-redesign/home-large-text.png) | 390 x 1100, text metrics x1.6 | Wrapping headings/cards; readable primary CTA |
| [Empty sections](evidence/home-redesign/home-empty.png) | 390 x 844 | Honest empty Feed/Marketplace/Agency states; request controls visible |
| [Section errors](evidence/home-redesign/home-error.png) | 390 x 844 | Independent retry states, no substituted production fixtures |

| Acceptance item | Inspected component evidence | Native Android/device |
| --- | --- | --- |
| Featured approved AI card | YES | NOT YET TESTED |
| Inline AI input and send | YES; handoff runtime tests pass | NOT YET TESTED |
| Hire Trusted Local Help CTA | YES | NOT YET TESTED |
| Latest Feed card | YES | NOT YET TESTED |
| Marketplace showcase | YES | NOT YET TESTED |
| Agency broadcast preview | YES | NOT YET TESTED |
| Compact Active/Past status | YES; complete-list tests pass | NOT YET TESTED |
| Feature-directory clutter reduced | YES | NOT YET TESTED |
| Bottom navigation preserved | YES | NOT YET TESTED |
| No visible overlap/faded controls | YES in reviewed captures | NOT YET TESTED |
| No duplicated menu/primary CTA | YES | NOT YET TESTED |

Failed visual items: none observed in reviewed component captures. This is not signed-in/native acceptance.

Remaining device checks: normal Android text/display settings; first viewport; long public names and real media; vertical and horizontal scrolling; keyboard-first Back; one AI submission with correct neighborhood and quota; Feed/listing/broadcast deep links and Back; all request states/counts; provider inbox and moderator access; account switch/revoked membership; unread count refresh; empty/offline/retry behavior. Existing Phase B provider -> request context, checkbox and Marketplace draft behavior should receive a short regression check in the eventual combined APK.

Remaining differences from illustrative reference: icon actions rather than large pills (required by text spec); no unsupported verified badge/external sharing; neutral Agency styling because the data contract has no urgency signal; optional Groups/Events previews omitted; brand says My Corner. Live content and final scroll performance require device verification. Marketplace uses bounded existing signed images, not newly generated thumbnail derivatives.

## Exact files changed in this Home correction

This list is relative to founder reference/asset commit `86b5bbe5154fc98fb13fa967836428e49f8c4f52`, not the earlier Phase C changes already in PR #180.

- `mobile/app/home.tsx`
- `mobile/app/ask.tsx`
- `mobile/src/components/HomeDashboard.tsx`
- `mobile/src/components/Screen.tsx`
- `mobile/src/components/AppHeader.tsx`
- `mobile/src/lib/home-dashboard.ts`
- `mobile/src/lib/community-repository.ts`
- `mobile/src/lib/marketplace-repository.ts`
- `mobile/src/__tests__/home-request-sections.test.ts`
- `mobile/src/__tests__/home-dashboard-data.test.ts`
- `mobile/src/__tests__/home-dashboard-ui.test.ts`
- `mobile/src/__tests__/home-ai-handoff.test.ts`
- `mobile/src/__tests__/global-back-navigation.test.ts`
- `.github/workflows/database-ci.yml`
- `.github/workflows/mobile-ci.yml`
- `mobile/scripts/capture-home-dashboard.cjs`
- `docs/UI_HOME_REDESIGN_REVIEW.md`
- `mobile/scripts/verify-preview-contract.mjs`
- `mobile/src/__tests__/events-stabilization.test.ts`
- `docs/evidence/home-redesign/home-phone.png`
- `docs/evidence/home-redesign/home-compact.png`
- `docs/evidence/home-redesign/home-tablet.png`
- `docs/evidence/home-redesign/home-large-text.png`
- `docs/evidence/home-redesign/home-empty.png`
- `docs/evidence/home-redesign/home-error.png`
- `docs/evidence/home-redesign/evidence.json`

The supplied specification, reference images and all four approved character assets are unchanged. No later modernization phase was started.

## Handoff status

**READY FOR FOUNDER VISUAL REVIEW**

Founder approval is still required; Home is not marked complete. PR #180 remains draft and unmerged. No APK or Production deployment was performed. APK56 cannot show this redesign. One new Preview APK will be necessary for testing the updated standalone app on the physical phone, after founder visual review and explicit build approval. An Expo development client capable of loading this source is an alternative for preliminary testing.

The final evidence-only commit adds this report and screenshots; application code is identical to the validated application commit above.
