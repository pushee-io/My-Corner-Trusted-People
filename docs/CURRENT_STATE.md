# MY CORNER — CURRENT STATE

**Updated:** 2026-09-02
**Evidence timezone:** Africa/Accra

## Repository

- GitHub: `pushee-io/My-Corner-Trusted-People`
- Live `main`: `922a7c4671078ffc94e74141c2cff794c46764ef`
- PR #92 aligned the fictional Preview provider account with canonical Kwame PipeCare.
- PR #93 persisted that checkpoint.
- PR #94 rejects new requests targeting inactive or retired provider profiles.
- PR #94 final Mobile CI `33574967156`: success.
- PR #94 final Database CI `33574967154` and `33574965187`: success.
- PR #94 post-merge Mobile CI `33575181099`: success.
- PR #94 post-merge Database CI `33575181081`: success.
- Supabase Preview check `100077604509`: success for project `opeojxwkwwnnncnsuaag`.
- Repository visibility: public.
- Branch protection on `main`: not enabled.

## Verified Defect And Repair

Device evidence proved the provider account could read the canonical Kwame PipeCare seed request while a new requester submission was absent. The requester had used a retired duplicate Kwame provider UUID cached before PR #91.

PR #94 now enforces two boundaries:

- PostgreSQL rejects requester inserts unless the provider profile is currently accepting requests.
- Current mobile source checks provider availability before submission and tells the requester to refresh stale provider results.

The existing unreachable request was preserved and was not silently reassigned.

## Exact Next Action

1. Requester cancels the unreachable “Leaking pipes in the bathroom” test request.
2. Requester fully closes and reopens My Corner to clear the cached provider result.
3. Requester selects Kwame PipeCare again and submits one replacement titled “Bathroom pipe retest.”
4. Provider fully closes and reopens My Corner once.
5. Provider confirms the request appears, accepts or declines, and requester verifies the persisted status.

## Known Gates

- The single paid Android Preview build authorization is consumed; do not submit another paid build without founder approval.
- The installed APK predates the later client refresh and validation code, so full close/reopen remains necessary for this test.
- Do not deploy to production or activate real SMS, push, identity, residence, address-provider, or sensitive-data processing.
- Production database state remains unverified.
