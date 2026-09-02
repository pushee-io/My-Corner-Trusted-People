# MY CORNER — CURRENT STATE

**Updated:** 2026-09-01
**Evidence timezone:** Africa/Accra

## Repository

- GitHub: `pushee-io/My-Corner-Trusted-People`
- Live `main`: `1e29550a4dba12d5676ee73302dec1768b113702`
- PR #88 bounded session restoration during Preview network failure.
- PR #89 added provider-inbox polling and manual refresh.
- PR #91 added stable fictional seed identities and retired duplicate provider listings without deleting history.
- PR #92 aligned the fictional Preview provider account with the documented Kwame PipeCare fixture.
- PR #92 branch Database CI `33569681822`: success.
- PR #92 pull-request Database CI `33569725510`: success.
- PR #92 post-merge Database CI `33570023910`: success.
- Supabase Preview check `100061862877`: success for project `opeojxwkwwnnncnsuaag`.
- Repository visibility: public.
- Branch protection on `main`: not enabled.

## Native Evidence

The verified APK from commit `5eb06091e8352f949f7c78d87674f74b40833011` was installed on Samsung SM-G736U. Device evidence confirmed:

- requester submission and request-status persistence work;
- PR #88 prevents indefinite session restoration during network failure;
- PR #89 adds provider-inbox synchronization and manual refresh;
- RLS correctly hid requests assigned to a different provider;
- Preview had linked the fictional provider account to Ama Spark Works while repository documentation specified Kwame PipeCare.

PR #92 repaired the fixture mapping without deleting provider profiles or reassigning requests. The migration is deployed to Preview and its clean-reset regression is green.

## Confirmed Follow-up Defect

Two-device evidence after PR #92 shows the provider can read the canonical Kwame PipeCare seed request, proving the auth mapping and provider RLS path are correct. The new requester submission is absent because the requester used a retired duplicate provider UUID cached before PR #91. The request insert policy currently checks requester ownership but not provider availability.

Branch `codex/reject-inactive-provider-requests` adds a server-enforced active-provider requirement, a client preflight with refresh guidance, and database/mobile regressions. The existing unreachable request remains intact and may be cancelled by its requester; it is not silently reassigned.

## Exact Next Action

Verify and merge the inactive-provider guard. After its Preview migration succeeds, cancel the unreachable test request, fully restart the requester app to clear its cached provider list, and submit one replacement request to canonical Kwame PipeCare.

## Known Gates

- The single paid Android Preview build authorization is consumed; do not submit another paid build without founder approval.
- Do not deploy to production or activate real SMS, push, identity, residence, address-provider, or sensitive-data processing.
- Production database state remains unverified.
- Founder confirmation is required before treating public repository visibility as intentional for private operational material.
