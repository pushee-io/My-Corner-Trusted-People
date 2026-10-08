-- Fixture-only acceptance of database contracts; no real files/accounts are modified.
begin;
create function pg_temp.identity_assert(ok boolean, label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception '%', label; end if; end $$;
create function pg_temp.identity_denied(statement text) returns void language plpgsql as $$
begin execute statement; raise exception 'Unauthorized operation succeeded';
exception when insufficient_privilege then null; end $$;
update public.feature_flags set enabled=true where key='shared_media_uploads';
insert into public.profiles(id,auth_user_id,display_name,role) values
 ('98000000-0000-4000-8000-000000000001','98000000-0000-4000-8000-000000000001','PRIVATE SELLER','requester'),
 ('98000000-0000-4000-8000-000000000002','98000000-0000-4000-8000-000000000002','PRIVATE BUYER','requester'),
 ('98000000-0000-4000-8000-000000000003','98000000-0000-4000-8000-000000000003','UNRELATED NEIGHBOR','requester'),
 ('98000000-0000-4000-8000-000000000004','98000000-0000-4000-8000-000000000004','OUTSIDER','requester');
insert into private.public_profile_names(profile_id,display_name) values
 ('98000000-0000-4000-8000-000000000001','Approved seller'),
 ('98000000-0000-4000-8000-000000000002','Approved buyer');
insert into public.neighborhoods(id,name,city,country_code) values
 ('98000000-0000-4000-8000-000000000090','Identity test area','Accra','GH');
insert into public.neighborhood_memberships(profile_id,neighborhood_id,is_primary,status,verified_at)
select id,'98000000-0000-4000-8000-000000000090',true,'verified',now() from public.profiles
where id in ('98000000-0000-4000-8000-000000000001','98000000-0000-4000-8000-000000000002','98000000-0000-4000-8000-000000000003');
insert into public.marketplace_listings(id,neighborhood_id,seller_id,title,description,pickup_area,moderation_status) values
 ('98000000-0000-4000-8000-000000000010','98000000-0000-4000-8000-000000000090','98000000-0000-4000-8000-000000000001','Fixture item','Fictional item','General area','clean');
-- Real authenticated reservation and interest creation.
set local role authenticated;
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000001';
select public.begin_media_upload('profile','image','98000000-0000-4000-8000-000000000031');
insert into storage.objects(bucket_id,name) values
 ('media-originals','98000000-0000-4000-8000-000000000001/98000000-0000-4000-8000-000000000031/media.jpg');
select pg_temp.identity_denied($q$select public.attach_media('profile','98000000-0000-4000-8000-000000000001',array['98000000-0000-4000-8000-000000000031'::uuid])$q$);
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000002';
select public.begin_media_upload('profile','image','98000000-0000-4000-8000-000000000032');
insert into public.marketplace_pickup_requests(id,listing_id,requester_id,message,status,general_area,proposed_start,proposed_end) values
 ('98000000-0000-4000-8000-000000000020','98000000-0000-4000-8000-000000000010','98000000-0000-4000-8000-000000000002','Fictional interest','proposed','General area',now()+interval '1 day',now()+interval '25 hours');
select pg_temp.identity_assert((select requester_id='98000000-0000-4000-8000-000000000002' from public.marketplace_pickup_requests where id='98000000-0000-4000-8000-000000000020'),'interest links authenticated buyer');
-- Simulate processor metadata only; this does not test native upload or processing bytes.
reset role;
update public.media_assets set processing_status='ready',byte_size=1000,width=512,height=512
where id in ('98000000-0000-4000-8000-000000000031','98000000-0000-4000-8000-000000000032');
insert into storage.objects(bucket_id,name) select 'shared-media',storage_path from public.media_assets
where id in ('98000000-0000-4000-8000-000000000031','98000000-0000-4000-8000-000000000032');
set local role authenticated;
select public.attach_media('profile','98000000-0000-4000-8000-000000000002',array['98000000-0000-4000-8000-000000000032'::uuid]);
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000001';
select public.attach_media('profile','98000000-0000-4000-8000-000000000001',array['98000000-0000-4000-8000-000000000031'::uuid]);
select pg_temp.identity_assert(public.content_public_names('marketplace_pickup',array['98000000-0000-4000-8000-000000000020'::uuid])->0->>'name'='Approved buyer','seller resolves canonical buyer name');
select pg_temp.identity_assert(exists(select 1 from public.media_assets where id='98000000-0000-4000-8000-000000000032' and parent_id='98000000-0000-4000-8000-000000000002'),'seller resolves attached buyer avatar');
select pg_temp.identity_assert(exists(select 1 from storage.objects where bucket_id='shared-media' and name='98000000-0000-4000-8000-000000000002/98000000-0000-4000-8000-000000000032/media.jpg'),'seller can sign buyer avatar path');
select pg_temp.identity_denied($q$select public.attach_media('profile','98000000-0000-4000-8000-000000000002',array['98000000-0000-4000-8000-000000000031'::uuid])$q$);
select pg_temp.identity_denied($q$insert into storage.objects(bucket_id,name) values('media-originals','98000000-0000-4000-8000-000000000002/98000000-0000-4000-8000-000000000032/media.jpg')$q$);
-- Replacement uses a new object and atomically revokes the previous attachment.
select public.begin_media_upload('profile','image','98000000-0000-4000-8000-000000000033');
reset role;
update public.media_assets set processing_status='ready',byte_size=900,width=512,height=512 where id='98000000-0000-4000-8000-000000000033';
insert into storage.objects(bucket_id,name) select 'shared-media',storage_path from public.media_assets where id='98000000-0000-4000-8000-000000000033';
set local role authenticated;
select public.attach_media('profile','98000000-0000-4000-8000-000000000001',array['98000000-0000-4000-8000-000000000033'::uuid]);
select pg_temp.identity_assert((select count(*) from public.media_assets where parent_type='profile' and parent_id='98000000-0000-4000-8000-000000000001')=1,'exactly one replacement avatar');
select pg_temp.identity_assert(not exists(select 1 from storage.objects where bucket_id='shared-media' and name='98000000-0000-4000-8000-000000000001/98000000-0000-4000-8000-000000000031/media.jpg'),'old avatar access revoked');
-- Independent authenticated reload reads the persisted parent/path, no client cache.
reset role;
set local role authenticated;
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000002';
select pg_temp.identity_assert(public.content_public_names('marketplace_listing',array['98000000-0000-4000-8000-000000000010'::uuid])->0->>'name'='Approved seller','buyer resolves canonical seller name');
select pg_temp.identity_assert((select storage_path from public.media_assets where parent_type='profile' and parent_id='98000000-0000-4000-8000-000000000001')='98000000-0000-4000-8000-000000000001/98000000-0000-4000-8000-000000000033/media.jpg','replacement path survives authenticated reload');
select pg_temp.identity_assert(not exists(select 1 from public.profiles where id='98000000-0000-4000-8000-000000000001'),'seller private profile stays hidden');
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000003';
select pg_temp.identity_assert(not exists(select 1 from public.marketplace_pickup_requests where id='98000000-0000-4000-8000-000000000020'),'unrelated neighbor cannot enumerate interest');
select pg_temp.identity_assert(public.content_public_names('marketplace_pickup',array['98000000-0000-4000-8000-000000000020'::uuid])='[]','unrelated neighbor cannot resolve interest identity');
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000004';
select pg_temp.identity_assert(not exists(select 1 from public.media_assets where parent_id in ('98000000-0000-4000-8000-000000000001','98000000-0000-4000-8000-000000000002')),'outsider cannot read avatars');
select pg_temp.identity_denied($q$select public.begin_media_upload('profile','image','98000000-0000-4000-8000-000000000033')$q$);
reset role;
select pg_temp.identity_assert(not exists(select 1 from storage.buckets where id in ('media-originals','shared-media') and public),'avatar buckets remain private');
select pg_temp.identity_assert(not has_table_privilege('authenticated','public.media_assets','update'),'client cannot forge readiness or overwrite attachment');
rollback;
