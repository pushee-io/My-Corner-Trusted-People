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

create temporary table provider_contract_counts_before as
select
  (select count(*) from public.job_requests) as job_requests,
  (select count(*) from public.provider_profiles) as provider_profiles,
  (select count(*) from public.audit_events
   where action = 'seeded_provider_test_account_relinked') as relink_audits;

insert into auth.users (id, email)
values
  ('44444444-4444-4444-8444-444444444444'::uuid, 'provider.test@mycorner.example'),
  ('55555555-5555-4555-8555-555555555555'::uuid, 'occupied-profile-test@example.com');

update public.profiles
set auth_user_id = null
where seed_key in ('pilot-provider-kwame-pipecare', 'pilot-provider-ama-spark-works');

update public.profiles
set auth_user_id = '44444444-4444-4444-8444-444444444444'::uuid, role = 'provider'
where seed_key = 'pilot-provider-ama-spark-works';

update public.profiles
set auth_user_id = '55555555-5555-4555-8555-555555555555'::uuid, role = 'moderator'
where seed_key = 'pilot-provider-kwame-pipecare';

\ir ../migrations/20260901230500_seeded_provider_test_account_contract.sql

select pg_temp.assert_true(
  exists (
    select 1 from public.profiles
    where seed_key = 'pilot-provider-kwame-pipecare'
      and auth_user_id = '55555555-5555-4555-8555-555555555555'::uuid
      and role = 'moderator'
  ) and exists (
    select 1 from public.profiles
    where seed_key = 'pilot-provider-ama-spark-works'
      and auth_user_id = '44444444-4444-4444-8444-444444444444'::uuid
      and role = 'provider'
  ),
  'an occupied moderator destination must preserve both account links and roles'
);

update public.profiles
set role = 'provider'
where seed_key = 'pilot-provider-kwame-pipecare';

\ir ../migrations/20260901230500_seeded_provider_test_account_contract.sql

select pg_temp.assert_true(
  exists (
    select 1 from public.profiles
    where seed_key = 'pilot-provider-kwame-pipecare'
      and auth_user_id = '55555555-5555-4555-8555-555555555555'::uuid
      and role = 'provider'
  ) and exists (
    select 1 from public.profiles
    where seed_key = 'pilot-provider-ama-spark-works'
      and auth_user_id = '44444444-4444-4444-8444-444444444444'::uuid
      and role = 'provider'
  ),
  'an occupied provider destination must also preserve both account links'
);

update public.profiles
set auth_user_id = null, role = 'moderator'
where seed_key = 'pilot-provider-kwame-pipecare';

\ir ../migrations/20260901230500_seeded_provider_test_account_contract.sql

select pg_temp.assert_true(
  exists (
    select 1 from public.profiles
    where seed_key = 'pilot-provider-kwame-pipecare'
      and auth_user_id is null and role = 'moderator'
  ) and exists (
    select 1 from public.profiles
    where seed_key = 'pilot-provider-ama-spark-works'
      and auth_user_id = '44444444-4444-4444-8444-444444444444'::uuid
  ),
  'an unlinked non-provider destination must not be assigned or downgraded'
);

update public.profiles
set role = 'provider'
where seed_key = 'pilot-provider-kwame-pipecare';

update public.profiles
set role = 'moderator'
where seed_key = 'pilot-provider-ama-spark-works';

\ir ../migrations/20260901230500_seeded_provider_test_account_contract.sql

select pg_temp.assert_true(
  exists (
    select 1 from public.profiles
    where seed_key = 'pilot-provider-ama-spark-works'
      and auth_user_id = '44444444-4444-4444-8444-444444444444'::uuid
      and role = 'moderator'
  ) and exists (
    select 1 from public.profiles
    where seed_key = 'pilot-provider-kwame-pipecare'
      and auth_user_id is null and role = 'provider'
  ),
  'reconciliation must not detach or downgrade an existing non-provider account'
);

select pg_temp.assert_true(
  (select count(*) from public.audit_events
   where action = 'seeded_provider_test_account_relinked')
    = (select relink_audits from provider_contract_counts_before),
  'skipped reconciliation must not record a successful account relink'
);

update public.profiles
set role = 'provider'
where seed_key = 'pilot-provider-ama-spark-works';

\ir ../migrations/20260901230500_seeded_provider_test_account_contract.sql

select pg_temp.assert_true(
  exists (
    select 1
    from auth.users auth_user
    join public.profiles profile on profile.auth_user_id = auth_user.id
    join public.provider_profiles provider on provider.profile_id = profile.id
    where lower(auth_user.email) = 'provider.test@mycorner.example'
      and profile.seed_key = 'pilot-provider-kwame-pipecare'
      and provider.seed_key = 'pilot-provider-kwame-pipecare'
      and provider.business_name = 'Kwame PipeCare'
      and provider.accepting_requests
  ),
  'the fictional Preview provider account must resolve to active Kwame PipeCare'
);

select pg_temp.assert_true(
  not exists (
    select 1
    from public.profiles profile
    where profile.seed_key = 'pilot-provider-ama-spark-works'
      and profile.auth_user_id = '44444444-4444-4444-8444-444444444444'::uuid
  ),
  'the previous fictional provider profile must no longer own the test account'
);

select pg_temp.assert_true(
  (select count(*) from public.job_requests)
    = (select job_requests from provider_contract_counts_before),
  'account reconciliation must not delete or reassign job requests'
);

select pg_temp.assert_true(
  (select count(*) from public.provider_profiles)
    = (select provider_profiles from provider_contract_counts_before),
  'account reconciliation must preserve every provider profile'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.audit_events
    where action = 'seeded_provider_test_account_relinked'
      and metadata ->> 'provider_seed_key' = 'pilot-provider-kwame-pipecare'
  ),
  'account reconciliation must leave an audit record'
);

\ir ../migrations/20260901230500_seeded_provider_test_account_contract.sql

select pg_temp.assert_true(
  (select count(*) from public.audit_events
   where action = 'seeded_provider_test_account_relinked')
    = (select relink_audits + 1 from provider_contract_counts_before),
  'safe reconciliation and repeated application must produce exactly one relink audit'
);

select 'seeded_provider_test_account_contract_passed' as result;

rollback;
