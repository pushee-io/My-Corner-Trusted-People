# Decision Log

## 2026-08-20 - Separate Groups discovery from participation

Decision: Keep `/groups` as a concise directory and move posts, comments, likes, sharing, and reporting to `/groups/[groupId]`.
Reason: A group name must behave as a destination, while participation controls need the context and privacy boundary of one group.
Security: Extend the existing `social_groups` and `social_group_posts` model. Member-only RLS protects comments and reactions, and a validated RPC prevents reports against hidden posts.
Compatibility: Preserve group creation, membership moderation, Events routes, existing migrations, and the restored Supabase repository boundaries.

## 2026-07-16 - Build Module 1 as a local vertical slice first

Decision: Use fictional in-memory app data plus Supabase migrations/seed SQL rather than waiting for a live Supabase project.
Reason: No Supabase credentials were available, and the first build was not to be blocked on unavailable access.

## 2026-07-16 - Use Expo SDK 57 target

Decision: Record Expo SDK 57, React Native 0.86, and React 19.2 as an upgrade target.
Reason: The available release notes identified that family as current at the time.
Superseded on 2026-08-02: the repository actually installs Expo 54.0.34, React Native 0.81.5, and React 19.1.0. The installed family is now the documented baseline until a dedicated upgrade is approved and verified.

## 2026-07-16 - Keep AI features feature-flagged and server-side

Decision: Mobile contains only feature-flagged fallbacks and no OpenAI secret.
Reason: OpenAI requests and secrets must remain behind a trusted backend.

## 2026-07-16 - Approve logo direction A

Decision: Founder approved the Figma "Logo direction A - Corner meeting point."
Reason: It communicates local connection without a generic handshake or unconditional trust claim.
Impact: Complete the clean vector redraw and availability review before final adoption.

## 2026-07-16 - Keep exact address private

Decision: Public and provider-browsing surfaces use general areas; exact addresses remain private.
Reason: This protects requester and resident safety, including GhanaPost GPS data.

## 2026-07-16 - Use founder-provided Figma source file

Decision: Use the founder-provided Module 1 Figma file as the design source of truth.
Reason: It replaced the temporary scaffold and contains the approved direction.

## 2026-08-02 - Keep Events disabled after merge

Decision: Keep the `events` feature flag disabled in every environment.
Reason: Events stabilization now includes authenticated context, fail-closed gating, clean-reset Database CI, and 31 enforced pgTAP assertions. Native device verification and final production membership composition remain outstanding.
Exit: authenticated live-repository parity, route-level feature gating, functional RLS tests, device verification, and reviewed staging migration.

## 2026-08-02 - Treat seeded and live Events repositories as different maturity levels

Decision: The seeded repository is a domain prototype and test double; it is not evidence that the live Events slice is complete.
Reason: It accepts caller-provided viewer and area values, while production authorization must derive identity and membership from authenticated server state.
Impact: Create one complete repository interface, implement it for Supabase, and inject the selected implementation through a single runtime composition boundary.

## 2026-08-02 - Preserve private event access behind audited RPCs

Decision: Continue separating `event_private_access` from public event rows and deny direct client grants.
Reason: This is the strongest part of the Events privacy design.
Follow-up: audit changes to private access as well as reads, define retention/redaction rules, and add functional access tests.

## 2026-08-02 - Reconcile the installed Expo family before upgrades

Decision: Document Expo 54.0.34/React Native 0.81.5/React 19.1.0 as the current baseline; do not present SDK 57 as installed.
Reason: `mobile/package.json` and `mobile/package-lock.json` are the implementation evidence.
Impact: Either stabilize on SDK 54 or schedule a separate whole-family upgrade with official release verification, Expo Doctor, and native preview builds.

## 2026-08-02 - Do not infer test success from test source

Decision: Use the terms implemented, executed, and passed separately in project reporting.
Reason: This was true for the original `d44d7d9` audit. Events stabilization later supplied local evidence for formatting, lint with zero errors, type checking, 51 Jest suites, 250 tests, a clean Supabase reset, all legacy SQL checks, and 31 Events pgTAP assertions.
Impact: Events remains unverified until clean-checkout mobile and database evidence is captured.

## 2026-08-02 - Recommend Production Verification Services after Events stabilization

Decision: After the short Events stabilization milestone, prioritize Production Verification Services over Push Notifications.
Reason: verified neighborhood membership is an authorization dependency for private feed and Events access; notifications improve engagement but do not establish the trust boundary.
Scope: production phone verification and residence-assurance provider abstractions first. Identity verification, biometric processing, background checks, legal-language changes, and paid vendor activation require founder approval and qualified privacy/legal review.
Deferred: retain the domain outbox but do not deliver real push notifications until verified membership, consent, preferences, token lifecycle, and delivery monitoring are production-ready.
