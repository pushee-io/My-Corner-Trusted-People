## 2026-09-23 — Messaging merged; notification integration checkpoint

- Messaging UI PR #109 merged at `499be5fcc615840b9da138d2f0f0ca0c7b227887`; Mobile CI `35931632194` / `35931622333` passed.
- Shared notification projection combines existing notices and due recipient-addressed domain events, excludes raw payloads, preserves separate push-delivery state, and routes Hire/Job Safety to the correct participant view. New Hire/Job Safety emitters default off behind `community_notifications`.
- Added notification ownership/privacy/scheduled-event SQL checks and message rate-limit/notification-opt-out checks. Local mobile typecheck and 463 tests pass; lint zero errors/15 existing warnings. Isolated Database and Mobile CI remain the merge gates for this checkpoint.
- Three unapplied migrations and feature flags await explicit target approval. No new APK/native acceptance; device demo checklist is in `docs/REVIEWS_MESSAGING_DEMO.md`.

## 2026-09-23 — Private messaging experience verified locally

- Messaging security PR #108 merged at `e70ff9d19e9a155fa6f1ff62ea94b935d0f5db70`; Database CI `35930428166` / `35930418830` passed.
- Added one shared inbox/thread for neighbor and Marketplace conversations, realtime invalidation with polling fallback, unread counts, stable-nonce retry, block/report, masked neighbor discovery/profile, privacy settings and notification center. Account transitions clear private data and drafts; background realtime cannot refill hidden private state.
- Local typecheck, 462 tests and web export pass; lint has zero errors (baseline warnings only). Mobile CI is the next merge gate. No live migration, paid build or phone/tablet acceptance claimed.

## 2026-09-23 — Reviews merged; shared messaging security implementation

- Review backend PR #106 merged at `89df96ed6ce83a36e76fcb1c8301351f39cd4a08` after Database CI `35929466532` / `35929462481` passed. Review UI PR #107 merged at `52407c7f4fc37c8a939fe5a7f36e2ce9c717e126` after Mobile CI `35929712502` / `35929701286` passed.
- Messaging extends the existing Marketplace conversation/message tables with neighbor context, masked discovery, participant RLS, idempotent nonce, unread cursors, rate limits, settings, blocks and narrowly scoped report evidence. Old direct Marketplace inserts receive the same block/suspension/rate guards.
- Reuses notifications and the domain outbox; never includes message body in notification/outbox payloads. No push delivery or E2EE claim. Neighbor messaging defaults off; schema application remains blocked pending explicit approval for the connected project.
- Messaging security CI and experience implementation are next; no paid build or native device acceptance is claimed.

## 2026-09-23 — Verified review experience implemented

- Added post-completion review entry, accessible 1–5 stars, title/body/recommendation and experience guidance; provider review list, real aggregate summary, one response, reporting and moderator decisions.
- Added private My Activity with request history and reviews written. Draft text clears with account-session changes and is not persisted or included in analytics.
- Local typecheck, all 453 tests and web export passed; lint has zero errors and 15 existing warnings. Backend PR #106 remains gated on Database CI; Preview migration remains blocked by auto-review. No native test/build is claimed.

## 2026-09-23 — Verified reviews and private messaging checkpoint

- Audit main: `ecb7811054cb61ff174a159e40a1bf1929171c78`. Reuse `reviews`, Marketplace conversations/messages, `blocks`, `notifications`, `domain_event_outbox`, masked identity and protected resource lifecycle.
- First implementation: completed-job review security, public projection, one review per job, seven-day audited edits until response, provider reply, report/moderation and content-free notification events. Require both Job Safety completion confirmations so a forged Completed request cannot create a Verified Job review.
- Backend review feature defaults off. Auto-review rejected deployment to connected project `opeojxwkwwnnncnsuaag` as a live schema/access-control change; no migration or flag was applied. Continue implementation and isolated Database CI; deployment requires explicit target/migration approval.
- No APK build authorized. Review and messaging native phone/tablet acceptance remains pending. See `docs/REVIEWS_MESSAGING.md` for scope and checkpoint status.

## 2026-09-21 — Replacement-icon Preview APK built and verified

- One approved build completed successfully: source `2e3f9913c8800f6575e5e2da89dfe3003e851b4f`, EAS `3df2be28-e78a-4fdc-8cbb-95abe4e334c2`, APK workflow `35620057933`, Mobile CI `35620057872`.
- Download: https://expo.dev/artifacts/eas/YrUT3UNvSI4dQSdrDQxFG9nk6hvlTVvikJ2-v-9EMiU.apk
- File `my-corner-preview-2e3f991.apk`, 71,944,794 bytes; SHA-256 `5abf89a6273618cddd65f94d3ec460b663890e5992782b2c5a9afcd599f1b846`.
- Verified source commit, Preview backend, application ID, media bytecode and exact replacement navigation font (`res/JS.ttf`). Archive integrity passed. Android version 38 supersedes 37, with the same package and signing certificate as `1c0dd00`; install using `adb install -r` or Android's Update prompt.
- Phone/tablet visual acceptance remains pending: confirm Hire person/checkmark and Community hands/heart icons in active/inactive states, navigation, and Structure with AI. Preview AI remains enabled; this build does not change backend configuration.
- Evidence: `docs/evidence/navigation-icons-preview-2026-09-21.json`. This one-build approval is consumed; no further paid build is authorized.

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

## 2026-09-18 — Media cleanup and Preview service verification

This checkpoint supersedes earlier media deployment/cleanup status.

- Draft PR #102 now adds durable Storage API cleanup for removal/replacement, failed or abandoned uploads, deleted parents, and deleted profiles. A worker authenticated by expiring, single-use tickets runs every five minutes; failures retry under leased queue entries.
- Preview `opeojxwkwwnnncnsuaag` received the foundation, cleanup, and scheduling migrations plus `process-media` and `cleanup-media`. Repository migration filenames match the versions recorded by deployment; remote history was preserved.
- All 22 authenticated HTTP assertions passed with fictional media and two temporary identities: upload, retry, processing, metadata removal, parent attachment, cross-account denial, malformed input, immediate read denial after removal, and worker authentication.
- Storage API cleanup completed eight jobs covering four stored objects; no test objects remained. Only fixture job eligibility was accelerated. The real signed-upload/processing retention windows remain intact.
- Temporary accounts, profiles, neighborhood and post were removed. `shared_media_uploads` is off. Delayed deletion receipts remain to catch any late signed PUTs.
- Local checks: 75 mobile suites / 376 tests; six server/PostgreSQL tests; TypeScript and Deno passed. Lint has zero errors and 15 baseline warnings. Latest PR CI remains the merge gate.
- Product screens remain disconnected. No APK was built. Next: review this checkpoint and its CI, then integrate one surface with parent-submit retry/text-preservation tests. Maximum-size/low-end-device performance and native picker/playback/cache behavior remain acceptance gates.
- Evidence: `docs/VC_MEDIA_PREVIEW_VERIFICATION.md` and `docs/evidence/media-preview-2026-09-18.json`.

## 2026-09-18 — Approved media foundation published in draft PR #102

This checkpoint supersedes older next-action statements below.

- The founder explicitly adopted the uploaded VC media directive in chat and approved publishing the shared-media foundation to `pushee-io/My-Corner-Trusted-People` in PR #102. The earlier authorization block is resolved; do not request this approval again.
- Baseline main: `debd1995ce5f599549d16ea932a04e639b1f411d`. Active branch: `codex/vc-media-foundation`; PR #102 remains draft pending foundation review and CI.
- Published foundation commit: `f17ad80f8e00c443b4afb35b266e96cbe9654d01`; verified tree `f609578292a7db1da509125035ed595f78780888` matches the reviewed local implementation. It includes private media upload/attachment policies, JPEG/MP4 processing, native controls, account-transition guards and tests. Product-surface integration is pending.
- Local verification: 74 mobile suites / 374 tests and five server/SQL tests passed; TypeScript, Deno, formatting, web export and Expo Doctor 18/18 passed. Lint: zero errors / 15 baseline warnings.
- Remote Mobile, Database and Media Functions workflows run on the PR. Check the latest PR head for authoritative results before merging; publication alone does not close technical gates. Storage cleanup, complete Supabase service verification and native media acceptance remain open in `docs/VC_MEDIA_CHECKPOINT_A_REVIEW.md`.
- No media deployment, flag activation or new APK is part of this publication. Paid EAS builds and production require separate approval.

## 2026-09-08 — Job Safety key configuration checkpoint

- The three pending provider-account, active-provider assignment, and job-report migrations are verified in Preview. Existing account links and roles are preserved.
- The internal Job Safety key helper now supports a named Supabase Vault secret when the existing server setting is absent. Existing configured keys retain precedence, and a missing or invalid key still fails closed.
- Founder-approved Preview key provisioning and a fresh-transaction AES-256 round trip passed. Client roles remain denied direct access to the helper and decrypted Vault values. No key values are present in this repository.
- The supporting migration only enables key lookup; it does not create or rotate secrets. The repository migration version matches the deployment record.
- Added isolated SQL coverage for missing configuration, Vault fallback, encryption/decryption, existing-setting precedence, invalid settings, and client denial. Database CI results are recorded on this repair PR.
- The installed Android build remains usable. Native fictional moderator sign-in and the complete requester/provider/moderator interaction are still pending.

Earlier checkpoints follow; this status supersedes their pending migration and encryption-configuration gates.

## 2026-09-08 — Android launch and provider-account guard checkpoint

- The approved Android Preview APK is installed on the emulator and physical phone; installed artifact identity matches on both.
- Both devices report successful starts of the app's explicit launcher activity. The emulator reused an existing activity; the phone completed a cold launch. Visible-screen confirmation and the full native requester/provider/moderator flow remain pending.
- Pending provider-test reconciliation now locks and checks the destination before detaching any account. It skips occupied destinations and non-provider source/destination roles while preserving existing access.
- SQL regression cases cover occupied moderator/provider destinations, unlinked non-provider destinations, non-provider source accounts, successful reconciliation, audit behavior, and repeated application. Database CI verifies the complete SQL/RLS suite; consult this repair PR's check results.
- Typecheck passes. Lint has zero errors and 15 existing warnings on the unchanged mobile tree.
- Preview migration deployment, fictional moderator readiness, and private-location encryption configuration remain prerequisites for native acceptance. Repository CI and device launch receipts do not establish live backend readiness.
- The existing approved APK remains the application test artifact because this repair changes SQL, tests, and documentation only. No additional Android build was submitted.

Earlier checkpoints follow; the current status above supersedes conflicting historical next actions.

## 2026-09-08 — Job report review repair checkpoint

- Requester reporting, moderator review, audit history and requester outcomes are connected in the focused repair branch.
- Local mobile verification passes: 68 suites / 329 tests, typecheck, formatting, and lint with zero errors / 15 existing warnings.
- Application, database/RLS, and existing browser usability CI passed on application commit `50b4df5` in PR #97. Expo Doctor passed 18/18 checks.
- Native two-device acceptance remains pending; no new Android build was started.
- See `docs/ANDROID_JOB_SAFETY_MODERATION_VERIFICATION.md` for checkpoint status.

# MY CORNER — SESSION CHECKPOINT

**Updated:** 2026-09-02
**Status source:** Live GitHub, Actions, Supabase Preview, and founder-supplied two-device evidence

## Completed Checkpoint

- Starting `main`: `43ac2d431342c409eb3c1a8066914b74e3aae5e5`.
- Branch: `codex/reject-inactive-provider-requests`.
- Final branch head: `8367f4702eddb2ca0687fba4d087d04ed5a8dfab`.
- PR #94: merged.
- Final `main`: `922a7c4671078ffc94e74141c2cff794c46764ef`.
- Final Mobile CI `33574967156`: success.
- Final Database CI `33574967154` and `33574965187`: success.
- Post-merge Mobile CI `33575181099`: success.
- Post-merge Database CI `33575181081`: success.
- Supabase Preview check `100077604509`: success.

## Verified Outcome

New requests cannot target inactive or retired provider profiles. The current client also performs an availability preflight and gives refresh guidance. Tests prove inactive assignments fail and active assignments succeed. Existing requests and providers were preserved.

The first CI head exposed two incomplete test fixtures. Both were repaired without weakening production code: the Module 1 flow now mocks the provider preflight, and the SQL test captures an inactive provider UUID before switching to authenticated RLS.

## Exact Next Action

Cancel the unreachable test request, restart both installed apps, submit one replacement to freshly loaded Kwame PipeCare, verify provider receipt, accept or decline, and verify requester-visible persistence.

## Restricted Actions

Do not submit another paid build, deploy to production, activate real messaging or identity services, apply destructive migrations, process sensitive real-user data, or disclose/change secrets without explicit founder authority.
