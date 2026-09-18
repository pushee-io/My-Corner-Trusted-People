begin;
create function pg_temp.cleanup_assert(ok boolean,message text) returns void language plpgsql as $$
begin if not coalesce(ok,false) then raise exception '%',message; end if; end $$;
select pg_temp.cleanup_assert(not has_table_privilege('authenticated','private.media_cleanup_jobs','select'),'queue leaked to users');
select pg_temp.cleanup_assert(not has_function_privilege('authenticated','public.claim_media_cleanup(integer)','execute'),'client can claim cleanup');
select pg_temp.cleanup_assert(not has_function_privilege('anon','public.finish_media_cleanup(uuid,uuid,boolean)','execute'),'anonymous can acknowledge deletion');
insert into public.profiles(id,auth_user_id,display_name,role) values
 ('81000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000001','Fictional cleanup owner','requester');
update public.feature_flags set enabled=true where key='shared_media_uploads';
set local role authenticated;
set local request.jwt.claim.sub='81000000-0000-4000-8000-000000000001';
select public.begin_media_upload('profile','image','82000000-0000-4000-8000-000000000001');
select public.remove_media('82000000-0000-4000-8000-000000000001');
reset role;
select pg_temp.cleanup_assert((select count(*)=2 from private.media_cleanup_jobs),'removed image must enqueue both buckets');
select pg_temp.cleanup_assert((select bool_and(not_before>=now()+interval '3 hours 10 minutes') from private.media_cleanup_jobs),'cleanup must outlast all signed upload tokens');
set local role service_role;
select pg_temp.cleanup_assert((select count(*)=0 from public.claim_media_cleanup()),'fresh removal deleted too soon');
reset role;
-- Advance only fixture queue timestamps, avoiding wall-clock sleeps.
update private.media_cleanup_jobs set not_before=now()-interval '1 minute';
create temp table first_claim as select * from public.claim_media_cleanup(1);
select pg_temp.cleanup_assert((select count(*)=1 from first_claim),'batch limit ignored');
select pg_temp.cleanup_assert((select count(*)=1 from public.claim_media_cleanup(50)),'active lease was claimed twice');
select pg_temp.cleanup_assert(not public.finish_media_cleanup((select id from first_claim),gen_random_uuid(),true),'stale/wrong lease acknowledged');
select pg_temp.cleanup_assert(public.finish_media_cleanup((select id from first_claim),(select lease_token from first_claim),false),'failure acknowledgement lost');
select pg_temp.cleanup_assert((select completed_at is null and not_before>now() and last_error is not null from private.media_cleanup_jobs where id=(select id from first_claim)),'failed deletion did not back off');
update private.media_cleanup_jobs set not_before=now()-interval '1 minute',lease_until=now()-interval '1 minute';
create temp table second_claim as select * from public.claim_media_cleanup();
select pg_temp.cleanup_assert((select count(*)=2 from second_claim),'expired leases not recovered');
select pg_temp.cleanup_assert(not public.finish_media_cleanup((select id from first_claim),(select lease_token from first_claim),true),'old worker overwrote a new lease');
select public.finish_media_cleanup(id,lease_token,true) from second_claim;
select pg_temp.cleanup_assert((select count(*)=0 from public.claim_media_cleanup()),'completed jobs claimed again');

set local role authenticated;
select public.begin_media_upload('profile','image','82000000-0000-4000-8000-000000000002');
select public.begin_media_upload('group_post','video','82000000-0000-4000-8000-000000000003');
reset role;
update public.media_assets set created_at=now()-interval '25 hours' where id='82000000-0000-4000-8000-000000000002';
select count(*) from public.claim_media_cleanup();
select pg_temp.cleanup_assert((select processing_status='removed' from public.media_assets where id='82000000-0000-4000-8000-000000000002'),'abandoned upload not removed');
-- Fake a ready, attached video without uploading bytes to test parent cascade.
update public.media_assets set parent_id='83000000-0000-4000-8000-000000000001',processing_status='ready',
 byte_size=100,width=100,height=100,duration_seconds=1,
 poster_path=owner_profile_id::text||'/'||id::text||'/poster.jpg'
 where id='82000000-0000-4000-8000-000000000003';
insert into public.neighborhoods(id,name,city,country_code) values
 ('84000000-0000-4000-8000-000000000001','Fictional cleanup area','Accra','GH');
insert into public.social_groups(id,name,description,neighborhood_id,visibility,created_by_profile_id) values
 ('85000000-0000-4000-8000-000000000001','Fictional cleanup group','Cleanup verification','84000000-0000-4000-8000-000000000001','verified_neighborhood_members','81000000-0000-4000-8000-000000000001');
insert into public.social_group_posts(id,group_id,author_profile_id,body) values
 ('83000000-0000-4000-8000-000000000001','85000000-0000-4000-8000-000000000001','81000000-0000-4000-8000-000000000001','Fictional cleanup post');
delete from public.social_group_posts where id='83000000-0000-4000-8000-000000000001';
select pg_temp.cleanup_assert((select processing_status='removed' from public.media_assets where id='82000000-0000-4000-8000-000000000003'),'parent deletion kept media live');
select pg_temp.cleanup_assert((select count(*)=4 from private.media_cleanup_jobs where asset_id='82000000-0000-4000-8000-000000000003'),'video/poster cleanup missing');
delete from public.profiles where id='81000000-0000-4000-8000-000000000001';
select pg_temp.cleanup_assert((select count(*)=8 from private.media_cleanup_jobs),'profile cascade lost durable deletion jobs');
rollback;
