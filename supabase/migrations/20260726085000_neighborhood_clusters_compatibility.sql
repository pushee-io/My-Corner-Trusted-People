-- Compatibility table required by Day 3 social groups and broadcasts.
-- This keeps cluster-level visibility explicit without exposing exact addresses.

create table if not exists public.neighborhood_clusters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null default 'Accra',
  region text not null default 'Greater Accra',
  region_id text not null default 'greater-accra',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(name) between 2 and 120)
);
alter table public.neighborhood_clusters
  add column if not exists city text not null default 'Accra',
  add column if not exists region text not null default 'Greater Accra',
  add column if not exists region_id text not null default 'greater-accra',
  add column if not exists updated_at timestamptz not null default now();

alter table public.neighborhood_clusters
  alter column city set default 'Accra',
  alter column region set default 'Greater Accra',
  alter column region_id set default 'greater-accra',
  alter column updated_at set default now();

update public.neighborhood_clusters
set
  city = coalesce(city, 'Accra'),
  region = coalesce(region, 'Greater Accra'),
  region_id = coalesce(region_id, 'greater-accra'),
  updated_at = coalesce(updated_at, now());

alter table public.neighborhood_clusters
  add column if not exists region_id text not null default 'greater-accra',
  add column if not exists updated_at timestamptz not null default now();

update public.neighborhood_clusters
set region_id = coalesce(region_id, 'greater-accra')
where region_id is null;

alter table public.neighborhood_clusters enable row level security;

drop policy if exists "rls_neighborhood_clusters_read" on public.neighborhood_clusters;

create policy "rls_neighborhood_clusters_read"
  on public.neighborhood_clusters
  for select
  to authenticated
  using (true);

create index if not exists idx_neighborhood_clusters_region_id
  on public.neighborhood_clusters(region_id);

comment on table public.neighborhood_clusters is
  'Compatibility lookup for neighborhood cluster visibility. Contains regional grouping labels, not exact resident addresses.';
