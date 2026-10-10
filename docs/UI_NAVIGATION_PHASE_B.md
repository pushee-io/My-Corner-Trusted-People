# Phase B — compact headers and navigation

Status: implementation and native component QA passed; draft for founder review. Full signed-in app and physical-device acceptance remain open. No merge, deployment or paid EAS build.

## Marketplace focused-creation correction — 2026-10-10 UTC

The follow-up review found that Marketplace's inline New listing form retained bottom tabs. This correction supersedes the earlier statement that no route file changed, and extends Phase B only to satisfy focused Marketplace creation; the broader Phase F redesign remains deferred.

- Marketplace initially shows browsing with bottom tabs and one New listing action. Opening it shows only the existing listing form under a compact New listing header, with bottom tabs hidden.
- Header Back returns to browsing without discarding in-memory text, photos or the media controller. Continue listing reopens that draft. Android hardware Back first dismisses an open keyboard, then returns to browsing; Back from browsing retains the existing router history/fallback behavior.
- A successful post clears the completed draft and restores browsing with the posted listing and confirmation. Invalid/failed submissions retain the focused form and draft for retry. No repository, upload, authorization or submission protocol changed.
- The shared Screen/AppHeader accepts an optional local Back callback. Other consumers retain the existing behavior. Only the Screen subtree remounts when switching between browse/create, resetting scroll position; the Marketplace draft/media/submission hooks remain mounted.
- The native fixture workflow is now manual (`workflow_dispatch`) to avoid automatic emulator capture on routine corrections. No native run or APK was requested for this correction. The earlier PNGs remain evidence for their recorded source, not visual acceptance of this new Marketplace mode.

Exact follow-up files: `mobile/app/marketplace.tsx`, `mobile/src/components/Screen.tsx`, `mobile/src/components/AppHeader.tsx`, new `mobile/src/__tests__/marketplace-focused-navigation.test.ts`, `.github/workflows/native-ui-qa.yml`, and this document.

Local validation: 65 tests across 6 focused suites passed (Marketplace mode transitions, draft/controller retention, keyboard/hardware Back, successful post, validation/failure retry, existing navigation, Marketplace identities and photo retry); TypeScript and formatting passed; lint had 0 errors and 15 existing warnings. The latest PR head's Mobile CI is the authoritative full-suite/bundle result.

Physical-device acceptance remains open. After Mobile CI passes, obtain founder approval for one Preview APK containing this correction and Phase B. Check normal text/display settings, Marketplace browse/create/Back/draft resume and posting, provider → request → review context, checkbox guards, hardware Back and keyboard scrolling. Do not merge or declare device acceptance from component tests.

## Source and scope

- Main fetched at start: `20611de2e9f92e5e82ac5991fab1fff9f0f1e93d`.
- Base: Phase A PR #178, `758e0f0f6f192d053b6079665894103da21e91c0`. This retains the APK54 dependency chain and merged #176 provider CTA order.
- Branch: `codex/compact-navigation-2026`.
- Native fixture setup was attempted before Phase B publication. The first attempt required Expo authentication; the second loaded successfully but capture was blocked by a cold-emulator launcher ANR and first-run developer menu. A third attempt exposed an extra Back event in the harness after Expo onboarding; that event was removed. The fourth attempt captured and passed the phone header assertions, then exposed Expo Go reloading during the tablet switch. Inspection also showed that the running app had not applied the changed Android font scale. The harness now restarts after each display change and checks the actual React Native font scale before capturing. The capture compares Phase A and Phase B side by side. These setup failures are not passing QA results.

The workspace has no Android SDK/emulator/KVM or connected phone. A dedicated GitHub Actions job runs an API 35 x86_64 emulator with Expo Go. It renders copies of the real shared components from pinned Git refs. This uses no EAS build and connects to no account/backend. It is native component evidence, not a substitute for signed-in whole-app acceptance.

## Before and intended after

| Surface | Before | Phase B |
| --- | --- | --- |
| Home header | Logo, Messages pill, Notifications text, repeated Home title | Existing logo with compact accessible message/bell actions and real message unread count |
| Deep header | Logo + global actions + AI pill + Back/title | Back and readable wrapping page title |
| Focused forms | Bottom navigation usually visible | Hidden during request creation/review, review writing, group/event creation/editing and profile verification/edit forms; Back remains |
| Standard browse/detail screens | Six stable bottom tabs, saturated green selection | Same six destinations and authorization gates; restrained active surface and green icon, explicit disabled color, press/focus feedback |

Keep Home's existing Ask My Corner AI entry in its body. Do not add a new AI entry, change provider CTA placement, alter request guards, change Job Safety or add repository calls. Back continues to use actual router history and Home fallback. Android Ask Back dismisses the keyboard before navigating, as before. Existing form-specific back/cancel actions and all request context remain intact.

## Exact application files

- `mobile/src/components/AppHeader.tsx`
- `mobile/src/components/Screen.tsx`
- `mobile/src/components/MessagesAccess.tsx`
- `mobile/src/components/BottomNavigation.tsx`
- New `mobile/src/components/IconButton.tsx`
- New `mobile/src/lib/navigation-layout.ts` (presentation-only route policy)

No route component, repository, authorization, upload, safety, reputation, provider identity or logo artwork changes were made.

## Native evidence method and limits

- `.github/workflows/native-ui-qa.yml` runs only on the Phase B branch for relevant changes; concurrency cancels superseded runs.
- `mobile/scripts/prepare-native-ui-qa.cjs` creates a temporary `.native-ui-qa` entry in the CI checkout. Production `package.json` is never committed with that entry. Before/after presentation source is copied from Git, with explicit fixture adapters for router, capabilities, unread count, network state and comments-provider context.
- `mobile/scripts/capture-native-ui-qa.py` captures native PNGs and UIAutomator XML at phone 360dp, phone font scale 1.6, and tablet approximately 853dp. It presses the real shared retry and acknowledgement controls. Its request button only represents enabled state and cannot submit anything. The test toolbar and wrapper add fixture-only vertical space; these are not pixel-exact screenshots of production routes.
- Fixture provider content is clearly labeled QA and supplies no real ratings/verification. It tests header/CTA space and control layout; the actual provider and Create Request route contracts remain covered by existing Jest integration tests.
- Full signed-in before/after screens, hardware navigation with the real Expo Router stack, TalkBack, keyboard in the actual forms, media-heavy scrolling and profile-photo save on the user's emulator/phone remain separate acceptance gates.

## Validation plan

Retain and extend global-back-navigation, navigation-continuity, bottom-navigation and Messages unread/navigation tests. Add checks for focused versus browse routes, compact deep headers, one Home messages/bell action, capped visible counts with full accessible counts, disabled/selected tab styling, 48dp targets and press/focus feedback. Run all mobile tests, typecheck, lint/format, web/Android exports. No database gate is needed for a presentation-only diff; backend behavior is not changed or claimed retested.

Founder approval is still required to merge the modernization PR. Native component screenshots alone do not complete the program's full device QA requirement.

## Phase report

| Required item | Result |
| --- | --- |
| 1. Current main SHA | `20611de2e9f92e5e82ac5991fab1fff9f0f1e93d` (rechecked against GitHub) |
| 2. Branch | `codex/compact-navigation-2026` |
| 3. PR | [#179](https://github.com/pushee-io/My-Corner-Trusted-People/pull/179), draft, stacked on #178 |
| 4. Validated application SHA | `5ade90755479f457d1c3178876da98c822e1d7a6`; later evidence-only commits are identified by the PR head |
| 5. Screens changed | Shared chrome on Home and Screen consumers; focused forms listed in `navigation-layout.ts`. No route files edited. Existing explicit tab opt-outs remain respected. |
| 6. Components | New IconButton; refactored AppHeader, MessagesAccess, Screen, BottomNavigation. New presentation-only isFocusedForm helper. |
| 7. Design tokens | No token changes; consumes Phase A semantic color, typography, radius and touch tokens. Existing logo artwork remains unchanged. |
| 8. Before / after | See hierarchy table above: compact Home icon actions, Back/title on deep pages, focused forms without tabs, quieter selected tab styling. |
| 9. Screenshots | 20 native PNGs captured; all after states and representative before states visually reviewed at 360dp/font 1.0, 360dp/font 1.6 and 853dp/font 1.0, plus checked and keyboard-open states. See gallery and evidence manifest below. |
| 10. Tests run | Full mobile Jest suite plus focused navigation tests, TypeScript, ESLint, Prettier, Preview contract, Expo compatibility and bundle checks. |
| 11. Test results | 646 tests in 106 suites pass locally; focused run 82 tests in 5 suites passes. CI tests pass. No existing test removed. |
| 12. Static / build gates | TypeScript and formatting pass. ESLint: zero errors, 15 existing warnings. CI web export (1,064 modules) and Android export (1,322 modules), Expo compatibility and Preview contract checks pass. |
| 13. Emulator QA | API 35 Expo Go native component CI passed: compact deep headers, focused-form tab absence, retry callback, checkbox check/uncheck and corresponding continuation enabled/disabled state. Actual RN width/font scale verified before capture. Test router/data adapters are explicit; this is not whole-app acceptance. |
| 14. Physical-device QA | Not performed; no phone is connected to this workspace. Verify real signed-in Home/deep screens, provider context, Android hardware Back, TalkBack and photo save on the user's devices. |
| 15. Accessibility | Back, Messages and Notifications have spoken labels; unread count is fully spoken even when visible count caps at 99+. Icon and tab targets are at least 48dp; selected/disabled state and visible press/focus feedback remain. Titles wrap without truncation. Native TalkBack and external-keyboard traversal remain unverified. |
| 16. Performance | No new backend calls, image assets, animations, persistence or list behavior. Messages uses the existing unread resource. No frame-rate/memory benchmark claimed. |
| 17. Unresolved visual work | Full-screen signed-in acceptance and remaining C–J work remain. Missing approved AI character assets and mixed legacy body layouts are unchanged. |
| 18. Functionality regressions | None detected in automated tests. Profile-photo save on the user's emulator remains unresolved and is not addressed by this presentation diff. |
| 19. Privacy/security | No auth, RLS, repository, upload, safety, reputation or identity logic changed. Fixtures use clearly labeled test content without live data. The earlier private-group external-share concern remains recorded in the Phase A audit. No Production action. |
| 20. Review readiness | Draft for code/design review; not ready to declare full Phase B acceptance or merge until remaining whole-app/device gates pass and founder approves. Native component evidence has been reviewed. |

### Exact supporting files

- `mobile/src/__tests__/global-back-navigation.test.ts`: root/deep header composition, Back and focused/browse route matrix, explicit opt-out and wrapping.
- `mobile/src/__tests__/navigation-continuity.test.ts`: provider-only Home destination, restricted tabs, selected/disabled states, 48dp targets and press/focus feedback.
- `mobile/src/__tests__/neighborhood-assistant.test.ts`: unread 0/3/145, visible 99+ cap, full spoken count, Messages/Notifications destinations.
- `mobile/src/__tests__/day20f-bottom-navigation.test.ts`: default visibility with the focused-form presentation policy.
- `.github/workflows/native-ui-qa.yml`
- `mobile/scripts/prepare-native-ui-qa.cjs`
- `mobile/scripts/capture-native-ui-qa.py`
- `.gitignore`: generated fixture and Python cache exclusions.
- `docs/UI_NAVIGATION_PHASE_B.md`: this report.

### Remaining whole-app acceptance

- Open real requester Home, provider, Create Request and Review with Preview data; check provider/service context and existing Start Request placement.
- Verify Android software/hardware Back with actual router history, direct links and keyboard open; no dead ends or duplicate navigation.
- Verify acknowledgement direct/stale-route guard, uncheck behavior and final request submission on Preview.
- Check role-restricted destinations as requester and provider-only accounts, including restoration after sign-in.
- Check TalkBack order/announcements, large text, keyboard focus, photo save and media-heavy scrolling on emulator and physical phone.
- Capture full-screen before/after evidence as each C–J area changes; fixtures do not replace that matrix.

## CI references

- [Mobile CI 38012344824](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/38012344824), job 114094920079: all gates passed on application source `5ade90755479f457d1c3178876da98c822e1d7a6`.
- Native harness fixes after the application commit do not modify shipped app code. They only control Expo Go startup in the temporary CI emulator.

### Preliminary native phone findings

The valid 360dp phone captures from run 38012807946 show the provider fixture CTA moving from y=962px to y=600px (181dp higher at density 320), with Reputation below it. Back measures 96×96px (48dp). The compact Home logo/actions fit, deep titles wrap, and the request fixture has no bottom tabs. This is a fixture measurement, not a claim about a signed-in provider page. The images labeled large-text in that partial run are excluded from large-text acceptance because React Native had not applied font scale 1.6.

### Capture reliability fixes

The harness now distinguishes Expo onboarding from its normal developer menu, waits for the actual React Native width and font scale, and settles Android configuration changes before relaunching Expo Go. A bounded two-attempt recovery handles an observed launcher return; unresolved startup failures retain screenshots, hierarchy and runtime-error logs. Phone evidence was captured successfully before these harness corrections; large-text, tablet and interaction results are accepted only after their own checks pass.

## Verified native result and gallery

- [Native run 38014626098](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/38014626098), job 114102056426: **passed**. Artifact `native-ui-components`, ID 11654614258.
- [Mobile CI 38014629893](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/38014629893): **all gates passed** on `18eaf8adbb79ed4ddbed8167a50fc139544b8e93`. Shipped application source is unchanged from `5ade90755479f457d1c3178876da98c822e1d7a6`.
- Baseline `758e0f0f6f192d053b6079665894103da21e91c0` is Phase A. This run provides native rendering evidence for Phase A and Phase B, not a native comparison against pre-Phase-A styling.
- Final successful capture supersedes the partial/debug runs above. Twenty PNGs, eighteen UIAutomator hierarchies and a source/hash manifest are preserved in `docs/evidence/ui-navigation/`.
- Visual findings: compact Home actions fit; long deep titles wrap; provider CTA remains above Reputation and visible at font scale 1.6; request acknowledgement text stays intact and readable; tablet content remains centered and width-constrained. No header/control overlap observed in the inspected after states. At large font, lower Home cards extend below the scroll viewport. With the keyboard open, the focused title field and Back remain visible; lower form content requires scrolling/dismissal. Full-form keyboard traversal and signed-in screens remain unverified.
- Native retry and checkbox callbacks pass. This does not submit a backend request or independently prove authorization/navigation context; existing automated integration tests cover those contracts, and actual device acceptance remains required.

| Fixture / size | Before | After |
| --- | --- | --- |
| foundations / phone | [Before](evidence/ui-navigation/before-foundations-phone.png) | [After](evidence/ui-navigation/after-foundations-phone.png) |
| provider / phone | [Before](evidence/ui-navigation/before-provider-phone.png) | [After](evidence/ui-navigation/after-provider-phone.png) |
| request / phone | [Before](evidence/ui-navigation/before-request-phone.png) | [After](evidence/ui-navigation/after-request-phone.png) |
| foundations / large-text | [Before](evidence/ui-navigation/before-foundations-large-text.png) | [After](evidence/ui-navigation/after-foundations-large-text.png) |
| provider / large-text | [Before](evidence/ui-navigation/before-provider-large-text.png) | [After](evidence/ui-navigation/after-provider-large-text.png) |
| request / large-text | [Before](evidence/ui-navigation/before-request-large-text.png) | [After](evidence/ui-navigation/after-request-large-text.png) |
| foundations / tablet | [Before](evidence/ui-navigation/before-foundations-tablet.png) | [After](evidence/ui-navigation/after-foundations-tablet.png) |
| provider / tablet | [Before](evidence/ui-navigation/before-provider-tablet.png) | [After](evidence/ui-navigation/after-provider-tablet.png) |
| request / tablet | [Before](evidence/ui-navigation/before-request-tablet.png) | [After](evidence/ui-navigation/after-request-tablet.png) |

[Checked acknowledgement](evidence/ui-navigation/after-request-checked.png) · [Keyboard open](evidence/ui-navigation/after-request-keyboard-phone.png) · [Source and hashes](evidence/ui-navigation/evidence.json)

### Exact added evidence files

- `docs/evidence/ui-navigation/after-foundations-large-text.png`
- `docs/evidence/ui-navigation/after-foundations-large-text.xml`
- `docs/evidence/ui-navigation/after-foundations-phone.png`
- `docs/evidence/ui-navigation/after-foundations-phone.xml`
- `docs/evidence/ui-navigation/after-foundations-tablet.png`
- `docs/evidence/ui-navigation/after-foundations-tablet.xml`
- `docs/evidence/ui-navigation/after-provider-large-text.png`
- `docs/evidence/ui-navigation/after-provider-large-text.xml`
- `docs/evidence/ui-navigation/after-provider-phone.png`
- `docs/evidence/ui-navigation/after-provider-phone.xml`
- `docs/evidence/ui-navigation/after-provider-tablet.png`
- `docs/evidence/ui-navigation/after-provider-tablet.xml`
- `docs/evidence/ui-navigation/after-request-checked.png`
- `docs/evidence/ui-navigation/after-request-keyboard-phone.png`
- `docs/evidence/ui-navigation/after-request-large-text.png`
- `docs/evidence/ui-navigation/after-request-large-text.xml`
- `docs/evidence/ui-navigation/after-request-phone.png`
- `docs/evidence/ui-navigation/after-request-phone.xml`
- `docs/evidence/ui-navigation/after-request-tablet.png`
- `docs/evidence/ui-navigation/after-request-tablet.xml`
- `docs/evidence/ui-navigation/before-foundations-large-text.png`
- `docs/evidence/ui-navigation/before-foundations-large-text.xml`
- `docs/evidence/ui-navigation/before-foundations-phone.png`
- `docs/evidence/ui-navigation/before-foundations-phone.xml`
- `docs/evidence/ui-navigation/before-foundations-tablet.png`
- `docs/evidence/ui-navigation/before-foundations-tablet.xml`
- `docs/evidence/ui-navigation/before-provider-large-text.png`
- `docs/evidence/ui-navigation/before-provider-large-text.xml`
- `docs/evidence/ui-navigation/before-provider-phone.png`
- `docs/evidence/ui-navigation/before-provider-phone.xml`
- `docs/evidence/ui-navigation/before-provider-tablet.png`
- `docs/evidence/ui-navigation/before-provider-tablet.xml`
- `docs/evidence/ui-navigation/before-request-large-text.png`
- `docs/evidence/ui-navigation/before-request-large-text.xml`
- `docs/evidence/ui-navigation/before-request-phone.png`
- `docs/evidence/ui-navigation/before-request-phone.xml`
- `docs/evidence/ui-navigation/before-request-tablet.png`
- `docs/evidence/ui-navigation/before-request-tablet.xml`
- `docs/evidence/ui-navigation/evidence.json`
