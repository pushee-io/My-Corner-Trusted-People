# Home Groups / Events and character naming — founder review

Date: 2026-10-10. **READY FOR FOUNDER VISUAL REVIEW**. This records an implementation candidate, not founder acceptance or native QA completion.

## Source and scope

- Repository: `pushee-io/My-Corner-Trusted-People`.
- Branch: `codex/home-ai-continuation-2026`, existing open draft PR #181.
- Main verified: `9adacca341cb4f4a4b4897932d28052aa68108bb`.
- Starting PR head: `ac7b6221c0920b598affd195178a084618d5a9b3`.
- Application candidate: `96a0f3586021b16abe0f4155f9c612fd4c7bee04`.
- The subsequent documentation/evidence commit has identical application code. Its SHA is recorded in the PR and final response, rather than embedded recursively in this file.
- Read the full continuation directive, Home specification and previous founder-correction report. Reviewed the approved reference, original current-home photograph and committed Home evidence. Inspected open PRs; #181 remains the active modernization workstream.

## Corrections

Home retains its existing brand/location/communications header, shared animated AI card and visible Hire action. Its content order is now **Latest Feed Updates → Marketplace Showcase → Groups → Events → Agency Broadcast → compact requests**.

Groups and Events are full preview sections with bold headings, existing section routes, chevrons, compact content cards, exact detail links, and empty/loading/retry states. They are not directory shortcuts. Groups displays up to two recent authorized groups, available group-avatar media or an icon, name, bounded description, aggregate member count and the viewer's own accepted membership state. Events displays up to two upcoming approved scheduled events, date/time in the event's timezone, coarse area, calendar icon and the viewer's supplied going state. Agency Broadcast's existing visual treatment is unchanged.

Search retains its existing modern introduction, input, inline action, AI entry, retrieval, category results and keyboard behavior. **Events** appears between Groups and Agency updates and links to the existing `/events` route. That route's feature gate remains authoritative.

The shared character configuration now supplies display names and accessibility labels: `woman-kente` → **Ebony**, `older-man` → **Mr. Owusu**, `woman-purple` → **Mama G.**, `young-man` → **Ekow**. The selector displays portrait plus name, retaining its selected ring and semantic radio state. IDs, assets, local per-account persistence, conversation state, hand framing and shared motion logic are unchanged. Whole-character motion is not independent hand rigging; only approved assets that contain a wave show a waving hand.

The remaining plain review/job rows in AI and Search results now reuse the existing trust micro-cards. A shared presentation mapper preserves authorized review averages/counts, completed jobs (including zero) and supplied recommendation percentages. Unknown evidence remains absent/unknown. There is no invented rating or verification badge. The Search/AI contract does not supply phone verification; provider cards, Hire and provider profiles retain their evidence-based **Phone verified** badge.

## Data boundaries and performance

- Groups uses `getCommunityActionsReadRepository().listSocialGroupScreenSections` with the current capability-derived profile/neighborhood/cluster. Seeded fallback is rejected. Home projects only group metadata and the current viewer's membership status; posts and membership identities are not passed into preview components.
- Optional group-avatar media is fetched in one batch for the two displayed groups; failure falls back to an icon. Existing signed-media authorization remains in force.
- Events uses the existing runtime repository and feature gate, rejects seeded data, excludes drafts/pending/rejected/blocked/cancelled/past events and projects only preview fields. No venue, private address, attendee roster or organizer ID is rendered. Cached offline Events results are rejected on Home because the legacy cache is not scoped to this Home session.
- Existing protected-resource lifecycle clears previews when authorized context disappears. Detail routes recheck access. No auth, session, RLS, database schema or backend behavior was changed.
- Added reads reuse existing repositories; the Groups screen-section repository currently loads more data than Home renders. A future bounded preview query could reduce this cost, but no backend query redesign was introduced. Native scroll/memory measurements remain pending.

## Existing corrections verified

- Feed composer remains **“What’s happening, neighbor?”**. Share exports an access-controlled navigation link, and Report remains in Post options. Existing public identity/avatar, reactions, comments and truncation logic remains.
- Phone-verified provider badges depend on backend `phoneVerified`, not merely provider role. Shared trust modules retain real values and unavailable states. AI/Search now reuse those modules for their available aggregate evidence.
- Focused create/request/review/profile verification/event edit flows retain the focused-navigation policy. Marketplace retains its creation/draft-specific policy. Ordinary browsing retains tabs. The request review footer and exact acknowledgement guard remain.
- Shared compact Messages/Notifications controls, unread counts, safe routing and green active tabs remain. Priority overlay tests cover dismissal, timers, reduced motion and screen-reader behavior; no ordinary message is classified as an emergency from its text.

## Validation record

- Local targeted regression run: **11 suites / 55 tests passed** before the additional result-trust polish.
- Final local full run: **120 suites / 728 tests passed**.
- TypeScript: passed.
- Formatting: passed.
- Lint: passed with **0 errors / 69 existing warnings**.
- Preview contract: passed; this is a static contract check, not a live environment/provenance check.
- Local Android export passed for the Groups/Events/name changes. Final combined-candidate Android/web export and Expo compatibility results are recorded with CI below.
- **Mobile CI [38082827645](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/38082827645): PASSED** on the exact application candidate. All 120 suites / 728 tests, formatting, lint, typecheck, Preview contract, Expo Doctor (18/18), web export, Android export and all 26 dashboard captures passed. These are bundle exports, not APK builds.
- **Database CI [38082830553](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/38082830553): PASSED** on the same candidate. This is CI validation; no live Supabase modification was performed.
- Existing privacy/retrieval, handoff, persistence, communication, Feed, provider, request and focused-navigation tests all ran. New cases cover preview projections, feature disabled state, filtering/authorization failures, offline-cache refusal, section order, exact routes, canonical character names and truthful trust evidence. No test was removed or disabled.

## Screenshot evidence

[Evidence manifest](evidence/groups-events-2026/evidence.json). All 26 scenarios were captured in Mobile CI from the candidate above. Reviewed the full Home order, empty states, Search Events, compact/enlarged-name selector, Feed actions, trust cards, focused form and toast overlay. No overlapping names or clipped waving hand appeared in those fixtures. Mr. Owusu wraps onto two lines at enlarged text size without overlapping adjacent choices.

These are **React Native Web fixtures, not native Android screenshots or authenticated end-to-end captures**. Full Home uses an extended-height canvas so all five sections can be reviewed together. Feed/trust/form/toast captures are component compositions; they do not establish every full-screen interaction. Their illustrative data is test-only. Static images do not validate motion smoothness.

| Scenario | File |
| --- | --- |
| Home: Groups → Events → Agency Broadcast | [home-full.png](evidence/groups-events-2026/home-full.png) |
| Home empty sections | [home-empty-full.png](evidence/groups-events-2026/home-empty-full.png) |
| Events disabled state | [events-disabled.png](evidence/groups-events-2026/events-disabled.png) |
| Home phone | [phone.png](evidence/groups-events-2026/phone.png) |
| Home compact | [compact.png](evidence/groups-events-2026/compact.png) |
| Home tablet | [tablet.png](evidence/groups-events-2026/tablet.png) |
| Home enlarged text | [large-text.png](evidence/groups-events-2026/large-text.png) |
| Home empty phone | [empty.png](evidence/groups-events-2026/empty.png) |
| Home error/retry | [error.png](evidence/groups-events-2026/error.png) |
| Search with Events | [search-phone.png](evidence/groups-events-2026/search-phone.png) |
| Ask: all four names | [ask-phone.png](evidence/groups-events-2026/ask-phone.png) |
| Ask compact names and wave | [ask-compact.png](evidence/groups-events-2026/ask-compact.png) |
| Ask enlarged names | [ask-large-text.png](evidence/groups-events-2026/ask-large-text.png) |
| AI thinking — Mr. Owusu | [ai-thinking.png](evidence/groups-events-2026/ai-thinking.png) |
| AI answer — Ekow | [ai-answer.png](evidence/groups-events-2026/ai-answer.png) |
| AI attention — Mama G. | [ai-attention.png](evidence/groups-events-2026/ai-attention.png) |
| Feed copy and Share/options | [feed-actions.png](evidence/groups-events-2026/feed-actions.png) |
| Provider verification/trust cards | [trust-phone.png](evidence/groups-events-2026/trust-phone.png) |
| Focused form without tabs | [focused-form.png](evidence/groups-events-2026/focused-form.png) |
| Critical toast fixture | [critical-toast.png](evidence/groups-events-2026/critical-toast.png) |
| Messages | [messages-phone.png](evidence/groups-events-2026/messages-phone.png) |
| Notifications | [notifications-phone.png](evidence/groups-events-2026/notifications-phone.png) |
| Settings | [settings-phone.png](evidence/groups-events-2026/settings-phone.png) |
| Settings compact | [settings-compact.png](evidence/groups-events-2026/settings-compact.png) |
| Hire categories | [hire-categories.png](evidence/groups-events-2026/hire-categories.png) |
| Hire providers | [hire-providers.png](evidence/groups-events-2026/hire-providers.png) |

## Native QA: NOT YET TESTED ON NATIVE CAPTURE

This environment has no Android SDK/adb/emulator or KVM device. Tool inventory and standard SDK locations were checked; no usable native runner was found. The existing connector exposes no workflow-dispatch action. Local Chromium installation was attempted once and failed to download a valid archive; browser fixture captures use the existing Mobile CI environment instead. No extended retry loop or paid build was used.

| Native requirement | Result |
| --- | --- |
| Idle/thinking/answer animation; character switching; Reduce Motion | NOT YET TESTED |
| Home/Search/Ask/Feed/comments/forms keyboard; dismissal; Android Back | NOT YET TESTED |
| Home/Search/Groups/Events/Agency/Marketplace/Feed/provider/request/Settings navigation | NOT YET TESTED |
| Toast slide-in/swipe-dismiss; no accidental navigation or stuck overlay | NOT YET TESTED |
| TalkBack, focus, labels, text scaling, targets, contrast and form checkbox | NOT YET TESTED |

**Where to complete animation QA:** on an Android emulator on a development computer, or an Android phone running a compatible existing development installation for this candidate. From the mobile directory, `npm ci` and the repository's `npm run android` launch the Expo development server for an available emulator; use the project's approved Preview configuration and a permitted test account. The repository also has **Actions → Native UI component QA → Run workflow**, selecting this branch, for its existing shared-component smoke harness. That harness does not cover the full authenticated product or all AI/toast interactions and must not be treated as full native sign-off. None of these instructions authorizes an EAS submission.

On native, check all four characters on Home/Ask; idle → thinking → answer and error states; background/foreground; relaunch persistence; reduced motion; one-shot typed Home handoff; long/scaled text; keyboards and Back on each input screen; exact content routes and green active tabs; toast safe area, swipe and TalkBack. Record source SHA, device/OS, result and short screen recordings (static screenshots cannot prove smooth motion). Use test fixtures for critical alerts, never production alert creation.

## Acceptance checklist

YES below means implemented and covered by available code/browser checks; native and founder acceptance remain separate.

| Home | Result |
| --- | --- |
| Groups added as content preview section | YES |
| Events added as content preview section | YES |
| Groups before Events | YES |
| Events before Agency Broadcast | YES |
| Agency Broadcast preserved | YES |
| No Home directory regression | YES |

| Search | Result |
| --- | --- |
| Events category added | YES |
| Existing Events route correct | YES |
| Existing modern Search preserved | YES |

| AI characters | Result |
| --- | --- |
| Ebony | YES |
| Mr. Owusu | YES |
| Mama G. | YES |
| Ekow | YES |
| Shared canonical configuration | YES |
| Selector displays names | YES |
| Persistence preserved | YES |
| Animation implementation preserved | YES |
| Approved waving-hand presentation preserved | YES |

| Feed / trust / forms | Result |
| --- | --- |
| “What’s happening, neighbor?” | YES |
| Share action where permitted | YES |
| Report removed from primary action row | YES |
| Provider verified state correctly reflected where supplied | YES |
| Trust micro-cards preserved and extended to result evidence | YES |
| No fabricated trust data | YES |
| Focused creation flows hide bottom nav where appropriate | YES |

## Remaining original modernization program

| Area | Classification | Remaining work / boundary |
| --- | --- | --- |
| A — tokens, typography, surfaces, icons, brand, states | COMPLETE — NEEDS FOUNDER VISUAL REVIEW | Shared foundation retained; native contrast/large-text approval remains. |
| B — compact headers, green selected tabs, focused routes, Back | NATIVE QA REQUIRED | Keyboard-first Back, safe areas, transitions and all route families on device. |
| C — Home and Feed presentation | COMPLETE — NEEDS FOUNDER VISUAL REVIEW | Approve Groups/Events hierarchy; native real media, Share sheet, long posts, comment state and composition checks. |
| D — Search and AI presentation / names / result evidence | COMPLETE — NEEDS FOUNDER VISUAL REVIEW | Native motion, preference relaunch, keyboard, exact-once handoff and authenticated grounded results still require device acceptance. |
| E — Hire, provider trust, Create Request / Job Safety | NATIVE QA REQUIRED | Full request/status/review flows, sticky action with keyboard, checkbox and media recovery on native. |
| F — Marketplace browse/detail/create | PARTIALLY IMPLEMENTED | Existing presentation/draft behavior retained; native seller/interested-party identity, media, pickup and keyboard audit remains. Listing editing is NOT IMPLEMENTED in the existing client/API contract; adding that product/backend capability is BLOCKED BY PRODUCT DECISION. |
| G — Groups / Events / Agency | PARTIALLY IMPLEMENTED | Home previews complete for review; detail membership, RSVP, media and interaction QA remains. Authoritative broadcast severity and message urgency contracts are BLOCKED BY PRODUCT DECISION; ordinary content is not promoted to emergency styling. |
| H — Messages / Notifications / profile / Settings | PARTIALLY IMPLEMENTED | Shared communication chrome retained; thread send/block/report, profile photo save and account recovery/verification native review remains. |
| I — loaders, errors, empty states, motion and feedback | PARTIALLY IMPLEMENTED | New preview states complete; device consistency of legacy save/reaction/expand states and motion remains unverified. |
| J — accessibility / performance / final coherence | NATIVE QA REQUIRED | TalkBack, touch/gesture behavior, scaling, scroll/image memory, navigation lag and founder acceptance are not established by static fixtures. |
| Canonical identity / privacy / permissions | COMPLETE for this correction's regression gate | Existing architecture and backend boundaries unchanged; new projections explicitly omit sensitive fields. This does not claim a new full security audit. |

## Build discipline

**One final paid Preview APK is not yet justified for approval.** First complete founder visual review and the outstanding native interaction checks, or explicitly agree which device-only questions require a single approved binary at the final SHA. Founder physical-device verification remains necessary for hand framing/motion, safe areas, keyboards/Back, toast gestures, accessibility, media/share sheets and perceived performance.

No merge, Production deployment, Supabase modification, paid Preview APK, EAS submission, workflow #63 rerun or unrelated PR occurred. The earlier workflow-only empty `existing_build_id` default and source-aware duplicate guard remain unchanged.

## Exact files changed

Application and test candidate:

- `mobile/app/ask.tsx`
- `mobile/app/home.tsx`
- `mobile/app/search.tsx`
- `mobile/scripts/capture-home-dashboard.cjs`
- `mobile/src/__tests__/ai-character-motion.test.ts`
- `mobile/src/__tests__/canonical-search-screen.test.ts`
- `mobile/src/__tests__/home-dashboard-data.test.ts`
- `mobile/src/__tests__/home-dashboard-ui.test.ts`
- `mobile/src/__tests__/home-request-sections.test.ts`
- `mobile/src/__tests__/trust-badges.test.ts`
- `mobile/src/components/AICharacterExperience.tsx`
- `mobile/src/components/HomeDashboard.tsx`
- `mobile/src/lib/ai-characters.ts`
- `mobile/src/lib/home-dashboard.ts`
- `mobile/src/lib/reputation-signals.ts`
- `mobile/src/lib/search-repository.ts`

Documentation/evidence:

- `docs/ui-reference/home/HOME_UI_SPEC.md` — durable founder-required section order and preview acceptance criteria.
- `docs/UI_MODERNIZATION_GROUPS_EVENTS_2026.md` — this report.
- `docs/evidence/groups-events-2026/evidence.json` plus the 26 exact `.png` paths linked in the screenshot table above.
