# Connected media: Preview checkpoint

Date: 2026-09-18. PR #102 remains draft. The first connected-screen APK exposed the three device failures below. The founder-approved corrected APK from `62e3cec` is now built and verified, including repair commit `e36ed2b`. Installation and focused phone/tablet retesting remain pending. Production and merging are outside this checkpoint.

## Device failures and source repair

| Reported on APK `5d801dd` | Source finding and repair |
| --- | --- |
| Portrait video preview sits to one side on phone and tablet | The image combined full width, aspect ratio and a maximum height. Move the height cap to a measured full-width viewport; poster and video both use centered, uncropped containment and recalculate after a width change. |
| Close video exits the app | Expo owns native player release. The app's later passive cleanup called `pause()` on the released player. Remove that call and detach background listeners before release, including queued-event protection. The regression reproduced the exception before the repair. |
| Hire has no useful media picker on Create request | Replace the prototype photo counter with the shared photo/video composer. Create and Review share local selections and one submission identity; Back retains the draft, attachment retries complete the same request, and leaving the flow or switching provider/account discards attachments and rejects late results. |

The lifecycle test models the installed Expo SDK's native-object release ordering. Layout tests drive compact/tablet container widths and rotation; they do not replace native rendering or crash-log verification. No device pass is claimed for these source repairs. Private media policies, database schema and storage processing are unchanged.

## Connected screens

| Area | Entry point | Display and access |
| --- | --- | --- |
| Profile | Settings → Edit profile and picture | Add, replace or remove the current account picture; shared avatars with initials fallback |
| Neighborhood Feed | Community composer | Up to four photos and one video; media inherits post audience |
| Hire | Create request → Photos or video of the work → Add media; also editable in Review before submission | Up to four photos and one video; request status and provider detail show attachments only under participant authorization |
| Groups | Member post composer; owner controls on group detail | Post gallery/video plus group avatar and cover; existing membership rules apply |
| Events | New event; organizer edit screen | First photo is the cover, up to six photos and one video, under existing event audience rules |
| Marketplace | Listing composer; owner listing detail | One shared video alongside the existing eight-photo flow; pickup privacy unchanged |

Photo/video limits, processing, private buckets, signed reads and cleanup remain in the reviewed shared foundation. Preview Groups uses the live repository so media attaches to authorized database parents.

Hire media stays in memory across Create and Review. File paths are not placed in navigation parameters or persistent storage. Once parent creation begins, the request text and media are locked so retry keeps the original request and attachment set.

## Retry and privacy behavior

- A form keeps one client submission ID and captures its text when saving begins. An uncertain create response retries the same owned parent; failed attachment does not create a second parent.
- Upload failure preserves text and selection. Forms clear or navigate only after attachments are acknowledged. Repeated taps do not repeat completion navigation.
- Account/session changes and closed forms reject late create/attach completions. Existing gallery authorization refresh also clears expanded private images.
- Marketplace retries reconcile existing image rows and immutable storage paths. An ambiguous success response never deletes a potentially attached image or overwrites its bytes.
- Events with selected media require an online parent; the existing text-only offline queue remains available.

## Verification

- Source repair mobile checks: 81 suites, 419 tests, including 12 new cases for released-player cleanup, compact/tablet media frames, Hire Create/Review/Back, retry, cancellation, account/provider changes and stale async results after leaving and returning.
- The preceding integration passed six media processing/database-policy tests. Those functions and policies are unchanged by this device repair.
- Type checking, formatting and the Preview contract passed. Lint has zero errors and 15 existing warnings. The build workflow repeats all release gates before submitting EAS.
- Preview readback confirmed two private shared-media buckets and zero pending cleanup jobs. Earlier foundation verification covered 22 live HTTP cases and eight Storage API cleanup jobs with fictional fixtures.
- No new database migrations or processor deployments are required for this integration.

## Corrected build checkpoint — device retest pending

The founder approved one corrected APK for the phone/tablet retest on 2026-09-18. That build completed successfully:

- Source commit: `62e3cecc286203a6da28c3bf8805e20cc068944a`, including repair commit `e36ed2b6d3b161772ee0fa65ea25ba4a23bbac03`.
- EAS build: `7cbb3fcf-36e0-4ce7-85dc-620a3b8ba68c`.
- [Verified build workflow](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/35388377487).
- [Download corrected APK](https://expo.dev/artifacts/eas/CA1jH16x1ROl4Fma24VA-b03eI58kWLHWOXZoVnXZDE.apk).
- Filename: `my-corner-preview-62e3cec.apk`; size: 69,509,354 bytes.
- APK SHA-256: `440daca1dc2e760e0bd7bbce7a77b914ff2a8541439e9693711af0683ee4c01a`.
- Workflow artifact: `my-corner-preview-verified-62e3cecc286203a6da28c3bf8805e20cc068944a`, containing the APK and `preview-provenance.json`.
- Workflow verified the EAS source commit, product-media bytecode, Preview backend and application ID `com.mycorner.trustedpeople`. Mobile CI (push and PR), Database CI, Media Functions CI and EAS Preview APK all passed on this source commit.
- Direct download passed full archive integrity and application ID checks. Its embedded bundle contains the responsive media viewport and repaired Hire attachment flow; the old photo-placeholder marker is absent. The only embedded Supabase URL is the expected Preview project.

This consumes the approval for one corrected build. Install with `adb install -r` on physical phone `R5CX10FFDQF` and tablet emulator `emulator-5554` to retain app data. Device rendering, native playback lifecycle and Hire media acceptance are still unverified on this APK.

## Previous build checkpoint — device gate failed

The one authorized build completed successfully and passed artifact verification:

- Source commit: `5d801ddcaa9c9ef8de23dcec8a2fa8be43470359`.
- EAS build: `214b0a28-2476-4271-aabc-2c07faa4c1a3`.
- [Verified build workflow](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/35344084493).
- [Download APK](https://expo.dev/artifacts/eas/tlArF0nKtWv1vqDWRwiojU8wgsVROgMGlKf-fIiQnl0.apk).
- Filename: `my-corner-preview-5d801dd.apk`; size: 69,507,494 bytes.
- APK SHA-256: `6eee664e7bbe760d8bb778f334a1ab54bbb7af20ad450757743d6a2fea875a6d`.
- Workflow verified the EAS source commit, product-media bytecode, Preview backend and Android application ID `com.mycorner.trustedpeople`. A direct download also passed archive integrity validation.
- Mobile CI (push and PR), Database CI, Media Functions CI and EAS Preview APK all passed on this source commit.

This previous APK does not contain the repairs. Use the corrected `62e3cec` artifact above for retesting.

The existing shared-media feature flag is enabled in Preview for this device pass. Keep PR #102 draft until the device evidence below is reviewed.

## Device acceptance still required

Use fictional photos/videos and test accounts on the physical phone and tablet emulator. Verify:

0. On the corrected APK, retest the three reported failures first: centered portrait/landscape video before and during playback, repeated Play/Close plus background/return without exiting the app, and Hire photo/video selection in Create followed by Review, Back, submission and authorized readback. Record the corrected source commit with the results.
1. Profile replacement/removal and avatar fallback; photo picker cancellation and camera permission denial/recovery preserve the screen.
2. Feed, Hire and Group photo/video creation, upload progress, interrupted-upload retry, readback and expanded viewing/playback. Unrelated accounts cannot see private Hire or restricted Group media.
3. Event cover/gallery/video and Marketplace existing photos plus video; retry creates one parent and no duplicate attachments.
4. Sign out/account switch while media is open clears the previous account content immediately. Background/return pauses video; no automatic playback or stale signed-media display.
5. Compact/tablet layouts, 200% text, TalkBack labels/focus, touch targets, scrolling, keyboard visibility and low-bandwidth recovery on these new controls.

Passing source/CI checks does not substitute for native picker, codec, rendering or accessibility evidence. Shared media local-file and server cleanup are covered by the foundation; legacy Marketplace photo lifecycle is not a newly implemented cleanup service.
