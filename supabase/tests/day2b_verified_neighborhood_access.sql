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

insert into public.profiles (auth_user_id, display_name, role, phone_verified)
values
  ('aaaa1111-1111-4111-8111-111111111111', 'Ama Day2B', 'requester', true),
  ('bbbb2222-2222-4222-8222-222222222222', 'Kofi Day2B', 'requester', true),
  ('cccc3333-3333-4333-8333-333333333333', 'Esi OtherArea', 'requester', true),
  ('dddd4444-4444-4444-8444-444444444444', 'Unverified User', 'requester', true),
  ('eeee5555-5555-4555-8555-555555555555', 'Moderator Ordinary', 'moderator', true)
on conflict (auth_user_id) do update
set display_name = excluded.display_name,
    role = excluded.role,
    phone_verified = excluded.phone_verified;

insert into public.neighborhoods (name, city, country_code, municipality, region)
values
  ('Day2B East Legon', 'Accra', 'GH', 'Ayawaso West', 'Greater Accra'),
  ('Day2B Osu', 'Accra', 'GH', 'Korle Klottey', 'Greater Accra')
on conflict (name, city, country_code) do update
set municipality = excluded.municipality,
    region = excluded.region;

insert into public.neighborhood_boundaries (neighborhood_id, boundary, source)
select n.id,
  st_geomfromtext('POLYGON((-0.190 5.620, -0.140 5.620, -0.140 5.680, -0.190 5.680, -0.190 5.620))', 4326)::geography,
  'day2b_smoke_test'
from public.neighborhoods n
where n.name = 'Day2B East Legon'
  and not exists (
    select 1 from public.neighborhood_boundaries nb
    where nb.neighborhood_id = n.id
      and nb.source = 'day2b_smoke_test'
  );

insert into public.neighborhood_boundaries (neighborhood_id, boundary, source)
select n.id,
  st_geomfromtext('POLYGON((-0.205 5.540, -0.170 5.540, -0.170 5.570, -0.205 5.570, -0.205 5.540))', 4326)::geography,
  'day2b_smoke_test'
from public.neighborhoods n
where n.name = 'Day2B Osu'
  and not exists (
    select 1 from public.neighborhood_boundaries nb
    where nb.neighborhood_id = n.id
      and nb.source = 'day2b_smoke_test'
  );

set role authenticated;
set request.jwt.claim.sub = 'aaaa1111-1111-4111-8111-111111111111';

create temporary table day2b_test_ids (
  key text primary key,
  value uuid not null
);

select pg_temp.assert_true(
  public.complete_test_identity_assurance('Ama', 'Mensah') = public.current_profile_id(),
  'test-mode identity assurance should complete for the signed-in user'
);

select pg_temp.assert_true(
  (select count(*) from public.private_identity_profiles) = 1,
  'user should read only their own identity assurance summary'
);

select pg_temp.assert_denied(
  'select legal_given_name from public.private_identity_profiles',
  'ordinary client grants must not expose legal_given_name'
);

insert into public.profile_location_preferences (profile_id, hide_map_location, show_neighborhood_name, show_neighborhood_only)
select id, true, true, true
from public.profiles
where auth_user_id = 'aaaa1111-1111-4111-8111-111111111111'
on conflict (profile_id) do update
set hide_map_location = excluded.hide_map_location,
    show_neighborhood_name = excluded.show_neighborhood_name,
    show_neighborhood_only = excluded.show_neighborhood_only;

insert into public.private_addresses (
  profile_id,
  original_entry,
  house_number_or_description,
  street_or_road,
  landmark,
  area,
  neighborhood_text,
  district_or_municipality,
  ghana_post_gps,
  provider_name,
  provider_place_id,
  normalized_latitude,
  normalized_longitude,
  normalized_point,
  user_confirmed_latitude,
  user_confirmed_longitude,
  user_confirmed_point
)
select
  id,
  'Private test house near Lagos Avenue, East Legon',
  'Private test house',
  'Lagos Avenue',
  'Near a test landmark',
  'East Legon',
  'Day2B East Legon',
  'Ayawaso West',
  'GA-000-0000',
  'test_provider',
  'test-east-legon-place',
  5.650000,
  -0.165000,
  st_setsrid(st_makepoint(-0.165000, 5.650000), 4326)::geography,
  5.650500,
  -0.165500,
  st_setsrid(st_makepoint(-0.165500, 5.650500), 4326)::geography
from public.profiles
where auth_user_id = 'aaaa1111-1111-4111-8111-111111111111';

select pg_temp.assert_denied(
  'select ghana_post_gps from public.private_addresses',
  'ordinary client grants must not expose GhanaPost GPS'
);

select pg_temp.assert_denied(
  'select normalized_latitude from public.private_addresses',
  'ordinary client grants must not expose exact normalized latitude'
);

insert into public.location_verification_attempts (
  address_id,
  profile_id,
  status,
  distance_meters,
  accuracy_radius_meters,
  device_location_available,
  permission_granted
)
select pa.id, pa.profile_id, 'passed', 72.5, 35.0, true, true
from public.private_addresses pa
join public.profiles p on p.id = pa.profile_id
where p.auth_user_id = 'aaaa1111-1111-4111-8111-111111111111'
  and pa.is_current = true;

select pg_temp.assert_denied(
  'select distance_meters from public.location_verification_attempts',
  'ordinary users must not read raw location-check data'
);

insert into day2b_test_ids(key, value)
select 'ama_challenge_id',
  public.create_test_residence_challenge(
    (
      select pa.id
      from public.private_addresses pa
      join public.profiles p on p.id = pa.profile_id
      where p.auth_user_id = 'aaaa1111-1111-4111-8111-111111111111'
        and pa.is_current = true
      limit 1
    ),
    'MC2A26'
  );

select pg_temp.assert_true(
  exists (select 1 from day2b_test_ids where key = 'ama_challenge_id'),
  'user should create a test postcard challenge for their own current address'
);

select pg_temp.assert_denied(
  'select code_hash from public.residence_challenges',
  'ordinary client grants must not expose postcard code hashes'
);

select pg_temp.assert_true(
  public.verify_test_residence_challenge(
    (
      select value from day2b_test_ids where key = 'ama_challenge_id'
    ),
    'mc2a26'
  ) = (
    select id from public.neighborhoods where name = 'Day2B East Legon'
  ),
  'valid test postcard code should assign the correct neighborhood'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.neighborhood_memberships nm
    join public.neighborhoods n on n.id = nm.neighborhood_id
    where nm.status = 'verified'
      and n.name = 'Day2B East Legon'
  ),
  'verified neighborhood membership should unlock after postcard verification'
);

select pg_temp.assert_denied(
  format(
    'select public.verify_test_residence_challenge(%L::uuid, %L)',
    (
      select value from day2b_test_ids where key = 'ama_challenge_id'
    ),
    'MC2A26'
  ),
  'consumed postcard challenge must not be reusable'
);

select pg_temp.assert_true(
  public.create_private_neighborhood_post(
    'Water pressure this evening',
    'Has anyone else around East Legon noticed low water pressure tonight?'
  ) is not null,
  'verified member should create a private neighborhood post'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.community_posts
    where title = 'Water pressure this evening'
  ),
  'verified member should read posts in their own neighborhood'
);

select pg_temp.assert_true(
  true,
  'audit event creation is checked after reset role'
);

select pg_temp.assert_denied(
  'select action from public.audit_events',
  'ordinary users should not read audit events through client APIs'
);

select pg_temp.assert_denied(
  'update public.audit_events set action = action',
  'ordinary users must not edit audit events'
);

select pg_temp.assert_true(
  not exists (
    select 1
    from public.public_community_profiles
    where public_display_name = 'Ama M.'
      and visible_neighborhood_name is not null
  ),
  'masked public profile should not expose exact or map-visible location when hidden'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = 'bbbb2222-2222-4222-8222-222222222222';

select public.complete_test_identity_assurance('Kofi', 'Owusu');

insert into public.private_addresses (
  profile_id,
  original_entry,
  area,
  neighborhood_text,
  district_or_municipality,
  provider_name,
  user_confirmed_latitude,
  user_confirmed_longitude,
  user_confirmed_point
)
select
  id,
  'Another private test house near East Legon',
  'East Legon',
  'Day2B East Legon',
  'Ayawaso West',
  'test_provider',
  5.651000,
  -0.166000,
  st_setsrid(st_makepoint(-0.166000, 5.651000), 4326)::geography
from public.profiles
where auth_user_id = 'bbbb2222-2222-4222-8222-222222222222';

insert into day2b_test_ids(key, value)
select 'kofi_challenge_id',
  public.create_test_residence_challenge(
  (
    select pa.id
    from public.private_addresses pa
    join public.profiles p on p.id = pa.profile_id
    where p.auth_user_id = 'bbbb2222-2222-4222-8222-222222222222'
      and pa.is_current = true
    limit 1
  ),
  'KP2A26'
);

select public.verify_test_residence_challenge(
  (
    select value from day2b_test_ids where key = 'kofi_challenge_id'
  ),
  'KP2A26'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.community_posts
    where title = 'Water pressure this evening'
  ),
  'another verified member of the same neighborhood should read the post'
);

select pg_temp.assert_true(
  (select count(*) from public.private_identity_profiles) = 1,
  'verified member should not read another person legal identity profile'
);

select pg_temp.assert_true(
  (select count(*) from public.private_addresses) = 1,
  'verified member should not read another person private address'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = 'cccc3333-3333-4333-8333-333333333333';

select public.complete_test_identity_assurance('Esi', 'Asare');

insert into public.private_addresses (
  profile_id,
  original_entry,
  area,
  neighborhood_text,
  district_or_municipality,
  provider_name,
  user_confirmed_latitude,
  user_confirmed_longitude,
  user_confirmed_point
)
select
  id,
  'Private test house in Osu',
  'Osu',
  'Day2B Osu',
  'Korle Klottey',
  'test_provider',
  5.555000,
  -0.188000,
  st_setsrid(st_makepoint(-0.188000, 5.555000), 4326)::geography
from public.profiles
where auth_user_id = 'cccc3333-3333-4333-8333-333333333333';

insert into day2b_test_ids(key, value)
select 'esi_challenge_id',
  public.create_test_residence_challenge(
  (
    select pa.id
    from public.private_addresses pa
    join public.profiles p on p.id = pa.profile_id
    where p.auth_user_id = 'cccc3333-3333-4333-8333-333333333333'
      and pa.is_current = true
    limit 1
  ),
  'ES2A26'
);

select public.verify_test_residence_challenge(
  (
    select value from day2b_test_ids where key = 'esi_challenge_id'
  ),
  'ES2A26'
);

select pg_temp.assert_true(
  not exists (
    select 1
    from public.community_posts
    where title = 'Water pressure this evening'
  ),
  'verified user from another neighborhood must not read ordinary local posts'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = 'dddd4444-4444-4444-8444-444444444444';

select pg_temp.assert_true(
  not exists (
    select 1
    from public.community_posts
    where title = 'Water pressure this evening'
  ),
  'unverified user must not read private neighborhood posts'
);

select pg_temp.assert_denied(
  $$insert into public.community_posts(title, body)
    values ('Trying direct post', 'This should fail because the user is unverified.')$$,
  'unverified user must not create private neighborhood posts by direct API call'
);

select pg_temp.assert_denied(
  $$select public.create_private_neighborhood_post('Trying function post', 'This should fail because the user is unverified.')$$,
  'unverified user must not create private neighborhood posts through server function'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = 'aaaa1111-1111-4111-8111-111111111111';

select pg_temp.assert_denied(
  format(
    'update public.neighborhood_memberships set neighborhood_id = %L where profile_id = public.current_profile_id()',
    (select id::text from public.neighborhoods where name = 'Day2B Osu')
  ),
  'users must not alter their verified neighborhood identifier'
);

update public.private_addresses
set is_current = false
where profile_id = public.current_profile_id()
  and is_current = true;

select pg_temp.assert_true(
  exists (
    select 1
    from public.neighborhood_memberships
    where profile_id = public.current_profile_id()
      and status = 'requires_reverification'
      and reverification_reason = 'address_changed'
  ),
  'address changes should place verified membership into re-verification'
);

select pg_temp.assert_true(
  not exists (
    select 1
    from public.community_posts
    where title = 'Water pressure this evening'
  ),
  'member requiring re-verification should lose private feed access'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = 'eeee5555-5555-4555-8555-555555555555';

select pg_temp.assert_true(
  (select count(*) from public.private_identity_profiles) = 0,
  'ordinary moderator role must not access identity evidence without explicit policy'
);

select pg_temp.assert_true(
  (select count(*) from public.private_addresses) = 0,
  'ordinary moderator role must not access private addresses without explicit policy'
);

reset role;

select pg_temp.assert_true(
  exists (
    select 1
    from public.audit_events
    where action = 'membership_reverification_required'
  ),
  'address-change re-verification should create an audit event'
);

select 'day2b_verified_neighborhood_access_passed' as result;
