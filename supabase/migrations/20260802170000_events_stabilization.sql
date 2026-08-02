begin;

do $$
begin
  if exists (
    select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid
    where t.typname = 'event_moderation_status' and e.enumlabel = 'blocked'
  ) then
    alter type public.event_moderation_status rename value 'blocked' to 'rejected';
  end if;
end $$;
commit;

alter type public.event_status add value if not exists 'archived';
alter type public.event_visibility add value if not exists 'private_invitees';
alter type public.event_invite_status add value if not exists 'expired';

begin;

alter table public.event_invitations
  add column if not exists expires_at timestamptz not null default (now() + interval '7 days');
alter table public.event_invitations drop constraint if exists event_invitations_expiry_valid;
alter table public.event_invitations
  add constraint event_invitations_expiry_valid check (expires_at > created_at);
alter table public.event_audit_events drop constraint if exists event_audit_events_event_id_fkey;
alter table public.event_audit_events
  add constraint event_audit_events_event_id_fkey foreign key (event_id) references public.events(id) on delete restrict;

create or replace function public.can_manage_event(target_event_id uuid, required_permission text default 'edit_event')
returns boolean language sql stable security definer set search_path = public as $$
  select public.is_admin_or_moderator() or exists (
    select 1
    from public.event_organizers eo
    where eo.event_id = target_event_id
      and eo.profile_id = public.current_profile_id()
      and (
        eo.role = 'owner'
        or (
          eo.role = 'co_organizer'
          and required_permission in (
            'edit_event',
            'manage_attendees',
            'send_reminders',
            'moderate_content',
            'invite_attendees'
          )
        )
      )
  )
$$;

create or replace function public.can_view_event(target_event_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
    from public.events e
    where e.id = target_event_id
      and (
        public.is_admin_or_moderator()
        or exists (
          select 1 from public.event_organizers eo
          where eo.event_id = e.id and eo.profile_id = public.current_profile_id()
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
              e.visibility = 'private_invitees'
              and exists (
                select 1 from public.event_invitations invitation
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

create or replace function public.prepare_event_invitation()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  caller_profile uuid := public.current_profile_id();
  target_event public.events;
  recent_invitation_count integer;
begin
  if caller_profile is null or not public.can_manage_event(new.event_id, 'invite_attendees') then
    raise exception 'not authorized to invite event attendees' using errcode = '42501';
  end if;
  if new.invitee_profile_id = caller_profile then
    raise exception 'organizers cannot invite themselves' using errcode = '23514';
  end if;
  select * into target_event from public.events where id = new.event_id;
  if not found then raise exception 'event not found' using errcode = '23503'; end if;

  update public.event_invitations
  set status = 'expired', updated_at = now()
  where event_id = new.event_id and invitee_profile_id = new.invitee_profile_id
    and status = 'pending' and expires_at <= now();
  if exists (
    select 1 from public.event_invitations
    where event_id = new.event_id and invitee_profile_id = new.invitee_profile_id
      and status = 'pending' and expires_at > now()
  ) then
    raise exception 'active event invitation already exists' using errcode = '23505';
  end if;

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
        or (target_event.visibility in ('immediate_cluster_members', 'private_invitees') and invitee_cluster.cluster_id = target_event.cluster_id)
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
  new.expires_at := least(coalesce(new.expires_at, now() + interval '7 days'), now() + interval '7 days');
  return new;
end $$;

create or replace function public.validate_event_lifecycle_transition()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.status is distinct from old.status and not (
    (old.status = 'draft' and new.status in ('scheduled', 'cancelled'))
    or (old.status = 'scheduled' and new.status in ('cancelled', 'completed'))
    or (old.status in ('cancelled', 'completed') and new.status = 'archived')
  ) then
    raise exception 'invalid event status transition' using errcode = '23514';
  end if;
  if new.moderation_status is distinct from old.moderation_status and not (
    (old.moderation_status = 'pending' and new.moderation_status in ('approved', 'rejected', 'removed'))
    or (old.moderation_status = 'approved' and new.moderation_status = 'removed')
    or (old.moderation_status = 'rejected' and new.moderation_status = 'pending')
  ) then
    raise exception 'invalid event moderation transition' using errcode = '23514';
  end if;
  return new;
end $$;
drop trigger if exists events_validate_lifecycle on public.events;
create trigger events_validate_lifecycle before update on public.events
for each row execute function public.validate_event_lifecycle_transition();

create or replace function public.transition_managed_event_status(target_event_id uuid, next_status public.event_status)
returns void language plpgsql security definer set search_path = public as $$
declare required_permission text;
begin
  required_permission := case when next_status in ('cancelled', 'archived') then 'cancel_event' else 'edit_event' end;
  if not public.can_manage_event(target_event_id, required_permission) then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  update public.events set status = next_status, updated_at = now() where id = target_event_id;
end $$;

create or replace function public.moderate_event(target_event_id uuid, decision public.event_moderation_status, reason text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin_or_moderator() then raise exception 'not authorized' using errcode = '42501'; end if;
  if decision not in ('approved', 'rejected', 'removed') then raise exception 'invalid moderation decision' using errcode = '23514'; end if;
  update public.events
  set moderation_status = decision,
      status = case when decision = 'approved' and status = 'draft' then 'scheduled' else status end,
      updated_at = now()
  where id = target_event_id;
  insert into public.event_audit_events(event_id, actor_profile_id, action, metadata)
  values (target_event_id, public.current_profile_id(), 'event_moderated', jsonb_build_object('decision', decision, 'reason', reason));
end $$;

create or replace function public.moderate_event_comment(target_comment_id uuid, decision public.event_moderation_status)
returns void language plpgsql security definer set search_path = public as $$
declare target_event_id uuid;
begin
  select event_id into target_event_id from public.event_comments where id = target_comment_id;
  if not public.can_manage_event(target_event_id, 'moderate_content') then raise exception 'not authorized' using errcode = '42501'; end if;
  if decision not in ('approved', 'rejected', 'removed') then raise exception 'invalid moderation decision' using errcode = '23514'; end if;
  update public.event_comments set moderation_status = decision, updated_at = now() where id = target_comment_id;
  insert into public.event_audit_events(event_id, actor_profile_id, action, metadata)
  values (target_event_id, public.current_profile_id(), 'event_comment_moderated', jsonb_build_object('commentId', target_comment_id, 'decision', decision));
end $$;

create or replace function public.send_managed_event_reminder(target_event_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.can_manage_event(target_event_id, 'send_reminders') then raise exception 'not authorized' using errcode = '42501'; end if;
  insert into public.domain_event_outbox(aggregate_type, aggregate_id, recipient_profile_id, event_type, payload)
  select 'event', target_event_id, r.profile_id, 'event_reminder', jsonb_build_object('eventId', target_event_id)
  from public.event_rsvps r where r.event_id = target_event_id and r.status = 'going';
  insert into public.event_audit_events(event_id, actor_profile_id, action)
  values (target_event_id, public.current_profile_id(), 'event_reminder_sent');
end $$;

create or replace function public.audit_event_invitation()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.event_audit_events(event_id, actor_profile_id, action, metadata)
  values (new.event_id, public.current_profile_id(), 'event_invitation_created', jsonb_build_object('invitationId', new.id, 'expiresAt', new.expires_at));
  return new;
end $$;
drop trigger if exists event_invitations_audit on public.event_invitations;
create trigger event_invitations_audit after insert on public.event_invitations
for each row execute function public.audit_event_invitation();

drop policy if exists events_select_authorized on public.events;
create policy events_select_authorized on public.events for select to authenticated using (public.can_view_event(id));
drop policy if exists invitations_participants on public.event_invitations;
create policy invitations_participants on public.event_invitations for select to authenticated using (
  inviter_profile_id = public.current_profile_id()
  or invitee_profile_id = public.current_profile_id()
  or public.can_manage_event(event_id, 'invite_attendees')
);
drop policy if exists invitations_invitee_response on public.event_invitations;
create policy invitations_invitee_response on public.event_invitations for update to authenticated
using (invitee_profile_id = public.current_profile_id() and status = 'pending' and expires_at > now())
with check (invitee_profile_id = public.current_profile_id() and status in ('accepted', 'declined'));
drop policy if exists invitations_organizer_revoke on public.event_invitations;
create policy invitations_organizer_revoke on public.event_invitations for update to authenticated
using (public.can_manage_event(event_id, 'invite_attendees'))
with check (status = 'revoked');
drop policy if exists feature_flags_read_authenticated on public.feature_flags;
create policy feature_flags_read_authenticated on public.feature_flags for select to authenticated using (true);

revoke update, delete on public.event_audit_events from anon, authenticated;
revoke all on public.event_organizers, public.event_interests, public.event_invitations,
  public.event_comments, public.event_reports, public.event_reminders from authenticated;
revoke execute on function public.validate_event_lifecycle_transition() from public, anon, authenticated;
revoke execute on function public.audit_event_invitation() from public, anon, authenticated;
revoke execute on function public.transition_managed_event_status(uuid, public.event_status) from public, anon;
revoke execute on function public.moderate_event(uuid, public.event_moderation_status, text) from public, anon;
revoke execute on function public.moderate_event_comment(uuid, public.event_moderation_status) from public, anon;
revoke execute on function public.send_managed_event_reminder(uuid) from public, anon;
grant select on public.feature_flags to authenticated;
grant select, insert, update, delete on public.event_organizers to authenticated;
grant select, insert, update, delete on public.event_interests to authenticated;
grant select, insert, update (status) on public.event_invitations to authenticated;
grant select, insert on public.event_comments to authenticated;
grant select, insert on public.event_reports to authenticated;
grant select, insert, update, delete on public.event_reminders to authenticated;
grant execute on function public.transition_managed_event_status(uuid, public.event_status) to authenticated;
grant execute on function public.moderate_event(uuid, public.event_moderation_status, text) to authenticated;
grant execute on function public.moderate_event_comment(uuid, public.event_moderation_status) to authenticated;
grant execute on function public.send_managed_event_reminder(uuid) to authenticated;

commit;
