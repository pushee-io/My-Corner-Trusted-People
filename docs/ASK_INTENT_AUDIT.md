# Ask My Corner intent audit — checkpoint A, 2026-09-27

Main: `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`. Base preserves open #144 (and #143) checkpoint history; application source matches main. Preview only: `opeojxwkwwnnncnsuaag`.

## Evidence boundary

Traced all 16 inputs through the actual deterministic planner, source allowlist and date resolver, then executed the resulting search RPCs in read-only authenticated-role transactions for the existing fictional East Legon requester. These are **SQL retrieval checks, not authenticated HTTP/LLM tests**. No user session credentials were available. Synthesis remains an unexecuted live stage: existing code requests up to five verbatim excerpts, validates them, reauthorizes sources, then returns all candidate cards with a fixed intent notice. No fabricated final answers are recorded here.

| Query | Normalized concept / terms (existing) | Intent | Sources searched | Candidates | Why missed / root cause |
| --- | --- | --- | --- | --- | --- |
| plumber | plumb OR plumber OR plumbing | providers | provider | 0 | No Plumbing service-area records |
| plumbing | plumb OR plumber OR plumbing | providers | provider | 0 | No Plumbing service-area records |
| electrician | electrician | providers | provider | 0 | Missing service areas; category alias missing |
| electrical | electrical | digest | all six | post 1, group 1 | No eligible provider; generic source priority |
| what electrician has the most reviews | electrician | providers | provider | 0 | No metric operation; areas and alias missing |
| lights off | lights off | digest | all six | post 2, event 1, marketplace 1 | Literal light matches; no outage concept |
| power off | power off | digest | all six | 0 | No outage concept |
| power outage | outage | alerts | agency, post | 0 | Literal outage only; group omitted |
| electricity outage | outage | alerts | agency, post | 0 | Literal outage only; group omitted |
| fence | fence | providers | provider | 1 | Works for eligible fence provider |
| fencing | fencing | digest | all six | provider 1 | Stemming works; intent inconsistent |
| repair fence | fence | providers | provider | 1 | Works for eligible fence provider |
| music | music | digest | all six | event 2, post 1 | Works lexically; generic priority |
| musical | musical | digest | all six | event 2, post 1 | Stemming already works |
| festival | festival | digest | all six | event 4 | Existing repair works |
| festivals | festivals | digest | all six | event 4 | Existing repair works |

Each SQL source ranks English OR-prefix lexemes before its eight-row cap. The server interleaves up to sixteen candidates, without intent-specific evidence ranking. Alert queries use the last seven days for posts; current agency notices have no lower publication bound. Other audited queries use no date bounds. No domain concept map, controlled fuzzy correction, embeddings, or deterministic comparison operation exists. Provider searches omit Feed/Groups; alerts omit Groups; Group search covers posts but not comments/description. Feed search omits comments.

## Critical data finding

Authenticated-role and administrator aggregate-only checks agree: four visible Plumbing and two Electrical providers have **zero service-area rows anywhere**. Only the fence/carpentry fixture has an East Legon area. This is missing data, not an RLS visibility bug. Do not remove the service-area predicate, infer coverage from a prose address, or backfill provider data without a reviewed factual source. Existing Hire discovery must be inspected for coverage semantics; assistant positive Preview acceptance for Plumbing/Electrical is blocked until valid coverage exists. Isolated rollback fixtures can prove the repair without changing live users.

## Implementation checkpoints

A. This audit and immutable baseline.
B/C/E/G/I. Shared domain concepts, controlled typo matching, structured intent/metric/time plan, parallel source priorities, utility understanding and bounded follow-up context. Preserve Event keyword discovery.
D/F/H. Extend existing authorized RPC retrieval with structured provider categories and database-side review/job/RSVP/newest comparisons; add authorized comments/text fields. Reuse verified-review projection, never legacy seed counts. No embedding infrastructure exists: minimum safe semantic layer is domain concept expansion plus lexical evidence. Future vector adapter must return only authorized IDs and re-fetch current source text under caller RLS before exposure; no global private-text index or embedding jobs in this checkpoint.
J. Grounded answers, clarification actions, privacy-safe diagnostics and regression corpus; full CI; scoped Preview checks after approved deployment. APK 46 installed successfully according to founder terminal; native visual acceptance remains pending and any new UI needs a freshly approved build.

No production changes, Preview writes, communications, identity changes or paid build were performed. No merge or deployment has been claimed.

## Checkpoint B/C/E/G/I — query concepts and source planning

Implemented a reviewable server vocabulary with concept families, stored-category aliases, unique one-edit typo correction, structured comparison metrics, calendar week windows and bounded prior-question inheritance. Provider/Event/Marketplace/alert intents search relevant secondary sources in parallel and prioritize primary records. Tests cover the requested morphology/synonym/typo corpus, metrics and time boundaries; 36 server tests pass. Database comparison execution and UI clarification are deliberately integrated in the following checkpoint, so this intermediate branch must not be deployed alone.

Existing Hire repository lists accepting providers by category without checking `provider_service_areas`; this explains why a provider can appear in Hire while absent from authorized neighborhood assistant retrieval. This upgrade does not silently adopt that weaker coverage inference.

## Checkpoint D/F/H — structured retrieval

Added `20260927040151_assistant_structured_retrieval.sql` (created with Supabase CLI 2.111.0). Extends existing retrieval through one invoker RPC; legacy search delegates to it. Provider categories, current coverage and all existing account/privacy gates precede deterministic verified-review/rating/completed-job ranking and caps. Event RSVP/newest-listing metrics use existing public structured fields; counts/ties describe the complete eligible population. Group descriptions and approved authorized comments are searchable; existing Preview Feed comments are used when that legacy table is present. No new embedding store, private content index, automatic coverage backfill, or feature activation.

37 server tests pass, including PGlite execution of the actual migration with isolated adapter fixtures. Full database/RLS CI is required; local PGlite does not replace it. New rollback SQL fixtures cover missing service areas, full-population comparison, seed-counter exclusion, verified-job eligibility, moderation, ties and grants. Migration remains unapplied; response integration follows separately.
