begin;
create function pg_temp.check_name(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception '%',label;end if;end $$;
insert into public.profiles(id,auth_user_id,display_name,role) values
 ('97000000-0000-4000-8000-000000000001','97000000-0000-4000-8000-000000000001','Buyer legacy','requester'),
 ('97000000-0000-4000-8000-000000000002','97000000-0000-4000-8000-000000000002','DO NOT EXPOSE SELF VALUE','requester'),
 ('97000000-0000-4000-8000-000000000003','97000000-0000-4000-8000-000000000003','NO PUBLIC CONSENT','requester');
insert into public.private_identity_profiles(profile_id,legal_given_name,legal_family_name,public_display_name) values
 ('97000000-0000-4000-8000-000000000002','SECRET','LEGAL','Approved Seller'),
 ('97000000-0000-4000-8000-000000000003','SECRET','LEGAL','');
insert into private.public_profile_names(profile_id,display_name) values
 ('97000000-0000-4000-8000-000000000001','Approved Buyer');
insert into public.neighborhoods(id,name,city,country_code) values
 ('97000000-0000-4000-8000-000000000090','Names fixture','Accra','GH');
insert into public.neighborhood_memberships(profile_id,neighborhood_id,is_primary,status,verified_at) values
 ('97000000-0000-4000-8000-000000000001','97000000-0000-4000-8000-000000000090',true,'verified',now()),
 ('97000000-0000-4000-8000-000000000002','97000000-0000-4000-8000-000000000090',true,'verified',now());
insert into public.marketplace_listings(id,neighborhood_id,seller_id,title,description,pickup_area,moderation_status) values
 ('97000000-0000-4000-8000-000000000011','97000000-0000-4000-8000-000000000090','97000000-0000-4000-8000-000000000002','Fixture item','Fictional item','General area','clean'),
 ('97000000-0000-4000-8000-000000000012','97000000-0000-4000-8000-000000000090','97000000-0000-4000-8000-000000000003','No public name','Fictional item','General area','clean');
insert into public.marketplace_pickup_requests(id,listing_id,requester_id,message,status,general_area,proposed_start,proposed_end) values
 ('97000000-0000-4000-8000-000000000021','97000000-0000-4000-8000-000000000011','97000000-0000-4000-8000-000000000001','Fictional interest','proposed','General area',now()+interval '1 day',now()+interval '2 days');
insert into public.social_groups(id,name,description,neighborhood_id,created_by_profile_id,moderation_status) values
 ('97000000-0000-4000-8000-000000000030','Private group fixture','Fictional group','97000000-0000-4000-8000-000000000090','97000000-0000-4000-8000-000000000002','clean');
insert into public.social_group_memberships(group_id,profile_id,status,role) values
 ('97000000-0000-4000-8000-000000000030','97000000-0000-4000-8000-000000000001','accepted','member'),
 ('97000000-0000-4000-8000-000000000030','97000000-0000-4000-8000-000000000002','accepted','owner');
insert into public.social_group_posts(id,group_id,author_profile_id,body,moderation_status) values
 ('97000000-0000-4000-8000-000000000031','97000000-0000-4000-8000-000000000030','97000000-0000-4000-8000-000000000002','Group fixture body','clean');
insert into public.social_group_post_comments(id,post_id,author_profile_id,body,moderation_status) values
 ('97000000-0000-4000-8000-000000000032','97000000-0000-4000-8000-000000000031','97000000-0000-4000-8000-000000000002','Comment fixture','clean');
insert into public.neighborhood_clusters(id,name,city) values ('97000000-0000-4000-8000-000000000091','Names cluster','Accra');
insert into public.neighborhood_cluster_members(cluster_id,neighborhood_id) values ('97000000-0000-4000-8000-000000000091','97000000-0000-4000-8000-000000000090');
update public.feature_flags set enabled=true where key='events';
set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000002';
insert into public.events(id,neighborhood_id,title,description,starts_at,area_label,visibility) values
 ('97000000-0000-4000-8000-000000000041','97000000-0000-4000-8000-000000000090','Fixture Event','Fictional event for authorization checks',now()+interval '1 day','General area','verified_neighborhood_members');
update public.events set status='scheduled',moderation_status='approved' where id='97000000-0000-4000-8000-000000000041';
insert into public.event_comments(id,event_id,body) values ('97000000-0000-4000-8000-000000000042','97000000-0000-4000-8000-000000000041','Fixture comment');
update public.event_comments set moderation_status='approved' where id='97000000-0000-4000-8000-000000000042';
insert into public.event_rsvps(id,event_id,profile_id,attendee_display_name,status) values
 ('97000000-0000-4000-8000-000000000043','97000000-0000-4000-8000-000000000041','97000000-0000-4000-8000-000000000002','STALE SNAPSHOT','going');
set local role authenticated;set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000001';
select pg_temp.check_name(public.content_public_names('group_post',array['97000000-0000-4000-8000-000000000031'::uuid])->0->>'name'='Approved Seller','Group author canonical name');
select pg_temp.check_name(public.content_public_names('group_comment',array['97000000-0000-4000-8000-000000000032'::uuid])->0->>'name'='Approved Seller','Group comment canonical name');
select pg_temp.check_name(public.content_public_names('event',array['97000000-0000-4000-8000-000000000041'::uuid])->0->>'name'='Approved Seller','Event organizer canonical name');
select pg_temp.check_name(public.content_public_names('event_comment',array['97000000-0000-4000-8000-000000000042'::uuid])->0->>'name'='Approved Seller','Event comment canonical name');
select pg_temp.check_name(public.content_public_names('event_rsvp',array['97000000-0000-4000-8000-000000000043'::uuid])='[]','Ordinary Event viewer cannot enumerate attendee identity');

select pg_temp.check_name(public.content_public_names('marketplace_listing',array['97000000-0000-4000-8000-000000000011'::uuid])->0->>'name'='Approved Seller','Seller public name');
select pg_temp.check_name(public.content_public_names('marketplace_listing',array['97000000-0000-4000-8000-000000000012'::uuid])->0->>'name'='Neighbor','No consent must not reveal self or legal name');
select pg_temp.check_name(public.content_public_names('marketplace_listing',array['97000000-0000-4000-8000-000000000002'::uuid])='[]','Profile IDs are not content references');
select pg_temp.check_name(not exists(select 1 from public.profiles where id='97000000-0000-4000-8000-000000000002'),'Private base profile stays restricted');
set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000002';
select pg_temp.check_name(public.content_public_names('marketplace_pickup',array['97000000-0000-4000-8000-000000000021'::uuid])->0->>'name'='Approved Buyer','Seller sees buyer public name');
select pg_temp.check_name(public.content_public_names('event_rsvp',array['97000000-0000-4000-8000-000000000043'::uuid])->0->>'name'='Approved Seller','Own RSVP canonical name');
select public.own_public_name('Updated Seller');
set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000001';
select pg_temp.check_name(public.content_public_names('marketplace_listing',array['97000000-0000-4000-8000-000000000011'::uuid])->0->>'name'='Updated Seller','Explicit edit reflected across surfaces');
set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000003';
select pg_temp.check_name(public.content_public_names('marketplace_listing',array['97000000-0000-4000-8000-000000000011'::uuid])='[]','Unverified viewer rejected');
select pg_temp.check_name(public.content_public_names('marketplace_pickup',array['97000000-0000-4000-8000-000000000021'::uuid])='[]','Nonparticipant buyer name rejected');
reset role;
update public.social_group_memberships set status='removed' where profile_id='97000000-0000-4000-8000-000000000001';
set local role authenticated;set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000001';
select pg_temp.check_name(public.content_public_names('group_post',array['97000000-0000-4000-8000-000000000031'::uuid])='[]','Removed group member denied author name');
select pg_temp.check_name(public.content_public_names('group_comment',array['97000000-0000-4000-8000-000000000032'::uuid])='[]','Removed group member denied comment name');
reset role;
update public.events set visibility='invite_only' where id='97000000-0000-4000-8000-000000000041';
set local role authenticated;set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000001';
select pg_temp.check_name(public.content_public_names('event',array['97000000-0000-4000-8000-000000000041'::uuid])='[]','Uninvited Event viewer denied identity');
select pg_temp.check_name(public.content_public_names('event_comment',array['97000000-0000-4000-8000-000000000042'::uuid])='[]','Uninvited Event viewer denied comment identity');
reset role;
update public.marketplace_listings set moderation_status='blocked' where id='97000000-0000-4000-8000-000000000011';
set local role authenticated;set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000001';
select pg_temp.check_name(public.content_public_names('marketplace_listing',array['97000000-0000-4000-8000-000000000011'::uuid])='[]','Blocked listing name rejected');
reset role;
select pg_temp.check_name(not has_function_privilege('anon','public.content_public_names(text,uuid[])','execute'),'Anonymous lookup denied');
select pg_temp.check_name(not has_function_privilege('authenticated','private.neighbor_name(uuid)','execute'),'No arbitrary profile directory');
select pg_temp.check_name(not (select prosecdef from pg_proc where oid='public.content_public_names(text,uuid[])'::regprocedure),'Public wrapper stays invoker');
rollback;
