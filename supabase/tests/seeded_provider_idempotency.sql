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

create temporary table seed_counts_before as
select
  (select count(*) from public.profiles where seed_key is not null) as profiles,
  (select count(*) from public.provider_profiles where seed_key is not null) as providers,
  (
    select count(*)
    from public.provider_trust_signals signal
    join public.provider_profiles provider on provider.id = signal.provider_id
    where provider.seed_key is not null
  ) as trust_signals,
  (
    select count(*)
    from public.job_requests
    where title = 'Kitchen sink leak'
  ) as sample_requests;

\ir ../seed.sql

select pg_temp.assert_true(
  (select count(*) from public.profiles where seed_key is not null)
    = (select profiles from seed_counts_before),
  'running seed.sql twice must not duplicate fictional profiles'
);

select pg_temp.assert_true(
  (select count(*) from public.provider_profiles where seed_key is not null)
    = (select providers from seed_counts_before),
  'running seed.sql twice must not duplicate fictional provider profiles'
);

select pg_temp.assert_true(
  (
    select count(*)
    from public.provider_trust_signals signal
    join public.provider_profiles provider on provider.id = signal.provider_id
    where provider.seed_key is not null
  ) = (select trust_signals from seed_counts_before),
  'running seed.sql twice must not duplicate fictional provider trust signals'
);

select pg_temp.assert_true(
  (select count(*) from public.job_requests where title = 'Kitchen sink leak')
    = (select sample_requests from seed_counts_before),
  'running seed.sql twice must not duplicate the sample job request'
);

select pg_temp.assert_true(
  (
    select count(*)
    from public.provider_profiles
    where seed_key like 'pilot-provider-%'
      and accepting_requests
  ) = 12,
  'exactly 12 canonical fictional providers must remain discoverable'
);

select pg_temp.assert_true(
  not exists (
    select lower(btrim(business_name))
    from public.provider_profiles
    where accepting_requests
      and seed_key like 'pilot-provider-%'
    group by lower(btrim(business_name))
    having count(*) > 1
  ),
  'fictional providers must have one active listing per normalized business name'
);

select pg_temp.assert_true(
  not exists (
    select seed_key
    from public.provider_profiles
    where seed_key is not null
    group by seed_key
    having count(*) > 1
  ),
  'fictional provider seed keys must be unique'
);

select pg_temp.assert_true(
  not exists (
    select provider.id, signal.signal_type
    from public.provider_profiles provider
    join public.provider_trust_signals signal on signal.provider_id = provider.id
    where provider.seed_key is not null
    group by provider.id, signal.signal_type
    having count(*) > 1
  ),
  'fictional providers must have one trust signal per signal type'
);

select 'seeded_provider_idempotency_passed' as result;
