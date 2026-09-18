begin;

-- Durable deletion receipts survive asset/profile cascades. Storage bytes must
-- be deleted through the Storage API, never by deleting storage.objects rows.
create table private.media_cleanup_jobs (
 id uuid primary key default gen_random_uuid(),
 asset_id uuid not null,
 bucket_id text not null check(bucket_id in ('media-originals','shared-media')),
 object_path text not null check(object_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/(media\.(jpg|mp4)|poster\.jpg)$'),
 not_before timestamptz not null,
 attempts integer not null default 0,
 lease_token uuid,
 lease_until timestamptz,
 completed_at timestamptz,
 last_error text,
 unique(bucket_id,object_path)
);
alter table private.media_cleanup_jobs enable row level security;
revoke all on private.media_cleanup_jobs from public,anon,authenticated;
grant all on private.media_cleanup_jobs to service_role;
create index media_cleanup_due on private.media_cleanup_jobs(not_before) where completed_at is null;
create index media_abandoned on public.media_assets(created_at) where parent_id is null and processing_status <> 'removed';
create index media_cleanup_asset on private.media_cleanup_jobs(asset_id);

create function private.queue_media_cleanup() returns trigger
language plpgsql security definer set search_path = '' as $$
declare a public.media_assets; bucket text; path text; due timestamptz;
begin
 if TG_OP='DELETE' then a:=old; else a:=new; end if;
 if TG_OP<>'DELETE' and a.processing_status not in ('ready','failed','removed') then return new; end if;
 -- Signed PUT tokens last two hours and may be minted for the first hour.
 -- Ten minutes also outlasts the hosted Edge worker's 400-second maximum.
 due:=greatest(a.created_at+interval '3 hours 10 minutes',now()+interval '10 minutes');
 foreach bucket in array array['media-originals','shared-media'] loop
  if bucket='shared-media' and TG_OP<>'DELETE' and a.processing_status='ready' then continue; end if;
  foreach path in array array[a.storage_path,
    case when a.media_type='video' then a.owner_profile_id::text||'/'||a.id::text||'/poster.jpg' end] loop
   if path is null then continue; end if;
   insert into private.media_cleanup_jobs(asset_id,bucket_id,object_path,not_before)
    values(a.id,bucket,path,due)
   on conflict(bucket_id,object_path) do update
    set not_before=greatest(private.media_cleanup_jobs.not_before,excluded.not_before),
        completed_at=null,lease_token=null,lease_until=null;
  end loop;
 end loop;
 return case when TG_OP='DELETE' then old else new end;
end $$;
revoke all on function private.queue_media_cleanup() from public,anon,authenticated;
create trigger media_cleanup_after_change after update of processing_status or delete on public.media_assets
 for each row execute function private.queue_media_cleanup();

create function private.remove_deleted_parent_media() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 update public.media_assets set processing_status='removed',updated_at=now()
  where parent_id=old.id and parent_type=any(TG_ARGV) and processing_status<>'removed';
 return old;
end $$;
revoke all on function private.remove_deleted_parent_media() from public,anon,authenticated;
create trigger media_parent_deleted after delete on public.neighborhood_feed_posts for each row execute function private.remove_deleted_parent_media('neighborhood_post');
create trigger media_parent_deleted after delete on public.job_requests for each row execute function private.remove_deleted_parent_media('service_request');
create trigger media_parent_deleted after delete on public.social_group_posts for each row execute function private.remove_deleted_parent_media('group_post');
create trigger media_parent_deleted after delete on public.social_groups for each row execute function private.remove_deleted_parent_media('group_avatar','group_cover');
create trigger media_parent_deleted after delete on public.events for each row execute function private.remove_deleted_parent_media('event');
create trigger media_parent_deleted after delete on public.marketplace_listings for each row execute function private.remove_deleted_parent_media('marketplace_listing');

-- Service-only RPCs: no user-supplied Storage paths, no client privilege bypass.
create function public.claim_media_cleanup(batch_size integer default 20)
returns setof private.media_cleanup_jobs language plpgsql security invoker set search_path = '' as $$
begin
 with abandoned as (
  select id from public.media_assets where parent_id is null and processing_status<>'removed'
   and created_at<now()-interval '24 hours' order by created_at limit 100 for update skip locked
 ) update public.media_assets a set processing_status='removed',updated_at=now() from abandoned d where a.id=d.id;
 return query
 with due as (
  select id from private.media_cleanup_jobs where completed_at is null and not_before<=now()
   and (lease_until is null or lease_until<now()) order by not_before,id
   limit least(greatest(batch_size,1),50) for update skip locked
 ) update private.media_cleanup_jobs j set lease_token=gen_random_uuid(),lease_until=now()+interval '10 minutes',attempts=attempts+1
   from due where j.id=due.id returning j.*;
end $$;
create function public.finish_media_cleanup(job_id uuid,claim_token uuid,succeeded boolean)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare changed integer;
begin
 update private.media_cleanup_jobs set
  completed_at=case when succeeded then now() end,
  not_before=case when succeeded then not_before else now()+least(interval '24 hours',interval '1 minute'*power(2,least(attempts,10))) end,
  last_error=case when succeeded then null else 'Storage deletion failed; retry scheduled' end,
  lease_token=null,lease_until=null
 where id=job_id and lease_token=claim_token and lease_until>now() and completed_at is null;
 get diagnostics changed=row_count;
 return changed=1;
end $$;
revoke all on function public.claim_media_cleanup(integer),public.finish_media_cleanup(uuid,uuid,boolean) from public,anon,authenticated;
grant execute on function public.claim_media_cleanup(integer),public.finish_media_cleanup(uuid,uuid,boolean) to service_role;

-- Backfill only terminal assets; ready/attached processed files remain intact.
update public.media_assets set processing_status=processing_status where processing_status in ('ready','failed','removed');
commit;
