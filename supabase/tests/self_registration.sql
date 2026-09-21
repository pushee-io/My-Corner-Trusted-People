begin;
do $$
declare user_id uuid := gen_random_uuid(); created_profile_id uuid;
begin
  insert into auth.users (id, email, raw_user_meta_data) values
    (user_id, 'registration-fixture@mycorner.example', '{"my_corner_signup":true,"display_name":"Registration fixture","role":"admin","phone_verified":true}');
  select id into created_profile_id from public.profiles where auth_user_id=user_id and role='requester' and phone_verified=false;
  perform set_config('request.jwt.claim.sub',user_id::text,true);
  if created_profile_id is null then raise exception 'Self registration did not create an unverified requester'; end if;
  if exists(select 1 from public.neighborhood_memberships where profile_id=created_profile_id) then
    raise exception 'Self registration must not grant neighborhood membership';
  end if;
  if exists(select 1 from public.provider_profiles p where p.profile_id=created_profile_id) then
    raise exception 'Self registration must not grant provider access';
  end if;
  if has_function_privilege('authenticated', 'private.provision_self_registered_profile()', 'EXECUTE') then
    raise exception 'Clients must not invoke the trigger';
  end if;
end;
$$;
set local role authenticated;
do $$
begin
  begin
    update public.profiles set phone_verified=true where auth_user_id=auth.uid();
    raise exception 'Client changed its verification flag';
  exception when insufficient_privilege then null;
  end;
end;
$$;
reset role;
rollback;
