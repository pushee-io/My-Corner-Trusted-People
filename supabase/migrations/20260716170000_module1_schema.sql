create extension if not exists "pgcrypto";
create extension if not exists "postgis";

create type public.user_role as enum ('requester', 'provider', 'moderator', 'admin');
create type public.request_status as enum ('Draft', 'Submitted', 'Viewed', 'Accepted', 'Declined', 'Cancelled', 'In progress', 'Completed', 'Reported');
create type public.moderation_status as enum ('not_run', 'clean', 'flagged', 'blocked');

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  display_name text not null,
  role public.user_role not null default 'requester',
  phone_verified boolean not null default false,
  locale text not null default 'en-GH',
  timezone text not null default 'Africa/Accra',
  created_at timestamptz not null default now()
);

create table public.neighborhoods (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  country_code text not null default 'GH',
  created_at timestamptz not null default now(),
  unique (name, city, country_code)
);

create table public.neighborhood_memberships (
  profile_id uuid references public.profiles(id) on delete cascade,
  neighborhood_id uuid references public.neighborhoods(id) on delete cascade,
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (profile_id, neighborhood_id)
);

create table public.service_categories (
  id text primary key,
  name text not null,
  description text,
  sort_order int not null default 0
);

create table public.provider_profiles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  business_name text not null,
  headline text not null,
  general_area text not null,
  rating numeric(2,1) not null default 0,
  review_count int not null default 0,
  completed_jobs int not null default 0,
  response_rate int not null default 0,
  community_recommendations int not null default 0,
  availability text not null,
  accepting_requests boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.provider_services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.provider_profiles(id) on delete cascade,
  category_id text references public.service_categories(id),
  service_label text not null,
  created_at timestamptz not null default now(),
  unique (provider_id, category_id)
);

create table public.provider_service_areas (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.provider_profiles(id) on delete cascade,
  neighborhood_id uuid references public.neighborhoods(id),
  area_label text not null,
  approximate_area geography(polygon, 4326),
  created_at timestamptz not null default now()
);

create table public.provider_trust_signals (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.provider_profiles(id) on delete cascade,
  signal_type text not null,
  label text not null,
  value text not null,
  moderator_reviewed boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.job_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles(id) on delete cascade,
  provider_id uuid references public.provider_profiles(id) on delete set null,
  category_id text references public.service_categories(id),
  title text not null,
  description text not null,
  original_user_text text not null,
  urgency text not null check (urgency in ('flexible', 'soon', 'urgent')),
  preferred_date date not null,
  preferred_time text not null,
  contact_preference text not null check (contact_preference in ('app_update', 'phone_call', 'sms')),
  neighborhood_id uuid references public.neighborhoods(id),
  general_area_label text not null,
  exact_address_private text,
  status public.request_status not null default 'Submitted',
  moderation_status public.moderation_status not null default 'not_run',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_request_photos (
  id uuid primary key default gen_random_uuid(),
  job_request_id uuid references public.job_requests(id) on delete cascade,
  storage_path text not null,
  moderation_status public.moderation_status not null default 'not_run',
  created_at timestamptz not null default now()
);

create table public.job_request_status_events (
  id uuid primary key default gen_random_uuid(),
  job_request_id uuid references public.job_requests(id) on delete cascade,
  status public.request_status not null,
  actor_id uuid references public.profiles(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table public.provider_responses (
  id uuid primary key default gen_random_uuid(),
  job_request_id uuid references public.job_requests(id) on delete cascade,
  provider_id uuid references public.provider_profiles(id) on delete cascade,
  response_status public.request_status not null check (response_status in ('Accepted', 'Declined')),
  message text,
  created_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  job_request_id uuid references public.job_requests(id) on delete cascade,
  reviewer_id uuid references public.profiles(id) on delete cascade,
  provider_id uuid references public.provider_profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  body text,
  moderation_status public.moderation_status not null default 'not_run',
  created_at timestamptz not null default now()
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid references public.provider_profiles(id) on delete cascade,
  recommender_id uuid references public.profiles(id) on delete cascade,
  body text,
  moderation_status public.moderation_status not null default 'not_run',
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid references public.profiles(id) on delete cascade,
  job_request_id uuid references public.job_requests(id) on delete set null,
  provider_id uuid references public.provider_profiles(id) on delete set null,
  reason text not null,
  details text,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table public.blocks (
  blocker_id uuid references public.profiles(id) on delete cascade,
  blocked_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.moderation_cases (
  id uuid primary key default gen_random_uuid(),
  source_table text not null,
  source_id uuid not null,
  reason text not null,
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  updated_at timestamptz not null default now()
);

create table public.ai_events (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  feature_key text not null,
  model text not null,
  status text not null,
  latency_ms int,
  cost_estimate_usd numeric(10,6),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.neighborhoods enable row level security;
alter table public.neighborhood_memberships enable row level security;
alter table public.service_categories enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.provider_services enable row level security;
alter table public.provider_service_areas enable row level security;
alter table public.provider_trust_signals enable row level security;
alter table public.job_requests enable row level security;
alter table public.job_request_photos enable row level security;
alter table public.job_request_status_events enable row level security;
alter table public.provider_responses enable row level security;
alter table public.reviews enable row level security;
alter table public.recommendations enable row level security;
alter table public.reports enable row level security;
alter table public.blocks enable row level security;
alter table public.notifications enable row level security;
alter table public.moderation_cases enable row level security;
alter table public.audit_events enable row level security;
alter table public.feature_flags enable row level security;
alter table public.ai_events enable row level security;

create policy "read active neighborhoods" on public.neighborhoods for select using (true);
create policy "read service categories" on public.service_categories for select using (true);
create policy "read provider listings" on public.provider_profiles for select using (accepting_requests = true);
create policy "read provider services" on public.provider_services for select using (true);
create policy "read provider areas" on public.provider_service_areas for select using (true);
create policy "read provider trust signals" on public.provider_trust_signals for select using (true);

create policy "profiles read own" on public.profiles for select using (auth.uid() = auth_user_id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);

create policy "requester creates own requests" on public.job_requests
  for insert with check (requester_id in (select id from public.profiles where auth_user_id = auth.uid()));

create policy "requester reads own requests" on public.job_requests
  for select using (requester_id in (select id from public.profiles where auth_user_id = auth.uid()));

create policy "provider reads assigned requests" on public.job_requests
  for select using (
    provider_id in (
      select pp.id from public.provider_profiles pp
      join public.profiles p on p.id = pp.profile_id
      where p.auth_user_id = auth.uid()
    )
  );

create policy "provider updates assigned request status" on public.job_requests
  for update using (
    provider_id in (
      select pp.id from public.provider_profiles pp
      join public.profiles p on p.id = pp.profile_id
      where p.auth_user_id = auth.uid()
    )
  )
  with check (status in ('Viewed', 'Accepted', 'Declined', 'In progress', 'Completed'));

create policy "requester can cancel or report own request" on public.job_requests
  for update using (requester_id in (select id from public.profiles where auth_user_id = auth.uid()))
  with check (status in ('Cancelled', 'Reported'));

create policy "request participants read status events" on public.job_request_status_events
  for select using (
    job_request_id in (
      select jr.id from public.job_requests jr
      where jr.requester_id in (select id from public.profiles where auth_user_id = auth.uid())
      or jr.provider_id in (
        select pp.id from public.provider_profiles pp
        join public.profiles p on p.id = pp.profile_id
        where p.auth_user_id = auth.uid()
      )
    )
  );

create policy "request participants insert status events" on public.job_request_status_events
  for insert with check (
    job_request_id in (
      select jr.id from public.job_requests jr
      where jr.requester_id in (select id from public.profiles where auth_user_id = auth.uid())
      or jr.provider_id in (
        select pp.id from public.provider_profiles pp
        join public.profiles p on p.id = pp.profile_id
        where p.auth_user_id = auth.uid()
      )
    )
  );

create policy "requester creates reports" on public.reports
  for insert with check (reporter_id in (select id from public.profiles where auth_user_id = auth.uid()));

create policy "users read own notifications" on public.notifications
  for select using (profile_id in (select id from public.profiles where auth_user_id = auth.uid()));
