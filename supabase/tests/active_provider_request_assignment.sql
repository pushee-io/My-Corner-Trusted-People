begin;

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
set auth_user_id = '55555555-5555-4555-8555-555555555555'::uuid
where seed_key = 'pilot-requester-akosua-mensah';

insert into public.provider_profiles (
  profile_id, business_name, headline, general_area, availability, accepting_requests
)
select profile.id, 'Retired Provider Fixture',
  'Inactive provider used only by the database regression',
  'East Legon', 'Unavailable', false
from public.profiles profile
where profile.seed_key = 'pilot-provider-ama-spark-works';

set role authenticated;
set request.jwt.claim.sub = '55555555-5555-4555-8555-555555555555';

do $$
begin
  insert into public.job_requests (
    requester_id, provider_id, category_id, title, description, original_user_text,
    urgency, preferred_date, preferred_time, contact_preference, neighborhood_id,
    general_area_label, status
  )
  select requester.id, provider.id, 'plumbing',
    'Inactive provider assignment must fail',
    'This write must be rejected by the active-provider assignment policy.',
    'Inactive provider assignment', 'soon', date '2026-09-02', 'Morning',
    'app_update', neighborhood.id, 'East Legon, general area only', 'Submitted'
  from public.profiles requester
  join public.provider_profiles provider on provider.business_name = 'Retired Provider Fixture'
  join public.neighborhoods neighborhood on neighborhood.name = 'East Legon'
  where requester.seed_key = 'pilot-requester-akosua-mensah';

  raise exception using errcode = 'ZX001',
    message = 'inactive provider assignment unexpectedly succeeded';
exception
  when insufficient_privilege or check_violation then null;
end;
$$;

insert into public.job_requests (
  requester_id, provider_id, category_id, title, description, original_user_text,
  urgency, preferred_date, preferred_time, contact_preference, neighborhood_id,
  general_area_label, status
)
select requester.id, provider.id, 'plumbing',
  'Active provider assignment succeeds',
  'This write verifies that canonical active providers remain requestable.',
  'Active provider assignment', 'soon', date '2026-09-02', 'Morning',
  'app_update', neighborhood.id, 'East Legon, general area only', 'Submitted'
from public.profiles requester
join public.provider_profiles provider on provider.seed_key = 'pilot-provider-kwame-pipecare'
join public.neighborhoods neighborhood on neighborhood.name = 'East Legon'
where requester.seed_key = 'pilot-requester-akosua-mensah';

select pg_temp.assert_true(
  exists (select 1 from public.job_requests where title = 'Active provider assignment succeeds'),
  'requesters must still create requests for active providers'
);

select pg_temp.assert_true(
  not exists (select 1 from public.job_requests where title = 'Inactive provider assignment must fail'),
  'inactive providers must never receive new requests'
);

reset role;
select 'active_provider_request_assignment_passed' as result;
rollback;
