begin;

do $$
declare
  cancel_definition text;
  view_definition text;
begin
  if not exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid where t.typname = 'event_visibility' and e.enumlabel = 'invite_only') then
    raise exception 'invite-only Events visibility is missing';
  end if;
  if not exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid where t.typname = 'event_status' and e.enumlabel = 'archived') then
    raise exception 'archived Events lifecycle value is missing';
  end if;
  if not exists (select 1 from pg_enum e join pg_type t on t.oid = e.enumtypid where t.typname = 'event_moderation_status' and e.enumlabel = 'rejected') then
    raise exception 'rejected Events moderation value is missing';
  end if;
  if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'event_invitations' and column_name = 'expires_at' and is_nullable = 'NO') then
    raise exception 'event invitation expiry is missing or nullable';
  end if;
  if not exists (select 1 from pg_proc where proname = 'get_current_events_context') then
    raise exception 'authenticated Events context function is missing';
  end if;
  if not exists (select 1 from pg_proc where proname = 'moderate_event_content') then
    raise exception 'Events moderation function is missing';
  end if;
  if not exists (select 1 from pg_proc where proname = 'respond_to_event_invitation') then
    raise exception 'invitation response function is missing';
  end if;
  if has_function_privilege('anon', 'public.moderate_event_content(text,uuid,public.event_moderation_status,text)', 'EXECUTE') then
    raise exception 'anonymous users must not execute Events moderation';
  end if;
  if not has_function_privilege('authenticated', 'public.get_current_events_context()', 'EXECUTE') then
    raise exception 'authenticated users require Events context access';
  end if;
  if exists (select 1 from public.feature_flags where key = 'events' and enabled) then
    raise exception 'Events must remain disabled after the stabilization migration';
  end if;

  select pg_get_functiondef('public.cancel_event_rsvp(uuid)'::regprocedure) into cancel_definition;
  if cancel_definition not like '%attendance response not found%' or cancel_definition not like '%changed_rsvp_count%' then
    raise exception 'RSVP cancellation does not fail closed on unrelated events';
  end if;

  select pg_get_functiondef('public.can_view_event(uuid)'::regprocedure) into view_definition;
  if view_definition not like '%event_organizers%' or view_definition not like '%invite_only%' then
    raise exception 'Events visibility does not include organizer and private-event rules';
  end if;
end
$$;

rollback;
