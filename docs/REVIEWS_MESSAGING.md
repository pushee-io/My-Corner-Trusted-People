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
4. Inbox, realtime thread, unread/block/report, notifications and profile entry: implemented; 462 tests/typecheck/web export pass, Mobile CI pending.
5. Preview demo and two-device acceptance: deployment/build/device gates pending.

References: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Realtime Postgres changes](https://supabase.com/docs/guides/realtime/postgres-changes). Current changelog reviewed; no relevant API breaking change identified.

## Messaging policy and verification

Verified, current neighbors in a shared neighborhood can discover and initiate with eligible opted-in peers. One conversation per neighbor pair; existing Marketplace request threads reuse the same message store and UI. Blocks and suspension apply to direct legacy inserts as well as the RPC. Initiations are limited to 10/day; sends to 30/minute and 500/day.

Participants read their own conversation history. Moderators cannot browse arbitrary threads; an explicit report shares either one selected incoming message or the latest ten messages. The moderation queue exposes only that snapshot. No message text enters audit analytics or notification payloads.

Realtime payloads only invalidate authorized reads; the UI does not append payload content. A 10-second foreground poll covers interruptions. Sending/Sent/Failed reflects server acknowledgement; no delivered/read receipt is claimed. Retry preserves a nonce and cannot duplicate a committed message. Sign-out removes subscriptions and data; route/account keys reset drafts.

Text messaging ships first. Media is deferred: current storage parent authorization does not include conversations, so attachment support needs participant-scoped media policies before enabling it. Push delivery remains off; generic in-app notices and outbox events are ready for a separately approved delivery worker.
