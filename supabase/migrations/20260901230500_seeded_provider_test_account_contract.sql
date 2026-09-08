do $migration$
declare
  provider_test_user_id uuid;
  previous_profile_id uuid;
  previous_profile_role text;
  target_profile_id uuid;
  target_auth_user_id uuid;
  target_profile_role text;
begin
  select auth_user.id
  into provider_test_user_id
  from auth.users auth_user
  where lower(auth_user.email) = 'provider.test@mycorner.example'
  order by auth_user.created_at, auth_user.id
  limit 1;

  select provider.profile_id
  into target_profile_id
  from public.provider_profiles provider
  join public.profiles profile on profile.id = provider.profile_id
  where provider.seed_key = 'pilot-provider-kwame-pipecare'
    and profile.seed_key = 'pilot-provider-kwame-pipecare'
  limit 1;

  if provider_test_user_id is null or target_profile_id is null then
    return;
  end if;

  -- Lock and inspect the destination before detaching any existing account.
  select profile.auth_user_id, profile.role::text
  into target_auth_user_id, target_profile_role
  from public.profiles profile
  where profile.id = target_profile_id
  for update;

  if (target_auth_user_id is not null and target_auth_user_id <> provider_test_user_id)
    or target_profile_role is distinct from 'provider' then
    raise warning 'Skipped fictional provider reconciliation: destination is occupied or is not a provider. Existing account links and roles were preserved.';
    return;
  end if;

  select profile.id, profile.role::text
  into previous_profile_id, previous_profile_role
  from public.profiles profile
  where profile.auth_user_id = provider_test_user_id
  limit 1
  for update;

  if previous_profile_id is not null and previous_profile_role is distinct from 'provider' then
    raise warning 'Skipped fictional provider reconciliation: current account is not a provider. Existing account links and roles were preserved.';
    return;
  end if;

  if previous_profile_id is not distinct from target_profile_id then
    return;
  end if;

  update public.profiles profile
  set auth_user_id = null
  where profile.auth_user_id = provider_test_user_id
    and profile.id <> target_profile_id;

  update public.profiles profile
  set
    auth_user_id = provider_test_user_id,
    display_name = 'Kwame PipeCare',
    role = 'provider'
  where profile.id = target_profile_id;

  insert into public.audit_events (action, target_table, target_id, metadata)
  values (
    'seeded_provider_test_account_relinked',
    'profiles',
    target_profile_id,
    jsonb_build_object(
      'previous_profile_id', previous_profile_id,
      'provider_seed_key', 'pilot-provider-kwame-pipecare',
      'reason', 'Aligned the fictional Preview provider account with the documented test provider.'
    )
  );
end
$migration$;
