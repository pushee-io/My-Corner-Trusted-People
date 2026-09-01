# MY CORNER — MASTER PROJECT HANDOFF

**Handoff version:** 2026-08-31  
**Product:** My Corner — Trusted People  
**Primary display name:** My Corner  
**Tagline:** No Wahala — Hire without headache.  
**Supporting position:** Local answers. Better neighborhoods. Where community comes together.  
**GitHub repository:** `pushee-io/My-Corner-Trusted-People`  
**Local repository root:** `/Users/pushpakhemchand/My-Corner-Trusted-People`  
**Mobile application root:** `/Users/pushpakhemchand/My-Corner-Trusted-People/mobile`

---

## 2026-09-01 Provider Fixture Addendum

This addendum supersedes older current-state and resume-point statements below.

- Live `main`: `1e29550a4dba12d5676ee73302dec1768b113702`.
- PR #92 aligned the fictional Preview provider account with the documented Kwame PipeCare seed profile.
- Branch Database CI `33569681822`, pull-request Database CI `33569725510`, and post-merge Database CI `33570023910` passed.
- Supabase Preview check `100061862877` succeeded for project `opeojxwkwwnnncnsuaag`.
- Provider profiles and request history were preserved; no existing request was reassigned.
- Exact next action: sign the provider out and in, confirm Kwame PipeCare, submit a new requester request to Kwame PipeCare, and verify provider response propagation.
- No further paid Android build is authorized.

## 2026-09-01 Live-State Addendum

This addendum supersedes older current-state and resume-point statements below.

- Live `main`: `8184523b3d28a98e61ba62c03bb1ac2ee5c84bc0`.
- PR #70 through PR #84 are merged.
- PR #84 completed the server-controlled Job Safety Session, repaired Trusted Hire safety routing, and placed Marketplace and job-safety authorization checks in Database CI.
- PR #84 head `85e6a4efd3f9b265c9ba9aec1513abd734dca90b` passed Mobile CI `33462005901`, Database CI `33462005870`, and Job Safety Usability `33462005863`.
- Post-merge `main` passed Mobile CI `33462212162` and Database CI `33462212190`.
- PR #86 consumed the single authorized Android Preview build. EAS build `2f82dcdc-df32-459e-9690-5a236ec4d46b` finished and workflow `33535507405` verified the APK and provenance.
- No production deployment, migration deployment, real-user communication, or identity activation was performed.
- Exact next checkpoint: install the verified APK and collect the compact-phone, tablet, rotation, large-text, screen-reader, permission, network, and privacy evidence. Do not submit another paid build.

## 1. Purpose of this handoff

This document is the durable source of continuity for My Corner development after multiple long-running Founder CoPilot sessions reached conversation or environment limits.

The prior sessions sometimes lost access to temporary files and session state. That does **not** undo actions already persisted to GitHub, Supabase, Expo/EAS, or other external systems. However, no future session may depend on temporary workspace files, `/tmp`, `/workspace`, browser-only state, or chat memory as the sole record of work.

The repository, pull requests, commits, CI results, migrations, and this versioned handoff are the authoritative continuity system.

This handoff supersedes `MY_CORNER_MASTER_HANDOFF_2026-08-27.md` wherever the two conflict.

---

## 2. Product mission

My Corner is a Ghana-first neighborhood platform designed to help residents:

- Find reliable local help
- Understand useful trust evidence
- Send and track service requests
- Ask and answer local questions
- Receive local and official alerts
- Join relevant neighborhood communities
- Buy, sell, and coordinate pickups locally
- Discover and recommend local businesses and service providers
- Participate without exposing exact home locations or unnecessary private information

The initial market is Accra, Ghana. The architecture should support later expansion to other African countries through country-specific configuration for language, currency, addresses, identity, residence verification, payments, moderation, and official organizations.

---

## 3. Brand, trust, and safety rules

### Brand personality

- Trustworthy
- Warm
- Useful
- Local
- Modern
- Human
- Respectful
- Practical
- Ghanaian without stereotypes

### Trust-language rule

“Trusted People” must not imply that My Corner guarantees a person’s safety, conduct, quality, legality, identity, or reliability.

Trust must be represented through transparent evidence such as:

- Phone verification
- Approved identity-assurance status
- Neighborhood verification
- Completed jobs
- Verified-job reviews
- Community recommendations
- Response rate
- Account age
- Approved organization status
- Moderation or credential status where legally appropriate

AI must not independently label a person “trusted,” “unsafe,” “fraudulent,” or “criminal.”

---

## 4. Authoritative current repository state

### Remote repository

- Repository: `pushee-io/My-Corner-Trusted-People`
- Default branch: `main`
- Repository visibility reported by GitHub on 2026-08-31: **public**
- Branch protection reported on `main`: **not enabled**
- Package manager: npm
- Mobile lockfile: `mobile/package-lock.json`

The founder should confirm that public repository visibility is intentional before production secrets, private operational material, or proprietary assets are added. Secrets must never be committed regardless of repository visibility.

### Current `main`

As verified from GitHub on 2026-08-31:

- `main` commit: `dfea274af7b16f28060b7173e630c468924c23a6`
- Commit title: `Systematic web-safe navigation migration (#70)`
- Parent: `523e971106248a5bea81a0e546bbf5f20831a555`
- Post-merge Mobile CI run `33451194302`: success

### PR #68 — completed and merged

PR #68 reconciled the staging branch into `main` and included the two previously identified P1 repairs.

Merge commit:

- `7304d0c80bdcfcd115f17d3116793054098d43f0`

Verified outcomes:

- Provider status persistence is awaited before navigation.
- Duplicate status submissions are prevented while saving.
- Failure remains visible and retryable.
- Marketplace SQL authorization tests are included in the database test runner.
- Mobile CI passed.
- Database CI passed.
- Marketplace RLS tests passed.
- No EAS build was triggered.
- No production deployment occurred.

The founder synchronized local `main` to `7304d0c` and reported a clean working tree at that checkpoint.

### PR #69 — completed and merged

PR #69 repaired the web authentication-storage crash.

Current merge commit on `main`:

- `523e971106248a5bea81a0e546bbf5f20831a555`

Verified outcomes:

- Native iOS/Android Supabase session persistence continues to use Expo SecureStore.
- Web uses guarded, tab-scoped browser `sessionStorage`.
- Server-side rendering and unavailable-browser-state guards were added.
- Mobile CI passed.
- Web export passed.
- No dependency, migration, EAS build, or deployment change occurred.

### PR #70 — completed and merged

PR #70 was squash-merged after its immutable head, base, mergeability, CI, and manual replay evidence were reverified.

Merge commit:

- `dfea274af7b16f28060b7173e630c468924c23a6`

Verified outcomes:

- The title no longer carries the textual draft marker.
- The PR description records the completed browser replay.
- Head `7f0fcf8e14d75c958d22ef4ce384f155da54b6b0` matched the expected value at merge.
- Mobile CI run `33423063650` passed on the PR head.
- Welcome, Hire, Neighborhood feed, Events, Marketplace, Marketplace moderation, requester navigation, and provider navigation passed manual browser replay.
- Post-merge Mobile CI run `33451194302` passed on `main`.
- No EAS build or production deployment was triggered.

**Immediate next repository action:** merge the focused continuity-documentation PR, then begin native compact/tablet/accessibility verification as a separate checkpoint.

---

## 5. Known framework and dependency baseline

The most recently verified repository baseline included:

- App version: `0.1.0`
- Expo: `54.0.37`
- React Native: `0.81.5`
- React: `19.1.0`
- Expo Router: `6.0.24`
- TypeScript: `5.9.3`
- Supabase JS: `2.75.0`
- TanStack Query: `5.90.5`
- React Hook Form: `7.62.0`
- Zod: `4.1.5`
- Jest: `29.7.0`
- Babel Jest: `30.0.5`
- ESLint: `9.35.0`
- EAS CLI: `22.6.0`
- CI Node: `24`

Before changing any dependency, inspect the current lockfile and package manifest. Do not repeat old version claims without checking the repository.

Known dependency-quality risks:

- `npm ci` reported 17 audit findings: 8 moderate and 9 high.
- Several deprecated transitive packages were reported.
- Jest 29 and Babel Jest 30 are on different major versions.
- Several manifest entries use compatible ranges despite an exact-pin policy.

Do not run `npm audit fix --force` without a separate dependency-security assessment and regression plan.

---

## 6. Database and migration state

The repository previously contained 29 ordered Supabase migrations through:

- `20260827190000_marketplace_moderator_queue.sql`

PR #68 ensured the database smoke-test runner executes the existing Marketplace SQL checks, including:

- `marketplace_core_rls.sql`
- `20260824_marketplace_vertical_slice.sql`
- `20260827_marketplace_moderator_queue.sql`

Database CI passed after the fixture repair.

No migration was added by PR #69 or PR #70.

Production database state remains separate from repository migration evidence and must not be assumed without direct production verification.

---

## 7. Current feature status

The classifications below reflect repository and prior CI evidence. Device behavior may still require native verification.

### Completed and verified in repository/CI

#### Module 1 — Trusted Hire

- Provider discovery
- Provider profiles and trust evidence
- Request creation
- Request persistence
- Provider response
- Request status retrieval
- Privacy-safe area display
- Async repository behavior
- Relevant tests and RLS foundations

#### Day 2 profile, verification, community, and privacy foundations

- Profile routes
- Legal-name and public-profile separation foundations
- Phone, address, map, location-consistency, and manual test-mode identity routes
- Report-evidence route
- Community entry
- Neighborhood feed reads
- Comments
- Binary likes/reactions
- Reports
- Moderation reads/actions
- Neighborhood visibility controls
- Community privacy and authorization tests
- `author_id` to `authorId` mapping

#### App shell foundations

- Bottom navigation exists
- Search exists
- Home, Hire, Community, Marketplace, Events, and settings-related routes exist
- PR #70 makes the known navigation sites web-safe, pending merge

#### Marketplace

- Listings
- Listing images
- Private pickup details
- Pickup proposal foundations
- Marketplace messages
- Marketplace moderation queue
- Audit-oriented moderation actions
- Marketplace SQL authorization coverage in the database runner

#### Groups

- Group creation
- Membership requests and decisions
- Group detail/feed
- Comments
- Existing reactions/likes
- Sharing validation
- Reports

#### Events

- Event contracts
- Runtime repository
- Supabase adapter
- Feature gates
- RLS
- Private locations
- RSVP
- Invitations
- Comments
- Reports
- Notification/outbox foundations
- Stabilization tests

#### Agency broadcasts

- Visibility-controlled agency-broadcast read foundation

### Partially implemented

#### Permanent application shell

Still incomplete or unverified:

- Central Create menu
- In-app notification center
- Clear profile destination in final navigation
- Responsive tablet navigation rail
- Full deep-link authorization coverage
- Current native compact/tablet evidence

#### Shared media

Existing image foundation is present. Remaining:

- Video upload and delivery
- Universal upload execution across all surfaces
- Retry/resume
- End-to-end moderation integration
- All-surface media reuse
- Current device performance proof

#### Social interaction foundation

Existing comments and basic likes/reactions are present. Remaining:

- Full emoji reaction model
- `@mentions`
- General internal sharing
- Invite-neighbor flow
- Notification integration

#### Marketplace completion

Core coordination and moderation exist. Remaining:

- Unified notification integration
- Current native-device evidence
- Final pickup experience validation

#### Groups and Events completion

Meaningful vertical slices exist. Remaining:

- Shared video/media completion
- Mentions
- Push/in-app notifications
- Native phone/tablet/accessibility proof
- Final privacy and performance review

#### Agency broadcasts

Read foundation exists. Remaining:

- Shared organization model
- Organization verification
- Staff roles
- Draft/approval/publish workflow
- Geofence targeting
- Revisions
- Cancellations
- Expiration
- Audit review
- Strong-auth requirements for official publishers

#### Production verification and security

Test and fail-closed foundations exist. Remaining:

- Real SMS provider
- Ghana phone normalization verified against provider behavior
- Production address provider
- GhanaPost GPS integration completion
- Residence-verification workflow
- Approved identity-verification provider
- Webhook authentication
- Provider rate limits and abuse controls
- Comprehensive production test-path lockout proof
- Production deployment evidence

### Missing or not yet proven

- Push-token lifecycle
- Real push delivery
- Unified notification worker
- Delivery receipts, retries, deduplication, and invalid-token cleanup
- Complete in-app notification center
- Shared official-organization administration
- Full `@mentions`
- Video pipeline
- Full emoji-reaction model
- Production identity/residence integrations
- Runtime Sentry integration
- Comprehensive native accessibility/device matrix
- Production readiness evidence

---

## 8. Known risks and open defects

### P0

No confirmed P0 defect from the current evidence.

Production exposure cannot be ruled out without direct production review.

### P1 or release-gating risks

- `main` is not protected by required status checks.
- Production verification services are not active.
- Current production Supabase, secrets, providers, and deployment posture are not verified.
- The repository is currently reported as public; founder must confirm this is intentional.
- Current native compact/tablet verification is incomplete.

### P2

- 17 npm audit findings require triage.
- 15 lint warnings were previously reported.
- Jest/Babel Jest major mismatch.
- `mobile/app.json` previously contained `extra.useMockData: true`; verify whether it remains stale.
- Documentation has experienced drift.
- Some major systems remain partial: media, social, notifications, official organizations, and production verification.

### P3

- `mobile/src/types/contracts.ts.save` was previously reported as a tracked backup-style file.
- `PLANS.md` and `docs/RECOVERY_STATUS.md` were previously absent.
- README and older reports may contain outdated milestone language.

---

## 9. Privacy and verification rules

- Exact residential addresses and exact home coordinates must never be publicly exposed.
- Public profile location should be limited to neighborhood, a privacy-safe zone, or no location.
- Address autocomplete, normalization, digital addressing, and geocoding are not proof of residence.
- Foreground geolocation is a supporting consistency signal, not conclusive proof.
- Neighborhood assignment and feed authorization must be enforced server-side.
- Unverified users must not bypass locked feeds through direct API calls.
- Cross-neighborhood users must not access ordinary private neighborhood posts.
- Ghana Card images must not be photographed, scanned, uploaded, photocopied, or retained for the planned verification process.
- Manual biometrics must remain labeled as test identity assurance unless an approved production integration exists.
- Legal identity and public display identity must remain separate.
- Test verification must never silently operate in production.
- Service-role credentials and provider secrets must remain server-side.
- Push payloads must not contain exact addresses, legal names, private messages, Ghana Card data, biometric data, private faith/group membership, exact pickup locations, or report evidence.
- School-community scope remains adult-only unless a separate child-safety program is approved.
- Faith-group membership is sensitive, opt-in, and private by default.

---

## 10. Updated completion roadmap

The repository is ahead of the old Day 3 roadmap. Do not rebuild Marketplace, Groups, or Events from scratch.

### Checkpoint A — Finalize PR #70 and persist continuity

PR #70 is merged and post-merge CI is green. The continuity documents are being restored and reconciled on `codex/continuity-after-pr70`. Merge that documentation-only PR before Checkpoint B.

### Checkpoint B — Native compact/tablet/accessibility verification

Verify the merged app on:

- Compact Android phone
- Higher-quality Android phone where available
- iPhone where available
- Tablet portrait
- Tablet landscape
- Large text
- Screen reader
- Reduced motion
- Slow/intermittent network
- Permission-denied states
- Exact-address and pickup-location privacy

Repairs discovered here must be handled in small, separate PRs.

### Checkpoint C — Complete app shell

- Final bottom navigation
- Central Create menu
- Notification center route
- Profile destination
- Location context
- Tablet rail/layout behavior
- Authorized deep-link foundation

### Checkpoint D — Complete shared media and social foundation

- Video
- Universal image/video upload
- Retry/resume
- Media moderation
- Full emoji reactions
- `@mentions`
- Internal sharing
- Invite neighbors

### Checkpoint E — Unified notifications

- Domain events
- Notification policy
- Outbox
- Device tokens
- Push provider adapter
- Delivery records
- Receipts
- Retry/deduplication
- In-app fallback
- Authorized deep links
- Nearby, reply, mention, group, event, Marketplace, verification, and agency events

### Checkpoint F — Organization and agency publishing

- Shared organization model
- Organization verification
- Staff roles
- Strong authentication
- Police, fire, city, utility, and emergency broadcast workflows
- Geographic targeting
- Approval
- Revisions
- Cancellation
- Expiration
- Audit history

### Checkpoint G — Production verification and hardening

- Real SMS
- Ghana phone normalization
- Ghana-compatible address integration
- GhanaPost GPS
- Map confirmation
- Residence verification
- Approved identity provider
- Webhook verification
- Rate limiting
- Environment separation
- Test-path lockouts
- Secret management
- Sentry/observability
- Branch protection and required CI
- Dependency-security remediation

### Checkpoint H — Release candidate

- Full typecheck
- Lint
- Unit/integration tests
- SQL/RLS/Storage tests
- Privacy tests
- Production-lockout tests
- Native matrix
- Performance
- Accessibility
- Preview build
- CI
- Known-defect report
- Release checklist

No production launch, paid remote build, real SMS, real push, identity activation, or public agency alert may occur without founder authorization.

---

## 11. Durable-session protocol

A session prompt cannot prevent the platform from expiring a temporary workspace. The project must remain recoverable without that workspace.

### Mandatory rules

1. GitHub is the source of truth for code.
2. No important project file may exist only in a session sandbox.
3. Every coherent change must be committed and pushed to a named branch.
4. One active implementation checkpoint per branch/PR.
5. Update `docs/SESSION_CHECKPOINT.md` before and after each checkpoint.
6. Update `docs/CURRENT_STATE.md` whenever branch, PR, migration, CI, or build status changes.
7. Never leave more than one small uncommitted change set.
8. Before a long build, external browser workflow, or migration:
   - commit
   - push
   - record the exact next action
9. When blocked:
   - do not keep guessing
   - record the blocker in the PR and checkpoint file
   - push all safe work
10. Do not rely on chat memory, attached copies, `/tmp`, or `/workspace`.
11. Never store secrets in Git, handoff files, screenshots, logs, or chat.
12. A session may continue through multiple checkpoints only when each checkpoint is independently committed, pushed, tested, and documented.

### Recovery rule

A new session should be able to resume using only:

- GitHub repository
- Open PRs
- CI status
- `docs/MY_CORNER_MASTER_HANDOFF.md`
- `docs/CURRENT_STATE.md`
- `docs/SESSION_CHECKPOINT.md`
- `PLANS.md`
- `CHANGELOG.md`

---

## 12. Credit and error-control rules

- Do not rerun an unchanged failing command.
- Maximum two evidence-based repair attempts for the same failure.
- Run targeted tests before full tests.
- Run local verification before paid remote builds.
- Do not broadly rewrite working modules.
- Do not regenerate all TSX files.
- Do not create duplicate repositories, services, types, tables, or media systems.
- Do not upgrade dependencies without a checkpoint-specific need.
- Do not change package managers.
- Do not create a second lockfile.
- Do not weaken TypeScript, tests, RLS, or privacy controls to make checks pass.
- Do not use `as any`, broad suppressions, skipped tests, or fake production success.
- Stop and persist state instead of continuing to guess.

---

## 13. Evidence required for every checkpoint

A feature is not complete because a route, screen, type, table, mock, or feature flag exists.

Every completion report must include:

- Starting branch and commit
- Final branch and commit
- PR number and state
- Git working-tree status when available
- Files inspected
- Files changed
- Migration identifiers
- RLS or Storage policy changes
- Commands run
- Exit codes
- Typecheck result
- Lint result
- Test files and counts
- Build/export result
- CI result
- Preview-build ID where applicable
- Manual device/runtime evidence
- P0/P1/P2/P3 defects
- External blockers
- Exact next action

Classify every item:

- Completed and verified
- Completed but not independently verified
- Partially completed
- Blocked
- Not started
- Not applicable

---

## 14. First action for the next execution session

1. Read the repository continuity documents.
2. Verify `main` includes PR #70 merge commit `dfea274af7b16f28060b7173e630c468924c23a6`.
3. Confirm post-merge Mobile CI run `33451194302` remains successful.
4. Complete the continuity-documentation PR if it is still open.
5. Start Checkpoint B on a new named branch: native compact/tablet/accessibility verification.
6. Persist each repair as a small, independently tested PR.
7. Do not trigger EAS, production deployment, real messaging, identity activation, destructive migrations, or secret changes without founder approval.

## 15. Current exact resume point

**PR #70 is merged and verified.**

- `main`: `dfea274af7b16f28060b7173e630c468924c23a6`
- Post-merge Mobile CI: run `33451194302`, success
- Active checkpoint: continuity documentation on `codex/continuity-after-pr70`
- Exact next implementation checkpoint: native compact/tablet/accessibility verification

Do not repeat PR #68, PR #69, or PR #70. Do not trigger EAS.
