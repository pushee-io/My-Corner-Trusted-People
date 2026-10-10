# Avatar and Marketplace regression checkpoint

Status: implementation and automated validation; device acceptance remains blocked.
Base main: `4ad0f8fb51bd1ab53818bb845989f6d6d28db759` (merged PR #171).
Branch: `codex/avatar-marketplace-regressions`. The PR body records its exact head and CI results.

## Diagnosis before implementation

### Profile picture

The Profile screen conditionally mounts `ParentMediaEditor` only while `useProtectedResource` has profile data. The hook cleared that data on every AppState transition. Opening the system picker therefore unmounted the editor. When its asynchronous selection returned, the composer rejected it with `The media form was closed.` and suppressed the message because that component was unmounted. The selected image never reached upload. A React test using the real screen, resource hook, editor and composer, with native picker/AppState mocked, reproduced the missing Save button on main. This is a component lifecycle reproduction, not a physical Android reproduction.

Both first photos and replacements follow this failing path. Preview logs reviewed for 2026-10-08 22:15–22:45 UTC contain no `begin_media_upload`, `process-media` or `attach_media` call; no server avatar-save error exists in that window. Separate listing-photo uploads succeeded. No assumption was made that Storage returned an error.

The complete existing path is picker → local URI → JPEG normalization (profile maximum 512 pixels, quality .72) → owner-scoped reservation → signed binary upload to private `media-originals` → `process-media` → sanitized private `shared-media` object → `attach_media` updates `media_assets.parent_id` → authorized metadata read and signed URL → avatar rendering. It does **not** update an avatar URL in `profiles`.

Each upload has a new UUID path. Storage upload uses `upsert: false`; replacement atomically removes the previous attachment in `attach_media`. Existing `media_originals_insert` and `media_processed_read` policies authorize the owner reservation and authorized parent read. Both buckets are private and accept JPEG/MP4 with 20 MB bucket limits; the client image limit is stricter. No evidence supports adding Storage UPDATE/SELECT grants or profile UPDATE grants.

Fix: mark an in-flight native media picker in memory, scoped to the media-session revision. Profile and listing-detail resource hooks retain their mounted editor only during that external activity, then refresh authorization without blanking it. Ordinary backgrounding, route departure and account transitions still clear data. Failed authorization removes the editor. Composer drafts also bind to the parent ID.

### Seller public name

Live authenticated database-role checks returned the canonical seller name. The content reference is the listing ID; the resolver returns a profile-ID/name mapping; the repository preserves that mapping in `sellerName`. On main, `MediaAvatar` uses the name only for initials/accessibility. The actual visible seller text was separate, below listing media; card text combined it with availability in a small note. A render test reproduced the disconnected identity layout.

Fix: a shared, presentation-only `PublicIdentity` component places the canonical name next to the avatar on cards, details and buyer rows. No Marketplace-specific name lookup or private name field was introduced. Missing/malformed identity results display `Public name unavailable`; only an explicit canonical `Neighbor` value is treated as the privacy/no-name fallback.

Limitation: the backend/name DTO worked in inspected live data. The precise founder-device claim of a name absent everywhere has not been reproduced on a device; placement is a confirmed UI defect, not proof that no other native issue exists.

### Interested buyer

The interaction is `marketplace_pickup_requests`, with `requester_id`; there is no separate Marketplace interest table. Main loaded it on route focus and after the current user's mutations only. A seller who stayed on the detail page, or returned from another app without a navigation-focus change, did not retrieve a newly created request. Tests reproduced both stale paths. A further test showed the old detail state surviving media-session invalidation.

Live seller-role checks retrieved two existing requests and resolved the selected buyer's approved name; avatar authorization was true. That buyer had no saved profile-photo row. A different old buyer photo had been explicitly removed during the test window. These are legitimate missing-photo states; the patch neither restores removed photos nor invents one.

Fix: use the existing protected resource for focus/foreground refresh, a 15-second focused foreground refresh, manual Refresh interested neighbors, and account/route cancellation. Each refresh also reloads seller/buyer avatar metadata and signed URLs, even if profile IDs are unchanged. Buyer names and available avatars are paired visibly. Private pickup input is cleared when protected data clears. Nonsellers do not render the seller's buyer list; database RLS remains authoritative.

## Backend and privacy

`20261008203711_authorized_content_public_names.sql` from #171 is applied to Preview (`opeojxwkwwnnncnsuaag`); the live migration history version is `20261008215446`, name `authorized_content_public_names`. Function bodies were compared with source during diagnosis. The authenticated wrapper is callable, anonymous execution is denied, and live seller/buyer resolution succeeds.

No new migration, database function, RLS policy, Storage policy, grant, Edge Function or production change is included or deployed. New SQL is rollback-only test code. Public identity still comes from the canonical authorized resolver. No service-role credential enters the client. Membership, private names, exact pickup details and messaging authorization are unchanged. No #171 session startup/navigation/acknowledgement code is reverted.

## Validation

- Before production edits: profile picker-return test failed; four Marketplace tests failed (paired identity, new request refresh, foreground refresh, account-transition clearing). Existing retry/access-failure tests passed.
- Final mobile Jest: **594 tests / 105 suites passed** (13 additional tests versus main).
- TypeScript: passed.
- ESLint: zero errors; 15 existing warnings outside this change.
- Prettier: passed.
- Android Expo export: passed, Hermes bundle `entry-52d221cf29609de462457b70f4055607.hbc`, approximately 4.35 MB. This verifies bundling, not a signed APK or device runtime; no deployment configuration claim is implied.
- Preview `profile_marketplace_identity.sql`: passed all 18 assertions/denial checks. Tests authenticated first attachment, replacement, independent persisted-path reload, buyer linkage, canonical names, avatar metadata/path read, owner-only attachment/storage insertion, rejection of upload-ID reuse, hidden private profiles and hidden unrelated interest lists. The trusted processor's metadata is simulated; binary processing is not covered by this SQL test.
- Rollback verified: zero fixture profiles, media rows or storage objects remain.
- The new SQL suite is registered in `scripts/db-smoke-test.sh` for full clean-database CI. CI results are recorded in the PR.
- Existing transport tests cover upload/processing errors and idempotent retry. New screen tests cover picker return, save retry without re-upload, picker errors, ordinary background clearing, account-change discard, foreground access failure, canonical name/avatar pairing, refreshed avatar URLs and nonseller list hiding.

## Files changed

- `mobile/app/profile/index.tsx`
- `mobile/app/marketplace.tsx`
- `mobile/app/marketplace/listing/[listingId].tsx`
- `mobile/src/hooks/useProtectedResource.ts`
- `mobile/src/lib/media-picker-activity.ts`
- `mobile/src/lib/content-public-names.ts`
- `mobile/src/lib/marketplace-repository.ts`
- `mobile/src/components/PublicIdentity.tsx`
- `mobile/src/components/media/MediaAvatar.tsx`
- `mobile/src/components/media/MediaComposer.tsx`
- `mobile/src/components/media/ParentMediaEditor.tsx`
- `mobile/src/__tests__/profile-avatar-lifecycle.test.ts`
- `mobile/src/__tests__/marketplace-identity-screen.test.ts`
- `mobile/src/__tests__/content-public-names.test.ts`
- `mobile/src/__tests__/neighbor-avatar-batch.test.ts`
- `supabase/tests/profile_marketplace_identity.sql`
- `scripts/db-smoke-test.sh`
- `docs/AVATAR_MARKETPLACE_REGRESSION_CHECKPOINT.md`

## Required acceptance still outstanding

No emulator, adb, connected device or usable Android virtualization exists in this environment. The user's Mac terminal cannot be controlled here. Automated React tests and database role checks are not emulator or real-account acceptance.

1. On an emulator, Account A with no avatar chooses a photo through the real Android picker, saves it, hard-closes/reopens and sees the persisted image.
2. Replace that image; repeat restart and cross-surface checks on Profile, Feed, Marketplace and Messages where authorized.
3. With two actual Preview accounts, give A and B approved public names and saved photos. A creates a listing; B sees A's name and photo and proposes pickup. A sees B's name/photo while remaining on the page, after foreground return and after manual refresh.
4. Verify another neighbor cannot enumerate that pickup list. Compare B's public identity across authorized surfaces.
5. Repeat first/replace/restart and seller/buyer checks on the physical phone. Verify native camera/library behavior, normalization, upload, server processing, signed-image rendering and actual layout. OS destruction of the Android activity is not covered by the mocked lifecycle test.

The checkpoint is **not complete** until these device and real two-account gates pass. APK 52 does not contain this patch. A refreshed installable client is needed for physical confirmation; no native dependency or configuration changed, so this does not by itself require a paid EAS build. First run the emulator/backend gates, then choose an authorized local build or new Preview APK. No paid build, merge or deployment has been started for this regression patch.
