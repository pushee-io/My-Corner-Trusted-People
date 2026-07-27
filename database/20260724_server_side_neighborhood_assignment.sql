create table if not exists neighborhoods (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  city text not null,
  country text not null default 'Ghana',
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (select 1 from pg_type where typname = 'neighborhood_membership_status') then
    create type neighborhood_membership_status as enum (
      'unverified',
      'pending_reverification',
      'verified',
      'rejected'
    );
  end if;
end
$$;

create table if not exists neighborhood_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  neighborhood_id uuid not null references neighborhoods(id),
  status neighborhood_membership_status not null default 'unverified',
  assigned_by text not null default 'server' check (assigned_by = 'server'),
  verified_at timestamptz,
  requires_reverification_at timestamptz,
  evidence_summary jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, neighborhood_id)
);

create table if not exists residence_verification_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  neighborhood_id uuid references neighborhoods(id),
  signal_type text not null check (
    signal_type in (
      'phone',
      'standardized_address',
      'map_confirmation',
      'location_consistency',
      'postcard_challenge'
    )
  ),
  passed boolean not null default false,
  detail text,
  checked_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists audit_events (
  id uuid primary key default gen_random_uuid(),
  actor text not null check (actor in ('system', 'moderator', 'admin')),
  action text not null,
  subject_id uuid not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table neighborhoods enable row level security;
alter table neighborhood_memberships enable row level security;
alter table residence_verification_signals enable row level security;
alter table audit_events enable row level security;

create policy "Authenticated users can read neighborhood list"
  on neighborhoods for select
  to authenticated
  using (true);

create policy "Users can read their own neighborhood membership"
  on neighborhood_memberships for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can read their own residence verification signals"
  on residence_verification_signals for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can read their own audit events"
  on audit_events for select
  to authenticated
  using (auth.uid() = subject_id);

comment on table neighborhood_memberships is
  'Neighborhood assignment is server-controlled. Clients may read their own status but must not directly verify membership.';

comment on table residence_verification_signals is
  'Stores non-public verification signals used by trusted backend code. Do not expose exact address or precise residential coordinates.';
