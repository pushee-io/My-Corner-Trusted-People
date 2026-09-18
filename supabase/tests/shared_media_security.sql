begin;
create function pg_temp.media_assert(ok boolean, message text) returns void language plpgsql as $$
begin if not coalesce(ok,false) then raise exception '%',message; end if; end $$;
create function pg_temp.media_denied(statement text, message text) returns void language plpgsql as $$
begin execute statement; raise exception using errcode='ZX001',message=message;
exception when insufficient_privilege then null; end $$;
select pg_temp.media_assert(not (select enabled from public.feature_flags where key='shared_media_uploads'),'media must be disabled by migrations');
select pg_temp.media_assert(not exists(select 1 from storage.buckets where id in('media-originals','shared-media') and public),'buckets must be private');
select pg_temp.media_assert(not has_table_privilege('authenticated','public.media_assets','update'),'clients cannot mark files ready');
select pg_temp.media_assert(not has_function_privilege('anon','public.begin_media_upload(text,text,uuid)','execute'),'anonymous uploads denied');
update public.feature_flags set enabled=true where key in('shared_media_uploads','events');
insert into public.profiles(id,auth_user_id,display_name,role) values
 ('71000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','Media test owner','requester'),
 ('71000000-0000-4000-8000-000000000002','71000000-0000-4000-8000-000000000002','Media test assigned provider','provider'),
 ('71000000-0000-4000-8000-000000000003','71000000-0000-4000-8000-000000000003','Media test outsider','provider'),
 ('71000000-0000-4000-8000-000000000004','71000000-0000-4000-8000-000000000004','Media test neighbor','requester');
insert into public.neighborhoods(id,name,city,country_code) values ('72000000-0000-4000-8000-000000000001','Media test area','Accra','GH');
insert into public.neighborhood_memberships(profile_id,neighborhood_id,is_primary,status,verified_at)
select id,'72000000-0000-4000-8000-000000000001',true,'verified',now() from public.profiles where id in(
 '71000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000002','71000000-0000-4000-8000-000000000004');
insert into public.provider_profiles(id,profile_id,business_name,headline,general_area,availability,accepting_requests) values
 ('73000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000002','Fictional Media Provider','Test','Test area','Available',true);
insert into public.service_categories(id,name) values('media-test','Media test') on conflict(id) do nothing;
insert into public.job_requests(id,requester_id,provider_id,category_id,title,description,original_user_text,urgency,preferred_date,preferred_time,contact_preference,neighborhood_id,general_area_label,status) values
 ('74000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','73000000-0000-4000-8000-000000000001','media-test','Media test request','Fictional repair','Fictional repair','flexible',current_date,'Morning','app_update','72000000-0000-4000-8000-000000000001','General area only','Submitted');
insert into public.neighborhood_feed_posts(id,neighborhood_id,author_id,body) values
 ('75000000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','Fictional photo update');
insert into public.social_groups(id,name,description,neighborhood_id,visibility,created_by_profile_id) values
 ('76000000-0000-4000-8000-000000000001','Media test group','Fictional members only group','72000000-0000-4000-8000-000000000001','verified_neighborhood_members','71000000-0000-4000-8000-000000000001');
insert into public.social_group_memberships(group_id,profile_id,status,role) values
 ('76000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','accepted','owner'),
 ('76000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000002','accepted','member');
insert into public.social_group_posts(id,group_id,author_profile_id,body) values
 ('77000000-0000-4000-8000-000000000001','76000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','Fictional private group photo');
insert into public.marketplace_listings(id,neighborhood_id,seller_id,title,description,availability,pickup_area) values
 ('78000000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','Fictional table','Test item','available','General area');
insert into public.neighborhood_clusters(id,name,region_id) values('72100000-0000-4000-8000-000000000001','Media test cluster','greater-accra');
insert into public.events(id,neighborhood_id,cluster_id,organizer_profile_id,organizer_display_name,title,description,starts_at,area_label,visibility,status,moderation_status) values
 ('78100000-0000-4000-8000-000000000001','72000000-0000-4000-8000-000000000001','72100000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','Fictional Organizer','Fictional private event','Fictional event for access verification',now()+interval '1 day','General area','invite_only','scheduled','approved');
insert into public.event_organizers(event_id,profile_id,role) values('78100000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','owner') on conflict do nothing;
-- Reserve drafts through the authenticated RPC, then simulate only the trusted
-- processor's metadata update. No authenticated client receives that grant.
set local role authenticated;
set local request.jwt.claim.sub='71000000-0000-4000-8000-000000000001';
select public.begin_media_upload('profile','image','79000000-0000-4000-8000-000000000001');
select public.begin_media_upload('neighborhood_post','image','79000000-0000-4000-8000-000000000002');
select public.begin_media_upload('service_request','video','79000000-0000-4000-8000-000000000003');
select public.begin_media_upload('group_post','video','79000000-0000-4000-8000-000000000004');
select public.begin_media_upload('marketplace_listing','video','79000000-0000-4000-8000-000000000005');
select public.begin_media_upload('event','video','79000000-0000-4000-8000-000000000006');
select public.begin_media_upload('group_avatar','image','79000000-0000-4000-8000-000000000007');
select public.begin_media_upload('group_cover','image','79000000-0000-4000-8000-000000000008');
do $$ begin
 perform public.attach_media('profile','71000000-0000-4000-8000-000000000001',array['79000000-0000-4000-8000-000000000001'::uuid]);
 raise exception using errcode='ZX001',message='unprocessed media was published';
 exception when insufficient_privilege then null; end $$;
select pg_temp.media_denied($q$update public.media_assets set processing_status='ready'$q$,'clients forged ready');
insert into storage.objects(bucket_id,name) values('media-originals','71000000-0000-4000-8000-000000000001/79000000-0000-4000-8000-000000000001/media.jpg');
select pg_temp.media_assert((select count(*) from storage.objects where bucket_id='media-originals')=0,'original bytes must never be readable');
select pg_temp.media_denied($q$insert into storage.objects(bucket_id,name) values('media-originals','other-owner/arbitrary.jpg')$q$,'arbitrary paths allowed');
select pg_temp.media_denied($q$insert into storage.objects(bucket_id,name) values('shared-media','71000000-0000-4000-8000-000000000001/79000000-0000-4000-8000-000000000001/media.jpg')$q$,'client wrote sanitized bucket');
reset role;
update public.media_assets set processing_status='ready',byte_size=1000,width=640,height=480,
 duration_seconds=case when media_type='video' then 12 end,
 poster_path=case when media_type='video' then owner_profile_id::text||'/'||id::text||'/poster.jpg' end
 where owner_profile_id='71000000-0000-4000-8000-000000000001';
insert into storage.objects(bucket_id,name) select 'shared-media',storage_path from public.media_assets;
set local role authenticated;
select public.attach_media('profile','71000000-0000-4000-8000-000000000001',array['79000000-0000-4000-8000-000000000001'::uuid]);
select public.attach_media('neighborhood_post','75000000-0000-4000-8000-000000000001',array['79000000-0000-4000-8000-000000000002'::uuid]);
select public.attach_media('service_request','74000000-0000-4000-8000-000000000001',array['79000000-0000-4000-8000-000000000003'::uuid]);
select public.attach_media('group_post','77000000-0000-4000-8000-000000000001',array['79000000-0000-4000-8000-000000000004'::uuid]);
select public.attach_media('marketplace_listing','78000000-0000-4000-8000-000000000001',array['79000000-0000-4000-8000-000000000005'::uuid]);
select public.attach_media('event','78100000-0000-4000-8000-000000000001',array['79000000-0000-4000-8000-000000000006'::uuid]);
select public.attach_media('group_avatar','76000000-0000-4000-8000-000000000001',array['79000000-0000-4000-8000-000000000007'::uuid]);
select public.attach_media('group_cover','76000000-0000-4000-8000-000000000001',array['79000000-0000-4000-8000-000000000008'::uuid]);
select pg_temp.media_assert((select count(*) from public.media_assets)=8,'owner sees all ready authorized assets');
select pg_temp.media_denied($q$select public.attach_media('profile','71000000-0000-4000-8000-000000000002',array['79000000-0000-4000-8000-000000000001'::uuid])$q$,'cannot change another profile');
set local request.jwt.claim.sub='71000000-0000-4000-8000-000000000002';
select pg_temp.media_assert(exists(select 1 from public.media_assets where parent_type='service_request'),'assigned provider must read request media');
select pg_temp.media_assert(exists(select 1 from public.media_assets where parent_type='group_post'),'accepted group member must read media');
select pg_temp.media_assert(not exists(select 1 from public.media_assets where parent_type='event'),'uninvited member cannot read private event media');
select pg_temp.media_denied($q$select public.attach_media('event','78100000-0000-4000-8000-000000000001',array['79000000-0000-4000-8000-000000000006'::uuid])$q$,'unrelated event editor accepted');
select pg_temp.media_denied($q$select public.attach_media('service_request','74000000-0000-4000-8000-000000000001',array['79000000-0000-4000-8000-000000000003'::uuid])$q$,'provider cannot replace requester attachments');
set local request.jwt.claim.sub='71000000-0000-4000-8000-000000000004';
select pg_temp.media_assert(exists(select 1 from public.media_assets where parent_type='neighborhood_post'),'verified neighbor reads Feed media');
select pg_temp.media_assert(not exists(select 1 from public.media_assets where parent_type in('service_request','group_post')),'neighbor must not see private Hire or group media');
select pg_temp.media_denied($q$select public.remove_media('79000000-0000-4000-8000-000000000002')$q$,'neighbor deleted author media');
set local request.jwt.claim.sub='71000000-0000-4000-8000-000000000003';
select pg_temp.media_assert((select count(*) from public.media_assets)=0,'outsider cannot read any attachment metadata');
select pg_temp.media_assert((select count(*) from storage.objects)=0,'outsider cannot read signed-object paths');
select pg_temp.media_denied($q$select public.begin_media_upload('profile','image','79000000-0000-4000-8000-000000000001')$q$,'another owner reused upload id');
reset role;
insert into public.event_invitations(event_id,inviter_profile_id,invitee_profile_id,status,expires_at) values('78100000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000001','71000000-0000-4000-8000-000000000002','accepted',now()+interval '2 days');
set local role authenticated;
set local request.jwt.claim.sub='71000000-0000-4000-8000-000000000002';
select pg_temp.media_assert(exists(select 1 from public.media_assets where parent_type='event'),'accepted invitee can read private event media');
set local request.jwt.claim.sub='71000000-0000-4000-8000-000000000001';
select public.begin_media_upload('profile','image','79000000-0000-4000-8000-000000000011');
select public.begin_media_upload('service_request','video','79000000-0000-4000-8000-000000000012');
set local request.jwt.claim.sub='71000000-0000-4000-8000-000000000099';
select pg_temp.media_assert(public.current_profile_id() is null,'missing-profile test identity must have no profile');
select pg_temp.media_denied($q$select public.remove_media('79000000-0000-4000-8000-000000000011')$q$,'account without a profile removed another owner draft');
set local request.jwt.claim.sub='71000000-0000-4000-8000-000000000001';
reset role;
update public.media_assets set processing_status='ready',byte_size=1000,width=640,height=480,
 duration_seconds=case when media_type='video' then 12 end,
 poster_path=case when media_type='video' then owner_profile_id::text||'/'||id::text||'/poster.jpg' end
 where id in('79000000-0000-4000-8000-000000000011','79000000-0000-4000-8000-000000000012');
set local role authenticated;
select public.attach_media('profile','71000000-0000-4000-8000-000000000001',array['79000000-0000-4000-8000-000000000011'::uuid]);
select pg_temp.media_assert((select count(*) from public.media_assets where parent_type='profile')=1,'replacement keeps exactly one profile picture');
select pg_temp.media_assert(not exists(select 1 from public.media_assets where id='79000000-0000-4000-8000-000000000001'),'old profile picture is revoked');
do $$ begin
 perform public.attach_media('service_request','74000000-0000-4000-8000-000000000001',array['79000000-0000-4000-8000-000000000012'::uuid]);
 raise exception using errcode='ZX001',message='more than one video attached';
 exception when raise_exception then
   if sqlerrm <> 'Too many attachments' then raise; end if;
 end $$;
select public.attach_media('service_request','74000000-0000-4000-8000-000000000001',array['79000000-0000-4000-8000-000000000003'::uuid]);
select pg_temp.media_assert((select count(*) from public.media_assets where parent_type='service_request' and parent_id is not null)=1,'retry attaches idempotently without duplication');
reset role;
update public.social_group_memberships set status='removed' where profile_id='71000000-0000-4000-8000-000000000001';
set local role authenticated;
set local request.jwt.claim.sub='71000000-0000-4000-8000-000000000001';
select pg_temp.media_assert(not exists(select 1 from public.media_assets where parent_type='group_post'),'former member cannot read even their own group attachment');
select public.attach_media('profile','71000000-0000-4000-8000-000000000001','{}',true);
select pg_temp.media_assert(not exists(select 1 from public.media_assets where parent_type='profile'),'remove picture revokes metadata reads');
select pg_temp.media_assert(not exists(select 1 from storage.objects where name like '%79000000-0000-4000-8000-000000000001%'),'remove picture revokes storage reads');
reset role;
update public.feature_flags set enabled=false where key='shared_media_uploads';
set local role authenticated;
select pg_temp.media_assert((select count(*) from public.media_assets)=0,'disabled feature fails closed');
select pg_temp.media_denied($q$select public.begin_media_upload('profile','image','79000000-0000-4000-8000-000000000099')$q$,'disabled uploads accepted');
rollback;
