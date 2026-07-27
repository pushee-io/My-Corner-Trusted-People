-- Row Level Security hardening for Day 2B verified neighborhood access.
-- Client roles may read only what they are allowed to see.
-- Membership assignment, verification signals, and audit writes remain server-side only.

alter table neighborhoods enable row level security;
alter table neighborhood_memberships enable row level security;
alter table residence_verification_signals enable row level security;
alter table audit_events enable row level security;
alter table neighborhood_feed_posts enable row level security;

alter table neighborhoods force row level security;
alter table neighborhood_memberships force row level security;
alter table residence_verification_signals force row level security;
alter table audit_events force row level security;
alter table neighborhood_feed_posts force row level security;

revoke all on neighborhoods from anon, authenticated;
revoke all on neighborhood_memberships from anon, authenticated;
revoke all on residence_verification_signals from anon, authenticated;
revoke all on audit_events from anon, authenticated;
revoke all on neighborhood_feed_posts from anon, authenticated;

grant select on neighborhoods to authenticated;
grant select on neighborhood_memberships to authenticated;
grant select on residence_verification_signals to authenticated;
grant select on audit_events to authenticated;
grant select, insert on neighborhood_feed_posts to authenticated;

drop policy if exists "Authenticated users can read neighborhood list" on neighborhoods;
drop policy if exists "Users can read their own neighborhood membership" on neighborhood_memberships;
drop policy if exists "Users can read their own residence verification signals" on residence_verification_signals;
drop policy if exists "Users can read their own audit events" on audit_events;
drop policy if exists "Verified members can read their neighborhood feed" on neighborhood_feed_posts;
drop policy if exists "Verified members can create posts in their neighborhood feed" on neighborhood_feed_posts;

drop policy if exists "rls_neighborhoods_authenticated_read" on neighborhoods;
drop policy if exists "rls_memberships_owner_read" on neighborhood_memberships;
drop policy if exists "rls_residence_signals_owner_read" on residence_verification_signals;
drop policy if exists "rls_audit_events_subject_read" on audit_events;
drop policy if exists "rls_feed_verified_member_read" on neighborhood_feed_posts;
drop policy if exists "rls_feed_verified_member_insert" on neighborhood_feed_posts;

create policy "rls_neighborhoods_authenticated_read"
  on neighborhoods
  for select
  to authenticated
  using (true);

create policy "rls_memberships_owner_read"
  on neighborhood_memberships
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "rls_residence_signals_owner_read"
  on residence_verification_signals
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "rls_audit_events_subject_read"
  on audit_events
  for select
  to authenticated
  using (auth.uid() = subject_id);

create or replace function is_verified_neighborhood_member(target_neighborhood_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from neighborhood_memberships
    where user_id = auth.uid()
      and neighborhood_id = target_neighborhood_id
      and status = 'verified'
  );
$$;

revoke all on function is_verified_neighborhood_member(uuid) from public;
grant execute on function is_verified_neighborhood_member(uuid) to authenticated;

create policy "rls_feed_verified_member_read"
  on neighborhood_feed_posts
  for select
  to authenticated
  using (is_verified_neighborhood_member(neighborhood_id));

create policy "rls_feed_verified_member_insert"
  on neighborhood_feed_posts
  for insert
  to authenticated
  with check (
    auth.uid() = author_user_id
    and visibility = 'verified_neighborhood_members'
    and is_verified_neighborhood_member(neighborhood_id)
  );

comment on policy "rls_memberships_owner_read" on neighborhood_memberships is
  'Users may read only their own membership state. Client roles receive no insert, update, or delete policy.';

comment on policy "rls_residence_signals_owner_read" on residence_verification_signals is
  'Users may read only their own non-public verification signal records. Writes must happen through trusted server code.';

comment on policy "rls_feed_verified_member_read" on neighborhood_feed_posts is
  'Private feed read access requires a server-assigned verified neighborhood membership.';

comment on policy "rls_feed_verified_member_insert" on neighborhood_feed_posts is
  'Private feed write access requires the author to be the authenticated verified member for that neighborhood.';
