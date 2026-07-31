-- Compatibility region field required by Day 3 Greater Accra broadcast visibility.
-- Region is broad area metadata only, not an exact resident address.

alter table public.neighborhoods
  add column if not exists region text not null default 'Greater Accra';

create index if not exists idx_neighborhoods_region
  on public.neighborhoods(region);

comment on column public.neighborhoods.region is
  'Compatibility broad region label for agency broadcast visibility. Does not contain exact resident addresses.';
