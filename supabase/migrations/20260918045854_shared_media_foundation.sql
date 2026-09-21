begin;

-- The live Feed table predates the checked-in migration history. Preserve it on
-- existing projects and provide the identical contract for a clean database.
create table if not exists public.neighborhood_feed_posts (
  id uuid primary key default gen_random_uuid(),
  neighborhood_id uuid not null references public.neighborhoods(id),
  author_id uuid not null references public.profiles(id),
  body text not null,
  moderation_status public.moderation_status not null default 'not_run',
  created_at timestamptz not null default now()
);
alter table public.neighborhood_feed_posts enable row level security;
create index if not exists neighborhood_feed_posts_neighborhood_created_idx
  on public.neighborhood_feed_posts(neighborhood_id, created_at desc);
create policy media_feed_verified_read on public.neighborhood_feed_posts for select to authenticated
  using (moderation_status <> 'blocked' and public.has_verified_neighborhood_membership(neighborhood_id));
create policy media_feed_verified_insert on public.neighborhood_feed_posts for insert to authenticated
  with check (author_id = (select public.current_profile_id())
    and moderation_status = 'not_run' and public.has_verified_neighborhood_membership(neighborhood_id));
grant select, insert on public.neighborhood_feed_posts to authenticated;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

-- One server flag controls the reusable pipeline. Deployment never enables it.
insert into public.feature_flags(key, enabled, description)
values ('shared_media_uploads', false, 'Shared private image/video uploads; explicitly enable in Preview only')
on conflict (key) do nothing;

create table public.media_surface_policies (
  parent_type text primary key,
  max_images int not null check (max_images between 0 and 8),
  max_videos int not null check (max_videos between 0 and 1),
  image_max_bytes int not null default 6291456,
  video_max_bytes int not null default 20971520,
  video_max_seconds int not null default 30,
  max_dimension int not null default 1920
);
insert into public.media_surface_policies(parent_type,max_images,max_videos) values
 ('profile',1,0), ('neighborhood_post',4,1), ('service_request',4,1),
 ('group_post',4,1), ('group_avatar',1,0), ('group_cover',1,0),
 ('event',6,1), ('marketplace_listing',0,1);
alter table public.media_surface_policies enable row level security;
create policy media_policies_read on public.media_surface_policies for select to authenticated using (true);
revoke all on public.media_surface_policies from anon, authenticated;
grant select on public.media_surface_policies to authenticated;
grant all on public.media_surface_policies to service_role;

create table public.media_assets (
  id uuid primary key,
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  parent_type text not null references public.media_surface_policies(parent_type),
  parent_id uuid,
  media_type text not null check (media_type in ('image','video')),
  storage_path text not null unique,
  poster_path text unique,
  mime_type text not null check (mime_type in ('image/jpeg','video/mp4')),
  byte_size int check (byte_size > 0 and byte_size <= 20971520),
  width int check (width between 1 and 1920),
  height int check (height between 1 and 1920),
  duration_seconds numeric check (duration_seconds > 0 and duration_seconds <= 30),
  sort_order int not null default 0 check (sort_order between 0 and 15),
  alt_text text not null default '' check (length(alt_text) <= 140),
  moderation_status public.moderation_status not null default 'not_run',
  processing_status text not null default 'uploading' check (processing_status in ('uploading','ready','failed','removed')),
  visibility text not null default 'parent' check (visibility = 'parent'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (storage_path = owner_profile_id::text || '/' || id::text || '/media.' ||
    case when media_type = 'image' then 'jpg' else 'mp4' end),
  check (poster_path is null or (media_type = 'video' and poster_path = owner_profile_id::text || '/' || id::text || '/poster.jpg')),
  check (processing_status <> 'ready' or (byte_size is not null and width is not null and height is not null
    and (media_type = 'image' or (duration_seconds is not null and poster_path is not null))))
);
create index media_assets_parent_idx on public.media_assets(parent_type,parent_id,sort_order) where processing_status = 'ready';
create index media_assets_owner_created_idx on public.media_assets(owner_profile_id,created_at);
alter table public.media_assets enable row level security;
revoke all on public.media_assets from anon, authenticated;
grant select on public.media_assets to authenticated;
grant all on public.media_assets to service_role;

create function private.media_enabled() returns boolean language sql stable security definer set search_path = '' as $$
 select auth.uid() is not null and coalesce((select enabled from public.feature_flags where key='shared_media_uploads'),false)
$$;

-- Security-definer is deliberately limited to authorization booleans. No private
-- parent columns are returned. Each parent check is explicit, never user metadata.
create function private.media_parent_allowed(kind text, target uuid, writing boolean default false)
returns boolean language plpgsql stable security definer set search_path = '' as $$
declare actor uuid := public.current_profile_id();
begin
 if auth.uid() is null or actor is null or target is null then return false; end if;
 case kind
 when 'profile' then
   if writing then return target=actor; end if;
   return target=actor or exists (
     select 1 from public.neighborhood_memberships target_member
     where target_member.profile_id=target and target_member.status='verified'
       and target_member.ended_at is null and target_member.verified_at is not null
       and (target_member.verification_expires_at is null or target_member.verification_expires_at > now())
       and public.has_verified_neighborhood_membership(target_member.neighborhood_id)
   ) or exists (
     select 1 from public.job_requests r join public.provider_profiles p on p.id=r.provider_id
     where (r.requester_id=actor and p.profile_id=target) or (p.profile_id=actor and r.requester_id=target)
   );
 when 'neighborhood_post' then
   return exists (select 1 from public.neighborhood_feed_posts p where p.id=target
     and p.moderation_status <> 'blocked' and public.has_verified_neighborhood_membership(p.neighborhood_id)
     and (not writing or p.author_id=actor));
 when 'service_request' then
   return exists (select 1 from public.job_requests r left join public.provider_profiles p on p.id=r.provider_id
     where r.id=target and (r.requester_id=actor or (not writing and p.profile_id=actor)));
 when 'group_post' then
   return exists (select 1 from public.social_group_posts p where p.id=target and p.moderation_status <> 'blocked'
     and public.can_view_social_group(p.group_id) and public.is_accepted_social_group_member(p.group_id)
     and (not writing or p.author_profile_id=actor));
 when 'group_avatar', 'group_cover' then
   return exists (select 1 from public.social_groups g where g.id=target and public.can_view_social_group(g.id)
     and (not writing or (g.created_by_profile_id=actor and public.is_accepted_social_group_member(g.id))));
 when 'event' then
   return public.is_events_feature_enabled() and exists (select 1 from public.events e where e.id=target
     and case when writing then public.can_manage_event(e.id,'edit_event')
       else public.can_view_event(e.id) or e.organizer_profile_id=actor end);
 when 'marketplace_listing' then
   return exists (select 1 from public.marketplace_listings l where l.id=target
     and case when writing then l.seller_id=actor and l.moderation_status <> 'blocked'
         and public.has_verified_neighborhood_membership(l.neighborhood_id)
       else l.seller_id=actor or public.is_admin_or_moderator()
         or (l.moderation_status <> 'blocked' and public.has_verified_neighborhood_membership(l.neighborhood_id)) end);
 else return false;
 end case;
end $$;

create policy media_assets_read on public.media_assets for select to authenticated using (
  private.media_enabled() and processing_status <> 'removed' and moderation_status <> 'blocked'
  and ((parent_id is null and owner_profile_id=(select public.current_profile_id()))
    or (parent_id is not null and processing_status='ready' and private.media_parent_allowed(parent_type,parent_id)))
);

-- Drafts are owner-only until all bytes are processed and attachment is authorized.
-- Retain removed rows for quota accounting and audit; never restore them on retry.
create function public.begin_media_upload(surface text, kind text, upload_id uuid)
returns public.media_assets language plpgsql security definer set search_path = '' as $$
declare actor uuid := public.current_profile_id(); rule public.media_surface_policies; asset public.media_assets;
begin
 if not private.media_enabled() or actor is null then raise exception 'Media uploads are unavailable' using errcode='42501'; end if;
 select * into rule from public.media_surface_policies where parent_type=surface;
 if not found or kind not in ('image','video') or (kind='image' and rule.max_images=0)
   or (kind='video' and rule.max_videos=0) then raise exception 'Unsupported media type'; end if;
 perform pg_advisory_xact_lock(hashtextextended(actor::text, 731));
 select * into asset from public.media_assets where id=upload_id;
 if found then
   if asset.owner_profile_id<>actor or asset.parent_type<>surface or asset.media_type<>kind
      or asset.processing_status in ('removed','failed') then raise exception 'Upload is unavailable' using errcode='42501'; end if;
   return asset;
 end if;
 if (select count(*) from public.media_assets where owner_profile_id=actor and created_at > now()-interval '1 hour') >= 60 then
   raise exception 'Upload limit reached. Please try again later.';
 end if;
 insert into public.media_assets(id,owner_profile_id,parent_type,media_type,storage_path,mime_type)
 values(upload_id,actor,surface,kind,actor::text||'/'||upload_id::text||'/media.'||case when kind='image' then 'jpg' else 'mp4' end,
   case when kind='image' then 'image/jpeg' else 'video/mp4' end) returning * into asset;
 return asset;
end $$;

create function public.attach_media(surface text, target uuid, asset_ids uuid[], replace_existing boolean default false)
returns void language plpgsql security definer set search_path = '' as $$
declare actor uuid := public.current_profile_id(); rule public.media_surface_policies; item public.media_assets;
 image_count int; video_count int; position int := 0;
begin
 if not private.media_enabled() or not private.media_parent_allowed(surface,target,true) then
   raise exception 'You cannot change media on this item' using errcode='42501'; end if;
 if asset_ids is null or cardinality(asset_ids)>9 or cardinality(asset_ids)<>(select count(distinct x) from unnest(asset_ids) x) then
   raise exception 'Invalid media selection'; end if;
 perform pg_advisory_xact_lock(hashtextextended(surface||target::text,732));
 select * into rule from public.media_surface_policies where parent_type=surface;
 if not found then raise exception 'Unsupported media parent'; end if;
 for item in select * from public.media_assets where id=any(asset_ids) for update loop
   if item.owner_profile_id<>actor or item.parent_type<>surface or item.processing_status<>'ready'
      or item.moderation_status='blocked' or (item.parent_id is not null and item.parent_id<>target) then
     raise exception 'Media is not ready or belongs to another item' using errcode='42501'; end if;
 end loop;
 if (select count(*) from public.media_assets where id=any(asset_ids)) <> cardinality(asset_ids) then
   raise exception 'Media selection is incomplete'; end if;
 if replace_existing or surface in ('profile','group_avatar','group_cover') then
   update public.media_assets set processing_status='removed',updated_at=now()
     where parent_type=surface and parent_id=target and not(id=any(asset_ids));
 end if;
 select count(*) filter(where media_type='image'),count(*) filter(where media_type='video') into image_count,video_count
   from public.media_assets where processing_status='ready' and parent_type=surface
     and (parent_id=target or id=any(asset_ids));
 if image_count>rule.max_images or video_count>rule.max_videos then raise exception 'Too many attachments'; end if;
 foreach item.id in array asset_ids loop
   update public.media_assets set parent_id=target,sort_order=position,updated_at=now() where id=item.id;
   position := position+1;
 end loop;
end $$;

create function public.remove_media(asset_id uuid) returns void language plpgsql security definer set search_path = '' as $$
declare asset public.media_assets;
begin
 select * into asset from public.media_assets where id=asset_id for update;
 if not found then return; end if;
 if auth.uid() is null or asset.owner_profile_id is distinct from public.current_profile_id()
   or (asset.parent_id is not null and not private.media_parent_allowed(asset.parent_type,asset.parent_id,true)) then
   raise exception 'You cannot remove this media' using errcode='42501'; end if;
 update public.media_assets set processing_status='removed',updated_at=now() where id=asset_id;
end $$;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
 ('media-originals','media-originals',false,20971520,array['image/jpeg','video/mp4']),
 ('shared-media','shared-media',false,20971520,array['image/jpeg','video/mp4'])
on conflict (id) do update set public=false, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

-- No original SELECT policy, even for the owner. Only the processor reads it.
create function private.media_upload_path_allowed(object_name text) returns boolean
language sql stable security definer set search_path = '' as $$
 select private.media_enabled() and exists (select 1 from public.media_assets a
 where a.owner_profile_id=public.current_profile_id() and a.parent_id is null and a.processing_status='uploading'
   and a.created_at > now()-interval '1 hour'
   and (object_name=a.storage_path or (a.media_type='video' and object_name=a.owner_profile_id::text||'/'||a.id::text||'/poster.jpg')))
$$;
create function private.media_read_path_allowed(object_name text) returns boolean
language sql stable security definer set search_path = '' as $$
 select private.media_enabled() and exists (select 1 from public.media_assets a
 where a.processing_status='ready' and a.moderation_status<>'blocked' and (object_name=a.storage_path or object_name=a.poster_path)
 and ((a.parent_id is null and a.owner_profile_id=public.current_profile_id())
   or (a.parent_id is not null and private.media_parent_allowed(a.parent_type,a.parent_id))))
$$;
create policy media_originals_insert on storage.objects for insert to authenticated
 with check(bucket_id='media-originals' and private.media_upload_path_allowed(name));
create policy media_processed_read on storage.objects for select to authenticated
 using(bucket_id='shared-media' and private.media_read_path_allowed(name));

revoke all on function private.media_enabled(), private.media_parent_allowed(text,uuid,boolean),
 private.media_upload_path_allowed(text), private.media_read_path_allowed(text) from public, anon;
grant execute on function private.media_enabled(), private.media_parent_allowed(text,uuid,boolean),
 private.media_upload_path_allowed(text), private.media_read_path_allowed(text) to authenticated, service_role;
revoke all on function public.begin_media_upload(text,text,uuid),public.attach_media(text,uuid,uuid[],boolean),public.remove_media(uuid) from public,anon;
grant execute on function public.begin_media_upload(text,text,uuid),public.attach_media(text,uuid,uuid[],boolean),public.remove_media(uuid) to authenticated;

commit;
