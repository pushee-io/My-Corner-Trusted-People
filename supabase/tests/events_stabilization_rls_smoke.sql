begin;

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'event_invitations' and column_name = 'expires_at'
  ) then raise exception 'event invitation expiry is missing'; end if;

  if not exists (
    select 1 from pg_proc where proname = 'validate_event_lifecycle_transition'
  ) then raise exception 'event lifecycle transition guard is missing'; end if;

  if not exists (
    select 1 from pg_proc where proname = 'send_managed_event_reminder'
  ) then raise exception 'organizer reminder function is missing'; end if;

  if not exists (
    select 1 from pg_proc where proname = 'moderate_event_comment'
  ) then raise exception 'event content moderation function is missing'; end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'feature_flags' and policyname = 'feature_flags_read_authenticated'
  ) then raise exception 'authenticated feature flag read policy is missing'; end if;

  if has_table_privilege('authenticated', 'public.event_private_access', 'SELECT') then
    raise exception 'authenticated clients must not read exact event addresses directly';
  end if;

  if has_table_privilege('authenticated', 'public.event_audit_events', 'UPDATE')
    or has_table_privilege('authenticated', 'public.event_audit_events', 'DELETE') then
    raise exception 'event audit records must be immutable to authenticated clients';
  end if;

  if has_function_privilege('anon', 'public.send_managed_event_reminder(uuid)', 'EXECUTE') then
    raise exception 'anonymous users must not send event reminders';
  end if;
end $$;

rollback;
