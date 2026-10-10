# Phase B — compact headers and navigation

Status: implementation and native component QA in progress; no merge, deployment or paid EAS build.

## Source and scope

- Main fetched at start: `20611de2e9f92e5e82ac5991fab1fff9f0f1e93d`.
- Base: Phase A PR #178, `758e0f0f6f192d053b6079665894103da21e91c0`. This retains the APK54 dependency chain and merged #176 provider CTA order.
- Branch: `codex/compact-navigation-2026`.
- Native fixture setup was attempted before Phase B publication. The first attempt required Expo authentication; the second loaded successfully but capture was blocked by a cold-emulator launcher ANR and first-run developer menu. The next capture compares Phase A and Phase B side by side. These setup failures are not passing QA results.

The workspace has no Android SDK/emulator/KVM or connected phone. A dedicated GitHub Actions job runs an API 35 x86_64 emulator with Expo Go. It renders copies of the real shared components from pinned Git refs. This uses no EAS build and connects to no account/backend. It is native component evidence, not a substitute for signed-in whole-app acceptance.

## Before and intended after

| Surface | Before | Phase B |
| --- | --- | --- |
| Home header | Logo, Messages pill, Notifications text, repeated Home title | Existing logo with compact accessible message/bell actions and real message unread count |
| Deep header | Logo + global actions + AI pill + Back/title | Back and readable wrapping page title |
| Focused forms | Bottom navigation usually visible | Hidden during request creation/review, review writing, group/event creation/editing and profile verification/edit forms; Back remains |
| Standard browse/detail screens | Six stable bottom tabs, saturated green selection | Same six destinations and authorization gates; restrained active surface and green icon, explicit disabled color, press/focus feedback |

Keep Home's existing Ask My Corner AI entry in its body. Do not add a new AI entry, change provider CTA placement, alter request guards, change Job Safety or add repository calls. Back continues to use actual router history and Home fallback. Android Ask Back dismisses the keyboard before navigating, as before. Existing form-specific back/cancel actions and all request context remain intact.

## Expected application files

- `mobile/src/components/AppHeader.tsx`
- `mobile/src/components/Screen.tsx`
- `mobile/src/components/MessagesAccess.tsx`
- `mobile/src/components/BottomNavigation.tsx`
- New `mobile/src/components/IconButton.tsx`
- New `mobile/src/lib/navigation-layout.ts` (presentation-only route policy)

No route component, repository, authorization, upload, safety, reputation, provider identity or logo artwork changes are planned.

## Native evidence method and limits

- `.github/workflows/native-ui-qa.yml` runs only on the Phase B branch for relevant changes; concurrency cancels superseded runs.
- `mobile/scripts/prepare-native-ui-qa.cjs` creates a temporary `.native-ui-qa` entry in the CI checkout. Production `package.json` is never committed with that entry. Before/after presentation source is copied from Git, with explicit fixture adapters for router, capabilities, unread count, network state and comments-provider context.
- `mobile/scripts/capture-native-ui-qa.py` captures native PNGs and UIAutomator XML at phone 360dp, phone font scale 1.6, and tablet approximately 853dp. It presses the real shared retry and acknowledgement controls. Its request button only represents enabled state and cannot submit anything.
- Fixture provider content is clearly labeled QA and supplies no real ratings/verification. It tests header/CTA space and control layout; the actual provider and Create Request route contracts remain covered by existing Jest integration tests.
- Full signed-in before/after screens, hardware navigation with the real Expo Router stack, TalkBack, keyboard in the actual forms, media-heavy scrolling and profile-photo save on the user's emulator/phone remain separate acceptance gates.

## Validation plan

Retain and extend global-back-navigation, navigation-continuity, bottom-navigation and Messages unread/navigation tests. Add checks for focused versus browse routes, compact deep headers, one Home messages/bell action, capped visible counts with full accessible counts, disabled/selected tab styling, 48dp targets and press/focus feedback. Run all mobile tests, typecheck, lint/format, web/Android exports. No database gate is needed for a presentation-only diff; backend behavior is not changed or claimed retested.

Founder approval is still required to merge the modernization PR. Native component screenshots alone do not complete the program's full device QA requirement.
