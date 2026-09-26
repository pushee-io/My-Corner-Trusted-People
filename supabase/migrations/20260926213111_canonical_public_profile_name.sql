-- Resolve existing public identities without copying or changing any identity data.
-- profiles.display_name is the legacy PUBLIC profile name: the day2b
-- public_community_profiles view and Events organizer/comment projections use it.
-- Legal identity lives in private_identity_profiles. Never select its legal fields.
begin;
create or replace function private.neighbor_name(profile uuid) returns text
language sql stable security definer set search_path='' as $$
 select case when not private.community_account_active(profile) then 'Neighbor unavailable'
 else coalesce(
  -- Explicit user edits override older public projections everywhere using this resolver.
  (select nullif(btrim(display_name),'') from private.public_profile_names where profile_id=profile),
  (select nullif(btrim(public_display_name),'') from public.private_identity_profiles where profile_id=profile),
  -- An identity record with a blank public name is not consent to use an older name.
  (select nullif(btrim(p.display_name),'') from public.profiles p where p.id=profile
   and lower(btrim(p.display_name)) not in ('new neighbor','neighbor')
   and not exists(select 1 from public.private_identity_profiles i where i.profile_id=p.id)),
  'Neighbor') end
$$;
-- Only already-authorized messaging/self-profile RPCs may call this helper.
revoke all on function private.neighbor_name(uuid) from public,anon,authenticated;
commit;
