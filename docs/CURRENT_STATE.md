# MY CORNER — CURRENT STATE

**Updated:** 2026-09-01
**Evidence timezone:** Africa/Accra

## Repository

- GitHub: `pushee-io/My-Corner-Trusted-People`
- Starting live `main`: `456928459f416fe398c1fca7aba1aafdd0133056`
- PR #88 bounded session restoration during Preview network failure.
- PR #89 added provider-inbox polling and manual refresh.
- PR #91 added stable fictional seed identities and retired duplicate provider listings without deleting history.
- PR #91 post-merge Mobile CI `33564231661`: success.
- PR #91 post-merge Database CI `33564231657`: success.
- Supabase Preview check `100043750620`: success.
- Repository visibility: public.
- Branch protection on `main`: not enabled.

## Native Evidence

The verified APK from commit `5eb06091e8352f949f7c78d87674f74b40833011` was installed on Samsung SM-G736U. Device evidence confirmed:

- offline network failures no longer justify an indefinite session-restoration wait;
- requester submission and status persistence work;
- provider inbox synchronization required a refresh path;
- the Preview provider test account was linked to Ama Spark Works while the documented fixture is Kwame PipeCare;
- selecting Naa HomeFix or Kwame PipeCare therefore produced a request the signed-in provider could not read, as Row Level Security correctly enforced provider isolation.

## Active Repair

Branch `codex/reconcile-provider-test-contract` adds a forward-only, idempotent migration that links the fictional `provider.test` account to the documented Kwame PipeCare seed profile. It preserves all provider profiles and job requests, clears only the previous fictional account link, and records an audit event.

## Exact Next Action

Verify the repair PR in Mobile CI and Database CI. After merge, apply the non-destructive migration to Preview through the approved migration path, confirm the provider inbox identifies Kwame PipeCare, then submit a new requester test request to Kwame PipeCare and verify accept/decline propagation.

## Known Gates

- The single paid Android Preview build authorization is consumed; do not submit another paid build without founder approval.
- Do not deploy to production or activate real SMS, push, identity, residence, address-provider, or sensitive-data processing.
- Production database state remains unverified.
- Founder confirmation is required before treating public repository visibility as intentional for private operational material.
