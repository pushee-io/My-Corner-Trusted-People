begin;

select plan(12);

select ok(
  exists (select 1 from pg_proc where proname = 'can_view_event'),
  'can_view_event function exists'
);

select ok(
  exists (
    select 1 from pg_policies
    where tablename = 'events'
      and policyname = 'events_select_authorized'
  ),
  'Events select RLS policy exists'
);

select ok(
  not exists (
    select 1 from information_schema.role_table_grants
    where table_name = 'event_private_access'
      and grantee = 'authenticated'
  ),
  'authenticated clients have no direct private event access grant'
);

select ok(
  exists (
    select 1 from pg_indexes
    where indexname = 'event_one_pending_invite'
  ),
  'pending invitations have an idempotency index'
);

select ok(
  exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'events'
      and column_name = 'cluster_id'
      and data_type = 'uuid'
  ),
  'Events use the shared UUID cluster model'
);

select ok(
  exists (
    select 1 from pg_trigger
    where tgname = 'event_invitations_prepare'
      and not tgisinternal
  ),
  'invitation audience and rate-limit trigger exists'
);

select ok(
  not has_function_privilege('anon', 'public.rsvp_to_event(uuid)', 'EXECUTE'),
  'anonymous users cannot RSVP through the security-definer function'
);

select ok(
  not has_function_privilege('anon', 'public.get_event_private_access(uuid)', 'EXECUTE'),
  'anonymous users cannot read private event access'
);

select ok(
  not has_function_privilege('anon', 'public.prepare_event_invitation()', 'EXECUTE'),
  'anonymous users cannot execute the invitation trigger function'
);

select ok(
  has_function_privilege('authenticated', 'public.rsvp_to_event(uuid)', 'EXECUTE'),
  'authenticated users have explicit RSVP function access'
);

select ok(
  exists (
    select 1 from pg_proc
    where proname = 'is_events_feature_enabled'
  ),
  'Events feature flag function exists'
);

select ok(
  exists (
    select 1 from pg_trigger
    where tgname = 'event_invitations_audit'
      and not tgisinternal
  ),
  'event invitation audit trigger exists'
);

select * from finish();

rollback;
