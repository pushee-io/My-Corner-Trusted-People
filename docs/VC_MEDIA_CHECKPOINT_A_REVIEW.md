## 2026-09-18 — Foundation review repairs

This checkpoint supersedes earlier next-action statements. Keep PR #102 draft; product-screen integration remains pending.

- **Private viewer:** an expanded photo closes immediately when its authorization refresh starts. The viewer must match the current account, parent, authorization check and readable asset list. Removed assets, failed refreshes and late responses cannot preserve or reopen the previous photo. An expired-URL lookup that finds lost access also clears stale thumbnails.
- **Upload retry:** an owner reservation reuses the same asset ID and immutable object paths. A specific Storage 400/409 duplicate response while signing an upload resumes processing instead of blocking retry. Videos can resume with the missing poster. Uploads explicitly remain non-upserting; permission errors, unrelated conflicts and account changes still fail.
- Added five real-React gallery regressions and seven transport regressions. Against review head `dc1518d`, eight tests failed and eleven passed in the two focused suites; after repair all 19 pass. These are component/transport tests with mocked native services, not device acceptance.
- Local verification: 76 mobile suites / 388 tests passed; TypeScript and formatting passed; lint has zero errors and the same 15 baseline warnings. The new renderer dependencies are development-only. Check CI on the latest published PR head before progressing.
- The earlier 22 Preview HTTP assertions remain service evidence from the previous checkpoint; they did not exercise the newly repaired client retry preflight. No new Preview mutation, flag activation or APK build accompanies these client repairs.
- Next: re-review these repairs and their CI before choosing a first product surface. Native media behavior, full parent-submit retry/text preservation and maximum-size/low-end performance remain acceptance work.

## 2026-09-18 — Media cleanup and Preview service verification

This checkpoint supersedes earlier media deployment/cleanup status.

- Draft PR #102 now adds durable Storage API cleanup for removal/replacement, failed or abandoned uploads, deleted parents, and deleted profiles. A worker authenticated by expiring, single-use tickets runs every five minutes; failures retry under leased queue entries.
- Preview `opeojxwkwwnnncnsuaag` received the foundation, cleanup, and scheduling migrations plus `process-media` and `cleanup-media`. Repository migration filenames match the versions recorded by deployment; remote history was preserved.
- All 22 authenticated HTTP assertions passed with fictional media and two temporary identities: upload, retry, processing, metadata removal, parent attachment, cross-account denial, malformed input, immediate read denial after removal, and worker authentication.
- Storage API cleanup completed eight jobs covering four stored objects; no test objects remained. Only fixture job eligibility was accelerated. The real signed-upload/processing retention windows remain intact.
- Temporary accounts, profiles, neighborhood and post were removed. `shared_media_uploads` is off. Delayed deletion receipts remain to catch any late signed PUTs.
- Local checks: 75 mobile suites / 376 tests; six server/PostgreSQL tests; TypeScript and Deno passed. Lint has zero errors and 15 baseline warnings. Latest PR CI remains the merge gate.
- Product screens remain disconnected. No APK was built. Next: review this checkpoint and its CI, then integrate one surface with parent-submit retry/text-preservation tests. Maximum-size/low-end-device performance and native picker/playback/cache behavior remain acceptance gates.
- Evidence: `docs/VC_MEDIA_PREVIEW_VERIFICATION.md` and `docs/evidence/media-preview-2026-09-18.json`.

# My Corner — local media foundation review

Prepared 2026-09-18 against main `debd1995ce5f599549d16ea932a04e639b1f411d`.

**Status: published as a draft, not deployed or merge-ready.** The founder explicitly adopted the directive and approved publication in [PR #102](https://github.com/pushee-io/My-Corner-Trusted-People/pull/102). Foundation commit `f17ad80f8e00c443b4afb35b266e96cbe9654d01` was published on 2026-09-18; its tree `f609578292a7db1da509125035ed595f78780888` matches the reviewed local implementation. Consult the latest PR head for current Mobile, Database and Media Functions CI results.

## Problem and proposed behavior

Marketplace has working photo uploads, but Profile, Feed, Hire, Groups and Events lack connected photo/video upload flows. The draft introduces a shared foundation for these surfaces. Media remains private while uploading and processing; publication requires authorization for its parent record. Existing Job Safety and Marketplace photo flows are preserved.

The uploaded VC media directive requests checkpoints A–H. This draft covers part of A. The earlier automatic approval review block is resolved by the founder’s explicit chat adoption and publication approval. Repository identity has been checked, and the earlier typecheck errors have been fixed. This approval covers publication; the remaining technical review gates below still apply.

## Concrete changes to review

| Files | Behavior |
| --- | --- |
| `mobile/src/lib/media-contract.ts`, `media-session.ts`, `shared-media-pipeline.ts` | Shared limits/types, compatibility exports and synchronous invalidation on account changes. |
| `mobile/src/lib/media-picker.ts`, `media-repository.ts` | Photo preparation; camera/system picker; bounded video selection and posters; byte-progress upload, retries, processing, attachment and signed reads. |
| `mobile/src/components/media/MediaComposer.tsx`, `MediaGallery.tsx` | Reusable preview/retry/remove/replace/reorder controls; user-triggered muted playback; clearing on account/route changes. Not yet mounted in product screens. |
| `mobile/src/lib/auth.ts`, `mobile/app/_layout.tsx` | Invalidate outstanding media operations on explicit sign-out/account transitions and Auth sign-out events. |
| `mobile/app.json`, mobile dependency manifests | Expo 54 video/thumbnails modules and camera/microphone permission descriptions; background playback/Picture in Picture disabled. |
| `supabase/migrations/20260918045854_shared_media_foundation.sql` | Disabled server flag, private original/processed buckets, upload quota, owner reservations, parent-bound authorization and attachment limits. No client permission to mark media ready. |
| `supabase/functions/process-media/index.ts`, `_shared/sanitize-media.ts` | Authenticate owner; re-encode JPEG pixels; rebuild supported H.264/AAC MP4 tracks; sanitize poster; expose only processed assets. |
| Mobile media tests, server tests, `supabase/tests/shared_media_security.sql` | Retry/account-transition races; parser/metadata fixtures; PostgreSQL permission, ownership, membership and limit cases. |
| `.github/workflows/media-functions-ci.yml`, `scripts/db-smoke-test.sh` | Processor and database verification gates; published implementation triggers remote CI. Consult the latest PR checks for results. |

Limits in this draft: images up to 6 MiB and 1920 pixels; video up to 20 MiB, 30 seconds and 1920 pixels. Server video processing supports standard unfragmented H.264 MP4, optionally with AAC-LC audio. Unsupported formats fail with an actionable error; no general transcoding service is implemented.

## Local verification

| Check | Result |
| --- | --- |
| Mobile Jest | 75 suites / 376 tests passed. |
| Mobile TypeScript / Prettier | Passed. |
| ESLint | Zero errors; 15 unchanged baseline warnings. |
| Expo web export | Passed; existing app bundles successfully. Unmounted media components are typechecked but this export does not prove their end-to-end behavior. |
| Expo Doctor | 18/18 passed. |
| Processor Deno check | Passed. |
| Server tests | Six passed: cleanup worker failures/path scope and PostgreSQL authorization matrix, JPEG metadata removal, invalid image inputs, AVC payload validation, MP4 rebuilding/playability/metadata removal. |
| Synthetic video decode | FFmpeg decoded sanitized H.264/AAC output, retaining audio/video and excluding injected GPS/device tags. |
| Real PostgreSQL via PGlite | Actual migration passed against reduced prerequisite fixtures and current authorization helpers. Owner, assigned provider, outsider, neighbor, removed group member, event invitee, missing-profile, storage path, processing, replacement, count, retry and disabled-flag cases passed. |

The PostgreSQL harness remains isolated. Separate Preview HTTP verification now passed 22 assertions, and the deployed cleanup worker completed eight jobs through the Storage API. See `VC_MEDIA_PREVIEW_VERIFICATION.md`. No device media behavior has been verified.

## Remaining work before foundation activation

1. **Storage lifecycle — implemented and service-verified:** leased deletion queue, retry, abandonment expiry, parent/profile cascades, and single-use ticket scheduling. Read access closes immediately; deletion waits out upload tokens and in-flight processing. Local picker disposal is implemented and unit-tested; device behavior remains part of native acceptance.
2. **Parent submission integration:** connect each surface without duplicate parent creation when upload or attachment retry fails. Text preservation currently follows the composer's separation from form state; complete forms are not yet exercised.
3. **Existing image consolidation:** reuse the shared preparation path in Marketplace where safe, preserving its existing photo behavior and migration compatibility.
4. **Service/performance verification:** basic Preview upload/process/read/remove and outsider isolation passed. Full Database CI remains required on the current PR head. Maximum-size clips, live account/permission transitions during playback, and memory/CPU/playback on representative low-end devices remain unverified.
5. **Privacy window:** already issued signed URLs remain bearer capabilities for up to 60 seconds. The UI invalidates account-scoped results and rechecks access on entry, but this is not immediate server revocation of an issued URL. Confirm the intended policy before activation.
6. **Native acceptance:** new video modules require a compatible APK. Camera/picker denial and recovery, thumbnails, playback, rotation, large text, TalkBack and device performance remain unverified. A paid EAS build needs separate approval.

## Next authorized action

Verify the published draft’s latest checks and finish the listed foundation gaps before merging or activating a surface. Publication approval is already recorded and does not need to be requested again. No production deployment or paid build is included.
