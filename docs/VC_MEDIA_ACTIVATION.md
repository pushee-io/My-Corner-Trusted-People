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

# My Corner — VC media activation

## Baseline and requested scope

Live main inspected 2026-09-18: `debd1995ce5f599549d16ea932a04e639b1f411d`. The uploaded directive is preserved alongside this file. The founder explicitly adopted it in chat and approved publication to PR #102 on 2026-09-18. Preview project: `opeojxwkwwnnncnsuaag`. No production change or paid EAS build is authorized.

## Architecture audit

| Area | Existing/reusable | Partial or missing |
| --- | --- | --- |
| Shared | `shared-media-pipeline.ts`: image policies, draft validation, prepared paths, private alt-text filtering | Transport, video, server byte validation, processing, progress and shared UI |
| Storage | Private `listing-images`, 6 MiB limit; authenticated owner uploads/deletes; reads follow listing membership/moderation | Other bucket names in the TS helper are contracts only; no deployed generic media table or Edge Function |
| Marketplace | ImagePicker, ImageManipulator JPEG resizing, native File bytes, upload cleanup, `marketplace_listing_images`, signed galleries | Video |
| Profile | Existing profile and verification screens; initials | Avatar upload/change/remove and audience-controlled avatar reads |
| Feed | Live `community-repository.ts` targets `neighborhood_feed_posts`; optional image contracts; existing composer/replies | No connected media upload. Legacy `community_posts` also exists in migration history: reconcile actual runtime schema before binding media |
| Hire | Existing create/status/provider flows; legacy `job_request_photos` storage-path records | No working form uploader; photo count placeholder. Preserve separate Job Safety and encrypted location paths |
| Groups | Live `social_groups` / `social_group_posts` / memberships and text-post UI | Avatar, cover and post media |
| Events | Existing create/edit/detail/discovery and audience helpers; `cover_image_path` field | No upload transport or signed media integration |
| Video | ImagePicker dependency can select/capture supported video | No video player/native dependency, poster or processing path |

Do not duplicate Marketplace or add six upload systems. Extend shared contracts/helpers and use one transport, one private media model and parent-specific authorization. Existing Marketplace images remain compatible. Generic media must not admit report/Job Safety parents.

## Checkpoint A design and resume point

Create shared draft/asset contracts and practical limits, private quarantine plus processed storage, authenticated parent authorization, server-controlled feature flag, safe metadata processing, shared upload state and picker/gallery. Restrict image outputs to sanitized JPEG and short supported MP4 video. Never expose unprocessed bytes to an audience. Retry must preserve form text and not duplicate parents. Short-lived signed URLs and logout/account-switch clearing are required.

Parent policies and runtime schema were inspected. The local foundation extends the existing shared image contracts with private storage, RPCs, processing and reusable components. Existing Marketplace photo behavior remains unchanged; consolidation of its preparation code still needs review.

## Current checkpoint and evidence

The foundation was published in draft PR #102 as `f17ad80f8e00c443b4afb35b266e96cbe9654d01`. Its tree `f609578292a7db1da509125035ed595f78780888` matches the reviewed local implementation. Mobile, Database and Media Functions workflows are attached to the PR; consult the latest head for their current results.

Local checks pass: 74 mobile suites / 374 tests, five server and PostgreSQL tests, mobile/processor typechecks, formatting, web export and Expo Doctor 18/18. Lint retains 15 baseline warnings with zero errors. Processor tests decode a sanitized synthetic H.264/AAC clip and verify removal of injected location/device tags. PostgreSQL tests apply the actual new migration to a reduced fixture schema; they do not replace the full Supabase integration suite.

No media migrations, functions or flags are deployed; no product screen is connected to these new components; no new APK or native media verification has occurred. Checkpoint A is not merge-ready. See `VC_MEDIA_CHECKPOINT_A_REVIEW.md` for concrete files, risks and remaining work.

## Resume with recorded approval

1. Verify the latest checks on the published foundation in PR #102. The founder has supplied direct chat approval, and the initial published tree was verified.
2. Resolve the documented cleanup and integration gaps and update the draft with focused tests and review evidence.
3. Run full database and application CI, then perform Preview processing/storage verification before enabling a surface.
4. Continue the Profile, Feed, Hire, Groups, Events and Marketplace checkpoints only within the confirmed media scope. A compatible native artifact and device observations are separate prerequisites for media acceptance.
