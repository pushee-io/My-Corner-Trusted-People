begin;

-- Run after seeding authenticated profiles and verified memberships. These assertions
-- intentionally fail closed when the fixture variables are not provided by the test harness.
do $$
begin
  if not exists (select 1 from pg_proc where proname = 'can_view_event') then
    raise exception 'can_view_event function is missing';
  end if;
  if not exists (select 1 from pg_policies where tablename = 'events' and policyname = 'events_select_authorized') then
    raise exception 'events select RLS policy is missing';
  end if;
  if exists (select 1 from information_schema.role_table_grants where table_name = 'event_private_access' and grantee = 'authenticated') then
    raise exception 'private event access table must not be directly granted to authenticated clients';
  end if;
  if not exists (select 1 from pg_indexes where indexname = 'event_one_pending_invite') then
    raise exception 'idempotent pending-invitation index is missing';
  end if;
  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'cluster_id' and data_type = 'uuid'
  ) then
    raise exception 'events.cluster_id must use the shared UUID cluster model';
  end if;
  if not exists (
    select 1 from pg_trigger
    where tgname = 'event_invitations_prepare' and not tgisinternal
  ) then
    raise exception 'event invitation audience and rate-limit trigger is missing';
  end if;
  if has_function_privilege('anon', 'public.rsvp_to_event(uuid)', 'EXECUTE') then
    raise exception 'anon must not execute event RSVP security definer functions';
  end if;
  if has_function_privilege('anon', 'public.get_event_private_access(uuid)', 'EXECUTE') then
    raise exception 'anon must not execute private event access functions';
  end if;
  if has_function_privilege('anon', 'public.prepare_event_invitation()', 'EXECUTE') then
    raise exception 'anon must not execute event invitation trigger functions';
  end if;
  if not has_function_privilege('authenticated', 'public.rsvp_to_event(uuid)', 'EXECUTE') then
    raise exception 'authenticated users require explicit RSVP function access';
  end if;
  if not exists (select 1 from pg_proc where proname = 'is_events_feature_enabled') then
    raise exception 'Events feature flag function is missing';
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'event_invitations_audit' and not tgisinternal) then
    raise exception 'event invitation audit trigger is missing';
  end if;
end $$;

rollback;
