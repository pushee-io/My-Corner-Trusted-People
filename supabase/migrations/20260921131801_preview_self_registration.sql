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
