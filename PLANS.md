## 2026-09-21 — Replacement-icon Preview APK authorized

- Founder explicitly approved one new APK after PR #105 merged: "i approve a new APK build".
- Build latest merged main with the supplied Hire and Neighborhood icons, retaining the existing Preview backend, signing configuration and automatic Android version increment. Preview AI remains enabled.
- One explicit build-trigger commit submits the APK. Release gates and APK checks include byte-for-byte verification of the bundled replacement icon font.
- Build result and download evidence pending. Phone/tablet acceptance remains pending; no production deployment is included.

## 2026-09-21 — Founder-supplied navigation artwork

- Replaced the Hire footer glyph with the supplied person/checkmark and the Community footer glyph with the supplied Neighborhood hands/heart artwork.
- Preserved the original PNGs and traced scalable vector glyphs into a 31 KB bundled font using the existing Expo icon library. No new app dependencies; active/inactive colors, labels, routes, capability gates and 48 dp targets are retained.
- Local typecheck and all 446 tests passed; lint reports zero errors and the existing 15 warnings. Glyphs visually inspected at 24, 48 and 96 px in both selection colors. Formatting and Android Hermes export also passed; the exported font matches the committed asset. PR #105 merged at `3ccb95a19a51c74b194bef616388015785f4bad9` after Mobile CI passed for both push and PR (`35619442320`, `35619459962`). Font rebuild is deterministic.
- These client changes are not in the existing `1c0dd00` APK. A new paid APK needs fresh founder approval; no build was triggered. Native phone/tablet acceptance is pending that build. Preview AI remains enabled as recorded below.

## 2026-09-21 — Live AI structuring verified and enabled

- After the founder confirmed API credit availability, one authenticated fictional sink-leak request returned HTTP 200 with `enabled: true` and valid title, description, urgency, missing information and safety warning fields.
- Preview `ai_service_request_structurer` is now TRUE. This supersedes earlier missing-secret and HTTP 429 blockers; the exact earlier 429 subtype was not established.
- Response title: Water Leak Under Kitchen Sink. Response description: There is water leaking under the kitchen sink that started this morning. Urgency: flexible. The result remains a suggestion for explicit user review; the test did not submit a service request.
- The quota counter recorded one call. Test session logout returned HTTP 204; temporary Auth user/profile were removed, zero fixture rows verified, and enabled flag read back true.
- PR #104 safe diagnostics merged at `3e1f9d74ad25f1e29835a61a60cfda0ff380604f` after Media Functions and Database CI passed. Eleven server tests and Deno check passed.
- Existing approved APK `1c0dd00` supports this server activation; no new APK is needed or was built. Phone/tablet AI UI acceptance remains pending: Create Request → enter text → Structure with AI → review/apply/edit → submit only when explicitly chosen.

## 2026-09-21 — AI settings detected; upstream HTTP 429 blocks activation

- Founder reported both Preview secrets saved. Authenticated availability check returned HTTP 200 / available=true, confirming the function sees its key/model and enabled flag.
- Two fictional sink-leak attempts returned HTTP 503 from the Edge Function; the second diagnostic established upstream OpenAI HTTP 429. No successful suggestion is claimed. The filtered diagnostic did not establish a particular credit/rate/spend subtype.
- Per the two-attempt limit, no further content requests were made. The Preview AI database flag is restored to false. Both test sessions were logged out; temporary Auth user and profile removed, with zero remaining fixture rows verified.
- Required next step: founder checks OpenAI API credits and project/organization limits; then retry one fictional request. Do not rotate the key solely for this 429. No new APK is required.
- Preview function v5 adds fixed allowlisted diagnostic reason codes and upstream HTTP status, preserving the generic user error. No upstream message, secret or request content is returned. Eleven server tests and Deno check passed. Changes are published for review in the AI diagnostics PR.

## 2026-09-21 — Merge complete; one new Preview APK authorized

- Founder explicitly requested merge and approved one new APK build after the three media retests passed.
- PR #102 merged at `35cfdda2469dec6ff8385c0f8c9770b8a0c8482f`; PR #103 merged into main at `6e29fbebf13d48870660fd80cc7dcc76e71e3031`.
- Merged source tree `7e4fa61dca3e1dd61fb80c951fe2c1c7167e21b9` exactly matches the tested PR #103 tree. Mobile, Database, Media Functions and Job Safety CI passed at `2e964e0`.
- This build authorization supersedes earlier draft/build holds. The explicit build-trigger commit starts exactly one EAS Preview APK using the existing workflow and signing credentials, with an incremented Android version.
- New phone/tablet acceptance remains pending. AI runtime configuration still returned 503; its database flag remains off and manual request submission is supported. No production deployment is authorized.
- The approved APK is BUILT AND VERIFIED: source `1c0dd00`, EAS `be2f266e-ec74-45ba-a757-a0c743328b8f`, workflow `35608359612`. File `my-corner-preview-1c0dd00.apk`, 71,938,470 bytes; SHA-256 `f21ecb90933cd1a8416891851614b319d13cf9f983db92a30bb49d8d865d6d70`.
- Download and full provenance: `docs/evidence/vc-reliability-preview-2026-09-21.json`. Source, backend, app ID, archive and embedded media/UX markers verified. This build approval is consumed. Next: install as an update and perform the phone/tablet retest; no new paid build without approval.

## 2026-09-21 — Focused media retest passed; reliability/UX implementation

- Founder reported all three corrected `62e3cec` APK retests passed: video centering, playback/close/background stability, and Hire attachment Review/Back/submit/readback.
- Live main at audit: `debd1995ce5f599549d16ea932a04e639b1f411d`; implementation builds on PR #102's `d26d7abb14417f4d0bb4811fdeb1d929fe41625c` source.
- New reliability/UX work: shared protected refresh for request/status/safety screens; all active requests; authorized live Search; icon navigation; native Invite Friend; distinct registration; server-backed, explicitly reviewed AI suggestions with manual fallback.
- The audited provider-only account has no verified residence; the other account is a verified resident/provider/moderator. Existing account roles and memberships remain unchanged.
- Published draft PR #103, stacked on #102. Implementation commit `c4c23ca` passed Mobile, Database, Media Functions and Job Safety CI. Preview registration/allowance migrations and structurer function v1 deployed; SQL verification passed. New registration also blocks client edits to phone verification.
- Authenticated AI availability returned HTTP 503 with the Preview flag enabled; server key/model configuration remains blocked. The AI database flag was restored to false and temporary test identity/profile removed. New native acceptance and final-head CI/review remain gates. No additional APK has been built or authorized.
- See `docs/VC_RELIABILITY_UX.md` for findings, file/test mapping, configuration and the two-device test plan. This entry supersedes stale earlier current-state/next-action statements.

# My Corner — implementation plan

## Active: approved VC media activation

- [x] Inspect live main and Preview media/storage contracts.
- [ ] A: Foundation and durable cleanup published in draft PR #102. Preview upload/access/cleanup verification passed; current PR CI/review and native media acceptance remain gates.
  - [x] Durable cleanup and temporary picker-file disposal.
  - [x] Controlled Preview Auth/Storage/processor/worker verification; fixture cleanup; uploads disabled afterward.
  - [x] Repair review findings: invalidate expanded photos on authorization refresh; resume completed-original upload retries. Add 12 component/transport regression cases.
  - [x] Re-reviewed the repaired foundation at `705e83c`; its CI passed. Founder authorized product-screen integration and one new Preview APK.
- [x] B implementation: Profile pictures, replacement/removal and shared avatars.
- [x] C implementation: Neighborhood Feed images and video.
- [x] D implementation: Hire request media restricted to participants.
- [x] E implementation: Group avatar/cover and member post media.
- [x] F implementation: Event cover/gallery/video under existing audience rules.
- [x] G implementation: Marketplace video preserving existing images and pickup privacy.
- [ ] H: Cross-surface security/performance and Android device verification.

Product integration passed 407 mobile tests and six media function/security tests. The device-repair regression total is 419 tests across 81 mobile suites. Native acceptance of the connected screens remains pending. See `docs/VC_MEDIA_PRODUCT_INTEGRATION.md` for the current source and build checkpoint; keep PR #102 draft.

- [x] Publish connected screens at `5d801dd`; Mobile, Database and Media Functions CI passed.
- [x] Build and verify the one approved Preview APK: EAS `214b0a28-2476-4271-aabc-2c07faa4c1a3`; APK and provenance published by the successful build workflow.
- [x] Trace the reported one-sided video frame, Close video exit and missing Hire picker against that APK source. Repair source and add 12 regression cases, including lifecycle and request-flow isolation.
- [x] Founder approved one corrected APK for the phone/tablet retest on 2026-09-18. Repair commit `e36ed2b` passed Mobile, Database and Media Functions CI.
- [x] Build and verify the one corrected Preview APK from `62e3cecc286203a6da28c3bf8805e20cc068944a`: EAS `7cbb3fcf-36e0-4ce7-85dc-620a3b8ba68c`, successful workflow `35388377487`. Direct download passed archive, application ID, Preview backend and repair-bytecode checks; checksum recorded in `docs/VC_MEDIA_PRODUCT_INTEGRATION.md`.
- [ ] Verify the connected media screens on the physical phone and tablet emulator before merge.

The founder explicitly adopted the directive and approved publishing the foundation in PR #102 on 2026-09-18. The initial implementation is published at `f17ad80`; verify the latest PR checks and keep the PR draft until technical gates pass. See `docs/VC_MEDIA_CHECKPOINT_A_REVIEW.md`.

Each checkpoint requires targeted tests, formatting, lint, typecheck, privacy review, pushed PR and successful CI before merge. Maintain continuity before long operations. On 2026-09-18 the founder authorized one new Android Preview build with “Connect product screens. build new APK”. Build the draft branch through the approval-gated workflow; do not merge or deploy to production.

The founder subsequently approved “one corrected APK for the phone/tablet retest”. That single corrected build is complete and verified. Install `my-corner-preview-62e3cec.apk` over the existing app on both devices, then retest the three reported failures. No further build or merge is part of this checkpoint.

## Completed verification

PR #101 offline session/profile restoration is merged. Founder device observations confirm reconnect recovery, network banner, explicit sign-out persistence and cross-account isolation. Native compact/tablet/accessibility gate is complete.

## Deferred

Unified notifications, organization/agency publishing, production verification adapters and release hardening remain outside this media milestone.
