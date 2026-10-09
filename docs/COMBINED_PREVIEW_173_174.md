# Combined Preview test APK — PR #173 and #174

The founder approved preparing one combined Preview test build for the physical phone and emulator on 2026-10-08 (New York time). This supplies the installable client needed for the outstanding device gates. It does not claim those gates have passed.

- Main base: `4ad0f8fb51bd1ab53818bb845989f6d6d28db759`.
- PR #173 head: `eb6db76fd5b02ab61920d75783e6a5121f38db9f` — profile picker lifecycle, public names beside Marketplace avatars, interested-neighbor refresh.
- PR #174 head: `1085a82c874276afd5d36f6c2e632a906eb90aaa` — accessible bordered trust checkbox and final submission guards.
- Branch: `codex/combined-preview-173-174`.
- Neither source PR is merged into main. No database migration or backend deployment is included.
- Profile: `preview`; backend restricted by the build verifier to `opeojxwkwwnnncnsuaag`.
- Android application ID remains `com.mycorner.trustedpeople`, allowing this signed APK to update the existing EAS Preview app without uninstalling it.
- The separately named local `My Corner PR173` app, if installed, uses a different application ID and will not be updated by this APK. Test the normal **My Corner** app after installation.

## Build gates

The approved workflow runs formatting, lint, typecheck and the combined Jest suite before submitting EAS. It verifies the Preview environment and refuses a duplicate submission if an active or unaccounted-for finished build exists. Known completed APK52 is explicitly accounted for. Artifact verification checks source commit, APK integrity, Android package/version, Preview URL, existing product markers and navigation font, new acknowledgement and Marketplace labels, and absence of the old acknowledgement button/accepted label.

Local combined validation: **600 tests / 105 suites passed**; typecheck and formatting passed; lint passed with zero errors and 15 existing warnings.

## Device acceptance

Use the same APK on both devices. Keep the app data; do not uninstall to work around an installation error.

1. Trust checkbox: initially unchecked, Review blocked; check → Review → Back retains state; uncheck blocks continuation; recheck enables normal submission. No separate Review and Accept button or dialog.
2. Profile photo: first selection, Save, hard close/reopen; replace and repeat. Confirm the approved photo appears on authorized surfaces.
3. Marketplace: using two Preview accounts, verify seller name/photo, buyer pickup request, interested-neighbor name/photo, foreground refresh and refresh while staying on the page.
4. Verify unrelated neighbors cannot view the private interested-neighbor list.
5. Check TalkBack reads the full acknowledgement with checkbox role/state and the whole row is an easy touch target.

Build ID, artifact, exact source and combined validation results will be recorded after the workflow completes. No Production changes are authorized or performed.
