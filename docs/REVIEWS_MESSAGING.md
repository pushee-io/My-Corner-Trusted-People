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

1. Review data/security and moderation RPCs: implementation in progress; isolated CI pending.
2. Review form, provider reputation, response/moderation UI: pending.
3. Extend Marketplace messaging foundation for neighbors: pending.
4. Inbox, realtime thread, unread/block/report, notifications and profile entry: pending.
5. Preview demo and two-device acceptance: deployment/build/device gates pending.

References: [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [Realtime Postgres changes](https://supabase.com/docs/guides/realtime/postgres-changes). Current changelog reviewed; no relevant API breaking change identified.
