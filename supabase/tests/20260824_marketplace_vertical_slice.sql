begin;

do $$
begin
  if to_regclass('public.marketplace_listing_images') is null then
    raise exception 'marketplace listing image table is missing';
  end if;
  if to_regclass('public.marketplace_pickup_private_details') is null then
    raise exception 'marketplace private pickup table is missing';
  end if;
  if to_regclass('public.marketplace_conversations') is null
    or to_regclass('public.marketplace_messages') is null
  then
    raise exception 'marketplace messaging tables are missing';
  end if;
  if has_table_privilege('authenticated', 'public.marketplace_pickup_private_details', 'select') then
    raise exception 'authenticated role must not read private pickup details directly';
  end if;
  if has_table_privilege('authenticated', 'public.marketplace_pickup_requests', 'update') then
    raise exception 'authenticated role must use the pickup transition RPC';
  end if;
  if not has_function_privilege(
    'authenticated',
    'public.respond_to_marketplace_pickup_request(uuid,text,text)',
    'execute'
  ) then
    raise exception 'authenticated role cannot execute pickup transition RPC';
  end if;
  if not has_function_privilege(
    'authenticated',
    'public.get_marketplace_pickup_private_details(uuid[])',
    'execute'
  ) then
    raise exception 'authenticated role cannot execute audited private pickup read RPC';
  end if;
end;
$$;

rollback;
