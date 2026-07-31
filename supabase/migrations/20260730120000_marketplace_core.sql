create table if not exists public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  neighborhood_id uuid not null references public.neighborhoods(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(trim(title)) between 2 and 120),
  description text not null check (char_length(trim(description)) between 2 and 700),
  price_ghs numeric(10, 2) check (price_ghs is null or price_ghs >= 0),
  image_url text,
  image_urls text[] not null default '{}',
  availability text not null default 'available' check (availability in ('available', 'reserved', 'sold')),
  pickup_area text not null check (char_length(trim(pickup_area)) between 2 and 160),
  pickup_notes text check (pickup_notes is null or char_length(trim(pickup_notes)) <= 300),
  moderation_status public.moderation_status not null default 'not_run',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_pickup_requests (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  requester_id uuid not null references public.profiles(id) on delete cascade,
  message text not null check (char_length(trim(message)) between 2 and 300),
  status text not null default 'open' check (status in ('open', 'accepted', 'declined', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, requester_id)
);

create index if not exists marketplace_listings_neighborhood_created_idx
  on public.marketplace_listings(neighborhood_id, created_at desc);

create index if not exists marketplace_listings_seller_idx
  on public.marketplace_listings(seller_id, created_at desc);

create index if not exists marketplace_pickup_requests_listing_idx
  on public.marketplace_pickup_requests(listing_id, created_at desc);

create index if not exists marketplace_pickup_requests_requester_idx
  on public.marketplace_pickup_requests(requester_id, created_at desc);

drop trigger if exists set_marketplace_listings_updated_at on public.marketplace_listings;
create trigger set_marketplace_listings_updated_at
before update on public.marketplace_listings
for each row
execute function public.set_updated_at();

drop trigger if exists set_marketplace_pickup_requests_updated_at on public.marketplace_pickup_requests;
create trigger set_marketplace_pickup_requests_updated_at
before update on public.marketplace_pickup_requests
for each row
execute function public.set_updated_at();

create or replace function public.prevent_marketplace_listing_owner_changes()
returns trigger
language plpgsql
as $$
begin
  if old.seller_id is distinct from new.seller_id
    or old.neighborhood_id is distinct from new.neighborhood_id
  then
    raise exception 'marketplace listing seller and neighborhood cannot be changed after creation'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_marketplace_listing_owner_changes on public.marketplace_listings;
create trigger prevent_marketplace_listing_owner_changes
before update on public.marketplace_listings
for each row
execute function public.prevent_marketplace_listing_owner_changes();

alter table public.marketplace_listings enable row level security;
alter table public.marketplace_pickup_requests enable row level security;

grant select, insert, update on public.marketplace_listings to authenticated;
grant select, insert, update on public.marketplace_pickup_requests to authenticated;

drop policy if exists "verified members read visible marketplace listings" on public.marketplace_listings;
create policy "verified members read visible marketplace listings" on public.marketplace_listings
  for select using (
    public.is_admin_or_moderator()
    or (
      moderation_status <> 'blocked'
      and public.has_verified_neighborhood_membership(neighborhood_id)
    )
  );

drop policy if exists "verified members create marketplace listings" on public.marketplace_listings;
create policy "verified members create marketplace listings" on public.marketplace_listings
  for insert with check (
    seller_id = public.current_profile_id()
    and moderation_status in ('not_run', 'clean')
    and public.has_verified_neighborhood_membership(neighborhood_id)
  );

drop policy if exists "sellers update own marketplace listings" on public.marketplace_listings;
create policy "sellers update own marketplace listings" on public.marketplace_listings
  for update using (
    seller_id = public.current_profile_id()
  )
  with check (
    seller_id = public.current_profile_id()
    and moderation_status in ('not_run', 'clean', 'flagged')
    and public.has_verified_neighborhood_membership(neighborhood_id)
  );

drop policy if exists "pickup participants read marketplace requests" on public.marketplace_pickup_requests;
create policy "pickup participants read marketplace requests" on public.marketplace_pickup_requests
  for select using (
    public.is_admin_or_moderator()
    or requester_id = public.current_profile_id()
    or exists (
      select 1
      from public.marketplace_listings ml
      where ml.id = marketplace_pickup_requests.listing_id
        and ml.seller_id = public.current_profile_id()
    )
  );

drop policy if exists "verified members create marketplace pickup requests" on public.marketplace_pickup_requests;
create policy "verified members create marketplace pickup requests" on public.marketplace_pickup_requests
  for insert with check (
    requester_id = public.current_profile_id()
    and status = 'open'
    and exists (
      select 1
      from public.marketplace_listings ml
      where ml.id = marketplace_pickup_requests.listing_id
        and ml.seller_id <> public.current_profile_id()
        and ml.availability = 'available'
        and ml.moderation_status <> 'blocked'
        and public.has_verified_neighborhood_membership(ml.neighborhood_id)
    )
  );

drop policy if exists "marketplace pickup participants update requests" on public.marketplace_pickup_requests;
create policy "marketplace pickup participants update requests" on public.marketplace_pickup_requests
  for update using (
    requester_id = public.current_profile_id()
    or exists (
      select 1
      from public.marketplace_listings ml
      where ml.id = marketplace_pickup_requests.listing_id
        and ml.seller_id = public.current_profile_id()
    )
  )
  with check (
    (
      requester_id = public.current_profile_id()
      and status = 'cancelled'
    )
    or (
      status in ('accepted', 'declined')
      and exists (
        select 1
        from public.marketplace_listings ml
        where ml.id = marketplace_pickup_requests.listing_id
          and ml.seller_id = public.current_profile_id()
      )
    )
  );
