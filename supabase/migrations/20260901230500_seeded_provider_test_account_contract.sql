do $migration$
declare
  provider_test_user_id uuid;
  previous_profile_id uuid;
  target_profile_id uuid;
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

  select profile.id
  into previous_profile_id
  from public.profiles profile
  where profile.auth_user_id = provider_test_user_id
  limit 1;

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
