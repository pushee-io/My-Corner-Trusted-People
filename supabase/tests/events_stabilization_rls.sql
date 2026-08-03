begin;

select plan(12);

select ok(
  exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'event_visibility'
      and e.enumlabel = 'invite_only'
  ),
  'invite-only Events visibility exists'
);

select ok(
  exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'event_status'
      and e.enumlabel = 'archived'
  ),
  'archived Events lifecycle value exists'
);

select ok(
  exists (
    select 1
    from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'event_moderation_status'
      and e.enumlabel = 'rejected'
  ),
  'rejected Events moderation value exists'
);

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'event_invitations'
      and column_name = 'expires_at'
      and is_nullable = 'NO'
  ),
  'event invitation expiry exists and is required'
);

select ok(
  exists (select 1 from pg_proc where proname = 'get_current_events_context'),
  'authenticated Events context function exists'
);

select ok(
  exists (select 1 from pg_proc where proname = 'moderate_event_content'),
  'Events moderation function exists'
);

select ok(
  exists (select 1 from pg_proc where proname = 'respond_to_event_invitation'),
  'invitation response function exists'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.moderate_event_content(text,uuid,public.event_moderation_status,text)',
    'EXECUTE'
  ),
  'anonymous users cannot execute Events moderation'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.get_current_events_context()',
    'EXECUTE'
  ),
  'authenticated users have Events context access'
);

select ok(
  not exists (
    select 1 from public.feature_flags
    where key = 'events'
      and enabled
  ),
  'Events remains disabled after stabilization'
);

select ok(
  pg_get_functiondef('public.cancel_event_rsvp(uuid)'::regprocedure)
    like '%attendance response not found%'
  and pg_get_functiondef('public.cancel_event_rsvp(uuid)'::regprocedure)
    like '%changed_rsvp_count%',
  'RSVP cancellation fails closed for unrelated events'
);

select ok(
  pg_get_functiondef('public.can_view_event(uuid)'::regprocedure)
    like '%event_organizers%'
  and pg_get_functiondef('public.can_view_event(uuid)'::regprocedure)
    like '%invite_only%',
  'Events visibility includes organizer and invite-only rules'
);

select * from finish();

rollback;
