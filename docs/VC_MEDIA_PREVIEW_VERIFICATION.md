# Shared media cleanup and Preview verification — 2026-09-18

The shared foundation passed controlled Auth, PostgREST, Storage and Edge Function verification in Preview. Product screens are still disconnected; this is not device acceptance or a production rollout.

## Environment and deployment

The existing Preview APK provenance and published deployment checkpoint identify `opeojxwkwwnnncnsuaag` as the authorized Preview backend. The migrations recorded there are `20260918045854_shared_media_foundation`, `20260918045911_shared_media_cleanup`, and `20260918045921_shared_media_cleanup_schedule`, `20260918051919_media_cleanup_queue_privileges`, and `20260918052240_media_cleanup_single_use_tickets`. Repository filenames match those recorded versions; remote migration history was not rewritten. `process-media` verifies a user JWT with Auth and checks asset ownership. `cleanup-media` atomically consumes a two-minute, single-use dispatch ticket, with JWT gateway checking disabled specifically for its custom server-to-server authentication. Neither an ordinary user JWT nor a public project key authorizes cleanup.

Two temporary fictional identities were created for owner/outsider verification. Their passwords, access tokens and signed URLs were kept outside git and logs. No real media, account credentials, messages, or customer records were used.

## Results

The detailed 22-assertion receipt is in [the evidence JSON](evidence/media-preview-2026-09-18.json).

| Check | Observed result |
| --- | --- |
| Incomplete upload, followed by upload and retry | Retryable 409, then ready; repeated processing remained idempotent. |
| JPEG with injected metadata | Pixel-decodable server output; injected GPS/device marker removed. |
| MP4 with injected location/device tags and JPEG poster | Processed successfully; tags removed; FFmpeg decoded H.264 and AAC output. |
| Owner photo/profile and video/Feed attachment | Accepted under parent authorization. |
| Another signed-in account | Original processing, metadata reads and signed-read creation denied. |
| Original download, forged upload path, processed-bucket write | Denied to client. |
| Spoofed JPEG | 422; no readable processed object. |
| Media removal | New signed reads denied immediately. |
| Forged cleanup credential plus public API key | 401. |
| Actual worker through pg_net | HTTP 200, eight jobs completed, zero deferred. Four existing objects became zero. |
| Scheduled run, 05:10 UTC | Cron succeeded; worker HTTP 200, zero due jobs / zero deferred. |
| End state | Upload flag off; temporary accounts/profiles/post/neighborhood removed; zero test Storage objects. |

Measured HTTP processing was about 6.3 seconds for a small JPEG (first invocation) and 1.5 seconds for a 640×360, one-second video. These are observations of two small fixtures, not benchmarks or claims about maximum files or device speed.

## Cleanup behavior

- Removal/replacement revokes read eligibility immediately. A durable queue retains both original and processed paths even if an asset/profile is deleted. Video posters are included. Deleted parent records mark their assets removed.
- An unattended draft expires after 24 hours. Each run claims at most 20 jobs; expired leases recover after ten minutes. Failed Storage API deletion retries with backoff. A stale worker cannot acknowledge another worker's claim.
- Final physical deletion waits until at least asset creation plus 3 hours 10 minutes and the terminal state change plus 10 minutes. This covers a token issued during the first upload hour, its two-hour validity, and in-flight processing. These durations follow [signed upload token documentation](https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl) and the [hosted worker limit](https://supabase.com/docs/guides/functions/limits). Changing the upload policy or execution platform requires revisiting the delay.
- Every five minutes, pg_cron invokes the worker through pg_net. The endpoint is stored in Vault. Dispatch tickets are random, expire after two minutes and are stored only as hashes in a private table; consumption rejects replays. A fresh environment stays inactive until its own endpoint is configured. The service-role key and reusable credentials never enter a cron command, the pg_net queue or a client. Hosted pg_net owns its queue and the project role cannot reliably revoke its inherited grants; this is why the final design sends only a one-use, narrowly scoped dispatch capability. Interception could at most trigger the same eligible cleanup once; it cannot select arbitrary objects or read media. The previous reusable worker credential was removed.
- Physical deletion uses the [Storage API](https://supabase.com/docs/guides/storage/management/delete-objects), never a SQL delete from Storage metadata.
- Preview fixture queue times were accelerated to test actual deletion without waiting hours. SQL tests check the real safety windows, retries, abandonment and cascade rules. Profile cleanup requeued delayed receipts so late use of any fixture upload token is still cleaned up.
- Local draft removal, replacement, discard/unmount and account transition dispose of registered SDK cache files/browser object URLs. Library/content/document URIs and unrelated cache files are excluded. Failed local deletion remains registered for retry; native crash/OS cache eviction behavior is not established by unit tests.

## Review and remaining gates

The security advisor reports no new errors. Three warnings identify the foundation's intentionally authenticated security-definer upload/attach/remove RPCs; owner/parent checks and denied-client tests cover them. The private deletion queue and ticket table have RLS with no client policies by design. The deletion queue is service-only; ticket consumption is restricted to the worker RPC. Fresh-ticket acceptance, replay/expiry rejection, ticket-table denial and absence of the old reusable secret passed against Preview. Existing unrelated project findings remain unchanged.

Local checks: 75 mobile suites / 376 tests, six server/PostgreSQL tests, TypeScript and Deno pass. ESLint: zero errors / 15 existing warnings. Full Database, Mobile and Media Functions CI must pass on the current PR head.

Before activation, integrate one surface at a time and verify parent creation, text preservation and attachment retry without duplicates. Maximum-size files, live membership/account changes during playback, native cache disposal, camera/picker recovery, low-end performance, TalkBack and native playback remain acceptance work. Already issued signed reads retain their existing 60-second capability window. No APK was built at this checkpoint.

## Repeating the controlled HTTP check

`supabase/functions/test-support/verify-preview-media.mjs` accepts `MEDIA_QA_CONFIG`, a path outside git containing the authorized Preview URL/public key, two disposable `@example.invalid` accounts, a private fixture directory, an owner-authorized Feed parent UUID and an initially empty `fixtureIds` array. It saves only redacted assertions. Prepare a synthetic H.264/AAC `video.mp4` in that directory. Enable the upload flag only for the test window. An operator must clean the recorded fixture IDs through the queue, revoke/delete the fictional identities, remove their parent/area records and restore the flag afterward—even if the script fails. Never point the fixture harness at production.
