begin;

-- Marketplace photos remain private storage objects. Access is derived from the
-- listing row, rather than from a public bucket URL.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  false,
  6291456,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create table if not exists public.marketplace_listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  object_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif')),
  position smallint not null check (position between 0 and 7),
  alt_text text check (alt_text is null or char_length(btrim(alt_text)) between 2 and 140),
  moderation_status public.moderation_status not null default 'not_run',
  created_at timestamptz not null default now(),
  unique (listing_id, position)
);

create index if not exists marketplace_listing_images_listing_idx
  on public.marketplace_listing_images(listing_id, position);

alter table public.marketplace_listings
  drop constraint if exists marketplace_listings_availability_check;

update public.marketplace_listings
set availability = 'collected'
where availability = 'sold';

alter table public.marketplace_listings
  add constraint marketplace_listings_availability_check
    check (availability in ('available', 'reserved', 'collected', 'removed'));

alter table public.marketplace_pickup_requests
  add column if not exists general_area text,
  add column if not exists proposed_start timestamptz,
  add column if not exists proposed_end timestamptz,
  add column if not exists responded_at timestamptz;

alter table public.marketplace_pickup_requests
  drop constraint if exists marketplace_pickup_requests_status_check;

update public.marketplace_pickup_requests pr
set general_area = ml.pickup_area,
    proposed_start = coalesce(pr.proposed_start, pr.created_at + interval '1 day'),
    proposed_end = coalesce(pr.proposed_end, pr.created_at + interval '1 day 1 hour'),
    status = case when pr.status = 'open' then 'proposed' else pr.status end
from public.marketplace_listings ml
where ml.id = pr.listing_id
  and (pr.general_area is null or pr.proposed_start is null or pr.proposed_end is null or pr.status = 'open');

alter table public.marketplace_pickup_requests
  alter column general_area set not null,
  alter column proposed_start set not null,
  alter column proposed_end set not null,
  add constraint marketplace_pickup_requests_status_check
    check (status in ('proposed', 'accepted', 'confirmed', 'declined', 'cancelled', 'completed')),
  add constraint marketplace_pickup_window_valid
    check (proposed_start > created_at and proposed_end > proposed_start and proposed_end <= proposed_start + interval '8 hours'),
  add constraint marketplace_pickup_general_area_length
    check (char_length(btrim(general_area)) between 2 and 160);

create table if not exists public.marketplace_pickup_private_details (
  request_id uuid primary key references public.marketplace_pickup_requests(id) on delete cascade,
  exact_details text not null check (char_length(btrim(exact_details)) between 3 and 500),
  shared_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_conversations (
  id uuid primary key default gen_random_uuid(),
  pickup_request_id uuid not null unique references public.marketplace_pickup_requests(id) on delete cascade,
  listing_id uuid not null references public.marketplace_listings(id) on delete cascade,
  buyer_profile_id uuid not null references public.profiles(id) on delete cascade,
  seller_profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (buyer_profile_id <> seller_profile_id)
);

create table if not exists public.marketplace_pickup_private_access_audit (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.marketplace_pickup_requests(id) on delete cascade,
  viewer_profile_id uuid not null references public.profiles(id) on delete restrict,
  accessed_at timestamptz not null default now()
);

create table if not exists public.marketplace_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.marketplace_conversations(id) on delete cascade,
  sender_profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists marketplace_messages_conversation_created_idx
  on public.marketplace_messages(conversation_id, created_at);

drop trigger if exists set_marketplace_pickup_private_details_updated_at on public.marketplace_pickup_private_details;
create trigger set_marketplace_pickup_private_details_updated_at
before update on public.marketplace_pickup_private_details
for each row execute function public.set_updated_at();

drop trigger if exists set_marketplace_conversations_updated_at on public.marketplace_conversations;
create trigger set_marketplace_conversations_updated_at
before update on public.marketplace_conversations
for each row execute function public.set_updated_at();

create or replace function public.guard_marketplace_public_pickup_text()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  public_text text := coalesce(new.pickup_area, '') || ' ' || coalesce(new.pickup_notes, '');
begin
  if public_text ~* '(ghana\s*post|digital\s+address|exact\s+address|house\s+(number|no\.?))'
    or public_text ~* '\m[A-Z]{2}-[0-9]{3,4}-[0-9]{4}\M'
    or public_text ~* '\m(\+233|0)[0-9][0-9 -]{7,12}\M'
  then
    raise exception 'Use a general pickup area here. Share precise details only after confirmation.'
      using errcode = '22023';
  end if;
  return new;
end;
$$;

drop trigger if exists marketplace_public_pickup_guard on public.marketplace_listings;
create trigger marketplace_public_pickup_guard
before insert or update of pickup_area, pickup_notes on public.marketplace_listings
for each row execute function public.guard_marketplace_public_pickup_text();

create or replace function public.guard_marketplace_pickup_proposal()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  proposal_text text := coalesce(new.general_area, '') || ' ' || coalesce(new.message, '');
begin
  if proposal_text ~* '(ghana\s*post|digital\s+address|exact\s+address|house\s+(number|no\.?))'
    or proposal_text ~* '\m[A-Z]{2}-[0-9]{3,4}-[0-9]{4}\M'
    or proposal_text ~* '\m(\+233|0)[0-9][0-9 -]{7,12}\M'
  then
    raise exception 'Propose only a general area. Exact details are released after confirmation.'
      using errcode = '22023';
  end if;
  return new;
end;
$$;

drop trigger if exists marketplace_pickup_proposal_privacy_guard on public.marketplace_pickup_requests;
create trigger marketplace_pickup_proposal_privacy_guard
before insert or update of message, general_area on public.marketplace_pickup_requests
for each row execute function public.guard_marketplace_pickup_proposal();

create or replace function public.create_marketplace_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.marketplace_conversations (
    pickup_request_id,
    listing_id,
    buyer_profile_id,
    seller_profile_id
  )
  select new.id, new.listing_id, new.requester_id, ml.seller_id
  from public.marketplace_listings ml
  where ml.id = new.listing_id
    and new.requester_id <> ml.seller_id
  on conflict (pickup_request_id) do nothing;
  return new;
end;
$$;

drop trigger if exists marketplace_pickup_create_conversation on public.marketplace_pickup_requests;
create trigger marketplace_pickup_create_conversation
after insert on public.marketplace_pickup_requests
for each row execute function public.create_marketplace_conversation();

-- Backfill conversations for existing requests without changing their status.
insert into public.marketplace_conversations (
  pickup_request_id,
  listing_id,
  buyer_profile_id,
  seller_profile_id
)
select pr.id, pr.listing_id, pr.requester_id, ml.seller_id
from public.marketplace_pickup_requests pr
join public.marketplace_listings ml on ml.id = pr.listing_id
where pr.requester_id <> ml.seller_id
on conflict (pickup_request_id) do nothing;

create or replace function public.guard_marketplace_message()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.body ~* '(ghana\s*post|digital\s+address|exact\s+address|house\s+(number|no\.?))'
    or new.body ~* '\m[A-Z]{2}-[0-9]{3,4}-[0-9]{4}\M'
    or new.body ~* '\m(\+233|0)[0-9][0-9 -]{7,12}\M'
  then
    raise exception 'Keep exact addresses and phone numbers in the protected pickup confirmation.'
      using errcode = '22023';
  end if;
  return new;
end;
$$;

drop trigger if exists marketplace_message_privacy_guard on public.marketplace_messages;
create trigger marketplace_message_privacy_guard
before insert or update of body on public.marketplace_messages
for each row execute function public.guard_marketplace_message();

create or replace function public.respond_to_marketplace_pickup_request(
  target_request_id uuid,
  action text,
  private_details text default null
)
returns public.marketplace_pickup_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := public.current_profile_id();
  request_row public.marketplace_pickup_requests;
  seller_id uuid;
  listing_availability text;
  prior_status text;
begin
  if actor_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  select pr.*
  into request_row
  from public.marketplace_pickup_requests pr
  where pr.id = target_request_id
  for update;

  if not found then
    raise exception 'pickup request not found' using errcode = 'P0002';
  end if;

  select ml.seller_id, ml.availability
  into seller_id, listing_availability
  from public.marketplace_listings ml
  where ml.id = request_row.listing_id
  for update;

  if not found then
    raise exception 'marketplace listing not found' using errcode = 'P0002';
  end if;

  prior_status := request_row.status;

  if action = 'accept' then
    if actor_id <> seller_id or request_row.status <> 'proposed' or listing_availability <> 'available' then
      raise exception 'seller may accept only a proposed pickup' using errcode = '42501';
    end if;
    update public.marketplace_pickup_requests
    set status = 'accepted', responded_at = now()
    where id = target_request_id returning * into request_row;
    update public.marketplace_listings set availability = 'reserved' where id = request_row.listing_id;
    update public.marketplace_pickup_requests
    set status = 'declined', responded_at = now()
    where listing_id = request_row.listing_id
      and id <> target_request_id
      and status = 'proposed';
  elsif action = 'confirm' then
    if actor_id <> seller_id or request_row.status <> 'accepted' then
      raise exception 'seller may confirm only an accepted pickup' using errcode = '42501';
    end if;
    if char_length(btrim(coalesce(private_details, ''))) < 3 then
      raise exception 'private pickup details are required' using errcode = '22023';
    end if;
    insert into public.marketplace_pickup_private_details (
      request_id,
      exact_details,
      shared_by_profile_id
    ) values (
      target_request_id,
      btrim(private_details),
      actor_id
    )
    on conflict (request_id) do update
    set exact_details = excluded.exact_details,
        shared_by_profile_id = excluded.shared_by_profile_id,
        updated_at = now();
    update public.marketplace_pickup_requests
    set status = 'confirmed', responded_at = now()
    where id = target_request_id returning * into request_row;
  elsif action = 'decline' then
    if actor_id <> seller_id or request_row.status not in ('proposed', 'accepted') then
      raise exception 'seller may decline only an active pickup' using errcode = '42501';
    end if;
    update public.marketplace_pickup_requests
    set status = 'declined', responded_at = now()
    where id = target_request_id returning * into request_row;
    if prior_status = 'accepted' then
      update public.marketplace_listings set availability = 'available' where id = request_row.listing_id;
    end if;
  elsif action = 'cancel' then
    if actor_id not in (seller_id, request_row.requester_id)
      or request_row.status not in ('proposed', 'accepted', 'confirmed')
    then
      raise exception 'pickup participant may cancel only an active pickup' using errcode = '42501';
    end if;
    if request_row.status in ('accepted', 'confirmed') then
      update public.marketplace_listings set availability = 'available' where id = request_row.listing_id;
    end if;
    update public.marketplace_pickup_requests
    set status = 'cancelled', responded_at = now()
    where id = target_request_id returning * into request_row;
  elsif action = 'complete' then
    if actor_id not in (seller_id, request_row.requester_id) or request_row.status <> 'confirmed' then
      raise exception 'pickup participant may complete only a confirmed pickup' using errcode = '42501';
    end if;
    update public.marketplace_pickup_requests
    set status = 'completed', responded_at = now()
    where id = target_request_id returning * into request_row;
    update public.marketplace_listings set availability = 'collected' where id = request_row.listing_id;
  else
    raise exception 'unsupported pickup action' using errcode = '22023';
  end if;

  return request_row;
end;
$$;

create or replace function public.get_marketplace_pickup_private_details(target_request_ids uuid[])
returns table (request_id uuid, exact_details text)
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := public.current_profile_id();
begin
  if actor_id is null then
    raise exception 'authentication required' using errcode = '42501';
  end if;

  insert into public.marketplace_pickup_private_access_audit (request_id, viewer_profile_id)
  select pd.request_id, actor_id
  from public.marketplace_pickup_private_details pd
  join public.marketplace_pickup_requests pr on pr.id = pd.request_id
  join public.marketplace_listings ml on ml.id = pr.listing_id
  where pd.request_id = any(target_request_ids)
    and pr.status in ('confirmed', 'completed')
    and actor_id in (pr.requester_id, ml.seller_id);

  return query
  select pd.request_id, pd.exact_details
  from public.marketplace_pickup_private_details pd
  join public.marketplace_pickup_requests pr on pr.id = pd.request_id
  join public.marketplace_listings ml on ml.id = pr.listing_id
  where pd.request_id = any(target_request_ids)
    and pr.status in ('confirmed', 'completed')
    and actor_id in (pr.requester_id, ml.seller_id);
end;
$$;

alter table public.marketplace_listing_images enable row level security;
alter table public.marketplace_pickup_private_details enable row level security;
alter table public.marketplace_pickup_private_access_audit enable row level security;
alter table public.marketplace_conversations enable row level security;
alter table public.marketplace_messages enable row level security;

grant select, insert, delete on public.marketplace_listing_images to authenticated;
revoke all on public.marketplace_pickup_private_details from authenticated;
grant select on public.marketplace_conversations to authenticated;
grant select, insert on public.marketplace_messages to authenticated;
revoke update on public.marketplace_pickup_requests from authenticated;
revoke execute on function public.respond_to_marketplace_pickup_request(uuid, text, text) from public, anon;
grant execute on function public.respond_to_marketplace_pickup_request(uuid, text, text) to authenticated;
revoke execute on function public.get_marketplace_pickup_private_details(uuid[]) from public, anon;
grant execute on function public.get_marketplace_pickup_private_details(uuid[]) to authenticated;

drop policy if exists "marketplace listing images visible with listing" on public.marketplace_listing_images;
create policy "marketplace listing images visible with listing" on public.marketplace_listing_images
for select to authenticated using (
  exists (
    select 1 from public.marketplace_listings ml
    where ml.id = listing_id
      and (
        ml.seller_id = public.current_profile_id()
        or public.is_admin_or_moderator()
        or (
          ml.moderation_status <> 'blocked'
          and public.has_verified_neighborhood_membership(ml.neighborhood_id)
        )
      )
  )
);

drop policy if exists "marketplace sellers add listing images" on public.marketplace_listing_images;
create policy "marketplace sellers add listing images" on public.marketplace_listing_images
for insert to authenticated with check (
  owner_profile_id = public.current_profile_id()
  and position between 0 and 7
  and object_path like 'marketplace_listing/' || public.current_profile_id()::text || '/%'
  and exists (
    select 1 from public.marketplace_listings ml
    where ml.id = listing_id and ml.seller_id = public.current_profile_id()
  )
);

drop policy if exists "marketplace sellers delete listing images" on public.marketplace_listing_images;
create policy "marketplace sellers delete listing images" on public.marketplace_listing_images
for delete to authenticated using (
  owner_profile_id = public.current_profile_id()
);

drop policy if exists "pickup participants read confirmed private details" on public.marketplace_pickup_private_details;
create policy "pickup participants read confirmed private details" on public.marketplace_pickup_private_details
for select to authenticated using (
  exists (
    select 1
    from public.marketplace_pickup_requests pr
    join public.marketplace_listings ml on ml.id = pr.listing_id
    where pr.id = request_id
      and pr.status in ('confirmed', 'completed')
      and public.current_profile_id() in (pr.requester_id, ml.seller_id)
  )
);

drop policy if exists "marketplace participants read conversations" on public.marketplace_conversations;
create policy "marketplace participants read conversations" on public.marketplace_conversations
for select to authenticated using (
  public.current_profile_id() in (buyer_profile_id, seller_profile_id)
);

drop policy if exists "marketplace participants read messages" on public.marketplace_messages;
create policy "marketplace participants read messages" on public.marketplace_messages
for select to authenticated using (
  exists (
    select 1 from public.marketplace_conversations mc
    where mc.id = conversation_id
      and public.current_profile_id() in (mc.buyer_profile_id, mc.seller_profile_id)
  )
);

drop policy if exists "marketplace participants send own messages" on public.marketplace_messages;
create policy "marketplace participants send own messages" on public.marketplace_messages
for insert to authenticated with check (
  sender_profile_id = public.current_profile_id()
  and exists (
    select 1 from public.marketplace_conversations mc
    where mc.id = conversation_id
      and public.current_profile_id() in (mc.buyer_profile_id, mc.seller_profile_id)
  )
);

drop policy if exists "marketplace owners upload listing images" on storage.objects;
create policy "marketplace owners upload listing images" on storage.objects
for insert to authenticated with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = 'marketplace_listing'
  and (storage.foldername(name))[2] = public.current_profile_id()::text
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
        ml.seller_id = public.current_profile_id()
        or public.is_admin_or_moderator()
        or (
          ml.moderation_status <> 'blocked'
          and public.has_verified_neighborhood_membership(ml.neighborhood_id)
        )
      )
  )
);

drop policy if exists "marketplace owners delete listing images" on storage.objects;
create policy "marketplace owners delete listing images" on storage.objects
for delete to authenticated using (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = 'marketplace_listing'
  and (storage.foldername(name))[2] = public.current_profile_id()::text
);

-- The original pickup request policies used the old status values and allowed
-- direct updates. Creation stays verified-member-only; transitions use the RPC.
drop policy if exists "verified members create marketplace pickup requests" on public.marketplace_pickup_requests;
create policy "verified members create marketplace pickup requests" on public.marketplace_pickup_requests
for insert to authenticated with check (
  requester_id = public.current_profile_id()
  and status = 'proposed'
  and exists (
    select 1 from public.marketplace_listings ml
    where ml.id = listing_id
      and ml.seller_id <> public.current_profile_id()
      and ml.availability = 'available'
      and ml.moderation_status <> 'blocked'
      and public.has_verified_neighborhood_membership(ml.neighborhood_id)
  )
);

drop policy if exists "marketplace pickup participants update requests" on public.marketplace_pickup_requests;

commit;
