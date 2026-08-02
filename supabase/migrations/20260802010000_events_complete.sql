begin;

do $$ begin create type public.event_status as enum ('draft', 'scheduled', 'cancelled', 'completed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.event_visibility as enum ('verified_neighborhood_members', 'immediate_cluster_members'); exception when duplicate_object then null; end $$;
do $$ begin create type public.event_moderation_status as enum ('pending', 'approved', 'blocked', 'removed'); exception when duplicate_object then null; end $$;
do $$ begin create type public.event_rsvp_status as enum ('going', 'cancelled'); exception when duplicate_object then null; end $$;
do $$ begin create type public.event_interest_status as enum ('interested', 'not_going', 'waitlisted'); exception when duplicate_object then null; end $$;
do $$ begin create type public.event_organizer_role as enum ('owner', 'co_organizer'); exception when duplicate_object then null; end $$;
do $$ begin create type public.event_invite_status as enum ('pending', 'accepted', 'declined', 'revoked'); exception when duplicate_object then null; end $$;
do $$ begin create type public.event_location_type as enum ('in_person', 'virtual', 'hybrid'); exception when duplicate_object then null; end $$;

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  neighborhood_id uuid not null references public.neighborhoods(id) on delete restrict,
  cluster_id uuid not null references public.neighborhood_clusters(id) on delete restrict,
  organizer_profile_id uuid not null references public.profiles(id) on delete restrict,
  organizer_display_name text not null,
  title text not null check (char_length(btrim(title)) between 3 and 120),
  description text not null check (char_length(btrim(description)) between 10 and 4000),
  cover_image_path text,
  starts_at timestamptz not null,
  ends_at timestamptz check (ends_at is null or ends_at > starts_at),
  timezone text not null default 'Africa/Accra',
  location_type public.event_location_type not null default 'in_person',
  venue_name text,
  area_label text not null,
  public_meetup_point text,
  visibility public.event_visibility not null,
  status public.event_status not null default 'draft',
  moderation_status public.event_moderation_status not null default 'pending',
  capacity integer check (capacity is null or capacity > 0),
  attendee_count integer not null default 0 check (attendee_count >= 0),
  comments_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_private_access (
  event_id uuid primary key references public.events(id) on delete cascade,
  precise_address text,
  virtual_link text,
  reveal_to_confirmed_attendees boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.event_organizers (
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role public.event_organizer_role not null,
  created_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);
create unique index if not exists event_single_owner on public.event_organizers(event_id) where role = 'owner';

create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  attendee_display_name text not null,
  status public.event_rsvp_status not null default 'going',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, profile_id)
);

create table if not exists public.event_interests (
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  status public.event_interest_status not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (event_id, profile_id)
);

create table if not exists public.event_invitations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  inviter_profile_id uuid not null references public.profiles(id) on delete cascade,
  invitee_profile_id uuid not null references public.profiles(id) on delete cascade,
  status public.event_invite_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists event_one_pending_invite on public.event_invitations(event_id, invitee_profile_id) where status = 'pending';

create table if not exists public.event_comments (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  author_display_name text not null,
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  moderation_status public.event_moderation_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.event_reports (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  reporter_profile_id uuid not null references public.profiles(id) on delete cascade,
  reason text not null check (char_length(btrim(reason)) between 3 and 1000),
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  created_at timestamptz not null default now(),
  unique (event_id, reporter_profile_id)
);

create table if not exists public.event_reminders (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  remind_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (event_id, profile_id)
);

create table if not exists public.domain_event_outbox (
  id uuid primary key default gen_random_uuid(),
  aggregate_type text not null,
  aggregate_id uuid not null,
  recipient_profile_id uuid references public.profiles(id) on delete cascade,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.event_audit_events (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists events_audience_schedule_idx on public.events(neighborhood_id, cluster_id, starts_at) where status = 'scheduled' and moderation_status = 'approved';
create index if not exists event_rsvps_active_idx on public.event_rsvps(event_id) where status = 'going';
create index if not exists event_outbox_pending_idx on public.domain_event_outbox(available_at) where processed_at is null;

create or replace function public.prepare_event_insert()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.organizer_profile_id := public.current_profile_id();
  if new.organizer_profile_id is null then raise exception 'authentication required' using errcode = '42501'; end if;
  select p.display_name into new.organizer_display_name from public.profiles p where p.id = new.organizer_profile_id;
  select ncm.cluster_id
  into new.cluster_id
  from public.neighborhood_cluster_members ncm
  where ncm.neighborhood_id = new.neighborhood_id
  order by ncm.created_at asc
  limit 1;
  if new.cluster_id is null then raise exception 'event neighborhood is not assigned to a cluster' using errcode = '23514'; end if;
  new.status := 'draft'; new.moderation_status := 'pending'; new.attendee_count := 0;
  return new;
end $$;

drop trigger if exists events_prepare_insert on public.events;
create trigger events_prepare_insert before insert on public.events for each row execute function public.prepare_event_insert();

create or replace function public.can_view_event(target_event_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.events e
    where e.id = target_event_id
      and e.moderation_status = 'approved'
      and e.status in ('scheduled', 'completed')
      and (
        public.is_admin_or_moderator()
        or exists (
          select 1
          from public.neighborhood_memberships nm
          left join public.neighborhood_cluster_members viewer_cluster
            on viewer_cluster.neighborhood_id = nm.neighborhood_id
          where nm.profile_id = public.current_profile_id()
            and nm.status = 'verified' and nm.ended_at is null
            and (nm.verification_expires_at is null or nm.verification_expires_at > now())
            and (
              (e.visibility = 'verified_neighborhood_members' and nm.neighborhood_id = e.neighborhood_id)
              or (e.visibility = 'immediate_cluster_members' and viewer_cluster.cluster_id = e.cluster_id)
            )
        )
        or exists (select 1 from public.event_organizers eo where eo.event_id = e.id and eo.profile_id = public.current_profile_id())
      )
  )
$$;

create or replace function public.can_manage_event(target_event_id uuid, required_permission text default 'edit_event')
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin_or_moderator() or exists (
    select 1 from public.event_organizers eo
    where eo.event_id = target_event_id and eo.profile_id = public.current_profile_id()
      and (eo.role = 'owner' or required_permission in ('edit_event', 'manage_attendees'))
  )
$$;

create or replace function public.rsvp_to_event(target_event_id uuid)
returns text language plpgsql security definer set search_path = public as $$
declare caller_profile uuid := public.current_profile_id(); target public.events; display_name text;
begin
  if caller_profile is null or not public.can_view_event(target_event_id) then raise exception 'event unavailable' using errcode = '42501'; end if;
  select * into target from public.events where id = target_event_id for update;
  select p.display_name into display_name from public.profiles p where p.id = caller_profile;
  if target.capacity is not null and (select count(*) from public.event_rsvps where event_id = target_event_id and status = 'going') >= target.capacity then
    insert into public.event_interests(event_id, profile_id, status) values (target_event_id, caller_profile, 'waitlisted')
      on conflict (event_id, profile_id) do update set status = 'waitlisted', updated_at = now();
    return 'waitlisted';
  end if;
  insert into public.event_rsvps(event_id, profile_id, attendee_display_name, status) values (target_event_id, caller_profile, display_name, 'going')
    on conflict (event_id, profile_id) do update set status = 'going', attendee_display_name = excluded.attendee_display_name, updated_at = now();
  delete from public.event_interests where event_id = target_event_id and profile_id = caller_profile;
  update public.events set attendee_count = (select count(*) from public.event_rsvps where event_id = target_event_id and status = 'going'), updated_at = now() where id = target_event_id;
  return 'going';
end $$;

create or replace function public.cancel_event_rsvp(target_event_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.event_rsvps set status = 'cancelled', updated_at = now() where event_id = target_event_id and profile_id = public.current_profile_id();
  delete from public.event_interests where event_id = target_event_id and profile_id = public.current_profile_id();
  update public.events set attendee_count = (select count(*) from public.event_rsvps where event_id = target_event_id and status = 'going'), updated_at = now() where id = target_event_id;
end $$;

create or replace function public.cancel_managed_event(target_event_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.can_manage_event(target_event_id, 'cancel_event') then raise exception 'not authorized' using errcode = '42501'; end if;
  update public.events set status = 'cancelled', updated_at = now() where id = target_event_id and status <> 'cancelled';
end $$;

create or replace function public.get_event_private_access(target_event_id uuid)
returns table(precise_address text, virtual_link text) language plpgsql security definer set search_path = public as $$
begin
  if public.can_manage_event(target_event_id, 'edit_event') or exists (
    select 1 from public.event_private_access pa
    join public.event_rsvps r on r.event_id = pa.event_id
    where pa.event_id = target_event_id and pa.reveal_to_confirmed_attendees
      and r.profile_id = public.current_profile_id() and r.status = 'going'
  ) then
    insert into public.event_audit_events(event_id, actor_profile_id, action)
    values (target_event_id, public.current_profile_id(), 'private_location_accessed');
    return query select pa.precise_address, pa.virtual_link from public.event_private_access pa where pa.event_id = target_event_id;
  end if;
end
$$;

create or replace function public.set_event_private_access(
  target_event_id uuid,
  new_precise_address text,
  new_virtual_link text,
  allow_confirmed_attendees boolean
)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.can_manage_event(target_event_id, 'edit_event') then raise exception 'not authorized' using errcode = '42501'; end if;
  insert into public.event_private_access(event_id, precise_address, virtual_link, reveal_to_confirmed_attendees)
  values (target_event_id, nullif(btrim(new_precise_address), ''), nullif(btrim(new_virtual_link), ''), allow_confirmed_attendees)
  on conflict (event_id) do update set precise_address = excluded.precise_address, virtual_link = excluded.virtual_link,
    reveal_to_confirmed_attendees = excluded.reveal_to_confirmed_attendees, updated_at = now();
end $$;

create or replace function public.prepare_event_comment()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.author_profile_id := public.current_profile_id();
  select p.display_name into new.author_display_name from public.profiles p where p.id = new.author_profile_id;
  new.moderation_status := 'pending';
  return new;
end $$;

drop trigger if exists event_comments_prepare on public.event_comments;
create trigger event_comments_prepare before insert on public.event_comments for each row execute function public.prepare_event_comment();

create or replace function public.prepare_event_invitation()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  caller_profile uuid := public.current_profile_id();
  target_event public.events;
  recent_invitation_count integer;
begin
  if caller_profile is null or not public.can_manage_event(new.event_id, 'manage_attendees') then
    raise exception 'not authorized to invite event attendees' using errcode = '42501';
  end if;
  if new.invitee_profile_id = caller_profile then
    raise exception 'organizers cannot invite themselves' using errcode = '23514';
  end if;

  select * into target_event from public.events where id = new.event_id;
  if not found then raise exception 'event not found' using errcode = '23503'; end if;

  if not exists (
    select 1
    from public.neighborhood_memberships nm
    left join public.neighborhood_cluster_members invitee_cluster
      on invitee_cluster.neighborhood_id = nm.neighborhood_id
    where nm.profile_id = new.invitee_profile_id
      and nm.status = 'verified'
      and nm.ended_at is null
      and (nm.verification_expires_at is null or nm.verification_expires_at > now())
      and (
        (target_event.visibility = 'verified_neighborhood_members' and nm.neighborhood_id = target_event.neighborhood_id)
        or (target_event.visibility = 'immediate_cluster_members' and invitee_cluster.cluster_id = target_event.cluster_id)
      )
  ) then
    raise exception 'invitee is outside the event audience' using errcode = '42501';
  end if;

  select count(*) into recent_invitation_count
  from public.event_invitations invitation
  where invitation.inviter_profile_id = caller_profile
    and invitation.created_at > now() - interval '1 hour';
  if recent_invitation_count >= 20 then
    raise exception 'event invitation rate limit exceeded' using errcode = 'P0001';
  end if;

  new.inviter_profile_id := caller_profile;
  new.status := 'pending';
  return new;
end $$;

drop trigger if exists event_invitations_prepare on public.event_invitations;
create trigger event_invitations_prepare before insert on public.event_invitations for each row execute function public.prepare_event_invitation();

create or replace function public.queue_event_side_effect()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_table_name = 'event_invitations' then
    insert into public.domain_event_outbox(aggregate_type, aggregate_id, recipient_profile_id, event_type, payload)
    values ('event', new.event_id, new.invitee_profile_id, 'event_invitation', jsonb_build_object('eventId', new.event_id, 'invitationId', new.id));
  elsif tg_table_name = 'event_reminders' then
    insert into public.domain_event_outbox(aggregate_type, aggregate_id, recipient_profile_id, event_type, payload, available_at)
    values ('event', new.event_id, new.profile_id, 'event_reminder', jsonb_build_object('eventId', new.event_id), new.remind_at);
  end if;
  return new;
end $$;

drop trigger if exists event_invitations_outbox on public.event_invitations;
create trigger event_invitations_outbox after insert on public.event_invitations for each row execute function public.queue_event_side_effect();
drop trigger if exists event_reminders_outbox on public.event_reminders;
create trigger event_reminders_outbox after insert on public.event_reminders for each row execute function public.queue_event_side_effect();

create or replace function public.audit_event_change()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    insert into public.event_organizers(event_id, profile_id, role)
    values (new.id, new.organizer_profile_id, 'owner')
    on conflict (event_id, profile_id) do nothing;
  end if;
  insert into public.event_audit_events(event_id, actor_profile_id, action, metadata)
  values (new.id, public.current_profile_id(), case when tg_op = 'INSERT' then 'event_created' else 'event_updated' end, jsonb_build_object('status', new.status));
  if tg_op = 'UPDATE' and (new.title, new.description, new.starts_at, new.ends_at, new.status) is distinct from (old.title, old.description, old.starts_at, old.ends_at, old.status) then
    insert into public.domain_event_outbox(aggregate_type, aggregate_id, recipient_profile_id, event_type, payload)
    select 'event', new.id, r.profile_id, case when new.status = 'cancelled' then 'event_cancelled' else 'event_updated' end, jsonb_build_object('eventId', new.id)
    from public.event_rsvps r where r.event_id = new.id and r.status = 'going';
  end if;
  return new;
end $$;

drop trigger if exists events_audit_change on public.events;
create trigger events_audit_change after insert or update on public.events for each row execute function public.audit_event_change();

alter table public.events enable row level security;
alter table public.event_private_access enable row level security;
alter table public.event_organizers enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.event_interests enable row level security;
alter table public.event_invitations enable row level security;
alter table public.event_comments enable row level security;
alter table public.event_reports enable row level security;
alter table public.event_reminders enable row level security;
alter table public.domain_event_outbox enable row level security;
alter table public.event_audit_events enable row level security;

create policy events_select_authorized on public.events for select to authenticated using (public.can_view_event(id) or organizer_profile_id = public.current_profile_id());
create policy events_insert_verified on public.events for insert to authenticated with check (organizer_profile_id = public.current_profile_id() and public.has_verified_neighborhood_membership(neighborhood_id));
create policy events_update_organizer on public.events for update to authenticated using (public.can_manage_event(id, 'edit_event')) with check (public.can_manage_event(id, 'edit_event'));
create policy organizers_select on public.event_organizers for select to authenticated using (public.can_view_event(event_id) or profile_id = public.current_profile_id());
create policy organizers_manage on public.event_organizers for all to authenticated using (public.can_manage_event(event_id, 'manage_organizers')) with check (public.can_manage_event(event_id, 'manage_organizers'));
create policy rsvps_select on public.event_rsvps for select to authenticated using (profile_id = public.current_profile_id() or public.can_manage_event(event_id, 'manage_attendees'));
create policy interests_own on public.event_interests for all to authenticated using (profile_id = public.current_profile_id()) with check (profile_id = public.current_profile_id() and public.can_view_event(event_id));
create policy invitations_participants on public.event_invitations for select to authenticated using (inviter_profile_id = public.current_profile_id() or invitee_profile_id = public.current_profile_id());
create policy invitations_organizer_insert on public.event_invitations for insert to authenticated with check (inviter_profile_id = public.current_profile_id() and public.can_manage_event(event_id, 'manage_attendees'));
create policy comments_select on public.event_comments for select to authenticated using (public.can_view_event(event_id) and (moderation_status = 'approved' or author_profile_id = public.current_profile_id()));
create policy comments_insert on public.event_comments for insert to authenticated with check (author_profile_id = public.current_profile_id() and public.can_view_event(event_id));
create policy reports_own_insert on public.event_reports for insert to authenticated with check (reporter_profile_id = public.current_profile_id() and public.can_view_event(event_id));
create policy reports_own_or_staff_select on public.event_reports for select to authenticated using (reporter_profile_id = public.current_profile_id() or public.is_admin_or_moderator());
create policy reminders_own on public.event_reminders for all to authenticated using (profile_id = public.current_profile_id()) with check (profile_id = public.current_profile_id() and public.can_view_event(event_id));
create policy audit_staff_or_organizer on public.event_audit_events for select to authenticated using (public.is_admin_or_moderator() or public.can_manage_event(event_id, 'edit_event'));

revoke all on public.event_private_access, public.domain_event_outbox from anon, authenticated;
revoke execute on function public.prepare_event_insert() from public, anon, authenticated;
revoke execute on function public.can_view_event(uuid) from public, anon;
revoke execute on function public.can_manage_event(uuid, text) from public, anon;
revoke execute on function public.rsvp_to_event(uuid) from public, anon;
revoke execute on function public.cancel_event_rsvp(uuid) from public, anon;
revoke execute on function public.cancel_managed_event(uuid) from public, anon;
revoke execute on function public.get_event_private_access(uuid) from public, anon;
revoke execute on function public.set_event_private_access(uuid, text, text, boolean) from public, anon;
revoke execute on function public.prepare_event_comment() from public, anon, authenticated;
revoke execute on function public.prepare_event_invitation() from public, anon, authenticated;
revoke execute on function public.queue_event_side_effect() from public, anon, authenticated;
revoke execute on function public.audit_event_change() from public, anon, authenticated;
grant select, insert on public.events to authenticated;
grant update (title, description, cover_image_path, starts_at, ends_at, timezone, location_type, venue_name, area_label, public_meetup_point, visibility, capacity, comments_enabled) on public.events to authenticated;
grant select, insert, update, delete on public.event_organizers, public.event_interests, public.event_invitations, public.event_comments, public.event_reports, public.event_reminders to authenticated;
grant select on public.event_rsvps, public.event_audit_events to authenticated;
grant execute on function public.can_view_event(uuid), public.can_manage_event(uuid, text), public.rsvp_to_event(uuid), public.cancel_event_rsvp(uuid), public.cancel_managed_event(uuid), public.get_event_private_access(uuid), public.set_event_private_access(uuid, text, text, boolean) to authenticated;

insert into public.feature_flags(key, enabled, description)
values ('events', false, 'Shared neighborhood and group Events module; enable only after migration and RLS smoke tests pass.')
on conflict (key) do update set description = excluded.description;

commit;
