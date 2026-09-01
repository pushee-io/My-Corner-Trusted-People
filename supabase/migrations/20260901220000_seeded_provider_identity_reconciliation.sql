alter table public.profiles
  add column if not exists seed_key text;

alter table public.provider_profiles
  add column if not exists seed_key text;

create unique index if not exists profiles_seed_key_unique
  on public.profiles (seed_key)
  where seed_key is not null;

create unique index if not exists provider_profiles_seed_key_unique
  on public.provider_profiles (seed_key)
  where seed_key is not null;

comment on column public.profiles.seed_key is
  'Stable identifier used only for fictional seed profiles. Real profiles leave this null.';

comment on column public.provider_profiles.seed_key is
  'Stable identifier used only for fictional seed providers. Real providers leave this null.';

create temporary table seeded_provider_canonical_map (
  seed_key text primary key,
  business_name text not null,
  provider_id uuid not null,
  profile_id uuid not null
);

insert into seeded_provider_canonical_map (seed_key, business_name, provider_id, profile_id)
with seeded_businesses (seed_key, business_name) as (
  values
    ('pilot-provider-kwame-pipecare', 'Kwame PipeCare'),
    ('pilot-provider-ama-spark-works', 'Ama Spark Works'),
    ('pilot-provider-brightclean-ghana', 'BrightClean Ghana'),
    ('pilot-provider-kojo-wood-fit', 'Kojo Wood & Fit'),
    ('pilot-provider-naa-homefix', 'Naa HomeFix'),
    ('pilot-provider-coolair-tema', 'CoolAir Tema'),
    ('pilot-provider-freshnest-cleaners', 'FreshNest Cleaners'),
    ('pilot-provider-reliable-brush-co', 'Reliable Brush Co.'),
    ('pilot-provider-afi-pipe-drain', 'Afi Pipe & Drain'),
    ('pilot-provider-tidyspace-crew', 'TidySpace Crew'),
    ('pilot-provider-eben-appliance-assist', 'Eben Appliance Assist'),
    ('pilot-provider-swiftmove-accra', 'SwiftMove Accra')
),
ranked_candidates as (
  select
    seed.seed_key,
    seed.business_name,
    pp.id as provider_id,
    pp.profile_id,
    row_number() over (
      partition by seed.seed_key
      order by
        case
          when seed.seed_key = 'pilot-provider-naa-homefix'
            and lower(coalesce(auth_user.email, '')) = 'provider.test@mycorner.example'
            then 0
          when profile.auth_user_id is not null then 1
          else 2
        end,
        pp.created_at,
        pp.id
    ) as candidate_rank
  from seeded_businesses seed
  join public.provider_profiles pp
    on lower(btrim(pp.business_name)) = lower(seed.business_name)
  join public.profiles profile
    on profile.id = pp.profile_id
  left join auth.users auth_user
    on auth_user.id = profile.auth_user_id
)
select seed_key, business_name, provider_id, profile_id
from ranked_candidates
where candidate_rank = 1;

update public.profiles profile
set seed_key = canonical.seed_key
from seeded_provider_canonical_map canonical
where profile.id = canonical.profile_id;

update public.provider_profiles provider
set
  seed_key = canonical.seed_key,
  accepting_requests = true
from seeded_provider_canonical_map canonical
where provider.id = canonical.provider_id;

with retired as (
  update public.provider_profiles provider
  set accepting_requests = false
  from seeded_provider_canonical_map canonical
  where lower(btrim(provider.business_name)) = lower(canonical.business_name)
    and provider.id <> canonical.provider_id
    and provider.accepting_requests
  returning provider.id, provider.business_name
)
insert into public.audit_events (action, target_table, target_id, metadata)
select
  'seeded_provider_duplicate_retired',
  'provider_profiles',
  retired.id,
  jsonb_build_object(
    'business_name', retired.business_name,
    'reason', 'Duplicate fictional provider listing retired; request history preserved.'
  )
from retired;

with requester_candidates as (
  select
    profile.id,
    row_number() over (
      order by
        case when profile.auth_user_id is not null then 0 else 1 end,
        profile.created_at,
        profile.id
    ) as candidate_rank
  from public.profiles profile
  where lower(btrim(profile.display_name)) = 'akosua mensah'
    and profile.role = 'requester'
)
update public.profiles profile
set seed_key = 'pilot-requester-akosua-mensah'
from requester_candidates candidate
where profile.id = candidate.id
  and candidate.candidate_rank = 1;
