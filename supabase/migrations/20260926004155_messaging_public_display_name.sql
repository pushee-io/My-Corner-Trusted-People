begin;
-- Explicit public-name consent is independent of private legal-identity onboarding.
-- Never backfill profiles.display_name or legal_given_name/legal_family_name.
create table private.public_profile_names (
 profile_id uuid primary key references public.profiles(id) on delete cascade,
 display_name text not null check (char_length(btrim(display_name)) between 2 and 80 and display_name !~ '[[:cntrl:]]'),
 approved_by_profile_at timestamptz not null default now()
);
alter table private.public_profile_names enable row level security;
revoke all on private.public_profile_names from public,anon,authenticated;

create or replace function private.neighbor_name(profile uuid) returns text
language sql stable security definer set search_path='' as $$
 select coalesce(
  (select nullif(btrim(display_name),'') from private.public_profile_names where profile_id=profile),
  (select nullif(btrim(public_display_name),'') from public.private_identity_profiles where profile_id=profile),
  'Neighbor')
$$;
revoke all on function private.neighbor_name(uuid) from public,anon,authenticated;

create function private.own_public_name(new_name text default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.current_profile_id(); clean text:=btrim(new_name);
begin
 if auth.uid() is null or not private.community_account_active(actor) then
  raise exception 'Sign in with an active account.' using errcode='42501'; end if;
 if new_name is not null then
  if char_length(clean) not between 2 and 80 or clean ~ '[[:cntrl:]]' then
   raise exception 'Use a public display name of 2–80 characters.' using errcode='22023'; end if;
  insert into private.public_profile_names(profile_id,display_name) values(actor,clean)
  on conflict(profile_id) do update set display_name=excluded.display_name,approved_by_profile_at=now();
 end if;
 return jsonb_build_object('name',nullif(private.neighbor_name(actor),'Neighbor'));
end $$;
revoke all on function private.own_public_name(text) from public,anon;
grant execute on function private.own_public_name(text) to authenticated;
create function public.own_public_name(new_name text default null) returns jsonb
language sql security invoker set search_path='' as $$ select private.own_public_name(new_name) $$;
revoke all on function public.own_public_name(text) from public,anon;
grant execute on function public.own_public_name(text) to authenticated;
commit;
