begin;

select plan(8);

select has_table(
  'public',
  'marketplace_listing_images',
  'Marketplace listing image table exists'
);

select has_table(
  'public',
  'marketplace_pickup_private_details',
  'Marketplace private pickup table exists'
);

select has_table(
  'public',
  'marketplace_conversations',
  'Marketplace conversation table exists'
);

select has_table(
  'public',
  'marketplace_messages',
  'Marketplace message table exists'
);

select ok(
  not has_table_privilege('authenticated', 'public.marketplace_pickup_private_details', 'select'),
  'Authenticated users cannot read private pickup details directly'
);

select ok(
  not has_table_privilege('authenticated', 'public.marketplace_pickup_requests', 'update'),
  'Authenticated users must use the pickup transition RPC'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.respond_to_marketplace_pickup_request(uuid,text,text)',
    'execute'
  ),
  'Authenticated users can execute the pickup transition RPC'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.get_marketplace_pickup_private_details(uuid[])',
    'execute'
  ),
  'Authenticated users can execute the audited private pickup read RPC'
);

select * from finish();

rollback;
