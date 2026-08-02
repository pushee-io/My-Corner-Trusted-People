begin;

select plan(7);

select ok(
  exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'event_invitations'
      and column_name = 'expires_at'
  ),
  'event invitation expiry exists'
);

select ok(
  exists (
    select 1
    from pg_proc
    where proname = 'validate_event_lifecycle_transition'
  ),
  'event lifecycle transition guard exists'
);

select ok(
  exists (
    select 1
    from pg_proc
    where proname = 'send_managed_event_reminder'
  ),
  'organizer reminder function exists'
);

select ok(
  exists (
    select 1
    from pg_proc
    where proname = 'moderate_event_comment'
  ),
  'event content moderation function exists'
);

select ok(
  exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'feature_flags'
      and policyname = 'feature_flags_read_authenticated'
  ),
  'authenticated feature flag read policy exists'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.event_private_access',
    'SELECT'
  ),
  'authenticated clients cannot directly read exact event addresses'
);

select ok(
  not has_table_privilege(
    'authenticated',
    'public.event_audit_events',
    'UPDATE'
  )
  and not has_table_privilege(
    'authenticated',
    'public.event_audit_events',
    'DELETE'
  )
  and not has_function_privilege(
    'anon',
    'public.send_managed_event_reminder(uuid)',
    'EXECUTE'
  ),
  'audit records are immutable and anonymous users cannot send reminders'
);

select * from finish();

rollback;
