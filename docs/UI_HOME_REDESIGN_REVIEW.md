# Home redesign — founder review pending

Authoritative specification: `docs/ui-reference/home/HOME_UI_SPEC.md`, read in full at `86b5bbe5154fc98fb13fa967836428e49f8c4f52`.
Baseline main: `e2edcbe2df8d1c7d2be351a3efe665a6abca33f7`.
Branch: `codex/home-feed-comments-2026`. PR: #180. This corrects Home only; existing Feed/comments work remains on the PR.

## Source and gap review

The approved reference PNG was inspected. The current-home JPEG was present but its binary content was unavailable through the connector; no repeat attempts. All four approved character PNGs exist. Home uses the supplied woman-in-kente asset without altering it.

Before: shared brand/actions header, separate location, AI pill, Hire/Provider/Feed destination grid, expanded Active Requests, Past Requests, Explore destination grid, Your corner links, moderation grid.

After: compact My Corner/location header with message and notification icons, featured approved AI character with neighborhood greeting/input/inline send, full-width Hire Trusted Local Help, one authorized Feed card, horizontal Marketplace previews, authorized Agency broadcast, compact request counts and expandable complete lists. Provider inbox and moderator tools remain capability-gated. Groups/Events remain accessible through existing Community navigation; optional previews are omitted. BottomNavigation is unchanged.

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
- Groups: existing Community/group repositories and routes. Events: existing feature-gated runtime repository and routes.

No authentication, RPC, RLS, schema, backend, Production or signing configuration changes. Protected resources clear on account/focus/background changes. Community sections unmount when capabilities disappear; Home AI draft is keyed to session/context. The new read limits default to the existing 50-item behavior for other screens.

Performance: independent section loading/errors; one Feed parent plus its media, six Marketplace parents; no auto-playing video or animation. Refresh/focus rechecks access. Requests retain their existing 10-second refresh; preview content does not poll. Marketplace thumbnails reuse existing signed originals (bounded count/render size, no new server thumbnail transform).

## Validation

Pending current-head CI. Mobile CI covers formatting, lint, TypeScript, all Jest suites, web and Android export. Database CI now triggers on the preview repository integration and runs the existing local SQL/RLS verification, without deploying any environment.

Test-only component screenshots render the actual Home screen via React Native Web at compact phone, standard phone, tablet, larger text, empty and error states. They are not native Android, signed-in Preview or physical-device evidence. Fixtures exist only in tests/capture scripts.

The local shell failed to return even a basic command; no emulator capture loop is running. Native Android keyboard, scroll, actual images and live-data behavior remain NOT YET TESTED. No device settings were changed.

## Founder acceptance

Home is not complete and is not approved for merge. Founder visual approval is required. No APK was built. APK56 predates this redesign and cannot validate it; a newly approved Preview binary would be needed for final physical-device verification unless an existing development client can load this exact source.
