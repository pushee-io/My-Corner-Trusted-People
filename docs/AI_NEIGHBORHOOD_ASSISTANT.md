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
