# My Corner — reliability and UX checkpoint

Date: 2026-09-21. Baseline main: `debd1995ce5f599549d16ea932a04e639b1f411d`.
Implementation base: PR #102, `d26d7abb14417f4d0bb4811fdeb1d929fe41625c`.
This checkpoint supersedes stale next-action statements in older handoffs.

## Founder-reported media acceptance

The founder reported YES for all three focused checks on the corrected `62e3cec` APK: centered portrait/landscape video before/during playback; repeated Play/Close and background/return; Hire photo/video → Review → Back → submit → attachment readback. These are founder-observed device results, not direct device control or proof of every broader media acceptance item. The new changes below are not in that APK.

## Audit and implementation

| Request | Finding | Change / relevant source | Evidence |
| --- | --- | --- | --- |
| Provider synchronization | Inbox polled every 10 seconds; detail loaded once; no live publication for request/safety tables | Reuse `useProtectedResource` with focus/foreground/manual refresh and non-overlapping foreground-only 10-second refresh | `request-refresh.test.ts` |
| Authorized location release | Safety screen loaded only on mount or its own mutation | Read through existing participant-authorized safety RPC; no private-location broadcast or new access grant | Refresh tests; native two-device propagation pending |
| Multiple requests | Home rendered only `requests[0]` | All active requests, past requests, provider/category/status/updated time, deterministic sorting and duplicate suppression | `active-requests.test.ts` |
| Search | Disabled input, repository default could use fixture context | Editable, debounced input; current authenticated capabilities; live authorized sources; actionable results, thumbnails, empty/error states | Existing search tests; native acceptance pending |
| Structure with AI | Client flag false, server placeholder, function not deployed | Complete existing function using Responses API structured output, server-only key/model, per-profile minute/day quota; explicit suggestion acceptance; manual fallback | AI client interaction tests, parser tests and PostgreSQL quota tests; live configuration gate remains |
| Welcome | Enter app; no registration route | Enter My Corner → sign-in; Create Account → distinct registration form | Typecheck and auth tests; email confirmation/device acceptance pending |
| Registration | No profile provisioning for new accounts | Marker-scoped Auth trigger creates only an unverified requester; ignores metadata privilege claims; adds no neighborhood/provider membership | PostgreSQL registration tests |
| Navigation | Six text labels | Existing Ionicons package, accessible names/roles/selection, 48dp targets; legitimate resident/provider/moderator capabilities remain independent | Navigation contracts and capability matrix tests |
| Invite Friend | Missing | Native share sheet; optional configured HTTPS URL; text-only Preview fallback | Invite tests; native share sheet acceptance pending |
| Provider role difference | Account A provider-only; Account B verified resident + provider + moderator | No account-role or membership changes; Home exposes Provider inbox when linked; restricted navigation does not grant access | Read-only Preview audit and capability tests |

## Role/capability matrix

| Account type | Provider operations | Neighborhood modules | Moderation |
| --- | --- | --- | --- |
| Verified resident | Only with provider linkage | Existing verified membership | Only with staff role |
| Provider-only | Assigned requests | No | No |
| Verified resident + provider | Assigned requests | Yes, within underlying policies | No unless staff |
| Moderator without residence | Only with provider linkage | No automatic resident grant | Existing staff policies |
| Verified resident + provider + moderator | Assigned requests | Yes, within underlying policies | Existing staff policies |

The two named accounts were compared privately. Account A has role `provider`, one active provider linkage and zero valid neighborhood memberships. Account B has role `moderator`, one active provider linkage and one valid neighborhood membership. Both report phone verified. Account A's lack of neighborhood content is EXPECTED PROVIDER-ONLY BEHAVIOR, not a reason to grant membership.

## Configuration and limits

- APP STORE DEEP LINK PENDING. Configure `EXPO_PUBLIC_MY_CORNER_INVITE_URL` with an approved HTTPS landing/store URL when available. No fake URL, contact permission or automatic communication is used. Share destinations depend on installed apps.
- Preview client enables the structurer control. Server additionally requires the `ai_service_request_structurer` database flag plus `OPENAI_API_KEY` and `OPENAI_REQUEST_STRUCTURER_MODEL` in Edge Function secrets. Keys never enter the mobile bundle. No commercial billing is activated.
- Responses use `store: false`, no tools, bounded input/output and a 20-second timeout. AI quota: six calls per rolling minute, forty per database day, stored privately by profile. The server authenticates the actual user and consumes allowance before calling the model. No real request text is sent during automated tests.
- Existing email/password Auth is reused. Registration sends only name and an enrollment marker, with no privileged role or verification claims. Confirmation-email behavior remains controlled by Preview Auth configuration. No real signup/email was submitted by this agent.
- Refresh is polling plus focus/foreground refresh, not a millisecond realtime guarantee. Actual phone/tablet propagation latency must be measured. No new realtime publication or location payload was added.
- Existing private request/location RPCs, RLS and media storage remain authoritative. Returning an accessible navigation destination is not an authorization grant.

## Validation and remaining gates

Local mobile typecheck and Preview contract passed. Existing full mobile suite plus new tests run in CI; source assertions were updated where the refresh implementation moved into the shared hook. New coverage exercises slow polling, blur/unmount, foreground, account switch, late route responses, multiple requests, independent capabilities, safe invite configuration, manual AI fallback and explicit suggestion acceptance.

Ten server/PostgreSQL tests passed locally, including the existing media processing/access suites, actual registration/allowance migrations, invalid/refused/incomplete AI responses and private quota permissions. Deno check passed for the structurer. Repository Database CI must verify the full migration/reset and existing privacy suites.

Published [PR #103](https://github.com/pushee-io/My-Corner-Trusted-People/pull/103), stacked on #102. Implementation `c4c23ca` passed [Mobile CI](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/35606749352), [Database CI](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/35606749482), [Media Functions CI](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/35606749486), and [Job Safety Usability](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/35606749373). Mobile suite: 446 tests; local lint zero errors / 15 existing warnings, typecheck, Preview contract and web export passed.

Preview deployment: `20260921133831_preview_self_registration` and `20260921133843_request_structuring_allowance`; source filenames aligned with actual remote history. Function `structure-service-request` version 1 ACTIVE, JWT required. Registration and allowance rollback SQL passed on Preview. Registration now also rejects client edits to `phone_verified`, closing an existing update-permission gap without altering account states. A temporary authenticated fixture confirmed that denial. Both temporary Auth user and profile were removed and zero remaining fixture rows verified.

Authenticated HTTP availability returned **503** even with the AI flag enabled and readable by the test user. Server key/model configuration is therefore still a release blocker; runtime secret values are not exposed through the connected tools. The database flag was restored to false. No OpenAI request, confirmation email, SMS or push was sent. Configure `OPENAI_API_KEY` and `OPENAI_REQUEST_STRUCTURER_MODEL` securely in Preview, then enable the flag and verify a fictional request before calling AI ready. Do not paste secrets into chat.

Security advisor comparison: no new WARN/ERROR finding; only the expected private quota table with RLS and no client policy ([Supabase explanation](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)). Existing advisor findings were not changed by this checkpoint.

Pending: AI configuration and live successful suggestion, final-head CI/review, and native acceptance of all new UI and synchronization. There is no new APK authorization in this directive. The prior corrected media APK build authorization is consumed. No new EAS build, production deployment, real SMS/push or store publication was performed.

## Required two-device pass after a separately approved build

1. Requester creates A and B; all active requests appear, including same-provider and different-provider cases.
2. Provider sees assignments, requester changes and released service pin without restart; record elapsed time. Repeat with detail open, returning from another screen, background/foreground and pull-to-refresh.
3. Provider status changes reach requester; lists contain no duplicates. Unrelated providers cannot read either job or unreleased location.
4. Search input/results/navigation/privacy; accessible footer icons; distinct welcome routes; native invite share/cancel.
5. AI returns a reviewable suggestion, explicit apply remains editable, refusal/network failure preserves manual draft. Test only after live AI configuration is verified.
6. New registration remains an unverified requester until existing verification requirements are satisfied. Existing provider-only restrictions remain intact.

Sources checked: [Supabase Auth sign-up](https://supabase.com/docs/reference/javascript/auth-signup), [Edge Function authentication](https://supabase.com/docs/guides/functions/auth), [Responses structured output](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses). The Supabase changelog was reviewed; no relevant current breaking change was found for this implementation.
