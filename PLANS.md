## 2026-09-27 — One new Preview APK approved for corrected question-limit feedback

- Founder approved one new APK after the #150 backend deployment. This approval authorizes one Preview Android build; no merge, production, backend mutation, quota reset/increase, identity or secret changes.
- Build branch `codex/ask-quota-preview-apk` starts from durable #150 checkpoint `1bf958836a673bc77d33f69911b5bd2f2d2c1182`. Application/database source remains identical to tested `40957f92c72a509a184e8fa93c6847132d58a4fc`. Main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; existing PR stack preserved.
- New native feature since APK47: decode the approved safe 429/ASK_ALLOWANCE_REACHED response and display the Preview question-limit message instead of generic unavailability. Search stays available; arbitrary server details stay hidden. The 40-question daily allowance remains unchanged.
- Preview v9/JWT verification and the one-row Kwame East Legon repair are already deployed; 12 questions/41 actual scoped RPC checks passed. No redeployment or reapplication for this build. Source CI passed: Database 36330082517, Mobile 36330082583, server/Deno 36330082543; 548 mobile tests/97 suites and 45 server tests.
- Workflow recognizes verified APK47 `6f96b91b-8358-47e9-ac5d-5aee15058497` as the prior baseline while preserving active/unexpected-build duplicate rejection. It persists the submission receipt before waiting, requires version above 47, exact source and Preview-only environment, and checks the new quota-code/message in actual APK bytecode.
- Submission prepared; no new EAS ID yet. Inspect the receipt if the session stalls; do not submit a replacement. Native phone/tablet and signed-in Edge/model acceptance remain pending.

## 2026-09-27 — Approved Kwame coverage and assistant v9 deployed to Preview

- Founder explicitly approved the exact Kwame coverage script and tested #150 function deployment. Applied `supabase/ops/preview_kwame_east_legon_coverage.sql` to **Preview `opeojxwkwwnnncnsuaag` only**, SHA-256 `22d473ead9ecda9ca683c182ea29b8b9776be77847b473841948faedc5353cee`. Kwame now has exactly **one East Legon** structured area. Other providers' coverage, provider-profile records and feature-flag hashes are unchanged. No inference from “nearby,” no other provider backfill, no quota reset.
- Deployed **ask-my-corner v9, ACTIVE, JWT verification true**. All seven files match tested PR #150 source **`40957f92c72a509a184e8fa93c6847132d58a4fc`** byte-for-byte; deployed bundle `aeb71eaec83082a0719d108a98cf3069857a91ab595471fff88263739c00ecbb`. Main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; no PR merged. Approval is fulfilled for these backend actions; do not repeat deployment after a stalled session.
- **Scoped live verification passed: 12 questions / 41 authenticated-role read-only RPC checks using the exact tested planner.** `plumber`, `plumbing`, `I need a plumber`, `Kwame PipeCare`, availability and most-reviewed-plumber queries retrieve Kwame with **2 verified reviews / 5 confirmed completed jobs** and the correct provider action. Comparison population is only the one currently eligible covered plumber; do not imply a neighborhood-wide winner over unrecorded coverage. Availability remains provider-stated, not a confirmed booking slot.
- `electrician` and `I need an electrician` return the relevant electrical recommendation and **no wedding/hair post**. Electrical providers still have no recorded eligible East Legon coverage; no areas were invented. Fence retrieves the covered demo provider; `festival`/`festivals` each return 2 upcoming Events; `pig racing` returns 1 Event. Existing source authorization retained: unauthorized neighborhood denied, anonymous RPC denied, security invoker retained, anonymous Edge HTTP **401**.
- Verification is live authorized **database retrieval + deployed-file verification**, not authenticated Edge/model execution or native visual acceptance. No user HTTP login session was available. The new safe **429 / ASK_ALLOWANCE_REACHED** mapping passed source/CI tests and is deployed; existing 6/minute, 40/user/day and 500/global/day caps remain unchanged. Existing APK47 still displays the generic error because its client predates the new code.
- Source CI remains green: Database/RLS **36330082517**, Mobile **36330082583**, server/Deno **36330082543**; **548 mobile tests / 97 suites; 45 server tests; typecheck/format/diff pass; lint 0 errors / 15 baseline warnings**. Durable evidence: `docs/evidence/ask-repair-preview-deployment-2026-09-27.json`.
- **NEW PREVIEW APK APPROVAL REQUIRED** only for the new mobile question-limit message and subsequent native acceptance. Backend retrieval corrections are available to APK47 without rebuilding, subject to the unchanged account allowance. No build started; previous APK47 approval was consumed. Production, secrets, identity data, real communications and unrelated schema remain untouched.

## 2026-09-27 — Native screenshots: provider omission, irrelevant discussion and misleading quota error

- Founder screenshots show Kwame PipeCare in Hire with “East Legon and nearby,” an electrician search including an unrelated wedding/hair post, and a fence question reporting temporary unavailability. Live main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`. Repairs branch `codex/ask-relevance-quota-coverage` preserves #149/APK47 checkpoint `7ec127a4f16e02aa13c98ad4fa9eefb068b103e5` and earlier stack; no main merge/reset.
- **Kwame cause confirmed:** existing pilot provider `dba23ab5-5fbf-496f-9fb7-ff575f93fb28` has the expected public area label but **zero** `provider_service_areas` rows. Hire reads the label; assistant requires structured neighborhood coverage. Prepared `supabase/ops/preview_kwame_east_legon_coverage.sql` for **only Kwame + East Legon (`90ac8954-e9ca-467f-8a2e-de7eecbd5422`) on Preview `opeojxwkwwnnncnsuaag`**. Guarded/idempotent, rejects profile/neighborhood drift; no inference from “nearby,” no bulk provider backfill or authorization weakening. Fresh seed records this same named pilot coverage. Live repair remains unapplied pending explicit approval.
- **Hair cause reproduced:** “I need an electrician” retained generic “need” in an OR text search; all candidates were displayed even if model evidence omitted them. Read-only actual caller-authorized Preview RPC: before 2 posts including hair; corrected service terms 1 relevant electrical post, hair absent. Code now removes request scaffolding, uses service concepts for related discussion queries and displays only model-selected secondary provider evidence. Exact-excerpt validation, source routes, RLS and final reauthorization remain intact.
- **Unavailable cause confirmed at screenshot time:** 15:23:09 UTC Edge 503 coincides with meter Postgres **54000 / “Ask My Corner allowance reached.”** One account's day count is **40**, another **31**; existing limits 6/minute, 40/user/day, 500/global/day. This is a limit rejection misreported as an outage. New Edge handling returns a safe **429 + ASK_ALLOWANCE_REACHED**; mobile decodes the recognized code and displays the Preview question-limit message while preserving Search. No raw internal error text is shown. Existing caps/counters are unchanged; no quota reset or extra paid model call.
- Local checks: **45 server tests; 548 mobile tests / 97 suites; typecheck, format and diff passed; lint 0 errors / 15 baseline warnings.** Regression coverage includes actual Postgres topic matching, unselected hair removal, quota before model/retrieval, HTTP-body/session-safe mobile handling and exact coverage repair scope/idempotency/drift rejection. Remote CI passed at tested source `40957f92c72a509a184e8fa93c6847132d58a4fc`: Database/RLS **36330082517**, Mobile **36330082583**, server/Deno **36330082543**. Reviewable PR **#150**. Live Preview remains v8 / JWT true.
- **Deployment approval boundary:** prior approvals covered the earlier named migrations/#148 function and one APK47 build, now consumed. This new Edge source and one-row Preview coverage repair are prepared for explicit approval; no persistent live change performed. APK47 cannot display the new quota-specific copy; a later new Preview APK needs fresh build approval after backend verification. Native acceptance remains failed/pending for these issues. No production, identity, secrets, real communications or unrelated schema changes.
- Evidence: `docs/evidence/ask-relevance-quota-2026-09-27.json`. Do not claim this repair is live or request another build merely to diagnose the existing screenshots.

## 2026-09-27 — Approved assistant Preview APK 47 built and verified

- The one approved build completed: **APK 47**, EAS **`6f96b91b-8358-47e9-ac5d-5aee15058497`**, source **`ea06651b69466dfaf70325b065566e412960925e`**, workflow **36295025462 success**. Application/database files equal tested #148 source `1e9f4f4b5e41c788ff695b117dc29b7bdde4d074`. PR **#149**, based on #148, preserves the existing stack without merging or moving its branches. Main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b` at build.
- APK: https://expo.dev/artifacts/eas/fQ7Rln7UW3X5Ha0TxPs9BC0gohUmFKQ1KS0GE_Pi2Jg.apk . Size **72,010,422 bytes**; SHA-256 **`e0875a76f301d2fff3abc9d5b9dee195f21b3433779d8d877964a4a714160c32`**. Independent download matches. Android apksigner verified v2; signer SHA-256 **`79de09929e726b418f4447d1b7f73d6b529b636b5d05a9766fcb39cd068bdc76`** matches APK 46, supporting an in-place update that retains app data.
- Verified actual artifact: exact EAS source, Android version 47, package `com.mycorner.trustedpeople`, Preview-only Supabase URL `opeojxwkwwnnncnsuaag`, ZIP integrity, identical navigation font, existing media/assistant/Home/public-name labels, and new provider availability/completed-job labels. New native source includes clarification choices, selected-provider availability follow-ups and completed-job display.
- Build release gates passed: **544 mobile tests / 96 suites**, formatting, typecheck, lint **0 errors / 15 baseline warnings**, Preview environment and EAS duplicate checks. Mobile CI **36295045176 / 36295025422** passed. Unchanged source checkpoint Database/RLS **36294726852** and server/Deno **36294726817** passed; server tests **42**. Submission receipt artifact **10923821793** and verified APK/provenance artifact **10923099208** persist with the workflow.
- Preview backend v8 was already deployed with JWT verification retained; prior 40 authenticated-role RPC checks and anonymous HTTP 401 remain recorded in `docs/evidence/ask-intent-preview-deployment-2026-09-27.json`. No backend deployment, production, secret, identity, provider-coverage or feature-flag changes occurred for this build.
- **This one-build approval is consumed. Do not submit another EAS build without fresh approval.** Authenticated Edge/model and native phone/tablet acceptance remain **PENDING**. Test clarification choices, selected-provider follow-ups/completed-job display, source actions, existing public names/avatars and Home collapse behavior after install. Missing structured Plumbing/Electrical service areas remain a separate data gate; this APK does not invent provider coverage.
- Mac update: download APK 47, verify the SHA-256, then `adb -d install -r "$HOME/Downloads/my-corner-preview-47.apk"` for one USB phone. Use `adb -e` for one emulator or `adb -s DEVICE_SERIAL` for a selected device; never uninstall/clear app data as part of this update.
- Evidence: `docs/evidence/ask-intent-apk-2026-09-27.json`. Resume from live GitHub/EAS records; do not rebuild after a stalled session.

## 2026-09-27 — One new assistant Preview APK approved; submission checkpoint

- Founder explicitly approved one new Preview Android APK after the verified v8 backend deployment. This resolves the previous APK approval gate for one submission only. No main merge, production change, secret change or identity/provider-coverage edit is included.
- Build branch `codex/ask-intent-preview-apk` starts at #148 checkpoint `90b91e7d221704ede8ac0b67517af317d3eac4c3`; application/database source is unchanged from tested `1e9f4f4b5e41c788ff695b117dc29b7bdde4d074`. Live main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`. Existing PR stack branches remain unchanged.
- Latest source checkpoint CI passed: Database 36294726852, Mobile 36294726819, server/Deno 36294726817. The build reruns release gates and verifies Preview-only environment, exact source, version greater than 46, previous product markers and new provider follow-up/completed-job labels.
- EAS duplicate guard retains active/unexpected completed-build rejection and recognizes already verified APK 46 (`b6ea9558-74c4-49fe-9f28-f8a9baed72ff`) as the prior baseline. A build receipt is uploaded before the long completion wait. Do not submit a replacement if the chat stalls; inspect this workflow's recorded build first.
- New native source includes clarification choices, selected-provider availability follow-ups and completed-job display. Preview backend v8 remains JWT-verified; 40 scoped RPC checks and anonymous HTTP 401 passed. Authenticated Edge/model and native phone/tablet visual acceptance remain pending. Missing structured Plumbing/Electrical service areas remain a separate data gate.
- Status at this checkpoint: authorized submission prepared; no new EAS build ID recorded yet. Completion evidence and actual APK checksum follow after artifact verification.

## 2026-09-27 — Approved assistant upgrade deployed to Preview and scoped checks complete

- Founder explicitly approved this exact migration and tested #148 function deployment to Preview only. Applied **`20260927040151_assistant_structured_retrieval.sql`** to **`opeojxwkwwnnncnsuaag`**. Remote history version **`20260927042839`**; stored SQL matches source byte-for-byte, SHA-256 **`54bc903bbcf85b7dae072a786f0bf28f4ede47a8a4623dc6f952bd418b2fa1ca`**. The tool assigns the remote timestamp; do not reapply because it differs from the filename.
- Deployed **`ask-my-corner` v8**, ACTIVE, **JWT verification true**. All seven deployed function/config files match tested #148 source **`1e9f4f4b5e41c788ff695b117dc29b7bdde4d074`** exactly. Bundle SHA-256 **`b7cbc2a54c4b4fb96b57efcce08bab439bf2d87624d08b2dfd172d54c1f1559c`**. Prior automatic approval block is resolved. No production, identity, provider coverage, feature flag or secret changes; no PR merged and no paid APK build.
- **40 actual Preview authenticated-role RPC query checks completed** using the tested planner's exact source/options/date parameters. These are live database retrieval checks plus anonymous HTTP **401**, **not authenticated Edge/LLM execution**. No user HTTP login session was available. Festival/festivals/full question/festval each return 2 upcoming Events; racing/pig/pig racing return 1 Event; fence/fencing/repair fence return 1 covered provider; dining-table search returns 3 listings; road closed/closure/traffic each return 2 agency notices. Feed/Group electrical discussion and park-history sources remain retrievable.
- Utility synonyms now agree: no current authorized outage evidence found; unrelated park lighting is correctly excluded. Plumbing/Electrical still return no providers because valid structured service areas are missing. No coverage was invented. Music has 2 and food 1 Event across all dates, but zero upcoming; current-window/weekend zeroes must not be reported as broken lexical retrieval or filled with fabricated Events.
- **Scoped boundaries passed:** anonymous RPC denied, invoker RLS retained, unauthorized neighborhood denied, returned Events approved/current/authorized, Group membership required, Agency notices approved/nonexpired, providers have explicit coverage, and Event/provider/Marketplace action routes match source IDs. Completed-job metrics match the existing verified-review projection; RSVP counts match public structured counts; newest-listing values match creation times. Live comparisons show 1 RSVP among 2 eligible Events, 1 completed job for the 1 covered provider, and newest selection from 11 eligible listings. No Plumbing/Electrical comparison winner can be established without eligible providers.
- Security advisors unchanged from baseline (including existing unrelated findings); not certified advisor-clean. Reference: https://supabase.com/docs/guides/database/database-linter . Full source CI remains green: Database/RLS **36293942320**, Mobile **36293942313**, server/Deno **36293942319**; **544 mobile tests / 96 suites; 42 server tests; typecheck/format/diff passed; lint 0 errors / 15 baseline warnings**.
- **NEW PREVIEW APK APPROVAL REQUIRED** for full Android testing of new clarification choices, selected-provider availability follow-ups and completed-job display. APK 46 predates these mobile changes. Current main is still **`a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`**; approved backend source lives in open #148 stack. Merge/source selection must preserve #145–#148 and prior #143/#144 history before a new build. No build started. Authenticated Edge/model execution and phone/tablet visual acceptance remain pending; provider coverage remains a separate data gate.
- Durable deployment evidence: `docs/evidence/ask-intent-preview-deployment-2026-09-27.json`; 40-query result matrix included. Existing audit: `docs/ASK_INTENT_AUDIT.md`. Resume from live GitHub/Preview; do not redeploy/reapply merely because a chat session stalls.

## 2026-09-27 — Assistant upgrade ready; exact Preview deployment approval required

- Reviewable work is pushed in **#145 (audit), #146 (concepts/planning), #147 (structured retrieval), #148 (grounded response/mobile integration)**. Stack preserves #143/#144 history. Tested application/database/test source: `1e9f4f4b5e41c788ff695b117dc29b7bdde4d074`; later commits are checkpoint-only. Live main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; no PR merged in this task.
- **All final CI passed:** Database/RLS **36293942320** (and push **36293940628**), Mobile **36293942313**, server/Deno **36293942319**. Local **544 mobile tests / 96 suites; 42 server tests; typecheck, format and diff pass; lint 0 errors / 15 existing baseline warnings**. Includes actual SQL metric comparisons before caps, RSVP/newest-listing regressions, outage false-positive exclusion, privacy and existing Event checks.
- **Automatic approval review rejected** applying the new persistent Preview DDL migration: the founder's prior explicit approval covered different named migrations and the existing Edge function, not this new migration. No workaround was used. Readback confirms new migration/RPC absent. Dependent Edge deployment was **not attempted**. Live `ask-my-corner` remains **v7**, JWT verification enabled, deployed files equal main.
- **Exact approval needed:** apply only `20260927040151_assistant_structured_retrieval.sql` (SHA-256 `54bc903bbcf85b7dae072a786f0bf28f4ede47a8a4623dc6f952bd418b2fa1ca`) to Preview **`opeojxwkwwnnncnsuaag`**, then deploy the tested #148 `ask-my-corner` source with **JWT verification retained**, and run scoped verification. This replaces retrieval functions and adds authorized comment/concept helpers; it does not change user records, identity, provider coverage, feature flags or secrets. Protected-main merges remain separately unperformed.
- **Data/acceptance gate:** four Plumbing/two Electrical records have no structured service areas. Electrical public labels name Adenta/Madina and Osu/Labone; never invent East Legon coverage. Valid provider-supplied coverage must be resolved for positive local provider demo acceptance. Existing lighting discussions are not outage evidence. SQL/source checks are not authenticated HTTP/model or native phone/tablet acceptance.
- APK 46 installed successfully but predates the new clarification/provider-follow-up UI. A new Preview APK will require fresh founder approval after backend verification; **no build was submitted**. Production, identities, real communications and unrelated schema/secrets remain untouched.
- Durable evidence: `docs/ASK_INTENT_AUDIT.md`, `docs/evidence/ask-intent-audit-2026-09-27.json`, `docs/evidence/ask-intent-verification-2026-09-27.json`. Resume from live GitHub and these records; do not recreate completed checkpoints or reapply earlier migrations.

## 2026-09-27 — Integrated assistant source green; Preview deployment boundary

- Four reviewable PRs are open: #145 audit, #146 concepts/planning, #147 structured database retrieval, #148 grounded response/mobile integration. Final source/test head `1e9f4f4b5e41c788ff695b117dc29b7bdde4d074` preserves #143/#144 history; no PR was merged.
- Integrated source `1f51931477fa11a78d3f2e73f3f41456ffdbda49` passed Database 36293816023, Mobile 36293816027 and server/Deno 36293816003. Final test-only extension adds RSVP/newest-listing cap regressions; its Database run 36293942320 is pending, Mobile 36293942313 and server/Deno 36293942319 passed. Local: 42 server tests, 544 mobile tests/96 suites, typecheck/format/diff pass, lint 0 errors/15 baseline warnings.
- Live readback corrects the stale function version: Preview `ask-my-corner` is v7, JWT verification true; all five deployed files equal main. New migration/RPC are absent. No current-session deployment or secret change occurred.
- Concrete Preview deployment candidate: only `20260927040151_assistant_structured_retrieval.sql`, SHA-256 `54bc903bbcf85b7dae072a786f0bf28f4ede47a8a4623dc6f952bd418b2fa1ca`, then this tested `ask-my-corner` source with JWT verification retained, project `opeojxwkwwnnncnsuaag` only. It changes retrieval functions, not user/identity/service-area data or feature flags. Completed work is durable before any deployment attempt.
- Positive provider acceptance also needs valid service-area assignments: the two Electrical public labels name Adenta/Madina and Osu/Labone, so they must not be invented as East Legon coverage. Some Plumbing labels mention East Legon but have no structured coverage. Current "lights off" matches include non-outage lighting discussion; v2 guards this with phrase evidence.
- Authenticated HTTP/model execution and Android phone/tablet acceptance remain pending. APK 46 predates clarification/provider-selection UI. No paid build or production action. Evidence: `docs/evidence/ask-intent-verification-2026-09-27.json`; audit and safe semantic-layer design: `docs/ASK_INTENT_AUDIT.md`.

## 2026-09-27 — Ask My Corner intent upgrade prepared in reviewable checkpoints

- Audit #145, concepts/planning #146 and structured retrieval #147 are pushed, stacked above #144 to retain prior deployment/APK records. Integration follows on `codex/ask-grounded-integration`. Live main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`.
- Added concept/category aliases, controlled typo matching, intent priorities, time windows, utility phrase evidence, SQL comparisons before caps, authorized text/comments, grounded notices, clarification actions and selected-provider follow-ups. Details and 16-query baseline: `docs/ASK_INTENT_AUDIT.md`.
- Local integrated checks: 42 server tests; 544 mobile tests / 96 suites; typecheck/format/diff pass; lint 0 errors / 15 baseline warnings. Database checkpoint CI passed; final integration CI pending.
- New migration `20260927040151_assistant_structured_retrieval.sql` remains unapplied. No Edge redeployment, main merge, production action, identity/coverage backfill or EAS build performed.
- Preview data gate: four Plumbing/two Electrical providers have no recorded service areas. Existing "lights off" lexical matches include unrelated lighting discussions; these must not be called outage confirmation. Authenticated HTTP/model and native acceptance remain pending. APK 46 installation succeeded, but it predates the new UI.

## 2026-09-27 — Ask My Corner intent upgrade: checkpoint A

- Live main remains `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; preserves #143/#144 checkpoint history. Full 16-query root-cause table: `docs/ASK_INTENT_AUDIT.md`; machine-readable evidence: `docs/evidence/ask-intent-audit-2026-09-27.json`.
- Actual Preview authenticated-role SQL reproduces zero Plumbing/Electrical providers: four Plumbing and two Electrical records lack any service-area rows. Do not weaken neighborhood authorization or invent provider coverage. Alias/source-planning/metric defects independently confirmed in source.
- Work proceeds in reviewable checkpoints: domain concepts/planning, authorized structured retrieval/comparisons, response/UI integration and regression verification. Existing Event fixes remain intact. No live HTTP/model answer or native visual pass is claimed.
- APK 46 installation succeeded in founder terminal; UI acceptance remains pending. No production writes, Preview mutation, identity edits, communications, merges or new EAS build in this audit.

## 2026-09-26 — Corrected Preview APK 46 built and verified

- The one approved build completed successfully: **APK 46**, EAS **`b6ea9558-74c4-49fe-9f28-f8a9baed72ff`**, build source **`4192a8ac26b5d4059ff066cee3f33abd43f76e19`**, workflow **`36274964615`**. Application/database source exactly matches merged main `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; only build workflow and checkpoint docs differ. PR #144 preserves documentation-only #143 as an ancestor; both remain open pending separate merge authorization.
- APK URL: https://expo.dev/artifacts/eas/-CKQO0JNzc_mLN39FrqBaX9ZJ_wW9ZmSab1c-c5EP70.apk . Size **72,009,198 bytes**; SHA-256 **`839f52a059be36fb5d94cf775517b621124ef47fa0b6fece4a5606f6f7fb7197`**. An independent download matched the workflow checksum.
- Actual artifact passed source SHA, Android version 46, package ID `com.mycorner.trustedpeople`, Preview-only Supabase URL, ZIP integrity, navigation font, media/assistant/Home/public-name markers and the newly added public-name signup text checks. Android apksigner verified the v2 signature. Signer SHA-256 **`79de09929e726b418f4447d1b7f73d6b529b636b5d05a9766fcb39cd068bdc76`** matches APK 45, supporting an in-place update that retains app data.
- Release gates passed: **541 mobile tests / 96 suites**, typecheck, formatting and lint **0 errors / 15 baseline warnings**, Preview environment validation and EAS duplicate preflight. Mobile CI **36274971925** / **36274964618**, Database CI **36274964613**, server/Deno CI **36274964715**, and build workflow **36274964615** all passed at the submitted source. Server tests remain **32 passed**.
- Preview backend canonical public-name repair was already deployed and verified: four historical conversations/two distinct peers resolve public names consistently, with no identity backfill. This build adds the merged canonical self-profile display, explicit signup public-name copy and Find Neighbors avatar batching to the installed Android source. No backend, production, secret or identity changes were made for the build.
- **One-build approval is consumed. Do not submit another EAS build without new founder approval.** Native Samsung phone/Pixel Tablet visual acceptance remains **PENDING**: verify the same public name in Profile, Find Neighbors, inbox and thread; avatars, latest message, timestamp/unread and accessibility; explicit name edits after refocus/polling; genuine unnamed-account fallback; Home Active/Past collapse/counts; phone/tablet rotation. Component/SQL/bytecode checks are not native acceptance.
- Mac install/update: download the URL, verify the SHA-256, then use `adb -d install -r "$HOME/Downloads/my-corner-preview-46.apk"` for one USB phone. Use `adb -e` for one emulator, or `adb devices -l` and `adb -s DEVICE_SERIAL install -r ...` to select among multiple physical devices. Do not uninstall or clear app data as part of this update.
- Evidence: `docs/evidence/canonical-public-name-apk-2026-09-26.json`. The APK and build remain recoverable through EAS and workflow #36274964615; do not start a replacement merely because a chat session stalls.

## 2026-09-26 — One corrected Preview APK explicitly approved

- Founder approved one new Android Preview APK after PR #142 merged and its exact Preview migration was verified. Application source is current main `a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`; build base also preserves documentation-only PR #143 (`4efce7ad487f1a581a47a59e7bff3daab64a014c`). No application/schema changes are added for this build.
- Build purpose: native verification of canonical self-profile public-name display, explicit public-name signup wording and Find Neighbors avatar batching, alongside Messages list/thread, avatar, latest message, timestamp/unread and existing Home disclosure behavior. Backend name resolution is already live and can be consumed by APK 45 on refresh.
- Use the existing `codex/vc-media-foundation` workflow branch, fast-forward only. One submission via the existing Preview profile/environment/internal APK/signing configuration. No production deployment, secret edits, messages or identity mutation.
- Last verified finished build is APK 45 (`c7f685a6-6ffc-4463-99ac-626b7f61c8a2`). Duplicate guard now recognizes that completed build as the prior baseline while retaining all active/unexpected-new-build rejection checks. Require resulting version >45 and confirm the new public-name signup copy in the actual bundle, exact source SHA, Preview project, app ID and navigation font.
- Release gates must pass before submission. Initial build ID/artifact/checksum pending. If submission or later verification encounters an error, inspect/reuse the recorded build rather than submit a duplicate. One-build approval is consumed by that one submission; native phone/tablet acceptance remains pending.

## 2026-09-26 — Public-name repair merged and deployed to Preview

- Founder explicitly approved merging PR #142 and applying only `20260926213111_canonical_public_profile_name.sql` to Preview `opeojxwkwwnnncnsuaag`. The prior merge-approval blocker is resolved. PR #142 merged at **`a77bbe73ad83458ee9f0819a4e2e1cb2aa42008b`**; #140 and #141 were also marked merged because both heads are preserved in its ancestry.
- Exact approved migration applied successfully. Remote history version **`20260926215220`**, name `canonical_public_profile_name`; stored SQL equals the committed source byte-for-byte, and deployed function body matches. Source SHA-256: `b731e2ad0f1f5a5a5938e43aa5a3e8ed193b5e1278a6a3f523b56d6fd3341aef`. The remote timestamp is assigned by the deployment tool: do not reapply based on filename timestamp differences.
- Root cause/fix: Messages omitted the existing public `profiles.display_name` source. The shared resolver now uses saved public edit → identity public name → legacy public profile name (only without a private-identity record) → Neighbor; inactive/missing accounts are unavailable. No legal fields are selected and no identity data is copied. Self Profile uses this canonical RPC; signup explicitly identifies the public-name field; Find Neighbors batches avatars.
- Live verification used read-only transactions and authenticated database-role RPCs. All four historical requester conversations now return public names: two distinct names for two peers. Inbox/thread/Find Neighbors/public-profile projections agree; peer IDs and display fields are correct. Reverse-participant thread resolution and self-name RPC match the same public identity. **No native phone/tablet visual acceptance or authenticated HTTP session is claimed.**

| Participant | Conversations | Before deployment | After deployment | Cross-surface result |
| --- | --- | --- | --- | --- |
| Test peer A | 1 | Neighbor | Existing public name | Inbox/thread/discovery/public profile agree |
| Test peer B | 3 | Neighbor | Existing public name | Inbox/thread/discovery/public profile agree |

- Privacy checks: anonymous/authenticated direct helper execution remains denied; direct client reads of the private name store remain denied; the explicit-edit store still has **zero rows**. This demonstrates resolution without a backfill. No users were renamed, no messages were sent, and no private identity values are included in evidence. Advisor categories/counts are unchanged from baseline; existing findings remain documented, not certified clean (https://supabase.com/docs/guides/database/database-linter).
- Shared Event organizer attribution was verified against authorized source records; all four Festival sources retained valid Event actions, approved visibility and neighborhood authorization. Direct Event retrieval counts: festival 4; festivals 4; What festivals are happening? 4; racing 1; pig 1; pig racing 1; music 2; music festival 5; food 1; food drive 1. These calls deliberately omit planner date bounds and therefore do not replace the prior 30-day planner check or authenticated Edge/model-synthesis acceptance. Assistant v6/JWT verification was not changed or redeployed.
- Final PR-head CI at `07164ba9c1e67483c1de7d940d1049be318e92a5`: Mobile **36274196799**, Database **36274196755**, Media Functions **36274196736**, all passed. The checkpoint-only head has identical application/database/workflow source to tested `5187b52`: **541 mobile tests / 96 suites; 32 server tests; full database/RLS suite; typecheck, formatting, Deno and web export passed; lint 0 errors / 15 baseline warnings**. SQL fixtures cover new/historical conversations, distinct names, both participant directions, private-vs-public identity, missing names, explicit updates, block/suspension and grants; component/hook tests cover names, avatars, batching and refresh hydration.
- **CORRECTED PREVIEW APK APPROVAL REQUIRED.** APK 45 can receive the backend name correction on Messages refresh/refocus; reinstall is not the fix. It cannot contain the newly merged self-profile canonical projection, public-name signup wording or Find Neighbors avatar batching. One corrected Preview APK is required for full Android phone/tablet verification of those source changes. No APK build has been triggered. Production, secrets and identity rows remain unchanged.
- Deployment evidence and this checkpoint are committed on `codex/canonical-public-name-deployed` for a documentation PR. This does not assume authorization to merge another PR. Application main is already the approved merged repair above; no further source changes were made.

## 2026-09-26 — Public-name repair tested and pushed; merge approval blocked

- Repair PR **#142**: https://github.com/pushee-io/My-Corner-Trusted-People/pull/142 . Application/migration/test commit: `5187b5248cec8f7c8f6cca887836e1c177d84043`. Both #140 and #141 heads are preserved as ancestors. Main remains `24fc72db2ec12c6f761e53b2f66c994b903b1824`.
- All relevant CI passed at the repair commit: Mobile `36273823084` (541 tests / 96 suites, format, typecheck, lint 0 errors / 15 baseline warnings, Expo checks and web export); Database `36273823103` (full reset and SQL/RLS suite); Media Functions `36273823112` (32 tests and Deno check). Local tests/typecheck/format/lint also passed. Initial fixture/lint failures and their corrections are recorded below; privacy assertions were retained.
- Read-only Preview verification of the proposed resolver: four existing conversations / two active peers. Peer A: one conversation; peer B: three. Both have existing legacy public identity, current inbox/thread resolve Neighbor, and the proposed chain resolves a non-fallback public name. This is a query comparison, **not deployment or native acceptance**. Private identity values were not printed and no users were edited. The exact screenshot-to-conversation mapping has not been independently established; the verified inbox is the existing fictional requester test account.
- **Automatic approval review rejected merging #142**, stating that prior push/open approval did not explicitly authorize mutation of protected/default main. No retry, alternate merge route or workaround was used. PR remains open; request explicit founder approval to merge it and deploy the reviewed migration to Preview. The new migration remains unapplied and the live resolver remains unchanged; the explicit-edit store still has zero rows.
- Exact pending deployment: `supabase/migrations/20260926213111_canonical_public_profile_name.sql`, SHA-256 `b731e2ad0f1f5a5a5938e43aa5a3e8ed193b5e1278a6a3f523b56d6fd3341aef`, **Preview `opeojxwkwwnnncnsuaag` only**. It replaces the private resolver and retains revoked client execution; it performs no identity backfill/DML. After merge/approval, apply once, verify stored SQL and authenticated inbox/thread/profile/discovery reads, compare security advisors to baseline, and record results. No Edge Function redeploy is needed for this SQL helper change; existing assistant v6/JWT verification stays intact.
- **Corrected APK approval is not yet being requested or consumed.** Backend name resolution will be available to APK 45 on refresh after deployment. A later APK is needed for the new self-profile canonical projection, explicit public-name signup wording and Find Neighbors avatar batching; phone/tablet visual acceptance remains pending. No build, production deployment, secret change, real communication or identity-data mutation occurred during this repair.
- Existing Preview advisor findings are baseline, not a clean security assessment: this scoped change does not alter them. See https://supabase.com/docs/guides/database/database-linter . Application RLS and private-helper access are covered by the passing SQL suite.

## 2026-09-26 — Canonical public-name repair in progress; APK 45 defect confirmed

- Founder reports installed APK 45 still labels multiple conversations Neighbor. Previous verification was insufficient: it tested fallback behavior but did not cover existing legacy public identities.
- Live base `24fc72db2ec12c6f761e53b2f66c994b903b1824`; repair branch preserves both open PR heads #140 (`70ad7c4`) and #141 (`7aa6713`) as ancestors. Deployment evidence, APK 45 build record and Saturday fixture correction are retained.
- Root cause: `private.neighbor_name` consulted the empty explicit-edit store, then `private_identity_profiles.public_display_name`, omitting the established public `profiles.display_name`. Inbox/thread RPCs already select the correct peer dynamically; repository/UI pass the result through. This is backend resolution plus inconsistent self-profile mapping, not primarily stale cache.
- Public-source evidence: `20260724042000_day2b_verified_neighborhood_access.sql` defines the public-profile projection with identity public name then profiles.display_name; `20260802010000_events_complete.sql` publishes profiles.display_name as Event organizer/comment/attendee name; self Profile displays it. Preview's compatibility schema lacks that historical public-profile view. Feed/Marketplace attempt batched profile-name reads but own-only profile RLS can suppress peers; those attempts alone are not proof of live public visibility. Legal identity fields remain separate and are never selected by this repair.
- Read-only Preview trace: four existing requester conversations map to two distinct peers. Both have legacy public profile names and no explicit newer public name; all four inbox/thread results were Neighbor. Peer B also matches its existing public provider name. A broader diagnostic was rejected by automatic review for unnecessary identity fields; the successful replacement returned only participant labels and provenance booleans. No private names, auth IDs or seed keys are documented.

| Participant | Legacy public name present? | Before RPC | Before UI | Root cause |
| --- | --- | --- | --- | --- |
| Test peer A (one conversation) | Yes | Neighbor | Neighbor from unchanged RPC mapping; founder reports device defect | Legacy public source omitted |
| Test peer B (three conversations) | Yes; matches public provider name | Neighbor | Neighbor from unchanged RPC mapping; founder reports device defect | Legacy public source omitted |

- Repair `20260926213111_canonical_public_profile_name.sql`: active account → explicit saved public edit → identity public name → legacy public profile name only without an identity record → Neighbor. Blank identity public names suppress legacy fallback; generated New neighbor is unnamed. Suspended/missing peers return Neighbor unavailable. No backfill or identity-data mutation; helper stays private, caller RLS/block/neighborhood checks unchanged.
- Self Profile uses the same canonical RPC as the editor; Find Neighbors batches avatars; signup explicitly labels its name public. Existing inbox/header avatar behavior is retained. Foreground 10-second polling, refocus and authorized realtime refresh already hydrate current RPC values without reinstall.
- Regression work: full-database fictional A/B/C/D/E fixtures test old/new conversations, both participant directions, consistency, explicit changes, legal-name separation, block/suspension/fallback and private helper grants. Component/hook tests verify display/accessibility, correct avatars, batching, self-profile source and changed-name hydration. Local validation: 541 mobile tests / 96 suites, 32 server tests and typecheck passed. Media Functions CI `36273554325` passed including Deno check. Initial Mobile CI caught JSX lint in the new avatar test; corrected before final verification. Database CI and final Mobile CI remain pending; migration is NOT YET applied to Preview.
- Database CI exposed the shared Event organizer-name helper's dependency on this resolver. Existing privacy fixtures labeled legacy profile values private without creating private identity records. Fixtures now explicitly create private identity with blank public display name, retain their adversarial legacy values, and retain every non-leakage assertion. No production behavior was special-cased for test names. New A/B/C coverage separately proves legitimate legacy public identities resolve automatically. Initial avatar JSX file was outside the repository's `.test.ts` match; restored a lint-clean `.test.ts` test and verified it executes.
- No paid build authorized: APK 45 build approval is consumed. The backend resolver can improve APK 45 on refresh after deployment; source changes to self Profile, signup copy and neighbor avatar batching require a corrected APK for full native acceptance. Do not falsely claim a backend-only correction requires reinstall. Production, communications and identity mutations remain prohibited.

## 2026-09-26 — Preview APK 45 built and artifact verified

- One approved Android Preview build completed: version 45, source `980570c4adf7c9ac9bd850f32265f32d7e7367b5`, EAS `c7f685a6-6ffc-4463-99ac-626b7f61c8a2`. Build workflow `36271219730` passed. The application source matches main `24fc72db2ec12c6f761e53b2f66c994b903b1824`; only build workflow and checkpoint documentation were added for submission.
- APK: https://expo.dev/artifacts/eas/7teO9Nca9Thz6_JTQT87Lnc4aF7RYl1wTwhXP4gy2OE.apk . Size 72,009,054 bytes; SHA-256 `a0ddf0fb371281d08eea6985182eda937c30cc40e93c8b2d29f223c3446e14d9`.
- Actual APK passed source SHA, Preview-only Supabase URL, application ID, version, ZIP integrity, media/navigation font and UI/RPC marker checks. Includes counted collapsible Active/Past sections, public-name editor and Messages avatar batching. Downloaded checksum independently matched; signing certificate SHA-256 `79de09929e726b418f4447d1b7f73d6b529b636b5d05a9766fcb39cd068bdc76` matches the previously verified APK. Install as an update and retain app data.
- Release gates: 535 mobile tests / 94 suites, format, typecheck, Preview environment and EAS duplicate preflight passed; lint zero errors / 15 existing warnings. Mobile CI `36271219787` and Media Functions CI `36271219761` passed, including web bundle verification.
- Initial Database CI `36271219839` failed on a time-sensitive test: Saturday's 10 AM fictional event was excluded by a lower bound of now() on Saturday afternoon. Corrected only `supabase/tests/neighborhood_ai_preview_fixture.sql` to include today's fixture. No application/migration/remote Preview changes. Local PostgreSQL date-window reproduction confirmed the issue; full Database CI `36271594200` passed at test-only commit `84be952bc58677a4e8252a1f48c66dde75f56d0b`. The APK source itself remains `980570c`; no replacement APK was submitted or needed for this test change.
- One-build approval is consumed. No second EAS submission, production action, backend deployment, live fixture mutation, identity update or real communication occurred. PR #140 remains open; its earlier APK approval requirement is superseded by this build checkpoint.
- Native Samsung phone/Pixel Tablet layout, accessibility, rotation, Home disclosure/counts, public-name save/header/avatar and signed-in assistant answer acceptance remain PENDING. Artifact/tests are not native acceptance. Preview backend v6 authenticated HTTP/model synthesis also remains unverified without a signed-in session.
- Evidence: `docs/evidence/home-public-name-apk-2026-09-26.json`. Verify all ten search phrases while preserving date/neighborhood/private-event rules; accounts without an explicitly approved public name must remain Neighbor.

## 2026-09-26 — One Preview APK approved for Home and public-name repairs

- Founder explicitly approved one new Preview APK after checkpoint PR #140 was opened. Source base is freshly fetched main `24fc72db2ec12c6f761e53b2f66c994b903b1824`; the application includes merged PRs #136–#138. PR #140 remains open and is documentation-only.
- Use the existing workflow-enabled `codex/vc-media-foundation` branch, confirmed to be an ancestor of main, for a fast-forward build trigger. Only workflow and checkpoint documentation differ from main. This does not merge PR #140 or alter production.
- Existing Android `preview` profile, `preview` environment, internal APK distribution, remote version auto-increment and signing configuration retained. One submission only; inspect the same build after any subsequent verification failure.
- Last known completed build is APK 44 (`b30911f6-4b82-47ef-91d2-38e7732cd0e2`). GitHub history shows its successful workflow `36148445698` and no newer EAS Preview workflow in the latest 100 runs. The submission workflow must independently check EAS and block active or unexpected newer builds.
- Workflow gates run full mobile format/lint/typecheck/tests and Preview environment checks before submission. Actual artifact must match source SHA and Preview backend, have version greater than 44, and contain Home Active/Past labels and the public-name editor/RPC alongside existing media, navigation and assistant markers.
- Preview deployment was completed in the preceding checkpoint: both migrations applied, assistant v6 with JWT retained, scoped retrieval checks passed. Detailed evidence is in PR #140; do not reapply/redeploy. Authenticated Edge synthesis and native phone/tablet visual acceptance remain unverified.
- Build ID, artifact URL, checksum and actual native acceptance are pending. This commit records approval before external submission. No production or backend changes are authorized by this build checkpoint.

## 2026-09-26 — Approved Preview migrations applied; assistant v6 verified at retrieval layer

- Fresh live GitHub main remains `24fc72db2ec12c6f761e53b2f66c994b903b1824`. PRs #136–#139 were reused without reimplementation. Founder explicitly approved this Preview-only deployment.
- Applied exact committed SQL to `opeojxwkwwnnncnsuaag`: `20260926003542_keyword_discovery.sql` recorded remotely as `20260926011059`; `20260926004155_messaging_public_display_name.sql` as `20260926011117`. MCP assigns deployment timestamps; both stored SQL statements match their source files byte-for-byte. Do not reapply based only on differing filename timestamps.
- Deployed merged `ask-my-corner` v6, ACTIVE, `verify_jwt=true`. All five downloaded deployed files exactly match merged source. Anonymous HTTP invocation returns 401. No production, secrets, flags, paid EAS build, real communications, or persistent identity data were changed.
- Live retrieval under authenticated role passed all ten requested searches. Merged planner and source validator were run against actual Preview results: festival/festivals each 4 Events; full question 1; racing/pig/pig racing each 1; music 2; music festival 5; food/food drive each 1. Full question retains the existing next-30-days window, returning the applicable Pig racing event; unrestricted direct SQL finds 4 festivals. Music festival ranks the music festival first. Prefix, explicit date bounds, unauthorized neighborhood denial, invite-only exclusion, RLS and source/action route checks pass. No Events were inserted or fabricated.
- Non-Event live keyword checks pass: fence provider 1, table Marketplace listings 3, repair Group discussion 1, park Feed post 1, road Agency broadcasts 2. Matching occurs before the existing cap; local PostgreSQL regression covers more-than-eight candidates.
- Public-name checks pass: original approved name retained; 16 profiles legitimately remain Neighbor; new consent store remains empty. Supported save/update/trim RPC tested only as the fictional fixture actor and rolled back; another account remained unchanged. Direct table reads/anonymous saves denied; no legal fallback. Four existing inbox conversations expose name/peer/preview/timestamp/unread fields, and thread names agree. Approved-name rendering, batched avatars and explicit editor flow pass component tests; no new live conversation or message was created.
- Fresh validation: 47 scoped mobile tests / 6 suites, 31 server tests, mobile typecheck all pass. Relevant PR #136–#138 Database/server/Mobile CI rechecked live: all success (run IDs in evidence). Previous full mobile result remains 535 / 94; it was not rerun. Home defaults, counts, collapse/reopen and all same/different-provider requests pass source/component coverage.
- Limits: no signed-in Preview Auth session/test-login credentials available in this workspace, so v6 authenticated HTTP model synthesis is NOT verified. SQL role tests and source readback are not end-to-end HTTP or native acceptance. Existing live inbox peers lacked approved names; approved-name inbox/header acceptance relies on component tests plus live consent resolver checks.
- NEW PREVIEW APK APPROVAL REQUIRED: APK 44 predates Home disclosure, public-name editor and Messages batch avatars. Backend deployment cannot update its bundled React Native code. Phone/tablet visual/accessibility acceptance remains pending. Do not build until separately approved.
- Persistence approval resolved: on 2026-09-26 the founder explicitly approved pushing `codex/preview-keyword-public-name-deployment` and opening its checkpoint PR. This branch carries all five requested docs and sanitized evidence. The earlier automatic publication rejection is historical; no workaround was used. This approval does not authorize merging, a paid APK build, or another backend deployment. The separate recovery report preserves the original verification record.
- Evidence: `docs/evidence/preview-deployment-2026-09-26.json`. The older blocked-deployment entries below are historical and superseded by this entry.

## 2026-09-26 — Three repairs merged; Preview deployment blocked by approval review

- Implemented in order and merged after green checks: keyword PR #136 (`249d17f`), Messages PR #137 (`fb296d6`), Home PR #138 (`8ae3c57635b8b1f08ef5feb47f6f92447a0bab51`). Source of truth was freshly fetched GitHub main; no failed-session state was recovered. Each checkpoint includes tests and durable documentation.
- CI: #136 Database `36205768702` / server `36205768747`; #137 Database `36206086649` / Mobile `36206086625`; #138 Mobile `36206349039`, including web bundle. All passed. Local final mobile **535 tests / 94 suites**, server **31 tests**, typecheck/Deno check/format/diff review pass; lint **0 errors / 15 existing warnings**.
- Automatic approval review **rejected** applying `20260926003542_keyword_discovery.sql` and `20260926004155_messaging_public_display_name.sql` to Preview `opeojxwkwwnnncnsuaag`: persistent live schema/function/privilege changes need explicit approval for that target and those migrations. No workaround was used. Readback confirms neither migration is applied. Edge deployment was not attempted because it depends on the keyword migration. Existing deployed assistant is version 5; all five files matched the handoff GitHub source exactly before any deployment attempt.
- Exact next approval: apply those two committed migrations to Preview `opeojxwkwwnnncnsuaag`, then deploy the merged `ask-my-corner` source there with JWT verification retained and run scoped Preview retrieval/public-name checks. This does **not** include production or a paid EAS build. No production, user identity data, secrets, flags or paid build were changed.
- Public-name root cause: 17 Preview profiles, only one populated public identity. Existing approved names are retained; an account without an approved public name legitimately remains Neighbor until its user saves one through the new Profile/Messages public-name editor. Never copy private legal identity or `profiles.display_name` as a shortcut. Inbox/thread name resolution stays in one RPC; avatars are batched.
- APK 44 predates the Home collapse and public-name editor. Native phone/tablet visual/accessibility acceptance remains pending a future separately approved build. Do not claim deployed/live correction or native acceptance yet. Evidence: `docs/evidence/keyword-messages-home-2026-09-26.json`.

## 2026-09-26 — Home request sections collapse without losing requests

- Active Requests and Past Requests now have counted, full-width accessible disclosure buttons and vector chevrons. Active defaults expanded; Past defaults collapsed. Counts remain visible when collapsed, including zero counts. Request IDs/cards and active/past partitioning are unchanged; expanding still maps every request, including repeated jobs with the same provider.
- Targeted coverage: 18 Home/partition/events tests, including six same-provider requests, multiple providers, active/completed/cancelled mix, collapse/reopen and live count updates. Full mobile suite: **535 tests / 94 suites passed**. Typecheck/format pass; lint zero errors/15 existing warnings. Mobile CI is the merge gate. Native phone/tablet visual and screen-reader acceptance remain pending; no paid APK build or production deployment.
- Messages PR #137 merged at `fb296d6a4f3da2f058ff8d74091fba4bb5fe799c` after Mobile CI `36206086625` and Database CI `36206086649` passed. Keyword PR #136 is already merged with Database/server CI success. Preview backend deployment remains pending at this implementation checkpoint.

## 2026-09-26 — Messages public-name repair

- Keyword PR #136 merged at `249d17f01f6962ce6457e52aced9e73d565acf9b`; Database CI `36205768702` and Media Functions CI `36205768747` passed.
- Root cause verified read-only in Preview: 17 profiles, only one private identity/public-name row. Inbox/thread already rendered the database projection correctly. Never use `profiles.display_name` or legal identity as an implicit public fallback.
- Add a private, RLS-protected public-name consent store and caller-only RPC. Existing explicitly public identity names remain supported; users without one can explicitly save their public display name from Profile or Messages. Names resolve inside the existing inbox/thread RPC, without per-peer profile requests. Inbox avatars now use the existing batch loader. Missing approved names still display Neighbor until the account supplies one; migration does not invent/backfill legal names.
- Local mobile targeted name/repository/realtime tests and typecheck pass; lint zero errors/15 baseline warnings. SQL regressions verify public names, missing-name fallback, updates, isolation, suspension and legal-name exclusion; Database/Mobile CI are merge gates. No production, Preview deployment or paid APK build in this checkpoint.

## 2026-09-26 — General keyword discovery repair

- Root cause: deterministic “happening” intent discarded topic terms before an eight-event chronological cap; model terms used AND/phrase-sensitive websearch with no prefix matching. Preserve topics, search short keyword requests across authorized source families, normalize English lexemes and use OR prefix recall with relevance ordering before the existing limit. No Festival-specific rules. Events expose title/description (no category column); provider service labels/categories remain searchable.
- Added festival/festivals/question/racing/pig/music/food/food-drive, prefix/ranking and result-cap regressions. Existing authorization, RLS, date, block, removed-content, grounding and reauthorization gates remain unchanged.
- Local: 31 server tests including real PostgreSQL keyword checks; 23 targeted mobile assistant/Search tests; mobile typecheck passes; lint zero errors/15 baseline warnings. Database and server CI are merge gates. Migration and Edge code are checked in only; Preview/production are not deployed and APK 44 predates the repairs. No paid build.

## 2026-09-25 — AI pill/composer Preview APK 44 verified

- The one approved build completed: Android version 44, source `c89b4a86d5efa81d867fa0f4c85ab5f06b574ba3`, EAS `b30911f6-4b82-47ef-91d2-38e7732cd0e2`. Build workflow `36148445698` and Mobile CI `36148445661` passed. Release gates: 524 tests/92 suites, typecheck, formatting, lint zero errors/15 baseline warnings, Preview configuration and duplicate preflight passed.
- Download: https://expo.dev/artifacts/eas/C_0oNAHrFqB8lLnP5WkFZVEYTsIGc3Pvpkfoj3qwock.apk . SHA-256 `f2ecbf3f102d8ffd45438902266bf3e29c7c35e2ad83f98574e36c11eb59c4ee`.
- Actual APK checks passed source commit, Preview backend, application ID, ZIP integrity, media/navigation font and AI bytecode, including Ask My Corner AI, composer placeholder/loading/fallback labels and manifest version 44. This APK includes AI/Messages pills, empty composer, optional Search handoff and compact Home.
- Existing signing/profile retained. Install as an update (`adb install -r`) to retain data. Samsung phone and Pixel Tablet layout, keyboard, unread-count/navigation, screen-reader and portrait/landscape acceptance remain PENDING, as does browser visual/focus acceptance. Artifact checks do not establish native acceptance.
- Evidence: `docs/evidence/ai-pill-preview-2026-09-25.json`. One-build approval is consumed; do not submit another paid build without fresh approval. No production/backend changes.

## 2026-09-25 — AI pill/composer Preview APK approved

- Founder explicitly approved one new APK after PR #134 merged at `1d678b66eabf49519f3f9bfad7da37fe300f6e27`. Main Mobile CI `36147988569` passed. This approval permits one Preview/internal Android APK using existing signing, backend and profile.
- This single build-trigger commit records approval before submission. Duplicate preflight recognizes completed APKs 42 and 43 and blocks active or unexpected newer completed builds. Release gates run before submission.
- Actual artifact checks now require Ask My Corner AI, empty-composer placeholder/loading/fallback labels and Android version greater than 43. AI/Messages pills, Search handoff and empty input are included. No backend/production changes.
- Build ID, artifact and Samsung phone/Pixel Tablet acceptance pending. If submission succeeds and a later check fails, inspect that same build; do not submit another. Native layout/keyboard/screen-reader and web visual acceptance remain pending.

## 2026-09-25 — AI and Messages pills; empty assistant composer

- Visible assistant name is now **Ask My Corner AI**. AI and Messages share a compact full-radius ActionPill using existing Create Request AI color/spacing/typography tokens, 48 dp minimum target, wrapping, full-button navigation, pressed/focus styling and accessible labels. Messages retains unread counts and Notifications navigation. Home retains one AI entry and supporting copy with none of the four suggestion questions.
- Composer starts empty with `Ask anything about your neighborhood...` as placeholder only. Generic entries no longer pass sample questions. Natural-language Search retains its actual query as an optional explicit-submit pill outside the empty composer; it never auto-submits. Send clears the field immediately, shows the last two submitted questions (existing bounded context), exposes loading feedback, disables blank/short questions and guards duplicate requests synchronously. Follow-up context, grounded sources/actions/feedback, account/background clearing and stale-response protection remain intact.
- Rounded multiline input is bounded to 90–160 dp, with scrolling; iOS keyboard avoidance added and Android retains native resize/scroll handling. Ask hardware Back dismisses a visible keyboard before navigating. Actual IME, portrait/landscape, safe-area, screen-reader and large-text acceptance remains pending on Samsung phone and Pixel Tablet emulator. Browser visual/focus acceptance remains pending (prior preview blocked with ERR_BLOCKED_BY_CLIENT); component tests do not establish device/browser visual PASS.
- Local verification: **524 tests / 92 suites passed**, typecheck and formatting passed, lint **0 errors / 15 existing warnings**. Coverage includes Home prompt absence, empty input/placeholder, optional Search handoff, submit/clear/follow-up, duplicate prevention, pill navigation/pressed/focus, Messages unread state, source actions/privacy and Android keyboard Back. CI is the merge gate.
- No backend/production changes and no new APK submitted. APK 43 predates this checkpoint; prior build authorization is consumed. Before a separately approved future build, update the APK bytecode assertion from the old Home accessibility label to `Ask My Corner AI`, record fresh approval and recheck EAS for duplicates. The paid workflow is deliberately unchanged in this checkpoint.

## 2026-09-25 — Compact Home Preview APK 43 verified

- One approved build completed: Android version 43, source `46b71bba5281abe0a9b2d7fb7c390be4dd3e361c`, EAS `34e50a41-a32d-42ce-93b7-8baf91518764`. Build workflow `36103325111` and Mobile CI `36103325160` passed: 517 tests/92 suites, typecheck, format, lint (zero errors/15 baseline warnings), Preview configuration.
- Download: https://expo.dev/artifacts/eas/rbEdLc518KOnDmbQ__8Y5Evvr5Tyky6DJfdYhBUfMn0.apk . SHA-256 `e17f485404280fd97b5510a8d7c48a6c82c2235139b0f3801d1f876b5e487be0`.
- Actual artifact passed source/backend/package/ZIP/media/font/Ask checks, including the compact Home accessibility label and manifest version 43. Home now has one Ask My Corner entry and subtitle without the four suggestion buttons. AI functionality and Search remain intact.
- Existing EAS Preview signing configuration retained. Install as an update and retain app data. This one-build authorization is consumed; no additional paid build is authorized.
- Evidence: `docs/evidence/compact-home-preview-2026-09-25.json`. Samsung phone/Pixel Tablet visual, tap, screen-reader and responsive acceptance remains PENDING; web visual/focus acceptance is also pending. Test compact spacing and assistant navigation after installation. Artifact checks do not constitute native acceptance.
- No backend or production changes.

## 2026-09-25 — Compact Home Preview APK approved

- Founder explicitly approved one new Preview APK after PR #132 merged at `de00de1b30987b3d7b92cf0b6ebfae519afed04f`; main Mobile CI `36103186541` passed.
- Single build-trigger commit records approval before submission. Existing Preview/internal Android profile, backend and signing are retained. Duplicate preflight recognizes the already-completed APK 42 and blocks any active or newer unexpected completed build.
- Actual artifact checks require the compact Home accessibility label and version greater than 42. Full release gates run before submission. No backend or production change.
- Build ID/artifact and device acceptance pending. This permits one submission only; if subsequent verification fails, inspect that same build rather than submitting another.

## 2026-09-25 — Compact Home Ask My Corner entry

- Removed the four Home suggestion buttons and their wrapping containers. Home retains one content-sized Pressable with Ask My Corner, the existing subtitle, a 48 dp minimum touch height, keyboard focusability and the label "Ask My Corner, neighborhood assistant". No fixed section height or leftover prompt-row gap remains.
- Existing assistant navigation/prefill, shared non-Home entries, Search handoff and the dedicated assistant placeholder are retained. No retrieval, source/action, feedback, follow-up or backend changes.
- Added Home presence, one-target accessibility, four-prompt absence and tap-navigation coverage, plus dedicated-screen placeholder coverage. All 517 tests/92 suites pass; typecheck passes; lint has zero errors and 15 existing warnings. Targeted assistant/Search tests pass (17 tests). CI is the merge gate.
- Samsung phone and Pixel Tablet native visual/accessibility acceptance remains pending: this workspace has no connected adb/device. Browser access to the local web component preview was blocked (ERR_BLOCKED_BY_CLIENT), so actual browser layout/focus verification is also pending; no screenshot/native PASS is claimed.
- APK 42 predates this cleanup. No new build is authorized or submitted. A separately approved Preview APK is needed to verify the installed native change. Check compact height, subtitle wrapping, tap target and screen reader on phone/tablet, plus keyboard focus on web.

## 2026-09-25 — Ask My Corner Preview APK 42 verified

- The one approved build completed: Android version 42, source `55c7b5b5467303a7acd52099f6df90a24d977adb`, EAS `a352ebca-9cee-4155-b564-125df0a67288`. Build workflow `36100561584` and Mobile CI `36100561475` passed; 515 tests/92 suites, format, typecheck, lint and Preview environment gates passed.
- Download: https://expo.dev/artifacts/eas/caC9gh57R6YHwyNZnlNDtuJhoZImytVPr8qruJlMfxE.apk . APK size 72004042 bytes; SHA-256 `53a85dec082742101dafd33887878d9a74644e94bc9ba530a46228489ef9f633`.
- Workflow verified actual source commit, Preview backend, package, ZIP integrity, media/navigation font, existing review/comments/Back labels and Ask My Corner entry/endpoint/context/feedback bytecode. Local signing-certificate extraction matches the previously verified APK certificate `79de09929e726b418f4447d1b7f73d6b529b636b5d05a9766fcb39cd068bdc76`.
- EAS build-history preflight passed before the single submission. Approval is consumed; do not submit another paid build without fresh approval. Evidence: `docs/evidence/ask-my-corner-apk-2026-09-25.json`.
- Install as an update using Android Update or `adb install -r`, retaining app data. Samsung phone/Pixel Tablet acceptance is PENDING: all five questions, source actions/RSVP/provider request, feedback, keyboard, rotation, Back and conversation clearing. Follow `docs/AI_NEIGHBORHOOD_ASSISTANT.md`; artifact verification does not establish native acceptance.
- No production deployment, backend modification or secret change occurred in this build checkpoint.

## 2026-09-25 — One Ask My Corner Preview APK approved

- Founder explicitly approved one new APK following the recovery gate. Base main: `f80d345a6a3132ec183f79658dac9b9f9cc290b0`. This build includes merged Ask My Corner UI and uses the existing Android Preview profile, backend and signing configuration.
- This single explicit build-trigger commit records approval before external work. Release gates run before submission; EAS build-history preflight blocks active or newly completed Preview duplicates. Actual APK checks include Ask entry, endpoint, availability and feedback bytecode.
- Approval permits one submission only. Build ID, download, version, checksum and native acceptance remain pending. If submission occurs and later inspection fails, inspect the same build; do not submit another.
- No production deployment or backend change. Samsung phone and Pixel Tablet acceptance follows artifact verification.

## 2026-09-25 — Recovery reconciled; Preview v4 deployed; APK approval gate

- Reconciled live main against the recovery prompt: main initially remained `2e5968d170d53e4aeb0cef87150b82496ba5c73d`, but PR #129 and live Preview had already advanced. Reused completed work and its saved five-question HTTP 200 evidence; did not reseed fixtures or repeat paid model calls.
- PR #129 merged at `2c08a8f8b701b2875cf0496f010ff6179db7c6be` after Database CI `36093128747` and Media Functions CI `36093128751` passed for head `8bfb211b7908f5bfeb09e686a0767b35bfa06440`. It fixes latest-topic follow-ups and preserves all five demo intents.
- Preview `opeojxwkwwnnncnsuaag`: assistant flag confirmed enabled; fictional event, provider, road notice and park post each persisted once. Live metadata corroborates five answered intents, family follow-up, saved feedback/click and zero-token privacy refusal.
- Deployed checked-in PR #129 source as `ask-my-corner` v4 with JWT verification. Readback exactly matches all five submitted files. Targeted assistant/privacy/grounding tests: 17/17 passed. Anonymous endpoint check: HTTP 401. Original authenticated five-question evidence remains explicitly v3; this recovery did not repeat it on v4.
- Latest recorded EAS Preview APK workflow remains `35958534464`, source `912134c59fd046d772593aaadeb35e28da7288f8`, APK 41. No newer EAS Preview APK workflow was found among the latest 100 repository runs; direct EAS-console activity was not independently inspected. No build was triggered in recovery.
- NEW PREVIEW APK APPROVAL REQUIRED: one Android `preview` / `preview` environment / internal-distribution APK using existing signing and backend, with remote version auto-increment. APK 41 lacks Ask entry/Home/Search handoff, sourced answer cards/actions, follow-ups, feedback and conversation clearing. Native Samsung phone/Pixel Tablet navigation, keyboard, lifecycle, RSVP and action acceptance remain pending and need the updated application installed.
- Before submitting an approved build, recheck main and existing EAS builds to prevent duplicate submissions. Production, secrets, RLS and fixture data were not changed by recovery. See `docs/evidence/ai-neighborhood-preview-2026-09-25.json` for separate original-live and recovery evidence.

## 2026-09-25 — Ask My Corner live Preview verified; native acceptance pending

- Implemented and merged as separate green checkpoints: #125 retrieval (`f25c250`), #126 grounded server (`a7f9c5d`), #127 global UI (`3d8fae1`), #128 guarded demo (`2e5968d170d53e4aeb0cef87150b82496ba5c73d`). Final Database CI `36092431531`, server CI `36092431505` and mobile CI `36092015566` passed.
- Preview `opeojxwkwwnnncnsuaag`: migration remote version `20260925033940`; `ask-my-corner` Edge v3 active with JWT verification; `ai_neighborhood_assistant=true`. Existing OpenAI configuration reused (`gpt-4.1-mini`). Production was not activated.
- All five exact founder demo questions returned HTTP 200 with authorized sources and validated verbatim excerpts. FenceCare has actual 4.0/count 1 completed-job review; Food Drive uses approved Ama K. (fictional demo) identity. Park history correctly states no formal decision. Every demo record is explicitly fictional; fixture is guarded/idempotent/manual-only.
- Family-friendly conversational follow-up passed live. Feedback and source click returned 200 and stored against the correct answer; private-DM query refused with zero sources/model tokens. Disabled flag previously returned safe 503/Search fallback. Verification login was signed out with local scope (204); test-account credentials and existing device sessions were not changed.
- 515 mobile tests/92 suites, 28 server tests, SQL/RLS/fixture/quota/feedback CI, typecheck and format pass; lint zero errors/15 baseline warnings. New private metrics tables intentionally have RLS with no client policy/grant (deny all); security advisor reports this as informational, consistent with the private existing pattern.
- Evidence: `docs/evidence/ai-neighborhood-preview-2026-09-25.json`. New code is NOT in APK 41. No new paid APK has been built. Next gate: separately approve one Preview APK, install as an update on phone/tablet, then execute `docs/AI_NEIGHBORHOOD_ASSISTANT.md` native acceptance. Do not claim Android acceptance or the complete definition of done yet.
- Added a latest-topic follow-up regression: an earlier provider question must not override a newer event question. Local 28 server tests pass; final server CI and redeployment of this small correction are pending.
- Source gaps remain explicit: business/deal repository, formal poll/decision store, and broader comment-history retrieval. Core five-question demo is live; no invented business deals, votes, safety guarantees or paid organic rankings.

## 2026-09-25 — Ask My Corner Preview demo checkpoint

- Global UI PR #127 merged at `3d8fae1d455519a86f6e0284b161614b83130ec3`; Mobile CI `36092015566` / `36092006196` passed. Local mobile: 515 tests, typecheck, format, lint zero errors/15 baseline warnings.
- Added manual, idempotent, project/environment-guarded fictional Preview fixture: weekend Food Drive + approved public organizer, FenceCare/carpentry + matching completed job/review, clearly fictional approved road notice, and park discussion with no invented formal decision. Rollback-only live Preview retrieval verified the records and relationships.
- Added fixture CI assertions, feedback ownership and quota tests; active Agency notices remain eligible even if published before a today query. 27 server tests pass; Deno/Database CI are merge gates.
- Actual Preview fixture persistence/flag activation/live Responses verification pending. Android phone/tablet acceptance and new APK remain unperformed; APK 41 predates this feature. No production activation.

## 2026-09-25 — Ask My Corner global UI checkpoint

- Server PR #126 merged at `a7f9c5dd751a690bef9637c5afc9c92f5f4989bb`; Database CI `36091340416` and server CI `36091340433` passed. Preview Edge `ask-my-corner` v1 deployed with JWT verification; flag remains off pending fixture/live checks.
- Added restrained shared-header entry, Home prompts and natural-language Search handoff. Answer cards expose dates/provenance, actual review counts, approved organizer identity, and existing event/RSVP, provider/request, Group, Feed, Agency and Marketplace actions.
- Follow-ups retain two question texts only; account changes, backgrounding and leaving the screen clear answers/context and invalidate late requests. Source-focused Feed/Group links fetch the selected row rather than relying on the latest fifty posts. Helpful/Not helpful/Inaccurate feedback and Search fallback implemented.
- Local 515 mobile tests/92 suites and typecheck passed. Lint has no errors; formatting/CI are merge gates. Preview fixtures/live verification and native phone/tablet acceptance remain pending; APK 41 does not contain Ask My Corner.

## 2026-09-25 — Ask My Corner grounded server checkpoint

- Retrieval PR #125 merged at `f25c25076c6edcfe56053cd4952241298c292055`; Database CI `36090935138` and `36090931760` passed. Authorized migration applied to Preview `opeojxwkwwnnncnsuaag`; assistant flag remains off until deployment/demo verification.
- Added Ask Edge Function using existing OpenAI credentials/model configuration and shared Responses transport with Structure with AI. Fixed tools, bounded date windows, short question-only follow-ups, approved field projection and PII redaction. AI may select exact excerpts only; invented facts/links fail validation. Re-retrieval before response revokes sources removed during inference.
- Feedback/click/version/intent/latency/token metrics contain no conversation text. Limits and no-store behavior retained. Search remains independent.
- Local 25 server tests and Deno typecheck passed. Server CI/merge, mobile UI, Preview fixtures and Android acceptance pending. No paid APK or production activation authorized.

## 2026-09-25 — Ask My Corner retrieval checkpoint

- Audited live main `a5842b79c173833adf25299d74f169dfe8f49f42`, Search, existing Responses/Edge integration and authorization.
- Added disabled-by-default, bounded SECURITY INVOKER neighborhood retrieval for Events, Feed, accepted Groups, verified Agencies, providers/real reviews and Marketplace; private data sources excluded. Approved public organizer identity replaces potentially legal profile name.
- Added private quotas/metadata/feedback foundation and role-switched SQL security tests. Database CI pending before merge; no Preview deployment or activation yet.
- Continue with grounded server orchestration and global UI. Business/deal and formal poll data are absent; do not fabricate them. See `docs/AI_NEIGHBORHOOD_ASSISTANT.md`. No APK/production activation authorized by this directive.

## 2026-09-24 — Review/comments/Back APK version 41 verified

- The one approved Preview APK completed: version 41, source `912134c59fd046d772593aaadeb35e28da7288f8`, EAS `b545caec-80fa-4946-afac-728061e39f90`. Build workflow `35958534464` and Mobile CI `35958534387` passed, including 504 tests, typecheck, formatting and lint (zero errors/15 baseline warnings).
- Download: https://expo.dev/artifacts/eas/kjy7J86ruUZUD3fzCG5Q_OjeR-RvmxzhzoVnPgEHdNk.apk . File `my-corner-preview-912134c.apk`, 71,991,858 bytes; SHA-256 `dee63dc086ec355c0453d2c4d6f7937d78c9b62a48d1036f8d1bdf8e804f0cb5`.
- Verified actual APK source/backend/package, media/icons, review/comments/Back bytecode, archive integrity, manifest version 41 and same signing certificate as version 40. Install as an update using `adb install -r` or Android Update; keep the existing app/data.
- Evidence: `docs/evidence/review-comments-back-preview-2026-09-24.json`. One-build approval consumed; no additional build authorized. No backend or production changes.
- Samsung/Pixel Tablet functional acceptance remains PENDING. Test dynamic requester review CTA and already-reviewed state, Feed/Group/Event comments/draft/dismissal, global visible and Android Back/history/Home fallback. See `docs/REVIEW_COMMENTS_BACK_UX.md`. Artifact verification does not establish native acceptance.

## 2026-09-24 — One review/comments/Back Preview APK approved

- Founder explicitly approved one new Preview APK after PRs #119–#122 merged. Build the latest merged review CTA, collapsible comments and shared Back header with existing Preview backend/signing configuration.
- One explicit build-trigger commit submits the approved APK. Workflow release gates rerun tests/typecheck/lint/format and inspect APK provenance, backend/package, media/icons and new UX bytecode markers.
- Build result/download and Samsung/Pixel Tablet acceptance pending. This authorizes one build only; no production deployment or backend change.

## 2026-09-24 — Review CTA, comments and global Back merged

- Completed requester review CTA: PR #119, merge `bc2ab3b70964cf2c48696e0d0a7389d74518c4e9`; Mobile CI `35957268673` / `35957257880` and Job Safety `35957268668` passed.
- Shared collapsible Feed/Group/Event comments: PR #120, merge `0e9eea357144d75da841b45be0c28fd05670d683`; Mobile CI `35957718832` / `35957710034` passed.
- Shared fixed Back header: PR #121, merge `f9ed12e327b79a0d4a185111a6fc9260c14cb4c5`; Mobile CI `35958012669` / `35957998462` passed. Final local suite: 504 tests/91 suites, typecheck, format and lint (zero errors/15 baseline warnings). Existing privacy/security regression tests remain green.
- Implementation is committed/pushed/merged. CURRENT_STATE, SESSION_CHECKPOINT, PLANS, CHANGELOG and master handoff updated. Behavior and native checklist: `docs/REVIEW_COMMENTS_BACK_UX.md`.
- Native Samsung/Pixel Tablet acceptance remains PENDING. No connected device/adb is available in this workspace. Installed APK version 40 predates these three changes. One new paid Preview APK requires explicit founder approval; none was started. No database migration, production deployment, secret change, SMS/push or payment activation.

## 2026-09-24 — Shared Back navigation checkpoint

- Comments PR #120 merged at `0e9eea357144d75da841b45be0c28fd05670d683` after Mobile CI `35957718832` / `35957710034` passed. Review CTA PR #119 is also merged.
- Every current screen uses shared Screen. AppHeader now provides a top-left 48 dp Back arrow beside the page title, outside scrolling content and inside the safe area, retaining branding/Messages/Notifications and tablet width limits.
- Visible and Android hardware Back use actual Expo Router history, with Home replacement when none exists. Home/welcome root have no arrow; hardware Back exits at the terminal root. Native comments/media modals keep their own dismissal behavior; comment drafts survive dismissal.
- 504 tests/91 suites, typecheck and lint passed (zero errors/15 baseline warnings). Includes nested history, deep-link fallback, top-level destinations, Home hiding, hardware cleanup, accessibility and phone/tablet-width component checks. CI is the merge gate; these are not native device passes.
- Android Samsung/Pixel Tablet verification pending for all three UX updates. Installed version 40 predates them. No new paid build authorized or started; prepare one only after explicit founder approval. No schema, production or secret changes.

## 2026-09-24 — Shared collapsible comments checkpoint

- Review CTA PR #119 merged at `bc2ab3b70964cf2c48696e0d0a7389d74518c4e9` after Mobile CI and Job Safety checks passed.
- Feed, Group and Event comments now use one shared collapsed control/dialog with current counts, explicit Hide, outside dismissal, protected focused composer/submission, and Android modal Back dismissal. One dialog per Screen; no comments added to other modules.
- Existing screen comment repositories/realtime/count updates remain intact. Drafts survive dialog dismissal but clear on account/scope changes. Failed Event submissions now retain drafts.
- 486 tests/90 suites, typecheck and lint passed (zero errors/15 baseline warnings). Mobile CI is the merge gate. No database changes, new dependencies, paid build or native device acceptance claimed.
- Next: shared visible Back header and route regression tests. Phone/tablet acceptance still requires a separately approved corrected APK.

## 2026-09-24 — Completed Job Safety review CTA

- Added existing server-authorized ReviewPrompt directly below completed requester Safety sessions. Providers and incomplete sessions do not mount it. Dynamic business name; existing review switches to View or View/Edit per server policy.
- Review form has saved confirmation and Done/history return; locked reviews remain readable. Existing duplicate-review and completion authorization remain server-enforced; no schema/security changes.
- Targeted UI/review/Safety tests: 19 passed; typecheck and lint passed (zero errors/15 baseline warnings). Mobile CI is the merge gate. Android phone/tablet acceptance and a separately approved APK remain pending.
- Next checkpoints: shared collapsible comments, then shared visible Back navigation. No paid build or production deployment authorized.

## 2026-09-24 — Provider review Preview APK verified and ready for device retest

- Approved visibility migration is deployed on `opeojxwkwwnnncnsuaag` as remote version `20260924011448`; authenticated neighbor checks passed for matching 4.0/count 2, pagination, public projection and response association.
- One corrected APK completed: Android version 40, source `c0f019a68c27c9aa71df9b7f51a2fcec11ee55db`, EAS `3126f7c3-dd13-4b66-8473-f23367dc162d`. Build workflow `35942254309` and Mobile CI `35942254317` passed, including 472 tests, typecheck, format and lint (zero errors/15 baseline warnings).
- Download: https://expo.dev/artifacts/eas/g-hKHOYJI1h08Wr6TWSkbmQSG6GxV9Rl8oK7H7n1cdo.apk . File `my-corner-preview-c0f019a.apk`, 71,986,282 bytes; SHA-256 `313c82e1041c047b2d6d688c875f4bcda6aa6e536c3315db7ed2714982dd662a`.
- Verified actual APK source, Preview backend, package, media/navigation font and review bytecode. Manifest version 40 supersedes 39 with the same signing certificate. Install using `adb install -r` or Android's Update prompt; retain the existing app/data.
- Evidence: `docs/evidence/provider-review-preview-2026-09-24.json`. This one-build approval is consumed. Samsung/Pixel Tablet walkthrough remains pending: Hire → Kwame PipeCare → Reviews; confirm aggregate, stars, title/body, Verified Job, recommendation, masked author, response, and no private job/location data. No native device pass is claimed.

## 2026-09-24 — Review visibility migration deployed; corrected APK approved

- Founder explicitly approved `20260924005414_provider_review_visibility.sql` on `opeojxwkwwnnncnsuaag` and one corrected Preview APK.
- Migration applied successfully as remote version `20260924011448`. Authenticated non-reviewer verification returned average 4.0, count/verifiedCount 2, two distinct cursor pages, final-page termination, fictional public identity and corresponding response. Public projection contains only approved review fields. Anonymous RPC and authenticated direct private-helper execution remain denied.
- One explicit build-trigger commit starts the approved build from the merged provider-profile fix. Existing signing and Preview backend configuration remain in use. Download/provenance and Android phone/tablet acceptance pending; no additional build is authorized.

## 2026-09-24 — Provider visibility fix merged; Preview fixture verified

- PR #115 merged at `7a36178c14b35af3c2fdbba4624e38d177e6dfa4`. Final source `e14f3be55391528034021a11e89b74f941589ae8` passed Database CI `35941348784` and Mobile CI `35941348793` / `35941345142`; local 472 tests/88 suites, typecheck, format and lint pass (0 errors/15 baseline warnings).
- Root navigation defect fixed: provider cards now open actual provider profiles, which show review details; provider preview uses that same route. Correct grammar, bounded review pages, server eligibility/aggregate consistency and privacy tests included.
- Requested fictional Preview fixture applied on `opeojxwkwwnnncnsuaag`; existing review untouched. Authenticated non-reviewer readback: 4.0 average, 2 published reviews, 2 returned rows, clearly fictional demo review and corresponding response visible. Fixture is manual-only, opt-in guarded and idempotence-tested in CI.
- Automatic approval review rejected applying `20260924005414_provider_review_visibility.sql` to that project, requiring explicit approval for this exact new DDL/security migration. It remains UNAPPLIED. Do not bypass the block; request exact migration/target approval.
- Version 39 still contains the old card navigation. One corrected paid APK needs separate approval, followed by Samsung/Pixel Tablet acceptance. No new build or Android verification claimed; checkpoint is implemented but not yet fully device-accepted.

## 2026-09-24 — Provider review visibility root cause and fix

- Root cause: Hire provider cards navigated directly to `/hire/request/new`, bypassing the existing profile/review component. The separate provider profile-preview route was hard-coded and omitted reviews. Preview Kwame has one genuine published 4-star review with matching requester/provider and two-party completed Job Safety; another authenticated account's RPC returned that body. RLS is not the cause; legacy seeded 4.8/37 counters are not the displayed 4.0/1 summary.
- Provider cards now open the real profile; its Start request opens the editable form without fabricated sample data. Provider preview resolves the signed-in provider and redirects to the same real profile.
- Added singular/plural/zero states, recent-three review display, See all reviews, ten-row cursor pages, explicit recommendation and existing provider response. Server aggregation and rows now share a completed-job/requester/provider/safety join and match accepting-provider visibility. No legal identity, request ID, address or safety evidence is projected; optional experience tags are not stored and are not invented.
- Added guarded, manual-only fictional Preview fixture for Kwame (matching completed synthetic job and acknowledgements), excluded from migrations/production seeding. Existing user review remains unchanged. Added route/render/pagination and SQL privacy/eligibility/aggregate/moderation tests.
- Local 472 tests/88 suites, typecheck, format and lint passed (0 errors/15 baseline warnings). Database/Mobile CI, deployment and fixture readback pending. No new paid APK is authorized; Android phone/tablet acceptance cannot be claimed from unit/SQL checks.

## 2026-09-23 — Reviews/messaging Preview APK built and verified

- One approved APK completed: source `d218a151a2524c2cd1ae8f7686895f75bc3538f0`, EAS `3beca53c-37e2-470d-ae5e-f4a7b55d5d7f`, build workflow `35935019649`, Mobile CI `35935019645` passed. The one-build authorization is consumed.
- Download: https://expo.dev/artifacts/eas/VAxzvv8Ex9x8YAk_Cnhk_PVaYTaghsQ_V_xe1hzOwSA.apk . File `my-corner-preview-d218a15.apk`, 71,986,014 bytes, SHA-256 `2381c893be7e01319fa7d9b0cca1c3aaab2a9b56d2ab207ad7de89a1c57df5b4`.
- Actual Android version 39 supersedes 38 with the same package and signing certificate. Install as an update with `adb install -r` or Android's Update prompt. Do not uninstall first.
- Artifact source/backend/package/media/font checks passed. Workflow's final ASCII-only label check failed because Hermes encoded Verified Job as UTF-16. Independent artifact inspection confirmed that label and review/messaging/notification RPC bytecode, ZIP integrity, manifest version and certificate. Corrected the verifier; no second EAS build was submitted. See `docs/evidence/reviews-messaging-preview-2026-09-23.json`.
- All three backend flags remain enabled. Samsung phone/Pixel Tablet functional acceptance remains pending per `docs/REVIEWS_MESSAGING_DEMO.md`. Artifact verification does not establish native UI or two-device realtime acceptance.

## 2026-09-23 — One reviews/messaging Preview APK approved

- Founder approved one new APK after backend rollout. Build latest merged code with reviews, neighbor messaging and notifications, using the existing Preview backend and signing configuration.
- Explicit build-trigger commit starts exactly one EAS build. Release gates and artifact checks cover source commit, backend/package, replacement icons, media and review/messaging/notification bytecode.
- Build/download and phone/tablet acceptance pending. This is not authorization for another build or production deployment.

## 2026-09-23 — Preview reviews, messaging and notifications enabled

- Founder explicitly approved `20260923231722_preview_identity_dependency.sql` on `opeojxwkwwnnncnsuaag`. Applied as remote version `20260923232606`; messaging applied as `20260923232619`. Earlier reviews and notifications remain applied as `20260923231603` and `20260923231825`.
- All three flags are now true: `verified_job_reviews`, `neighbor_messaging`, `community_notifications`. No remaining database deployment approval gate for this feature set.
- Verified RLS, denied anonymous RPC execution/no-session access, invoker public RPCs, authenticated inbox/discovery/review/notification reads, and messaging Realtime publication. Identity table is empty and client-unreadable; names safely fall back to Neighbor. No real identity data was created.
- Compatibility PR #112 merged at `6347985f609e2c45da8d42c0727fe0ebd08a1478`, with passing Database CI `35933208939` / `35933196241`. Security advisor WARN/ERROR findings remain unchanged from baseline; deny-all INFO notices are expected.
- Next gate: separately approved new APK and Samsung/Pixel Tablet acceptance. Current version 38 lacks these new screens. No new build, live test messages/reviews, push/SMS or native acceptance claimed.

## 2026-09-23 — Approved Preview rollout partially applied; identity dependency blocked

- Founder approved the three migrations and Preview flags on `opeojxwkwwnnncnsuaag`.
- Applied review migration (remote version `20260923231603`) and notification migration (`20260923231825`). Verified invoker RPCs deny anon execution, sensitive stores have RLS, unauthenticated notification access is rejected and authenticated list succeeds. `community_notifications=true`; `verified_job_reviews=false`.
- Messaging migration rolled back on missing `public.private_identity_profiles`. This Preview used an older compatibility schema that omitted the repository's identity foundation. `neighbor_messaging` is not provisioned/enabled; no messaging DDL persisted.
- Prepared `20260923231722_preview_identity_dependency.sql`: restore only the missing original identity-table definition/enum, empty with RLS and no client grants, no legal-name backfill. Automatic approval review rejected this fourth migration as outside the exact three-migration approval and involving sensitive legal-identity schema. It remains UNAPPLIED and requires explicit approval. Do not bypass the rejection.
- Security advisors show no new WARN/ERROR findings; two new INFO notices are expected deny-all private review/control tables. Existing unrelated baseline findings remain documented. No APK build or phone/tablet acceptance.

## 2026-09-23 — Reviews and private messaging implementation complete; rollout gated

- Implementation PRs #106–#110 merged. Final feature main: `636345a5e78a349fa9c2b7dfd36643f4f3c10ccd`. Reviews, shared neighbor/Marketplace inbox, realtime refresh, unread/retry, privacy/block/report/moderation, eligible profiles/search, My Activity and unified in-app notification projection are implemented.
- Final head `c53aac61a67fa57832af113955b4dfc9525940e3`: Database CI `35932095087` / `35932086760` and Mobile CI `35932095029` / `35932086796` all passed. Local 463 tests/87 suites, typecheck, lint zero errors/15 baseline warnings; Mobile CI also validates formatting, Expo compatibility and web export.
- No connected-backend migrations or flags applied. Automatic approval review rejected the original schema/privilege deployment to `opeojxwkwwnnncnsuaag` as a live-target change without exact approval. Request explicit approval of the three named migrations and Preview flags in `docs/REVIEWS_MESSAGING_DEMO.md`; do not bypass that gate or switch targets.
- No paid build or device acceptance claimed. Existing APK remains version 38/source `2e3f991`; it does not contain these features. New build approval and Samsung/Pixel Tablet walkthrough remain separate gates. Media DM, real push delivery and additional domain event producers remain documented follow-ups.

## 2026-09-23 — Messaging merged; notification integration checkpoint

- Messaging UI PR #109 merged at `499be5fcc615840b9da138d2f0f0ca0c7b227887`; Mobile CI `35931632194` / `35931622333` passed.
- Shared notification projection combines existing notices and due recipient-addressed domain events, excludes raw payloads, preserves separate push-delivery state, and routes Hire/Job Safety to the correct participant view. New Hire/Job Safety emitters default off behind `community_notifications`.
- Added notification ownership/privacy/scheduled-event SQL checks and message rate-limit/notification-opt-out checks. Local mobile typecheck and 463 tests pass; lint zero errors/15 existing warnings. Isolated Database and Mobile CI remain the merge gates for this checkpoint.
- Three unapplied migrations and feature flags await explicit target approval. No new APK/native acceptance; device demo checklist is in `docs/REVIEWS_MESSAGING_DEMO.md`.

## 2026-09-23 — Private messaging experience verified locally

- Messaging security PR #108 merged at `e70ff9d19e9a155fa6f1ff62ea94b935d0f5db70`; Database CI `35930428166` / `35930418830` passed.
- Added one shared inbox/thread for neighbor and Marketplace conversations, realtime invalidation with polling fallback, unread counts, stable-nonce retry, block/report, masked neighbor discovery/profile, privacy settings and notification center. Account transitions clear private data and drafts; background realtime cannot refill hidden private state.
- Local typecheck, 462 tests and web export pass; lint has zero errors (baseline warnings only). Mobile CI is the next merge gate. No live migration, paid build or phone/tablet acceptance claimed.

## 2026-09-23 — Reviews merged; shared messaging security implementation

- Review backend PR #106 merged at `89df96ed6ce83a36e76fcb1c8301351f39cd4a08` after Database CI `35929466532` / `35929462481` passed. Review UI PR #107 merged at `52407c7f4fc37c8a939fe5a7f36e2ce9c717e126` after Mobile CI `35929712502` / `35929701286` passed.
- Messaging extends the existing Marketplace conversation/message tables with neighbor context, masked discovery, participant RLS, idempotent nonce, unread cursors, rate limits, settings, blocks and narrowly scoped report evidence. Old direct Marketplace inserts receive the same block/suspension/rate guards.
- Reuses notifications and the domain outbox; never includes message body in notification/outbox payloads. No push delivery or E2EE claim. Neighbor messaging defaults off; schema application remains blocked pending explicit approval for the connected project.
- Messaging security CI and experience implementation are next; no paid build or native device acceptance is claimed.

## 2026-09-23 — Verified review experience implemented

- Added post-completion review entry, accessible 1–5 stars, title/body/recommendation and experience guidance; provider review list, real aggregate summary, one response, reporting and moderator decisions.
- Added private My Activity with request history and reviews written. Draft text clears with account-session changes and is not persisted or included in analytics.
- Local typecheck, all 453 tests and web export passed; lint has zero errors and 15 existing warnings. Backend PR #106 remains gated on Database CI; Preview migration remains blocked by auto-review. No native test/build is claimed.

## 2026-09-23 — Verified reviews and private messaging checkpoint

- Audit main: `ecb7811054cb61ff174a159e40a1bf1929171c78`. Reuse `reviews`, Marketplace conversations/messages, `blocks`, `notifications`, `domain_event_outbox`, masked identity and protected resource lifecycle.
- First implementation: completed-job review security, public projection, one review per job, seven-day audited edits until response, provider reply, report/moderation and content-free notification events. Require both Job Safety completion confirmations so a forged Completed request cannot create a Verified Job review.
- Backend review feature defaults off. Auto-review rejected deployment to connected project `opeojxwkwwnnncnsuaag` as a live schema/access-control change; no migration or flag was applied. Continue implementation and isolated Database CI; deployment requires explicit target/migration approval.
- No APK build authorized. Review and messaging native phone/tablet acceptance remains pending. See `docs/REVIEWS_MESSAGING.md` for scope and checkpoint status.

## 2026-09-21 — Replacement-icon Preview APK built and verified

- One approved build completed successfully: source `2e3f9913c8800f6575e5e2da89dfe3003e851b4f`, EAS `3df2be28-e78a-4fdc-8cbb-95abe4e334c2`, APK workflow `35620057933`, Mobile CI `35620057872`.
- Download: https://expo.dev/artifacts/eas/YrUT3UNvSI4dQSdrDQxFG9nk6hvlTVvikJ2-v-9EMiU.apk
- File `my-corner-preview-2e3f991.apk`, 71,944,794 bytes; SHA-256 `5abf89a6273618cddd65f94d3ec460b663890e5992782b2c5a9afcd599f1b846`.
- Verified source commit, Preview backend, application ID, media bytecode and exact replacement navigation font (`res/JS.ttf`). Archive integrity passed. Android version 38 supersedes 37, with the same package and signing certificate as `1c0dd00`; install using `adb install -r` or Android's Update prompt.
- Phone/tablet visual acceptance remains pending: confirm Hire person/checkmark and Community hands/heart icons in active/inactive states, navigation, and Structure with AI. Preview AI remains enabled; this build does not change backend configuration.
- Evidence: `docs/evidence/navigation-icons-preview-2026-09-21.json`. This one-build approval is consumed; no further paid build is authorized.

## 2026-09-21 — Replacement-icon Preview APK authorized

- Founder explicitly approved one new APK after PR #105 merged: "i approve a new APK build".
- Build latest merged main with the supplied Hire and Neighborhood icons, retaining the existing Preview backend, signing configuration and automatic Android version increment. Preview AI remains enabled.
- One explicit build-trigger commit submits the APK. Release gates and APK checks include byte-for-byte verification of the bundled replacement icon font.
- Build result and download evidence pending. Phone/tablet acceptance remains pending; no production deployment is included.

## 2026-09-21 — Founder-supplied navigation artwork

- Replaced the Hire footer glyph with the supplied person/checkmark and the Community footer glyph with the supplied Neighborhood hands/heart artwork.
- Preserved the original PNGs and traced scalable vector glyphs into a 31 KB bundled font using the existing Expo icon library. No new app dependencies; active/inactive colors, labels, routes, capability gates and 48 dp targets are retained.
- Local typecheck and all 446 tests passed; lint reports zero errors and the existing 15 warnings. Glyphs visually inspected at 24, 48 and 96 px in both selection colors. Formatting and Android Hermes export also passed; the exported font matches the committed asset. PR #105 merged at `3ccb95a19a51c74b194bef616388015785f4bad9` after Mobile CI passed for both push and PR (`35619442320`, `35619459962`). Font rebuild is deterministic.
- These client changes are not in the existing `1c0dd00` APK. A new paid APK needs fresh founder approval; no build was triggered. Native phone/tablet acceptance is pending that build. Preview AI remains enabled as recorded below.

## 2026-09-21 — Live AI structuring verified and enabled

- After the founder confirmed API credit availability, one authenticated fictional sink-leak request returned HTTP 200 with `enabled: true` and valid title, description, urgency, missing information and safety warning fields.
- Preview `ai_service_request_structurer` is now TRUE. This supersedes earlier missing-secret and HTTP 429 blockers; the exact earlier 429 subtype was not established.
- Response title: Water Leak Under Kitchen Sink. Response description: There is water leaking under the kitchen sink that started this morning. Urgency: flexible. The result remains a suggestion for explicit user review; the test did not submit a service request.
- The quota counter recorded one call. Test session logout returned HTTP 204; temporary Auth user/profile were removed, zero fixture rows verified, and enabled flag read back true.
- PR #104 safe diagnostics merged at `3e1f9d74ad25f1e29835a61a60cfda0ff380604f` after Media Functions and Database CI passed. Eleven server tests and Deno check passed.
- Existing approved APK `1c0dd00` supports this server activation; no new APK is needed or was built. Phone/tablet AI UI acceptance remains pending: Create Request → enter text → Structure with AI → review/apply/edit → submit only when explicitly chosen.

## 2026-09-21 — AI settings detected; upstream HTTP 429 blocks activation

- Founder reported both Preview secrets saved. Authenticated availability check returned HTTP 200 / available=true, confirming the function sees its key/model and enabled flag.
- Two fictional sink-leak attempts returned HTTP 503 from the Edge Function; the second diagnostic established upstream OpenAI HTTP 429. No successful suggestion is claimed. The filtered diagnostic did not establish a particular credit/rate/spend subtype.
- Per the two-attempt limit, no further content requests were made. The Preview AI database flag is restored to false. Both test sessions were logged out; temporary Auth user and profile removed, with zero remaining fixture rows verified.
- Required next step: founder checks OpenAI API credits and project/organization limits; then retry one fictional request. Do not rotate the key solely for this 429. No new APK is required.
- Preview function v5 adds fixed allowlisted diagnostic reason codes and upstream HTTP status, preserving the generic user error. No upstream message, secret or request content is returned. Eleven server tests and Deno check passed. Changes are published for review in the AI diagnostics PR.

## 2026-09-21 — Merge complete; one new Preview APK authorized

- Founder explicitly requested merge and approved one new APK build after the three media retests passed.
- PR #102 merged at `35cfdda2469dec6ff8385c0f8c9770b8a0c8482f`; PR #103 merged into main at `6e29fbebf13d48870660fd80cc7dcc76e71e3031`.
- Merged source tree `7e4fa61dca3e1dd61fb80c951fe2c1c7167e21b9` exactly matches the tested PR #103 tree. Mobile, Database, Media Functions and Job Safety CI passed at `2e964e0`.
- This build authorization supersedes earlier draft/build holds. The explicit build-trigger commit starts exactly one EAS Preview APK using the existing workflow and signing credentials, with an incremented Android version.
- New phone/tablet acceptance remains pending. AI runtime configuration still returned 503; its database flag remains off and manual request submission is supported. No production deployment is authorized.
- The approved APK is BUILT AND VERIFIED: source `1c0dd00`, EAS `be2f266e-ec74-45ba-a757-a0c743328b8f`, workflow `35608359612`. File `my-corner-preview-1c0dd00.apk`, 71,938,470 bytes; SHA-256 `f21ecb90933cd1a8416891851614b319d13cf9f983db92a30bb49d8d865d6d70`.
- Download and full provenance: `docs/evidence/vc-reliability-preview-2026-09-21.json`. Source, backend, app ID, archive and embedded media/UX markers verified. This build approval is consumed. Next: install as an update and perform the phone/tablet retest; no new paid build without approval.

## 2026-09-21 — Focused media retest passed; reliability/UX implementation

- Founder reported all three corrected `62e3cec` APK retests passed: video centering, playback/close/background stability, and Hire attachment Review/Back/submit/readback.
- Live main at audit: `debd1995ce5f599549d16ea932a04e639b1f411d`; implementation builds on PR #102's `d26d7abb14417f4d0bb4811fdeb1d929fe41625c` source.
- New reliability/UX work: shared protected refresh for request/status/safety screens; all active requests; authorized live Search; icon navigation; native Invite Friend; distinct registration; server-backed, explicitly reviewed AI suggestions with manual fallback.
- The audited provider-only account has no verified residence; the other account is a verified resident/provider/moderator. Existing account roles and memberships remain unchanged.
- Published draft PR #103, stacked on #102. Implementation commit `c4c23ca` passed Mobile, Database, Media Functions and Job Safety CI. Preview registration/allowance migrations and structurer function v1 deployed; SQL verification passed. New registration also blocks client edits to phone verification.
- Authenticated AI availability returned HTTP 503 with the Preview flag enabled; server key/model configuration remains blocked. The AI database flag was restored to false and temporary test identity/profile removed. New native acceptance and final-head CI/review remain gates. No additional APK has been built or authorized.
- See `docs/VC_RELIABILITY_UX.md` for findings, file/test mapping, configuration and the two-device test plan. This entry supersedes stale earlier current-state/next-action statements.

# My Corner — implementation plan

## Active: approved VC media activation

- [x] Inspect live main and Preview media/storage contracts.
- [ ] A: Foundation and durable cleanup published in draft PR #102. Preview upload/access/cleanup verification passed; current PR CI/review and native media acceptance remain gates.
  - [x] Durable cleanup and temporary picker-file disposal.
  - [x] Controlled Preview Auth/Storage/processor/worker verification; fixture cleanup; uploads disabled afterward.
  - [x] Repair review findings: invalidate expanded photos on authorization refresh; resume completed-original upload retries. Add 12 component/transport regression cases.
  - [x] Re-reviewed the repaired foundation at `705e83c`; its CI passed. Founder authorized product-screen integration and one new Preview APK.
- [x] B implementation: Profile pictures, replacement/removal and shared avatars.
- [x] C implementation: Neighborhood Feed images and video.
- [x] D implementation: Hire request media restricted to participants.
- [x] E implementation: Group avatar/cover and member post media.
- [x] F implementation: Event cover/gallery/video under existing audience rules.
- [x] G implementation: Marketplace video preserving existing images and pickup privacy.
- [ ] H: Cross-surface security/performance and Android device verification.

Product integration passed 407 mobile tests and six media function/security tests. The device-repair regression total is 419 tests across 81 mobile suites. Native acceptance of the connected screens remains pending. See `docs/VC_MEDIA_PRODUCT_INTEGRATION.md` for the current source and build checkpoint; keep PR #102 draft.

- [x] Publish connected screens at `5d801dd`; Mobile, Database and Media Functions CI passed.
- [x] Build and verify the one approved Preview APK: EAS `214b0a28-2476-4271-aabc-2c07faa4c1a3`; APK and provenance published by the successful build workflow.
- [x] Trace the reported one-sided video frame, Close video exit and missing Hire picker against that APK source. Repair source and add 12 regression cases, including lifecycle and request-flow isolation.
- [x] Founder approved one corrected APK for the phone/tablet retest on 2026-09-18. Repair commit `e36ed2b` passed Mobile, Database and Media Functions CI.
- [x] Build and verify the one corrected Preview APK from `62e3cecc286203a6da28c3bf8805e20cc068944a`: EAS `7cbb3fcf-36e0-4ce7-85dc-620a3b8ba68c`, successful workflow `35388377487`. Direct download passed archive, application ID, Preview backend and repair-bytecode checks; checksum recorded in `docs/VC_MEDIA_PRODUCT_INTEGRATION.md`.
- [ ] Verify the connected media screens on the physical phone and tablet emulator before merge.

The founder explicitly adopted the directive and approved publishing the foundation in PR #102 on 2026-09-18. The initial implementation is published at `f17ad80`; verify the latest PR checks and keep the PR draft until technical gates pass. See `docs/VC_MEDIA_CHECKPOINT_A_REVIEW.md`.

Each checkpoint requires targeted tests, formatting, lint, typecheck, privacy review, pushed PR and successful CI before merge. Maintain continuity before long operations. On 2026-09-18 the founder authorized one new Android Preview build with “Connect product screens. build new APK”. Build the draft branch through the approval-gated workflow; do not merge or deploy to production.

The founder subsequently approved “one corrected APK for the phone/tablet retest”. That single corrected build is complete and verified. Install `my-corner-preview-62e3cec.apk` over the existing app on both devices, then retest the three reported failures. No further build or merge is part of this checkpoint.

## Completed verification

PR #101 offline session/profile restoration is merged. Founder device observations confirm reconnect recovery, network banner, explicit sign-out persistence and cross-account isolation. Native compact/tablet/accessibility gate is complete.

## Deferred

Unified notifications, organization/agency publishing, production verification adapters and release hardening remain outside this media milestone.
