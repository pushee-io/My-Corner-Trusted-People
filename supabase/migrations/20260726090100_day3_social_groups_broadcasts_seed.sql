-- Fictional Day 3 community seed data for live Supabase read-mode validation.
-- Uses broad neighborhood/cluster metadata only. No exact addresses, phone numbers, emails, GPS, or private user data.

insert into public.neighborhood_clusters (
  id,
  name,
  region_id
)
values (
  '11111111-1111-4111-8111-111111111111',
  'Accra East',
  'greater-accra'
)
on conflict (id) do update
set
  name = excluded.name,
  region_id = excluded.region_id,
  updated_at = now();
insert into public.neighborhoods (
  id,
  name,
  city,
  region
)
values (
  '90ac8954-e9ca-467f-8a2e-de7eecbd5422',
  'East Legon',
  'Accra',
  'Greater Accra'
)
on conflict (id) do update
set
  name = excluded.name,
  city = excluded.city,
  region = excluded.region;

insert into public.neighborhood_cluster_members (
  cluster_id,
  neighborhood_id
)
values (
  '11111111-1111-4111-8111-111111111111',
  '90ac8954-e9ca-467f-8a2e-de7eecbd5422'
)
on conflict (cluster_id, neighborhood_id) do nothing;
insert into public.profiles (
  id,
  auth_user_id,
  display_name,
  role,
  phone_verified,
  locale,
  timezone
)
values (
  '8b569954-ff71-46ff-bd61-ae33def50917',
  '8b569954-ff71-46ff-bd61-ae33def50917',
  'Akosua M.',
  'requester',
  true,
  'en-GH',
  'Africa/Accra'
)
on conflict (id) do update
set
  auth_user_id = excluded.auth_user_id,
  display_name = excluded.display_name,
  role = excluded.role,
  phone_verified = excluded.phone_verified,
  locale = excluded.locale,
  timezone = excluded.timezone;
insert into public.neighborhood_memberships (
  profile_id,
  neighborhood_id,
  is_primary,
  status,
  verified_at,
  ended_at,
  verification_expires_at
)
values (
  '8b569954-ff71-46ff-bd61-ae33def50917',
  '90ac8954-e9ca-467f-8a2e-de7eecbd5422',
  true,
  'verified',
  now(),
  null,
  null
)
on conflict do nothing;

insert into public.social_groups (
  id,
  name,
  description,
  neighborhood_id,
  cluster_id,
  visibility,
  member_count,
  created_by_profile_id,
  moderation_status
)
values
  (
    '22222222-2222-4222-8222-222222222221',
    'East Legon repair tips',
    'Private neighborhood group for repair tips and provider recommendations.',
    '90ac8954-e9ca-467f-8a2e-de7eecbd5422',
    '11111111-1111-4111-8111-111111111111',
    'verified_neighborhood_members',
    1,
    '8b569954-ff71-46ff-bd61-ae33def50917',
    'clean'
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'Accra East water updates',
    'Cluster group for verified residents comparing local utility updates.',
    '90ac8954-e9ca-467f-8a2e-de7eecbd5422',
    '11111111-1111-4111-8111-111111111111',
    'immediate_cluster_members',
    1,
    '8b569954-ff71-46ff-bd61-ae33def50917',
    'clean'
  )
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  neighborhood_id = excluded.neighborhood_id,
  cluster_id = excluded.cluster_id,
  visibility = excluded.visibility,
  member_count = excluded.member_count,
  moderation_status = excluded.moderation_status,
  updated_at = now();

insert into public.social_group_memberships (
  id,
  group_id,
  profile_id,
  role,
  status,
  joined_at
)
values
  (
    '33333333-3333-4333-8333-333333333331',
    '22222222-2222-4222-8222-222222222221',
    '8b569954-ff71-46ff-bd61-ae33def50917',
    'member',
    'accepted',
    now()
  ),
  (
    '33333333-3333-4333-8333-333333333332',
    '22222222-2222-4222-8222-222222222222',
    '8b569954-ff71-46ff-bd61-ae33def50917',
    'member',
    'accepted',
    now()
  )
on conflict (id) do update
set
  role = excluded.role,
  status = excluded.status,
  joined_at = excluded.joined_at,
  updated_at = now();

insert into public.social_group_posts (
  id,
  group_id,
  author_profile_id,
  body,
  moderation_status
)
values (
  '44444444-4444-4444-8444-444444444441',
  '22222222-2222-4222-8222-222222222221',
  '8b569954-ff71-46ff-bd61-ae33def50917',
  'Please share electrician recommendations that have helped in East Legon.',
  'clean'
)
on conflict (id) do update
set
  body = excluded.body,
  moderation_status = excluded.moderation_status,
  updated_at = now();

insert into public.agency_broadcasts (
  id,
  agency_name,
  title,
  body,
  scope,
  neighborhood_id,
  cluster_id,
  region_id,
  is_agency_approved,
  moderation_status,
  published_at,
  created_by_profile_id,
  approved_by_profile_id,
  approved_at
)
values
  (
    '55555555-5555-4555-8555-555555555551',
    'Accra Roads Desk',
    'East Legon road works notice',
    'Approved maintenance notice for roads around East Legon this weekend.',
    'greater_accra',
    null,
    null,
    'greater-accra',
    true,
    'clean',
    now(),
    '8b569954-ff71-46ff-bd61-ae33def50917',
    '8b569954-ff71-46ff-bd61-ae33def50917',
    now()
  ),
  (
    '55555555-5555-4555-8555-555555555552',
    'Ghana Water Help Desk',
    'Accra East water pressure update',
    'Temporary low pressure is expected in parts of Accra East.',
    'immediate_cluster',
    null,
    '11111111-1111-4111-8111-111111111111',
    'greater-accra',
    true,
    'clean',
    now(),
    '8b569954-ff71-46ff-bd61-ae33def50917',
    '8b569954-ff71-46ff-bd61-ae33def50917',
    now()
  )
on conflict (id) do update
set
  agency_name = excluded.agency_name,
  title = excluded.title,
  body = excluded.body,
  scope = excluded.scope,
  neighborhood_id = excluded.neighborhood_id,
  cluster_id = excluded.cluster_id,
  region_id = excluded.region_id,
  is_agency_approved = excluded.is_agency_approved,
  moderation_status = excluded.moderation_status,
  published_at = excluded.published_at,
  updated_at = now();
