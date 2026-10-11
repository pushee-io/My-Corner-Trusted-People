# Founder corrections — UI modernization review

Date: 2026-10-10. Status: **READY FOR FOUNDER VISUAL REVIEW**, subject to the validation record below. This is a review candidate, not completion or founder acceptance of the full program.

## Source of truth

- Repository: pushee-io/My-Corner-Trusted-People.
- Main: `9adacca341cb4f4a4b4897932d28052aa68108bb`.
- Branch: `codex/home-ai-continuation-2026`; existing draft PR #181.
- Starting head for this correction pass: `6ce48943ca4e16bc36f6f533f037d0b6c83ebae1`.
- Tested application candidate: 90347268bde851618ff06d0753839702195e7eb1.
- Follow-up evidence commit contains this report, captured images/manifest and a native QA harness formatting repair; application runtime code is unchanged.
- Read the full continuation directive and Home specification. Inspected the approved Home reference and existing artwork. The original current-home JPEG could not be rendered; the written specification and recorded founder findings remained authoritative.
- Continued the existing implementation; retained prior Home handoff, character preferences, retrieval/quota/fallback, native Hire action, tab selection, and request acknowledgement.
- This report supersedes the earlier checkpoint's unresolved Feed/Group sharing, badge presentation and provider filter observations. The earlier checkpoint remains historical evidence.

## Corrections and before/after

| Area | Correction | Evidence / limits |
| --- | --- | --- |
| Home header | Green My Corner wordmark, logo, Trusted People directly beneath, map pin with authorized neighborhood/city. Shared Messages/Notifications actions. | Phone/compact/tablet screenshots. No hard-coded neighborhood in production. |
| Home hierarchy | Bold dark section labels; retained white-on-green Hire CTA and existing feed/marketplace/broadcast/request preview order. | All three headings visible in tablet evidence; existing actions and source queries retained. |
| AI card and Ask | Replaced face-only crop with approved full-asset upper-body framing that retains the waving hand. Shared presentation and motion on Home and Ask; four approved choices retained. | Default woman and older man have waving artwork. Other approved characters retain their original poses. Whole-asset float/tilt/answer bounce, not independently rigged hand animation. |
| Home to Ask | Updated Ask experience uses inline composer, selected character and automatic one-shot submission of a typed Home question. | Existing handoff tests cover late parameters, authorized-context wait and duplicate taps; no second Send required. |
| Search | Discovery cards, strong hierarchy, inline clear/search, result category chips and grouped cards. | Existing canonical retrieval and independent basic-search quota behavior retained. |
| Communications | One icon/badge system across private screens; long titles gain full width on compact/large-text layouts. | Real authorized unread values; unavailable counts are not invented. |
| Critical overlays | Safe-area-aware top overlay, native-driver entry/exit, swipe/close, timed dismissal, reduced-motion support and persistent display for screen-reader users. | Live supported safety notices plus explicit priority values only; urgency backend gap below. No private message body in banner. |
| Feed | Composer says “What’s happening, neighbor?”; Share link action; Report inside Post options. Tabs hidden while composer is expanded. | Existing publish/like/comment/report paths retained; tests exercise the actual page. |
| Share privacy | Feed and Group external sharing now sends a navigation link only, with sign-in/access requirements. | No post body, author name, media or residential details exported. Destination authorization remains in force. Native share sheet still needs device QA. |
| Provider trust | Evidence-based phone-verification badge in cards/profile; icon micro-cards for real trust signals and verified-review summaries. | No badge when unverified, no fabricated jobs/ratings/response values, no generic guarantee of provider quality. |
| Hire discovery | Service category icons/cards; disabled provider search and decorative filters replaced with working search, accepting-request and phone-verified filters. | Filters operate only on the already authorized result set and preserve provider/category routing. |
| Focused forms | Broader focused-route policy and a sticky Review request footer; marketplace's accepted create/draft handling retained. | Back, media/save and exact acknowledgement validation remain. Native IME and safe-area checks remain. |
| Deeper consistency | Rounded neutral detail cards on Marketplace, Groups and Events; shared headers/toasts reach the other protected screens. | No new edit/RSVP/membership authorization or data behavior. |

No design token was changed in this correction pass. Existing green active navigation and 48px action targets were reused.

## Validation

- **PASSED:** [Mobile CI run 38041326737](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/38041326737), application commit `90347268bde851618ff06d0753839702195e7eb1`.
- **120 suites / 721 tests passed.**
- Formatting, lint, TypeScript, Preview contract and Expo Doctor: passed. Lint reports 69 warnings and zero errors; warnings are not represented as zero.
- Web export and Android export: passed. These are bundle exports, not APK/EAS builds.
- Trust acknowledgement, shared foundations and all 23 dashboard/screen/component captures: passed.
- After this tested application revision, the native QA harness received compatibility-only changes; its import adapters/expectations are prepared but native execution remains unverified. Application runtime code is identical. The final evidence commit applies the formatter's exact repair to that harness.


Tests cover Home handoff and branding; authorized search/retrieval; provider verification truth and discovery filters; request acknowledgement, media retry and draft behavior; Feed share/overflow moderation; notification feature-gated routing; session deduplication; toast tap/swipe/timer/unmount/Reduce Motion/screen-reader behavior; all six green active-tab states; focused-flow and keyboard-first Back behavior; canonical identity/privacy regressions.

Earlier iterations caught and repaired the shared-animation extraction syntax, disabled-Events notification routing, obsolete test mocks and formatting. The toast cleanup test now checks its actual timer handle rather than unrelated React scheduler timers. No existing test or quality gate was removed or disabled.

No backend, database, auth, RLS or repository-query implementation changed. The optional notice priority type describes supported presentation input; it does not fabricate or deploy server priority data. Existing repository/privacy tests ran; no live database changes/tests were performed.

## Screenshot evidence

Capture script: `mobile/scripts/capture-home-dashboard.cjs`. Manifest: [evidence.json](evidence/founder-corrections-2026/evidence.json).

All **23 scenarios** were captured. Representative layout review found no cropped waving hand, faded Hire action or overlapping controls in these fixtures. The approved reference remains the founder's visual acceptance target.

| Evidence | Screenshot |
| --- | --- |
| Home: brand, pin, wave, Hire, bold Feed/Marketplace labels | [phone.png](evidence/founder-corrections-2026/phone.png) |
| Compact Home | [compact.png](evidence/founder-corrections-2026/compact.png) |
| Home: all three bold section headers and request status | [tablet.png](evidence/founder-corrections-2026/tablet.png) |
| Home with simulated enlarged text | [large-text.png](evidence/founder-corrections-2026/large-text.png) |
| Home empty states | [empty.png](evidence/founder-corrections-2026/empty.png) |
| Home retry states | [error.png](evidence/founder-corrections-2026/error.png) |
| Search discovery | [search-phone.png](evidence/founder-corrections-2026/search-phone.png) |
| Messages inbox | [messages-phone.png](evidence/founder-corrections-2026/messages-phone.png) |
| Notifications | [notifications-phone.png](evidence/founder-corrections-2026/notifications-phone.png) |
| Settings | [settings-phone.png](evidence/founder-corrections-2026/settings-phone.png) |
| Compact Settings | [settings-compact.png](evidence/founder-corrections-2026/settings-compact.png) |
| Ask My Corner AI | [ask-phone.png](evidence/founder-corrections-2026/ask-phone.png) |
| Compact Ask | [ask-compact.png](evidence/founder-corrections-2026/ask-compact.png) |
| Ask with simulated enlarged text | [ask-large-text.png](evidence/founder-corrections-2026/ask-large-text.png) |
| Hire categories | [hire-categories.png](evidence/founder-corrections-2026/hire-categories.png) |
| Provider list: real presentation with fixture evidence | [hire-providers.png](evidence/founder-corrections-2026/hire-providers.png) |
| Verification badge and trust micro-cards | [trust-phone.png](evidence/founder-corrections-2026/trust-phone.png) |
| Feed composer copy and Share/options components | [feed-actions.png](evidence/founder-corrections-2026/feed-actions.png) |
| Hidden tabs and sticky form action | [focused-form.png](evidence/founder-corrections-2026/focused-form.png) |
| Top overlay example | [critical-toast.png](evidence/founder-corrections-2026/critical-toast.png) |
| Thinking state: older man | [ai-thinking.png](evidence/founder-corrections-2026/ai-thinking.png) |
| Answer state: young man | [ai-answer.png](evidence/founder-corrections-2026/ai-answer.png) |
| Attention state: woman in purple | [ai-attention.png](evidence/founder-corrections-2026/ai-attention.png) |

These are **React Native Web renders using test-only data**, not native Android screenshots, authenticated end-to-end data or founder acceptance. Full-page fixtures render actual Home, Ask, Search, Messages, Notifications, Settings, Hire categories and provider list components. Feed actions, trust signals, focused footer and critical overlay are component compositions; they do not claim complete authenticated Feed/provider/request screens. Static images demonstrate artwork and layout, not animation smoothness. Simulated text scaling is not an Android system-font test.

The local command runner did not produce usable output, so an emulator could not be established. The manual native QA fixture was updated for the new header dependencies and communication expectations, but could not be dispatched with the available controls. It remains a shared-component smoke harness, not coverage of the complete product or new toast/AI motion. Browser captures ran in Mobile CI. **Android emulator and physical-device QA remain unperformed.** No device setting workaround or paid binary was used.

## Remaining original-program work

| Phase | Current classification | What remains |
| --- | --- | --- |
| A — foundations | Implemented; visual acceptance pending | Cross-screen device contrast, typography and large-text approval. |
| B — navigation | Existing accepted flows retained; new header/focus polish needs review | Native Back/keyboard/safe areas and all active tabs. |
| C — Home/Feed | Implemented corrections; founder visual review pending | Real media, share sheet, long posts, comments, full Feed/native approval. |
| D — Search/AI | Implemented; native polish acceptance pending | Authenticated queries, keyboard/focus, preference relaunch, motion and Reduce Motion on device. |
| E — Hire/trust/forms | Implemented corrections; device audit remains | Full provider/request/status/review/Job Safety flows and sticky footer with keyboard. |
| F — Marketplace | Detail polish continued; partial program | No existing listing-edit API: editing requires a separately reviewed backend contract. Native media/pickup and draft QA remain. |
| G — Groups/Events/Agencies | Detail/share corrections implemented; priority source blocked | No authoritative broadcast severity or high-priority-message classification in current API. Server priority contract is needed for real urgent-message/emergency/critical-announcement delivery. Ordinary content is never promoted from keywords. Membership/RSVP/media native QA remains. |
| H — communications/account | Shared communication system implemented; deeper audit remains | Thread keyboard/send/block/report, profile photo save, account recovery and verification-form native accessibility. |
| I — states/motion | Shared AI/toast lifecycle implemented | Native save/reaction/expand-state consistency review; no claim every legacy state has been migrated. |
| J — final audit | Automated/browser evidence supplied; partial acceptance | TalkBack, gesture interactions, device text/display scaling, measured scrolling/memory/performance and founder approval. |

The overlay currently handles fresh authorized unread priority notices after the initial history snapshot, deduplicates across routes, bounds the queue and clears private state on session/background changes. Older updates remain in Notifications. This does not establish OS push delivery or emergency-service reliability.

Performance source review: native-driver whole-art transforms stop offscreen/background/reduced-motion; no per-keystroke provider network calls. Communication polling/realtime uses the existing protected-resource lifecycle. Global badges add authorized inbox/notification reads to private screens; retained full artwork and image-heavy lists still require native memory/scroll profiling. No measured performance claim is made.

## Founder review and build discipline

Founder visual review is needed before any build. Review the new Home/Ask direction, Search, trust presentation, header density, Feed controls and toast first. No new paid APK is needed for this code/screenshot review.

After visual approval, use an emulator/local development build where available to verify native keyboard, hand framing/motion, safe areas, toast swipe, share sheets, media, TalkBack and lifecycle behavior. A paid Preview APK requires explicit founder approval of one specific source SHA. The earlier workflow-only dispatch/default and source-aware duplicate guard correction remains intact; no EAS build was submitted or workflow #63 rerun.

No merge, Production deployment, Supabase modification, unrelated PR or paid Preview build occurred.

## Exact source files changed in this pass

- `mobile/app/community/index.tsx`
- `mobile/app/events/[eventId].tsx`
- `mobile/app/groups/[groupId].tsx`
- `mobile/app/hire/categories.tsx`
- `mobile/app/hire/provider/[providerId].tsx`
- `mobile/app/hire/providers.tsx`
- `mobile/app/hire/request/new.tsx`
- `mobile/app/home.tsx`
- `mobile/app/marketplace/listing/[listingId].tsx`
- `mobile/app/notifications.tsx`
- `mobile/app/search.tsx`
- `mobile/scripts/capture-home-dashboard.cjs`
- `mobile/src/__tests__/completed-review-cta.test.ts`
- `mobile/src/__tests__/global-back-navigation.test.ts`
- `mobile/src/__tests__/hire-media-flow.test.ts`
- `mobile/src/__tests__/home-dashboard-ui.test.ts`
- `mobile/src/__tests__/home-request-sections.test.ts`
- `mobile/src/__tests__/marketplace-focused-navigation.test.ts`
- `mobile/src/__tests__/modernization-communication.test.ts`
- `mobile/src/__tests__/notice-toast.test.ts`
- `mobile/src/__tests__/phase-c-feed.test.ts`
- `mobile/src/__tests__/provider-discovery.test.ts`
- `mobile/src/__tests__/provider-review-visibility.test.ts`
- `mobile/src/__tests__/trust-badges.test.ts`
- `mobile/src/components/AICharacterExperience.tsx`
- `mobile/src/components/AICharacterPresentation.tsx`
- `mobile/src/components/AppHeader.tsx`
- `mobile/src/components/CommunicationActions.tsx`
- `mobile/src/components/CommunicationContext.tsx`
- `mobile/src/components/CommunicationProvider.tsx`
- `mobile/src/components/FeedPostActions.tsx`
- `mobile/src/components/HomeDashboard.tsx`
- `mobile/src/components/MessagesAccess.tsx`
- `mobile/src/components/NoticeToast.tsx`
- `mobile/src/components/ProviderCard.tsx`
- `mobile/src/components/Screen.tsx`
- `mobile/src/components/TrustSignals.tsx`
- `mobile/src/components/VerifiedReviews.tsx`
- `mobile/src/components/brand/MyCornerLogo.tsx`
- `mobile/src/lib/communication-notices.ts`
- `mobile/src/lib/feed-share.ts`
- `mobile/src/lib/messaging.ts`
- `mobile/src/lib/navigation-layout.ts`

- `mobile/scripts/prepare-native-ui-qa.cjs`
- `mobile/scripts/capture-native-ui-qa.py`

The evidence commit additionally contains this report, the manifest and the representative PNGs listed there.
