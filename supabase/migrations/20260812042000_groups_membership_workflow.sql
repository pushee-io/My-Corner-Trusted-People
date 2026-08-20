-- End-to-end Groups membership workflow.
-- Authenticated residents request only groups visible through existing location checks.
-- Moderator decisions are atomic, auditable, and never accept a non-pending request.

create table if not exists public.social_group_membership_events (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid not null references public.social_group_memberships(id) on delete cascade,
  group_id uuid not null references public.social_groups(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  actor_profile_id uuid not null references public.profiles(id) on delete restrict,
  event_type text not null check (event_type in ('requested', 're_requested', 'accepted', 'rejected')),
  created_at timestamptz not null default clock_timestamp()
);

create index if not exists social_group_membership_events_membership_created_idx
  on public.social_group_membership_events (membership_id, created_at desc);

alter table public.social_group_membership_events enable row level security;
alter table public.social_group_membership_events force row level security;

revoke all on public.social_group_membership_events from anon, authenticated;
grant select on public.social_group_membership_events to authenticated;

drop policy if exists "rls_social_group_membership_events_admin_read"
  on public.social_group_membership_events;

create policy "rls_social_group_membership_events_admin_read"
  on public.social_group_membership_events
  for select
  to authenticated
  using (public.is_admin_or_moderator());

create or replace function public.request_social_group_membership(target_group_id uuid)
returns table (
  group_id uuid,
  profile_id uuid,
  status public.social_group_membership_status,
  created boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_profile_id uuid;
  existing_membership public.social_group_memberships%rowtype;
begin
  actor_profile_id := public.current_profile_id();

  if actor_profile_id is null then
    raise exception 'authenticated profile required' using errcode = '42501';
  end if;

  if not public.can_view_social_group(target_group_id) then
    raise exception 'group is not available' using errcode = '42501';
  end if;

  select *
  into existing_membership
  from public.social_group_memberships membership
  where membership.group_id = target_group_id
    and membership.profile_id = actor_profile_id
  for update;

  if found and existing_membership.status in ('accepted', 'pending') then
    return query
    select target_group_id, actor_profile_id, existing_membership.status, false;
    return;
  end if;

  if found then
    update public.social_group_memberships
    set status = 'pending',
        role = 'member',
        joined_at = null,
        updated_at = now()
    where id = existing_membership.id;

    insert into public.social_group_membership_events (
      membership_id,
      group_id,
      profile_id,
      actor_profile_id,
      event_type
    )
    values (
      existing_membership.id,
      target_group_id,
      actor_profile_id,
      actor_profile_id,
      're_requested'
    );

    return query
    select target_group_id, actor_profile_id, 'pending'::public.social_group_membership_status, true;
    return;
  end if;

  insert into public.social_group_memberships (group_id, profile_id, role, status)
  values (target_group_id, actor_profile_id, 'member', 'pending')
  returning * into existing_membership;

  insert into public.social_group_membership_events (
    membership_id,
    group_id,
    profile_id,
    actor_profile_id,
    event_type
  )
  values (
    existing_membership.id,
    target_group_id,
    actor_profile_id,
    actor_profile_id,
    'requested'
  );

  return query
  select target_group_id, actor_profile_id, 'pending'::public.social_group_membership_status, true;
end;
$$;

create or replace function public.list_pending_social_group_memberships()
returns table (
  membership_id uuid,
  group_id uuid,
  group_name text,
  profile_id uuid,
  applicant_name text,
  status public.social_group_membership_status,
  requested_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin_or_moderator() then
    raise exception 'moderator access required' using errcode = '42501';
  end if;

  return query
  select
    membership.id,
    membership.group_id,
    social_group.name,
    membership.profile_id,
    profile.display_name,
    membership.status,
    membership.created_at
  from public.social_group_memberships membership
  join public.social_groups social_group on social_group.id = membership.group_id
  join public.profiles profile on profile.id = membership.profile_id
  where membership.status = 'pending'
  order by membership.created_at asc;
end;
$$;

create or replace function public.decide_social_group_membership(
  target_membership_id uuid,
  target_status public.social_group_membership_status
)
returns table (
  membership_id uuid,
  status public.social_group_membership_status,
  accepted boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_profile_id uuid;
  membership_record public.social_group_memberships%rowtype;
begin
  if not public.is_admin_or_moderator() then
    raise exception 'moderator access required' using errcode = '42501';
  end if;

  if target_status not in ('accepted', 'rejected') then
    raise exception 'invalid membership decision' using errcode = '22023';
  end if;

  actor_profile_id := public.current_profile_id();

  select *
  into membership_record
  from public.social_group_memberships membership
  where membership.id = target_membership_id
  for update;

  if not found then
    return;
  end if;

  if membership_record.status <> 'pending' then
    return query
    select membership_record.id, membership_record.status, false;
    return;
  end if;

  update public.social_group_memberships
  set status = target_status,
      joined_at = case when target_status = 'accepted' then now() else null end,
      updated_at = now()
  where id = membership_record.id;

  if target_status = 'accepted' then
    update public.social_groups
    set member_count = member_count + 1
    where id = membership_record.group_id;
  end if;

  insert into public.social_group_membership_events (
    membership_id,
    group_id,
    profile_id,
    actor_profile_id,
    event_type
  )
  values (
    membership_record.id,
    membership_record.group_id,
    membership_record.profile_id,
    actor_profile_id,
    target_status::text
  );

  return query
  select membership_record.id, target_status, true;
end;
$$;

-- Membership decisions must pass through the audited RPC above.
drop policy if exists "rls_social_group_memberships_admin_manage"
  on public.social_group_memberships;
revoke update on public.social_group_memberships from authenticated;

-- Applicants can read their own state; only moderators and administrators can inspect applications.
drop policy if exists "rls_social_group_memberships_own_or_group_read"
  on public.social_group_memberships;
drop policy if exists "rls_social_group_memberships_own_or_moderator_read"
  on public.social_group_memberships;

create policy "rls_social_group_memberships_own_or_moderator_read"
  on public.social_group_memberships
  for select
  to authenticated
  using (
    profile_id = public.current_profile_id()
    or public.is_admin_or_moderator()
  );

revoke all on function public.request_social_group_membership(uuid) from public, anon;
revoke all on function public.list_pending_social_group_memberships() from public, anon;
revoke all on function public.decide_social_group_membership(uuid, public.social_group_membership_status) from public, anon;

grant execute on function public.request_social_group_membership(uuid) to authenticated;
grant execute on function public.list_pending_social_group_memberships() to authenticated;
grant execute on function public.decide_social_group_membership(uuid, public.social_group_membership_status) to authenticated;

comment on table public.social_group_membership_events is
  'Append-only audit trail for group join requests and moderator membership decisions.';

comment on function public.request_social_group_membership(uuid) is
  'Creates or retries the signed-in profile membership request without accepting membership.';

comment on function public.decide_social_group_membership(uuid, public.social_group_membership_status) is
  'Allows moderators or administrators to accept or reject a pending membership atomically.';
