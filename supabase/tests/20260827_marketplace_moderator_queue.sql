begin;

do $$
begin
  if to_regclass('public.marketplace_listings') is null then
    raise exception 'marketplace listings table is missing';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'reports' and column_name = 'marketplace_listing_id'
  ) then
    raise exception 'reports.marketplace_listing_id is missing';
  end if;
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'moderation_cases' and column_name = 'decision_reason'
  ) then
    raise exception 'moderation case decision fields are missing';
  end if;
  if to_regprocedure('public.list_marketplace_moderation_queue(text)') is null
    or to_regprocedure('public.get_marketplace_moderation_report(uuid)') is null
    or to_regprocedure('public.review_marketplace_report(uuid,text,text,text)') is null
  then
    raise exception 'marketplace moderator RPC is missing';
  end if;
  if not has_function_privilege(
    'authenticated',
    'public.review_marketplace_report(uuid,text,text,text)',
    'execute'
  ) then
    raise exception 'authenticated moderators cannot execute the review RPC';
  end if;
  if has_table_privilege('authenticated', 'public.audit_events', 'insert')
    or has_table_privilege('authenticated', 'public.audit_events', 'update')
    or has_table_privilege('authenticated', 'public.audit_events', 'delete')
  then
    raise exception 'authenticated clients must not mutate audit history directly';
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'audit_events'
      and policyname = 'moderators read marketplace audit history'
  ) then
    raise exception 'marketplace audit read policy is missing';
  end if;
  if not exists (
    select 1 from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname = 'review_marketplace_report'
      and prosecdef
  ) then
    raise exception 'marketplace review RPC must be security definer';
  end if;
end;
$$;

rollback;
