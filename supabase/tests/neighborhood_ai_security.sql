begin;
create function pg_temp.ai_assert(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception '%',label;end if;end $$;
create function pg_temp.ai_denied(command text) returns void language plpgsql as $$
begin execute command;raise exception 'Unexpectedly permitted: %',command;
exception when insufficient_privilege then null;end $$;
select pg_temp.ai_assert(not (select enabled from public.feature_flags where key='ai_neighborhood_assistant'),'Assistant enabled by migration');
select pg_temp.ai_assert(not has_function_privilege('anon','public.neighborhood_ai_search(text,text,uuid,timestamptz,timestamptz)','execute'),'Anonymous retrieval allowed');
select pg_temp.ai_assert(not (select prosecdef from pg_proc where oid='public.neighborhood_ai_search(text,text,uuid,timestamptz,timestamptz)'::regprocedure),'Retrieval bypasses RLS');
select pg_temp.ai_assert(not has_table_privilege('authenticated','private.neighborhood_ai_runs','select'),'Private metrics readable');
update public.feature_flags set enabled=true where key in ('ai_neighborhood_assistant','events');
insert into public.profiles(id,auth_user_id,display_name,role) values
 ('a1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000001','PRIVATE LEGAL VIEWER','requester'),
 ('a1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000002','PRIVATE LEGAL AUTHOR','requester'),
 ('a1000000-0000-4000-8000-000000000003','a1000000-0000-4000-8000-000000000003','PRIVATE MODERATOR','moderator');
insert into public.neighborhoods(id,name,city,country_code,region) values
 ('a2000000-0000-4000-8000-000000000001','AI test area','Accra','GH','Greater Accra'),
 ('a2000000-0000-4000-8000-000000000002','Other private area','Accra','GH','Greater Accra');
insert into public.neighborhood_memberships(profile_id,neighborhood_id,is_primary,status,verified_at)
 select id,'a2000000-0000-4000-8000-000000000001',true,'verified',now() from public.profiles where id in
 ('a1000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000003');
insert into public.neighborhood_feed_posts(id,neighborhood_id,author_id,body,moderation_status) values
 ('a3000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000002','Park project discussion favors lighting. No formal decision recorded.','clean'),
 ('a3000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000002','PRIVATE OTHER NEIGHBORHOOD','clean'),
 ('a3000000-0000-4000-8000-000000000003','a2000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000002','PRIVATE REMOVED POST','blocked'),
 ('a3000000-0000-4000-8000-000000000004','a2000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000002','PRIVATE HELD POST','flagged');
insert into public.social_groups(id,name,description,neighborhood_id,created_by_profile_id) values
 ('a4000000-0000-4000-8000-000000000001','Sensitive test group','Members only','a2000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000002');
insert into public.social_group_memberships(group_id,profile_id,status,role) values
 ('a4000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000002','accepted','owner');
insert into public.social_group_posts(id,group_id,author_profile_id,body) values
 ('a4000000-0000-4000-8000-000000000002','a4000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000002','PRIVATE GROUP DISCUSSION');
insert into public.agency_broadcasts(id,agency_name,title,body,scope,neighborhood_id,is_agency_approved,moderation_status,published_at,expires_at,approved_at) values
 ('a5000000-0000-4000-8000-000000000001','Fictional Roads Agency','Road closure demo','Fictional Boundary Road closure.','neighborhood','a2000000-0000-4000-8000-000000000001',true,'clean',now()-interval '1 hour',now()+interval '1 hour',now()-interval '1 hour'),
 ('a5000000-0000-4000-8000-000000000002','Fictional Roads Agency','PRIVATE EXPIRED','Old closure.','neighborhood','a2000000-0000-4000-8000-000000000001',true,'clean',now()-interval '3 hours',now()-interval '1 hour',now()-interval '3 hours');
insert into public.marketplace_listings(id,neighborhood_id,seller_id,title,description,availability,pickup_area,pickup_notes) values
 ('a6000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000002','Dining table','Fictional used table','available','General area','PRIVATE PICKUP INSTRUCTIONS');
insert into public.neighborhood_clusters(id,name,region_id) values('a2100000-0000-4000-8000-000000000001','AI test cluster','greater-accra');
insert into public.neighborhood_cluster_members(neighborhood_id,cluster_id) values('a2000000-0000-4000-8000-000000000001','a2100000-0000-4000-8000-000000000001');
-- The production Event trigger derives ownership from the authenticated fixture.
set local request.jwt.claim.sub='a1000000-0000-4000-8000-000000000002';
insert into public.events(id,neighborhood_id,organizer_profile_id,organizer_display_name,title,description,starts_at,area_label,visibility,status,moderation_status) values
 ('a7000000-0000-4000-8000-000000000001','a2000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000002','Fictional Organizer','Food drive demo','Family-friendly fictional food drive',now()+interval '1 day','General area','verified_neighborhood_members','scheduled','approved'),
 ('a7000000-0000-4000-8000-000000000002','a2000000-0000-4000-8000-000000000001','a1000000-0000-4000-8000-000000000002','Fictional Organizer','PRIVATE INVITATION','Private event',now()+interval '1 day','PRIVATE HOME LOCATION','invite_only','scheduled','approved');
update public.events set status='scheduled',moderation_status='approved' where id in ('a7000000-0000-4000-8000-000000000001','a7000000-0000-4000-8000-000000000002');
create temporary table ai_results(kind text,data jsonb);grant all on ai_results to authenticated;
set local role authenticated;
set local request.jwt.claim.sub='a1000000-0000-4000-8000-000000000001';
insert into ai_results select k,public.neighborhood_ai_search(k) from unnest(array['event','post','group','agency','marketplace']) k;
select pg_temp.ai_assert(data::text not like '%PRIVATE%','Sensitive source/identity/location leaked: '||kind) from ai_results;
select pg_temp.ai_assert(case when kind='agency' then jsonb_array_length(data)>=1 else jsonb_array_length(data)=case when kind='group' then 0 else 1 end end,'Incorrect source selection: '||kind) from ai_results;
select pg_temp.ai_assert(public.neighborhood_ai_search('post','park')::text like '%No formal decision recorded%','Memory source absent');
select pg_temp.ai_assert(jsonb_array_length(public.neighborhood_ai_search('event','food',null,now()+interval '2 days'))=0,'Time window ignored');
select pg_temp.ai_denied($q$select public.neighborhood_ai_context('a2000000-0000-4000-8000-000000000002')$q$);
-- Neither moderator nor organizer privileges open private events/groups to assistant retrieval.
set local request.jwt.claim.sub='a1000000-0000-4000-8000-000000000003';
select pg_temp.ai_assert(jsonb_array_length(public.neighborhood_ai_search('group'))=0,'Moderator group privilege leaked');
select pg_temp.ai_assert(public.neighborhood_ai_search('event')::text not like '%PRIVATE%','Moderator private event leaked');
reset role;
insert into public.blocks(blocker_id,blocked_id) values('a1000000-0000-4000-8000-000000000002','a1000000-0000-4000-8000-000000000001');
set local role authenticated;set local request.jwt.claim.sub='a1000000-0000-4000-8000-000000000001';
select pg_temp.ai_assert(jsonb_array_length(public.neighborhood_ai_search('post'))=0,'Reverse block ignored');
reset role;
insert into private.community_account_controls(profile_id,suspended) values('a1000000-0000-4000-8000-000000000001',true);
set local role authenticated;
select pg_temp.ai_denied($q$select public.neighborhood_ai_search('post')$q$);
select pg_temp.ai_denied($q$select public.neighborhood_ai_meter('start')$q$);
reset role;
update private.community_account_controls set suspended=false where profile_id='a1000000-0000-4000-8000-000000000001';
delete from public.blocks where blocker_id='a1000000-0000-4000-8000-000000000002';
delete from public.neighborhood_feed_posts where id='a3000000-0000-4000-8000-000000000001';
set local role authenticated;
select pg_temp.ai_assert(jsonb_array_length(public.neighborhood_ai_search('post'))=0,'Deleted content retained');
select pg_temp.ai_assert(public.neighborhood_ai_meter('start')->>'id' is not null,'Allowance denied');
select pg_temp.ai_denied($q$select * from private.neighborhood_ai_runs$q$);
-- Verify no forbidden relations/columns occur in the retrieval definition.
select pg_temp.ai_assert(pg_get_functiondef('public.neighborhood_ai_search(text,text,uuid,timestamptz,timestamptz)'::regprocedure) !~ 'marketplace_messages|private_addresses|job_requests|job_safety_sessions|moderation_cases|pickup_notes|pickup_area|exact_address|legal_given_name','Forbidden retrieval source');
reset role;
rollback;
