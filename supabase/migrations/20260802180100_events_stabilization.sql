begin;

alter table public.events
  add column if not exists client_request_id uuid;

alter table public.events
  drop constraint if exists events_organizer_client_request_id_key;
alter table public.events
  add constraint events_organizer_client_request_id_key unique (organizer_profile_id, client_request_id);

alter table public.event_invitations
  add column if not exists expires_at timestamptz;

update public.event_invitations
set expires_at = created_at + interval '7 days'
where expires_at is null;

alter table public.event_invitations
  alter column expires_at set default (now() + interval '7 days'),
  alter column expires_at set not null;

alter table public.event_invitations
  drop constraint if exists event_invitations_expiry_after_creation;
alter table public.event_invitations
  add constraint event_invitations_expiry_after_creation check (expires_at > created_at);

create or replace function public.is_events_feature_enabled()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select enabled from public.feature_flags where key = 'events'), false)
$$;

create or replace function public.get_current_events_context()
returns table (
  profile_id uuid,
  display_name text,
  neighborhood_id uuid,
  neighborhood_name text,
  cluster_id uuid,
  is_verified_neighborhood_member boolean,
  is_staff boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.display_name,
    nm.neighborhood_id,
    n.name,
    ncm.cluster_id,
    true,
    public.is_admin_or_moderator()
  from public.profiles p
  join public.neighborhood_memberships nm
    on nm.profile_id = p.id
   and nm.is_primary = true
   and nm.status = 'verified'
   and nm.verified_at is not null
   and nm.ended_at is null
   and (nm.verification_expires_at is null or nm.verification_expires_at > now())
  join public.neighborhoods n on n.id = nm.neighborhood_id
  join public.neighborhood_cluster_members ncm on ncm.neighborhood_id = nm.neighborhood_id
  where p.auth_user_id = auth.uid()
  order by ncm.created_at asc
  limit 1
$$;

create or replace function public.can_view_event(target_event_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.events e
    where e.id = target_event_id
      and (
        public.is_admin_or_moderator()
        or exists (
          select 1
          from public.event_organizers eo
          where eo.event_id = e.id
            and eo.profile_id = public.current_profile_id()
        )
        or (
          e.moderation_status = 'approved'
          and e.status in ('scheduled', 'completed')
          and (
            exists (
              select 1
              from public.neighborhood_memberships nm
              left join public.neighborhood_cluster_members viewer_cluster
                on viewer_cluster.neighborhood_id = nm.neighborhood_id
              where nm.profile_id = public.current_profile_id()
                and nm.status = 'verified'
                and nm.ended_at is null
                and (nm.verification_expires_at is null or nm.verification_expires_at > now())
                and (
                  (e.visibility = 'verified_neighborhood_members' and nm.neighborhood_id = e.neighborhood_id)
                  or (e.visibility = 'immediate_cluster_members' and viewer_cluster.cluster_id = e.cluster_id)
                )
            )
            or (
              e.visibility = 'invite_only'
              and exists (
                select 1
                from public.event_invitations invitation
                where invitation.event_id = e.id
                  and invitation.invitee_profile_id = public.current_profile_id()
                  and invitation.status = 'accepted'
                  and invitation.expires_at > now()
              )
            )
          )
        )
      )
  )
$$;

create or replace function public.cancel_event_rsvp(target_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_profile uuid := public.current_profile_id();
  changed_rsvp_count integer := 0;
  changed_interest_count integer := 0;
begin
  if caller_profile is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  update public.event_rsvps
  set status = 'cancelled', updated_at = now()
  where event_id = target_event_id
    and profile_id = caller_profile
    and status = 'going';
  get diagnostics changed_rsvp_count = row_count;

  delete from public.event_interests
  where event_id = target_event_id
    and profile_id = caller_profile;
  get diagnostics changed_interest_count = row_count;

  if changed_rsvp_count = 0 and changed_interest_count = 0 then
    raise exception 'attendance response not found' using errcode = 'P0002';
  end if;

  if changed_rsvp_count > 0 then
    update public.events
    set attendee_count = (
      select count(*)
      from public.event_rsvps
      where event_id = target_event_id and status = 'going'
    ), updated_at = now()
    where id = target_event_id;
  end if;
end
$$;

create or replace function public.prepare_event_invitation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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

  update public.event_invitations
  set status = 'revoked', updated_at = now()
  where event_id = new.event_id
    and invitee_profile_id = new.invitee_profile_id
    and status = 'pending'
    and expires_at <= now();

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
        (target_event.visibility in ('verified_neighborhood_members', 'invite_only') and nm.neighborhood_id = target_event.neighborhood_id)
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
  new.expires_at := least(coalesce(new.expires_at, now() + interval '7 days'), now() + interval '30 days');
  return new;
end
$$;

create or replace function public.respond_to_event_invitation(target_invitation_id uuid, accept_invitation boolean)
returns public.event_invite_status
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_profile uuid := public.current_profile_id();
  target public.event_invitations;
  next_status public.event_invite_status;
begin
  select * into target
  from public.event_invitations
  where id = target_invitation_id
    and invitee_profile_id = caller_profile
  for update;

  if not found then raise exception 'invitation not found' using errcode = 'P0002'; end if;
  if target.status <> 'pending' then return target.status; end if;
  if target.expires_at <= now() then
    update public.event_invitations set status = 'revoked', updated_at = now() where id = target.id;
    raise exception 'invitation expired' using errcode = '22023';
  end if;

  next_status := case when accept_invitation then 'accepted' else 'declined' end;
  update public.event_invitations set status = next_status, updated_at = now() where id = target.id;
  return next_status;
end
$$;

create or replace function public.audit_event_invitation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.event_audit_events(event_id, actor_profile_id, action, metadata)
  values (
    new.event_id,
    public.current_profile_id(),
    case when tg_op = 'INSERT' then 'event_invitation_created' else 'event_invitation_updated' end,
    jsonb_build_object('invitationId', new.id, 'status', new.status, 'expiresAt', new.expires_at)
  );
  return new;
end
$$;

drop trigger if exists event_invitations_audit on public.event_invitations;
create trigger event_invitations_audit
after insert or update on public.event_invitations
for each row execute function public.audit_event_invitation();

create or replace function public.set_event_private_access(
  target_event_id uuid,
  new_precise_address text,
  new_virtual_link text,
  allow_confirmed_attendees boolean
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_manage_event(target_event_id, 'edit_event') then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  insert into public.event_private_access(event_id, precise_address, virtual_link, reveal_to_confirmed_attendees)
  values (target_event_id, nullif(btrim(new_precise_address), ''), nullif(btrim(new_virtual_link), ''), allow_confirmed_attendees)
  on conflict (event_id) do update
  set precise_address = excluded.precise_address,
      virtual_link = excluded.virtual_link,
      reveal_to_confirmed_attendees = excluded.reveal_to_confirmed_attendees,
      updated_at = now();
  insert into public.event_audit_events(event_id, actor_profile_id, action, metadata)
  values (
    target_event_id,
    public.current_profile_id(),
    'event_private_access_updated',
    jsonb_build_object('releasedToConfirmedAttendees', allow_confirmed_attendees)
  );
end
$$;

create or replace function public.moderate_event_content(
  target_kind text,
  target_id uuid,
  next_status public.event_moderation_status,
  decision_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_event_id uuid;
begin
  if not public.is_admin_or_moderator() then
    raise exception 'staff authorization required' using errcode = '42501';
  end if;
  if next_status not in ('approved', 'rejected', 'removed') then
    raise exception 'invalid moderation transition' using errcode = '22023';
  end if;
  if char_length(btrim(decision_reason)) < 3 then
    raise exception 'moderation reason is required' using errcode = '22023';
  end if;

  if target_kind = 'event' then
    update public.events
    set moderation_status = next_status,
        status = case when next_status = 'approved' and status = 'draft' then 'scheduled' else status end,
        updated_at = now()
    where id = target_id
    returning id into target_event_id;
  elsif target_kind = 'comment' then
    update public.event_comments
    set moderation_status = next_status, updated_at = now()
    where id = target_id
    returning event_id into target_event_id;
  else
    raise exception 'unsupported moderation target' using errcode = '22023';
  end if;

  if target_event_id is null then raise exception 'moderation target not found' using errcode = 'P0002'; end if;
  insert into public.event_audit_events(event_id, actor_profile_id, action, metadata)
  values (
    target_event_id,
    public.current_profile_id(),
    'event_content_moderated',
    jsonb_build_object('targetKind', target_kind, 'targetId', target_id, 'status', next_status, 'reason', btrim(decision_reason))
  );
end
$$;

create or replace function public.transition_managed_event(target_event_id uuid, next_status public.event_status)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.can_manage_event(target_event_id, 'cancel_event') then
    raise exception 'owner authorization required' using errcode = '42501';
  end if;
  if next_status not in ('cancelled', 'completed', 'archived') then
    raise exception 'invalid event lifecycle transition' using errcode = '22023';
  end if;
  update public.events set status = next_status, updated_at = now() where id = target_event_id;
end
$$;

create or replace function public.queue_event_organizer_reminder(target_event_id uuid, reminder_message text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  queued_count integer;
begin
  if not public.can_manage_event(target_event_id, 'manage_attendees') then
    raise exception 'organizer authorization required' using errcode = '42501';
  end if;
  if char_length(btrim(reminder_message)) not between 1 and 500 then
    raise exception 'reminder message must be between 1 and 500 characters' using errcode = '22023';
  end if;
  insert into public.domain_event_outbox(aggregate_type, aggregate_id, recipient_profile_id, event_type, payload)
  select 'event', target_event_id, r.profile_id, 'event_organizer_reminder',
    jsonb_build_object('eventId', target_event_id, 'message', btrim(reminder_message))
  from public.event_rsvps r
  where r.event_id = target_event_id and r.status = 'going';
  get diagnostics queued_count = row_count;
  insert into public.event_audit_events(event_id, actor_profile_id, action, metadata)
  values (target_event_id, public.current_profile_id(), 'event_organizer_reminder_queued', jsonb_build_object('recipientCount', queued_count));
  return queued_count;
end
$$;

create or replace function public.prepare_event_reminder()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  event_start timestamptz;
begin
  new.profile_id := public.current_profile_id();
  if new.profile_id is null or not public.can_view_event(new.event_id) then
    raise exception 'event unavailable' using errcode = '42501';
  end if;
  select starts_at into event_start from public.events where id = new.event_id;
  if new.remind_at <= now() or new.remind_at >= event_start then
    raise exception 'reminder must be scheduled before the event' using errcode = '22023';
  end if;
  return new;
end
$$;

drop trigger if exists event_reminders_prepare on public.event_reminders;
create trigger event_reminders_prepare
before insert or update on public.event_reminders
for each row execute function public.prepare_event_reminder();

create or replace function public.queue_event_side_effect()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_table_name = 'event_invitations' then
    insert into public.domain_event_outbox(aggregate_type, aggregate_id, recipient_profile_id, event_type, payload)
    values ('event', new.event_id, new.invitee_profile_id, 'event_invitation', jsonb_build_object('eventId', new.event_id, 'invitationId', new.id));
  elsif tg_table_name = 'event_reminders' then
    delete from public.domain_event_outbox
    where aggregate_type = 'event'
      and aggregate_id = new.event_id
      and recipient_profile_id = new.profile_id
      and event_type = 'event_reminder'
      and processed_at is null;
    insert into public.domain_event_outbox(aggregate_type, aggregate_id, recipient_profile_id, event_type, payload, available_at)
    values ('event', new.event_id, new.profile_id, 'event_reminder', jsonb_build_object('eventId', new.event_id), new.remind_at);
  end if;
  return new;
end
$$;

drop trigger if exists event_reminders_outbox on public.event_reminders;
create trigger event_reminders_outbox
after insert or update on public.event_reminders
for each row execute function public.queue_event_side_effect();

drop policy if exists events_select_authorized on public.events;
create policy events_select_authorized on public.events
for select to authenticated
using (public.can_view_event(id));

drop policy if exists comments_select on public.event_comments;
create policy comments_select on public.event_comments
for select to authenticated
using (
  public.can_view_event(event_id)
  and (
    moderation_status = 'approved'
    or author_profile_id = public.current_profile_id()
    or public.is_admin_or_moderator()
  )
);

revoke execute on function public.is_events_feature_enabled() from public, anon;
revoke execute on function public.get_current_events_context() from public, anon;
revoke execute on function public.respond_to_event_invitation(uuid, boolean) from public, anon;
revoke execute on function public.audit_event_invitation() from public, anon, authenticated;
revoke execute on function public.moderate_event_content(text, uuid, public.event_moderation_status, text) from public, anon;
revoke execute on function public.transition_managed_event(uuid, public.event_status) from public, anon;
revoke execute on function public.queue_event_organizer_reminder(uuid, text) from public, anon;
revoke execute on function public.prepare_event_reminder() from public, anon, authenticated;

grant execute on function public.is_events_feature_enabled() to authenticated;
grant execute on function public.get_current_events_context() to authenticated;
grant execute on function public.respond_to_event_invitation(uuid, boolean) to authenticated;
grant execute on function public.moderate_event_content(text, uuid, public.event_moderation_status, text) to authenticated;
grant execute on function public.transition_managed_event(uuid, public.event_status) to authenticated;
grant execute on function public.queue_event_organizer_reminder(uuid, text) to authenticated;

update public.feature_flags
set enabled = false,
    description = 'Shared neighborhood and private Events module; enable only after stabilization gates pass.',
    updated_at = now()
where key = 'events';

commit;
