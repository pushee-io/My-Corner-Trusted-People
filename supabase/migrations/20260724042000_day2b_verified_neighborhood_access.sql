create type public.identity_assurance_status as enum ('not_started', 'in_review', 'approved_test_mode', 'rejected', 'expired');
create type public.residence_verification_status as enum ('not_started', 'pending', 'verified', 'requires_reverification', 'expired', 'revoked', 'manual_review_required');
create type public.residence_challenge_status as enum ('created', 'delivery_pending', 'delivered', 'code_entered', 'verified', 'expired', 'too_many_attempts', 'cancelled', 'manual_review_required');
create type public.location_check_status as enum ('not_run', 'passed', 'failed', 'unavailable', 'permission_denied', 'manual_review_required');
create type public.feed_audience_type as enum ('private_neighborhood', 'immediate_cluster', 'interest_group', 'marketplace_neighborhood', 'marketplace_immediate_cluster', 'verified_agency_target_area', 'greater_accra_approved_regional', 'direct_message_participants');
create type public.community_post_status as enum ('draft', 'published', 'removed', 'reported');
create type public.membership_verification_method as enum ('test_postcard', 'manual_review', 'identity_provider', 'admin_seed');

alter table public.neighborhoods
  add column if not exists municipality text,
  add column if not exists region text not null default 'Greater Accra',
  add column if not exists country_subdivision_code text not null default 'GH-AA',
  add column if not exists is_private_feed_enabled boolean not null default true;

alter table public.neighborhood_memberships
  add column if not exists id uuid default gen_random_uuid(),
  add column if not exists status public.residence_verification_status not null default 'not_started',
  add column if not exists verification_method public.membership_verification_method,
  add column if not exists verified_at timestamptz,
  add column if not exists verification_expires_at timestamptz,
  add column if not exists ended_at timestamptz,
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists reverification_required_at timestamptz,
  add column if not exists reverification_reason text;

create unique index if not exists neighborhood_memberships_id_key on public.neighborhood_memberships(id);
create unique index if not exists one_primary_verified_neighborhood_per_profile
  on public.neighborhood_memberships(profile_id)
  where is_primary = true and status = 'verified' and ended_at is null;

create trigger set_neighborhood_memberships_updated_at
before update on public.neighborhood_memberships
for each row
execute function public.set_updated_at();

create table public.private_identity_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  legal_given_name text not null,
  legal_family_name text not null,
  public_display_name text not null,
  assurance_status public.identity_assurance_status not null default 'not_started',
  assurance_level text not null default 'test_mode_resident',
  assurance_provider text not null default 'manual_test_mode',
  assurance_method text not null default 'manual_biometrics_policy_no_ghana_card',
  assurance_reference text,
  assurance_reviewed_by uuid references public.profiles(id) on delete set null,
  assurance_reviewed_at timestamptz,
  assurance_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_private_identity_profiles_updated_at
before update on public.private_identity_profiles
for each row
execute function public.set_updated_at();

create table public.identity_assurance_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  provider text not null,
  method text not null,
  result public.identity_assurance_status not null,
  reason text,
  evidence_reference text,
  public_note text,
  created_at timestamptz not null default now()
);

create table public.private_addresses (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  original_entry text not null,
  house_number_or_description text,
  street_or_road text,
  landmark text,
  area text,
  neighborhood_text text,
  district_or_municipality text,
  region text not null default 'Greater Accra',
  country_code text not null default 'GH',
  ghana_post_gps text,
  provider_name text not null default 'test_provider',
  provider_place_id text,
  normalized_latitude numeric(9,6),
  normalized_longitude numeric(9,6),
  normalized_point geography(point, 4326),
  user_confirmed_latitude numeric(9,6),
  user_confirmed_longitude numeric(9,6),
  user_confirmed_point geography(point, 4326),
  assigned_neighborhood_id uuid references public.neighborhoods(id) on delete set null,
  verification_status public.residence_verification_status not null default 'pending',
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (normalized_latitude is null and normalized_longitude is null)
    or (normalized_latitude between -90 and 90 and normalized_longitude between -180 and 180)
  ),
  check (
    (user_confirmed_latitude is null and user_confirmed_longitude is null)
    or (user_confirmed_latitude between -90 and 90 and user_confirmed_longitude between -180 and 180)
  )
);

create index private_addresses_profile_current_idx on public.private_addresses(profile_id, is_current);
create index private_addresses_assigned_neighborhood_idx on public.private_addresses(assigned_neighborhood_id);

create trigger set_private_addresses_updated_at
before update on public.private_addresses
for each row
execute function public.set_updated_at();

create table public.address_normalization_events (
  id uuid primary key default gen_random_uuid(),
  address_id uuid references public.private_addresses(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  provider_name text not null,
  status text not null,
  accuracy_level text,
  failure_reason text,
  retained_payload jsonb,
  created_at timestamptz not null default now()
);

create table public.location_verification_attempts (
  id uuid primary key default gen_random_uuid(),
  address_id uuid references public.private_addresses(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  status public.location_check_status not null,
  distance_meters numeric(10,2),
  accuracy_radius_meters numeric(10,2),
  checked_at timestamptz not null default now(),
  device_location_available boolean not null default false,
  permission_granted boolean not null default false,
  attempt_count int not null default 1,
  review_reason text
);

create table public.residence_challenges (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  address_id uuid references public.private_addresses(id) on delete cascade,
  challenge_type text not null default 'test_postcard',
  code_hash text not null,
  code_salt text not null default encode(gen_random_bytes(16), 'hex'),
  status public.residence_challenge_status not null default 'created',
  delivery_status text not null default 'test_mode_not_mailed',
  expires_at timestamptz not null default now() + interval '14 days',
  max_attempts int not null default 5,
  attempt_count int not null default 0,
  verified_at timestamptz,
  consumed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (max_attempts between 1 and 10),
  check (attempt_count >= 0)
);

create index residence_challenges_profile_status_idx on public.residence_challenges(profile_id, status);

create trigger set_residence_challenges_updated_at
before update on public.residence_challenges
for each row
execute function public.set_updated_at();

create table public.neighborhood_boundaries (
  id uuid primary key default gen_random_uuid(),
  neighborhood_id uuid references public.neighborhoods(id) on delete cascade,
  boundary geography(polygon, 4326) not null,
  source text not null default 'test_seed',
  approved_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index neighborhood_boundaries_boundary_idx on public.neighborhood_boundaries using gist (boundary);

create table public.neighborhood_clusters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  region text not null default 'Greater Accra',
  created_at timestamptz not null default now(),
  unique (name, city, region)
);

create table public.neighborhood_cluster_members (
  cluster_id uuid references public.neighborhood_clusters(id) on delete cascade,
  neighborhood_id uuid references public.neighborhoods(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (cluster_id, neighborhood_id)
);

create table public.membership_events (
  id uuid primary key default gen_random_uuid(),
  membership_id uuid,
  profile_id uuid references public.profiles(id) on delete cascade,
  neighborhood_id uuid references public.neighborhoods(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  from_status public.residence_verification_status,
  to_status public.residence_verification_status not null,
  method public.membership_verification_method,
  reason text,
  created_at timestamptz not null default now()
);

create table public.community_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid references public.profiles(id) on delete cascade,
  neighborhood_id uuid references public.neighborhoods(id) on delete cascade,
  audience public.feed_audience_type not null default 'private_neighborhood',
  title text not null,
  body text not null,
  status public.community_post_status not null default 'published',
  moderation_status public.moderation_status not null default 'not_run',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(title) between 3 and 120),
  check (char_length(body) between 1 and 4000)
);

create index community_posts_neighborhood_created_idx on public.community_posts(neighborhood_id, created_at desc);

create trigger set_community_posts_updated_at
before update on public.community_posts
for each row
execute function public.set_updated_at();

create table public.community_post_audiences (
  post_id uuid references public.community_posts(id) on delete cascade,
  audience public.feed_audience_type not null,
  neighborhood_id uuid references public.neighborhoods(id) on delete cascade,
  cluster_id uuid references public.neighborhood_clusters(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, audience)
);

create table public.profile_location_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  show_neighborhood_name boolean not null default true,
  show_approximate_zone boolean not null default false,
  show_neighborhood_only boolean not null default true,
  hide_map_location boolean not null default true,
  updated_at timestamptz not null default now()
);

create trigger set_profile_location_preferences_updated_at
before update on public.profile_location_preferences
for each row
execute function public.set_updated_at();

create view public.public_community_profiles as
select
  p.id as profile_id,
  coalesce(pip.public_display_name, p.display_name) as public_display_name,
  case
    when coalesce(plp.hide_map_location, true) then null
    when coalesce(plp.show_neighborhood_name, true) then n.name
    else null
  end as visible_neighborhood_name,
  case
    when coalesce(plp.show_neighborhood_only, true) then 'neighborhood_only'
    when coalesce(plp.show_approximate_zone, false) then 'approximate_zone'
    else 'hidden'
  end as location_visibility,
  p.created_at
from public.profiles p
left join public.private_identity_profiles pip on pip.profile_id = p.id
left join public.profile_location_preferences plp on plp.profile_id = p.id
left join public.neighborhood_memberships nm
  on nm.profile_id = p.id
 and nm.is_primary = true
 and nm.status = 'verified'
 and nm.ended_at is null
left join public.neighborhoods n on n.id = nm.neighborhood_id;

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles where auth_user_id = auth.uid()
$$;

create or replace function public.is_admin_or_moderator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where auth_user_id = auth.uid()
      and role in ('admin', 'moderator')
  )
$$;

create or replace function public.has_verified_neighborhood_membership(target_neighborhood_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.neighborhood_memberships nm
    join public.profiles p on p.id = nm.profile_id
    where p.auth_user_id = auth.uid()
      and nm.neighborhood_id = target_neighborhood_id
      and nm.status = 'verified'
      and nm.verified_at is not null
      and nm.ended_at is null
      and (nm.verification_expires_at is null or nm.verification_expires_at > now())
  )
$$;

create or replace function public.complete_test_identity_assurance(legal_given_name text, legal_family_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_profile_id uuid;
  clean_given_name text;
  clean_family_name text;
  generated_public_display_name text;
begin
  caller_profile_id := public.current_profile_id();

  if caller_profile_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  clean_given_name := nullif(trim(legal_given_name), '');
  clean_family_name := nullif(trim(legal_family_name), '');

  if clean_given_name is null or clean_family_name is null then
    raise exception 'legal given and family names are required for test identity assurance' using errcode = '22023';
  end if;

  generated_public_display_name := clean_given_name || ' ' || upper(left(clean_family_name, 1)) || '.';

  insert into public.private_identity_profiles (
    profile_id,
    legal_given_name,
    legal_family_name,
    public_display_name,
    assurance_status,
    assurance_level,
    assurance_provider,
    assurance_method,
    assurance_reference,
    assurance_reviewed_at,
    assurance_expires_at
  )
  values (
    caller_profile_id,
    clean_given_name,
    clean_family_name,
    generated_public_display_name,
    'approved_test_mode',
    'test_mode_resident',
    'manual_test_mode',
    'manual_biometrics_policy_no_ghana_card',
    'test-mode-no-ghana-card-image',
    now(),
    now() + interval '1 year'
  )
  on conflict (profile_id) do update
  set legal_given_name = excluded.legal_given_name,
      legal_family_name = excluded.legal_family_name,
      public_display_name = excluded.public_display_name,
      assurance_status = excluded.assurance_status,
      assurance_level = excluded.assurance_level,
      assurance_provider = excluded.assurance_provider,
      assurance_method = excluded.assurance_method,
      assurance_reference = excluded.assurance_reference,
      assurance_reviewed_at = excluded.assurance_reviewed_at,
      assurance_expires_at = excluded.assurance_expires_at;

  insert into public.identity_assurance_events (
    profile_id,
    actor_id,
    provider,
    method,
    result,
    public_note
  )
  values (
    caller_profile_id,
    caller_profile_id,
    'manual_test_mode',
    'manual_biometrics_policy_no_ghana_card',
    'approved_test_mode',
    'Test-mode identity assurance completed without Ghana Card image collection'
  );

  insert into public.audit_events(actor_id, action, target_table, target_id, metadata)
  values (
    caller_profile_id,
    'identity_assurance_completed',
    'private_identity_profiles',
    caller_profile_id,
    jsonb_build_object('mode', 'test', 'ghana_card_image_collected', false)
  );

  return caller_profile_id;
end;
$$;

create or replace function public.assign_neighborhood_for_address(target_address_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  matched_neighborhood_id uuid;
begin
  select nb.neighborhood_id
  into matched_neighborhood_id
  from public.private_addresses pa
  join public.neighborhood_boundaries nb
    on pa.user_confirmed_point is not null
   and st_covers(nb.boundary::geometry, pa.user_confirmed_point::geometry)
  where pa.id = target_address_id
  order by nb.approved_at desc
  limit 1;

  update public.private_addresses
  set assigned_neighborhood_id = matched_neighborhood_id,
      verification_status = case when matched_neighborhood_id is null then 'manual_review_required' else verification_status end
  where id = target_address_id;

  return matched_neighborhood_id;
end;
$$;

create or replace function public.create_test_residence_challenge(target_address_id uuid, test_code text default 'MC2026')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_profile_id uuid;
  address_owner_id uuid;
  challenge_id uuid;
  normalized_code text;
  generated_salt text;
  recent_challenge_count int;
begin
  caller_profile_id := public.current_profile_id();

  if caller_profile_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select profile_id
  into address_owner_id
  from public.private_addresses
  where id = target_address_id
    and is_current = true;

  if address_owner_id is distinct from caller_profile_id then
    raise exception 'address is not available for this user' using errcode = '42501';
  end if;

  select count(*)
  into recent_challenge_count
  from public.residence_challenges
  where profile_id = caller_profile_id
    and created_at > now() - interval '1 hour';

  if recent_challenge_count >= 3 then
    raise exception 'too many residence challenge requests' using errcode = '42501';
  end if;

  normalized_code := upper(regexp_replace(test_code, '\s+', '', 'g'));

  if normalized_code !~ '^[A-HJ-NP-Z2-9]{6,8}$' then
    raise exception 'test postcard code must be 6 to 8 unambiguous characters' using errcode = '22023';
  end if;

  update public.residence_challenges
  set status = 'cancelled'
  where address_id = target_address_id
    and status in ('created', 'delivery_pending', 'delivered', 'code_entered');

  generated_salt := encode(gen_random_bytes(16), 'hex');

  insert into public.residence_challenges (
    profile_id,
    address_id,
    code_hash,
    code_salt,
    status,
    delivery_status
  )
  values (
    caller_profile_id,
    target_address_id,
    encode(digest(normalized_code || ':' || generated_salt || ':' || target_address_id::text, 'sha256'), 'hex'),
    generated_salt,
    'delivered',
    'test_mode_delivered'
  )
  returning id into challenge_id;

  insert into public.audit_events(actor_id, action, target_table, target_id, metadata)
  values (
    caller_profile_id,
    'residence_challenge_created',
    'residence_challenges',
    challenge_id,
    jsonb_build_object('mode', 'test_postcard', 'code_stored', 'hashed')
  );

  return challenge_id;
end;
$$;

create or replace function public.verify_test_residence_challenge(target_challenge_id uuid, submitted_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_profile_id uuid;
  challenge_record public.residence_challenges%rowtype;
  computed_hash text;
  matched_neighborhood_id uuid;
  membership_record_id uuid;
begin
  caller_profile_id := public.current_profile_id();

  if caller_profile_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select *
  into challenge_record
  from public.residence_challenges
  where id = target_challenge_id
  for update;

  if not found or challenge_record.profile_id is distinct from caller_profile_id then
    raise exception 'challenge is not available for this user' using errcode = '42501';
  end if;

  if challenge_record.status in ('verified', 'cancelled', 'too_many_attempts')
    or challenge_record.consumed_at is not null
  then
    raise exception 'challenge cannot be reused' using errcode = '42501';
  end if;

  if challenge_record.expires_at <= now() then
    update public.residence_challenges
    set status = 'expired'
    where id = target_challenge_id;

    raise exception 'challenge has expired' using errcode = '42501';
  end if;

  computed_hash := encode(
    digest(upper(regexp_replace(submitted_code, '\s+', '', 'g')) || ':' || challenge_record.code_salt || ':' || challenge_record.address_id::text, 'sha256'),
    'hex'
  );

  if computed_hash <> challenge_record.code_hash then
    update public.residence_challenges
    set attempt_count = attempt_count + 1,
        status = case when attempt_count + 1 >= max_attempts then 'too_many_attempts' else 'code_entered' end
    where id = target_challenge_id;

    raise exception 'challenge code is not valid' using errcode = '42501';
  end if;

  matched_neighborhood_id := public.assign_neighborhood_for_address(challenge_record.address_id);

  if matched_neighborhood_id is null then
    update public.residence_challenges
    set status = 'manual_review_required'
    where id = target_challenge_id;

    raise exception 'address requires manual review' using errcode = '42501';
  end if;

  update public.residence_challenges
  set status = 'verified',
      attempt_count = attempt_count + 1,
      verified_at = now(),
      consumed_at = now()
  where id = target_challenge_id;

  update public.private_addresses
  set verification_status = 'verified',
      assigned_neighborhood_id = matched_neighborhood_id
  where id = challenge_record.address_id;

  insert into public.neighborhood_memberships (
    profile_id,
    neighborhood_id,
    is_primary,
    status,
    verification_method,
    verified_at,
    verification_expires_at
  )
  values (
    caller_profile_id,
    matched_neighborhood_id,
    true,
    'verified',
    'test_postcard',
    now(),
    now() + interval '1 year'
  )
  on conflict (profile_id, neighborhood_id) do update
  set is_primary = true,
      status = 'verified',
      verification_method = 'test_postcard',
      verified_at = excluded.verified_at,
      verification_expires_at = excluded.verification_expires_at,
      ended_at = null,
      reverification_required_at = null,
      reverification_reason = null
  returning id into membership_record_id;

  insert into public.membership_events (
    membership_id,
    profile_id,
    neighborhood_id,
    actor_id,
    to_status,
    method,
    reason
  )
  values (
    membership_record_id,
    caller_profile_id,
    matched_neighborhood_id,
    caller_profile_id,
    'verified',
    'test_postcard',
    'test postcard code accepted'
  );

  insert into public.audit_events(actor_id, action, target_table, target_id, metadata)
  values (
    caller_profile_id,
    'neighborhood_membership_verified',
    'neighborhood_memberships',
    membership_record_id,
    jsonb_build_object('method', 'test_postcard', 'neighborhood_id', matched_neighborhood_id)
  );

  return matched_neighborhood_id;
end;
$$;

create or replace function public.create_private_neighborhood_post(post_title text, post_body text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_profile_id uuid;
  caller_neighborhood_id uuid;
  post_id uuid;
begin
  caller_profile_id := public.current_profile_id();

  if caller_profile_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select nm.neighborhood_id
  into caller_neighborhood_id
  from public.neighborhood_memberships nm
  where nm.profile_id = caller_profile_id
    and nm.is_primary = true
    and nm.status = 'verified'
    and nm.ended_at is null
    and (nm.verification_expires_at is null or nm.verification_expires_at > now())
  order by nm.verified_at desc
  limit 1;

  if caller_neighborhood_id is null then
    raise exception 'verified neighborhood membership required' using errcode = '42501';
  end if;

  insert into public.community_posts(author_id, neighborhood_id, audience, title, body, status)
  values (caller_profile_id, caller_neighborhood_id, 'private_neighborhood', post_title, post_body, 'published')
  returning id into post_id;

  insert into public.community_post_audiences(post_id, audience, neighborhood_id)
  values (post_id, 'private_neighborhood', caller_neighborhood_id);

  insert into public.audit_events(actor_id, action, target_table, target_id, metadata)
  values (
    caller_profile_id,
    'local_post_created',
    'community_posts',
    post_id,
    jsonb_build_object('audience', 'private_neighborhood', 'neighborhood_id', caller_neighborhood_id)
  );

  return post_id;
end;
$$;

create or replace function public.mark_membership_reverification_required()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.is_current = true and new.is_current = false then
    update public.neighborhood_memberships
    set status = 'requires_reverification',
        reverification_required_at = now(),
        reverification_reason = 'address_changed'
    where profile_id = old.profile_id
      and status = 'verified'
      and ended_at is null;

    insert into public.audit_events(actor_id, action, target_table, target_id, metadata)
    values (
      old.profile_id,
      'membership_reverification_required',
      'profiles',
      old.profile_id,
      jsonb_build_object('reason', 'address_changed', 'previous_address_id', old.id)
    );
  end if;

  return new;
end;
$$;

create trigger mark_membership_reverification_required
after update of is_current on public.private_addresses
for each row
execute function public.mark_membership_reverification_required();

alter table public.private_identity_profiles enable row level security;
alter table public.identity_assurance_events enable row level security;
alter table public.private_addresses enable row level security;
alter table public.address_normalization_events enable row level security;
alter table public.location_verification_attempts enable row level security;
alter table public.residence_challenges enable row level security;
alter table public.neighborhood_boundaries enable row level security;
alter table public.neighborhood_clusters enable row level security;
alter table public.neighborhood_cluster_members enable row level security;
alter table public.membership_events enable row level security;
alter table public.community_posts enable row level security;
alter table public.community_post_audiences enable row level security;
alter table public.profile_location_preferences enable row level security;

grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.is_admin_or_moderator() to authenticated;
grant execute on function public.has_verified_neighborhood_membership(uuid) to authenticated;
grant execute on function public.complete_test_identity_assurance(text, text) to authenticated;
grant execute on function public.create_test_residence_challenge(uuid, text) to authenticated;
grant execute on function public.verify_test_residence_challenge(uuid, text) to authenticated;
grant execute on function public.create_private_neighborhood_post(text, text) to authenticated;

grant select (
  profile_id,
  public_display_name,
  assurance_status,
  assurance_level,
  assurance_provider,
  assurance_method,
  assurance_reviewed_at,
  assurance_expires_at,
  created_at,
  updated_at
) on public.private_identity_profiles to authenticated;
grant insert (
  profile_id,
  legal_given_name,
  legal_family_name,
  public_display_name,
  assurance_level,
  assurance_provider,
  assurance_method,
  assurance_reference,
  assurance_expires_at
) on public.private_identity_profiles to authenticated;
grant update (
  public_display_name
) on public.private_identity_profiles to authenticated;

grant select (
  id,
  profile_id,
  original_entry,
  house_number_or_description,
  street_or_road,
  landmark,
  area,
  neighborhood_text,
  district_or_municipality,
  region,
  country_code,
  provider_name,
  provider_place_id,
  assigned_neighborhood_id,
  verification_status,
  is_current,
  created_at,
  updated_at
) on public.private_addresses to authenticated;
grant insert (
  profile_id,
  original_entry,
  house_number_or_description,
  street_or_road,
  landmark,
  area,
  neighborhood_text,
  district_or_municipality,
  region,
  country_code,
  ghana_post_gps,
  provider_name,
  provider_place_id,
  normalized_latitude,
  normalized_longitude,
  normalized_point,
  user_confirmed_latitude,
  user_confirmed_longitude,
  user_confirmed_point,
  verification_status,
  is_current
) on public.private_addresses to authenticated;
grant update (
  is_current
) on public.private_addresses to authenticated;

grant insert (
  address_id,
  profile_id,
  provider_name,
  status,
  accuracy_level,
  failure_reason
) on public.address_normalization_events to authenticated;
grant insert (
  address_id,
  profile_id,
  status,
  distance_meters,
  accuracy_radius_meters,
  device_location_available,
  permission_granted,
  attempt_count,
  review_reason
) on public.location_verification_attempts to authenticated;

grant select (
  profile_id,
  neighborhood_id,
  is_primary,
  status,
  verification_method,
  verified_at,
  verification_expires_at,
  ended_at,
  created_at,
  updated_at,
  reverification_required_at,
  reverification_reason
) on public.neighborhood_memberships to authenticated;

grant select on public.neighborhood_clusters to authenticated;
grant select on public.neighborhood_cluster_members to authenticated;
grant select on public.public_community_profiles to authenticated;
grant select (
  id,
  author_id,
  neighborhood_id,
  audience,
  title,
  body,
  status,
  moderation_status,
  created_at,
  updated_at
) on public.community_posts to authenticated;
grant insert (
  title,
  body
) on public.community_posts to authenticated;
grant select on public.community_post_audiences to authenticated;
grant select, insert, update on public.profile_location_preferences to authenticated;

create policy "users read own identity assurance summary" on public.private_identity_profiles
  for select using (profile_id = public.current_profile_id());

create policy "users create own identity assurance profile" on public.private_identity_profiles
  for insert with check (
    profile_id = public.current_profile_id()
    and assurance_status in ('not_started', 'in_review')
  );

create policy "users update own identity test state only" on public.private_identity_profiles
  for update using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());

create policy "users insert own identity assurance events" on public.identity_assurance_events
  for insert with check (profile_id = public.current_profile_id());

create policy "users read own private address summary" on public.private_addresses
  for select using (profile_id = public.current_profile_id());

create policy "users create own private address" on public.private_addresses
  for insert with check (
    profile_id = public.current_profile_id()
    and assigned_neighborhood_id is null
    and verification_status in ('pending', 'manual_review_required')
  );

create policy "users retire own current address for reverification" on public.private_addresses
  for update using (profile_id = public.current_profile_id())
  with check (
    profile_id = public.current_profile_id()
    and is_current = false
  );

create policy "users insert own address normalization events" on public.address_normalization_events
  for insert with check (profile_id = public.current_profile_id());

create policy "users insert own location verification attempts" on public.location_verification_attempts
  for insert with check (profile_id = public.current_profile_id());

create policy "users read own neighborhood memberships" on public.neighborhood_memberships
  for select using (profile_id = public.current_profile_id());

create policy "verified members read same neighborhood private posts" on public.community_posts
  for select using (
    status = 'published'
    and audience = 'private_neighborhood'
    and public.has_verified_neighborhood_membership(neighborhood_id)
  );

create policy "verified members create posts in own verified neighborhood" on public.community_posts
  for insert with check (
    audience = 'private_neighborhood'
    and status = 'published'
    and author_id = public.current_profile_id()
    and public.has_verified_neighborhood_membership(neighborhood_id)
  );

create policy "verified members read visible post audiences" on public.community_post_audiences
  for select using (
    audience = 'private_neighborhood'
    and public.has_verified_neighborhood_membership(neighborhood_id)
  );

create policy "users manage own location preferences" on public.profile_location_preferences
  for all using (profile_id = public.current_profile_id())
  with check (profile_id = public.current_profile_id());
