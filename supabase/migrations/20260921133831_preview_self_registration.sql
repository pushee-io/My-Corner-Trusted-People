-- Provision only explicitly requested self-registration. No role or membership is accepted from user metadata.
create or replace function private.provision_self_registered_profile()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.raw_user_meta_data ->> 'my_corner_signup' = 'true' then
    insert into public.profiles (auth_user_id, display_name, role, phone_verified)
    values (new.id, coalesce(nullif(left(btrim(new.raw_user_meta_data ->> 'display_name'), 80), ''), 'New neighbor'), 'requester', false)
    on conflict (auth_user_id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function private.provision_self_registered_profile() from public, anon, authenticated;
create trigger my_corner_self_registered_profile after insert on auth.users
for each row execute function private.provision_self_registered_profile();

-- Self-registration must not let a client promote its own verification status.
create function private.protect_profile_phone_verification()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user in ('authenticated', 'anon') and new.phone_verified is distinct from old.phone_verified then
    raise exception 'phone verification is server controlled' using errcode = '42501';
  end if;
  return new;
end;
$$;
revoke all on function private.protect_profile_phone_verification() from public, anon, authenticated;
create trigger protect_profile_phone_verification before update on public.profiles
for each row execute function private.protect_profile_phone_verification();
