-- Create a social group and its owner membership atomically.
-- Exact addresses and private contact data are not accepted or returned.

create or replace function public.create_social_group(
  target_name text,
  target_description text,
  target_visibility public.social_group_visibility default 'verified_neighborhood_members'
)
returns table (
  id uuid,
  name text,
  description text,
  neighborhood_id uuid,
  cluster_id uuid,
  visibility public.social_group_visibility,
  member_count integer,
  created_by_profile_id uuid,
  created_at timestamptz,
  moderation_status public.moderation_status
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_profile_id uuid;
  actor_neighborhood_id uuid;
  actor_cluster_id uuid;
  created_group public.social_groups%rowtype;
begin
  actor_profile_id := public.current_profile_id();
  if actor_profile_id is null then
    raise exception 'authenticated profile required' using errcode = '42501';
  end if;

  if char_length(trim(target_name)) not between 3 and 80 then
    raise exception 'group name must be between 3 and 80 characters' using errcode = '22023';
  end if;

  if char_length(trim(target_description)) not between 1 and 500 then
    raise exception 'group description must be between 1 and 500 characters' using errcode = '22023';
  end if;

  select membership.neighborhood_id, cluster_member.cluster_id
  into actor_neighborhood_id, actor_cluster_id
  from public.neighborhood_memberships membership
  left join public.neighborhood_cluster_members cluster_member
    on cluster_member.neighborhood_id = membership.neighborhood_id
  where membership.profile_id = actor_profile_id
    and membership.status = 'verified'
    and membership.verified_at is not null
    and membership.ended_at is null
    and (membership.verification_expires_at is null or membership.verification_expires_at > now())
  order by membership.is_primary desc, membership.verified_at desc
  limit 1;

  if actor_neighborhood_id is null then
    raise exception 'verified neighborhood membership required' using errcode = '42501';
  end if;

  if target_visibility = 'immediate_cluster_members' and actor_cluster_id is null then
    raise exception 'verified neighborhood cluster required' using errcode = '42501';
  end if;

  insert into public.social_groups (
    name,
    description,
    neighborhood_id,
    cluster_id,
    visibility,
    member_count,
    created_by_profile_id,
    moderation_status
  )
  values (
    trim(target_name),
    trim(target_description),
    actor_neighborhood_id,
    actor_cluster_id,
    target_visibility,
    1,
    actor_profile_id,
    'not_run'
  )
  returning * into created_group;

  insert into public.social_group_memberships (
    group_id,
    profile_id,
    role,
    status,
    joined_at
  )
  values (
    created_group.id,
    actor_profile_id,
    'owner',
    'accepted',
    now()
  );

  return query
  select
    created_group.id,
    created_group.name,
    created_group.description,
    created_group.neighborhood_id,
    created_group.cluster_id,
    created_group.visibility,
    created_group.member_count,
    created_group.created_by_profile_id,
    created_group.created_at,
    created_group.moderation_status;
end;
$$;

revoke all on function public.create_social_group(text, text, public.social_group_visibility) from public, anon;
grant execute on function public.create_social_group(text, text, public.social_group_visibility) to authenticated;

comment on function public.create_social_group(text, text, public.social_group_visibility) is
  'Creates a group for a verified resident and adds that resident as the accepted owner in one transaction.';
