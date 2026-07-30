-- Compatibility join table required by Day 3 cluster-level visibility.
-- Links neighborhoods to broader local clusters without storing exact resident addresses.

create table if not exists public.neighborhood_cluster_members (
  id uuid primary key default gen_random_uuid(),
  cluster_id uuid not null references public.neighborhood_clusters(id) on delete cascade,
  neighborhood_id uuid not null references public.neighborhoods(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (cluster_id, neighborhood_id)
);

alter table public.neighborhood_cluster_members enable row level security;

drop policy if exists "rls_neighborhood_cluster_members_read" on public.neighborhood_cluster_members;

create policy "rls_neighborhood_cluster_members_read"
  on public.neighborhood_cluster_members
  for select
  to authenticated
  using (true);

create index if not exists idx_neighborhood_cluster_members_cluster_id
  on public.neighborhood_cluster_members(cluster_id);

create index if not exists idx_neighborhood_cluster_members_neighborhood_id
  on public.neighborhood_cluster_members(neighborhood_id);

comment on table public.neighborhood_cluster_members is
  'Compatibility join table for neighborhood-to-cluster visibility. Contains area grouping only, not exact resident addresses.';
