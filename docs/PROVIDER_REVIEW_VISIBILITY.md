# Provider review visibility — 2026-09-24

## Confirmed root cause

The provider card tap opened the request composer, not `/hire/provider/[providerId]`. The real detail route already queried and rendered `VerifiedReviews`, but the normal Hire flow bypassed it. `/provider/profile-preview` was an independent hard-coded screen without reviews. Both entry points are corrected; the real profile's stale hard-coded sample-request link is replaced with the normal editable request form.

| Hypothesis | Finding |
| --- | --- |
| Records exist but are not queried | Real review exists and the review RPC queries it; the tapped destination never mounted that component |
| Queried but not rendered | Real detail component renders the returned list; it was bypassed |
| Disconnected seeded aggregate | Legacy provider counters are 4.8/37, but the visible 4.0/1 comes from the actual published review |
| Neighbor blocked by RLS | Read-only authenticated non-reviewer check returned average 4.0, count 1, one review and its body |
| Detail route lacks Reviews | Real detail has it; static provider preview omitted it and Hire tapped a different route |

## Changes and security

One actual provider profile is now reached from Hire and provider preview. Shows title, accessible stars, body, Verified Job, date, masked public author, explicit Yes/No recommendation, and corresponding clean provider response. One review uses singular grammar; zero uses No verified reviews yet. Three recent rows first; See all reviews opens newest-first cursor pages of ten, with older/newest navigation. Summary cards request zero review rows.

The server computes both totals and page content from the same eligible relation: published verified review → matching requester/assigned provider → Completed job → completed Job Safety with both acknowledgements. It also enforces accepting-provider visibility, matching the existing provider repository RLS. No extra account, request, location or moderation fields are returned. Negative reviews stay eligible unless normal moderation changes their state. No stored experience tags currently exist.

## Preview fixture

`supabase/fixtures/provider_verified_review_preview.sql` is excluded from migrations and automatic seeds. It requires explicit Preview environment plus exact approved project opt-in. Only execute on `opeojxwkwwnnncnsuaag`; never production. It creates an idempotent synthetic completed job, completion acknowledgements and a real matching review row for the seeded Kwame provider. Title/body/author/response explicitly identify a fictional demo. No real completed work is claimed. Existing review is preserved; two 4-star rows yield 4.0/5 and two verified reviews after fixture application.

## Verification and remaining gates

Local: 472 tests/88 suites, typecheck, formatting and lint pass (zero errors/15 existing warnings). SQL tests cover aggregate/row consistency, completion relationship, moderation exclusion, other providers, authorized neighbors, private-field omission, response association, cursor paging and fixture idempotence. CI/deployment outcome will be recorded after verification.

Current APK version 39 does not include this navigation fix. No new paid build is authorized by this checkpoint. Device acceptance remains pending: Hire → Kwame → Reviews → inspect stars/title/body/badge/date/author/recommendation/response, then Start request; repeat on Samsung and Pixel Tablet. Record results without calling the checkpoint fully accepted until both devices pass.
