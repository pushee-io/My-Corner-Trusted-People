# Connected media: Preview checkpoint

Date: 2026-09-18. PR #102 remains draft. The founder authorized connecting product screens and one new Android Preview APK. Production and merging are outside this checkpoint.

## Connected screens

| Area | Entry point | Display and access |
| --- | --- | --- |
| Profile | Settings → Edit profile and picture | Add, replace or remove the current account picture; shared avatars with initials fallback |
| Neighborhood Feed | Community composer | Up to four photos and one video; media inherits post audience |
| Hire | Review before sending | Up to four photos and one video; request status and provider detail show attachments only under participant authorization |
| Groups | Member post composer; owner controls on group detail | Post gallery/video plus group avatar and cover; existing membership rules apply |
| Events | New event; organizer edit screen | First photo is the cover, up to six photos and one video, under existing event audience rules |
| Marketplace | Listing composer; owner listing detail | One shared video alongside the existing eight-photo flow; pickup privacy unchanged |

Photo/video limits, processing, private buckets, signed reads and cleanup remain in the reviewed shared foundation. Preview Groups uses the live repository so media attaches to authorized database parents.

Hire attachments are selected on **Review before sending**. The older optional-photo counter on Create request is still a prototype control, not an attachment picker; it does not represent uploaded files.

## Retry and privacy behavior

- A form keeps one client submission ID and captures its text when saving begins. An uncertain create response retries the same owned parent; failed attachment does not create a second parent.
- Upload failure preserves text and selection. Forms clear or navigate only after attachments are acknowledged. Repeated taps do not repeat completion navigation.
- Account/session changes and closed forms reject late create/attach completions. Existing gallery authorization refresh also clears expanded private images.
- Marketplace retries reconcile existing image rows and immutable storage paths. An ambiguous success response never deletes a potentially attached image or overwrites its bytes.
- Events with selected media require an online parent; the existing text-only offline queue remains available.

## Verification

- Mobile: 80 suites, 407 tests passed, including real Feed/Hire screen retry regressions, all five create-parent submission paths, account changes, duplicate taps, and Marketplace lost-response recovery.
- Media functions: six processing and database-policy tests passed, including EXIF/video processing, parent ownership, visibility, limits and durable cleanup.
- Type checking, formatting and the Preview contract passed. Lint has zero errors and 15 existing warnings. The build workflow repeats all release gates before submitting EAS.
- Preview readback confirmed two private shared-media buckets and zero pending cleanup jobs. Earlier foundation verification covered 22 live HTTP cases and eight Storage API cleanup jobs with fictional fixtures.
- No new database migrations or processor deployments are required for this integration.

## Build checkpoint

The one authorized build completed successfully and passed artifact verification:

- Source commit: `5d801ddcaa9c9ef8de23dcec8a2fa8be43470359`.
- EAS build: `214b0a28-2476-4271-aabc-2c07faa4c1a3`.
- [Verified build workflow](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/35344084493).
- [Download APK](https://expo.dev/artifacts/eas/tlArF0nKtWv1vqDWRwiojU8wgsVROgMGlKf-fIiQnl0.apk).
- Filename: `my-corner-preview-5d801dd.apk`; size: 69,507,494 bytes.
- APK SHA-256: `6eee664e7bbe760d8bb778f334a1ab54bbb7af20ad450757743d6a2fea875a6d`.
- Workflow verified the EAS source commit, product-media bytecode, Preview backend and Android application ID `com.mycorner.trustedpeople`. A direct download also passed archive integrity validation.
- Mobile CI (push and PR), Database CI, Media Functions CI and EAS Preview APK all passed on this source commit.

This following documentation update does not change app code or trigger another APK. No native device acceptance is claimed.

The existing shared-media feature flag is enabled in Preview for this device pass. Keep PR #102 draft until the device evidence below is reviewed.

## Device acceptance still required

Use fictional photos/videos and test accounts on the physical phone and tablet emulator. Verify:

1. Profile replacement/removal and avatar fallback; photo picker cancellation and camera permission denial/recovery preserve the screen.
2. Feed, Hire and Group photo/video creation, upload progress, interrupted-upload retry, readback and expanded viewing/playback. Unrelated accounts cannot see private Hire or restricted Group media.
3. Event cover/gallery/video and Marketplace existing photos plus video; retry creates one parent and no duplicate attachments.
4. Sign out/account switch while media is open clears the previous account content immediately. Background/return pauses video; no automatic playback or stale signed-media display.
5. Compact/tablet layouts, 200% text, TalkBack labels/focus, touch targets, scrolling, keyboard visibility and low-bandwidth recovery on these new controls.

Passing source/CI checks does not substitute for native picker, codec, rendering or accessibility evidence. Shared media local-file and server cleanup are covered by the foundation; legacy Marketplace photo lifecycle is not a newly implemented cleanup service.
