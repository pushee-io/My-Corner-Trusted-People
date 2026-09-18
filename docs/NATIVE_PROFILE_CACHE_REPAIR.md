# Native profile cache repair — 2026-09-18

## Evidence and cause

The tested APK was built from `ac9106c15a497543874c700ffbaeb29fa013aab8`.
On the physical provider phone, an offline restart remained on Welcome;
Enter app opened Sign in. Connectivity restored the existing session without
manual sign-in. The app did not crash.

The saved routing profile used `my-corner:last-verified-profile:v1`.
Expo SecureStore 15.0.8 rejects colons before any native storage operation.
Online profile loading swallowed the cache-write error, while offline startup
failed to read the cache and fell back to Welcome. Tests mocked the storage API
and therefore did not exercise this validation.

## Repair

- Use the valid key `my-corner.last-verified-profile.v1` for reads, writes and removal.
- Return no cached identity for unreadable or malformed storage; preserve the
  stored value so a transient read failure can recover on a later attempt.
- Keep write/removal failures observable to callers. Existing online profile
  loading remains usable if its optional cache write fails. Cache removal now
  finishes before an auth change; if removal fails, sign-out/account switching
  stops and reports the error without changing the Supabase session.
- No native migration from the invalid key is possible or needed: SecureStore
  rejected every write. Open the corrected app online once to populate the key.
  Web session storage also starts using the new key after online profile loading.
- The profile supports startup routing only. Live authorization and private
  job data still require the existing authenticated server checks.

## Review blocker resolved: delayed writes after sign-out

Review reproduced an old profile request completing after successful sign-out,
recreating the deleted cache and restoring that identity on offline startup.

Profile requests and startup restores now capture a session revision and reject
results after that revision changes. Sign-in, local sign-out and password
recovery invalidate pending work immediately and block new profile reads while
the session changes. Auth changes are serialized so overlapping sign-out/sign-in
operations cannot interleave their cache cleanup.

Cache mutations are also serialized. A queued write checks that its session is
still current before writing; a write already inside SecureStore finishes before
removal. Sign-out cannot report success ahead of that removal. An old startup
response cannot delete or return a newer account's cached profile.

## Automated verification

The added native contract suite runs the installed SecureStore JavaScript
implementation and the real application storage adapter, cache and auth code.
Only the native bridge, network state and remote Supabase responses are mocked.

Coverage includes old-key rejection, provider/requester online caching followed
by offline module restart, cache removal on local sign-out, failed read/retry,
failed removal/retry, and an empty cache on a fresh offline installation.
Reintroducing the old key made both restart regression tests fail.

Nine additional regressions cover delayed user/profile responses, in-progress
native writes, account switching, replacement-profile load failure, stale cache
reads/startup responses, recovery-session replacement, and overlapping auth
changes. The eight race cases tested against the previous source all failed
there and pass with this repair.

- Full Jest suite: 72 suites, 364 tests passed.
- Typecheck, formatting and preview contract: passed.
- Lint: zero errors; 15 existing warnings in unrelated files.

These tests do not execute Android storage or the native UI. Device verification
of the corrected APK remains pending; the native gate is not closed.

## Next device check after a separately authorized build

1. Install the corrected APK over the existing app on provider phone and requester emulator.
2. Open each app online and load its verified profile before disconnecting.
3. Cold restart offline: retain access to the app shell instead of Welcome/Sign in.
   Live job cards may show an offline/error state; this repair does not add offline job storage.
4. Reconnect: recover live content without another sign-in.
5. Verify the Create request banner appears offline and clears online.
6. Sign out explicitly, then restart offline: the previous profile must not return.

No new APK build, merge, dependency update, database change or feature is part
of this cache repair.
