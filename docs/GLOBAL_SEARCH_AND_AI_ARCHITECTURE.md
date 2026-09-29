## 2026-09-28 — evidence diagnostics

Evidence-validation failures now have a fixed reason enum in source. Logs include only this enum plus the existing bounded stage/intent/provider count. No model response, quote, question or identity is logged. Exact-substring validation, final authorization and deterministic fallback remain unchanged. This source instrumentation is not yet deployed. See `PREVIEW_RELIABILITY_VERIFICATION.md`.

## 2026-09-28 — approved canonical backend deployed to Preview

**Deployment completed:** Preview `opeojxwkwwnnncnsuaag` only. Exact approved `20260928213631_canonical_neighborhood_search.sql` applied (SHA256 `9216c91a9d054ea23fe63bb9786bded3c486557ad989f96f9f3a51630b15050b`). Supabase MCP recorded remote version **20260928222337**, name **canonical_neighborhood_search**; this is the approved migration, not an additional migration. Do not reapply based on the different application timestamp.

**Function:** merged #157 eight-file bundle deployed from main `29908d35761ffd19195716c4b6aa9bd64c1158f5` as **ask-my-corner v12 ACTIVE / JWT verification true**. All eight live files match source byte-for-byte. Bundle SHA256 `bc39416259f8f9f5acaf033df4033a77df21e71345c337d5b172592722b49940`. #155 recovery is now included in the deployed source.

**Verified:** canonical context/retrieval/quota RPCs exist; Search/AI retrieval and Hire catalog are SECURITY INVOKER; all new functions have fixed search paths; anonymous execution denied; clients cannot call the private quota clock; unauthenticated function HTTP request returns **401 UNAUTHORIZED_NO_AUTH_HEADER**. Prior source/CI validation remains 563 mobile tests / 100 suites, 64 server tests, Database/RLS, Mobile/server CI and Android/web bundles passed.

**Authenticated acceptance remains blocked:** automatic approval review rejected the read-only profile seed-key lookup used to locate the demo requester, citing private identifier discovery beyond the approved verification. No workaround, identifier extraction or impersonated verification was attempted afterward. A normal signed-in Preview test-account session is needed for live retrieval, quota and privacy acceptance; founder retains the password. Do not claim these checks passed. Existing baseline SQL counts predate this deployment.

Security advisors reviewed: the new authenticated-only quota status SECURITY DEFINER wrapper is intentional, validates active account and verified membership, and exposes no adjustable clock. Other notices concern objects unchanged by this migration, including PostGIS/spatial_ref_sys, existing function grants/search paths, deny-by-default RLS tables and Auth password configuration. No unrelated configuration changed. See sanitized `docs/evidence/canonical-preview-deployment-2026-09-28.json` for notice categories and remediation links.

**Next:** sign into the authorized Preview requester normally and verify plumber / most-reviewed plumber / electrician / festival / private-message refusal, source actions and quota/reset status. A current-source client is needed to accept the new Basic Search/quota/comment UI. APK50 predates those changes; no new build until backend acceptance and a separate build approval. Physical phone/Pixel Tablet acceptance and VC readiness remain pending.

No production changes, quota reset/increase, identity backfill, secret changes, real communications or paid APK build occurred.

# Canonical neighborhood intelligence

Release source: #157 merged to main as `2136aac68d03cceb7774dce209e6f3520956ef08`, tested integration `02962a70526264bcea39634510701e456e16e445`. Prepared and tested; new Preview deployment and native acceptance are still gated. Dependency reconciliation is in `SEARCH_RELIABILITY_PR_MAP.md`.

## One retrieval platform

`supabase/functions/_shared/neighborhood-search.ts` supplies the registry, deterministic plan, topic checks and RPC orchestration to both Basic Search and Ask. It reuses `neighborhood-concepts.ts` and `neighborhood-assistant.ts`; Metro watches this pure shared directory. No SDK credentials, server entry point or secret is imported into mobile. Android and web bundle checks verify resolution. The old independent literal Search factory has been removed.

| Stage | Contract |
|---|---|
| Query | Bounded text; privacy refusal; Unicode normalization, service concepts, morphology/prefix matching and controlled one-edit concept correction |
| Intent | Deterministic source priorities, date window, category, comparison metric and bounded follow-up/provider reference |
| Context | `neighborhood_search_context`: active authenticated caller and verified selected/primary neighborhood; independent of AI flag and quota |
| Retrieval | `neighborhood_search_retrieve`: fixed six-family allowlist, SECURITY INVOKER, existing RLS and explicit source policy, relevance/date ordering before eight-item family caps |
| Provider eligibility | `private.neighborhood_provider_eligible`: accepting, active/unblocked account and explicit authorized neighborhood coverage; reused by both Hire adapters via `neighborhood_provider_catalog` |
| Reviews | Scoped `private.neighborhood_review_summary`: confirmed completed-job reviews, clean moderation, allowed author, public review fields only; rank matching reviews before a three-review cap; no job details are returned |
| Output | Narrow public projection, redaction, validated routes, clear source labels; up to 48 initial sources; AI cards capped at 16 with an explicit Show all control |
| AI | Optional bounded Responses evidence selection with eight-second timeout; quotes must be exact source excerpts. Failure/invalid output preserves deterministic cards and discloses unavailable explanation |
| Reauthorization | AI rechecks every returned source after model latency and final context; Search rechecks context. Unknown/auth failures fail closed; only explicitly transient family failures allow disclosed partial results |

Basic Search never calls OpenAI or meters AI usage. Search and AI use the same deterministic authorized candidate set; presentation limits and optional quoted excerpts differ. Hire enumerates the same eligible provider population by category. Its stale cross-account category cache is removed and the screen uses protected focus/session refresh.

## Source policies

| Family | Included | Excluded |
|---|---|---|
| Providers/reviews | Explicit service coverage, public business fields, verified average/count/completed jobs, bounded public review evidence | Legal identity, private jobs/safety/session information, arbitrary stored rating counters as comparison evidence |
| Feed | Visible neighborhood posts and allowed matching comments | Blocked authors, moderated/private content, unverified neighborhoods |
| Groups | Visible accepted-member groups and discussions/comments | Unauthorized membership, inaccessible groups or removed/blocked content |
| Events | Approved accessible Events with applicable dates and existing visibility rules | Invite-only/private Events, outside scope, date-inapplicable records |
| Marketplace | Visible listing title/description/price | Exact pickup location, private seller data |
| Agency | Approved/current notices in authorized neighborhood/cluster/region | Unapproved, expired or future notices |

DMs, addresses/GPS, moderation evidence and legal names are never source adapters. Business/deals and neighbor-profile discovery remain unavailable until implemented with explicit policies. Existing approved public display names are preserved; there is no identity backfill.

## Comparisons and relevance

Verified count, verified average rating, confirmed completed jobs, Event RSVP count and newest listing are SQL metrics computed over the full eligible population before truncation. Ties and zero-review cases are explicit. “Most rated” means highest verified average rating; “most reviews” means verified review count. Availability is always provider stated, never inferred booking availability. Closest does not invent distance from a general area.

Outage phrase constraints apply before the caps to Feed, Groups, Agency, Events and Marketplace. Lighting/festival content cannot qualify merely because an OR keyword overlaps. Provider query terms remain topical when searching supporting content, preventing generic help/wedding/hair overlaps. Model output cannot redefine a metric winner, add a source or become a new local fact.

## Server quota

Limits are unchanged: 40 questions per account per UTC calendar day, six per minute and 500 per shared Preview UTC day. This is not a rolling 24-hour quota. Failed admitted requests still count under the existing policy.

`neighborhood_ai_quota_status` is a read-only, caller-scoped status RPC returning limit, used, remaining, percent, `window_type`, `window_start`, `reset_at`, `blocked_scope`, `retry_at` and `server_time`. The meter returns the same status after admission and includes it with a 54000/HTTP429 refusal. Old stored daily rows are interpreted as zero after reset; no client reset or clock-control capability is granted. The meter's existing advisory/user locks preserve atomic limits.

The client refreshes status on focus, active-account changes, after requests, periodically while active and at reset. It warns at 80%, shows an exact local reset date/time at exhaustion and keeps Search available. Minute throttling, shared Preview exhaustion and service unavailability have distinct messages. No limits were increased and no Preview quota was reset.

## Interaction and diagnostics

Search and AI pills are explicit. Search/Enter/AI actions blur the input and dismiss the keyboard. Comments clear and blur on successful submission, retain drafts on failure/close, close on backdrop tap even with focused input, keep inside taps inside, and process Android Back as keyboard then comments then route. Drafts remain screen/account scoped.

Logs contain fixed stage labels, source-family counts and bounded token/timing metadata. They do not contain questions, source prose, auth IDs, emails, tokens or upstream error bodies. Existing v10 did not record the exact exception for the observed 503s; successful retrieval and model use are proven, but the precise exception must not be invented.

## Deployment gate

One new migration: `20260928213631_canonical_neighborhood_search.sql` (SHA256 `9216c91a9d054ea23fe63bb9786bded3c486557ad989f96f9f3a51630b15050b`). It creates/replaces functions only; no destructive data migration, coverage mutation, feature activation or quota reset. Deploy the tested integrated `ask-my-corner` bundle afterward, retaining JWT verification, to Preview `opeojxwkwwnnncnsuaag` only after consolidated founder approval.

Authenticated Preview HTTP acceptance must follow deployment. Database role tests and local bundles are not device acceptance. APK50 predates this client work; no new APK is authorized by this checkpoint. Phone and Pixel Tablet acceptance and VC-demo readiness remain pending.

Live recheck at checkpoint: Preview v11 is JWT verified and byte-identical across all seven files to baseline v10/#152. Its version advanced externally at 2026-09-28T22:07:46Z; neither the new migration nor canonical RPCs exist yet. No deployment was performed by this session.
