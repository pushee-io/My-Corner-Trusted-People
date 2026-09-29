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

# Reliability acceptance matrix — 2026-09-28

Source integration: PR #157, tested head `02962a70526264bcea39634510701e456e16e445`. Final live recheck: Preview ask-my-corner v11, JWT verification true, all seven files identical to v10/#152; the version advanced externally during this session. New migration/function deployment, authenticated HTTP acceptance and native acceptance are pending. No VC-ready claim.

## Baseline query traces

Routes are `/search` and `/ask`. The read-only Preview SQL baseline used a verified East Legon demo requester. Identity is deliberately omitted. Counts are returned authorized candidates, not private preauthorization rows. Source plans cover all six supported families for these topical queries. Source text/credentials are not persisted. See `evidence/canonical-query-baseline-2026-09-28.json` for normalized terms and per-family counts.

| Input | Normalized intent / metric | Authorized Preview SQL records | Original Search failure | New AI model use | HTTP / device UI acceptance |
|---|---|---|---|---|---|
| plumber | providers / none | 2 providers | Literal plumber did not match Plumbing | None needed for provider-only result | Pending new deployment/session |
| plumbing | providers / none | 2 providers | Independent legacy matching/eligibility | None needed | Pending |
| highest rated plumber near me | providers / verified average | 2 ranked providers | Whole-sentence literal matching | SQL comparison; optional only for supporting content | Pending |
| what plumber has the most reviews | providers / verified count | 2 ranked providers | Whole-sentence literal matching | SQL comparison | Pending |
| electrician | providers / electrical | 1 Feed recommendation; 0 eligible providers | Literal synonym mismatch | Optional exact excerpt; deterministic Feed fallback | Pending |
| electrical | providers / electrical | 1 Feed recommendation; 0 eligible providers | Separate source aggregation | Optional exact excerpt; deterministic Feed fallback | Pending |
| power off | alerts / outage phrases | 1 Event candidate before new phrase filter | Separate literal matching | Only relevant authorized records; no lighting/festival overlap | Pending |
| lights off | alerts / outage phrases | Same Event candidate | Separate literal matching | Same outage plan | Pending |
| festival | Events / upcoming | 2 applicable Events | Literal-only matching lacked morphology | Optional excerpt; deterministic Events preserved | Pending |
| music | Events / upcoming | 0 applicable records | Zero may be legitimate, not a fabrication opportunity | No call for empty candidates | Pending |
| food drive | organizer / upcoming | 0 applicable records | Zero may be legitimate | No call for empty candidates | Pending |

Three actual Preview POSTs returned HTTP503 on September 28 at 19:45:30, 19:47:13 and 20:08:16 UTC. Their telemetry shows two retrieved sources and model token usage before failure. v10 does not log the exact exception or the question; these requests cannot be truthfully mapped to a particular row above. They were not quota exhaustion. No new authenticated HTTP requests were made during source preparation.

## Executed source/database acceptance

| Area | Evidence | Result |
|---|---|---|
| Shared Search/AI | Canonical query matrix and all six family fixtures | Same relevant source cards survive model failure; Search invokes no AI meter/model |
| Hire | Both repository configurations call canonical catalog; Postgres compares returned IDs | Same coverage/category eligibility; stale cache removed |
| Concepts | plumber/plumbing/plural/plumer, electrician/electrical/electrican, outage phrases, festival/music/festval, food drive | Passed |
| Comparisons | Actual SQL full-population verified count/average/completed jobs, ties, zero reviews, >8 candidates | Passed; no legacy counter substitution |
| Reviews/privacy | Full Database/RLS suite and canonical scoped projection | Private job/location/legal fields and ineligible reviews excluded |
| Authorization | Anonymous/unverified/blocked/removed content and final-context revocation | Fail closed; source removal during model latency drops card/excerpt |
| Model failures | Upstream exception, timeout path, invalid/truncated output and fabricated quote | Matching deterministic cards preserved; no fabricated excerpt |
| Source failure | Transient one-family failure vs authorization failure/all-family outage | Disclosed partial results vs fail closed |
| Relevance | Service Feed vs hair; outage vs lighting/Event; all-family source routes | Passed |
| Quota | Real Postgres 80%, 100%, minute limit, UTC reset and old usage row; client same-account reads and 429 mapping | Passed; no Preview quota mutation |
| Search interactions | One-word Search and AI pills; Search/Enter/AI blur+dismiss | Component tests passed |
| Comments | Focused backdrop, inside taps, successful completion blur, Back order, retained draft | Component tests passed |
| Existing Home/public names | Full mobile suite and database/public-name regressions | Green source checks; no new native acceptance claimed |
| Local validation | 563 mobile tests / 100 suites; 64 server tests; typecheck, formatting, Deno and Preview contract | Passed |
| Bundles | CI web bundle; local Android Hermes export using shared module | Passed; this is not an APK or installed-app test |

Server CI at source head: 36489863583. Mobile CI at source head: 36489863621. Database CI first integration: 36489196877 passed; final head rerun: 36489863402 passed. The checkpoint removes one unused legacy helper; the 15 baseline lint warnings remain.

## Remaining release gates

1. Consolidated approval for exactly the new migration and integrated ask-my-corner deployment, Preview only, JWT verification retained.
2. Authenticated Preview POST/RPC verification: plumber, highest rated/most reviews, electrician Feed-only, power off, festival, food drive, road closure, dining table, source actions and exact 429/503/quota/reset behavior. Use an authorized secure test session; never forge JWTs or manually reset quota. Legitimate empty results must remain empty.
3. Add verification outcomes and exact deployed version/source/hash to the durable checkpoint.
4. Only after backend acceptance, request a new paid Preview APK approval. APK50 predates Search/quota/comment changes.
5. Verify physical Android phone and Pixel Tablet: retrieval, sources/actions, Search fallback, 80% warning, exhausted/reset state, comments and all keyboard dismissal behavior. Native visual acceptance and VC readiness remain pending until then.
