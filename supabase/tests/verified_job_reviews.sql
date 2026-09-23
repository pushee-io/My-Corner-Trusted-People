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
create temporary table review_context(id uuid);
grant all on review_context to authenticated;
set local role authenticated;
set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000003';
select pg_temp.denied($q$select public.review_api('submit','97000000-0000-4000-8000-000000000020','{"rating":5,"title":"Good work","body":"Good work and communication.","recommends":true}')$q$,'42501');
set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000001';
select pg_temp.denied($q$select public.review_api('submit','97000000-0000-4000-8000-000000000021','{"rating":5,"title":"Good work","body":"Good work and communication.","recommends":true}')$q$,'42501');
-- A forged Completed row without the two-party safety completion is insufficient.
select pg_temp.denied($q$select public.review_api('submit','97000000-0000-4000-8000-000000000022','{"rating":5,"title":"Good work","body":"Good work and communication.","recommends":true}')$q$,'42501');
select pg_temp.denied($q$select public.review_api('submit','97000000-0000-4000-8000-000000000020','{"rating":6,"title":"Good work","body":"Good work and communication.","recommends":true}')$q$,'22023');
select public.review_api('event','97000000-0000-4000-8000-000000000020','{"event":"review_started"}');
insert into review_context select (public.review_api('submit','97000000-0000-4000-8000-000000000020','{"rating":5,"title":"Good work","body":"Good work and communication.","recommends":true}')->>'id')::uuid;
select pg_temp.denied($q$select public.review_api('submit','97000000-0000-4000-8000-000000000020','{"rating":5,"title":"Good work","body":"Good work and communication.","recommends":true}')$q$,'23505');
select pg_temp.assert_true((public.review_api('provider','97000000-0000-4000-8000-000000000010')->>'count')::int=1,'Count must be one');
select pg_temp.assert_true(public.review_api('provider','97000000-0000-4000-8000-000000000010')::text not like '%PRIVATE LEGAL%','Legal name leaked');
select pg_temp.denied('select * from public.reviews','42501');
select public.review_api('submit','97000000-0000-4000-8000-000000000020','{"rating":4,"title":"Updated review","body":"Updated experience of this work.","recommends":true,"edit":true}');
set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000003';
select pg_temp.denied($q$select public.review_api('reply',id,'{"body":"Thanks for the review"}') from review_context$q$,'42501');
select public.review_api('report',id,'{"reason":"Please review this content"}') from review_context;
select pg_temp.assert_true((public.review_api('provider','97000000-0000-4000-8000-000000000010')->>'count')::int=1,'Report must not automatically remove review');
select pg_temp.denied($q$select public.review_api('queue')$q$,'42501');
set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000002';
select public.review_api('reply',id,'{"body":"Thank you for your feedback."}') from review_context;
select pg_temp.denied($q$select public.review_api('reply',id,'{"body":"Second response"}') from review_context$q$,'42501');
select pg_temp.denied($q$select public.review_api('submit','97000000-0000-4000-8000-000000000020','{"rating":1,"title":"Changed title","body":"Changed written review content.","recommends":false,"edit":true}')$q$,'42501');
set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000001';
select pg_temp.denied($q$select public.review_api('submit','97000000-0000-4000-8000-000000000020','{"rating":1,"title":"Changed title","body":"Changed written review content.","recommends":false,"edit":true}')$q$,'42501');
set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000004';
select public.review_api('moderate',id,'{"decision":"blocked","reason":"QA removal verification"}') from review_context;
select pg_temp.assert_true((public.review_api('provider','97000000-0000-4000-8000-000000000010')->>'count')::int=0,'Removed review counted');
reset role;
select pg_temp.assert_true((select count(*) from private.review_versions where review_id in (select id from review_context))=2,'Edit/moderation history missing');
select pg_temp.assert_true(exists(select 1 from public.notifications where target_kind='review_received' and profile_id='97000000-0000-4000-8000-000000000002'),'Provider notification missing');
insert into private.community_account_controls(profile_id,suspended) values('97000000-0000-4000-8000-000000000001',true);
set local role authenticated;
set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000001';
select pg_temp.denied($q$select public.review_api('mine')$q$,'42501');
reset role;
rollback;
