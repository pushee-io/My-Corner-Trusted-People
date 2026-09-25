## 2026-09-25 — Ask My Corner retrieval checkpoint

- Audited live main `a5842b79c173833adf25299d74f169dfe8f49f42`, Search, existing Responses/Edge integration and authorization.
- Added disabled-by-default, bounded SECURITY INVOKER neighborhood retrieval for Events, Feed, accepted Groups, verified Agencies, providers/real reviews and Marketplace; private data sources excluded. Approved public organizer identity replaces potentially legal profile name.
- Added private quotas/metadata/feedback foundation and role-switched SQL security tests. Database CI pending before merge; no Preview deployment or activation yet.
- Continue with grounded server orchestration and global UI. Business/deal and formal poll data are absent; do not fabricate them. See `docs/AI_NEIGHBORHOOD_ASSISTANT.md`. No APK/production activation authorized by this directive.

## 2026-09-24 — Review/comments/Back APK version 41 verified

- The one approved Preview APK completed: version 41, source `912134c59fd046d772593aaadeb35e28da7288f8`, EAS `b545caec-80fa-4946-afac-728061e39f90`. Build workflow `35958534464` and Mobile CI `35958534387` passed, including 504 tests, typecheck, formatting and lint (zero errors/15 baseline warnings).
- Download: https://expo.dev/artifacts/eas/kjy7J86ruUZUD3fzCG5Q_OjeR-RvmxzhzoVnPgEHdNk.apk . File `my-corner-preview-912134c.apk`, 71,991,858 bytes; SHA-256 `dee63dc086ec355c0453d2c4d6f7937d78c9b62a48d1036f8d1bdf8e804f0cb5`.
- Verified actual APK source/backend/package, media/icons, review/comments/Back bytecode, archive integrity, manifest version 41 and same signing certificate as version 40. Install as an update using `adb install -r` or Android Update; keep the existing app/data.
- Evidence: `docs/evidence/review-comments-back-preview-2026-09-24.json`. One-build approval consumed; no additional build authorized. No backend or production changes.
- Samsung/Pixel Tablet functional acceptance remains PENDING. Test dynamic requester review CTA and already-reviewed state, Feed/Group/Event comments/draft/dismissal, global visible and Android Back/history/Home fallback. See `docs/REVIEW_COMMENTS_BACK_UX.md`. Artifact verification does not establish native acceptance.

## 2026-09-24 — One review/comments/Back Preview APK approved

- Founder explicitly approved one new Preview APK after PRs #119–#122 merged. Build the latest merged review CTA, collapsible comments and shared Back header with existing Preview backend/signing configuration.
- One explicit build-trigger commit submits the approved APK. Workflow release gates rerun tests/typecheck/lint/format and inspect APK provenance, backend/package, media/icons and new UX bytecode markers.
- Build result/download and Samsung/Pixel Tablet acceptance pending. This authorizes one build only; no production deployment or backend change.

## 2026-09-24 — Review CTA, comments and global Back merged

- Completed requester review CTA: PR #119, merge `bc2ab3b70964cf2c48696e0d0a7389d74518c4e9`; Mobile CI `35957268673` / `35957257880` and Job Safety `35957268668` passed.
- Shared collapsible Feed/Group/Event comments: PR #120, merge `0e9eea357144d75da841b45be0c28fd05670d683`; Mobile CI `35957718832` / `35957710034` passed.
- Shared fixed Back header: PR #121, merge `f9ed12e327b79a0d4a185111a6fc9260c14cb4c5`; Mobile CI `35958012669` / `35957998462` passed. Final local suite: 504 tests/91 suites, typecheck, format and lint (zero errors/15 baseline warnings). Existing privacy/security regression tests remain green.
- Implementation is committed/pushed/merged. CURRENT_STATE, SESSION_CHECKPOINT, PLANS, CHANGELOG and master handoff updated. Behavior and native checklist: `docs/REVIEW_COMMENTS_BACK_UX.md`.
- Native Samsung/Pixel Tablet acceptance remains PENDING. No connected device/adb is available in this workspace. Installed APK version 40 predates these three changes. One new paid Preview APK requires explicit founder approval; none was started. No database migration, production deployment, secret change, SMS/push or payment activation.

## 2026-09-24 — Shared Back navigation checkpoint

- Comments PR #120 merged at `0e9eea357144d75da841b45be0c28fd05670d683` after Mobile CI `35957718832` / `35957710034` passed. Review CTA PR #119 is also merged.
- Every current screen uses shared Screen. AppHeader now provides a top-left 48 dp Back arrow beside the page title, outside scrolling content and inside the safe area, retaining branding/Messages/Notifications and tablet width limits.
- Visible and Android hardware Back use actual Expo Router history, with Home replacement when none exists. Home/welcome root have no arrow; hardware Back exits at the terminal root. Native comments/media modals keep their own dismissal behavior; comment drafts survive dismissal.
- 504 tests/91 suites, typecheck and lint passed (zero errors/15 baseline warnings). Includes nested history, deep-link fallback, top-level destinations, Home hiding, hardware cleanup, accessibility and phone/tablet-width component checks. CI is the merge gate; these are not native device passes.
- Android Samsung/Pixel Tablet verification pending for all three UX updates. Installed version 40 predates them. No new paid build authorized or started; prepare one only after explicit founder approval. No schema, production or secret changes.

## 2026-09-24 — Shared collapsible comments checkpoint

- Review CTA PR #119 merged at `bc2ab3b70964cf2c48696e0d0a7389d74518c4e9` after Mobile CI and Job Safety checks passed.
- Feed, Group and Event comments now use one shared collapsed control/dialog with current counts, explicit Hide, outside dismissal, protected focused composer/submission, and Android modal Back dismissal. One dialog per Screen; no comments added to other modules.
- Existing screen comment repositories/realtime/count updates remain intact. Drafts survive dialog dismissal but clear on account/scope changes. Failed Event submissions now retain drafts.
- 486 tests/90 suites, typecheck and lint passed (zero errors/15 baseline warnings). Mobile CI is the merge gate. No database changes, new dependencies, paid build or native device acceptance claimed.
- Next: shared visible Back header and route regression tests. Phone/tablet acceptance still requires a separately approved corrected APK.

## 2026-09-24 — Completed Job Safety review CTA

- Added existing server-authorized ReviewPrompt directly below completed requester Safety sessions. Providers and incomplete sessions do not mount it. Dynamic business name; existing review switches to View or View/Edit per server policy.
- Review form has saved confirmation and Done/history return; locked reviews remain readable. Existing duplicate-review and completion authorization remain server-enforced; no schema/security changes.
- Targeted UI/review/Safety tests: 19 passed; typecheck and lint passed (zero errors/15 baseline warnings). Mobile CI is the merge gate. Android phone/tablet acceptance and a separately approved APK remain pending.
- Next checkpoints: shared collapsible comments, then shared visible Back navigation. No paid build or production deployment authorized.

## 2026-09-24 — Provider review Preview APK verified and ready for device retest

- Approved visibility migration is deployed on `opeojxwkwwnnncnsuaag` as remote version `20260924011448`; authenticated neighbor checks passed for matching 4.0/count 2, pagination, public projection and response association.
- One corrected APK completed: Android version 40, source `c0f019a68c27c9aa71df9b7f51a2fcec11ee55db`, EAS `3126f7c3-dd13-4b66-8473-f23367dc162d`. Build workflow `35942254309` and Mobile CI `35942254317` passed, including 472 tests, typecheck, format and lint (zero errors/15 baseline warnings).
- Download: https://expo.dev/artifacts/eas/g-hKHOYJI1h08Wr6TWSkbmQSG6GxV9Rl8oK7H7n1cdo.apk . File `my-corner-preview-c0f019a.apk`, 71,986,282 bytes; SHA-256 `313c82e1041c047b2d6d688c875f4bcda6aa6e536c3315db7ed2714982dd662a`.
- Verified actual APK source, Preview backend, package, media/navigation font and review bytecode. Manifest version 40 supersedes 39 with the same signing certificate. Install using `adb install -r` or Android's Update prompt; retain the existing app/data.
- Evidence: `docs/evidence/provider-review-preview-2026-09-24.json`. This one-build approval is consumed. Samsung/Pixel Tablet walkthrough remains pending: Hire → Kwame PipeCare → Reviews; confirm aggregate, stars, title/body, Verified Job, recommendation, masked author, response, and no private job/location data. No native device pass is claimed.

## 2026-09-24 — Review visibility migration deployed; corrected APK approved

- Founder explicitly approved `20260924005414_provider_review_visibility.sql` on `opeojxwkwwnnncnsuaag` and one corrected Preview APK.
- Migration applied successfully as remote version `20260924011448`. Authenticated non-reviewer verification returned average 4.0, count/verifiedCount 2, two distinct cursor pages, final-page termination, fictional public identity and corresponding response. Public projection contains only approved review fields. Anonymous RPC and authenticated direct private-helper execution remain denied.
- One explicit build-trigger commit starts the approved build from the merged provider-profile fix. Existing signing and Preview backend configuration remain in use. Download/provenance and Android phone/tablet acceptance pending; no additional build is authorized.

## 2026-09-24 — Provider visibility fix merged; Preview fixture verified

- PR #115 merged at `7a36178c14b35af3c2fdbba4624e38d177e6dfa4`. Final source `e14f3be55391528034021a11e89b74f941589ae8` passed Database CI `35941348784` and Mobile CI `35941348793` / `35941345142`; local 472 tests/88 suites, typecheck, format and lint pass (0 errors/15 baseline warnings).
- Root navigation defect fixed: provider cards now open actual provider profiles, which show review details; provider preview uses that same route. Correct grammar, bounded review pages, server eligibility/aggregate consistency and privacy tests included.
- Requested fictional Preview fixture applied on `opeojxwkwwnnncnsuaag`; existing review untouched. Authenticated non-reviewer readback: 4.0 average, 2 published reviews, 2 returned rows, clearly fictional demo review and corresponding response visible. Fixture is manual-only, opt-in guarded and idempotence-tested in CI.
- Automatic approval review rejected applying `20260924005414_provider_review_visibility.sql` to that project, requiring explicit approval for this exact new DDL/security migration. It remains UNAPPLIED. Do not bypass the block; request exact migration/target approval.
- Version 39 still contains the old card navigation. One corrected paid APK needs separate approval, followed by Samsung/Pixel Tablet acceptance. No new build or Android verification claimed; checkpoint is implemented but not yet fully device-accepted.

## 2026-09-24 — Provider review visibility root cause and fix

- Root cause: Hire provider cards navigated directly to `/hire/request/new`, bypassing the existing profile/review component. The separate provider profile-preview route was hard-coded and omitted reviews. Preview Kwame has one genuine published 4-star review with matching requester/provider and two-party completed Job Safety; another authenticated account's RPC returned that body. RLS is not the cause; legacy seeded 4.8/37 counters are not the displayed 4.0/1 summary.
- Provider cards now open the real profile; its Start request opens the editable form without fabricated sample data. Provider preview resolves the signed-in provider and redirects to the same real profile.
- Added singular/plural/zero states, recent-three review display, See all reviews, ten-row cursor pages, explicit recommendation and existing provider response. Server aggregation and rows now share a completed-job/requester/provider/safety join and match accepting-provider visibility. No legal identity, request ID, address or safety evidence is projected; optional experience tags are not stored and are not invented.
- Added guarded, manual-only fictional Preview fixture for Kwame (matching completed synthetic job and acknowledgements), excluded from migrations/production seeding. Existing user review remains unchanged. Added route/render/pagination and SQL privacy/eligibility/aggregate/moderation tests.
- Local 472 tests/88 suites, typecheck, format and lint passed (0 errors/15 baseline warnings). Database/Mobile CI, deployment and fixture readback pending. No new paid APK is authorized; Android phone/tablet acceptance cannot be claimed from unit/SQL checks.

## 2026-09-23 — Reviews/messaging Preview APK built and verified

- One approved APK completed: source `d218a151a2524c2cd1ae8f7686895f75bc3538f0`, EAS `3beca53c-37e2-470d-ae5e-f4a7b55d5d7f`, build workflow `35935019649`, Mobile CI `35935019645` passed. The one-build authorization is consumed.
- Download: https://expo.dev/artifacts/eas/VAxzvv8Ex9x8YAk_Cnhk_PVaYTaghsQ_V_xe1hzOwSA.apk . File `my-corner-preview-d218a15.apk`, 71,986,014 bytes, SHA-256 `2381c893be7e01319fa7d9b0cca1c3aaab2a9b56d2ab207ad7de89a1c57df5b4`.
- Actual Android version 39 supersedes 38 with the same package and signing certificate. Install as an update with `adb install -r` or Android's Update prompt. Do not uninstall first.
- Artifact source/backend/package/media/font checks passed. Workflow's final ASCII-only label check failed because Hermes encoded Verified Job as UTF-16. Independent artifact inspection confirmed that label and review/messaging/notification RPC bytecode, ZIP integrity, manifest version and certificate. Corrected the verifier; no second EAS build was submitted. See `docs/evidence/reviews-messaging-preview-2026-09-23.json`.
- All three backend flags remain enabled. Samsung phone/Pixel Tablet functional acceptance remains pending per `docs/REVIEWS_MESSAGING_DEMO.md`. Artifact verification does not establish native UI or two-device realtime acceptance.

## 2026-09-23 — One reviews/messaging Preview APK approved

- Founder approved one new APK after backend rollout. Build latest merged code with reviews, neighbor messaging and notifications, using the existing Preview backend and signing configuration.
- Explicit build-trigger commit starts exactly one EAS build. Release gates and artifact checks cover source commit, backend/package, replacement icons, media and review/messaging/notification bytecode.
- Build/download and phone/tablet acceptance pending. This is not authorization for another build or production deployment.

## 2026-09-23 — Preview reviews, messaging and notifications enabled

- Founder explicitly approved `20260923231722_preview_identity_dependency.sql` on `opeojxwkwwnnncnsuaag`. Applied as remote version `20260923232606`; messaging applied as `20260923232619`. Earlier reviews and notifications remain applied as `20260923231603` and `20260923231825`.
- All three flags are now true: `verified_job_reviews`, `neighbor_messaging`, `community_notifications`. No remaining database deployment approval gate for this feature set.
- Verified RLS, denied anonymous RPC execution/no-session access, invoker public RPCs, authenticated inbox/discovery/review/notification reads, and messaging Realtime publication. Identity table is empty and client-unreadable; names safely fall back to Neighbor. No real identity data was created.
- Compatibility PR #112 merged at `6347985f609e2c45da8d42c0727fe0ebd08a1478`, with passing Database CI `35933208939` / `35933196241`. Security advisor WARN/ERROR findings remain unchanged from baseline; deny-all INFO notices are expected.
- Next gate: separately approved new APK and Samsung/Pixel Tablet acceptance. Current version 38 lacks these new screens. No new build, live test messages/reviews, push/SMS or native acceptance claimed.

## 2026-09-23 — Approved Preview rollout partially applied; identity dependency blocked

- Founder approved the three migrations and Preview flags on `opeojxwkwwnnncnsuaag`.
- Applied review migration (remote version `20260923231603`) and notification migration (`20260923231825`). Verified invoker RPCs deny anon execution, sensitive stores have RLS, unauthenticated notification access is rejected and authenticated list succeeds. `community_notifications=true`; `verified_job_reviews=false`.
- Messaging migration rolled back on missing `public.private_identity_profiles`. This Preview used an older compatibility schema that omitted the repository's identity foundation. `neighbor_messaging` is not provisioned/enabled; no messaging DDL persisted.
- Prepared `20260923231722_preview_identity_dependency.sql`: restore only the missing original identity-table definition/enum, empty with RLS and no client grants, no legal-name backfill. Automatic approval review rejected this fourth migration as outside the exact three-migration approval and involving sensitive legal-identity schema. It remains UNAPPLIED and requires explicit approval. Do not bypass the rejection.
- Security advisors show no new WARN/ERROR findings; two new INFO notices are expected deny-all private review/control tables. Existing unrelated baseline findings remain documented. No APK build or phone/tablet acceptance.

## 2026-09-23 — Reviews and private messaging implementation complete; rollout gated

- Implementation PRs #106–#110 merged. Final feature main: `636345a5e78a349fa9c2b7dfd36643f4f3c10ccd`. Reviews, shared neighbor/Marketplace inbox, realtime refresh, unread/retry, privacy/block/report/moderation, eligible profiles/search, My Activity and unified in-app notification projection are implemented.
- Final head `c53aac61a67fa57832af113955b4dfc9525940e3`: Database CI `35932095087` / `35932086760` and Mobile CI `35932095029` / `35932086796` all passed. Local 463 tests/87 suites, typecheck, lint zero errors/15 baseline warnings; Mobile CI also validates formatting, Expo compatibility and web export.
- No connected-backend migrations or flags applied. Automatic approval review rejected the original schema/privilege deployment to `opeojxwkwwnnncnsuaag` as a live-target change without exact approval. Request explicit approval of the three named migrations and Preview flags in `docs/REVIEWS_MESSAGING_DEMO.md`; do not bypass that gate or switch targets.
- No paid build or device acceptance claimed. Existing APK remains version 38/source `2e3f991`; it does not contain these features. New build approval and Samsung/Pixel Tablet walkthrough remain separate gates. Media DM, real push delivery and additional domain event producers remain documented follow-ups.

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
