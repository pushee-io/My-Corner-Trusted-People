# Reviews and messaging — Preview acceptance plan

## Current state — Preview backend enabled

The founder approved the original three migrations and then explicitly approved the missing identity dependency on `opeojxwkwwnnncnsuaag`. All are applied.

| Source migration | Remote version |
| --- | --- |
| `20260923222710_verified_job_reviews.sql` | `20260923231603` |
| `20260923230411_community_notification_center.sql` | `20260923231825` |
| `20260923231722_preview_identity_dependency.sql` | `20260923232606` |
| `20260923224139_private_neighbor_messaging.sql` | `20260923232619` |

All flags are enabled: `verified_job_reviews`, `neighbor_messaging`, `community_notifications`. Supabase MCP assigned remote timestamps; reconcile by name/source rather than blindly reapplying local versions.

Readback verified RLS, denied anon RPC execution and no-session calls, successful authenticated inbox/discovery/review/notification reads, and Realtime publication. The identity table is empty, RLS-protected and unreadable by clients. No legal names were backfilled; names safely display Neighbor until an authorized masked-identity flow populates them.

PR #112 merged with passing Database CI `35933208939` / `35933196241`, including absent-table restoration and repeat invocation. No new security-advisor WARN/ERROR findings; pre-existing baseline findings remain documented.

One approved APK is now complete: version 39/source `d218a15`, EAS `3beca53c-37e2-470d-ae5e-f4a7b55d5d7f`. Download and verification are recorded in `docs/evidence/reviews-messaging-preview-2026-09-23.json`. Install over version 38. Samsung/Pixel Tablet acceptance remains pending; this build approval is consumed. No push/SMS service was activated and no live test messages or reviews were created.

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

## Provider review visibility checkpoint — 2026-09-24

PR #115 fixes the provider-card navigation and replaces the hard-coded provider preview, adds correct review grammar/pagination, and aligns aggregate eligibility with public rows. All CI passed. The clearly fictional Preview review is now present alongside the original review (4.0 average, count 2). See `PROVIDER_REVIEW_VISIBILITY.md`. The new visibility migration is blocked pending exact approval; a corrected APK and phone/tablet retest remain pending. Version 39 does not contain this navigation fix.
