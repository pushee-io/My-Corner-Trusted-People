-- Day 3: social groups and agency broadcasts.
-- Visibility mirrors the mobile repository slice:
-- - Verified-neighborhood groups stay inside the viewer's verified neighborhood.
-- - Immediate-cluster groups require a verified membership in one neighborhood in that cluster.
-- - Group posts require accepted group membership.
-- - Greater Accra broadcasts require agency approval and matching regional eligibility.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'social_group_visibility') then
    create type public.social_group_visibility as enum (
      'verified_neighborhood_members',
      'immediate_cluster_members'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'social_group_membership_role') then
    create type public.social_group_membership_role as enum (
      'member',
      'moderator',
      'owner'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'social_group_membership_status') then
    create type public.social_group_membership_status as enum (
      'pending',
      'accepted',
      'rejected',
      'removed'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'agency_broadcast_scope') then
    create type public.agency_broadcast_scope as enum (
      'neighborhood',
      'immediate_cluster',
      'greater_accra'
    );
  end if;
end
$$;

create table if not exists public.social_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  neighborhood_id uuid not null references public.neighborhoods(id) on delete cascade,
  cluster_id uuid references public.neighborhood_clusters(id) on delete set null,
  visibility public.social_group_visibility not null default 'verified_neighborhood_members',
  member_count int not null default 0 check (member_count >= 0),
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  moderation_status public.moderation_status not null default 'not_run',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(name) between 3 and 80),
  check (char_length(description) between 1 and 500),
  check (
    visibility = 'verified_neighborhood_members'
    or cluster_id is not null
  )
);

create table if not exists public.social_group_memberships (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.social_groups(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.social_group_membership_role not null default 'member',
  status public.social_group_membership_status not null default 'pending',
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, profile_id)
);

create table if not exists public.social_group_posts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.social_groups(id) on delete cascade,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  moderation_status public.moderation_status not null default 'not_run',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(body) between 1 and 2000)
);

create table if not exists public.agency_broadcasts (
  id uuid primary key default gen_random_uuid(),
  agency_name text not null,
  title text not null,
  body text not null,
  scope public.agency_broadcast_scope not null,
  neighborhood_id uuid references public.neighborhoods(id) on delete cascade,
  cluster_id uuid references public.neighborhood_clusters(id) on delete cascade,
  region_id text not null default 'greater-accra',
  is_agency_approved boolean not null default false,
  moderation_status public.moderation_status not null default 'not_run',
  published_at timestamptz not null default now(),
  expires_at timestamptz,
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  approved_by_profile_id uuid references public.profiles(id) on delete set null,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(agency_name) between 2 and 120),
  check (char_length(title) between 3 and 140),
  check (char_length(body) between 1 and 4000),
  check (expires_at is null or expires_at > published_at),
  check (
    (scope = 'greater_accra' and region_id = 'greater-accra')
    or (scope = 'immediate_cluster' and cluster_id is not null)
    or (scope = 'neighborhood' and neighborhood_id is not null)
  )
);

create index if not exists social_groups_neighborhood_visibility_idx
  on public.social_groups (neighborhood_id, visibility, moderation_status, created_at desc);

create index if not exists social_groups_cluster_visibility_idx
  on public.social_groups (cluster_id, visibility, moderation_status, created_at desc);

create index if not exists social_group_memberships_profile_status_idx
  on public.social_group_memberships (profile_id, status);

create index if not exists social_group_memberships_group_profile_idx
  on public.social_group_memberships (group_id, profile_id, status);

create index if not exists social_group_posts_group_created_idx
  on public.social_group_posts (group_id, moderation_status, created_at desc);

create index if not exists agency_broadcasts_scope_visibility_idx
  on public.agency_broadcasts (scope, region_id, cluster_id, neighborhood_id, is_agency_approved, moderation_status, published_at desc);

drop trigger if exists set_social_groups_updated_at on public.social_groups;
create trigger set_social_groups_updated_at
before update on public.social_groups
for each row
execute function public.set_updated_at();

drop trigger if exists set_social_group_memberships_updated_at on public.social_group_memberships;
create trigger set_social_group_memberships_updated_at
before update on public.social_group_memberships
for each row
execute function public.set_updated_at();

drop trigger if exists set_social_group_posts_updated_at on public.social_group_posts;
create trigger set_social_group_posts_updated_at
before update on public.social_group_posts
for each row
execute function public.set_updated_at();

drop trigger if exists set_agency_broadcasts_updated_at on public.agency_broadcasts;
create trigger set_agency_broadcasts_updated_at
before update on public.agency_broadcasts
for each row
execute function public.set_updated_at();

create or replace function public.has_verified_cluster_membership(target_cluster_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.neighborhood_memberships nm
    join public.neighborhood_cluster_members ncm
      on ncm.neighborhood_id = nm.neighborhood_id
    join public.profiles p
      on p.id = nm.profile_id
    where p.auth_user_id = auth.uid()
      and ncm.cluster_id = target_cluster_id
      and nm.status = 'verified'
      and nm.verified_at is not null
      and nm.ended_at is null
      and (nm.verification_expires_at is null or nm.verification_expires_at > now())
  )
$$;

create or replace function public.can_view_social_group(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.social_groups sg
    where sg.id = target_group_id
      and sg.moderation_status <> 'blocked'
      and (
        (
          sg.visibility = 'verified_neighborhood_members'
          and public.has_verified_neighborhood_membership(sg.neighborhood_id)
        )
        or (
          sg.visibility = 'immediate_cluster_members'
          and sg.cluster_id is not null
          and public.has_verified_cluster_membership(sg.cluster_id)
        )
      )
  )
$$;

create or replace function public.is_accepted_social_group_member(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.social_group_memberships sgm
    join public.profiles p
      on p.id = sgm.profile_id
    where p.auth_user_id = auth.uid()
      and sgm.group_id = target_group_id
      and sgm.status = 'accepted'
  )
$$;

create or replace function public.can_view_agency_broadcast(target_broadcast_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.agency_broadcasts ab
    where ab.id = target_broadcast_id
      and ab.is_agency_approved = true
      and ab.moderation_status <> 'blocked'
      and (ab.expires_at is null or ab.expires_at > now())
      and (
        (
          ab.scope = 'greater_accra'
          and ab.region_id = 'greater-accra'
          and exists (
            select 1
            from public.neighborhood_memberships nm
            join public.neighborhoods n on n.id = nm.neighborhood_id
            join public.profiles p on p.id = nm.profile_id
            where p.auth_user_id = auth.uid()
              and nm.status = 'verified'
              and nm.verified_at is not null
              and nm.ended_at is null
              and (nm.verification_expires_at is null or nm.verification_expires_at > now())
              and coalesce(n.region, 'Greater Accra') = 'Greater Accra'
          )
        )
        or (
          ab.scope = 'immediate_cluster'
          and ab.cluster_id is not null
          and public.has_verified_cluster_membership(ab.cluster_id)
        )
        or (
          ab.scope = 'neighborhood'
          and ab.neighborhood_id is not null
          and public.has_verified_neighborhood_membership(ab.neighborhood_id)
        )
      )
  )
$$;

revoke all on function public.has_verified_cluster_membership(uuid) from public;
revoke all on function public.can_view_social_group(uuid) from public;
revoke all on function public.is_accepted_social_group_member(uuid) from public;
revoke all on function public.can_view_agency_broadcast(uuid) from public;

grant execute on function public.has_verified_cluster_membership(uuid) to authenticated;
grant execute on function public.can_view_social_group(uuid) to authenticated;
grant execute on function public.is_accepted_social_group_member(uuid) to authenticated;
grant execute on function public.can_view_agency_broadcast(uuid) to authenticated;

alter table public.social_groups enable row level security;
alter table public.social_group_memberships enable row level security;
alter table public.social_group_posts enable row level security;
alter table public.agency_broadcasts enable row level security;

alter table public.social_groups force row level security;
alter table public.social_group_memberships force row level security;
alter table public.social_group_posts force row level security;
alter table public.agency_broadcasts force row level security;

revoke all on public.social_groups from anon, authenticated;
revoke all on public.social_group_memberships from anon, authenticated;
revoke all on public.social_group_posts from anon, authenticated;
revoke all on public.agency_broadcasts from anon, authenticated;

grant select, insert, update on public.social_groups to authenticated;
grant select, insert, update on public.social_group_memberships to authenticated;
grant select, insert, update on public.social_group_posts to authenticated;
grant select, insert, update on public.agency_broadcasts to authenticated;

drop policy if exists "rls_social_groups_visible_read" on public.social_groups;
drop policy if exists "rls_social_groups_verified_member_insert" on public.social_groups;
drop policy if exists "rls_social_groups_admin_manage" on public.social_groups;
drop policy if exists "rls_social_group_memberships_own_or_group_read" on public.social_group_memberships;
drop policy if exists "rls_social_group_memberships_request_join" on public.social_group_memberships;
drop policy if exists "rls_social_group_memberships_admin_manage" on public.social_group_memberships;
drop policy if exists "rls_social_group_posts_member_read" on public.social_group_posts;
drop policy if exists "rls_social_group_posts_member_insert" on public.social_group_posts;
drop policy if exists "rls_social_group_posts_admin_manage" on public.social_group_posts;
drop policy if exists "rls_agency_broadcasts_visible_read" on public.agency_broadcasts;
drop policy if exists "rls_agency_broadcasts_admin_insert" on public.agency_broadcasts;
drop policy if exists "rls_agency_broadcasts_admin_update" on public.agency_broadcasts;

create policy "rls_social_groups_visible_read"
  on public.social_groups
  for select
  to authenticated
  using (public.can_view_social_group(id) or public.is_admin_or_moderator());

create policy "rls_social_groups_verified_member_insert"
  on public.social_groups
  for insert
  to authenticated
  with check (
    created_by_profile_id = public.current_profile_id()
    and moderation_status <> 'blocked'
    and (
      (
        visibility = 'verified_neighborhood_members'
        and public.has_verified_neighborhood_membership(neighborhood_id)
      )
      or (
        visibility = 'immediate_cluster_members'
        and cluster_id is not null
        and public.has_verified_cluster_membership(cluster_id)
      )
    )
  );

create policy "rls_social_groups_admin_manage"
  on public.social_groups
  for update
  to authenticated
  using (public.is_admin_or_moderator())
  with check (public.is_admin_or_moderator());

create policy "rls_social_group_memberships_own_or_group_read"
  on public.social_group_memberships
  for select
  to authenticated
  using (
    profile_id = public.current_profile_id()
    or public.is_accepted_social_group_member(group_id)
    or public.is_admin_or_moderator()
  );

create policy "rls_social_group_memberships_request_join"
  on public.social_group_memberships
  for insert
  to authenticated
  with check (
    profile_id = public.current_profile_id()
    and role = 'member'
    and status = 'pending'
    and public.can_view_social_group(group_id)
  );

create policy "rls_social_group_memberships_admin_manage"
  on public.social_group_memberships
  for update
  to authenticated
  using (public.is_admin_or_moderator())
  with check (public.is_admin_or_moderator());

create policy "rls_social_group_posts_member_read"
  on public.social_group_posts
  for select
  to authenticated
  using (
    moderation_status <> 'blocked'
    and public.can_view_social_group(group_id)
    and public.is_accepted_social_group_member(group_id)
  );

create policy "rls_social_group_posts_member_insert"
  on public.social_group_posts
  for insert
  to authenticated
  with check (
    author_profile_id = public.current_profile_id()
    and moderation_status in ('not_run', 'clean')
    and public.can_view_social_group(group_id)
    and public.is_accepted_social_group_member(group_id)
  );

create policy "rls_social_group_posts_admin_manage"
  on public.social_group_posts
  for update
  to authenticated
  using (public.is_admin_or_moderator())
  with check (public.is_admin_or_moderator());

create policy "rls_agency_broadcasts_visible_read"
  on public.agency_broadcasts
  for select
  to authenticated
  using (public.can_view_agency_broadcast(id) or public.is_admin_or_moderator());

create policy "rls_agency_broadcasts_admin_insert"
  on public.agency_broadcasts
  for insert
  to authenticated
  with check (
    public.is_admin_or_moderator()
    and created_by_profile_id = public.current_profile_id()
    and (
      is_agency_approved = false
      or approved_by_profile_id = public.current_profile_id()
    )
  );

create policy "rls_agency_broadcasts_admin_update"
  on public.agency_broadcasts
  for update
  to authenticated
  using (public.is_admin_or_moderator())
  with check (public.is_admin_or_moderator());

comment on table public.social_groups is
  'Day 3 local social groups. RLS limits visibility to verified neighborhood or immediate-cluster members.';

comment on table public.social_group_memberships is
  'Social group membership. Users may request pending membership; accepted status must be assigned by trusted moderation/admin workflows.';

comment on table public.social_group_posts is
  'Posts inside social groups. RLS requires visible group access and accepted membership; blocked posts are hidden.';

comment on table public.agency_broadcasts is
  'Approved agency notices for neighborhood, immediate-cluster, or Greater Accra feeds. Ordinary private posts are never promoted here.';

comment on policy "rls_social_groups_visible_read" on public.social_groups is
  'Verified-neighborhood groups stay inside that neighborhood; immediate-cluster groups require verified membership in the cluster.';

comment on policy "rls_social_group_posts_member_read" on public.social_group_posts is
  'Group posts require both group visibility and accepted group membership.';

comment on policy "rls_agency_broadcasts_visible_read" on public.agency_broadcasts is
  'Agency broadcasts require approval, non-blocked moderation status, non-expiry, and matching viewer area.';
