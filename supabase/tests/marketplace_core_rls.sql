create or replace function pg_temp.assert_true(ok boolean, message text)
returns void
language plpgsql
as $$
begin
  if not ok then
    raise exception '%', message;
  end if;
end;
$$;

create or replace function pg_temp.assert_denied(statement text, message text)
returns void
language plpgsql
as $$
begin
  execute statement;
  raise exception '%', message;
exception
  when insufficient_privilege then
    null;
  when check_violation then
    null;
  when others then
    if sqlstate = '42501' then
      null;
    else
      raise;
    end if;
end;
$$;

reset role;

delete from public.marketplace_pickup_requests
where listing_id in (
  'e4300000-0000-4000-8000-000000000001',
  'e4300000-0000-4000-8000-000000000002',
  'e4300000-0000-4000-8000-000000000003'
);

delete from public.marketplace_listings
where id in (
  'e4300000-0000-4000-8000-000000000001',
  'e4300000-0000-4000-8000-000000000002'
);

delete from public.neighborhood_memberships
where profile_id in (
  'e4000000-0000-4000-8000-000000000001',
  'e4000000-0000-4000-8000-000000000002',
  'e4000000-0000-4000-8000-000000000003',
  'e4000000-0000-4000-8000-000000000004'
);

delete from public.neighborhoods
where id in (
  'e4100000-0000-4000-8000-000000000001',
  'e4100000-0000-4000-8000-000000000002'
);

delete from public.profiles
where id in (
  'e4000000-0000-4000-8000-000000000001',
  'e4000000-0000-4000-8000-000000000002',
  'e4000000-0000-4000-8000-000000000003',
  'e4000000-0000-4000-8000-000000000004'
);

insert into public.profiles (id, auth_user_id, display_name, role, phone_verified)
values
  ('e4000000-0000-4000-8000-000000000001', 'e4aa1111-1111-4111-8111-111111111111', 'Market Ama', 'requester', true),
  ('e4000000-0000-4000-8000-000000000002', 'e4bb2222-2222-4222-8222-222222222222', 'Market Kofi', 'requester', true),
  ('e4000000-0000-4000-8000-000000000003', 'e4cc3333-3333-4333-8333-333333333333', 'Market Osu', 'requester', true),
  ('e4000000-0000-4000-8000-000000000004', 'e4dd4444-4444-4444-8444-444444444444', 'Market Moderator', 'moderator', true);

insert into public.neighborhoods (id, name, city, country_code, municipality, region)
values
  ('e4100000-0000-4000-8000-000000000001', 'Marketplace East Legon', 'Accra', 'GH', 'Ayawaso West', 'Greater Accra'),
  ('e4100000-0000-4000-8000-000000000002', 'Marketplace Osu', 'Accra', 'GH', 'Korle Klottey', 'Greater Accra');

insert into public.neighborhood_memberships (
  profile_id,
  neighborhood_id,
  is_primary,
  status,
  verification_method,
  verified_at,
  verification_expires_at
)
values
  ('e4000000-0000-4000-8000-000000000001', 'e4100000-0000-4000-8000-000000000001', true, 'verified', 'admin_seed', now(), now() + interval '1 year'),
  ('e4000000-0000-4000-8000-000000000002', 'e4100000-0000-4000-8000-000000000001', true, 'verified', 'admin_seed', now(), now() + interval '1 year'),
  ('e4000000-0000-4000-8000-000000000003', 'e4100000-0000-4000-8000-000000000002', true, 'verified', 'admin_seed', now(), now() + interval '1 year');

set role authenticated;
set request.jwt.claim.sub = 'e4aa1111-1111-4111-8111-111111111111';

insert into public.marketplace_listings (
  id,
  neighborhood_id,
  seller_id,
  title,
  description,
  price_ghs,
  availability,
  pickup_area,
  pickup_notes,
  moderation_status
)
values (
  'e4300000-0000-4000-8000-000000000001',
  'e4100000-0000-4000-8000-000000000001',
  'e4000000-0000-4000-8000-000000000001',
  'Folding study table',
  'Clean folding table suitable for study or small shop display.',
  120.00,
  'available',
  'East Legon, general pickup area',
  'Coordinate daytime pickup near a public landmark.',
  'not_run'
);

select pg_temp.assert_denied(
  $statement$
    update public.marketplace_listings
    set moderation_status = 'clean'
    where id = 'e4300000-0000-4000-8000-000000000001'
  $statement$,
  'seller must not self-approve a marketplace listing'
);

reset role;

update public.marketplace_listings
set moderation_status = 'clean'
where id = 'e4300000-0000-4000-8000-000000000001';

insert into public.marketplace_listings (
  id,
  neighborhood_id,
  seller_id,
  title,
  description,
  price_ghs,
  availability,
  pickup_area,
  moderation_status
)
values (
  'e4300000-0000-4000-8000-000000000002',
  'e4100000-0000-4000-8000-000000000001',
  'e4000000-0000-4000-8000-000000000001',
  'Blocked test listing',
  'This listing should be hidden from ordinary marketplace readers.',
  1.00,
  'available',
  'East Legon, general pickup area',
  'blocked'
);

insert into public.marketplace_listings (
  id,
  neighborhood_id,
  seller_id,
  title,
  description,
  price_ghs,
  availability,
  pickup_area,
  moderation_status
)
values (
  'e4300000-0000-4000-8000-000000000003',
  'e4100000-0000-4000-8000-000000000001',
  'e4000000-0000-4000-8000-000000000001',
  'Pending review test listing',
  'This listing must remain private until a moderator approves it.',
  20.00,
  'available',
  'East Legon, general pickup area',
  'not_run'
);

set role authenticated;
set request.jwt.claim.sub = 'e4aa1111-1111-4111-8111-111111111111';

select pg_temp.assert_true(
  (select count(*) from public.marketplace_listings) = 3,
  'seller should retain review access to all of their own marketplace listings'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = 'e4bb2222-2222-4222-8222-222222222222';

select pg_temp.assert_true(
  (select count(*) from public.marketplace_listings) = 1,
  'verified same-neighborhood member should read visible marketplace listings'
);

insert into public.marketplace_pickup_requests (
  listing_id,
  requester_id,
  message,
  general_area,
  proposed_start,
  proposed_end,
  status
)
values (
  'e4300000-0000-4000-8000-000000000001',
  'e4000000-0000-4000-8000-000000000002',
  'Hi, I am interested. Is afternoon pickup possible?',
  'East Legon, general pickup area',
  now() + interval '1 day',
  now() + interval '1 day 1 hour',
  'proposed'
);

select pg_temp.assert_true(
  (select count(*) from public.marketplace_pickup_requests) = 1,
  'requester should read their own marketplace pickup request'
);

select pg_temp.assert_denied(
  $statement$
    insert into public.marketplace_pickup_requests (
      listing_id,
      requester_id,
      message,
      general_area,
      proposed_start,
      proposed_end,
      status
    )
    values (
      'e4300000-0000-4000-8000-000000000002',
      'e4000000-0000-4000-8000-000000000002',
      'I should not be able to request a blocked listing.',
      'East Legon, general pickup area',
      now() + interval '1 day',
      now() + interval '1 day 1 hour',
      'proposed'
    )
  $statement$,
  'verified member must not request a blocked marketplace listing'
);

select pg_temp.assert_denied(
  $statement$
    insert into public.marketplace_pickup_requests (
      listing_id,
      requester_id,
      message,
      general_area,
      proposed_start,
      proposed_end,
      status
    )
    values (
      'e4300000-0000-4000-8000-000000000003',
      'e4000000-0000-4000-8000-000000000002',
      'I should not be able to request a listing that is still under review.',
      'East Legon, general pickup area',
      now() + interval '1 day',
      now() + interval '1 day 1 hour',
      'proposed'
    )
  $statement$,
  'verified member must not request a marketplace listing under review'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = 'e4cc3333-3333-4333-8333-333333333333';

select pg_temp.assert_true(
  (select count(*) from public.marketplace_listings) = 0,
  'verified member from another neighborhood should not read East Legon marketplace listings'
);

select pg_temp.assert_true(
  (select count(*) from public.marketplace_pickup_requests) = 0,
  'non-participant should not read marketplace pickup requests'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = 'e4aa1111-1111-4111-8111-111111111111';

select pg_temp.assert_true(
  (select count(*) from public.marketplace_pickup_requests) = 1,
  'seller should read pickup requests for their own listings'
);

select public.respond_to_marketplace_pickup_request(
  (
    select id
    from public.marketplace_pickup_requests
    where listing_id = 'e4300000-0000-4000-8000-000000000001'
  ),
  'accept',
  null
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.marketplace_pickup_requests
    where listing_id = 'e4300000-0000-4000-8000-000000000001'
      and status = 'accepted'
  ),
  'seller should accept a pickup request'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = 'e4dd4444-4444-4444-8444-444444444444';

select pg_temp.assert_true(
  (select count(*) from public.marketplace_listings) = 3,
  'moderator should read clean, pending, and blocked marketplace listings for review'
);

reset role;

select 'marketplace_core_rls_passed' as result;
