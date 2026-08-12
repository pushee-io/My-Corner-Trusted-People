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

delete from public.social_group_posts
where group_id in (
  'd3300000-0000-4000-8000-000000000001',
  'd3300000-0000-4000-8000-000000000002',
  'd3300000-0000-4000-8000-000000000003'
);

delete from public.social_group_memberships
where group_id in (
  'd3300000-0000-4000-8000-000000000001',
  'd3300000-0000-4000-8000-000000000002',
  'd3300000-0000-4000-8000-000000000003'
);

delete from public.social_groups
where id in (
  'd3300000-0000-4000-8000-000000000001',
  'd3300000-0000-4000-8000-000000000002',
  'd3300000-0000-4000-8000-000000000003'
);

delete from public.agency_broadcasts
where id in (
  'd3400000-0000-4000-8000-000000000001',
  'd3400000-0000-4000-8000-000000000002'
);

delete from public.neighborhood_cluster_members
where cluster_id in (
  'd3200000-0000-4000-8000-000000000001',
  'd3200000-0000-4000-8000-000000000002'
);

delete from public.neighborhood_clusters
where id in (
  'd3200000-0000-4000-8000-000000000001',
  'd3200000-0000-4000-8000-000000000002'
);

delete from public.neighborhoods
where id in (
  'd3100000-0000-4000-8000-000000000001',
  'd3100000-0000-4000-8000-000000000002'
);

delete from public.profiles
where id in (
  'd3000000-0000-4000-8000-000000000001',
  'd3000000-0000-4000-8000-000000000002',
  'd3000000-0000-4000-8000-000000000003',
  'd3000000-0000-4000-8000-000000000004'
);

insert into public.profiles (id, auth_user_id, display_name, role, phone_verified)
values
  ('d3000000-0000-4000-8000-000000000001', 'd3aa1111-1111-4111-8111-111111111111', 'Day3 Ama', 'requester', true),
  ('d3000000-0000-4000-8000-000000000002', 'd3bb2222-2222-4222-8222-222222222222', 'Day3 Esi', 'requester', true),
  ('d3000000-0000-4000-8000-000000000003', 'd3cc3333-3333-4333-8333-333333333333', 'Day3 Unverified', 'requester', true),
  ('d3000000-0000-4000-8000-000000000004', 'd3dd4444-4444-4444-8444-444444444444', 'Day3 Moderator', 'moderator', true)
on conflict (id) do update
set auth_user_id = excluded.auth_user_id,
    display_name = excluded.display_name,
    role = excluded.role,
    phone_verified = excluded.phone_verified;

insert into public.neighborhoods (id, name, city, country_code, municipality, region)
values
  ('d3100000-0000-4000-8000-000000000001', 'Day3 East Legon', 'Accra', 'GH', 'Ayawaso West', 'Greater Accra'),
  ('d3100000-0000-4000-8000-000000000002', 'Day3 Osu', 'Accra', 'GH', 'Korle Klottey', 'Greater Accra')
on conflict (id) do update
set name = excluded.name,
    city = excluded.city,
    country_code = excluded.country_code,
    municipality = excluded.municipality,
    region = excluded.region;

insert into public.neighborhood_clusters (id, name, city, region)
values
  ('d3200000-0000-4000-8000-000000000001', 'Day3 Accra East', 'Accra', 'Greater Accra'),
  ('d3200000-0000-4000-8000-000000000002', 'Day3 Accra Central', 'Accra', 'Greater Accra')
on conflict (id) do update
set name = excluded.name,
    city = excluded.city,
    region = excluded.region;

insert into public.neighborhood_cluster_members (cluster_id, neighborhood_id)
values
  ('d3200000-0000-4000-8000-000000000001', 'd3100000-0000-4000-8000-000000000001'),
  ('d3200000-0000-4000-8000-000000000002', 'd3100000-0000-4000-8000-000000000002')
on conflict (cluster_id, neighborhood_id) do nothing;

insert into public.neighborhood_memberships (
  profile_id,
  neighborhood_id,
  is_primary,
  status,
  verification_method,
  verified_at,
  verification_expires_at,
  ended_at
)
values
  (
    'd3000000-0000-4000-8000-000000000001',
    'd3100000-0000-4000-8000-000000000001',
    true,
    'verified',
    'admin_seed',
    now(),
    now() + interval '1 year',
    null
  ),
  (
    'd3000000-0000-4000-8000-000000000002',
    'd3100000-0000-4000-8000-000000000002',
    true,
    'verified',
    'admin_seed',
    now(),
    now() + interval '1 year',
    null
  )
on conflict (profile_id, neighborhood_id) do update
set is_primary = excluded.is_primary,
    status = excluded.status,
    verification_method = excluded.verification_method,
    verified_at = excluded.verified_at,
    verification_expires_at = excluded.verification_expires_at,
    ended_at = excluded.ended_at;

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
    'd3300000-0000-4000-8000-000000000001',
    'Day3 East Legon repair tips',
    'Private neighborhood group for repair tips and provider recommendations.',
    'd3100000-0000-4000-8000-000000000001',
    'd3200000-0000-4000-8000-000000000001',
    'verified_neighborhood_members',
    24,
    'd3000000-0000-4000-8000-000000000001',
    'clean'
  ),
  (
    'd3300000-0000-4000-8000-000000000002',
    'Day3 Accra East water updates',
    'Immediate cluster group for verified residents comparing utility updates.',
    'd3100000-0000-4000-8000-000000000001',
    'd3200000-0000-4000-8000-000000000001',
    'immediate_cluster_members',
    71,
    'd3000000-0000-4000-8000-000000000001',
    'clean'
  ),
  (
    'd3300000-0000-4000-8000-000000000003',
    'Day3 Osu trader tips',
    'Private neighborhood group for Osu recommendations.',
    'd3100000-0000-4000-8000-000000000002',
    'd3200000-0000-4000-8000-000000000002',
    'verified_neighborhood_members',
    18,
    'd3000000-0000-4000-8000-000000000002',
    'clean'
  ),
  (
    'd3300000-0000-4000-8000-000000000004',
    'Day3 hidden spam group',
    'Blocked content should not be visible.',
    'd3100000-0000-4000-8000-000000000001',
    'd3200000-0000-4000-8000-000000000001',
    'verified_neighborhood_members',
    2,
    'd3000000-0000-4000-8000-000000000001',
    'blocked'
  )
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    neighborhood_id = excluded.neighborhood_id,
    cluster_id = excluded.cluster_id,
    visibility = excluded.visibility,
    member_count = excluded.member_count,
    created_by_profile_id = excluded.created_by_profile_id,
    moderation_status = excluded.moderation_status;

insert into public.social_group_memberships (id, group_id, profile_id, role, status, joined_at)
values
  (
    'd3400000-0000-4000-8000-000000000001',
    'd3300000-0000-4000-8000-000000000001',
    'd3000000-0000-4000-8000-000000000001',
    'member',
    'accepted',
    now()
  ),
  (
    'd3400000-0000-4000-8000-000000000002',
    'd3300000-0000-4000-8000-000000000002',
    'd3000000-0000-4000-8000-000000000001',
    'member',
    'accepted',
    now()
  ),
  (
    'd3400000-0000-4000-8000-000000000003',
    'd3300000-0000-4000-8000-000000000003',
    'd3000000-0000-4000-8000-000000000001',
    'member',
    'pending',
    null
  )
on conflict (group_id, profile_id) do update
set role = excluded.role,
    status = excluded.status,
    joined_at = excluded.joined_at;

insert into public.social_group_posts (id, group_id, author_profile_id, body, moderation_status)
values
  (
    'd3500000-0000-4000-8000-000000000001',
    'd3300000-0000-4000-8000-000000000001',
    'd3000000-0000-4000-8000-000000000001',
    'Please share electrician recommendations that have helped in East Legon.',
    'clean'
  ),
  (
    'd3500000-0000-4000-8000-000000000002',
    'd3300000-0000-4000-8000-000000000001',
    'd3000000-0000-4000-8000-000000000001',
    'Blocked group post.',
    'blocked'
  )
on conflict (id) do update
set group_id = excluded.group_id,
    author_profile_id = excluded.author_profile_id,
    body = excluded.body,
    moderation_status = excluded.moderation_status;

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
  created_by_profile_id,
  approved_by_profile_id,
  approved_at
)
values
  (
    'd3600000-0000-4000-8000-000000000001',
    'Accra Roads Desk',
    'Day3 road works notice',
    'Approved maintenance notice for roads around East Legon this weekend.',
    'greater_accra',
    null,
    null,
    'greater-accra',
    true,
    'clean',
    'd3000000-0000-4000-8000-000000000004',
    'd3000000-0000-4000-8000-000000000004',
    now()
  ),
  (
    'd3600000-0000-4000-8000-000000000002',
    'Ghana Water Help Desk',
    'Day3 Accra East water pressure update',
    'Temporary low pressure is expected in parts of Accra East.',
    'immediate_cluster',
    null,
    'd3200000-0000-4000-8000-000000000001',
    'greater-accra',
    true,
    'clean',
    'd3000000-0000-4000-8000-000000000004',
    'd3000000-0000-4000-8000-000000000004',
    now()
  ),
  (
    'd3600000-0000-4000-8000-000000000003',
    'Unverified Desk',
    'Day3 unapproved regional notice',
    'This should not appear until agency approval is complete.',
    'greater_accra',
    null,
    null,
    'greater-accra',
    false,
    'clean',
    'd3000000-0000-4000-8000-000000000004',
    null,
    null
  ),
  (
    'd3600000-0000-4000-8000-000000000004',
    'Blocked Desk',
    'Day3 blocked regional notice',
    'Blocked agency broadcast should not appear.',
    'greater_accra',
    null,
    null,
    'greater-accra',
    true,
    'blocked',
    'd3000000-0000-4000-8000-000000000004',
    'd3000000-0000-4000-8000-000000000004',
    now()
  )
on conflict (id) do update
set agency_name = excluded.agency_name,
    title = excluded.title,
    body = excluded.body,
    scope = excluded.scope,
    neighborhood_id = excluded.neighborhood_id,
    cluster_id = excluded.cluster_id,
    region_id = excluded.region_id,
    is_agency_approved = excluded.is_agency_approved,
    moderation_status = excluded.moderation_status,
    created_by_profile_id = excluded.created_by_profile_id,
    approved_by_profile_id = excluded.approved_by_profile_id,
    approved_at = excluded.approved_at;

reset role;
set role authenticated;
set request.jwt.claim.sub = 'd3aa1111-1111-4111-8111-111111111111';

select pg_temp.assert_true(
  (select coalesce(array_agg(id order by id), '{}'::uuid[]) from public.social_groups) = array[
    'd3300000-0000-4000-8000-000000000001'::uuid,
    'd3300000-0000-4000-8000-000000000002'::uuid
  ],
  'verified East Legon member should read only local and immediate-cluster groups'
);

select pg_temp.assert_true(
  (select coalesce(array_agg(id order by id), '{}'::uuid[]) from public.social_group_posts) = array[
    'd3500000-0000-4000-8000-000000000001'::uuid
  ],
  'accepted group member should read only non-blocked posts in accepted visible groups'
);

insert into public.social_group_posts (group_id, author_profile_id, body, moderation_status)
values (
  'd3300000-0000-4000-8000-000000000001',
  public.current_profile_id(),
  'Who can repair a water pump this week?',
  'not_run'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.social_group_posts
    where body = 'Who can repair a water pump this week?'
      and moderation_status = 'not_run'
  ),
  'accepted group member should create pending-moderation group posts'
);

select pg_temp.assert_denied(
  $$insert into public.social_group_posts (group_id, author_profile_id, body, moderation_status)
    values ('d3300000-0000-4000-8000-000000000003', public.current_profile_id(), 'Can I post before approval?', 'not_run')$$,
  'pending or non-visible group membership must not allow group post creation'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.agency_broadcasts
    where id = 'd3600000-0000-4000-8000-000000000001'
  )
  and exists (
    select 1
    from public.agency_broadcasts
    where id = 'd3600000-0000-4000-8000-000000000002'
  )
  and not exists (
    select 1
    from public.agency_broadcasts
    where id in (
      'd3600000-0000-4000-8000-000000000003',
      'd3600000-0000-4000-8000-000000000004'
    )
  ),
  'verified East Legon member should read approved regional and matching cluster broadcasts only'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = 'd3bb2222-2222-4222-8222-222222222222';

select pg_temp.assert_true(
  (select coalesce(array_agg(id order by id), '{}'::uuid[]) from public.social_groups) = array[
    'd3300000-0000-4000-8000-000000000003'::uuid
  ],
  'verified Osu member should not read East Legon-only or Accra East cluster groups'
);

select pg_temp.assert_true(
  not exists (select 1 from public.social_group_posts),
  'verified non-member should not read group posts without accepted group membership'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = 'd3cc3333-3333-4333-8333-333333333333';

select pg_temp.assert_true(
  not exists (select 1 from public.social_groups),
  'unverified user should not read social groups'
);

select pg_temp.assert_true(
  not exists (select 1 from public.agency_broadcasts),
  'unverified user should not read agency broadcasts'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = 'd3bb2222-2222-4222-8222-222222222222';

select pg_temp.assert_true(
  (
    select requested.status = 'pending' and requested.created
    from public.request_social_group_membership('d3300000-0000-4000-8000-000000000003') requested
  ),
  'verified resident should create a pending membership through the authenticated RPC'
);

select pg_temp.assert_true(
  (
    select requested.status = 'pending' and not requested.created
    from public.request_social_group_membership('d3300000-0000-4000-8000-000000000003') requested
  ),
  'repeated request while pending should be idempotent'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = 'd3dd4444-4444-4444-8444-444444444444';

select pg_temp.assert_true(
  exists (
    select 1
    from public.list_pending_social_group_memberships() request
    where request.group_id = 'd3300000-0000-4000-8000-000000000003'
      and request.profile_id = 'd3000000-0000-4000-8000-000000000002'
  ),
  'moderator should see the pending membership request'
);

select pg_temp.assert_true(
  (
    select decision.status = 'rejected' and decision.accepted
    from public.decide_social_group_membership(
      (
        select membership.id
        from public.social_group_memberships membership
        where membership.group_id = 'd3300000-0000-4000-8000-000000000003'
          and membership.profile_id = 'd3000000-0000-4000-8000-000000000002'
      ),
      'rejected'
    ) decision
  ),
  'moderator should reject a pending membership'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = 'd3bb2222-2222-4222-8222-222222222222';

select pg_temp.assert_true(
  (
    select requested.status = 'pending' and requested.created
    from public.request_social_group_membership('d3300000-0000-4000-8000-000000000003') requested
  ),
  'rejected applicant should be able to retry and return to pending'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = 'd3dd4444-4444-4444-8444-444444444444';

select pg_temp.assert_true(
  (
    select decision.status = 'accepted' and decision.accepted
    from public.decide_social_group_membership(
      (
        select membership.id
        from public.social_group_memberships membership
        where membership.group_id = 'd3300000-0000-4000-8000-000000000003'
          and membership.profile_id = 'd3000000-0000-4000-8000-000000000002'
      ),
      'accepted'
    ) decision
  ),
  'moderator should accept a retried pending membership'
);

select pg_temp.assert_true(
  (
    select not decision.accepted
    from public.decide_social_group_membership(
      (
        select membership.id
        from public.social_group_memberships membership
        where membership.group_id = 'd3300000-0000-4000-8000-000000000003'
          and membership.profile_id = 'd3000000-0000-4000-8000-000000000002'
      ),
      'accepted'
    ) decision
  ),
  'duplicate moderator decision should not be applied twice'
);

select pg_temp.assert_true(
  (
    select social_group.member_count
    from public.social_groups social_group
    where social_group.id = 'd3300000-0000-4000-8000-000000000003'
  ) = 19,
  'member count should increase exactly once after acceptance'
);

select pg_temp.assert_true(
  (
    select array_agg(event.event_type order by event.created_at, event.event_type)
    from public.social_group_membership_events event
    where event.group_id = 'd3300000-0000-4000-8000-000000000003'
      and event.profile_id = 'd3000000-0000-4000-8000-000000000002'
  ) = array['requested', 'rejected', 're_requested', 'accepted'],
  'membership workflow should retain its request and decision audit trail'
);

reset role;

select 'day3_social_groups_broadcasts_passed' as result;
