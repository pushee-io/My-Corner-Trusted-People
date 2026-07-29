create or replace function pg_temp.assert_true(ok boolean, message text)
returns void
language plpgsql
as $$
begin
  if not ok then
    raise exception '%', message;
  end if;
end;
$$;

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select pg_temp.assert_true(
  exists (
    select 1
    from public.provider_profiles
    where business_name = 'Kwame PipeCare'
      and accepting_requests is true
  ),
  'explicit live read should see accepting provider listings through RLS'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.provider_services ps
    join public.provider_profiles pp on pp.id = ps.provider_id
    where pp.business_name = 'Kwame PipeCare'
      and ps.category_id = 'plumbing'
  ),
  'explicit live read should see provider service categories through RLS'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.provider_trust_signals pts
    join public.provider_profiles pp on pp.id = pts.provider_id
    where pp.business_name = 'Kwame PipeCare'
  ),
  'explicit live read should see safe trust signals through RLS'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.job_requests
    where title = 'Bathroom pipe leak'
      and general_area_label = 'East Legon, near Lagos Avenue'
      and provider_id = (
        select id
        from public.provider_profiles
        where business_name = 'Kwame PipeCare'
      )
  ),
  'requester live read should see their own request through RLS'
);

do $$
begin
  perform exact_address_private
  from public.job_requests
  where title = 'Bathroom pipe leak';

  raise exception 'requester live read must not expose exact_address_private';
exception
  when insufficient_privilege then
    null;
end;
$$;

reset role;
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

select pg_temp.assert_true(
  exists (
    select 1
    from public.job_requests
    where title = 'Bathroom pipe leak'
      and general_area_label = 'East Legon, near Lagos Avenue'
  ),
  'assigned provider live read should see assigned request through RLS'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.provider_responses pr
    join public.job_requests jr on jr.id = pr.job_request_id
    where jr.title = 'Bathroom pipe leak'
      and pr.message = 'I can come tomorrow morning and will confirm before I leave.'
  ),
  'assigned provider live read should see provider response through RLS'
);

do $$
begin
  perform exact_address_private
  from public.job_requests
  where title = 'Bathroom pipe leak';

  raise exception 'assigned provider live read must not expose exact_address_private';
exception
  when insufficient_privilege then
    null;
end;
$$;

reset role;
set role authenticated;
set request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';

select pg_temp.assert_true(
  not exists (
    select 1
    from public.job_requests
    where title = 'Bathroom pipe leak'
  ),
  'unassigned provider live read should not see another provider request through RLS'
);

select pg_temp.assert_true(
  not exists (
    select 1
    from public.provider_responses pr
    join public.job_requests jr on jr.id = pr.job_request_id
    where jr.title = 'Bathroom pipe leak'
  ),
  'unassigned provider live read should not see another provider response through RLS'
);

reset role;

select 'day2b_live_read_smoke_passed' as result;
