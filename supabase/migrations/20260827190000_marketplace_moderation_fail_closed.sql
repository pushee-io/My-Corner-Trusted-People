begin;

-- Marketplace content fails closed: only clean listings and clean images are
-- visible to verified neighbors. Owners and moderators retain review access.
drop policy if exists "verified members read visible marketplace listings" on public.marketplace_listings;
create policy "verified members read visible marketplace listings" on public.marketplace_listings
for select to authenticated using (
  public.is_admin_or_moderator()
  or seller_id = public.current_profile_id()
  or (
    moderation_status = 'clean'
    and public.has_verified_neighborhood_membership(neighborhood_id)
  )
);

drop policy if exists "verified members create marketplace listings" on public.marketplace_listings;
create policy "verified members create marketplace listings" on public.marketplace_listings
for insert to authenticated with check (
  seller_id = public.current_profile_id()
  and moderation_status = 'not_run'
  and public.has_verified_neighborhood_membership(neighborhood_id)
);

create or replace function public.guard_marketplace_listing_moderation()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if public.is_admin_or_moderator() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.moderation_status <> 'not_run' then
      raise exception 'new marketplace listings must be reviewed before publication'
        using errcode = '42501';
    end if;
    return new;
  end if;

  if old.moderation_status is distinct from new.moderation_status then
    raise exception 'only a moderator may change marketplace moderation status'
      using errcode = '42501';
  end if;

  if old.title is distinct from new.title
    or old.description is distinct from new.description
    or old.price_ghs is distinct from new.price_ghs
    or old.pickup_area is distinct from new.pickup_area
    or old.pickup_notes is distinct from new.pickup_notes
    or old.image_url is distinct from new.image_url
    or old.image_urls is distinct from new.image_urls
  then
    new.moderation_status := 'not_run';
  end if;

  return new;
end;
$$;

drop trigger if exists guard_marketplace_listing_moderation on public.marketplace_listings;
create trigger guard_marketplace_listing_moderation
before insert or update on public.marketplace_listings
for each row execute function public.guard_marketplace_listing_moderation();

drop policy if exists "sellers update own marketplace listings" on public.marketplace_listings;
create policy "sellers update own marketplace listings" on public.marketplace_listings
for update to authenticated using (
  public.is_admin_or_moderator()
  or seller_id = public.current_profile_id()
)
with check (
  public.is_admin_or_moderator()
  or (
    seller_id = public.current_profile_id()
    and public.has_verified_neighborhood_membership(neighborhood_id)
  )
);

drop policy if exists "marketplace listing images visible with listing" on public.marketplace_listing_images;
create policy "marketplace listing images visible with listing" on public.marketplace_listing_images
for select to authenticated using (
  owner_profile_id = public.current_profile_id()
  or public.is_admin_or_moderator()
  or (
    moderation_status = 'clean'
    and exists (
      select 1
      from public.marketplace_listings ml
      where ml.id = listing_id
        and ml.moderation_status = 'clean'
        and public.has_verified_neighborhood_membership(ml.neighborhood_id)
    )
  )
);

drop policy if exists "marketplace sellers add listing images" on public.marketplace_listing_images;
create policy "marketplace sellers add listing images" on public.marketplace_listing_images
for insert to authenticated with check (
  owner_profile_id = public.current_profile_id()
  and moderation_status = 'not_run'
  and position between 0 and 7
  and object_path like 'marketplace_listing/' || public.current_profile_id()::text || '/%'
  and exists (
    select 1
    from public.marketplace_listings ml
    where ml.id = listing_id
      and ml.seller_id = public.current_profile_id()
  )
);

drop policy if exists "marketplace viewers read listing images" on storage.objects;
create policy "marketplace viewers read listing images" on storage.objects
for select to authenticated using (
  bucket_id = 'listing-images'
  and exists (
    select 1
    from public.marketplace_listing_images mli
    join public.marketplace_listings ml on ml.id = mli.listing_id
    where mli.object_path = name
      and (
        mli.owner_profile_id = public.current_profile_id()
        or public.is_admin_or_moderator()
        or (
          mli.moderation_status = 'clean'
          and ml.moderation_status = 'clean'
          and public.has_verified_neighborhood_membership(ml.neighborhood_id)
        )
      )
  )
);

drop policy if exists "verified members create marketplace pickup requests" on public.marketplace_pickup_requests;
create policy "verified members create marketplace pickup requests" on public.marketplace_pickup_requests
for insert to authenticated with check (
  requester_id = public.current_profile_id()
  and status = 'proposed'
  and exists (
    select 1
    from public.marketplace_listings ml
    where ml.id = listing_id
      and ml.seller_id <> public.current_profile_id()
      and ml.availability = 'available'
      and ml.moderation_status = 'clean'
      and public.has_verified_neighborhood_membership(ml.neighborhood_id)
  )
);

create or replace function public.guard_marketplace_pickup_moderation()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  listing_moderation public.moderation_status;
begin
  if new.status in ('proposed', 'accepted', 'confirmed', 'completed') then
    select ml.moderation_status
    into listing_moderation
    from public.marketplace_listings ml
    where ml.id = new.listing_id;

    if listing_moderation is distinct from 'clean'::public.moderation_status then
      raise exception 'pickup activity is unavailable while this listing is under review'
        using errcode = '42501';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists guard_marketplace_pickup_moderation on public.marketplace_pickup_requests;
create trigger guard_marketplace_pickup_moderation
before insert or update of status on public.marketplace_pickup_requests
for each row execute function public.guard_marketplace_pickup_moderation();

drop policy if exists "marketplace participants send own messages" on public.marketplace_messages;
create policy "marketplace participants send own messages" on public.marketplace_messages
for insert to authenticated with check (
  sender_profile_id = public.current_profile_id()
  and exists (
    select 1
    from public.marketplace_conversations mc
    join public.marketplace_pickup_requests pr on pr.id = mc.pickup_request_id
    join public.marketplace_listings ml on ml.id = mc.listing_id
    where mc.id = conversation_id
      and public.current_profile_id() in (mc.buyer_profile_id, mc.seller_profile_id)
      and pr.status in ('proposed', 'accepted', 'confirmed')
      and ml.moderation_status = 'clean'
  )
);

commit;
