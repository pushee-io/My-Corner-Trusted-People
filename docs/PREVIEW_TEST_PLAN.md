# EAS Preview Test Plan

Date: 2026-08-02
Target: Android internal-distribution APK
Locale: en-GH
Timezone: Africa/Accra

## Build Evidence

- Commit: Pending
- EAS build ID: Pending
- Build URL: Pending
- APK installation: Pending
- Tester accounts: Supplied separately; never stored in the APK or repository

## Required Viewports

| Class           |                    Target | Orientation            |
| --------------- | ------------------------: | ---------------------- |
| Compact         | 320, 360, and 390 dp wide | Portrait               |
| Medium tablet   |       600 and 768 dp wide | Portrait and landscape |
| Expanded tablet |           840 dp or wider | Portrait and landscape |

## Critical Flows

- Welcome, sign-in, neighborhood confirmation, and Home navigation.
- Requester category, provider list, filters, profile, request creation, submission, status, cancellation, and reporting.
- Provider incoming request, detail, accept or decline, response, and status update.
- Events remains unavailable while its client and database feature flags are disabled.
- Exact requester and event addresses remain hidden until an authorized release condition.

## Accessibility

- TalkBack labels and reading order are understandable.
- Text scaling up to 200 percent does not hide critical information.
- Interactive targets are at least 48 by 48 dp.
- Inputs expose visible labels, errors, disabled state, and focus.
- Status is communicated with text, not color alone.
- Reduced-motion behavior remains understandable.

## Offline And Failure

- First launch offline shows a useful failure state.
- Previously loaded data remains understandable offline.
- Duplicate taps do not submit duplicate requests.
- Failed writes show retry or recovery guidance.
- Queued Events writes retry once connectivity returns.
- Missing images do not block names, trust signals, or status.
- Sign-in and expired-session failures do not reveal credentials.

## Exit Criteria

- No critical crash.
- Requester and provider critical flows complete on a compact phone.
- Core navigation and details work on a tablet in both orientations.
- No exact-address disclosure.
- No test password appears in source, build configuration, logs, or screenshots.
- All critical defects are fixed or explicitly block release.
