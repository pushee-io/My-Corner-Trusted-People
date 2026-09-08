## 2026-09-08 — Job Safety key configuration checkpoint

- The three pending provider-account, active-provider assignment, and job-report migrations are verified in Preview. Existing account links and roles are preserved.
- The internal Job Safety key helper now supports a named Supabase Vault secret when the existing server setting is absent. Existing configured keys retain precedence, and a missing or invalid key still fails closed.
- Founder-approved Preview key provisioning and a fresh-transaction AES-256 round trip passed. Client roles remain denied direct access to the helper and decrypted Vault values. No key values are present in this repository.
- The supporting migration only enables key lookup; it does not create or rotate secrets. The repository migration version matches the deployment record.
- Added isolated SQL coverage for missing configuration, Vault fallback, encryption/decryption, existing-setting precedence, invalid settings, and client denial. Database CI results are recorded on this repair PR.
- The installed Android build remains usable. Native fictional moderator sign-in and the complete requester/provider/moderator interaction are still pending.

Earlier checkpoints follow; this status supersedes their pending migration and encryption-configuration gates.

## 2026-09-08 — Android launch and provider-account guard checkpoint

- The approved Android Preview APK is installed on the emulator and physical phone; installed artifact identity matches on both.
- Both devices report successful starts of the app's explicit launcher activity. The emulator reused an existing activity; the phone completed a cold launch. Visible-screen confirmation and the full native requester/provider/moderator flow remain pending.
- Pending provider-test reconciliation now locks and checks the destination before detaching any account. It skips occupied destinations and non-provider source/destination roles while preserving existing access.
- SQL regression cases cover occupied moderator/provider destinations, unlinked non-provider destinations, non-provider source accounts, successful reconciliation, audit behavior, and repeated application. Database CI verifies the complete SQL/RLS suite; consult this repair PR's check results.
- Typecheck passes. Lint has zero errors and 15 existing warnings on the unchanged mobile tree.
- Preview migration deployment, fictional moderator readiness, and private-location encryption configuration remain prerequisites for native acceptance. Repository CI and device launch receipts do not establish live backend readiness.
- The existing approved APK remains the application test artifact because this repair changes SQL, tests, and documentation only. No additional Android build was submitted.

Earlier checkpoints follow; the current status above supersedes conflicting historical next actions.

# Android Job Safety and Moderation Verification

Updated: 2026-09-08

Status: focused repair checkpoint; native acceptance remains pending.

The job-report workflow now connects requester submission, moderator review, a persisted resolution and audit history, and a limited requester outcome. It reuses the existing reports and moderation-case tables and existing resolution states.

Local verification:
- Initial reporting regression failed against the previous implementation.
- The three new regression suites pass: 16 tests.
- The full mobile suite passes: 68 suites, 329 tests.
- Formatting and typecheck pass.
- Lint has zero errors and the same 15 existing warnings.
- Mobile CI, Database CI, and the existing browser usability checks passed on application commit `50b4df58e35159b587cc743e88bf13d56ad8745f`.
- Expo Doctor passed 18/18 checks; the web export and Preview contract passed.
- The SQL job-report regression completed successfully in the isolated CI database.

The SQL regression exercises real requester creation and provider acceptance, report submission and retry, moderator review, resolution, requester status, and role/privacy boundaries using fictional transaction-local fixtures.

Native device verification is not complete. Both installations must first be verified against an approved build and the same approved Preview backend. Account roles, cross-device propagation, Android behavior, and screenshots remain pending.

No additional Android build has been submitted. A build containing this repair requires the separate build approval specified in the verification directive.

Repair: [PR #97](https://github.com/pushee-io/My-Corner-Trusted-People/pull/97). [Mobile CI](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/34189871072), [Database CI](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/34189871079), [existing browser usability checks](https://github.com/pushee-io/My-Corner-Trusted-People/actions/runs/34189871085).

These results cover automated source and isolated database behavior. The browser checks cover the existing safety screens; they do not establish native moderator usability or cross-device acceptance. The follow-up checkpoint updates evidence and preserves the database script executable mode.
