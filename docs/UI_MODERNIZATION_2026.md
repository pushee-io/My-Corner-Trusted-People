# My Corner UI modernization: audit and staged plan

Audit date: 2026-10-10. Source: the founder's Complete 2026 UI/UX Modernization Program and current GitHub source. This is a source audit, not an emulator inspection. Native screenshots and device acceptance are still required.

## A. Baseline and audit summary

- Fetched main: `20611de2e9f92e5e82ac5991fab1fff9f0f1e93d` (merged PR #176, provider CTA order).
- PR #171 is merged. PRs #173 (avatar lifecycle/public identities), #174 (required trust checkbox), #175 (APK53 checkpoint), and #177 (APK54 checkpoint) remain open drafts.
- Implementation branch: `codex/ui-foundations-2026`, starting at #177 head `5071729d51dd00e6fe438c3d34b8a3be2f2f40fc`. That source includes current main and the fixes included in APK54. Stack the draft against `codex/provider-cta-preview-apk` to isolate modernization changes. This does not authorize merging its dependencies.
- Expo 54 / React Native 0.81.5 / React 19.1 / Expo Router 6. Shared `Screen` supplies safe areas, scrolling, responsive widths, `AppHeader` and bottom navigation. Existing protected-resource/session/repository boundaries must survive presentation changes.
- Existing typography, spacing and colors are partially tokenized. Three named radii all equal 8; many newer screens instead hardcode 10/12/16. Cards, fields and buttons repeat styles across routes.
- Shadows are not the principal problem in the inspected implementation. Repeated outlined controls, stacked header rows, dense text and inconsistent secondary actions account for more clutter. Avoid adding shadows to solve this.

## B. Current problems, by screen family

Paths below are relative to `mobile/`. All major families were inspected, including their JSX, shared dependencies and styling. Findings describe source behavior; runtime clipping, keyboard and scroll performance need native observation.

| Screen / source | Current finding | Planned correction / behavior to retain |
| --- | --- | --- |
| Home, `app/home.tsx` | Long stack of destination buttons precedes active/past requests; separate AI pill; moderator links add density. | Phase C: compact destination hierarchy and authorized activity previews; retain role gates and active/past partitioning. No invented activity. |
| Active / Past Requests, Home + `app/activity.tsx` | Existing expandable sections and status cards work, but long titles/metadata need large-text review. | Keep expanded state, canonical status and navigation; use shared type/surfaces. |
| Feed, `app/community/index.tsx` | Large composer, avatar/name on separate rows, untruncated body, text-first Like/Report, 40px Like target; no feed Share action or provider badge here. | Compact author row and timestamp; accessible reaction icons; optional expansion. Add badges only with authoritative provider evidence. Share requires an authorized visibility contract first. |
| Comments, `components/CollapsibleComments.tsx` | Existing modal manages keyboard, busy dismissal and account-scoped drafts. Dense inner reply rows; text controls. | Preserve this functional comments modal, focus/Back/session clearing. Modernize controls in C; do not confuse it with the removed acknowledgement modal. |
| Search, `app/search.tsx` | Detached ActionPill below TextInput; bordered results; canonical retrieval already isolated. | D: inline search icon and unified input; preserve submit behavior, keyboard blur and Basic Search independence from AI quota. |
| AI, `app/ask.tsx`, `components/AskMyCornerAccess.tsx` | Detached Send pill, several local radii/fonts, long source cards. Home entry already concise. | D: inline Send, compact cited results; retain quota, source links, cancellation/session and keyboard handling. Character architecture depends on approved art. |
| Hire categories / results, `app/hire/{categories,providers}.tsx`, `components/ProviderCard.tsx` | Text category symbols, passive filter-looking chips, green trust badges; reputation loaded per card. Empty copy mentions prototype/backend. | E: standard icons and evidence rows, distinguish actual controls from labels; preserve filtering/ranking/availability and data calls. |
| Provider profile, `app/hire/provider/[providerId].tsx`, `components/VerifiedReviews.tsx` | Correct #176 order: name/headline/area/trust → Start request → reputation/reviews → coverage. Header still consumes vertical space. | B/E: compact header, shared surfaces, readable trust evidence. Exactly one CTA; preserve provider/category parameters and eligibility. Do not invent an avatar missing from the route. |
| Create Request, `app/hire/request/new.tsx` | Full shared header/bottom tabs, repeated field/chip styles; correct single bordered required checkbox from #174. | B/E: focused header/form layout. Keep exact acknowledgement meaning, scoped state, unchecked default, stale-route/async submit guards and attachment retry semantics. |
| Review, `app/hire/request/review.tsx` | Existing summary and final submission guard. Status card and repeated panel/button styles. | Retain normal Review and final guarded submit. No acceptance modal/page/button; no route-param acknowledgement. |
| Request status / provider inbox, `app/hire/request/status.tsx`, `app/provider/requests.tsx`, `app/provider/request/*` | Repeated panels/timeline/text actions; technical loading copy in inbox. | E: scan-friendly sections; preserve refresh, provider assignment, status transitions and reporting. |
| Job Safety, `app/hire/request/safety-session.tsx` | Several tinted panels and high-emphasis code/location controls; safety-specific authorization. | E: conservative presentation only after dedicated review. Keep private location release, one-time code and two-party completion unchanged. |
| Reviews, `app/reviews/*`, `components/VerifiedReviews.tsx` | Shared report buttons, rating/recommendation controls, pagination and moderator actions. | E/H: hierarchy and spacing only; preserve eligibility, verified-job definition, provider responses and moderation. |
| Messages / inbox, `app/messages.tsx` | Several utility buttons before conversations; shared report styles; text-first send/report/pagination. | H: compact inbox rows/composer. Keep private identity, participants, send retries, realtime, reports and authorization. |
| Notifications, `app/notifications.tsx`, `components/MessagesAccess.tsx` | Text Notifications header action; Messages pill carries unread count. Basic list/status text. | B/H: accessible icons and actual counts; preserve read/source navigation. Urgent banners need an authoritative urgency field, deduplication and dismissal. |
| Marketplace + create listing, `app/marketplace.tsx` | Listing composer precedes browse content; repeated cards and photo/video editors. | F: image/title/price/public seller hierarchy and less persistent composer clutter, preserving same authorized creation workflow. No silent route or media lifecycle rewrite. |
| Listing, `app/marketplace/listing/[listingId].tsx` | Seller and interested-party PublicIdentity present on #173 baseline; responsive image grid; separate private pickup sections. | F: improve visual sections while retaining seller/buyer authorization, private detail reveal and identity refresh. |
| Groups, `app/groups/index.tsx`, `new.tsx`, membership requests | Responsive cards, membership buttons and status copy; varying compact padding. | G: standard card/metadata patterns; keep membership state and moderator-only actions. |
| Group detail, `app/groups/[groupId].tsx` | Extra Back to groups with shared Back; cover/avatar galleries and member-only posts; existing external share exports author/group/body after warning. | B/G: compact chrome, coherent author/actions; privacy review required before enabling or expanding sharing. Warning is not an authorization boundary. |
| Events, `app/events/index.tsx`, `[eventId].tsx`, `new.tsx`, edit | Mixed custom cards/section borders; detail/create already hide tabs; detail has additional Back actions and lengthy organizer controls. | G: date/status/area hierarchy, contextual actions and truncation. Keep feature flag, RSVP, moderation and confirmed-attendee location boundary. |
| Agency broadcasts, `app/agency-broadcasts.tsx` | Similar card treatment for all broadcasts, text report action. | G: severity hierarchy only from existing authorized data, never infer emergency status from ordinary content. |
| Profile / neighbors, `app/profile/index.tsx`, `app/neighbors/*` | Large stack of verification/privacy destinations; public avatars use shared media layer. | H: grouped rows; retain approved public identities, visibility and native picker lifecycle. Profile photo save on user's emulator remains an unresolved prior report. |
| Settings, `app/settings.tsx`, message/location privacy | Repeated panels and text actions; developer diagnostics section exists. | H: consistent account/preferences hierarchy and source-appropriate diagnostic visibility; keep sign-out/session erasure. |
| Verification, `app/profile/verification.tsx` and phone/legal-name/address/map/location/postcard/manual-biometric/privacy routes | Dense technical/test-mode explanations; some inputs lack accessibility labels; prototype-specific status/location text. | H: label fields and clarify hierarchy without disguising test mode or inventing real verification. Preserve private identity boundaries and human review. |
| Onboarding / auth, `app/index.tsx`, sign-in/create-account/forgot/reset-password | Tabs hidden appropriately; native spinner during session restoration; landing duplicates a different logo lockup. | B/H/I: coherent existing logo use and readable fields; keep restoration/recovery/session guards and error actions. |
| Loading / empty / error / offline, `components/StateBlocks.tsx` | Consistent content API but no common surface primitive; body lacks line-height, retry font implicit, success has green outline, offline hardcoded tint. | A: reusable accessible surfaces/type/control states. I: later branded black/gold loader and state-specific messaging. Preserve actionable error text and retry functions. |

## C. Proposed design system

- Preserve brand green `#0E6B50`, pressed `#0A5A43`, existing logo gold `#F2B544` and logo geometry. Add semantic warm neutral surfaces, subtle dividers, a contrasting control border, disabled surface/text, and reserved ink/gold loader colors. No global recoloring of the logo.
- Add semantic card radius 16, spacious surface radius 24, control radius 12. Migrate inspected components explicitly; leave legacy `sm/md/lg` unchanged so an additive token cannot unexpectedly reshape the logo, checkbox or every screen.
- Keep 4/8/12/16/24/32 spacing; define screen gutter 16, card inset 16, section gap 24 and control gap 8. Future screens use these roles, not extra arbitrary values.
- Native system type: page 26/34, section 20/28, card 18/26, body 16/24, metadata 14/20, caption 12/18, label 14/20, button 16/24. No custom font download. Respect native font scaling; avoid fixed text heights and truncation on controls.
- Neutral secondary controls; green for primary actions. Minimum 48px touch height, readable disabled labels, visible pressed and keyboard-focus treatment. No opacity-only disabled text for migrated controls.
- A simple `Surface` centralizes border/radius/padding without becoming an interactive element or swallowing child accessibility. Reuse existing ActionPill instead of adding competing button APIs. State cards adopt the surface and typography first.
- Later IconButton/Input/SectionHeader abstractions must earn reuse in actual screens. Keep text on Start Request, Submit, Save, Confirm, Report and destructive actions.

## D. Staged execution and acceptance

| Phase | Reviewable scope | Required evidence before completion |
| --- | --- | --- |
| A | Semantic tokens/type, Surface, ActionPill, shared state cards | Contrast/interaction checks, regressions, component visuals, native layout/scaling check |
| B | AppHeader/Screen, bottom nav and standard icon actions | Back/cold-route/keyboard/session tests; phone/tablet screenshots; no duplicate or disappearing routes |
| C | Home/feed/comments | Authorized fixture scenarios, real preview screens, empty/long/media content, feed share/privacy decision |
| D | Inline Search/AI inputs, character configuration/state architecture | Search/quota tests, authorized source results, keyboard/long input, asset audit; no generated substitutes |
| E | Hire/provider/forms/review/request status, conservative safety styling | Provider parameters, CTA uniqueness/order, unchecked/revoked/stale acknowledgement, attachment retries and safety regression tests |
| F | Marketplace browse/create/detail | Two-account identities/private pickup, image-heavy lists, picker background/foreground on emulator and phone |
| G | Groups/events/agencies | Membership/RSVP/organizer/privacy/severity checks; long content and member-only data |
| H | Messaging/notifications/settings/profile/verification/auth | Private messaging/read counts, picker/save, auth recovery, sign-out, labels and public/private identity |
| I | Branded loader/state consistency/micro-interactions | Reduce Motion, no repeated requests/remounts, no unnecessary animation loops, readable failure/retry |
| J | Cross-screen acceptance | Before/after native screenshots for all ten required major screens, large text, small phone/tablet, keyboard/safe areas, scrolling and all quality gates |

Implement one bounded phase at a time; keep major changes as draft PRs until founder review. A paid APK build is not a substitute for native QA. Do not merge or deploy Production as part of this program.

## E. Expected files and assets

Phase A application files: `mobile/src/theme/tokens.ts`, new `mobile/src/theme/typography.ts`, new `mobile/src/components/Surface.tsx`, `mobile/src/components/ActionPill.tsx`, `mobile/src/components/StateBlocks.tsx`. Tests and screenshot harness accompany them. No route, repository, auth, RLS, upload or safety implementation changes in A.

Later phases touch the screen paths listed in B and shared Screen/AppHeader/BottomNavigation/MessagesAccess/AskMyCornerAccess/ProviderCard/VerifiedReviews/PublicIdentity/media presentation components. Do not bulk-replace all styles or rewrite repository calls.

Asset inventory at baseline: `mobile/assets/splash.png`, two navigation source PNGs and `navigation/MyCornerNavigation.ttf`. The logo is existing native view/text artwork in `components/brand/MyCornerLogo.tsx`, also duplicated in landing markup. No new logo is authorized.

All eight expected approved AI files are absent:

```
mobile/assets/my-corner-ai/characters/character-01-full.png
mobile/assets/my-corner-ai/characters/character-01-portrait.png
mobile/assets/my-corner-ai/characters/character-02-full.png
mobile/assets/my-corner-ai/characters/character-02-portrait.png
mobile/assets/my-corner-ai/characters/character-03-full.png
mobile/assets/my-corner-ai/characters/character-03-portrait.png
mobile/assets/my-corner-ai/characters/character-04-full.png
mobile/assets/my-corner-ai/characters/character-04-portrait.png
```

Phase D should provide a typed, single ID → full/portrait/label/state source with idle/thinking/success/caution states and static Reduce Motion behavior. Missing assets must remain explicit, not broken runtime `require`s or substitutes. PNGs alone do not provide expression animation. Need matching approved portraits/full artwork, rights confirmation, dimensions/byte budget and approved animation sources before expression animation can ship. Prefer lightweight native transforms for non-character indicators; evaluate an animation dependency only if approved sources require it.

No custom green/yellow animated-dot loader was found: current startup uses ActivityIndicator and shared LoadingState is text. Phase I must build on actual source, not claim to preserve an animation absent from this baseline.

## F. Regression and product risks

1. Dependency baseline: main alone omits the checkbox and avatar fixes from the currently tested APK. Stacking preserves them, but #173/#174/#177 acceptance and merge decisions remain separate.
2. Global token edits can change logos and small controls unintentionally. Phase A uses additive semantic tokens and explicit migrations; legacy tokens stay compatible.
3. Navigation compacting can break hardware Back, focused forms, session cleanup or keyboard behavior. Preserve Screen lifecycle and routing; test in B.
4. Existing group external-share behavior can export member-only post text. No new sharing may replicate it without an explicit authorized visibility design. Record this pre-existing concern; A does not change or exercise it.
5. Provider status, public identity, counts, alerts and AI sources must come from existing authorized data. Do not fabricate metadata to fill a new card. Some legacy routes contain static prototype content (`recommendations`, neighborhood/privacy/test verification); modernization must not make that look like live evidence.
6. Avatar photo-save failure reported on the user's emulator is still unresolved. APK identity was previously confirmed; do not dismiss it as a stale install. Reproduce selection → background/foreground → Save → reload on native hardware.
7. Long names, large text, keyboard insets, image-heavy lists and animations require device measurements; source inspection cannot establish visual/performance acceptance.
8. This workspace has no `adb`, connected Android device or `/dev/kvm`. Component rendering through React Native Web can support review but cannot satisfy the brief's emulator screenshots. Native QA remains a named gate, not a passed check.
9. Phase A adds no network calls, persistent state, external fonts, image assets or animation loops. Existing data/auth/RLS behavior remains outside its diff. Later repository-interacting changes require relevant database tests and Preview verification.

## Quality and evidence protocol

Run mobile unit/integration/repository regression suites, TypeScript, ESLint, Prettier and Android export. Do not weaken tests. Capture component before/after fixtures only in test tooling, never app routes. Record their renderer and baseline SHA. Native before/after screen captures remain required for Home, Feed, Provider Profile, Create Request, Search, AI, Marketplace, Groups, Events and Messages as each phase touches them. Keep Preview screenshots free of private user data.

Every phase report must include main/branch/PR/head, exact changed screens/components/tokens, before/after evidence, test counts/typecheck/lint/export, emulator/phone status, accessibility/performance findings, unresolved inconsistencies/regressions/privacy concerns and readiness. Code and passing CI alone do not complete a phase.
