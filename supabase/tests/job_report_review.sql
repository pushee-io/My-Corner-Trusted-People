begin;

-- Fictional transaction-local fixtures; no Preview accounts or private user data.
create or replace function pg_temp.assert_true(ok boolean, message text)
returns void language plpgsql as $$
begin
  if ok is distinct from true then raise exception '%', message; end if;
end;
$$;

create or replace function pg_temp.expect_state(statement text, expected text)
returns void language plpgsql as $$
declare actual text;
begin
  begin
    execute statement;
  exception when others then
    get stacked diagnostics actual = returned_sqlstate;
    if actual = expected then return; end if;
    raise exception 'expected SQLSTATE %, received %', expected, actual;
  end;
  raise exception 'expected SQLSTATE %, but operation succeeded', expected;
end;
$$;

insert into public.profiles (id, auth_user_id, display_name, role) values
  ('96000000-0000-4000-8000-000000000001', '96000000-0000-4000-8000-000000000001', 'QA Job Requester', 'requester'),
  ('96000000-0000-4000-8000-000000000002', '96000000-0000-4000-8000-000000000002', 'QA Job Provider', 'provider'),
  ('96000000-0000-4000-8000-000000000003', '96000000-0000-4000-8000-000000000003', 'QA Job Moderator', 'moderator'),
  ('96000000-0000-4000-8000-000000000004', '96000000-0000-4000-8000-000000000004', 'QA Unrelated Requester', 'requester');

insert into public.neighborhoods (id, name, city) values
  ('96000000-0000-4000-8000-000000000005', 'QA Job Neighborhood', 'QA City');
insert into public.provider_profiles (id, profile_id, business_name, headline, general_area, availability, accepting_requests)
values ('96000000-0000-4000-8000-000000000006', '96000000-0000-4000-8000-000000000002',
  'QA Job Provider', 'Fictional test provider', 'QA Job Neighborhood', 'Available', true);

create temporary table job_report_test_context (request_id uuid, report_id uuid, unrelated_report_id uuid);
grant select, insert, update on job_report_test_context to authenticated;
insert into job_report_test_context (unrelated_report_id) values ('96000000-0000-4000-8000-000000000007');
insert into public.reports (id, reporter_id, reason) values
  ('96000000-0000-4000-8000-000000000007', '96000000-0000-4000-8000-000000000004', 'Unrelated report fixture');

-- Exercise real requester creation and assigned-provider acceptance.
set local role authenticated;
set local request.jwt.claim.sub = '96000000-0000-4000-8000-000000000001';
with created as (
  insert into public.job_requests (
    requester_id, provider_id, category_id, title, description, original_user_text, urgency,
    preferred_date, preferred_time, contact_preference, neighborhood_id, general_area_label,
    exact_address_private, status
  ) values (
    public.current_profile_id(), '96000000-0000-4000-8000-000000000006', 'plumbing',
    'QA job review flow', 'Fictional request', 'Fictional request', 'soon',
    date '2026-09-08', 'Morning', 'app_update', '96000000-0000-4000-8000-000000000005',
    'QA Job Neighborhood', 'PRIVATE_FIXTURE_ADDRESS', 'Submitted'
  ) returning id
)
update job_report_test_context set request_id = (select id from created);

select pg_temp.assert_true(public.is_admin_or_moderator() = false, 'requester is not a moderator');
select pg_temp.expect_state(
  'update public.profiles set role = ''moderator'' where id = public.current_profile_id()', '42501');
select pg_temp.expect_state(
  'update public.profiles set auth_user_id = gen_random_uuid() where id = public.current_profile_id()', '42501');
select pg_temp.expect_state(
  'update public.profiles set id = gen_random_uuid() where id = public.current_profile_id()', '42501');
update public.profiles set display_name = 'QA Job Requester Updated' where id = public.current_profile_id();
select pg_temp.assert_true(
  (select display_name = 'QA Job Requester Updated' from public.profiles where id = public.current_profile_id()),
  'normal profile display edits remain available');

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '96000000-0000-4000-8000-000000000002';
update public.job_requests set status = 'Accepted' where id = (select request_id from job_report_test_context);
reset role;
select pg_temp.assert_true(
  (select state = 'awaiting_location' from public.job_safety_sessions where job_request_id = (select request_id from job_report_test_context)),
  'provider acceptance creates the real safety session');

set local role authenticated;
set local request.jwt.claim.sub = '96000000-0000-4000-8000-000000000004';
select pg_temp.expect_state(
  'select public.submit_job_report(request_id, ''This is an unrelated fictional report.'') from job_report_test_context', '42501');
select pg_temp.expect_state(
  'select public.get_requester_job_report(request_id) from job_report_test_context', '42501');

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '96000000-0000-4000-8000-000000000001';
select pg_temp.assert_true(
  (select public.get_requester_job_report(request_id) is null from job_report_test_context), 'unreported request has no fabricated outcome');
select pg_temp.expect_state(
  'select public.submit_job_report(request_id, ''short'') from job_report_test_context', '22023');
select pg_temp.expect_state(
  'select public.submit_job_report(request_id, null) from job_report_test_context', '22023');
select pg_temp.expect_state(
  'select public.submit_job_report(request_id, repeat(''x'', 1001)) from job_report_test_context', '22023');
select pg_temp.expect_state(
  'insert into public.reports (reporter_id, job_request_id, reason) select public.current_profile_id(), request_id, ''Client insert'' from job_report_test_context', '42501');

update job_report_test_context set report_id = (
  public.submit_job_report(request_id, 'This is a QA safety test. No real incident occurred.') ->> 'report_id'
)::uuid;
select pg_temp.assert_true(
  (public.submit_job_report(request_id, 'This is a repeated fictional safety report.') ->> 'report_id')::uuid = report_id
    and (public.submit_job_report(request_id, 'This is a repeated fictional safety report.') ->> 'already_reported')::boolean,
  'retries return the original report without a duplicate') from job_report_test_context;
select pg_temp.assert_true(
  public.get_requester_job_report(request_id) ->> 'status' = 'open', 'requester sees the persisted open status')
from job_report_test_context;

select pg_temp.expect_state('select public.list_job_moderation_queue(''all'')', '42501');
select pg_temp.expect_state(
  'select public.get_job_moderation_report(report_id) from job_report_test_context', '42501');
select pg_temp.expect_state(
  'select public.resolve_job_report(report_id, ''no_violation'', null) from job_report_test_context', '42501');
select pg_temp.assert_true(
  (select count(*) = 0 from public.moderation_cases where report_id = (select report_id from job_report_test_context)),
  'requester cannot directly read the moderation case');
do $$
begin
  update public.reports set status = 'resolved' where id = (select report_id from job_report_test_context);
  if found then raise exception 'direct clients must not resolve job reports'; end if;
exception when insufficient_privilege then null;
end;
$$;

reset role;
select pg_temp.assert_true(
  (select count(*) = 1 from public.reports where job_request_id = (select request_id from job_report_test_context)),
  'one report persists');
select pg_temp.assert_true(
  (select count(*) = 1 from public.moderation_cases where report_id = (select report_id from job_report_test_context)),
  'one moderation case persists');
select pg_temp.assert_true(
  (select status = 'Reported' from public.job_requests where id = (select request_id from job_report_test_context)),
  'report submission persists the request status');
select pg_temp.assert_true(
  (select state = 'cancelled' from public.job_safety_sessions where job_request_id = (select request_id from job_report_test_context)),
  'report submission closes the safety session');
select pg_temp.assert_true(
  (select count(*) = 1 from public.audit_events where action = 'job_report_submitted' and target_id = (select request_id from job_report_test_context)),
  'submission audit is not duplicated');
select pg_temp.assert_true(
  (select count(*) = 1 from public.job_request_status_events where status = 'Reported' and job_request_id = (select request_id from job_report_test_context)),
  'reported transition is not duplicated');

set local role authenticated;
set local request.jwt.claim.sub = '96000000-0000-4000-8000-000000000003';
select pg_temp.assert_true(public.is_admin_or_moderator(), 'moderator role is authorized by the server');
select pg_temp.assert_true(
  exists (select 1 from jsonb_array_elements(public.list_job_moderation_queue('open')) item
    where item ->> 'report_id' = (select report_id::text from job_report_test_context)),
  'requester-created case appears in the moderator queue');
select pg_temp.assert_true(
  public.get_job_moderation_report(report_id) ->> 'job_request_id' = request_id::text
    and public.get_job_moderation_report(report_id) ->> 'session_state' = 'cancelled'
    and public.get_job_moderation_report(report_id) ->> 'reporter_name' = 'QA Job Requester Updated'
    and jsonb_array_length(public.get_job_moderation_report(report_id) -> 'audit_history') = 1,
  'moderator receives the allowed context and history')
from job_report_test_context;
select pg_temp.assert_true(
  position('PRIVATE_FIXTURE_ADDRESS' in public.list_job_moderation_queue('all')::text) = 0
    and position('PRIVATE_FIXTURE_ADDRESS' in public.get_job_moderation_report(report_id)::text) = 0
    and not (public.get_job_moderation_report(report_id) ?| array[
      'exact_address_private', 'private_latitude', 'private_longitude', 'private_location_label', 'encrypted_location', 'photos', 'identity_evidence'
    ]),
  'review payloads exclude private location and evidence')
from job_report_test_context;
-- The valid call must enforce participant authorization even for a moderator.
select pg_temp.expect_state(
  'select s.* from job_report_test_context c cross join lateral public.get_job_safety_session(c.request_id) s', '42501');
select pg_temp.expect_state(
  'select exact_address_private from public.job_requests', '42501');
select pg_temp.expect_state('select * from public.job_safety_sessions', '42501');
select pg_temp.expect_state(
  'select public.get_job_moderation_report(unrelated_report_id) from job_report_test_context', 'P0002');
select pg_temp.expect_state(
  'select public.resolve_job_report(unrelated_report_id, ''no_violation'', null) from job_report_test_context', 'P0002');
select pg_temp.expect_state(
  'select public.resolve_job_report(report_id, ''block'', null) from job_report_test_context', '22023');
select pg_temp.expect_state(
  'select public.resolve_job_report(report_id, null, null) from job_report_test_context', '22023');
select pg_temp.expect_state(
  'select public.resolve_job_report(report_id, ''no_violation'', repeat(''x'', 501)) from job_report_test_context', '22023');
select pg_temp.expect_state('select public.list_job_moderation_queue(null)', '22023');

select pg_temp.assert_true(
  public.resolve_job_report(report_id, 'no_violation', 'PRIVATE_MODERATOR_NOTE') ->> 'already_resolved' = 'false',
  'authorized resolution persists once') from job_report_test_context;
select pg_temp.assert_true(
  public.resolve_job_report(report_id, 'insufficient_evidence', 'Changed duplicate note') ->> 'already_resolved' = 'true',
  'duplicate resolution is an idempotent no-op') from job_report_test_context;
select pg_temp.assert_true(
  public.get_job_moderation_report(report_id) ->> 'status' = 'resolved'
    and public.get_job_moderation_report(report_id) ->> 'review_notes' = 'PRIVATE_MODERATOR_NOTE'
    and jsonb_array_length(public.get_job_moderation_report(report_id) -> 'audit_history') = 2,
  'resolved detail retains the original notes and both audit events') from job_report_test_context;
select pg_temp.assert_true(
  not exists (select 1 from jsonb_array_elements(public.list_job_moderation_queue('open')) item
    where item ->> 'report_id' = (select report_id::text from job_report_test_context))
  and exists (select 1 from jsonb_array_elements(public.list_job_moderation_queue('resolved')) item
    where item ->> 'report_id' = (select report_id::text from job_report_test_context)),
  'resolution moves the report between queue filters');

reset role;
set local role authenticated;
set local request.jwt.claim.sub = '96000000-0000-4000-8000-000000000001';
select pg_temp.assert_true(
  public.get_requester_job_report(request_id) ->> 'status' = 'resolved'
    and public.get_requester_job_report(request_id) ->> 'outcome' = 'Review complete. No further action was taken.'
    and public.get_requester_job_report(request_id) ->> 'resolved_at' is not null
    and (select array_agg(k order by k) from jsonb_object_keys(public.get_requester_job_report(request_id)) k)
      = array['outcome', 'resolved_at', 'status', 'submitted_at']
    and position('PRIVATE_MODERATOR_NOTE' in public.get_requester_job_report(request_id)::text) = 0
    and position('QA Job Moderator' in public.get_requester_job_report(request_id)::text) = 0,
  'requester receives only the allowlisted persisted outcome') from job_report_test_context;
select pg_temp.expect_state(
  'select public.get_job_moderation_report(report_id) from job_report_test_context', '42501');
select pg_temp.expect_state(
  'select public.resolve_job_report(report_id, ''no_violation'', null) from job_report_test_context', '42501');

reset role;
select pg_temp.assert_true(
  (select count(*) = 1 from public.audit_events where action = 'job_report_resolved'
    and actor_id = '96000000-0000-4000-8000-000000000003' and created_at is not null
    and target_id = (select request_id from job_report_test_context)),
  'one resolution audit records the authorized actor and time');
select pg_temp.assert_true(
  (select status = 'resolved' and decision = 'approve' and decision_reason = 'no_violation'
    and resolved_by = '96000000-0000-4000-8000-000000000003' and resolved_at is not null
    from public.moderation_cases where report_id = (select report_id from job_report_test_context)),
  'case decision, actor and timestamp persist');
select pg_temp.assert_true(
  (select status = 'Reported' from public.job_requests where id = (select request_id from job_report_test_context))
    and (select state = 'cancelled' from public.job_safety_sessions where job_request_id = (select request_id from job_report_test_context)),
  'resolution does not reopen the job or safety session');
select pg_temp.assert_true(
  (select status = 'open' from public.reports where id = (select unrelated_report_id from job_report_test_context)),
  'out-of-scope report remains unchanged');

set local role anon;
select pg_temp.expect_state(
  'select public.submit_job_report(null, ''Anonymous fictional report'')', '42501');
select pg_temp.expect_state('select public.list_job_moderation_queue(''all'')', '42501');
select pg_temp.expect_state('select public.get_job_moderation_report(null)', '42501');
select pg_temp.expect_state('select public.resolve_job_report(null, ''no_violation'', null)', '42501');
reset role;

select 'job_report_review_passed' as result;
rollback;
