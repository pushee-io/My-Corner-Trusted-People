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
