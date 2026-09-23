begin;
create function pg_temp.assert_true(ok boolean,label text) returns void language plpgsql as $$begin if ok is distinct from true then raise exception '%',label;end if;end$$;
insert into public.profiles(id,auth_user_id,display_name,role) values
 ('99000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000001','PRIVATE REQUESTER','requester'),
 ('99000000-0000-4000-8000-000000000002','99000000-0000-4000-8000-000000000002','PRIVATE PROVIDER','provider'),
 ('99000000-0000-4000-8000-000000000003','99000000-0000-4000-8000-000000000003','OUTSIDER','requester');
insert into public.provider_profiles(id,profile_id,business_name,headline,general_area,availability) values
 ('99000000-0000-4000-8000-000000000010','99000000-0000-4000-8000-000000000002','QA Provider','Fixture','QA','Available');
update public.feature_flags set enabled=true where key='community_notifications';
insert into public.job_requests(id,requester_id,provider_id,title,description,original_user_text,urgency,preferred_date,preferred_time,contact_preference,general_area_label)
 values('99000000-0000-4000-8000-000000000020','99000000-0000-4000-8000-000000000001','99000000-0000-4000-8000-000000000010',
 'PRIVATE JOB TITLE','PRIVATE DESCRIPTION','PRIVATE ORIGINAL','soon',current_date,'Morning','app_update','QA');
insert into public.job_safety_sessions(job_request_id) values('99000000-0000-4000-8000-000000000020');
-- A no-op update must not spam a second safety notification.
update public.job_safety_sessions set state=state where job_request_id='99000000-0000-4000-8000-000000000020';
insert into public.domain_event_outbox(id,aggregate_type,aggregate_id,recipient_profile_id,event_type,payload,available_at) values
 ('99000000-0000-4000-8000-000000000030','event','99000000-0000-4000-8000-000000000040','99000000-0000-4000-8000-000000000001','event_reminder','{"message":"PRIVATE EVENT PAYLOAD"}',now()),
 ('99000000-0000-4000-8000-000000000031','event','99000000-0000-4000-8000-000000000041','99000000-0000-4000-8000-000000000001','event_reminder','{}',now()+interval '1 day');
set local role authenticated;
set local request.jwt.claim.sub='99000000-0000-4000-8000-000000000001';
select pg_temp.assert_true(jsonb_array_length(public.notification_api('list'))=3,'Missing or duplicate notification / future reminder visible');
select pg_temp.assert_true(public.notification_api('list')::text not like '%PRIVATE%','Private text leaked');
select pg_temp.assert_true(exists(select 1 from jsonb_array_elements(public.notification_api('list')) n where n->>'targetKind'='hire_updated' and (n->>'isRequester')::boolean),'Requester route incorrect');
select public.notification_api('read','99000000-0000-4000-8000-000000000030');
set local request.jwt.claim.sub='99000000-0000-4000-8000-000000000002';
select pg_temp.assert_true(jsonb_array_length(public.notification_api('list'))=2,'Provider notices missing');
select pg_temp.assert_true(exists(select 1 from jsonb_array_elements(public.notification_api('list')) n where n->>'targetKind'='hire_updated' and not (n->>'isRequester')::boolean),'Provider route incorrect');
set local request.jwt.claim.sub='99000000-0000-4000-8000-000000000003';
select pg_temp.assert_true(public.notification_api('list')='[]'::jsonb,'Outsider read notifications');
select public.notification_api('read','99000000-0000-4000-8000-000000000031');
reset role;
select pg_temp.assert_true((select in_app_read_at is not null and processed_at is null from public.domain_event_outbox where id='99000000-0000-4000-8000-000000000030'),'In-app read changed delivery status');
select pg_temp.assert_true((select in_app_read_at is null from public.domain_event_outbox where id='99000000-0000-4000-8000-000000000031'),'Outsider marked future reminder read');
rollback;
