# Reviews and messaging — Preview acceptance plan

## Current gate

Implementation is reviewable in merged checkpoint PRs. Backend deployment was rejected by automatic approval review because the connected project was classified as live. No migration, flag, push service or paid APK was applied/launched. Existing APK version 38 does not contain these changes. SQL and mobile tests are not a substitute for native acceptance.

Exact proposed Preview target: `opeojxwkwwnnncnsuaag` (the backend used by the established Preview APK). Do not switch to another project as a workaround.

Pending migrations, in order:

1. `20260923222710_verified_job_reviews.sql`
2. `20260923224139_private_neighbor_messaging.sql`
3. `20260923230411_community_notification_center.sql`

After explicit target/schema approval, apply via the normal migration path, verify metadata/RLS, then enable `verified_job_reviews`, `neighbor_messaging`, and `community_notifications` only on that approved Preview project. A new paid APK requires separate explicit approval. Do not activate production or real push/SMS.

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
