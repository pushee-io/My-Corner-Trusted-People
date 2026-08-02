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
end $$;

rollback;
