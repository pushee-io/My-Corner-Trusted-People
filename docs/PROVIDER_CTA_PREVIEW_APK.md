# Provider CTA Preview APK

The founder approved a new Preview APK on 2026-10-09 after merging PR #176.

Source composition:
- Current main `20611de2e9f92e5e82ac5991fab1fff9f0f1e93d`, including PR #176's Start request placement correction.
- APK53 checkpoint `cc86266d13081e5a6be6e2252355d0c33285af09`, retaining PR #173's profile/Marketplace changes and PR #174's trust checkbox.
- Build branch `codex/provider-cta-preview-apk`.

This avoids reverting already-installed APK53 features while #173/#174 remain unmerged. The only application changes from APK53 are the provider profile section order and its tests from merged #176. Existing button styles, provider/category route parameters, eligibility and reputation/review logic are unchanged.

Page order: provider name → headline/area → trust signals → **Start request** → reputation/reviews → service coverage. Only one Start request action remains for an eligible provider.

The workflow checks the combined mobile source before submitting exactly one EAS Android Preview build. Known completed APK53 is accounted for in the duplicate guard; active or other unaccounted-for finished builds still block submission. The finished artifact must match the source commit, application ID `com.mycorner.trustedpeople`, Preview backend `opeojxwkwwnnncnsuaag`, and a version code greater than 53. Existing product markers and absence of the obsolete acknowledgement button remain verified.

Native phone/emulator acceptance is pending. The earlier emulator profile-photo/checkbox report is not assumed resolved by this CTA change. No backend deployment, migration or Production change is included. Build receipt, results and download link will be recorded after completion.

Local combined checks: **605 tests / 105 suites passed**; typecheck and formatting passed; lint passed with zero errors and 15 existing warnings.
