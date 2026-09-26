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

## 2026-09-26 — Three repairs merged; Preview deployment blocked by approval review

- Implemented in order and merged after green checks: keyword PR #136 (`249d17f`), Messages PR #137 (`fb296d6`), Home PR #138 (`8ae3c57635b8b1f08ef5feb47f6f92447a0bab51`). Source of truth was freshly fetched GitHub main; no failed-session state was recovered. Each checkpoint includes tests and durable documentation.
- CI: #136 Database `36205768702` / server `36205768747`; #137 Database `36206086649` / Mobile `36206086625`; #138 Mobile `36206349039`, including web bundle. All passed. Local final mobile **535 tests / 94 suites**, server **31 tests**, typecheck/Deno check/format/diff review pass; lint **0 errors / 15 existing warnings**.
- Automatic approval review **rejected** applying `20260926003542_keyword_discovery.sql` and `20260926004155_messaging_public_display_name.sql` to Preview `opeojxwkwwnnncnsuaag`: persistent live schema/function/privilege changes need explicit approval for that target and those migrations. No workaround was used. Readback confirms neither migration is applied. Edge deployment was not attempted because it depends on the keyword migration. Existing deployed assistant is version 5; all five files matched the handoff GitHub source exactly before any deployment attempt.
- Exact next approval: apply those two committed migrations to Preview `opeojxwkwwnnncnsuaag`, then deploy the merged `ask-my-corner` source there with JWT verification retained and run scoped Preview retrieval/public-name checks. This does **not** include production or a paid EAS build. No production, user identity data, secrets, flags or paid build were changed.
- Public-name root cause: 17 Preview profiles, only one populated public identity. Existing approved names are retained; an account without an approved public name legitimately remains Neighbor until its user saves one through the new Profile/Messages public-name editor. Never copy private legal identity or `profiles.display_name` as a shortcut. Inbox/thread name resolution stays in one RPC; avatars are batched.
- APK 44 predates the Home collapse and public-name editor. Native phone/tablet visual/accessibility acceptance remains pending a future separately approved build. Do not claim deployed/live correction or native acceptance yet. Evidence: `docs/evidence/keyword-messages-home-2026-09-26.json`.

## 2026-09-26 — General keyword discovery repair

- Root cause: deterministic “happening” intent discarded topic terms before an eight-event chronological cap; model terms used AND/phrase-sensitive websearch with no prefix matching. Preserve topics, search short keyword requests across authorized source families, normalize English lexemes and use OR prefix recall with relevance ordering before the existing limit. No Festival-specific rules. Events expose title/description (no category column); provider service labels/categories remain searchable.
- Added festival/festivals/question/racing/pig/music/food/food-drive, prefix/ranking and result-cap regressions. Existing authorization, RLS, date, block, removed-content, grounding and reauthorization gates remain unchanged.
- Local: 31 server tests including real PostgreSQL keyword checks; 23 targeted mobile assistant/Search tests; mobile typecheck passes; lint zero errors/15 baseline warnings. Database and server CI are merge gates. Migration and Edge code are checked in only; Preview/production are not deployed and APK 44 predates the repairs. No paid build.

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
