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

update public.profiles
set auth_user_id = case display_name
  when 'Akosua Mensah' then '11111111-1111-4111-8111-111111111111'::uuid
  when 'Kwame PipeCare' then '22222222-2222-4222-8222-222222222222'::uuid
  when 'Ama Spark Works' then '33333333-3333-4333-8333-333333333333'::uuid
  else auth_user_id
end
where display_name in ('Akosua Mensah', 'Kwame PipeCare', 'Ama Spark Works');

select pg_temp.assert_true(
  (select count(*) from public.provider_profiles) = 12,
  'seed data must include exactly 12 fictional providers'
);

select pg_temp.assert_true(
  (
    select count(*)
    from public.provider_trust_signals pts
    join public.provider_profiles pp on pp.id = pts.provider_id
    group by pp.id
    having count(*) < 4
    limit 1
  ) is null,
  'each provider must have at least four trust signals'
);

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select pg_temp.assert_true(
  (select count(*) from public.profiles) = 1,
  'requester should only read their own profile'
);

select pg_temp.assert_true(
  (select count(*) from public.provider_profiles) = 12,
  'requester should read active provider listings'
);

insert into public.job_requests (
  requester_id,
  provider_id,
  category_id,
  title,
  description,
  original_user_text,
  urgency,
  preferred_date,
  preferred_time,
  contact_preference,
  neighborhood_id,
  general_area_label,
  exact_address_private,
  status
)
select
  requester.id,
  provider.id,
  'plumbing',
  'Bathroom pipe leak',
  'A bathroom pipe is leaking. Please inspect and advise on repair.',
  'Bathroom pipe leaking near the sink.',
  'soon',
  date '2026-07-25',
  'Morning',
  'app_update',
  neighborhood.id,
  'East Legon, near Lagos Avenue',
  'PRIVATE TEST ADDRESS',
  'Submitted'
from public.profiles requester
join public.provider_profiles provider on provider.business_name = 'Kwame PipeCare'
join public.neighborhoods neighborhood on neighborhood.name = 'East Legon'
where requester.display_name = 'Akosua Mensah';

select pg_temp.assert_true(
  exists (
    select 1
    from public.job_requests
    where title = 'Bathroom pipe leak'
      and general_area_label = 'East Legon, near Lagos Avenue'
  ),
  'requester should be able to create their own job request'
);

insert into public.job_request_photos (job_request_id, storage_path)
select id, 'requests/smoke/photo-1.jpg'
from public.job_requests
where title = 'Bathroom pipe leak';

select pg_temp.assert_true(
  exists (
    select 1
    from public.job_request_photos
    where storage_path = 'requests/smoke/photo-1.jpg'
  ),
  'requester should be able to attach a request photo'
);

do $$
begin
  update public.job_requests
  set status = 'Accepted'
  where title = 'Bathroom pipe leak';

  raise exception 'requester must not be able to accept their own request as provider';
exception
  when insufficient_privilege then
    null;
  when check_violation then
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
  'assigned provider should read the assigned request'
);

do $$
begin
  perform exact_address_private
  from public.job_requests
  where title = 'Bathroom pipe leak';

  raise exception 'assigned provider must not be able to read exact_address_private through normal client grants';
exception
  when insufficient_privilege then
    null;
end;
$$;

update public.job_requests
set status = 'Viewed'
where title = 'Bathroom pipe leak';

select pg_temp.assert_true(
  exists (
    select 1
    from public.job_requests
    where title = 'Bathroom pipe leak'
      and status = 'Viewed'
  ),
  'assigned provider should update an assigned request to Viewed'
);

insert into public.provider_responses (
  job_request_id,
  provider_id,
  response_status,
  message
)
select
  jr.id,
  jr.provider_id,
  'Accepted',
  'I can come tomorrow morning and will confirm before I leave.'
from public.job_requests jr
where jr.title = 'Bathroom pipe leak';

select pg_temp.assert_true(
  exists (
    select 1
    from public.provider_responses
    where message = 'I can come tomorrow morning and will confirm before I leave.'
  ),
  'assigned provider should create an accepted response'
);

do $$
begin
  update public.job_requests
  set requester_id = (
    select id
    from public.profiles
    where auth_user_id = '22222222-2222-4222-8222-222222222222'
  )
  where title = 'Bathroom pipe leak';

  raise exception 'provider must not be able to change the requester on an assigned request';
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
  'unassigned provider should not read another provider request'
);

update public.job_requests
set status = 'Accepted'
where title = 'Bathroom pipe leak';

select pg_temp.assert_true(
  not exists (
    select 1
    from public.job_requests
    where title = 'Bathroom pipe leak'
      and status = 'Accepted'
  ),
  'unassigned provider should not update another provider request'
);

reset role;

select 'module1_rls_smoke_passed' as result;
