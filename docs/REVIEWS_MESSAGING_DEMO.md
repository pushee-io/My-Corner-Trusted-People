# Reviews and messaging — Preview acceptance plan

## Current gate — approved rollout partially applied

The founder explicitly approved the three original migrations and their Preview flags on `opeojxwkwwnnncnsuaag`.

| Change | Current state |
| --- | --- |
| `20260923222710_verified_job_reviews.sql` | Applied as remote version `20260923231603`; feature remains off because identity dependency is absent |
| `20260923224139_private_neighbor_messaging.sql` | Rolled back: missing `public.private_identity_profiles`; feature not provisioned |
| `20260923230411_community_notification_center.sql` | Applied as remote version `20260923231825`; `community_notifications=true` |
| `20260923231722_preview_identity_dependency.sql` | Prepared, UNAPPLIED: automatic approval review requires explicit approval for this additional sensitive-schema migration |

The fourth migration restores the existing repository's identity table only when missing, with an empty table, RLS, and all client access revoked. It adds no real identity data and does not expose legal names. Existing names will safely show `Neighbor` until an authorized masked-identity flow populates records. It leaves existing identity installations unchanged.

After explicit approval of this compatibility migration on the same project, apply it, retry the original messaging migration once, verify grants/RLS/RPCs, then enable `verified_job_reviews` and `neighbor_messaging`. Do not reapply the already successful review/notification migrations. Supabase MCP assigns remote migration timestamps; match names and recorded source content when reconciling history.

New paid APK approval and Samsung/Pixel Tablet acceptance are still pending. Existing APK version 38 lacks the new interface. No push/SMS service was activated.

## Isolated fixtures and test evidence

`supabase/tests/verified_job_reviews.sql`, `private_neighbor_messaging.sql` and `community_notifications.sql` create transaction-local synthetic requester/provider/neighbor/outsider/moderator data and roll back. Database CI runs actual authenticated-role RLS/RPC checks. These are reproducible test fixtures, not live ratings or real-user activity. Never present fabricated demo reviews as organic production reputation.

For the device walkthrough, use existing authorized Preview accounts: requester A, provider B, unrelated neighborhood C, and scoped moderator D. A and B need current verified membership in the same Preview neighborhood for neighbor discovery. Keep the moderator session separate. Reset only explicitly synthetic demo data through an approved setup path.

## Samsung phone + Pixel Tablet walkthrough (pending)

1. On A's phone, select provider B and submit a Hire request. On B's tablet, accept it. Complete the existing Job Safety flow with both parties acknowledging completion. Verify a merely Submitted or one-party-completed job has no valid review submission.
2. A sees the actual business name and Review your provider. Submit a 4-star title/body/recommendation using conduct, communication and work guidance. Confirm Verified Job, one review, correct average/count, masked author, no exact address/legal identity. Recommendation percentage remains absent below five published reviews.
3. Retry submission: no duplicate. Edit within seven days before a reply; verify updated reputation. B replies once; A cannot edit afterward. C cannot review A's job. Report a review: it remains visible until moderator action. Hold/remove/restore through D and verify aggregates and public content.
4. A opens Neighborhood → eligible B profile → Message. Both devices keep their thread open. Exchange multiline text in both directions without navigation/restart. Confirm chronological times, own/peer bubbles, inbox ordering, unread badge and read clearing.
5. Disable networking, send, confirm Failed and retry the same message after reconnecting. Confirm one stored message and one notification. Background/foreground each device, then sign out and switch accounts; previous thread/draft/media must not reappear.
6. B blocks A. Verify A sees a generic unavailable state and cannot send through UI or direct API. Unblock, test neighbor-message opt-out, and verify unrelated C cannot discover/read the pair. Suspension stops account reads/sends. Verify quota boundaries in isolated SQL tests, not by spamming live accounts.
7. Report one incoming message, then a conversation with explicit latest-ten-message consent. D sees only submitted evidence, cannot open unrelated threads, can remove the selected message/suspend the reported account. Removed body disappears on participant refresh.
8. Verify Messages and Notifications header access, existing Marketplace pickup-thread entry, privacy preferences, My Activity, and provider reputation on both screen sizes. Notification preference opt-out suppresses new message/review notices; unread messages still count.
9. Trigger Hire/Job Safety updates and an authorized due Event notice. Confirm correct recipient, generic content, participant-specific Hire route, no early scheduled reminder, and read acknowledgement does not mark push delivery complete.
10. Capture phone/tablet results and screenshots with synthetic data only. Review logs for authorization errors, crashes and realtime reconnect behavior. Mark pass/fail per step; do not claim acceptance until both devices pass.

## Scope boundaries

Text DM first; media attachments require conversation-scoped storage authorization. No delivered/read receipts, E2EE claim, hidden trust score, purchasable Top Rated badge, real push activation or repeated review reminder. Group/comment/Marketplace/Agency notification categories are supported by the shared center; producers not already writing the outbox need future integration.
