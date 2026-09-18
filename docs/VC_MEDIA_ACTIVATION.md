# My Corner — VC media activation

## Baseline and authority

Live main inspected 2026-09-18: `debd1995ce5f599549d16ea932a04e639b1f411d`. The implementation directive is preserved alongside this file. Preview project: `opeojxwkwwnnncnsuaag`. No production change or paid EAS build is authorized.

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

Before implementation, finish checking live parent policies/schema and supported Expo 54 video dependency. Then generate a forward-only migration with the Supabase CLI and implement focused validation/privacy tests. CI provides a clean local Supabase database; remote Preview deployment happens only after review/checks.

## Evidence status

- Audit: complete enough to identify shared reuse; parent-policy reconciliation in progress.
- Implementation, new media tests and staging flags: pending.
- Phone/tablet media verification: pending a compatible Preview artifact. Do not reuse the previous native gate as proof that new media works.
