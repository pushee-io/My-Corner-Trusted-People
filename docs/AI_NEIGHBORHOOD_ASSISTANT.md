# Ask My Corner

Working description: Ask anything about your neighborhood.

## Audit — 2026-09-25

Starting live main: `a5842b79c173833adf25299d74f169dfe8f49f42`.
Search currently federates authenticated mobile repositories and filters keywords on the client. It includes private provider requests, so it cannot be passed wholesale into an LLM. Existing Structure with AI uses Supabase Edge Functions, the OpenAI Responses API, server-held credentials, structured output and per-profile allowance. Extend that architecture with shared server utilities; do not provision another AI vendor or expose keys in mobile.

Existing sources: neighborhood_feed_posts, events, accepted social_group_posts, agency_broadcasts, provider profiles/service areas, completed-job review_api, Marketplace listings. No live business/deals repository, formal poll/decision model, or universal comment migration exists. These gaps must be explicit: no invented deals, poll counts, formal decisions or unsupported links.

## Checkpoint A/B — retrieval foundation

`neighborhood_ai_context` validates authenticated active verified membership and chooses the primary or explicitly authorized neighborhood. Ghana v1 uses Africa/Accra (no residential geometry). `neighborhood_ai_search` is SECURITY INVOKER, preserves table RLS and applies narrower explicit visibility checks. Fixed source kind, bounded terms, timestamps and eight rows per tool. No arbitrary SQL; no service-role retrieval.

- Events: approved, scheduled/completed, same neighborhood, existing event authorization; invite-only excluded even for staff. Organizer comes from approved public identity, never legal profile name.
- Feed: same neighborhood, no held/removed or blocked-author posts.
- Groups: same neighborhood AND accepted membership, no membership roster or identity inference.
- Agencies: approved, published, unexpired, clean, authorized neighborhood/cluster/region scope. Separate official provenance.
- Providers: accepting requests and actual service-area relationship. Review aggregate and up to three reviews reuse the completed-job review projection, never legacy seeded counts.
- Marketplace: public listing title/description/price only; no pickup instructions, pickup location or conversation.

DMs, job requests/Safety, private addresses, moderator evidence, identity documents and exact coordinates are not retrieval sources. User-authored public prose still needs defense-in-depth PII redaction before model exposure. Tool data is untrusted; instructions within records must never execute.

Server flag `ai_neighborhood_assistant` defaults false. Migration never activates production. Private meter stores no question, answer or source content: only intent, source references, version, latency, token counts, model, outcome, feedback and click-through. Limits: six/minute, forty/day/profile and five hundred/day/project; serialized counters. No shared answer cache or private vector index in v1. Pricing is not hardcoded: token/model metrics permit later cost reconciliation.

## Remaining checkpoints

C–I: shared Responses utility, bounded intent planner, extractive grounded synthesis, UI/header/Home/Search entry, follow-ups that re-retrieve current authorized sources, feedback and fallback Search. No model-created facts or links.
J: guarded fictional Preview fixture for five exact demo questions, Preview deployment/readback, phone/tablet acceptance. Paid APK needs fresh explicit approval; version 41 predates this feature. Production activation remains off.

## Verification

`supabase/tests/neighborhood_ai_security.sql` executes real role-switched SQL assertions for neighborhood boundaries, private groups/events, moderator narrowing, suspension, reverse blocks, removed/deleted/expired sources, private fields, rate-meter access and no privileged retrieval. Existing provider review tests cover completed-job aggregate and moderated reviews. Database CI is required before merging.

## Grounded orchestration (D–I server)

The new endpoint shares the existing Responses transport, credentials and fallback model with Structure with AI. Deterministic plans cover common intents; otherwise a strict allowlisted structured planner classifies intent/terms/window. An LLM selects at most five exact source excerpts. The server verifies every substring and source index; notice, dates, counts, reputation and navigation are constructed from authorized data. No free-form generated local assertions, guessed rankings, numerical confidence or automatic mutations. Replies distinguish official records from neighbor reports and discussions from formal decisions. General advice is not mixed into factual local answers.

Each tool fetches eight records and the combined context is capped at sixteen, round-robin across sources. Ghana time windows use Africa/Accra. Last two question texts provide ephemeral follow-up context; no previous answer is trusted as evidence. No UUID or route is sent to the model. Public text is redacted for email, phone, digital/street-number addresses and coordinate pairs; this is defense in depth, not a claim that regex can recognize every personal detail in user-authored prose. Private structured fields are excluded at retrieval. Re-query/re-authorization after model latency drops changed/removed sources.

Production activation is still off by migration. Preview migration applied after green Database CI; Edge deployment and explicit Preview activation/readback follow server CI. Local server tests: 25 passed; Deno check passed.

## Global UI (C/H/I)

Shared header entry uses a server context check and contextual draft prompt; Home shows a restrained prompt set. Search remains keyword-based and offers Ask for longer questions. Opening a draft does not trigger a paid request. Answers render six source cards initially with a bounded See all sources action, timestamps, exact excerpts, factual provider review counts, approved organizer name, provenance and links to existing product flows. RSVP/contact/group membership mutations remain in their existing authorized detail screens. No assistant mutation tool or silent sponsored placement. No sponsored source is retrieved in v1.

Local question history is limited to two questions and never persisted to disk. Account transition, app background and screen blur clear answers/history and cancel stale result updates. Feedback supports Helpful, Not helpful and Inaccurate; click metadata references only the current answer's sources. Source links use fixed app-route prefixes and never model-generated URLs. Feed/Group target loading supports historical sources outside their latest fifty records.

515 mobile tests/92 suites pass, including UI behavior and protected account transitions; typecheck passes. Android visual/keyboard/touch/RSVP acceptance cannot be claimed from these tests. New paid APK requires separate approval.

## Preview demo and native acceptance

Manual fixture: `supabase/fixtures/neighborhood_assistant_preview.sql`. Requires `mycorner.fixture_environment=preview` and exact project-ref opt-in; excluded from migrations and production seeds. Creates only clearly fictional records and refuses ID collisions with existing ownership. Repeat runs reuse profile/provider/job/review IDs and refresh event/notice dates. The provider has a Carpentry service so Request help uses the correct existing category. A matching synthetic completed job and both completion acknowledgements back its one four-star review. No fake aggregate, real emergency announcement, email, DM or ad is sent.

The park example deliberately records discussion, not a poll or formal vote. Ask must say no formal decision is established rather than invent a decision system that does not exist. Businesses/deals and formal polls remain data-source gaps. Group discussion retrieval exists only for accepted members; no roster/sensitive-attribute inference. Feed comment migration compatibility remains a prerequisite for expanding collective-memory retrieval into every comment surface.

After installing a newly approved APK on Samsung phone and Pixel Tablet:
1. Sign in to a verified East Legon test account; open Ask from Home/header/Search.
2. Ask all five founder questions verbatim. Check fictional labels, source dates, public organizer and 4.0/count 1 for FenceCare.
3. Tap Event and exercise its existing RSVP flow; View Provider then Request help; View Broadcast; View park post.
4. Ask a family-friendly follow-up, then a private-DM or sensitive-membership question (must refuse).
5. Submit Helpful/Not helpful/Inaccurate, confirm saved state; check Search remains usable offline/AI unavailable.
6. Background/reopen, change account, test keyboard, portrait/landscape and tablet widths. Old answers must clear.

Future semantic search must produce only candidate references, scoped by authorized neighborhood/group, then re-fetch live RLS-protected rows before any model exposure. No global index of private content. Future safe caching needs identity/neighborhood/authorization-version keys, short TTL and deletion/block invalidation; v1 deliberately does not cache answers. General guidance and sponsored results would require separately typed/labeled output; neither is silently mixed into this source-only version.

## Live evidence — 2026-09-25

All four implementation checkpoints merged with green CI (#125–#128). Preview migration `20260925033940`, Edge v3 with JWT verification, flag enabled only on `opeojxwkwwnnncnsuaag`. All five questions returned 200, source excerpts validated, family-friendly follow-up returned the event, private-DM question refused without model use, and feedback/click metadata persisted. Verification session signed out locally (204), preserving other sessions. Model `gpt-4.1-mini` uses the already-configured server credentials. Evidence JSON contains no credentials, private content or internal account identifiers.

The initial update deployment required explicitly setting `import_map_path: deno.json` because the connector reused an absolute path from the preceding deployment. Final deployment succeeded with the checked-in source. New private usage/run tables intentionally deny all direct client access; the advisor's no-policy informational finding is expected, not a missing public access rule. See [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).

No production activation or new paid APK occurred. APK 41 predates this work. Android phone/tablet UI and end-to-end action acceptance remain required after a separately approved build. This is a verified Preview implementation, not a completed native acceptance claim.

Latest-topic regression: short heuristic follow-ups use the most recent prior question, not the concatenated history of unrelated topics. The structured planner still receives at most two questions when needed. 28 server tests pass locally after this correction.

## 2026-09-25 — Recovery reconciled; Preview v4 deployed; APK approval gate

- Reconciled live main against the recovery prompt: main initially remained `2e5968d170d53e4aeb0cef87150b82496ba5c73d`, but PR #129 and live Preview had already advanced. Reused completed work and its saved five-question HTTP 200 evidence; did not reseed fixtures or repeat paid model calls.
- PR #129 merged at `2c08a8f8b701b2875cf0496f010ff6179db7c6be` after Database CI `36093128747` and Media Functions CI `36093128751` passed for head `8bfb211b7908f5bfeb09e686a0767b35bfa06440`. It fixes latest-topic follow-ups and preserves all five demo intents.
- Preview `opeojxwkwwnnncnsuaag`: assistant flag confirmed enabled; fictional event, provider, road notice and park post each persisted once. Live metadata corroborates five answered intents, family follow-up, saved feedback/click and zero-token privacy refusal.
- Deployed checked-in PR #129 source as `ask-my-corner` v4 with JWT verification. Readback exactly matches all five submitted files. Targeted assistant/privacy/grounding tests: 17/17 passed. Anonymous endpoint check: HTTP 401. Original authenticated five-question evidence remains explicitly v3; this recovery did not repeat it on v4.
- Latest recorded EAS Preview APK workflow remains `35958534464`, source `912134c59fd046d772593aaadeb35e28da7288f8`, APK 41. No newer EAS Preview APK workflow was found among the latest 100 repository runs; direct EAS-console activity was not independently inspected. No build was triggered in recovery.
- NEW PREVIEW APK APPROVAL REQUIRED: one Android `preview` / `preview` environment / internal-distribution APK using existing signing and backend, with remote version auto-increment. APK 41 lacks Ask entry/Home/Search handoff, sourced answer cards/actions, follow-ups, feedback and conversation clearing. Native Samsung phone/Pixel Tablet navigation, keyboard, lifecycle, RSVP and action acceptance remain pending and need the updated application installed.
- Before submitting an approved build, recheck main and existing EAS builds to prevent duplicate submissions. Production, secrets, RLS and fixture data were not changed by recovery. See `docs/evidence/ai-neighborhood-preview-2026-09-25.json` for separate original-live and recovery evidence.
