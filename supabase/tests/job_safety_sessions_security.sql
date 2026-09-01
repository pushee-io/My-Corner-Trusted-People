create or replace function pg_temp.assert_true(ok boolean, message text)
returns void
language plpgsql
as $$
begin
  if not ok then
    raise exception '%', message;
  end if;
end
$$;

update public.profiles
set auth_user_id = case display_name
  when 'Akosua Mensah' then '11111111-1111-4111-8111-111111111111'::uuid
  when 'Kwame PipeCare' then '22222222-2222-4222-8222-222222222222'::uuid
  when 'Ama Spark Works' then '33333333-3333-4333-8333-333333333333'::uuid
  else auth_user_id
end
where display_name in ('Akosua Mensah', 'Kwame PipeCare', 'Ama Spark Works');

create temporary table safety_test_context (
  request_id uuid not null,
  one_time_code text
);
grant select, update on safety_test_context to authenticated;

select set_config(
  'app.settings.job_safety_location_key',
  'job-safety-test-key-2026-only-not-for-production',
  false
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
  status
)
select
  requester.id,
  provider.id,
  'plumbing',
  'Job safety session test',
  'A fictional request used to verify the accepted-job safety session.',
  'Safety session test',
  'soon',
  date '2026-08-26',
  'Morning',
  'app_update',
  neighborhood.id,
  'East Legon, general area only',
  'Submitted'
from public.profiles requester
join public.provider_profiles provider on provider.business_name = 'Kwame PipeCare'
join public.neighborhoods neighborhood on neighborhood.name = 'East Legon'
where requester.display_name = 'Akosua Mensah';

update public.job_requests
set status = 'Viewed'
where title = 'Job safety session test';

update public.job_requests
set status = 'Accepted'
where title = 'Job safety session test';

insert into safety_test_context (request_id)
select id from public.job_requests where title = 'Job safety session test';

select pg_temp.assert_true(
  exists (
    select 1
    from public.job_safety_sessions safety
    join safety_test_context context on context.request_id = safety.job_request_id
    where safety.state = 'awaiting_location'
  ),
  'acceptance must create a safety session awaiting requester location release'
);

set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

do $$
begin
  perform * from public.job_safety_sessions;
  raise exception 'authenticated users must not read the private safety table directly';
exception
  when insufficient_privilege then null;
end
$$;

update safety_test_context
set one_time_code = (
  public.set_job_safety_location(
    request_id,
    5.650450,
    -0.154120,
    'Private test pin near Lagos Avenue',
    'job_safety_location_v1'
  ) ->> 'one_time_code'
);

select pg_temp.assert_true(
  one_time_code ~ '^[0-9]{6}$',
  'requester must receive a six-digit code exactly when releasing the location'
)
from safety_test_context;

select pg_temp.assert_true(
  session.private_location_label = 'Private test pin near Lagos Avenue'
    and session.can_view_exact_location,
  'requester should read their own released private location through the RPC'
)
from safety_test_context context
cross join lateral public.get_job_safety_session(context.request_id) session;

reset role;
set role authenticated;
set request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';

do $$
declare
  request_id_value uuid := (select request_id from safety_test_context);
begin
  perform * from public.get_job_safety_session(request_id_value);
  raise exception 'an unassigned provider must not read the safety session';
exception
  when insufficient_privilege then null;
end
$$;

reset role;
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

select pg_temp.assert_true(
  session.private_location_label = 'Private test pin near Lagos Avenue'
    and session.viewer_role = 'provider'
    and session.can_view_exact_location,
  'assigned provider should receive the exact pin only after requester release'
)
from safety_test_context context
cross join lateral public.get_job_safety_session(context.request_id) session;

select public.mark_job_safety_arrived(request_id) from safety_test_context;

do $$
declare
  request_id_value uuid := (select request_id from safety_test_context);
begin
  perform public.start_job_safety_session(request_id_value, '123456');
  raise exception 'provider must not start before requester confirms arrival';
exception
  when invalid_parameter_value then null;
end
$$;

reset role;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select public.confirm_job_safety_arrival(request_id) from safety_test_context;

reset role;
set role authenticated;
set request.jwt.claim.sub = '22222222-2222-4222-8222-222222222222';

select pg_temp.assert_true(
  public.start_job_safety_session(request_id, '000000') ->> 'reason' = 'invalid_code',
  'wrong code must be rejected without starting the job'
)
from safety_test_context;

select pg_temp.assert_true(
  (public.start_job_safety_session(request_id, one_time_code) ->> 'started')::boolean,
  'assigned provider should start the session with the requester code'
)
from safety_test_context;

select pg_temp.assert_true(
  exists (
    select 1
    from public.job_requests request
    join safety_test_context context on context.request_id = request.id
    where request.status = 'In progress'
  ),
  'successful code verification must move the job to In progress'
);

select public.acknowledge_job_safety_completion(request_id) from safety_test_context;

select pg_temp.assert_true(
  exists (
    select 1
    from public.job_requests request
    join safety_test_context context on context.request_id = request.id
    where request.status = 'In progress'
  ),
  'provider completion alone must not complete the job'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select pg_temp.assert_true(
  (public.acknowledge_job_safety_completion(request_id) ->> 'completed')::boolean,
  'requester confirmation must complete the two-party handshake'
)
from safety_test_context;

select pg_temp.assert_true(
  exists (
    select 1
    from public.job_requests request
    join safety_test_context context on context.request_id = request.id
    where request.status = 'Completed'
  ),
  'second completion confirmation must move the job to Completed'
);

reset role;

select pg_temp.assert_true(
  exists (
    select 1
    from public.job_safety_sessions safety
    join safety_test_context context on context.request_id = safety.job_request_id
    where safety.state = 'completed'
      and safety.requester_completed_at is not null
      and safety.provider_completed_at is not null
      and safety.code_hash is null
  ),
  'completed safety session must retain both acknowledgements and retire the code hash'
);

select pg_temp.assert_true(
  (select count(*) from public.audit_events audit
   join safety_test_context context on context.request_id = audit.target_id
   where audit.action like 'job_safety_%') >= 8,
  'sensitive reads and every safety transition must be audited'
);

select 'job_safety_sessions_security_passed' as result;
