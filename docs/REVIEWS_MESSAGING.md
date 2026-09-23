# Verified reviews and private neighbor messaging

## Audit — 2026-09-23

Base main: ecb7811054cb61ff174a159e40a1bf1929171c78. Open PRs 39, 42, 45, 53, 54, 96 are older checkpoints and do not implement this feature set.

| Area | Existing / partial | Reuse and extend |
| --- | --- | --- |
| Reviews | `reviews` table, provider display counters; no submission/read policy, zero Preview review rows | Completed request plus two-party Job Safety completion; curated public output |
| Chat | Marketplace conversations/messages and a request-specific screen | Extend the same stores and keep old Marketplace routes working |
| Realtime | Feed publication/subscriptions; chat only loads on focus | Participant-authorized messaging changes plus focus/foreground/reconnect refresh |
| Notifications | `notifications`, `domain_event_outbox` | Generic in-app notices and metadata-only outbox events; no real push activation |
| Privacy | Masked identity, verified membership, blocks, moderation | No legal-name fallback; participant RLS; report-scoped evidence |

## Review policy

- One verified review per completed job. Require both requester and provider Job Safety completion acknowledgements, not a client-supplied status alone.
- Required 1–5 stars, title 3–100 characters, body 10–2000 characters, recommendation yes/no. Guidance is optional, not a burden of extra required fields.
- Public projection has masked public author or `Neighbor`, text, stars, dates and a verified-job label. It never returns requester ID, job ID, legal name, address, phone or private safety data.
- Plain text only; potential contact details go under review. Negative ratings alone do not trigger removal. Reports create a moderation case without automatically hiding the review.
- Edit within seven days until provider response or moderation hold; retain prior versions in a private table. Provider gets one response, separately moderatable.
- Honest published verified average/count. Recommendation percentage is omitted below five reviews to avoid a misleading tiny sample. This is presentation policy, not a Top Rated threshold. No purchasable badge or hidden trust score.
- Server analytics/audit metadata never contains review/message body; private version history is distinct from analytics. No repeated prompt reminders in this checkpoint.

## Rollout and verification

Backend feature defaults off. Automatic approval review rejected migration application to `opeojxwkwwnnncnsuaag`, classifying it as a live target without explicit approval of the schema and privilege changes. No backend change was applied. Isolated Database CI is the safe verification route; deployment remains a concrete approval gate after implementation.

The existing APK remains version 38/source `2e3f991`. No paid build is authorized by this directive. Samsung phone and Pixel Tablet emulator acceptance cannot be claimed from SQL or unit tests.

## Checkpoints

1. Review data/security and moderation RPCs: PR #106 merged; isolated Database CI passed.
2. Review form, provider reputation, response/moderation UI: PR #107 merged; 453 mobile tests, typecheck, web export and Mobile CI pass. Native acceptance pending.
3. Extend Marketplace messaging foundation for neighbors: PR #108 merged; isolated security CI passed.
4. Inbox, realtime thread, unread/block/report, notifications and profile entry: PR #109 merged; 462 tests/typecheck/web export and Mobile CI passed.
5. Unified notifications and acceptance/security coverage: PR #110 merged; Database/Mobile CI passed.
6. Preview demo and two-device acceptance: deployment/build/device gates pending.

References: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Realtime Postgres changes](https://supabase.com/docs/guides/realtime/postgres-changes). Current changelog reviewed; no relevant API breaking change identified.

## Messaging policy and verification

Verified, current neighbors in a shared neighborhood can discover and initiate with eligible opted-in peers. One conversation per neighbor pair; existing Marketplace request threads reuse the same message store and UI. Blocks and suspension apply to direct legacy inserts as well as the RPC. Initiations are limited to 10/day; sends to 30/minute and 500/day.

Participants read their own conversation history. Moderators cannot browse arbitrary threads; an explicit report shares either one selected incoming message or the latest ten messages. The moderation queue exposes only that snapshot. No message text enters audit analytics or notification payloads.

Realtime payloads only invalidate authorized reads; the UI does not append payload content. A 10-second foreground poll covers interruptions. Sending/Sent/Failed reflects server acknowledgement; no delivered/read receipt is claimed. Retry preserves a nonce and cannot duplicate a committed message. Sign-out removes subscriptions and data; route/account keys reset drafts.

Text messaging ships first. Media is deferred: current storage parent authorization does not include conversations, so attachment support needs participant-scoped media policies before enabling it. Push delivery remains off; generic in-app notices and outbox events are ready for a separately approved delivery worker.

## Unified notification center

`notification_api` projects existing notifications and due recipient-addressed domain events into the same center. Existing message/review notification events are deduplicated by producer kind. Read state for outbox events is separate from worker delivery status. Raw outbox payloads, organizer-written reminder text, job descriptions, legal names and safety location never enter this projection.

New Hire/Job Safety emitters use the existing queue and are gated by `community_notifications` (default off). Existing Event invitation/reminder/cancellation producers already write the outbox; their updates appear when due. The center also recognizes Group, comment/reply, Marketplace and Agency Broadcast domain kinds; connecting additional producers remains future work, with recipient authorization required at production time. No public topic fan-out or private membership inference is introduced.

A future restrained review reminder should use the same recipient-addressed outbox with one deduplicated job/reminder event, notification preferences and a check that no review exists at delivery time. No repeating reminders or scheduler were enabled.

## Final verification record

Feature main `636345a5e78a349fa9c2b7dfd36643f4f3c10ccd` includes PRs #106–#110. Final source `c53aac61a67fa57832af113955b4dfc9525940e3` passed Database CI runs `35932095087` / `35932086760` and Mobile CI runs `35932095029` / `35932086796`. Mobile: 463 tests across 87 suites, typecheck, formatting, dependency compatibility, lint (zero errors/15 baseline warnings), web export. Database: authenticated requester/provider/outsider/moderator checks, duplicate/eligibility/privacy/blocks/suspension/unread/moderation, rate-limit and preference boundaries, recipient-only generic notifications, future reminder exclusion and independent read/delivery state.

No migration or live feature flag was applied; no new APK or native test was run. See [Preview acceptance and rollout gates](REVIEWS_MESSAGING_DEMO.md).

## Preview deployment update

Founder approval allowed the three original migrations/flags. Reviews and notification schema applied; messaging rolled back because the older Preview compatibility schema has no identity table. Notification flag is on, review flag remains off, neighbor flag is absent. Additional migration `20260923231722_preview_identity_dependency.sql` restores that missing repository foundation with deny-all client access but was rejected by automatic approval review as outside the explicit three-migration approval. It is prepared and unapplied pending separate approval. See the current deployment table in `REVIEWS_MESSAGING_DEMO.md`.

Readback confirmed public RPCs use invoker security and deny anon execution; review/control/history/notification/outbox stores have RLS. Notification API rejects no-session calls and returns an array for an authenticated account without exposing data in verification output. Advisors added only expected INFO notices for two deny-all private tables; pre-existing warnings/errors are unchanged. Baseline remediation: [RLS](https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public), [function search paths](https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable), [public extensions](https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public), [anonymous definer execution](https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable), [authenticated definer execution](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable), [password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## 2026-09-23 — Preview reviews, messaging and notifications enabled

- Founder explicitly approved `20260923231722_preview_identity_dependency.sql` on `opeojxwkwwnnncnsuaag`. Applied as remote version `20260923232606`; messaging applied as `20260923232619`. Earlier reviews and notifications remain applied as `20260923231603` and `20260923231825`.
- All three flags are now true: `verified_job_reviews`, `neighbor_messaging`, `community_notifications`. No remaining database deployment approval gate for this feature set.
- Verified RLS, denied anonymous RPC execution/no-session access, invoker public RPCs, authenticated inbox/discovery/review/notification reads, and messaging Realtime publication. Identity table is empty and client-unreadable; names safely fall back to Neighbor. No real identity data was created.
- Compatibility PR #112 merged at `6347985f609e2c45da8d42c0727fe0ebd08a1478`, with passing Database CI `35933208939` / `35933196241`. Security advisor WARN/ERROR findings remain unchanged from baseline; deny-all INFO notices are expected.
- Next gate: separately approved new APK and Samsung/Pixel Tablet acceptance. Current version 38 lacks these new screens. No new build, live test messages/reviews, push/SMS or native acceptance claimed.
