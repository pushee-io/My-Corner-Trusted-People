# Native Compact, Tablet, and Accessibility Verification Report

**Updated:** 2026-08-31
**Repository baseline:** `41da91b8d39fb44c2dca66aefda5eea7846599d4`
**Status:** Blocked before build submission by rejected preview client key

## Objective

Verify My Corner on compact phones, tablets in portrait and landscape, large text, screen readers, reduced motion, slow or interrupted networks, permission-denied states, and privacy-sensitive location flows.

## Completed and Verified

### Repository and CI

- PR #72 removed the portrait-only Expo lock with `orientation: "default"`.
- PR #72 preserved `ios.supportsTablet: true`.
- PR #72 Mobile CI run `33452110556`: success.
- PR #72 post-merge Mobile CI run `33452253404`: success.
- PR #73 added explicit button semantics and a 48 dp minimum target to shared error-state retry actions.
- PR #73 Mobile CI run `33452633558`: success.
- PR #73 post-merge Mobile CI run `33452764182`: success.
- Each run covered dependency installation, preview contract, Expo Doctor, formatting, lint, typecheck, Jest, and web export.
- No EAS build was triggered.

### Source Inspection

- `Screen` uses safe-area handling, scrolling, and width breakpoints at 600 and 840 dp.
- Shared content width is constrained for medium and expanded windows.
- Welcome adapts its lockup at large font scale and compact width.
- Bottom navigation exposes tab roles, labels, selected state, and 48 dp minimum targets.
- Shared offline and error retry actions now expose button semantics and 48 dp minimum targets.
- Existing state components cover loading, empty, error, success, and offline presentation.
- Exact-address and private-location device behavior was not inferred from source alone.

## Completed but Not Independently Verified

- Expo config is capable of tablet portrait and landscape.
- Responsive source paths exist for compact, medium, and expanded widths.
- Automated regression tests protect the two repaired accessibility/orientation contracts.

These statements do not prove real-device rendering or assistive-technology behavior.

## Blocked Native Evidence

The following release-gating evidence remains unexecuted:

- Compact Android phone
- Higher-quality Android phone
- iPhone
- Tablet portrait
- Tablet landscape
- Large system text
- TalkBack and VoiceOver
- Reduced motion
- Slow and intermittent network
- Location and photo permission denial
- Exact-address and private pickup-location privacy
- Rotation while a request form is partially completed
- Keyboard and focus behavior on supported tablets

## Blocking Conditions

- The founder reports a Samsung SM-G736U and Android Studio are available locally.
- The cloud execution container cannot access that local `adb` device or Android Studio directly.
- The container cannot clone GitHub through its outbound proxy.
- The founder approved exactly one paid Android EAS preview build for this checkpoint.
- Workflow run `33455069758` failed closed during preview-key verification before EAS submission.
- PR #77 repaired publishable-key header handling and passed Mobile CI.
- Retry run `33455643194` still received HTTP 401 from Supabase before EAS submission.
- No paid build has been submitted, so the one-build allowance remains unused.
- No production deployment or real-user communication is needed or authorized.

## Safe Unblock Paths

1. With founder approval, replace the EAS preview `EXPO_PUBLIC_SUPABASE_ANON_KEY` with the current public client key for project `opeojxwkwwnnncnsuaag`; never log or commit the value.
2. Rerun the approved one-time EAS Android preview build through the fail-closed GitHub workflow.
3. Verify the completed APK provenance, application ID, staging Supabase reference, hash, and workflow artifact.
4. Install the APK on the Samsung SM-G736U through the founder's connected Android environment.
5. Supply captured device results and screenshots as durable GitHub evidence.
6. Record failures as separate small PRs, one root cause per checkpoint.

## Exact Next Action

Approve and complete the EAS preview client-key update, complete the approved build, install it on the Samsung SM-G736U, and execute the native matrix. Do not mark this checkpoint complete until the matrix above is executed. Once the native gate is green, continue to the app-shell checkpoint: Create menu, notification center, profile destination, and authorized deep links.

## Defect Classification

- P0: none confirmed.
- P1: native compact/tablet/accessibility evidence remains missing for release readiness.
- P2: source inspection found and repaired portrait-only orientation and an underspecified shared retry target.
- P3: none added by this checkpoint.
