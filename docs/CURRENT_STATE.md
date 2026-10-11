## 2026-09-29 UTC — #169 merged and Preview topic repair deployed

Founder explicitly approved #169 merge and Preview-only ask-my-corner deployment retaining JWT verification. Merge/main: `4c9cea912f734bc2dcd0b1b5d3ae718f927ffbf6`; tested head `32a48f625341ef44e70b143e26a8e53a4c673373`. All Mobile, server/Deno and Database CI passed; 77 server and 564 mobile tests passed.

Preview target `opeojxwkwwnnncnsuaag` was v19 before deployment. This session issued one deployment, returning v20. Immediate read-back observed **v21 ACTIVE, verify_jwt true**, updated **2026-09-29T02:38:30.877Z**, all eight files byte-identical to the approved merged bundle. The intervening version advance was not submitted by this session; no duplicate deployment was attempted. Read-back bundle hash: `deffcb4ce1ca1f55315500b96dc6dbe42b60406ce68c8d010a5d53dcc6d650df`.

Anonymous live POST returned **401**. Five scoped recommendation tests passed again (fixture-based, including all-six-family matrix, false coffee matches, no results, multiword topics and explicit OR). Signed-in live acceptance remains pending: founder should retry “What is the best place for coffee?” on APK51. Relevant coffee evidence or honest no-matching-information is expected, never traffic/Banku results based solely on “best”. No authenticated session was fabricated; local tests are not live authenticated acceptance.

No migration, production, secret, identity, quota change or paid build. Ask uses the server repair on APK51 without a new APK. Basic Search ranking/topic extraction runs in the client and requires a later separately approved build. Preserve the recorded 80% warning/reset-display pass and traffic retest pass; exact live quota rollover remains unobserved. Separate checkpoint PRs #166/#168 remain unmerged.

## 2026-09-29 UTC — recommendation relevance repair; 80% warning observed

## 2026-10-08 — Session/navigation/public identity/request UX prepared for review

Live-main base: `4c9cea912f734bc2dcd0b1b5d3ae718f927ffbf6` (#169). Startup now separates retryable loading failure from logout; bottom navigation avoids duplicate pushes and layout shifts; Marketplace, Groups, Events, Hire requester and review displays reuse canonical approved names; Create Request gains explicit Review and Accept confirmation with flow/submission guards.

Local validation: 581 mobile tests/103 suites, 77 server tests, typecheck and formatting passed; lint 0 errors/15 baseline warnings. New migration `20261008203711_authorized_content_public_names.sql` remains unapplied. Preview dependency inspection was read-only. Device hard-close, ten-cycle visual and two-account Preview acceptance remain OPEN. No merge, deployment, production operation, paid APK or real communication was performed.

Draft PR: https://github.com/pushee-io/My-Corner-Trusted-People/pull/171. Full root-cause report, identity audit, file manifest, risks and acceptance matrix: [SESSION_UX_IDENTITY_CHECKPOINT.md](SESSION_UX_IDENTITY_CHECKPOINT.md). Mobile CI 37843689524 and Database CI 37843689591 passed on implementation commit `b462041b34ee65da5c4b23a3d1c2aea78bf3e759`; final local Android bundle export passed. The linked report contains the verification receipt. This is not a completed device acceptance checkpoint.


Founder IMG_0333–0336 shows “What is the best place for coffee?” returning traffic/Banku/generic praise records containing “best”. Root cause: recommendation scaffolding survived keyword extraction and any-word matching treated that adjective as sufficient evidence. #167 fixed ordering/duplicate excerpts but did not fix this topic-admission defect.

Source repair removes recommendation/question scaffolding before SQL retrieval and its per-family cap (arbitrary topics, no coffee-specific record rule). Literal multiword topics require all terms; supported concept expansions and explicit OR remain alternatives. Topicless recommendation requests clarify rather than browse arbitrary records. Search and Ask share the same plan/filter; no unrelated fallback cards are substituted when there is no topic evidence. Authorized Feed/comments, Groups, Events, provider/reviews, Marketplace and Agency retrieval remain enabled. This remains bounded lexical/concept retrieval, not proof of complete semantic recall for every possible phrasing.

Validation: **77 server tests**, **564 mobile tests /100 suites**, mobile typecheck and diff checks passed. New matrix covers coffee, sushi, tailor, yoga and bookshop across all six source families, topic evidence in comments, no-result behavior, unavailable model, multiword topics and explicit alternatives. Existing privacy, quota, comparison, commerce, Festival and traffic regressions passed. CI is recorded on the repair PR. No migration, Preview deployment, new APK or production change. Merge/deployment need explicit approval; Ask server repair can reach APK51 without a new build, while Basic Search client changes need a later approved APK.

QA evidence: physical phone shows **34/40 used, 6 remaining and the at-least-80% warning**, plus **Sep 29 2026, 8:00 PM local / midnight UTC** reset display. Mark warning and reset DISPLAY passed. Actual rollover at that instant remains unobserved. Founder confirmed the #167 traffic retest at 22:19 New York: specific result first, explanation warning gone. IMG_0334 additionally reveals a neighbor comment reporting an accident/traffic; earlier partial screenshots showed only the opening question. It is still dated neighbor evidence, not live/official confirmation. #166 and #168 remain separate checkpoints pending merge.

## 2026-09-29 UTC — traffic relevance and duplicate evidence repair (not deployed)

Founder IMG_0328–0329 at about 02:00 UTC shows the general July East Legon roadworks notice before a September Feed question mentioning Cedi House, with the AI explanation fallback warning. Preview read-only function logs at `2026-09-29T02:00:13.390000` identify `ask_evidence_fallback`, alerts, evidence_validation, **duplicate_index**. This is a specific evidence-selection failure, not proof of an API outage. The displayed query omits “today”; the reported variant includes it. Both variants are covered by regression tests.

Source repair ranks specific query words ahead of broad concept/source-family priority across authorized retrieved candidates; equal alert relevance uses recency. Explicit metric ordering and selected-provider flows remain authoritative. Retrieval date and authorization restrictions are unchanged. Exact validated duplicate source selections are collapsed only AFTER every quote passes index, length and verbatim-grounding checks. Invalid repeated quotes still fail closed. No fabricated explanation is substituted.

The Feed record is a question, not confirmation of traffic today. The old agency record is not proof of present conditions. Existing redaction of “house …” remains unchanged; no private address policy was relaxed.

Server regressions: **72 passed**. Mobile typecheck passed; full mobile suite recorded in PR validation. Preview is still the previously deployed #163 bundle; this repair needs explicit Preview-only deployment approval retaining JWT verification after CI. No deployment, migration or new APK was performed. Canonical Basic Search shares the changed ranking code, so a future client build would also carry it; no paid build is authorized by this defect report.

Founder prior passes remain recorded in #166: Search results, keyboard/comment interactions and physical-phone verification; emulator Osu/Home consistency and quota/reset display were observed. The 80% threshold and exact live reset boundary remain unobserved. #166 remains a separate APK51 checkpoint.

## 2026-09-29 UTC — Home verified-neighborhood label repair

Founder Osu test screenshot at 01:08 UTC (September 28, 21:08 New York) shows Ask context “Osu” and no matching records for “pig racing festival”. This is a scoped live cross-neighborhood negative retrieval pass for that Event; it does not establish every access boundary. Prior banku topic exclusion and previously exhausted account recovery are recorded as passed. Exact reset timing, 80%/reset UI and full native acceptance remain unverified.

**Home label cause and source repair:** Home used `getActiveLocationLabel()`, which reads the configured/seeded East Legon pilot context rather than the signed-in membership. Home now loads `neighborhood_search_context` through a session-guarded loader and the existing protected-resource lifecycle. The label uses verified neighborhood/city, independent of AI enablement or quota; loading, unavailable and unverified states never substitute East Legon. Pull-to-refresh also refreshes this context. Session changes clear stale data. This does not change membership or authorization.

**Validation:** 564 mobile tests / 100 suites, typecheck and changed-file formatting passed. Regression verifies Osu, cleared context and a subsequent East Legon context. Current-source client/new APK is required to see the corrected Home label. No backend migration or Edge deployment is needed; Preview remains on the previously verified #163 bundle. No new APK, production operation, identity change or quota change occurred.

Include the corrected Home label alongside explicit Search pill/Basic Search, 80% usage warning/reset and keyboard/comment fixes in the next separately approved Preview APK. Phone and emulator/tablet acceptance remain separate checks.

## 2026-09-29 UTC — founder retests recorded; Osu access-test requester provisioned

Founder explicitly authorized completing one newly created fictional Preview account for cross-neighborhood testing and updating/merging #164. On Preview `opeojxwkwwnnncnsuaag`, its confirmed Auth account had no application profile. Created exactly one requester profile with fictional display name “Preview Access Test” and one primary verified **Osu** membership. Read-back confirmed active account, requester role, verified/non-ended Osu membership and no East Legon membership. Phone verification remains false; no Auth credentials, legal identity, other users, quotas or production data were changed. Account identifiers are omitted from this public checkpoint. The founder retains the normal login credentials. Provisioning/read-back is NOT an authenticated retrieval privacy test; the founder must now sign in normally and test the East Legon-only Festival query. Do not mint sessions or treat privileged database reads as RLS acceptance.

**Banku retest passed for the repaired defect:** IMG_0323–0325 at 00:43 UTC (September 28, 20:43 New York) show “I want to buy banku” returning two banku-machine listings and a Feed report mentioning a banku seller. Founder confirms unrelated listings disappeared. No explanation warning is visible. This verifies topic preservation and cross-module keyword retrieval, not prepared-food availability or every source action.

**Quota recovery passed:** founder confirms the account in the 20:51:53 New York screenshot previously exhausted its daily quota. At 00:51 UTC it successfully answered “what festivals are happening near me?” with both Festival cards and no quota or explanation warning. This is evidence of recovered access; exact live reset timing and 80% warning/reset UI are still unverified. Automated quota/reset and access-control tests remain passed.

**Build gate:** no new APK has been built. Current source includes the explicit Search pill, canonical Basic Search (including commerce item preservation), 80% usage warning/reset display and keyboard/comment fixes missing from APK50. Required #163 source CI passed (563 mobile tests/100 suites; 68 server tests; Mobile/server/Database-RLS). Next obtain the Osu account's signed-in result, then present one new Preview APK approval request. Installations and native acceptance must be recorded separately for phone and emulator/tablet; this environment has not operated either device.

## 2026-09-29 UTC — approved #163 commerce fix deployed to Preview

Founder-approved #163 merged as `d5ad4f3772db9464399fd2a61d37484c58b29953`. Its tested eight-file ask-my-corner bundle is deployed to Preview `opeojxwkwwnnncnsuaag` as **v16 ACTIVE / JWT verification true**, at `2026-09-29T00:38:49.927Z` (September 28, 20:38:49 New York). All eight live files exactly match approved head `96b11856ed3ac94f2019a7d62c0a8c7f9b09a03c`. Bundle SHA256: `7d2eba002f5e7ee3d4beb67de44714710d6e0bf15c54046150615ad249109c21`. This session issued one deployment; the intervening version beyond previously observed v14 is not attributed to an actor here.

The item-keyword repair is now live for Ask: buy/sell/purchase requests retain their item topic before retrieval ranking/caps. Shared Basic Search client changes still require a current-source client. Prior source checks: 68 server tests, 563 mobile tests/100 suites, typechecks and all required Mobile/server/Database-RLS CI passed. Deployment verification is source parity/JWT plus anonymous HTTP denial; **the signed-in banku retest remains pending**, as do neighborhood restrictions and quota/reset acceptance. Do not describe a banku machine as prepared food for sale.

Receipt: `docs/evidence/preview-commerce-deployment-2026-09-29.json`. No migration, production changes, quota reset/increase, identity or secret changes, real communications or paid APK build. Next: founder retests “I want to buy banku” while signed in and provides the result/time. The APK gate remains pending remaining backend acceptance and separate build approval.

## 2026-09-29 UTC — commerce topic loss repaired in source; Preview approval pending

Baseline main: `8cbf31c961153d386e05784b77796bd067e8c00a` (#162); Preview remains v14 with JWT verification. Founder emulator screenshots at September 28 20:16–20:19 New York (September 29 00:15–00:18 answer timestamps) show Group results for “Omo tuo”, an Agency road works notice plus a distinct neighbor report, and a Marketplace relevance defect for “I want to buy banku”. The banku machine listing appeared third behind unrelated fufu-pounder and dining-table listings. Groups/Agency have scoped positive visual retrieval evidence; privacy, action destinations and date applicability are not all established by these screenshots.

**Precise commerce cause:** `fallbackPlan` recognized buy/sell intent but set empty terms unless it found “table”. Empty terms bypassed topical filtering, resulting in a broad listing browse. The source repair retains arbitrary item keywords for buy/buying/sell/selling/purchase/purchasing/Marketplace requests, removes only commerce scaffolding, and passes the topic to all six authorized retrieval families before SQL ranking/caps. Recognized commerce concepts also exclude these generic verbs from their residual search terms. No banku-specific rule or manual record reordering. Shared Basic Search/Ask authorization, source grounding and quotas are unchanged. “Family banku machine” remains equipment, not evidence of prepared banku for sale.

**Validation:** 68 server tests pass, including arbitrary commerce topics, empty browse preservation, SQL-call terms before cap, all-family retrieval, unrelated card exclusion and model-outage fallback. Mobile typecheck and Deno check passed. Native acceptance of the repaired client is still pending. This source has NOT been deployed; a separately approved Preview ask-my-corner deployment is needed. No new migration is required.

**Previously unrecorded phone retest:** IMG_0320–0322 show “Festival” returning both expected Event cards at 00:12 UTC (20:12 New York), with excerpts/actions and no explanation warning. The bounded 00:11–00:14 UTC diagnostic lookup returned no evidence-fallback entries. This establishes a successful attempt, not a resolved intermittent defect or complete privacy/reset acceptance.

Outstanding: deployed commerce retest, remaining authenticated neighborhood restrictions and quota/reset checks, then separately approved Preview APK for explicit Search pill/Basic Search, 80% warning/reset and keyboard/comment fixes followed by both phone and emulator/tablet acceptance. No deployment, migration, quota reset, private identity change, production operation or paid APK occurred during this repair.

## 2026-09-29 UTC / September 28 New York — approved #161 diagnostics deployed

Founder explicitly approved #161 deployment to Preview `opeojxwkwwnnncnsuaag` only. Deployed the merged eight-file bundle from main **`0ee724aeec452fb8213d7af8cbc96ebb6b0cea94`** as **ask-my-corner v14 ACTIVE / JWT verification true**, at **2026-09-29T00:03:58.316Z** (September 28, 20:03:58 New York). Deployment bundle SHA256: `ecb0732a66056d7571f4e8feb66a0b3be65f6cb26ef1505cc880fa28ebd272a9`.

**Verified after deployment:** all eight retrieved live files exactly match the approved source; an unauthenticated HTTP POST returns 401 `UNAUTHORIZED_NO_AUTH_HEADER`. Fixed non-sensitive evidence-rejection reasons are now in the deployed bundle. This is diagnostic instrumentation, not proof that the historical Festival failure has been identified or repaired. Strict grounding, authorized fallback cards and quotas are unchanged.

**Source gate passed:** 563 mobile tests / 100 suites, 66 server tests, mobile typecheck, Deno check and required Mobile/server/Database-RLS CI passed for #161 before merge/deployment. See `docs/evidence/preview-evidence-diagnostics-deployment-2026-09-29.json` for the sanitized receipt.

**Still pending:** a normal authorized signed-in Preview test-account session for runtime Festival reason capture, Groups/Marketplace/Agency retrieval, neighborhood restrictions and quota/reset acceptance. No private identifier lookup, minted session or impersonation was used after the earlier approval-review rejection. A missing normal login must not be represented as a backend pass. Founder phone Festival/Going/private-message refusal observations remain scoped passes as recorded below.

No migration, production operation, secret/identity modification, quota reset/increase, real communication or paid APK build occurred. APK gate remains closed until remaining backend acceptance plus separate build approval. Explicit Search pill/Basic Search, 80% warning/reset display and keyboard/comment fixes remain included in the next phone and emulator/tablet acceptance scope.

## 2026-09-28 — reliability diagnostics; backend acceptance still open

Live main checked: `008c3b8e4be43a120676a655d07d3df51b1bfb80` (#160). Preview `opeojxwkwwnnncnsuaag` reports **ask-my-corner v13 ACTIVE, JWT verification true**; all eight deployed files remain byte-identical to main. This session did not deploy v13 and its actor/reason is unknown. All nine canonical migration function bodies match the approved SQL; anonymous execution is denied and the adjustable private quota clock is unavailable to authenticated clients. The already-applied migration must not be reapplied due to its remote timestamp difference.

**Festival diagnosis:** the 22:38:28.658Z trace identifies evidence validation, not retrieval failure. Existing logs cannot identify the specific rejected rule. New source adds fixed, non-sensitive reason codes for response/schema/index/quote failures without logging model text, questions, identities or raw errors. Exact source-substring grounding and authorized fallback cards remain unchanged. A multiline-versus-normalized-whitespace test reproduces one possible rejection, not proof of the historical cause. This diagnostic bundle has NOT been deployed; a new explicit Preview deployment approval is required.

**Additional founder phone evidence:** IMG_0313–0317 show a subsequent Festival answer without the warning, both Event cards, the correct Pig racing Event action and successful Going selection. IMG_0318–0319 show Going persisted on reopening and “Show me private messages” was refused without private sources. These are scoped physical-phone observations, not full authenticated HTTP, cross-neighborhood or tablet acceptance; installed APK version is not established by the images.

**Validation:** 66 server tests, mobile typecheck, Deno check and diff checks pass, including real isolated PostgreSQL quota/reset boundaries and fixed diagnostic reasons. Signed-in live Groups/Marketplace/Agency retrieval, neighborhood denial and quota/reset acceptance remain OPEN. The earlier automatic approval review rejected private profile identifier discovery; no alternate lookup, token minting or impersonation was used. Verification must use the founder's normal authorized Preview login. See `docs/PREVIEW_RELIABILITY_VERIFICATION.md` for the remaining checks and stop conditions.

**APK gate remains closed.** APK50 predates the explicit Search pill/Basic Search, 80% usage warning/reset display and keyboard/comment changes. All are included in the next client acceptance scope. Build only after backend acceptance and separate founder approval, then verify the exact installed version on both phone and emulator/tablet. No new build, deployment, migration, production change, quota reset/increase, identity backfill or real communication occurred.

## 2026-09-28 — founder phone retrieval smoke test reviewed

Founder supplied IMG_0302–IMG_0312, reviewed directly after recovering attachments by upload ID. Screens show checks at **22:36–22:38 Accra/UTC** (18:36–18:38 America/New_York), after Preview v12 deployment. Exact installed APK version is not shown.

**Observed passes:** “Plumber” returns both Kwame PipeCare and Real Neighbor Plumbing (Demo). “What plumber has the most reviews” ranks Kwame first with three verified reviews versus one; visible ratings are 4.3 and 5.0 respectively. “Electrician” distinguishes no eligible provider from a relevant neighborhood Feed recommendation. “Festival” returns Pig racing festival (October 10) and Traditional dancing festival (October 26), with Event actions. No whole-answer unavailable or allowance error is visible in these four tests.

**Degraded explanation:** the Festival response says “AI explanation is temporarily unavailable” while retaining both Event cards. Sanitized runtime trace at **22:38:28.658Z** confirms `ask_evidence_fallback`, stage `evidence_validation`, intent `events`. It does not identify the exact validation failure; do not infer API outage, quota exhaustion, invalid key or timeout. Aggregate telemetry for 22:35–22:40Z shows all four runs `answered`: three provider-intent and one Event-intent run. The Event run used 352 input / 69 output tokens and completed in 2358ms. Optional evidence failure did not erase retrieval.

**Acceptance boundary:** these are founder-supplied physical-phone results, not agent-authenticated HTTP tests or complete native acceptance. Screens show source buttons but not their destinations. Privacy refusal, cross-neighborhood denial, quota/reset/80-percent UX, full six-source matrix, current-source Search/comment UX and Pixel Tablet remain pending. No new APK is authorized or built. A fresh APK is still required for client changes newer than APK50 after the remaining backend gate.

Source/deployment unchanged: main at review `6ea8682d489ef2ad2f9d4d6498081bd061f3e2d9`; Preview v12/JWT verified per deployment receipt. No redeployment, migration, identifier lookup, quota/identity/secret mutation, production action or real communications. Detailed evidence: `docs/evidence/phone-retrieval-smoke-2026-09-28.json`.

## 2026-09-28 — approved canonical backend deployed to Preview

**Deployment completed:** Preview `opeojxwkwwnnncnsuaag` only. Exact approved `20260928213631_canonical_neighborhood_search.sql` applied (SHA256 `9216c91a9d054ea23fe63bb9786bded3c486557ad989f96f9f3a51630b15050b`). Supabase MCP recorded remote version **20260928222337**, name **canonical_neighborhood_search**; this is the approved migration, not an additional migration. Do not reapply based on the different application timestamp.

**Function:** merged #157 eight-file bundle deployed from main `29908d35761ffd19195716c4b6aa9bd64c1158f5` as **ask-my-corner v12 ACTIVE / JWT verification true**. All eight live files match source byte-for-byte. Bundle SHA256 `bc39416259f8f9f5acaf033df4033a77df21e71345c337d5b172592722b49940`. #155 recovery is now included in the deployed source.

**Verified:** canonical context/retrieval/quota RPCs exist; Search/AI retrieval and Hire catalog are SECURITY INVOKER; all new functions have fixed search paths; anonymous execution denied; clients cannot call the private quota clock; unauthenticated function HTTP request returns **401 UNAUTHORIZED_NO_AUTH_HEADER**. Prior source/CI validation remains 563 mobile tests / 100 suites, 64 server tests, Database/RLS, Mobile/server CI and Android/web bundles passed.

**Authenticated acceptance remains blocked:** automatic approval review rejected the read-only profile seed-key lookup used to locate the demo requester, citing private identifier discovery beyond the approved verification. No workaround, identifier extraction or impersonated verification was attempted afterward. A normal signed-in Preview test-account session is needed for live retrieval, quota and privacy acceptance; founder retains the password. Do not claim these checks passed. Existing baseline SQL counts predate this deployment.

Security advisors reviewed: the new authenticated-only quota status SECURITY DEFINER wrapper is intentional, validates active account and verified membership, and exposes no adjustable clock. Other notices concern objects unchanged by this migration, including PostGIS/spatial_ref_sys, existing function grants/search paths, deny-by-default RLS tables and Auth password configuration. No unrelated configuration changed. See sanitized `docs/evidence/canonical-preview-deployment-2026-09-28.json` for notice categories and remediation links.

**Next:** sign into the authorized Preview requester normally and verify plumber / most-reviewed plumber / electrician / festival / private-message refusal, source actions and quota/reset status. A current-source client is needed to accept the new Basic Search/quota/comment UI. APK50 predates those changes; no new build until backend acceptance and a separate build approval. Physical phone/Pixel Tablet acceptance and VC readiness remain pending.

No production changes, quota reset/increase, identity backfill, secret changes, real communications or paid APK build occurred.

## 2026-09-28 — canonical reliability merged; one Preview approval required

**Live main at release merge:** `2136aac68d03cceb7774dce209e6f3520956ef08` via **#157**, preserving all #143–#156 history. Tested integration source: `02962a70526264bcea39634510701e456e16e445`. Stacked #145–#156 are closed as integrated after ancestry verification; #143/#144 were integrated automatically. Historical unrelated divergent PRs are not merged blindly.

**Source verification passed:** 563 mobile tests / 100 suites; 64 server tests; typecheck, formatting, Deno, Preview contract, web bundle and local Android Hermes export. CI: Mobile **36489863621**, server **36489863583**, Database/RLS **36489863402**, all successful. A follow-up removes one unused adapter helper and records this checkpoint; it does not change backend behavior.

**Live Preview recheck:** ask-my-corner **v11 ACTIVE / JWT verified**, updated externally at 2026-09-28T22:07:46Z. All seven files are byte-for-byte identical to the earlier v10 / #152 bundle. This session did not deploy it. Bundle hash `e56d5c4fe16fa35e1667ebbc8c9689172400cc63a77dc9aa8a8842ccb97fab5c`. Neither #155 recovery nor the canonical integration is deployed. The canonical migration, Search context RPC and quota status RPC remain absent.

**ONE CONSOLIDATED PREVIEW APPROVAL REQUIRED:** apply only `supabase/migrations/20260928213631_canonical_neighborhood_search.sql` (SHA256 `9216c91a9d054ea23fe63bb9786bded3c486557ad989f96f9f3a51630b15050b`), then deploy the merged #157 `ask-my-corner` source and its eight-file bundle to **`opeojxwkwwnnncnsuaag` only**, retaining JWT verification; then run authenticated scoped retrieval/quota/source-action/privacy verification. No other migration, feature activation, data backfill or quota mutation is included.

Quota policy remains 40/account/UTC calendar day, six/minute and 500/shared Preview UTC day; no increase/reset. Read-only Preview baseline returned both plumbers and an electrical Feed recommendation; three earlier 503s occurred after retrieval/model use, not exhaustion. Exact old runtime exception is unlogged. See `AI_RELIABILITY_ACCEPTANCE_MATRIX.md`, `GLOBAL_SEARCH_AND_AI_ARCHITECTURE.md`, `SEARCH_RELIABILITY_PR_MAP.md` and sanitized release evidence.

**APK/native gate:** APK50 predates the Search, quota and comment client changes. Do not request/build another APK until authenticated Preview backend acceptance succeeds. Physical phone and Pixel Tablet visual/interaction acceptance and VC readiness remain pending. No production changes, secrets changes, paid build, identity backfill or real communications occurred.

**Next action:** obtain the single bundled Preview approval above. Use a secure authorized test session for HTTP acceptance; SQL-role checks and local bundles do not substitute for authenticated HTTP or native proof.

## 2026-09-28 — canonical reliability implementation checkpoint

Source work is prepared on `codex/canonical-neighborhood-reliability`, preserving #143–#156. Live main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; Preview remains v10 / #152 with JWT verification. No new Preview deployment or APK has occurred.

Implemented shared deterministic query/retrieval modules for Search and AI, common Hire coverage eligibility, optional-model fallback for all six source families, phrase filters before Event/Marketplace caps, verified public review evidence, server UTC quota status/reset details, explicit Search/AI actions and keyboard/comment behavior. Removed stale cross-account Hire list fallback. New migration `20260928213631_canonical_neighborhood_search.sql` is NOT applied. AI recovery #155 is incorporated.

Read-only Preview baseline: 66 query/source checks; both plumbers found for service/comparison queries, one electrical Feed recommendation, two upcoming Festival Events, zero current music/food-drive matches. Outage query returned an Event candidate requiring the new phrase restriction. These are authenticated-role SQL checks, not authenticated HTTP or native acceptance. See `evidence/canonical-query-baseline-2026-09-28.json`.

Initial mobile 556 tests and typecheck passed; new quota tests and isolated Postgres migration/quota/catalog checks passed. Expanded final source tests and full Database/RLS CI remain in progress. Next action: finish regression/privacy CI and reconcile integration to main, then request one consolidated Preview migration/function deployment approval. No quota increase/reset, production changes, secret changes, communications or paid build.

## 2026-09-28 — canonical Search and AI reliability program (in progress)

Live main: `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`. Integration branch `codex/canonical-neighborhood-reliability` starts at #156 `95ffa8cc1f069547a972f83dcdeccf4504cb099c`, preserving #143–#156. Preview remains ask-my-corner v10 / #152, JWT verified. #155 is not deployed. No new migration, function deployment or APK is authorized by this checkpoint.

Diagnosis: Basic Search uses whole-query literal substring matching, so plumber misses Plumbing. Hire lacks AI's structured coverage predicate. “Most rated” is not a deterministic comparison alias. Three September 28 HTTP 503s followed successful retrieval and model usage; v10 does not record the exact thrown exception. Current usage is below allowance; quota is 40 per UTC calendar day, six per minute and 500 global per UTC day. Old usage rows are lazily reset and must not be presented as current usage. Next observed daily reset: 2026-09-29T00:00:00Z.

Next: one canonical authorized retrieval platform, deterministic fallback, accurate quota status, Search and comment UX, broad regression and privacy acceptance. Persistent Preview changes require one consolidated approval after source/CI readiness. Native phone + Pixel Tablet and VC readiness remain unaccepted; no new APK yet. See `GLOBAL_SEARCH_AND_AI_ARCHITECTURE.md`, `AI_RELIABILITY_ACCEPTANCE_MATRIX.md`, and sanitized `evidence/global-search-baseline-2026-09-28.json`.

## 2026-09-27 — Approved Preview APK50 finished and independently verified

- Completed the one approved build: **APK50**, EAS **`234dd105-1a06-469e-b16a-c8b42cea6e78`**, source **`763276b701b161507d8f8cf967878286ad234bcb`**, workflow **36356385371 success**. Receipt artifact **10943692491**; verified APK/provenance artifact **10943882839**. Checkpoint **#156**. Approval consumed; do not submit a replacement after interruption.
- Download: https://expo.dev/artifacts/eas/d0pvHpxWNTXf-jvhX4_ECbMo2Nuyza92h5Qbp01c57Q.apk . SHA-256 **`689f465d691d1053d0d2169c43b0c3e8006f61b00c25fc1abe70d1eba3d33330`**; **72,013,426 bytes**. Independent download matches; cryptographic APK v2 signature passes and signer **`79de09929e726b418f4447d1b7f73d6b529b636b5d05a9766fcb39cd068bdc76`** matches APK49.
- Verified workflow provenance: exact EAS source, Android versionCode **50**, package `com.mycorner.trustedpeople`, Preview-only `opeojxwkwwnnncnsuaag`, product/media/assistant markers. Independent ZIP integrity, package, Preview URL, unchanged navigation font and Feed/Hire/Home/public-name/allowance markers passed. Mobile source is identical to APK49; this is the explicitly requested fresh build, not a new client repair.
- Release gates: **556 mobile tests /98 suites**, format/typecheck/Preview contract passed; lint **0 errors /15 baseline warnings**. Mobile CI **36356385373 /36356449611 passed**. No additional backend deployment, production, account, identity, secret or quota changes occurred for this build.
- Mac install both targets separately: download/checksum this exact artifact, `adb -d install -r` for the physical phone and `adb -e install -r` for the emulator (use `adb -s SERIAL` for multiple targets of the same type). Confirm installed versionCode50 on each; preserve app data. Native phone/emulator/tablet and signed-in HTTP/model acceptance remain pending.
- **PR #155 server correction remains undeployed and needs explicit Preview-only approval retaining JWT verification.** APK50 does not fix the deployed v10 temporary-unavailability defect. Approved demo requester membership is already active independent of APK version. Main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; no main merge/reset.
- Evidence: `docs/evidence/vc-requester-apk-2026-09-27.json`. Resume from live build/GitHub records; do not repeat this consumed build approval.

## 2026-09-27 — Approved VC Preview build submitted; receipt persisted

- One approved build submitted successfully: EAS **`234dd105-1a06-469e-b16a-c8b42cea6e78`**, source **`763276b701b161507d8f8cf967878286ad234bcb`**, workflow **36356385371**, receipt artifact **10943692491**. [EAS build](https://expo.dev/accounts/mycorner/projects/my-corner/builds/234dd105-1a06-469e-b16a-c8b42cea6e78). Checkpoint PR **#156**, stacked on #155.
- **Build approval consumed; do not submit another build.** Release gates, Preview environment verification and duplicate guard passed. Mobile push CI **36356385373 passed**. Waiting for final EAS completion and actual APK verification; version/artifact acceptance not yet claimed.
- Mobile source still equals APK49. No backend deployment or production/account/quota/secret changes for this build. PR #155 server deployment still awaits separate approval; native and signed-in HTTP/model acceptance remain pending.

## 2026-09-27 — One new Preview APK approved after demo requester setup

- Founder explicitly approved **one new APK build** at 18:43 America/New_York. Build branch `codex/vc-requester-preview-apk` starts from #155 checkpoint `6eae213ccbf57f61d0d564cd44516ab4a9435544`; live main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`. No main merge/reset.
- **Mobile source is identical to APK49** (`bc7a69ba23d28869b68822568bfa5548b1d0aaff`); this is an explicitly requested fresh artifact, not a new client repair. APK49 already includes Feed public names, correct Hire labels, Home collapses and public-name editor. Build gates must rerun; completed artifact must target Preview only and have versionCode greater than49.
- Verified baseline APK49 EAS ID `d8716a23-5845-409d-9286-216a49566ce6` is recorded in the duplicate guard. All active/unexpected newer builds still block submission. Workflow persists the real EAS receipt before waiting; do not resubmit after interruption. Submission pending at this checkpoint.
- VC Demo Requester has its approved East Legon membership, with database verification complete and0 questions consumed. No account identifiers or credentials are included in this build checkpoint.
- **PR #155 server correction remains undeployed and needs separate Preview deployment approval with JWT retained.** This APK does not deploy it or resolve the deployed v10 temporary-unavailability failure. Preview v10/JWT true, existing quotas, identities, secrets and production remain unchanged; native and signed-in HTTP/model acceptance remain pending.

## 2026-09-27 — Approved VC requester East Legon membership applied and verified

- Founder explicitly approved verified **East Legon demo membership** for `[demo login omitted]` on Preview **`opeojxwkwwnnncnsuaag` only**. Applied the prepared `supabase/ops/preview_vc_requester_20260927.sql` once after verifying zero existing memberships. This resolves the earlier approval-review blocker without a workaround.
- **VC Demo Requester** now has exactly **one primary verified membership: East Legon**, role **requester**, **0 provider links**; phone verification remains false. No Auth credentials, legal/private identity, quota, other users, production or schema changed. Founder retains the password.
- Scoped live database verification using this account's authenticated role/claims: `neighborhood_ai_context` resolves East Legon; retrieval returns **Kwame PipeCare** and **Real Neighbor Plumbing (Demo)** with provider actions; **13 Feed posts visible** under RLS; verified-neighborhood list contains **East Legon only**. **0 questions used today**, no allowance consumed by these read-only checks. This is database/RPC verification, not signed-in HTTP/model or native acceptance.
- Sign out of the old requester in the Preview app and sign in using **`[demo login omitted]`** and the founder-chosen password. No APK build is required for this account setup. Existing APK49 and deployed Edge v10 remain unchanged.
- Separate **PR #155** server correction remains tested/CI green but **not deployed**; explicit Preview-only JWT-preserving deployment approval is still needed. This account's fresh allowance does not fix the existing v10 temporary-unavailability defect. Do not claim the AI screen-recording flow fully accepted until the server fix and end-to-end verification are complete.

## 2026-09-27 — VC demo requester created; neighborhood grant awaiting explicit approval

- Founder created confirmed Preview Auth account **`[demo login omitted]`** in the dashboard and retained its password. Completed its new **VC Demo Requester** profile, role **requester**, seed key `[fixture identifier omitted]`. Canonical public-name resolution returns that fictional public name. No credentials or private/legal identity were read or copied.
- Verified account confirmed; **0 neighborhood memberships, 0 provider links, 0 assistant runs / questions used today**. Phone verification remains false. No existing account, quota, identity, production or secret was changed; no communications, function deployment or APK build occurred.
- Automatic approval review rejected the combined profile/East Legon membership action because the exact neighborhood/verified-access grant needed explicit founder authorization. The basic profile was subsequently created through the materially safer, profile-only action. **No neighborhood grant was applied and no access-control workaround was used.**
- Ready for approval: **`supabase/ops/preview_vc_requester_20260927.sql`**, adding only one verified **East Legon demo membership** to this exact existing requester on Preview **`opeojxwkwwnnncnsuaag`**. This fixture status is not real-world residence verification. No provider/moderator/admin role, phone verification, legal identity or quota adjustment. Ask My Corner/Feed access and native recording acceptance remain pending until that grant and scoped verification.
- Separate server correction **#155**, tested source `4d74885b91349a9dd6a4d539e4aac0b887232687`, remains CI green / **not deployed**. Its Preview-only JWT-preserving deployment still requires approval; a fresh requester does not resolve the v10 upstream-evidence failure. No new APK needed for that server correction.

## 2026-09-27 — PR #155 source CI green; fresh demo requester requested

- Server recovery source **`4d74885b91349a9dd6a4d539e4aac0b887232687`**, [PR #155](https://github.com/pushee-io/My-Corner-Trusted-People/pull/155), passed **58 server tests and Deno check**. All required source CI succeeded: Media Functions PR **36350321356**, Database PR **36350321346**, Media Functions push **36350317540**, Database push **36350317549**. Mobile source remains APK49; no new build required.
- **Deployment remains pending founder approval** for this new #155 source on Preview `opeojxwkwwnnncnsuaag` only, retaining JWT verification. Prior #152 approval does not authorize #155. Preview remains v10; no quota changes, production changes or new APK build.
- Founder requested a separate requester test profile for a VC screen recording. Account creation is pending. Preview Auth signup requires email confirmation; ordinary signup would send email, so investigate supported administrative creation without communications. Do not copy private identities, reset existing quotas or claim a new account fixes the pending server issue. No requester credential belongs in this repository.

## 2026-09-27 — Device quota/503 difference diagnosed; server evidence recovery prepared

- Founder screenshots show the same request, “I need a plumber today,” with a Preview-limit message on emulator and temporary unavailability on phone. Live Preview v10 logs at 20:50–20:53 UTC show **different authenticated accounts**, **429** versus **503**. Quota account: **40/40 daily**; unavailable account: **35/40 daily**; global use **75/500**. Limits were not changed/reset. This is not evidence of a client error-message decoding defect or an old APK.
- Three 503 runs had already retrieved both **Kwame PipeCare** and **Real Neighbor Plumbing (Demo)**, then received model usage (589–591 input / 71–82 output tokens) before failure. No contemporaneous retrieval database errors; only expected allowance errors. Existing telemetry does not record the exact exception, so evidence-validation failure is a supported hypothesis, not proven. Installed versionCode49 has not been read back from these screenshots.
- Source defect confirmed: ordinary provider-only matches unnecessarily require model excerpt selection even though every primary provider would be retained independently. Prepared server fix skips that dependency when only provider candidates exist, while still scanning all authorized source families and reauthorizing returned providers. When related-source model/quote selection fails, keep only independently matched, reauthorized providers, discard all unvalidated excerpts/secondary items and disclose that related evidence could not be checked. With no matching provider, failure still fails closed. Quotas, neighborhood access, privacy, rankings and date rules unchanged.
- Added safe stage/count-only diagnostics for evidence fallback and post-start failure. No raw question, source text, model reply, exception, token, account ID or private identity goes to new logs. Logging failure cannot erase a recovered answer. The exact runtime failure stage will be identifiable after an approved deployment; do not retrospectively claim it is known.
- Local validation: **58 server tests passed**, including six new regressions for provider-only model independence, failed/ungrounded secondary evidence, post-selection revocation/final authorization, no-provider failure, unchanged quota behavior and logging failure. Read-only Preview retrieval for the phone account found **2 provider / 0 other-family candidates**; local corrected-service replay returned both with **0 model calls / 12 retrieval calls**. Context/meter were simulated in replay; no live authenticated HTTP/model success is claimed. Source CI pending at this checkpoint.
- **Server-only correction: no new APK required.** APK49 remains the latest verified artifact and its one-build approval is consumed. This new source is not deployed. Preview remains **v10/JWT true**. Request explicit deployment approval only after CI passes; previous approval named #152 and does not authorize a different new source. No migrations, quota reset/increase, identity/secret change, production, main merge, communications or paid build.
- Branch `codex/ask-evidence-failure-recovery` starts from #154 checkpoint `b672614803cd95d0925955e668fcaa2ed2a9634f`; current main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`. Evidence: `docs/evidence/ask-device-failure-2026-09-27.json`. Native and signed-in end-to-end acceptance remain pending.

## 2026-09-27 — Approved Preview APK 49 built and independently verified

- Completed the one approved build: **APK49**, EAS **`d8716a23-5845-409d-9286-216a49566ce6`**, source **`bc7a69ba23d28869b68822568bfa5548b1d0aaff`**, workflow **36348353905 success**. App/database source equals tested #153 `728814892944d565f111f24b53fb0a81de8b5b14`. Build checkpoint is **#154**, stacked on #153. Main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; no merge/reset of main.
- Download: https://expo.dev/artifacts/eas/wRnn0aQe9KCS9yEjGAKFSCgh8Q7NI38Zi5rzW2DZUlk.apk . Size **72,013,426 bytes**, SHA-256 **`fdc3b63867ae831fc0e806cb0bf8142ea29cd6bb7d176a3eab0eba1adb0be6bf`**. Independent download matches. Android apksig cryptographically verifies v2; signer **`79de09929e726b418f4447d1b7f73d6b529b636b5d05a9766fcb39cd068bdc76`** matches APK48, supporting in-place update.
- Actual APK gates passed: exact EAS source, Android versionCode **49**, package `com.mycorner.trustedpeople`, Preview-only Supabase URL, ZIP integrity, unchanged navigation font, new **`feed_author_names`** RPC and **Hire coverage directory text**, existing Home/public-name/assistant/media markers. Includes Feed posts/comments/own submissions/realtime public-name hydration and category-correct Hire labels. These checks establish packaged source/content, not device visual acceptance.
- Release gates: **556 mobile tests / 98 suites**, formatting/typecheck and Preview environment passed; lint **0 errors / 15 existing baseline warnings**. Mobile CI **36348353861 / 36348359501** passed; unchanged source Database **36333987143**, server/Deno **36333987084** passed (**52 server tests**). EAS duplicate guard passed before the one submission. Receipt artifact **10941203948**; verified APK/provenance artifact **10941374478**.
- Backend remains **Preview v10 ACTIVE/JWT true**, with the already applied 18-row coverage catalog and Feed public-author migration. Previously verified **108 retrieval checks** return both East Legon plumbers with no unrelated hair result; **40 Feed author/other-member checks** confirm approved names and preserved access boundaries. No backend redeployment, SQL reapplication, production, identity/secret/quota changes or real communications for this build.
- **One-build approval is consumed. Do not submit another build after a stalled session.** Signed-in Edge/model and phone/emulator/tablet visual acceptance remain **PENDING**. Install this exact APK on both targets, confirm each reports versionCode **49**, then verify cross-member Feed names/avatars/comments/realtime, category labels, both plumber results and relevant cross-source answers/actions. Do not claim native acceptance from artifact checks.
- Mac install: download and verify the checksum, then `adb -d install -r` for the USB phone and `adb -e install -r` for the emulator. Force-stop and reopen on each device, and verify each with `adb -d/-e shell dumpsys package com.mycorner.trustedpeople`. Use `adb -s SERIAL` when multiple devices of one type exist. Preserve app data; do not uninstall or clear storage.
- Durable artifact evidence: `docs/evidence/feed-discovery-apk-2026-09-27.json`; backend evidence: `docs/evidence/preview-pr152-v10-deployment-2026-09-27.json`. Resume from these records and live GitHub/EAS state.

## 2026-09-27 — One Preview APK approved for Feed names and Hire category fixes

- Founder approved **one new Preview Android APK** after verified v10 deployment. Build branch `codex/feed-discovery-preview-apk` starts at #153 checkpoint `fbfb1421511adfed04ab57065e3e61e4e8c1d860`. Application/database source equals tested #153 `728814892944d565f111f24b53fb0a81de8b5b14`; source CI is green (556 mobile tests/98 suites, 52 server tests). Main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`.
- New client features since APK48: approved public-name hydration throughout Feed posts/comments/own submissions/realtime, with account-switch/unsubscribe guards; selected Hire category labels and clearer coverage directory copy. Build must contain `feed_author_names` and the new directory text, preserve existing markers/font, match the exact EAS source, target only Preview, and have versionCode above 48.
- Existing verified baseline is **APK48**, EAS `8608e3fd-fe98-4d7a-88ac-713830f806e9`. Workflow keeps active/unexpected newer build rejection, records the EAS receipt before waiting and verifies the completed artifact. Do not submit a replacement after interruption; inspect receipt/live EAS state first. Submission pending at this approval checkpoint.
- Preview backend **v10 ACTIVE/JWT true**, seven files verified against #152; 108 live retrieval checks and prior 40 Feed name checks recorded. No backend redeployment, SQL reapplication, quota/identity/secret change, production or main merge authorized for this build. Signed-in HTTP/model and native phone/emulator/tablet acceptance remain pending.

## 2026-09-27 — PR #152 deployed to Preview v10 after explicit payload approval

- Founder explicitly approved Preview-only deployment and sending redacted questions plus bounded access-authorized Feed, Group, Event, provider/review, Marketplace and Agency content to `https://api.openai.com/v1/responses`. Approval persisted before deployment in `docs/evidence/preview-pr152-payload-authorization-2026-09-27.json`. This resolves the prior automatic-review blocker; no workaround was used.
- **Deployed `ask-my-corner` v10, ACTIVE, JWT verification true**, Preview `opeojxwkwwnnncnsuaag` only. All **seven files match** tested #152 source `39b1c604ef8564989aa1c67d1a03a1857a5ea474` byte-for-byte. Bundle SHA-256 `81166195c534b2cd93a8707b8aca19cf42a5f9f992db5c5986d7de1d7b6d2f63`. Anonymous HTTP POST returned **401 / UNAUTHORIZED_NO_AUTH_HEADER**. Deployment approval is fulfilled; do not repeat after a stalled session.
- **108 actual Preview retrieval RPC checks / 18 questions** repeated with the deployed deterministic planner: plumber/plumbing/I need a plumber return **Kwame PipeCare and Real Neighbor Plumbing (Demo)**. No unrelated hair result in the matrix. Festival/festivals/What festivals are happening? return two Events; pig/racing/pig racing return one; dining table returns three Marketplace records; electrician returns a Feed post. All six source families were queried; zero matches for some questions/families are recorded without inventing results. Signed-in HTTP/model answer selection remains pending because no user session is available here; SQL and bundle verification do not establish end-to-end acceptance.
- Prior approved SQL remains applied, with **20 coverage rows / zero active providers missing coverage** and Feed migration remote version **20260927200502**. Provider records, public profile records and feature-flag hashes remain unchanged. No SQL reapplied. Prior **40 live Feed author/other-member post/comment checks**, including the reported wedding post, still document canonical public-name consistency and preserved anonymous/nonmember/base-profile restrictions. No private/legal name copying.
- Live CI readback confirms all six tested-source runs succeeded: #152 Database **36333358271**, Mobile **36333358268**, server/Deno **36333358300**; #153 Database **36333987143**, Mobile **36333987194**, server/Deno **36333987084**. Combined validated source: **556 mobile tests / 98 suites; 52 server tests; typecheck/format pass; lint 0 errors / 15 baseline warnings**. Current checkpoint modifies docs/evidence only.
- **NEW PREVIEW APK APPROVAL REQUIRED.** Current main is still `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; #152/#153 fixes remain in the open PR stack. APK48 predates Feed post/comment/realtime public-name hydration and corrected Hire category labels/directory copy. Those client changes must be bundled in a new APK for Android phone/emulator/tablet verification; backend deployment cannot update installed client code. Do not build until founder approval. Native visual and signed-in AI acceptance remain pending.
- No production, main merge, APK build, secret/identity change, quota reset/increase or real communications. Durable evidence: `docs/evidence/preview-pr152-v10-deployment-2026-09-27.json`; prior SQL/Feed evidence: `docs/evidence/discovery-feed-preview-deployment-2026-09-27.json`.

## 2026-09-27 — Preview SQL verified; #152 Edge deployment blocked by automatic approval review

- **Completed on Preview `opeojxwkwwnnncnsuaag` only:** exact approved coverage SQL added **18 records across 12 profiles** (20 total; zero active profiles missing coverage). Exact Feed migration applied under remote version **20260927200502**, SHA-256 `c181d2d07268757aaec1b1543c3af1b43f13bdf62b7a9ffd805062eb65c79eb5`. Both actions are complete; do not reapply. Provider records, public profile records and feature flags retain their preflight hashes. No identity changes.
- **Live verification:** 108 read-only authenticated-role retrieval RPC checks / 18 questions across all six source families. Plumber/plumbing/I need a plumber return **Kwame PipeCare and Real Neighbor Plumbing (Demo)**; no unrelated hair result in the matrix. Festival/festivals/What festivals are happening? return two Events; pig/racing/pig racing return one; dining table returns three Marketplace records; electrician finds a Feed post. Music alone, food drive, power off, Groups and Agency return no matching records in this scoped dataset; this is not evidence those source types are unavailable. The new planner was exercised directly against Preview SQL, not through a deployed #152 HTTP/model request.
- **Feed names:** 10 posts and 10 comments tested as author and another verified member (**40 checks**), including the reported wedding post. Every result matched the canonical approved public name. Other base profile rows remain unreadable; anonymous calls denied; one actual nonmember denied. Public RPC is SECURITY INVOKER; private canonical resolver remains unavailable to direct authenticated calls. Blank-name fallback and explicit update tests remain covered by CI; no live names were edited. Security advisor categories remain 7 (1 INFO/5 WARN/1 ERROR), no Feed-name finding; existing unrelated findings remain (https://supabase.com/docs/guides/database/database-linter).
- **Blocked action:** automatic approval review rejected deployment of tested #152 `ask-my-corner` source `39b1c604ef8564989aa1c67d1a03a1857a5ea474`. Stated reason: retrieved Feed, Group, provider-review, Marketplace and other potentially sensitive content is sent to the external OpenAI API, and the reviewer requires explicit payload/destination authorization. No retry/workaround. Readback confirms Edge remains **v9 ACTIVE / JWT true**, bundle `aeb71eaec83082a0719d108a98cf3069857a91ab595471fff88263739c00ecbb`. The new all-source selection behavior is **not yet deployed**.
- **Exact remaining approval request:** authorize the Preview-only #152 deployment with JWT verification and its existing calls to `https://api.openai.com/v1/responses`, sending the redacted question/recent question context, neighborhood context when planning, and bounded access-authorized source text/titles/metadata from Feed, Groups, Events, provider profiles and verified reviews, Marketplace and Agency Broadcasts for evidence selection (`store:false`). Exact routes/UUIDs stay server-side; private DMs, legal identity and private location data remain excluded. Retrieved text can still be sensitive despite redaction. Then complete deployment readback and scoped verification. Do not reinterpret this checkpoint as that approval.
- **CI green for tested source:** #152 Database 36333358271 / Mobile 36333358268 / server-Deno 36333358300; #153 Database 36333987143 / Mobile 36333987194 / server-Deno 36333987084. 556 mobile tests / 98 suites; 52 server tests; typecheck/format passed; lint 0 errors / 15 baseline warnings. Checkpoint changes are docs/evidence only.
- **NEW PREVIEW APK APPROVAL REQUIRED after the remaining backend gate:** APK48 predates Feed post/comment/realtime public-name hydration and corrected category labels/directory copy. Current main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; tested fixes are in the open PR stack, not main. No build, protected-main merge, production, quota, secret or real communication action. Native phone/tablet/emulator and authenticated Edge/model acceptance remain pending.
- Evidence: `docs/evidence/discovery-feed-preview-deployment-2026-09-27.json`. Resume from this checkpoint and live state; do not repeat completed SQL or an APK build.

## 2026-09-27 — Approved Preview SQL applied; Edge deployment next

- Applied the exact approved provider coverage SQL to Preview `opeojxwkwwnnncnsuaag`: **18 new assignments across 12 profiles**, total **20**, no remaining profiles without coverage. Provider records, public profile records and feature-flag hashes are unchanged.
- Applied exact `20260927162909_feed_public_author_names.sql`; remote migration version **20260927200502**, name `feed_public_author_names`. The content-authorized RPC now exists. No identity data changed. Migration history stores the approved SQL verbatim; do not repeat it because its remote timestamp differs.
- Tested #152 source `39b1c604ef8564989aa1c67d1a03a1857a5ea474` is approved for the next Edge deployment with JWT verification. Edge was v9 at preflight; deployment and scoped functional verification remain pending at this checkpoint. Main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`. No production or APK build.

## 2026-09-27 — Founder approved Preview coverage, Feed-name migration and #152 Edge deployment

- Explicit approval received for `supabase/ops/preview_provider_coverage_catalog.sql` (18 new rows/12 profiles), `20260927162909_feed_public_author_names.sql`, and tested #152 `ask-my-corner`, with JWT verification retained, followed by scoped verification. Target **Preview `opeojxwkwwnnncnsuaag` only**. No main merge, production, paid build, quota/secret/identity change authorized.
- Live preflight: main still `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; #152 source still `39b1c604ef8564989aa1c67d1a03a1857a5ea474`; checkpoint base `cf879db34aeb61a2cbe9c1f79924c42924fd9806`. Coverage currently **2 rows / 12 profiles missing coverage**; Feed-name RPC/migration absent; Edge **v9 ACTIVE/JWT true**. SQL hashes match reviewed files exactly. Both new SQL actions remain unapplied at this checkpoint; approved execution follows.
- Existing full CI green: #152 Database 36333358271/Mobile 36333358268/server-Deno 36333358300; #153 Database 36333987143/Mobile 36333987194/server-Deno 36333987084. 556 mobile tests/98 suites, 52 server tests. Native and signed-in Edge/model acceptance remain pending.

## 2026-09-27 — Provider discovery and Feed public-name fixes green; exact Preview actions ready

- Reviewable **#152** fixes provider discovery/coverage completeness and cross-source evidence; tested source **`39b1c604ef8564989aa1c67d1a03a1857a5ea474`**. **#153** fixes Feed names across viewers, comments and realtime; tested source **`728814892944d565f111f24b53fb0a81de8b5b14`**. Stack preserves #151/APK48. Main remains **`a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`**; no merge/reset.
- **All required CI passed for both PRs.** #152 Database **36333358271**, Mobile **36333358268**, server/Deno **36333358300**. #153 Database **36333987143**, Mobile **36333987194**, server/Deno **36333987084**. Combined source: **556 mobile tests / 98 suites; 52 server tests; typecheck, format and diff passed; lint 0 errors / 15 existing baseline warnings**. Full Database CI exercises the new Feed RPC against actual Supabase RLS.
- Root causes confirmed: 12 of 14 providers lack structured coverage, including Real Neighbor Plumbing; provider questions searched only Hire/Feed/Groups; names were read directly from self-only profiles. Repairs retain both covered plumbers, inspect all six authorized source families before final evidence selection, keep selected category labels correct, and hydrate Feed names through the existing approved public-name resolver. Legal identity stays private; legitimately missing approved name stays Neighbor.
- **Exact Preview-only deployment approval needed** for (1) **`supabase/ops/preview_provider_coverage_catalog.sql`** (18 new assignments / 12 profiles; SHA-256 `cc20f5a87432d509798f9e526d3003bf73137affd1d4979c789209cdbecac322`); (2) **`20260927162909_feed_public_author_names.sql`** (SHA-256 `c181d2d07268757aaec1b1543c3af1b43f13bdf62b7a9ffd805062eb65c79eb5`); (3) tested **#152 `ask-my-corner`** source with **JWT verification retained**, followed by scoped verification, project **`opeojxwkwwnnncnsuaag` only**. Earlier explicit approval covered only Kwame/#150, not these broader/new persistent actions. Neither SQL file nor this function update has been applied/deployed.
- Live Preview remains **v9/JWT true** with the prior Kwame-only coverage repair. Read-only live verification covers **60 RPC checks / 10 questions**; it still returns only Kwame until the broader data repair is applied. The coverage catalog’s exact assignments/unresolved labels are listed in #152. No coverage inferred from nearby/border; absent configured neighborhoods remain unresolved. No production, identity, secrets, quota reset/increase, real communications or paid build.
- **A later new Preview APK is required** for the Feed public-name client and category-label fixes; APK48 predates both. Do not build before new approval. Backend deployment/verification is the next gate; signed-in Edge/model execution and phone/tablet/emulator visual acceptance remain pending. Check all relevant sources and both East Legon plumbers after backend repair, then Feed names as author and different member after a newly approved APK.
- Durable evidence: `docs/evidence/provider-discovery-consistency-2026-09-27.json` and `docs/evidence/feed-public-author-names-2026-09-27.json`. No action remains only in chat. Do not repeat prior APK builds, migrations or deployments after session interruption.

## 2026-09-27 — Feed public-author names repaired in source; Preview approval pending

- Founder screenshot confirms the author sees their name while another member sees Neighbor. Live `profiles` SELECT policy is **own account only**; Feed used `profiles(id,display_name)` directly. Create-post/comment mapped the current profile value, while realtime inserts did not hydrate names. This explains inconsistent viewers without assuming a missing public name.
- Prepared **`20260927162909_feed_public_author_names.sql`**: bounded public invoker RPC + private checked helper resolve the existing canonical approved name through visible post/comment references. Requires authenticated active account, verified neighborhood membership, visible content and unblocked active authors. No arbitrary profile-ID lookup, legal fields, identity backfill, broadened profiles RLS or change to existing messaging semantics. Blank approved name remains **Neighbor**.
- Mobile Feed now uses one content-authorized batch lookup for posts/comments; own submissions and realtime use the same resolver. Explicit public-name updates are read afresh. Late realtime responses after account switch, unsubscribe or content hiding are suppressed. A failed name read after a successful write never substitutes the own/private profile name or reports a false failed submission. Existing avatar behavior preserved.
- Local checks: **556 mobile tests / 98 suites; 52 server tests; typecheck/format/diff passed; lint 0 errors / 15 baseline warnings**. Actual Postgres tests verify two viewers, updates, missing names, unchanged self-only profiles, anonymous/unverified/blocked/revoked access and no legal fallback. Database CI includes an integration test for the new RPC. Remote CI for this new checkpoint is pending; no native visual acceptance claimed.
- Prior provider/all-source repair is reviewable in **#152**, tested source `39b1c604ef8564989aa1c67d1a03a1857a5ea474`. All source CI passed: Database **36333358271**, Mobile **36333358268**, server/Deno **36333358300**. Its **18-row / 12-profile** explicit coverage repair and broader Edge deployment remain prepared, unapplied. Live Preview remains v9/JWT true; APK48 is unchanged.
- Exact remaining Preview actions to approve after final CI: **`supabase/ops/preview_provider_coverage_catalog.sql`**, this **Feed public-name migration**, and the tested **#152 ask-my-corner** source with JWT verification, all on **`opeojxwkwwnnncnsuaag` only**, followed by verification. These exceed earlier exact Kwame/#150 authorization. No production, identity, secrets, quota, real communications, protected-main merge or paid APK build. A new APK is needed later for mobile Feed/category changes and requires separate fresh approval after backend checks.
- Evidence: `docs/evidence/feed-public-author-names-2026-09-27.json` and `docs/evidence/provider-discovery-consistency-2026-09-27.json`. Current live main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`. Resume from GitHub; do not rebuild APK48 or repeat prior deployments.

## 2026-09-27 — Provider completeness and all-source discovery repair prepared

- Founder reports two East Legon plumbers but AI shows only Kwame, and asks to search all authorized Feed/Events/etc. Live main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; branch `codex/provider-discovery-consistency` preserves #151/APK48 checkpoint `d6f149fd27ec39e824b95c76d56f9dfad8ed4a5a`.
- Full live audit: **14 active profiles, 12 without structured coverage**. Real Neighbor Plumbing (Demo) has an East Legon label but no area row. Hire is a cross-area category directory; AI requires explicit local coverage. Naa HomeFix legitimately has both Plumbing/Electrical categories; the card incorrectly selected the first service label. Both mobile mapping paths now use the requested category and show all services on a full profile; directory copy clarifies cross-area scope.
- Prepared **`supabase/ops/preview_provider_coverage_catalog.sql`**, Preview `opeojxwkwwnnncnsuaag` only: **18 new rows across 12 profiles**, preserving the 2 existing rows, for 20 explicit assignments across 14 pilot/demo profiles. Catalog uses exact seed keys/profile labels/existing neighborhood names; drift rejects and rolls back. Never infer “nearby” or “Tema border.” Airport Residential, Tema Community 25 and Kaneshie do not exist as configured neighborhoods and remain unresolved. Fresh seed shares the same exact mapping; a generic read-only discovery audit flags any active profile lacking category/coverage. No live repair applied yet.
- Topical service/provider and other questions now search all **six authorized source families**, using intent as priority. Up to 8 candidates per family remain available until relevance selection; the final response stays bounded. Secondary evidence requires exact selected excerpts, including during comparisons; structured rankings stay SQL-computed. All selected sources are reauthorized before return. Empty generic provider searches and selected-provider follow-ups stay scoped. No private messages/jobs, unsupported sources or fabricated content added.
- Verification: **550 mobile tests / 97 suites; 51 server tests; typecheck/format/diff passed; lint 0 errors / 15 baseline warnings**. Coverage SQL tested in Postgres for all mappings, idempotency, drift rollback and untouched unrelated profiles; actual retrieval SQL reproduces 1 plumber before coverage and 2 afterward. **60 actual read-only Preview RPC checks** passed with the new plans; current live data still returns only Kwame until the proposed repair is approved/applied. No wedding/hair result in those 60 checks. Evidence: `docs/evidence/provider-discovery-consistency-2026-09-27.json`.
- Preview remains v9/JWT true. New Edge source and the broader coverage repair are prepared for explicit deployment approval; earlier approval covered only Kwame and #150. No production, identity, quota, secrets, real communications, protected-main merge or paid APK build. APK48 predates these source changes; native and signed-in Edge/model acceptance remain pending.
- Additional active founder report: Feed authors show their own name but other members see Neighbor. Source confirms a direct profiles read and own-profile immediate mapping; the public-name feed fix is being prepared next without legal identity backfill.

## 2026-09-27 — Approved Preview APK 48 built and independently verified

- The one approved build completed: **APK 48**, EAS **`8608e3fd-fe98-4d7a-88ac-713830f806e9`**, source **`e507c7667339b342eb71fa60f89028bd7398a984`**, workflow **36331145651 success**. Application/database source equals tested #150 `40957f92c72a509a184e8fa93c6847132d58a4fc`. PR **#151** is stacked on #150; existing branches/main remain unchanged. Main at build: `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`.
- Download: https://expo.dev/artifacts/eas/rIwjyBkWzT-os9A0IBQ35uXsAc4LiRp_-_pz0E3Mt9Q.apk . Size **72,011,198 bytes**, SHA-256 **`2014eeac0e80c18681c19faf7f6810ade84e5d4c614b3e42bf21847942fcd739`**. Independent download matches. Android apksigner verified v2; signer SHA-256 **`79de09929e726b418f4447d1b7f73d6b529b636b5d05a9766fcb39cd068bdc76`** matches APK47, supporting an in-place update preserving app data.
- Actual artifact checks passed: exact EAS source, Android version 48, package `com.mycorner.trustedpeople`, Preview-only Supabase URL, ZIP integrity, unchanged navigation font, existing Home/public-name/media/assistant/provider labels, and new **ASK_ALLOWANCE_REACHED** with **“The Preview question limit has been reached. Try again later or use Search.”** No arbitrary internal server detail is displayed.
- Build release gates passed: **548 mobile tests / 97 suites**, formatting/typecheck, lint **0 errors / 15 baseline warnings**, Preview environment and duplicate guard. Mobile CI **36331176971 / 36331145602** passed. Unchanged tested source Database/RLS **36330082517**, server/Deno **36330082543** passed (**45 server tests**). Receipt artifact **10935915341**; verified APK/provenance artifact **10935504503**.
- Preview backend remains **v9 / JWT verification true** with the already verified one-row Kwame East Legon repair; prior **12 questions / 41 scoped authenticated-role RPC checks** remain recorded. No backend deployment or data change for this build. Existing 6/minute, 40/user/day and 500/global/day caps remain unchanged; no quota reset, production, secret, identity or real communication changes.
- **This one-build approval is consumed. Do not submit a replacement after a stalled session.** Authenticated Edge/model execution and native phone/tablet/emulator visual acceptance remain **PENDING**. Install on both devices, verify each reports versionCode **48**, then check relevant provider results/source actions and clear quota feedback when applicable. The artifact check is not native acceptance.
- Mac update: checksum the download, then use `adb -d install -r` for the USB phone and `adb -e install -r` for the emulator. Force-stop and reopen the app after each update; check each with `adb -d/-e shell dumpsys package com.mycorner.trustedpeople`. Select `-s SERIAL` if multiple devices of one type are attached. Never uninstall or clear app data for this update.
- Durable evidence: `docs/evidence/ask-quota-apk-2026-09-27.json`; backend evidence: `docs/evidence/ask-repair-preview-deployment-2026-09-27.json`. No protected branch merge performed.

## 2026-09-27 — One new Preview APK approved for corrected question-limit feedback

- Founder approved one new APK after the #150 backend deployment. This approval authorizes one Preview Android build; no merge, production, backend mutation, quota reset/increase, identity or secret changes.
- Build branch `codex/ask-quota-preview-apk` starts from durable #150 checkpoint `1bf958836a673bc77d33f69911b5bd2f2d2c1182`. Application/database source remains identical to tested `40957f92c72a509a184e8fa93c6847132d58a4fc`. Main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; existing PR stack preserved.
- New native feature since APK47: decode the approved safe 429/ASK_ALLOWANCE_REACHED response and display the Preview question-limit message instead of generic unavailability. Search stays available; arbitrary server details stay hidden. The 40-question daily allowance remains unchanged.
- Preview v9/JWT verification and the one-row Kwame East Legon repair are already deployed; 12 questions/41 actual scoped RPC checks passed. No redeployment or reapplication for this build. Source CI passed: Database 36330082517, Mobile 36330082583, server/Deno 36330082543; 548 mobile tests/97 suites and 45 server tests.
- Workflow recognizes verified APK47 `6f96b91b-8358-47e9-ac5d-5aee15058497` as the prior baseline while preserving active/unexpected-build duplicate rejection. It persists the submission receipt before waiting, requires version above 47, exact source and Preview-only environment, and checks the new quota-code/message in actual APK bytecode.
- Submission prepared; no new EAS ID yet. Inspect the receipt if the session stalls; do not submit a replacement. Native phone/tablet and signed-in Edge/model acceptance remain pending.

## 2026-09-27 — Approved Kwame coverage and assistant v9 deployed to Preview

- Founder explicitly approved the exact Kwame coverage script and tested #150 function deployment. Applied `supabase/ops/preview_kwame_east_legon_coverage.sql` to **Preview `opeojxwkwwnnncnsuaag` only**, SHA-256 `22d473ead9ecda9ca683c182ea29b8b9776be77847b473841948faedc5353cee`. Kwame now has exactly **one East Legon** structured area. Other providers' coverage, provider-profile records and feature-flag hashes are unchanged. No inference from “nearby,” no other provider backfill, no quota reset.
- Deployed **ask-my-corner v9, ACTIVE, JWT verification true**. All seven files match tested PR #150 source **`40957f92c72a509a184e8fa93c6847132d58a4fc`** byte-for-byte; deployed bundle `aeb71eaec83082a0719d108a98cf3069857a91ab595471fff88263739c00ecbb`. Main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; no PR merged. Approval is fulfilled for these backend actions; do not repeat deployment after a stalled session.
- **Scoped live verification passed: 12 questions / 41 authenticated-role read-only RPC checks using the exact tested planner.** `plumber`, `plumbing`, `I need a plumber`, `Kwame PipeCare`, availability and most-reviewed-plumber queries retrieve Kwame with **2 verified reviews / 5 confirmed completed jobs** and the correct provider action. Comparison population is only the one currently eligible covered plumber; do not imply a neighborhood-wide winner over unrecorded coverage. Availability remains provider-stated, not a confirmed booking slot.
- `electrician` and `I need an electrician` return the relevant electrical recommendation and **no wedding/hair post**. Electrical providers still have no recorded eligible East Legon coverage; no areas were invented. Fence retrieves the covered demo provider; `festival`/`festivals` each return 2 upcoming Events; `pig racing` returns 1 Event. Existing source authorization retained: unauthorized neighborhood denied, anonymous RPC denied, security invoker retained, anonymous Edge HTTP **401**.
- Verification is live authorized **database retrieval + deployed-file verification**, not authenticated Edge/model execution or native visual acceptance. No user HTTP login session was available. The new safe **429 / ASK_ALLOWANCE_REACHED** mapping passed source/CI tests and is deployed; existing 6/minute, 40/user/day and 500/global/day caps remain unchanged. Existing APK47 still displays the generic error because its client predates the new code.
- Source CI remains green: Database/RLS **36330082517**, Mobile **36330082583**, server/Deno **36330082543**; **548 mobile tests / 97 suites; 45 server tests; typecheck/format/diff pass; lint 0 errors / 15 baseline warnings**. Durable evidence: `docs/evidence/ask-repair-preview-deployment-2026-09-27.json`.
- **NEW PREVIEW APK APPROVAL REQUIRED** only for the new mobile question-limit message and subsequent native acceptance. Backend retrieval corrections are available to APK47 without rebuilding, subject to the unchanged account allowance. No build started; previous APK47 approval was consumed. Production, secrets, identity data, real communications and unrelated schema remain untouched.

## 2026-09-27 — Native screenshots: provider omission, irrelevant discussion and misleading quota error

- Founder screenshots show Kwame PipeCare in Hire with “East Legon and nearby,” an electrician search including an unrelated wedding/hair post, and a fence question reporting temporary unavailability. Live main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`. Repairs branch `codex/ask-relevance-quota-coverage` preserves #149/APK47 checkpoint `7ec127a4f16e02aa13c98ad4fa9eefb068b103e5` and earlier stack; no main merge/reset.
- **Kwame cause confirmed:** existing pilot provider `dba23ab5-5fbf-496f-9fb7-ff575f93fb28` has the expected public area label but **zero** `provider_service_areas` rows. Hire reads the label; assistant requires structured neighborhood coverage. Prepared `supabase/ops/preview_kwame_east_legon_coverage.sql` for **only Kwame + East Legon (`90ac8954-e9ca-467f-8a2e-de7eecbd5422`) on Preview `opeojxwkwwnnncnsuaag`**. Guarded/idempotent, rejects profile/neighborhood drift; no inference from “nearby,” no bulk provider backfill or authorization weakening. Fresh seed records this same named pilot coverage. Live repair remains unapplied pending explicit approval.
- **Hair cause reproduced:** “I need an electrician” retained generic “need” in an OR text search; all candidates were displayed even if model evidence omitted them. Read-only actual caller-authorized Preview RPC: before 2 posts including hair; corrected service terms 1 relevant electrical post, hair absent. Code now removes request scaffolding, uses service concepts for related discussion queries and displays only model-selected secondary provider evidence. Exact-excerpt validation, source routes, RLS and final reauthorization remain intact.
- **Unavailable cause confirmed at screenshot time:** 15:23:09 UTC Edge 503 coincides with meter Postgres **54000 / “Ask My Corner allowance reached.”** One account's day count is **40**, another **31**; existing limits 6/minute, 40/user/day, 500/global/day. This is a limit rejection misreported as an outage. New Edge handling returns a safe **429 + ASK_ALLOWANCE_REACHED**; mobile decodes the recognized code and displays the Preview question-limit message while preserving Search. No raw internal error text is shown. Existing caps/counters are unchanged; no quota reset or extra paid model call.
- Local checks: **45 server tests; 548 mobile tests / 97 suites; typecheck, format and diff passed; lint 0 errors / 15 baseline warnings.** Regression coverage includes actual Postgres topic matching, unselected hair removal, quota before model/retrieval, HTTP-body/session-safe mobile handling and exact coverage repair scope/idempotency/drift rejection. Remote CI passed at tested source `40957f92c72a509a184e8fa93c6847132d58a4fc`: Database/RLS **36330082517**, Mobile **36330082583**, server/Deno **36330082543**. Reviewable PR **#150**. Live Preview remains v8 / JWT true.
- **Deployment approval boundary:** prior approvals covered the earlier named migrations/#148 function and one APK47 build, now consumed. This new Edge source and one-row Preview coverage repair are prepared for explicit approval; no persistent live change performed. APK47 cannot display the new quota-specific copy; a later new Preview APK needs fresh build approval after backend verification. Native acceptance remains failed/pending for these issues. No production, identity, secrets, real communications or unrelated schema changes.
- Evidence: `docs/evidence/ask-relevance-quota-2026-09-27.json`. Do not claim this repair is live or request another build merely to diagnose the existing screenshots.

## 2026-09-27 — Approved assistant Preview APK 47 built and verified

- The one approved build completed: **APK 47**, EAS **`6f96b91b-8358-47e9-ac5d-5aee15058497`**, source **`ea06651b69466dfaf70325b065566e412960925e`**, workflow **36295025462 success**. Application/database files equal tested #148 source `1e9f4f4b5e41c788ff695b117dc29b7bdde4d074`. PR **#149**, based on #148, preserves the existing stack without merging or moving its branches. Main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b` at build.
- APK: https://expo.dev/artifacts/eas/fQ7Rln7UW3X5Ha0TxPs9BC0gohUmFKQ1KS0GE_Pi2Jg.apk . Size **72,010,422 bytes**; SHA-256 **`e0875a76f301d2fff3abc9d5b9dee195f21b3433779d8d877964a4a714160c32`**. Independent download matches. Android apksigner verified v2; signer SHA-256 **`79de09929e726b418f4447d1b7f73d6b529b636b5d05a9766fcb39cd068bdc76`** matches APK 46, supporting an in-place update that retains app data.
- Verified actual artifact: exact EAS source, Android version 47, package `com.mycorner.trustedpeople`, Preview-only Supabase URL `opeojxwkwwnnncnsuaag`, ZIP integrity, identical navigation font, existing media/assistant/Home/public-name labels, and new provider availability/completed-job labels. New native source includes clarification choices, selected-provider availability follow-ups and completed-job display.
- Build release gates passed: **544 mobile tests / 96 suites**, formatting, typecheck, lint **0 errors / 15 baseline warnings**, Preview environment and EAS duplicate checks. Mobile CI **36295045176 / 36295025422** passed. Unchanged source checkpoint Database/RLS **36294726852** and server/Deno **36294726817** passed; server tests **42**. Submission receipt artifact **10923821793** and verified APK/provenance artifact **10923099208** persist with the workflow.
- Preview backend v8 was already deployed with JWT verification retained; prior 40 authenticated-role RPC checks and anonymous HTTP 401 remain recorded in `docs/evidence/ask-intent-preview-deployment-2026-09-27.json`. No backend deployment, production, secret, identity, provider-coverage or feature-flag changes occurred for this build.
- **This one-build approval is consumed. Do not submit another EAS build without fresh approval.** Authenticated Edge/model and native phone/tablet acceptance remain **PENDING**. Test clarification choices, selected-provider follow-ups/completed-job display, source actions, existing public names/avatars and Home collapse behavior after install. Missing structured Plumbing/Electrical service areas remain a separate data gate; this APK does not invent provider coverage.
- Mac update: download APK 47, verify the SHA-256, then `adb -d install -r "$HOME/Downloads/my-corner-preview-47.apk"` for one USB phone. Use `adb -e` for one emulator or `adb -s DEVICE_SERIAL` for a selected device; never uninstall/clear app data as part of this update.
- Evidence: `docs/evidence/ask-intent-apk-2026-09-27.json`. Resume from live GitHub/EAS records; do not rebuild after a stalled session.

## 2026-09-27 — One new assistant Preview APK approved; submission checkpoint

- Founder explicitly approved one new Preview Android APK after the verified v8 backend deployment. This resolves the previous APK approval gate for one submission only. No main merge, production change, secret change or identity/provider-coverage edit is included.
- Build branch `codex/ask-intent-preview-apk` starts at #148 checkpoint `90b91e7d221704ede8ac0b67517af317d3eac4c3`; application/database source is unchanged from tested `1e9f4f4b5e41c788ff695b117dc29b7bdde4d074`. Live main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`. Existing PR stack branches remain unchanged.
- Latest source checkpoint CI passed: Database 36294726852, Mobile 36294726819, server/Deno 36294726817. The build reruns release gates and verifies Preview-only environment, exact source, version greater than 46, previous product markers and new provider follow-up/completed-job labels.
- EAS duplicate guard retains active/unexpected completed-build rejection and recognizes already verified APK 46 (`b6ea9558-74c4-49fe-9f28-f8a9baed72ff`) as the prior baseline. A build receipt is uploaded before the long completion wait. Do not submit a replacement if the chat stalls; inspect this workflow's recorded build first.
- New native source includes clarification choices, selected-provider availability follow-ups and completed-job display. Preview backend v8 remains JWT-verified; 40 scoped RPC checks and anonymous HTTP 401 passed. Authenticated Edge/model and native phone/tablet visual acceptance remain pending. Missing structured Plumbing/Electrical service areas remain a separate data gate.
- Status at this checkpoint: authorized submission prepared; no new EAS build ID recorded yet. Completion evidence and actual APK checksum follow after artifact verification.

## 2026-09-27 — Approved assistant upgrade deployed to Preview and scoped checks complete

- Founder explicitly approved this exact migration and tested #148 function deployment to Preview only. Applied **`20260927040151_assistant_structured_retrieval.sql`** to **`opeojxwkwwnnncnsuaag`**. Remote history version **`20260927042839`**; stored SQL matches source byte-for-byte, SHA-256 **`54bc903bbcf85b7dae072a786f0bf28f4ede47a8a4623dc6f952bd418b2fa1ca`**. The tool assigns the remote timestamp; do not reapply because it differs from the filename.
- Deployed **`ask-my-corner` v8**, ACTIVE, **JWT verification true**. All seven deployed function/config files match tested #148 source **`1e9f4f4b5e41c788ff695b117dc29b7bdde4d074`** exactly. Bundle SHA-256 **`b7cbc2a54c4b4fb96b57efcce08bab439bf2d87624d08b2dfd172d54c1f1559c`**. Prior automatic approval block is resolved. No production, identity, provider coverage, feature flag or secret changes; no PR merged and no paid APK build.
- **40 actual Preview authenticated-role RPC query checks completed** using the tested planner's exact source/options/date parameters. These are live database retrieval checks plus anonymous HTTP **401**, **not authenticated Edge/LLM execution**. No user HTTP login session was available. Festival/festivals/full question/festval each return 2 upcoming Events; racing/pig/pig racing return 1 Event; fence/fencing/repair fence return 1 covered provider; dining-table search returns 3 listings; road closed/closure/traffic each return 2 agency notices. Feed/Group electrical discussion and park-history sources remain retrievable.
- Utility synonyms now agree: no current authorized outage evidence found; unrelated park lighting is correctly excluded. Plumbing/Electrical still return no providers because valid structured service areas are missing. No coverage was invented. Music has 2 and food 1 Event across all dates, but zero upcoming; current-window/weekend zeroes must not be reported as broken lexical retrieval or filled with fabricated Events.
- **Scoped boundaries passed:** anonymous RPC denied, invoker RLS retained, unauthorized neighborhood denied, returned Events approved/current/authorized, Group membership required, Agency notices approved/nonexpired, providers have explicit coverage, and Event/provider/Marketplace action routes match source IDs. Completed-job metrics match the existing verified-review projection; RSVP counts match public structured counts; newest-listing values match creation times. Live comparisons show 1 RSVP among 2 eligible Events, 1 completed job for the 1 covered provider, and newest selection from 11 eligible listings. No Plumbing/Electrical comparison winner can be established without eligible providers.
- Security advisors unchanged from baseline (including existing unrelated findings); not certified advisor-clean. Reference: https://supabase.com/docs/guides/database/database-linter . Full source CI remains green: Database/RLS **36293942320**, Mobile **36293942313**, server/Deno **36293942319**; **544 mobile tests / 96 suites; 42 server tests; typecheck/format/diff passed; lint 0 errors / 15 baseline warnings**.
- **NEW PREVIEW APK APPROVAL REQUIRED** for full Android testing of new clarification choices, selected-provider availability follow-ups and completed-job display. APK 46 predates these mobile changes. Current main is still **`a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`**; approved backend source lives in open #148 stack. Merge/source selection must preserve #145–#148 and prior #143/#144 history before a new build. No build started. Authenticated Edge/model execution and phone/tablet visual acceptance remain pending; provider coverage remains a separate data gate.
- Durable deployment evidence: `docs/evidence/ask-intent-preview-deployment-2026-09-27.json`; 40-query result matrix included. Existing audit: `docs/ASK_INTENT_AUDIT.md`. Resume from live GitHub/Preview; do not redeploy/reapply merely because a chat session stalls.

## 2026-09-27 — Approved assistant migration applied; Edge deployment next

- Founder explicitly approved the new migration and tested #148 ask-my-corner deployment to Preview `opeojxwkwwnnncnsuaag` only, retaining JWT verification. The previous automatic approval block is resolved.
- Applied `20260927040151_assistant_structured_retrieval.sql` successfully through the migration tool. Source SHA-256 `54bc903bbcf85b7dae072a786f0bf28f4ede47a8a4623dc6f952bd418b2fa1ca`. No provider coverage, identity, feature flag, secret or production data changed.
- Tested source remains `1e9f4f4b5e41c788ff695b117dc29b7bdde4d074` in #148; all final CI green. Next authorized operation: deploy its seven function/config files with JWT verification true, then scoped read-only verification. No merge or paid APK build authorized by this approval.

## 2026-09-27 — Assistant upgrade ready; exact Preview deployment approval required

- Reviewable work is pushed in **#145 (audit), #146 (concepts/planning), #147 (structured retrieval), #148 (grounded response/mobile integration)**. Stack preserves #143/#144 history. Tested application/database/test source: `1e9f4f4b5e41c788ff695b117dc29b7bdde4d074`; later commits are checkpoint-only. Live main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; no PR merged in this task.
- **All final CI passed:** Database/RLS **36293942320** (and push **36293940628**), Mobile **36293942313**, server/Deno **36293942319**. Local **544 mobile tests / 96 suites; 42 server tests; typecheck, format and diff pass; lint 0 errors / 15 existing baseline warnings**. Includes actual SQL metric comparisons before caps, RSVP/newest-listing regressions, outage false-positive exclusion, privacy and existing Event checks.
- **Automatic approval review rejected** applying the new persistent Preview DDL migration: the founder's prior explicit approval covered different named migrations and the existing Edge function, not this new migration. No workaround was used. Readback confirms new migration/RPC absent. Dependent Edge deployment was **not attempted**. Live `ask-my-corner` remains **v7**, JWT verification enabled, deployed files equal main.
- **Exact approval needed:** apply only `20260927040151_assistant_structured_retrieval.sql` (SHA-256 `54bc903bbcf85b7dae072a786f0bf28f4ede47a8a4623dc6f952bd418b2fa1ca`) to Preview **`opeojxwkwwnnncnsuaag`**, then deploy the tested #148 `ask-my-corner` source with **JWT verification retained**, and run scoped verification. This replaces retrieval functions and adds authorized comment/concept helpers; it does not change user records, identity, provider coverage, feature flags or secrets. Protected-main merges remain separately unperformed.
- **Data/acceptance gate:** four Plumbing/two Electrical records have no structured service areas. Electrical public labels name Adenta/Madina and Osu/Labone; never invent East Legon coverage. Valid provider-supplied coverage must be resolved for positive local provider demo acceptance. Existing lighting discussions are not outage evidence. SQL/source checks are not authenticated HTTP/model or native phone/tablet acceptance.
- APK 46 installed successfully but predates the new clarification/provider-follow-up UI. A new Preview APK will require fresh founder approval after backend verification; **no build was submitted**. Production, identities, real communications and unrelated schema/secrets remain untouched.
- Durable evidence: `docs/ASK_INTENT_AUDIT.md`, `docs/evidence/ask-intent-audit-2026-09-27.json`, `docs/evidence/ask-intent-verification-2026-09-27.json`. Resume from live GitHub and these records; do not recreate completed checkpoints or reapply earlier migrations.

## 2026-09-27 — Integrated assistant source green; Preview deployment boundary

- Four reviewable PRs are open: #145 audit, #146 concepts/planning, #147 structured database retrieval, #148 grounded response/mobile integration. Final source/test head `1e9f4f4b5e41c788ff695b117dc29b7bdde4d074` preserves #143/#144 history; no PR was merged.
- Integrated source `1f51931477fa11a78d3f2e73f3f41456ffdbda49` passed Database 36293816023, Mobile 36293816027 and server/Deno 36293816003. Final test-only extension adds RSVP/newest-listing cap regressions; its Database run 36293942320 is pending, Mobile 36293942313 and server/Deno 36293942319 passed. Local: 42 server tests, 544 mobile tests/96 suites, typecheck/format/diff pass, lint 0 errors/15 baseline warnings.
- Live readback corrects the stale function version: Preview `ask-my-corner` is v7, JWT verification true; all five deployed files equal main. New migration/RPC are absent. No current-session deployment or secret change occurred.
- Concrete Preview deployment candidate: only `20260927040151_assistant_structured_retrieval.sql`, SHA-256 `54bc903bbcf85b7dae072a786f0bf28f4ede47a8a4623dc6f952bd418b2fa1ca`, then this tested `ask-my-corner` source with JWT verification retained, project `opeojxwkwwnnncnsuaag` only. It changes retrieval functions, not user/identity/service-area data or feature flags. Completed work is durable before any deployment attempt.
- Positive provider acceptance also needs valid service-area assignments: the two Electrical public labels name Adenta/Madina and Osu/Labone, so they must not be invented as East Legon coverage. Some Plumbing labels mention East Legon but have no structured coverage. Current "lights off" matches include non-outage lighting discussion; v2 guards this with phrase evidence.
- Authenticated HTTP/model execution and Android phone/tablet acceptance remain pending. APK 46 predates clarification/provider-selection UI. No paid build or production action. Evidence: `docs/evidence/ask-intent-verification-2026-09-27.json`; audit and safe semantic-layer design: `docs/ASK_INTENT_AUDIT.md`.

## 2026-09-27 — Ask My Corner intent upgrade prepared in reviewable checkpoints

- Audit #145, concepts/planning #146 and structured retrieval #147 are pushed, stacked above #144 to retain prior deployment/APK records. Integration follows on `codex/ask-grounded-integration`. Live main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`.
- Added concept/category aliases, controlled typo matching, intent priorities, time windows, utility phrase evidence, SQL comparisons before caps, authorized text/comments, grounded notices, clarification actions and selected-provider follow-ups. Details and 16-query baseline: `docs/ASK_INTENT_AUDIT.md`.
- Local integrated checks: 42 server tests; 544 mobile tests / 96 suites; typecheck/format/diff pass; lint 0 errors / 15 baseline warnings. Database checkpoint CI passed; final integration CI pending.
- New migration `20260927040151_assistant_structured_retrieval.sql` remains unapplied. No Edge redeployment, main merge, production action, identity/coverage backfill or EAS build performed.
- Preview data gate: four Plumbing/two Electrical providers have no recorded service areas. Existing "lights off" lexical matches include unrelated lighting discussions; these must not be called outage confirmation. Authenticated HTTP/model and native acceptance remain pending. APK 46 installation succeeded, but it predates the new UI.

## 2026-09-27 — Ask My Corner intent upgrade: checkpoint A

- Live main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; preserves #143/#144 checkpoint history. Full 16-query root-cause table: `docs/ASK_INTENT_AUDIT.md`; machine-readable evidence: `docs/evidence/ask-intent-audit-2026-09-27.json`.
- Actual Preview authenticated-role SQL reproduces zero Plumbing/Electrical providers: four Plumbing and two Electrical records lack any service-area rows. Do not weaken neighborhood authorization or invent provider coverage. Alias/source-planning/metric defects independently confirmed in source.
- Work proceeds in reviewable checkpoints: domain concepts/planning, authorized structured retrieval/comparisons, response/UI integration and regression verification. Existing Event fixes remain intact. No live HTTP/model answer or native visual pass is claimed.
- APK 46 installation succeeded in founder terminal; UI acceptance remains pending. No production writes, Preview mutation, identity edits, communications, merges or new EAS build in this audit.

## 2026-09-26 — Corrected Preview APK 46 built and verified

- The one approved build completed successfully: **APK 46**, EAS **`b6ea9558-74c4-49fe-9f28-f8a9baed72ff`**, build source **`4192a8ac26b5d4059ff066cee3f33abd43f76e19`**, workflow **`36274964615`**. Application/database source exactly matches merged main `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; only build workflow and checkpoint docs differ. PR #144 preserves documentation-only #143 as an ancestor; both remain open pending separate merge authorization.
- APK URL: https://expo.dev/artifacts/eas/-CKQO0JNzc_mLN39FrqBaX9ZJ_wW9ZmSab1c-c5EP70.apk . Size **72,009,198 bytes**; SHA-256 **`839f52a059be36fb5d94cf775517b621124ef47fa0b6fece4a5606f6f7fb7197`**. An independent download matched the workflow checksum.
- Actual artifact passed source SHA, Android version 46, package ID `com.mycorner.trustedpeople`, Preview-only Supabase URL, ZIP integrity, navigation font, media/assistant/Home/public-name markers and the newly added public-name signup text checks. Android apksigner verified the v2 signature. Signer SHA-256 **`79de09929e726b418f4447d1b7f73d6b529b636b5d05a9766fcb39cd068bdc76`** matches APK 45, supporting an in-place update that retains app data.
- Release gates passed: **541 mobile tests / 96 suites**, typecheck, formatting and lint **0 errors / 15 baseline warnings**, Preview environment validation and EAS duplicate preflight. Mobile CI **36274971925** / **36274964618**, Database CI **36274964613**, server/Deno CI **36274964715**, and build workflow **36274964615** all passed at the submitted source. Server tests remain **32 passed**.
- Preview backend canonical public-name repair was already deployed and verified: four historical conversations/two distinct peers resolve public names consistently, with no identity backfill. This build adds the merged canonical self-profile display, explicit signup public-name copy and Find Neighbors avatar batching to the installed Android source. No backend, production, secret or identity changes were made for the build.
- **One-build approval is consumed. Do not submit another EAS build without new founder approval.** Native Samsung phone/Pixel Tablet visual acceptance remains **PENDING**: verify the same public name in Profile, Find Neighbors, inbox and thread; avatars, latest message, timestamp/unread and accessibility; explicit name edits after refocus/polling; genuine unnamed-account fallback; Home Active/Past collapse/counts; phone/tablet rotation. Component/SQL/bytecode checks are not native acceptance.
- Mac install/update: download the URL, verify the SHA-256, then use `adb -d install -r "$HOME/Downloads/my-corner-preview-46.apk"` for one USB phone. Use `adb -e` for one emulator, or `adb devices -l` and `adb -s DEVICE_SERIAL install -r ...` to select among multiple physical devices. Do not uninstall or clear app data as part of this update.
- Evidence: `docs/evidence/canonical-public-name-apk-2026-09-26.json`. The APK and build remain recoverable through EAS and workflow #36274964615; do not start a replacement merely because a chat session stalls.

## 2026-09-26 — One corrected Preview APK explicitly approved

- Founder approved one new Android Preview APK after PR #142 merged and its exact Preview migration was verified. Application source is current main `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; build base also preserves documentation-only PR #143 (`4efce7ad487f1a581a47a59e7bff3daab64a014c`). No application/schema changes are added for this build.
- Build purpose: native verification of canonical self-profile public-name display, explicit public-name signup wording and Find Neighbors avatar batching, alongside Messages list/thread, avatar, latest message, timestamp/unread and existing Home disclosure behavior. Backend name resolution is already live and can be consumed by APK 45 on refresh.
- Use the existing `codex/vc-media-foundation` workflow branch, fast-forward only. One submission via the existing Preview profile/environment/internal APK/signing configuration. No production deployment, secret edits, messages or identity mutation.
- Last verified finished build is APK 45 (`c7f685a6-6ffc-4463-99ac-626b7f61c8a2`). Duplicate guard now recognizes that completed build as the prior baseline while retaining all active/unexpected-new-build rejection checks. Require resulting version >45 and confirm the new public-name signup copy in the actual bundle, exact source SHA, Preview project, app ID and navigation font.
- Release gates must pass before submission. Initial build ID/artifact/checksum pending. If submission or later verification encounters an error, inspect/reuse the recorded build rather than submit a duplicate. One-build approval is consumed by that one submission; native phone/tablet acceptance remains pending.

## 2026-09-26 — Public-name repair merged and deployed to Preview

- Founder explicitly approved merging PR #142 and applying only `20260926213111_canonical_public_profile_name.sql` to Preview `opeojxwkwwnnncnsuaag`. The prior merge-approval blocker is resolved. PR #142 merged at **`a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`**; #140 and #141 were also marked merged because both heads are preserved in its ancestry.
- Exact approved migration applied successfully. Remote history version **`20260926215220`**, name `canonical_public_profile_name`; stored SQL equals the committed source byte-for-byte, and deployed function body matches. Source SHA-256: `b731e2ad0f1f5a5a5938e43aa5a3e8ed193b5e1278a6a3f523b56d6fd3341aef`. The remote timestamp is assigned by the deployment tool: do not reapply based on filename timestamp differences.
- Root cause/fix: Messages omitted the existing public `profiles.display_name` source. The shared resolver now uses saved public edit → identity public name → legacy public profile name (only without a private-identity record) → Neighbor; inactive/missing accounts are unavailable. No legal fields are selected and no identity data is copied. Self Profile uses this canonical RPC; signup explicitly identifies the public-name field; Find Neighbors batches avatars.
- Live verification used read-only transactions and authenticated database-role RPCs. All four historical requester conversations now return public names: two distinct names for two peers. Inbox/thread/Find Neighbors/public-profile projections agree; peer IDs and display fields are correct. Reverse-participant thread resolution and self-name RPC match the same public identity. **No native phone/tablet visual acceptance or authenticated HTTP session is claimed.**

| Participant | Conversations | Before deployment | After deployment | Cross-surface result |
| --- | --- | --- | --- | --- |
| Test peer A | 1 | Neighbor | Existing public name | Inbox/thread/discovery/public profile agree |
| Test peer B | 3 | Neighbor | Existing public name | Inbox/thread/discovery/public profile agree |

- Privacy checks: anonymous/authenticated direct helper execution remains denied; direct client reads of the private name store remain denied; the explicit-edit store still has **zero rows**. This demonstrates resolution without a backfill. No users were renamed, no messages were sent, and no private identity values are included in evidence. Advisor categories/counts are unchanged from baseline; existing findings remain documented, not certified clean (https://supabase.com/docs/guides/database/database-linter).
- Shared Event organizer attribution was verified against authorized source records; all four Festival sources retained valid Event actions, approved visibility and neighborhood authorization. Direct Event retrieval counts: festival 4; festivals 4; What festivals are happening? 4; racing 1; pig 1; pig racing 1; music 2; music festival 5; food 1; food drive 1. These calls deliberately omit planner date bounds and therefore do not replace the prior 30-day planner check or authenticated Edge/model-synthesis acceptance. Assistant v6/JWT verification was not changed or redeployed.
- Final PR-head CI at `07164ba9c1e67483c1de7d940d1049be318e92a5`: Mobile **36274196799**, Database **36274196755**, Media Functions **36274196736**, all passed. The checkpoint-only head has identical application/database/workflow source to tested `5187b52`: **541 mobile tests / 96 suites; 32 server tests; full database/RLS suite; typecheck, formatting, Deno and web export passed; lint 0 errors / 15 baseline warnings**. SQL fixtures cover new/historical conversations, distinct names, both participant directions, private-vs-public identity, missing names, explicit updates, block/suspension and grants; component/hook tests cover names, avatars, batching and refresh hydration.
- **CORRECTED PREVIEW APK APPROVAL REQUIRED.** APK 45 can receive the backend name correction on Messages refresh/refocus; reinstall is not the fix. It cannot contain the newly merged self-profile canonical projection, public-name signup wording or Find Neighbors avatar batching. One corrected Preview APK is required for full Android phone/tablet verification of those source changes. No APK build has been triggered. Production, secrets and identity rows remain unchanged.
- Deployment evidence and this checkpoint are committed on `codex/canonical-public-name-deployed` for a documentation PR. This does not assume authorization to merge another PR. Application main is already the approved merged repair above; no further source changes were made.

## 2026-09-26 — Public-name repair tested and pushed; merge approval blocked

- Repair PR **#142**: https://github.com/pushee-io/My-Corner-Trusted-People/pull/142 . Application/migration/test commit: `5187b5248cec8f7c8f6cca887836e1c177d84043`. Both #140 and #141 heads are preserved as ancestors. Main remains `24fc72db2ec12c6f761e53b2f66c994b903b1824`.
- All relevant CI passed at the repair commit: Mobile `36273823084` (541 tests / 96 suites, format, typecheck, lint 0 errors / 15 baseline warnings, Expo checks and web export); Database `36273823103` (full reset and SQL/RLS suite); Media Functions `36273823112` (32 tests and Deno check). Local tests/typecheck/format/lint also passed. Initial fixture/lint failures and their corrections are recorded below; privacy assertions were retained.
- Read-only Preview verification of the proposed resolver: four existing conversations / two active peers. Peer A: one conversation; peer B: three. Both have existing legacy public identity, current inbox/thread resolve Neighbor, and the proposed chain resolves a non-fallback public name. This is a query comparison, **not deployment or native acceptance**. Private identity values were not printed and no users were edited. The exact screenshot-to-conversation mapping has not been independently established; the verified inbox is the existing fictional requester test account.
- **Automatic approval review rejected merging #142**, stating that prior push/open approval did not explicitly authorize mutation of protected/default main. No retry, alternate merge route or workaround was used. PR remains open; request explicit founder approval to merge it and deploy the reviewed migration to Preview. The new migration remains unapplied and the live resolver remains unchanged; the explicit-edit store still has zero rows.
- Exact pending deployment: `supabase/migrations/20260926213111_canonical_public_profile_name.sql`, SHA-256 `b731e2ad0f1f5a5a5938e43aa5a3e8ed193b5e1278a6a3f523b56d6fd3341aef`, **Preview `opeojxwkwwnnncnsuaag` only**. It replaces the private resolver and retains revoked client execution; it performs no identity backfill/DML. After merge/approval, apply once, verify stored SQL and authenticated inbox/thread/profile/discovery reads, compare security advisors to baseline, and record results. No Edge Function redeploy is needed for this SQL helper change; existing assistant v6/JWT verification stays intact.
- **Corrected APK approval is not yet being requested or consumed.** Backend name resolution will be available to APK 45 on refresh after deployment. A later APK is needed for the new self-profile canonical projection, explicit public-name signup wording and Find Neighbors avatar batching; phone/tablet visual acceptance remains pending. No build, production deployment, secret change, real communication or identity-data mutation occurred during this repair.
- Existing Preview advisor findings are baseline, not a clean security assessment: this scoped change does not alter them. See https://supabase.com/docs/guides/database/database-linter . Application RLS and private-helper access are covered by the passing SQL suite.

## 2026-09-26 — Canonical public-name repair in progress; APK 45 defect confirmed

- Founder reports installed APK 45 still labels multiple conversations Neighbor. Previous verification was insufficient: it tested fallback behavior but did not cover existing legacy public identities.
- Live base `24fc72db2ec12c6f761e53b2f66c994b903b1824`; repair branch preserves both open PR heads #140 (`70ad7c4`) and #141 (`7aa6713`) as ancestors. Deployment evidence, APK 45 build record and Saturday fixture correction are retained.
- Root cause: `private.neighbor_name` consulted the empty explicit-edit store, then `private_identity_profiles.public_display_name`, omitting the established public `profiles.display_name`. Inbox/thread RPCs already select the correct peer dynamically; repository/UI pass the result through. This is backend resolution plus inconsistent self-profile mapping, not primarily stale cache.
- Public-source evidence: `20260724042000_day2b_verified_neighborhood_access.sql` defines the public-profile projection with identity public name then profiles.display_name; `20260802010000_events_complete.sql` publishes profiles.display_name as Event organizer/comment/attendee name; self Profile displays it. Preview's compatibility schema lacks that historical public-profile view. Feed/Marketplace attempt batched profile-name reads but own-only profile RLS can suppress peers; those attempts alone are not proof of live public visibility. Legal identity fields remain separate and are never selected by this repair.
- Read-only Preview trace: four existing requester conversations map to two distinct peers. Both have legacy public profile names and no explicit newer public name; all four inbox/thread results were Neighbor. Peer B also matches its existing public provider name. A broader diagnostic was rejected by automatic review for unnecessary identity fields; the successful replacement returned only participant labels and provenance booleans. No private names, auth IDs or seed keys are documented.

| Participant | Legacy public name present? | Before RPC | Before UI | Root cause |
| --- | --- | --- | --- | --- |
| Test peer A (one conversation) | Yes | Neighbor | Neighbor from unchanged RPC mapping; founder reports device defect | Legacy public source omitted |
| Test peer B (three conversations) | Yes; matches public provider name | Neighbor | Neighbor from unchanged RPC mapping; founder reports device defect | Legacy public source omitted |

- Repair `20260926213111_canonical_public_profile_name.sql`: active account → explicit saved public edit → identity public name → legacy public profile name only without an identity record → Neighbor. Blank identity public names suppress legacy fallback; generated New neighbor is unnamed. Suspended/missing peers return Neighbor unavailable. No backfill or identity-data mutation; helper stays private, caller RLS/block/neighborhood checks unchanged.
- Self Profile uses the same canonical RPC as the editor; Find Neighbors batches avatars; signup explicitly labels its name public. Existing inbox/header avatar behavior is retained. Foreground 10-second polling, refocus and authorized realtime refresh already hydrate current RPC values without reinstall.
- Regression work: full-database fictional A/B/C/D/E fixtures test old/new conversations, both participant directions, consistency, explicit changes, legal-name separation, block/suspension/fallback and private helper grants. Component/hook tests verify display/accessibility, correct avatars, batching, self-profile source and changed-name hydration. Local validation: 541 mobile tests / 96 suites, 32 server tests and typecheck passed. Media Functions CI `36273554325` passed including Deno check. Initial Mobile CI caught JSX lint in the new avatar test; corrected before final verification. Database CI and final Mobile CI remain pending; migration is NOT YET applied to Preview.
- Database CI exposed the shared Event organizer-name helper's dependency on this resolver. Existing privacy fixtures labeled legacy profile values private without creating private identity records. Fixtures now explicitly create private identity with blank public display name, retain their adversarial legacy values, and retain every non-leakage assertion. No production behavior was special-cased for test names. New A/B/C coverage separately proves legitimate legacy public identities resolve automatically. Initial avatar JSX file was outside the repository's `.test.ts` match; restored a lint-clean `.test.ts` test and verified it executes.
- No paid build authorized: APK 45 build approval is consumed. The backend resolver can improve APK 45 on refresh after deployment; source changes to self Profile, signup copy and neighbor avatar batching require a corrected APK for full native acceptance. Do not falsely claim a backend-only correction requires reinstall. Production, communications and identity mutations remain prohibited.

## 2026-09-26 — Preview APK 45 built and artifact verified

- One approved Android Preview build completed: version 45, source `980570c4adf7c9ac9bd850f32265f32d7e7367b5`, EAS `c7f685a6-6ffc-4463-99ac-626b7f61c8a2`. Build workflow `36271219730` passed. The application source matches main `24fc72db2ec12c6f761e53b2f66c994b903b1824`; only build workflow and checkpoint documentation were added for submission.
- APK: https://expo.dev/artifacts/eas/7teO9Nca9Thz6_JTQT87Lnc4aF7RYl1wTwhXP4gy2OE.apk . Size 72,009,054 bytes; SHA-256 `a0ddf0fb371281d08eea6985182eda937c30cc40e93c8b2d29f223c3446e14d9`.
- Actual APK passed source SHA, Preview-only Supabase URL, application ID, version, ZIP integrity, media/navigation font and UI/RPC marker checks. Includes counted collapsible Active/Past sections, public-name editor and Messages avatar batching. Downloaded checksum independently matched; signing certificate SHA-256 `79de09929e726b418f4447d1b7f73d6b529b636b5d05a9766fcb39cd068bdc76` matches the previously verified APK. Install as an update and retain app data.
- Release gates: 535 mobile tests / 94 suites, format, typecheck, Preview environment and EAS duplicate preflight passed; lint zero errors / 15 existing warnings. Mobile CI `36271219787` and Media Functions CI `36271219761` passed, including web bundle verification.
- Initial Database CI `36271219839` failed on a time-sensitive test: Saturday's 10 AM fictional event was excluded by a lower bound of now() on Saturday afternoon. Corrected only `supabase/tests/neighborhood_ai_preview_fixture.sql` to include today's fixture. No application/migration/remote Preview changes. Local PostgreSQL date-window reproduction confirmed the issue; full Database CI `36271594200` passed at test-only commit `84be952bc58677a4e8252a1f48c66dde75f56d0b`. The APK source itself remains `980570c`; no replacement APK was submitted or needed for this test change.
- One-build approval is consumed. No second EAS submission, production action, backend deployment, live fixture mutation, identity update or real communication occurred. PR #140 remains open; its earlier APK approval requirement is superseded by this build checkpoint.
- Native Samsung phone/Pixel Tablet layout, accessibility, rotation, Home disclosure/counts, public-name save/header/avatar and signed-in assistant answer acceptance remain PENDING. Artifact/tests are not native acceptance. Preview backend v6 authenticated HTTP/model synthesis also remains unverified without a signed-in session.
- Evidence: `docs/evidence/home-public-name-apk-2026-09-26.json`. Verify all ten search phrases while preserving date/neighborhood/private-event rules; accounts without an explicitly approved public name must remain Neighbor.

## 2026-09-26 — One Preview APK approved for Home and public-name repairs

- Founder explicitly approved one new Preview APK after checkpoint PR #140 was opened. Source base is freshly fetched main `24fc72db2ec12c6f761e53b2f66c994b903b1824`; the application includes merged PRs #136–#138. PR #140 remains open and is documentation-only.
- Use the existing workflow-enabled `codex/vc-media-foundation` branch, confirmed to be an ancestor of main, for a fast-forward build trigger. Only workflow and checkpoint documentation differ from main. This does not merge PR #140 or alter production.
- Existing Android `preview` profile, `preview` environment, internal APK distribution, remote version auto-increment and signing configuration retained. One submission only; inspect the same build after any subsequent verification failure.
- Last known completed build is APK 44 (`b30911f6-4b82-47ef-91d2-38e7732cd0e2`). GitHub history shows its successful workflow `36148445698` and no newer EAS Preview workflow in the latest 100 runs. The submission workflow must independently check EAS and block active or unexpected newer builds.
- Workflow gates run full mobile format/lint/typecheck/tests and Preview environment checks before submission. Actual artifact must match source SHA and Preview backend, have version greater than 44, and contain Home Active/Past labels and the public-name editor/RPC alongside existing media, navigation and assistant markers.
- Preview deployment was completed in the preceding checkpoint: both migrations applied, assistant v6 with JWT retained, scoped retrieval checks passed. Detailed evidence is in PR #140; do not reapply/redeploy. Authenticated Edge synthesis and native phone/tablet visual acceptance remain unverified.
- Build ID, artifact URL, checksum and actual native acceptance are pending. This commit records approval before external submission. No production or backend changes are authorized by this build checkpoint.

## 2026-09-26 — Approved Preview migrations applied; assistant v6 verified at retrieval layer

- Fresh live GitHub main remains `24fc72db2ec12c6f761e53b2f66c994b903b1824`. PRs #136–#139 were reused without reimplementation. Founder explicitly approved this Preview-only deployment.
- Applied exact committed SQL to `opeojxwkwwnnncnsuaag`: `20260926003542_keyword_discovery.sql` recorded remotely as `20260926011059`; `20260926004155_messaging_public_display_name.sql` as `20260926011117`. MCP assigns deployment timestamps; both stored SQL statements match their source files byte-for-byte. Do not reapply based only on differing filename timestamps.
- Deployed merged `ask-my-corner` v6, ACTIVE, `verify_jwt=true`. All five downloaded deployed files exactly match merged source. Anonymous HTTP invocation returns 401. No production, secrets, flags, paid EAS build, real communications, or persistent identity data were changed.
- Live retrieval under authenticated role passed all ten requested searches. Merged planner and source validator were run against actual Preview results: festival/festivals each 4 Events; full question 1; racing/pig/pig racing each 1; music 2; music festival 5; food/food drive each 1. Full question retains the existing next-30-days window, returning the applicable Pig racing event; unrestricted direct SQL finds 4 festivals. Music festival ranks the music festival first. Prefix, explicit date bounds, unauthorized neighborhood denial, invite-only exclusion, RLS and source/action route checks pass. No Events were inserted or fabricated.
- Non-Event live keyword checks pass: fence provider 1, table Marketplace listings 3, repair Group discussion 1, park Feed post 1, road Agency broadcasts 2. Matching occurs before the existing cap; local PostgreSQL regression covers more-than-eight candidates.
- Public-name checks pass: original approved name retained; 16 profiles legitimately remain Neighbor; new consent store remains empty. Supported save/update/trim RPC tested only as the fictional fixture actor and rolled back; another account remained unchanged. Direct table reads/anonymous saves denied; no legal fallback. Four existing inbox conversations expose name/peer/preview/timestamp/unread fields, and thread names agree. Approved-name rendering, batched avatars and explicit editor flow pass component tests; no new live conversation or message was created.
- Fresh validation: 47 scoped mobile tests / 6 suites, 31 server tests, mobile typecheck all pass. Relevant PR #136–#138 Database/server/Mobile CI rechecked live: all success (run IDs in evidence). Previous full mobile result remains 535 / 94; it was not rerun. Home defaults, counts, collapse/reopen and all same/different-provider requests pass source/component coverage.
- Limits: no signed-in Preview Auth session/test-login credentials available in this workspace, so v6 authenticated HTTP model synthesis is NOT verified. SQL role tests and source readback are not end-to-end HTTP or native acceptance. Existing live inbox peers lacked approved names; approved-name inbox/header acceptance relies on component tests plus live consent resolver checks.
- NEW PREVIEW APK APPROVAL REQUIRED: APK 44 predates Home disclosure, public-name editor and Messages batch avatars. Backend deployment cannot update its bundled React Native code. Phone/tablet visual/accessibility acceptance remains pending. Do not build until separately approved.
- Persistence approval resolved: on 2026-09-26 the founder explicitly approved pushing `codex/preview-keyword-public-name-deployment` and opening its checkpoint PR. This branch carries all five requested docs and sanitized evidence. The earlier automatic publication rejection is historical; no workaround was used. This approval does not authorize merging, a paid APK build, or another backend deployment. The separate recovery report preserves the original verification record.
- Evidence: `docs/evidence/preview-deployment-2026-09-26.json`. The older blocked-deployment entries below are historical and superseded by this entry.

## 2026-09-26 — Three repairs merged; Preview deployment blocked by approval review

- Implemented in order and merged after green checks: keyword PR #136 (`249d17f`), Messages PR #137 (`fb296d6`), Home PR #138 (`8ae3c57635b8b1f08ef5feb47f6f92447a0bab51`). Source of truth was freshly fetched GitHub main; no failed-session state was recovered. Each checkpoint includes tests and durable documentation.
- CI: #136 Database `36205768702` / server `36205768747`; #137 Database `36206086649` / Mobile `36206086625`; #138 Mobile `36206349039`, including web bundle. All passed. Local final mobile **535 tests / 94 suites**, server **31 tests**, typecheck/Deno check/format/diff review pass; lint **0 errors / 15 existing warnings**.
- Automatic approval review **rejected** applying `20260926003542_keyword_discovery.sql` and `20260926004155_messaging_public_display_name.sql` to Preview `opeojxwkwwnnncnsuaag`: persistent live schema/function/privilege changes need explicit approval for that target and those migrations. No workaround was used. Readback confirms neither migration is applied. Edge deployment was not attempted because it depends on the keyword migration. Existing deployed assistant is version 5; all five files matched the handoff GitHub source exactly before any deployment attempt.
- Exact next approval: apply those two committed migrations to Preview `opeojxwkwwnnncnsuaag`, then deploy the merged `ask-my-corner` source there with JWT verification retained and run scoped Preview retrieval/public-name checks. This does **not** include production or a paid EAS build. No production, user identity data, secrets, flags or paid build were changed.
- Public-name root cause: 17 Preview profiles, only one populated public identity. Existing approved names are retained; an account without an approved public name legitimately remains Neighbor until its user saves one through the new Profile/Messages public-name editor. Never copy private legal identity or `profiles.display_name` as a shortcut. Inbox/thread name resolution stays in one RPC; avatars are batched.
- APK 44 predates the Home collapse and public-name editor. Native phone/tablet visual/accessibility acceptance remains pending a future separately approved build. Do not claim deployed/live correction or native acceptance yet. Evidence: `docs/evidence/keyword-messages-home-2026-09-26.json`.

## 2026-09-26 — Home request sections collapse without losing requests

- Active Requests and Past Requests now have counted, full-width accessible disclosure buttons and vector chevrons. Active defaults expanded; Past defaults collapsed. Counts remain visible when collapsed, including zero counts. Request IDs/cards and active/past partitioning are unchanged; expanding still maps every request, including repeated jobs with the same provider.
- Targeted coverage: 18 Home/partition/events tests, including six same-provider requests, multiple providers, active/completed/cancelled mix, collapse/reopen and live count updates. Full mobile suite: **535 tests / 94 suites passed**. Typecheck/format pass; lint zero errors/15 existing warnings. Mobile CI is the merge gate. Native phone/tablet visual and screen-reader acceptance remain pending; no paid APK build or production deployment.
- Messages PR #137 merged at `fb296d6a4f3da2f058ff8d74091fba4bb5fe799c` after Mobile CI `36206086625` and Database CI `36206086649` passed. Keyword PR #136 is already merged with Database/server CI success. Preview backend deployment remains pending at this implementation checkpoint.

## 2026-09-26 — Messages public-name repair

- Keyword PR #136 merged at `249d17f01f6962ce6457e52aced9e73d565acf9b`; Database CI `36205768702` and Media Functions CI `36205768747` passed.
- Root cause verified read-only in Preview: 17 profiles, only one private identity/public-name row. Inbox/thread already rendered the database projection correctly. Never use `profiles.display_name` or legal identity as an implicit public fallback.
- Add a private, RLS-protected public-name consent store and caller-only RPC. Existing explicitly public identity names remain supported; users without one can explicitly save their public display name from Profile or Messages. Names resolve inside the existing inbox/thread RPC, without per-peer profile requests. Inbox avatars now use the existing batch loader. Missing approved names still display Neighbor until the account supplies one; migration does not invent/backfill legal names.
- Local mobile targeted name/repository/realtime tests and typecheck pass; lint zero errors/15 baseline warnings. SQL regressions verify public names, missing-name fallback, updates, isolation, suspension and legal-name exclusion; Database/Mobile CI are merge gates. No production, Preview deployment or paid APK build in this checkpoint.

## 2026-09-26 — General keyword discovery repair

- Root cause: deterministic “happening” intent discarded topic terms before an eight-event chronological cap; model terms used AND/phrase-sensitive websearch with no prefix matching. Preserve topics, search short keyword requests across authorized source families, normalize English lexemes and use OR prefix recall with relevance ordering before the existing limit. No Festival-specific rules. Events expose title/description (no category column); provider service labels/categories remain searchable.
- Added festival/festivals/question/racing/pig/music/food/food-drive, prefix/ranking and result-cap regressions. Existing authorization, RLS, date, block, removed-content, grounding and reauthorization gates remain unchanged.
- Local: 31 server tests including real PostgreSQL keyword checks; 23 targeted mobile assistant/Search tests; mobile typecheck passes; lint zero errors/15 baseline warnings. Database and server CI are merge gates. Migration and Edge code are checked in only; Preview/production are not deployed and APK 44 predates the repairs. No paid build.

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

# MY CORNER — CURRENT STATE

**Updated:** 2026-09-02
**Evidence timezone:** Africa/Accra

## Repository

- GitHub: `pushee-io/My-Corner-Trusted-People`
- Live `main`: `922a7c4671078ffc94e74141c2cff794c46764ef`
- PR #92 aligned the fictional Preview provider account with canonical Kwame PipeCare.
- PR #93 persisted that checkpoint.
- PR #94 rejects new requests targeting inactive or retired provider profiles.
- PR #94 final Mobile CI `33574967156`: success.
- PR #94 final Database CI `33574967154` and `33574965187`: success.
- PR #94 post-merge Mobile CI `33575181099`: success.
- PR #94 post-merge Database CI `33575181081`: success.
- Supabase Preview check `100077604509`: success for project `opeojxwkwwnnncnsuaag`.
- Repository visibility: public.
- Branch protection on `main`: not enabled.

## Verified Defect And Repair

Device evidence proved the provider account could read the canonical Kwame PipeCare seed request while a new requester submission was absent. The requester had used a retired duplicate Kwame provider UUID cached before PR #91.

PR #94 now enforces two boundaries:

- PostgreSQL rejects requester inserts unless the provider profile is currently accepting requests.
- Current mobile source checks provider availability before submission and tells the requester to refresh stale provider results.

The existing unreachable request was preserved and was not silently reassigned.

## Exact Next Action

1. Requester cancels the unreachable “Leaking pipes in the bathroom” test request.
2. Requester fully closes and reopens My Corner to clear the cached provider result.
3. Requester selects Kwame PipeCare again and submits one replacement titled “Bathroom pipe retest.”
4. Provider fully closes and reopens My Corner once.
5. Provider confirms the request appears, accepts or declines, and requester verifies the persisted status.

## Known Gates

- The single paid Android Preview build authorization is consumed; do not submit another paid build without founder approval.
- The installed APK predates the later client refresh and validation code, so full close/reopen remains necessary for this test.
- Do not deploy to production or activate real SMS, push, identity, residence, address-provider, or sensitive-data processing.
- Production database state remains unverified.
