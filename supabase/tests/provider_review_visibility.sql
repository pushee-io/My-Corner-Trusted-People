begin;
create function pg_temp.assert_true(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception '%',label; end if; end $$;
create function pg_temp.denied(command text,expected text) returns void language plpgsql as $$
begin
 begin execute command; exception when others then
  if sqlstate=expected then return; end if; raise;
 end;
 raise exception 'Unexpectedly permitted: %',command;
end $$;
insert into public.profiles(id,auth_user_id,display_name,role) values
 ('97000000-0000-4000-8000-000000000001','97000000-0000-4000-8000-000000000001','PRIVATE LEGAL REQUESTER','requester'),
 ('97000000-0000-4000-8000-000000000002','97000000-0000-4000-8000-000000000002','Provider','provider'),
 ('97000000-0000-4000-8000-000000000003','97000000-0000-4000-8000-000000000003','Outsider','requester'),
 ('97000000-0000-4000-8000-000000000004','97000000-0000-4000-8000-000000000004','Moderator','moderator');
insert into public.provider_profiles(id,profile_id,business_name,headline,general_area,availability) values
 ('97000000-0000-4000-8000-000000000010','97000000-0000-4000-8000-000000000002','QA Plumbing','Fixture','QA area','Available');
insert into public.job_requests(id,requester_id,provider_id,title,description,original_user_text,urgency,preferred_date,preferred_time,contact_preference,general_area_label,status)
 select ('97000000-0000-4000-8000-00000000002'||n)::uuid,'97000000-0000-4000-8000-000000000001','97000000-0000-4000-8000-000000000010',
 'QA repair','Repair fixture','Repair fixture','soon',current_date,'Morning','app_update','QA area',case when n=1 then 'Submitted'::public.request_status else 'Completed'::public.request_status end
 from generate_series(0,2) n;
insert into public.job_safety_sessions(job_request_id,state,requester_completed_at,provider_completed_at,completed_at)
 values('97000000-0000-4000-8000-000000000020','completed',now(),now(),now());
update public.feature_flags set enabled=true where key='verified_job_reviews';

insert into public.job_requests(id,requester_id,provider_id,title,description,original_user_text,urgency,preferred_date,preferred_time,contact_preference,general_area_label,exact_address_private,status)
 values('97000000-0000-4000-8000-000000000023','97000000-0000-4000-8000-000000000001','97000000-0000-4000-8000-000000000010','PRIVATE JOB','PRIVATE LOCATION','PRIVATE EMAIL','soon',current_date,'Morning','app_update','QA','SECRET EXACT ADDRESS','Completed');
insert into public.job_safety_sessions(job_request_id,state,requester_completed_at,provider_completed_at) values('97000000-0000-4000-8000-000000000023','completed',now(),now());
insert into public.reviews(id,job_request_id,reviewer_id,provider_id,rating,title,body,recommends,verified_job,moderation_status,public_author,created_at,provider_response,responded_at,response_status) values
 ('97000000-0000-4000-8000-000000000030','97000000-0000-4000-8000-000000000020','97000000-0000-4000-8000-000000000001','97000000-0000-4000-8000-000000000010',4,'First public review','Clear communication and professional work.',true,true,'clean','Ama K.',now()-interval '1 day','Thank you for choosing us.',now(),'clean'),
 ('97000000-0000-4000-8000-000000000031','97000000-0000-4000-8000-000000000023','97000000-0000-4000-8000-000000000001','97000000-0000-4000-8000-000000000010',2,'Second public review','Communication needed improvement.',false,true,'clean','Ama K.',now(),null,null,'not_run'),
 ('97000000-0000-4000-8000-000000000032','97000000-0000-4000-8000-000000000021','97000000-0000-4000-8000-000000000001','97000000-0000-4000-8000-000000000010',5,'Unfinished private review','Not a completed job review.',true,true,'clean','Neighbor',now(),null,null,'not_run'),
 ('97000000-0000-4000-8000-000000000033','97000000-0000-4000-8000-000000000022','97000000-0000-4000-8000-000000000001','97000000-0000-4000-8000-000000000010',5,'Missing safety completion','Not a confirmed completed job.',true,true,'clean','Neighbor',now(),null,null,'not_run');
insert into public.provider_profiles(id,business_name,headline,general_area,availability) values('97000000-0000-4000-8000-000000000011','No reviews provider','QA','QA','Available');
create temporary table review_pages(first_page jsonb,second_page jsonb);
grant all on review_pages to authenticated;
set local role authenticated;
set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000003';
select pg_temp.assert_true(exists(select 1 from public.provider_profiles where id='97000000-0000-4000-8000-000000000010'),'Neighbor cannot view provider');
insert into review_pages(first_page) select public.review_api('provider','97000000-0000-4000-8000-000000000010','{"limit":1}');
update review_pages set second_page=public.review_api('provider','97000000-0000-4000-8000-000000000010',jsonb_build_object('limit',1,'before',first_page->'nextCursor'));
select pg_temp.assert_true((first_page->>'average')::numeric=3 and (first_page->>'count')::int=2 and first_page->>'verifiedCount'='2','Aggregate differs from eligible rows') from review_pages;
select pg_temp.assert_true(jsonb_array_length(first_page->'reviews')=1 and first_page->'reviews'->0->>'title'='Second public review','Newest page incorrect') from review_pages;
select pg_temp.assert_true(second_page->'reviews'->0->>'title'='First public review' and second_page->'reviews'->0->>'response'='Thank you for choosing us.','Response attached to wrong review') from review_pages;
select pg_temp.assert_true(second_page->'nextCursor'='null'::jsonb,'Last page cursor incorrect') from review_pages;
select pg_temp.assert_true(first_page::text not like '%PRIVATE%' and second_page::text not like '%PRIVATE%' and second_page::text not like '%SECRET%' and second_page::text not like '%97000000-0000-4000-8000-000000000001%' and second_page::text not like '%97000000-0000-4000-8000-000000000020%','Private identity/job leaked') from review_pages;
select pg_temp.assert_true(second_page->'reviews'->0->>'author'='Ama K.','Approved public author missing') from review_pages;
select pg_temp.assert_true((public.review_api('provider','97000000-0000-4000-8000-000000000011')->>'count')::int=0,'Other provider review leaked');
select pg_temp.assert_true(jsonb_array_length(public.review_api('provider','97000000-0000-4000-8000-000000000010','{"limit":0}')->'reviews')=0,'Summary unnecessarily loads history');
reset role;
update public.reviews set moderation_status='blocked' where id='97000000-0000-4000-8000-000000000031';
set local role authenticated;
select pg_temp.assert_true((public.review_api('provider','97000000-0000-4000-8000-000000000010')->>'count')::int=1 and (public.review_api('provider','97000000-0000-4000-8000-000000000010')->>'average')::numeric=4,'Removed review affects aggregate');
select pg_temp.assert_true(public.review_api('provider','97000000-0000-4000-8000-000000000010')::text not like '%Second public review%','Removed review displayed');
reset role;
update public.reviews set moderation_status='flagged' where id='97000000-0000-4000-8000-000000000030';
set local role authenticated;
select pg_temp.assert_true((public.review_api('provider','97000000-0000-4000-8000-000000000010')->>'count')::int=0,'Held review displayed');
reset role;
update public.provider_profiles set accepting_requests=false where id='97000000-0000-4000-8000-000000000010';
set local role authenticated;
select pg_temp.denied($q$select public.review_api('provider','97000000-0000-4000-8000-000000000010')$q$,'42501');
reset role;
rollback;
