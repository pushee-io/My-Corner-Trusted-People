## 2026-09-25 — AI pill/composer Preview APK 44 verified

- The one approved build completed: Android version 44, source `c89b4a86d5efa81d867fa0f4c85ab5f06b574ba3`, EAS `b30911f6-4b82-47ef-91d2-38e7732cd0e2`. Build workflow `36148445698` and Mobile CI `36148445661` passed. Release gates: 524 tests/92 suites, typecheck, formatting, lint zero errors/15 baseline warnings, Preview configuration and duplicate preflight passed.
- Download: https://expo.dev/artifacts/eas/C_0oNAHrFqB8lLnP5WkFZVEYTsIGc3Pvpkfoj3qwock.apk . SHA-256 `f2ecbf3f102d8ffd45438902266bf3e29c7c35e2ad83f98574e36c11eb59c4ee`.
- Actual APK checks passed source commit, Preview backend, application ID, ZIP integrity, media/navigation font and AI bytecode, including Ask My Corner AI, composer placeholder/loading/fallback labels and manifest version 44. This APK includes AI/Messages pills, empty composer, optional Search handoff and compact Home.
- Existing signing/profile retained. Install as an update (`adb install -r`) to retain data. Samsung phone and Pixel Tablet layout, keyboard, unread-count/navigation, screen-reader and portrait/landscape acceptance remain PENDING, as does browser visual/focus acceptance. Artifact checks do not establish native acceptance.
- Evidence: `docs/evidence/ai-pill-preview-2026-09-25.json`. One-build approval is consumed; do not submit another paid build without fresh approval. No production/backend changes.

## 2026-09-25 — AI pill/composer Preview APK approved

- Founder explicitly approved one new APK after PR #134 merged at `1d678b66eabf49519f3f9bfad7da37fe300f6e27`. Main Mobile CI `36147988569` passed. This approval permits one Preview/internal Android APK using existing signing, backend and profile.
- This single build-trigger commit records approval before submission. Duplicate preflight recognizes completed APKs 42 and 43 and blocks active or unexpected newer completed builds. Release gates run before submission.
- Actual artifact checks now require Ask My Corner AI, empty-composer placeholder/loading/fallback labels and Android version greater than 43. AI/Messages pills, Search handoff and empty input are included. No backend/production changes.
- Build ID, artifact and Samsung phone/Pixel Tablet acceptance pending. If submission succeeds and a later check fails, inspect that same build; do not submit another. Native layout/keyboard/screen-reader and web visual acceptance remain pending.

## 2026-09-25 — AI and Messages pills; empty assistant composer

- Visible assistant name is now **Ask My Corner AI**. AI and Messages share a compact full-radius ActionPill using existing Create Request AI color/spacing/typography tokens, 48 dp minimum target, wrapping, full-button navigation, pressed/focus styling and accessible labels. Messages retains unread counts and Notifications navigation. Home retains one AI entry and supporting copy with none of the four suggestion questions.
- Composer starts empty with `Ask anything about your neighborhood...` as placeholder only. Generic entries no longer pass sample questions. Natural-language Search retains its actual query as an optional explicit-submit pill outside the empty composer; it never auto-submits. Send clears the field immediately, shows the last two submitted questions (existing bounded context), exposes loading feedback, disables blank/short questions and guards duplicate requests synchronously. Follow-up context, grounded sources/actions/feedback, account/background clearing and stale-response protection remain intact.
- Rounded multiline input is bounded to 90–160 dp, with scrolling; iOS keyboard avoidance added and Android retains native resize/scroll handling. Ask hardware Back dismisses a visible keyboard before navigating. Actual IME, portrait/landscape, safe-area, screen-reader and large-text acceptance remains pending on Samsung phone and Pixel Tablet emulator. Browser visual/focus acceptance remains pending (prior preview blocked with ERR_BLOCKED_BY_CLIENT); component tests do not establish device/browser visual PASS.
- Local verification: **524 tests / 92 suites passed**, typecheck and formatting passed, lint **0 errors / 15 existing warnings**. Coverage includes Home prompt absence, empty input/placeholder, optional Search handoff, submit/clear/follow-up, duplicate prevention, pill navigation/pressed/focus, Messages unread state, source actions/privacy and Android keyboard Back. CI is the merge gate.
- No backend/production changes and no new APK submitted. APK 43 predates this checkpoint; prior build authorization is consumed. Before a separately approved future build, update the APK bytecode assertion from the old Home accessibility label to `Ask My Corner AI`, record fresh approval and recheck EAS for duplicates. The paid workflow is deliberately unchanged in this checkpoint.

## 2026-09-25 — Compact Home Preview APK 43 verified

- One approved build completed: Android version 43, source `46b71bba5281abe0a9b2d7fb7c390be4dd3e361c`, EAS `34e50a41-a32d-42ce-93b7-8baf91518764`. Build workflow `36103325111` and Mobile CI `36103325160` passed: 517 tests/92 suites, typecheck, format, lint (zero errors/15 baseline warnings), Preview configuration.
- Download: https://expo.dev/artifacts/eas/rbEdLc518KOnDmbQ__8Y5Evvr5Tyky6DJfdYhBUfMn0.apk . SHA-256 `e17f485404280fd97b5510a8d7c48a6c82c2235139b0f3801d1f876b5e487be0`.
- Actual artifact passed source/backend/package/ZIP/media/font/Ask checks, including the compact Home accessibility label and manifest version 43. Home now has one Ask My Corner entry and subtitle without the four suggestion buttons. AI functionality and Search remain intact.
- Existing EAS Preview signing configuration retained. Install as an update and retain app data. This one-build authorization is consumed; no additional paid build is authorized.
- Evidence: `docs/evidence/compact-home-preview-2026-09-25.json`. Samsung phone/Pixel Tablet visual, tap, screen-reader and responsive acceptance remains PENDING; web visual/focus acceptance is also pending. Test compact spacing and assistant navigation after installation. Artifact checks do not constitute native acceptance.
- No backend or production changes.

## 2026-09-25 — Compact Home Preview APK approved

- Founder explicitly approved one new Preview APK after PR #132 merged at `de00de1b30987b3d7b92cf0b6ebfae519afed04f`; main Mobile CI `36103186541` passed.
- Single build-trigger commit records approval before submission. Existing Preview/internal Android profile, backend and signing are retained. Duplicate preflight recognizes the already-completed APK 42 and blocks any active or newer unexpected completed build.
- Actual artifact checks require the compact Home accessibility label and version greater than 42. Full release gates run before submission. No backend or production change.
- Build ID/artifact and device acceptance pending. This permits one submission only; if subsequent verification fails, inspect that same build rather than submitting another.

## 2026-09-25 — Compact Home Ask My Corner entry

- Removed the four Home suggestion buttons and their wrapping containers. Home retains one content-sized Pressable with Ask My Corner, the existing subtitle, a 48 dp minimum touch height, keyboard focusability and the label "Ask My Corner, neighborhood assistant". No fixed section height or leftover prompt-row gap remains.
- Existing assistant navigation/prefill, shared non-Home entries, Search handoff and the dedicated assistant placeholder are retained. No retrieval, source/action, feedback, follow-up or backend changes.
- Added Home presence, one-target accessibility, four-prompt absence and tap-navigation coverage, plus dedicated-screen placeholder coverage. All 517 tests/92 suites pass; typecheck passes; lint has zero errors and 15 existing warnings. Targeted assistant/Search tests pass (17 tests). CI is the merge gate.
- Samsung phone and Pixel Tablet native visual/accessibility acceptance remains pending: this workspace has no connected adb/device. Browser access to the local web component preview was blocked (ERR_BLOCKED_BY_CLIENT), so actual browser layout/focus verification is also pending; no screenshot/native PASS is claimed.
- APK 42 predates this cleanup. No new build is authorized or submitted. A separately approved Preview APK is needed to verify the installed native change. Check compact height, subtitle wrapping, tap target and screen reader on phone/tablet, plus keyboard focus on web.

## 2026-09-25 — Ask My Corner Preview APK 42 verified

- The one approved build completed: Android version 42, source `55c7b5b5467303a7acd52099f6df90a24d977adb`, EAS `a352ebca-9cee-4155-b564-125df0a67288`. Build workflow `36100561584` and Mobile CI `36100561475` passed; 515 tests/92 suites, format, typecheck, lint and Preview environment gates passed.
- Download: https://expo.dev/artifacts/eas/caC9gh57R6YHwyNZnlNDtuJhoZImytVPr8qruJlMfxE.apk . APK size 72004042 bytes; SHA-256 `53a85dec082742101dafd33887878d9a74644e94bc9ba530a46228489ef9f633`.
- Workflow verified actual source commit, Preview backend, package, ZIP integrity, media/navigation font, existing review/comments/Back labels and Ask My Corner entry/endpoint/context/feedback bytecode. Local signing-certificate extraction matches the previously verified APK certificate `79de09929e726b418f4447d1b7f73d6b529b636b5d05a9766fcb39cd068bdc76`.
- EAS build-history preflight passed before the single submission. Approval is consumed; do not submit another paid build without fresh approval. Evidence: `docs/evidence/ask-my-corner-apk-2026-09-25.json`.
- Install as an update using Android Update or `adb install -r`, retaining app data. Samsung phone/Pixel Tablet acceptance is PENDING: all five questions, source actions/RSVP/provider request, feedback, keyboard, rotation, Back and conversation clearing. Follow `docs/AI_NEIGHBORHOOD_ASSISTANT.md`; artifact verification does not establish native acceptance.
- No production deployment, backend modification or secret change occurred in this build checkpoint.

## 2026-09-25 — One Ask My Corner Preview APK approved

- Founder explicitly approved one new APK following the recovery gate. Base main: `f80d345a6a3132ec183f79658dac9b9f9cc290b0`. This build includes merged Ask My Corner UI and uses the existing Android Preview profile, backend and signing configuration.
- This single explicit build-trigger commit records approval before external work. Release gates run before submission; EAS build-history preflight blocks active or newly completed Preview duplicates. Actual APK checks include Ask entry, endpoint, availability and feedback bytecode.
- Approval permits one submission only. Build ID, download, version, checksum and native acceptance remain pending. If submission occurs and later inspection fails, inspect the same build; do not submit another.
- No production deployment or backend change. Samsung phone and Pixel Tablet acceptance follows artifact verification.

## 2026-09-25 — Recovery reconciled; Preview v4 deployed; APK approval gate

- Reconciled live main against the recovery prompt: main initially remained `2e5968d170d53e4aeb0cef87150b82496ba5c73d`, but PR #129 and live Preview had already advanced. Reused completed work and its saved five-question HTTP 200 evidence; did not reseed fixtures or repeat paid model calls.
- PR #129 merged at `2c08a8f8b701b2875cf0496f010ff6179db7c6be` after Database CI `36093128747` and Media Functions CI `36093128751` passed for head `8bfb211b7908f5bfeb09e686a0767b35bfa06440`. It fixes latest-topic follow-ups and preserves all five demo intents.
- Preview `opeojxwkwwnnncnsuaag`: assistant flag confirmed enabled; fictional event, provider, road notice and park post each persisted once. Live metadata corroborates five answered intents, family follow-up, saved feedback/click and zero-token privacy refusal.
- Deployed checked-in PR #129 source as `ask-my-corner` v4 with JWT verification. Readback exactly matches all five submitted files. Targeted assistant/privacy/grounding tests: 17/17 passed. Anonymous endpoint check: HTTP 401. Original authenticated five-question evidence remains explicitly v3; this recovery did not repeat it on v4.
- Latest recorded EAS Preview APK workflow remains `35958534464`, source `912134c59fd046d772593aaadeb35e28da7288f8`, APK 41. No newer EAS Preview APK workflow was found among the latest 100 repository runs; direct EAS-console activity was not independently inspected. No build was triggered in recovery.
- NEW PREVIEW APK APPROVAL REQUIRED: one Android `preview` / `preview` environment / internal-distribution APK using existing signing and backend, with remote version auto-increment. APK 41 lacks Ask entry/Home/Search handoff, sourced answer cards/actions, follow-ups, feedback and conversation clearing. Native Samsung phone/Pixel Tablet navigation, keyboard, lifecycle, RSVP and action acceptance remain pending and need the updated application installed.
- Before submitting an approved build, recheck main and existing EAS builds to prevent duplicate submissions. Production, secrets, RLS and fixture data were not changed by recovery. See `docs/evidence/ai-neighborhood-preview-2026-09-25.json` for separate original-live and recovery evidence.

## 2026-09-25 — Ask My Corner live Preview verified; native acceptance pending

- Implemented and merged as separate green checkpoints: #125 retrieval (`f25c250`), #126 grounded server (`a7f9c5d`), #127 global UI (`3d8fae1`), #128 guarded demo (`2e5968d170d53e4aeb0cef87150b82496ba5c73d`). Final Database CI `36092431531`, server CI `36092431505` and mobile CI `36092015566` passed.
- Preview `opeojxwkwwnnncnsuaag`: migration remote version `20260925033940`; `ask-my-corner` Edge v3 active with JWT verification; `ai_neighborhood_assistant=true`. Existing OpenAI configuration reused (`gpt-4.1-mini`). Production was not activated.
- All five exact founder demo questions returned HTTP 200 with authorized sources and validated verbatim excerpts. FenceCare has actual 4.0/count 1 completed-job review; Food Drive uses approved Ama K. (fictional demo) identity. Park history correctly states no formal decision. Every demo record is explicitly fictional; fixture is guarded/idempotent/manual-only.
- Family-friendly conversational follow-up passed live. Feedback and source click returned 200 and stored against the correct answer; private-DM query refused with zero sources/model tokens. Disabled flag previously returned safe 503/Search fallback. Verification login was signed out with local scope (204); test-account credentials and existing device sessions were not changed.
- 515 mobile tests/92 suites, 28 server tests, SQL/RLS/fixture/quota/feedback CI, typecheck and format pass; lint zero errors/15 baseline warnings. New private metrics tables intentionally have RLS with no client policy/grant (deny all); security advisor reports this as informational, consistent with the private existing pattern.
- Evidence: `docs/evidence/ai-neighborhood-preview-2026-09-25.json`. New code is NOT in APK 41. No new paid APK has been built. Next gate: separately approve one Preview APK, install as an update on phone/tablet, then execute `docs/AI_NEIGHBORHOOD_ASSISTANT.md` native acceptance. Do not claim Android acceptance or the complete definition of done yet.
- Added a latest-topic follow-up regression: an earlier provider question must not override a newer event question. Local 28 server tests pass; final server CI and redeployment of this small correction are pending.
- Source gaps remain explicit: business/deal repository, formal poll/decision store, and broader comment-history retrieval. Core five-question demo is live; no invented business deals, votes, safety guarantees or paid organic rankings.

## 2026-09-25 — Ask My Corner Preview demo checkpoint

- Global UI PR #127 merged at `3d8fae1d455519a86f6e0284b161614b83130ec3`; Mobile CI `36092015566` / `36092006196` passed. Local mobile: 515 tests, typecheck, format, lint zero errors/15 baseline warnings.
- Added manual, idempotent, project/environment-guarded fictional Preview fixture: weekend Food Drive + approved public organizer, FenceCare/carpentry + matching completed job/review, clearly fictional approved road notice, and park discussion with no invented formal decision. Rollback-only live Preview retrieval verified the records and relationships.
- Added fixture CI assertions, feedback ownership and quota tests; active Agency notices remain eligible even if published before a today query. 27 server tests pass; Deno/Database CI are merge gates.
- Actual Preview fixture persistence/flag activation/live Responses verification pending. Android phone/tablet acceptance and new APK remain unperformed; APK 41 predates this feature. No production activation.

## 2026-09-25 — Ask My Corner global UI checkpoint

- Server PR #126 merged at `a7f9c5dd751a690bef9637c5afc9c92f5f4989bb`; Database CI `36091340416` and server CI `36091340433` passed. Preview Edge `ask-my-corner` v1 deployed with JWT verification; flag remains off pending fixture/live checks.
- Added restrained shared-header entry, Home prompts and natural-language Search handoff. Answer cards expose dates/provenance, actual review counts, approved organizer identity, and existing event/RSVP, provider/request, Group, Feed, Agency and Marketplace actions.
- Follow-ups retain two question texts only; account changes, backgrounding and leaving the screen clear answers/context and invalidate late requests. Source-focused Feed/Group links fetch the selected row rather than relying on the latest fifty posts. Helpful/Not helpful/Inaccurate feedback and Search fallback implemented.
- Local 515 mobile tests/92 suites and typecheck passed. Lint has no errors; formatting/CI are merge gates. Preview fixtures/live verification and native phone/tablet acceptance remain pending; APK 41 does not contain Ask My Corner.

## 2026-09-25 — Ask My Corner grounded server checkpoint

- Retrieval PR #125 merged at `f25c25076c6edcfe56053cd4952241298c292055`; Database CI `36090935138` and `36090931760` passed. Authorized migration applied to Preview `opeojxwkwwnnncnsuaag`; assistant flag remains off until deployment/demo verification.
- Added Ask Edge Function using existing OpenAI credentials/model configuration and shared Responses transport with Structure with AI. Fixed tools, bounded date windows, short question-only follow-ups, approved field projection and PII redaction. AI may select exact excerpts only; invented facts/links fail validation. Re-retrieval before response revokes sources removed during inference.
- Feedback/click/version/intent/latency/token metrics contain no conversation text. Limits and no-store behavior retained. Search remains independent.
- Local 25 server tests and Deno typecheck passed. Server CI/merge, mobile UI, Preview fixtures and Android acceptance pending. No paid APK or production activation authorized.

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
