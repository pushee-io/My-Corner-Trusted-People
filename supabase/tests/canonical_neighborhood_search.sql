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

update public.feature_flags set enabled=true where key='ai_neighborhood_assistant';
insert into public.neighborhoods(id,name,city,country_code,region) values ('97000000-0000-4000-8000-000000000090','Assistant metrics fixture','Accra','GH','Greater Accra');
insert into public.neighborhood_memberships(profile_id,neighborhood_id,is_primary,status,verified_at) values ('97000000-0000-4000-8000-000000000003','97000000-0000-4000-8000-000000000090',true,'verified',now());
insert into public.service_categories(id,name) values ('electrical','Electrical') on conflict do nothing;
insert into public.provider_profiles(id,business_name,headline,general_area,availability,review_count,rating,completed_jobs)
 select ('97000000-0000-4000-8000-'||lpad((100+n)::text,12,'0'))::uuid,'A earlier provider '||n,'Electrical fixture','QA','Available',999,5,999 from generate_series(1,12) n;
insert into public.provider_services(provider_id,category_id,service_label)
 select id,'electrical','Electrical' from public.provider_profiles where id::text like '97000000-%';
insert into public.provider_service_areas(provider_id,neighborhood_id,area_label)
 select id,'97000000-0000-4000-8000-000000000090','Explicit fixture coverage' from public.provider_profiles where id::text like '97000000-%' and id<>'97000000-0000-4000-8000-000000000011';
create temporary table metric_results(metric text,data jsonb);grant all on metric_results to authenticated;
set local role authenticated;set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000003';
insert into metric_results select m,public.neighborhood_search_retrieve('provider','electrician',null,null,null,jsonb_build_object('categories',jsonb_build_array('electrical'),'metric',m)) from unnest(array['verified_reviews','rating','completed_jobs']) m;
select pg_temp.assert_true(data->0->>'id'='97000000-0000-4000-8000-000000000010','Winner lost behind lexical cap: '||metric) from metric_results;
select pg_temp.assert_true(data->0->'comparison'->>'eligibleCount'='13','Population capped before ranking') from metric_results;
select pg_temp.assert_true(jsonb_array_length(data)=8,'Unbounded result') from metric_results;
select pg_temp.assert_true(data::text not like '%SECRET%' and data::text not like '%PRIVATE%' and data::text not like '%Unfinished private review%' and data::text not like '%Missing safety completion%','Private job or ineligible review leaked') from metric_results;
select pg_temp.assert_true(data->0->'comparison'->>'value'='2','Verified count fabricated') from metric_results where metric='verified_reviews';
select pg_temp.assert_true(data->0->'comparison'->>'value'='3.0','Average fabricated') from metric_results where metric='rating';
select pg_temp.assert_true(data->0->'comparison'->>'value'='2','Completed jobs fabricated') from metric_results where metric='completed_jobs';
select pg_temp.assert_true(public.neighborhood_search_retrieve('provider','',null,null,null,'{"providerId":"97000000-0000-4000-8000-000000000011"}')='[]'::jsonb,'Missing service area bypassed');
select pg_temp.assert_true(public.neighborhood_search_retrieve('provider','qzxvbnm')='[]'::jsonb,'Nonsense broadened');
reset role;
update public.reviews set moderation_status='blocked' where provider_id='97000000-0000-4000-8000-000000000010';
set local role authenticated;
select pg_temp.assert_true(public.neighborhood_search_retrieve('provider','',null,null,null,'{"categories":["electrical"],"metric":"verified_reviews"}')->0->'comparison'->>'tiedCount'='13','Tie not computed across full eligible population');
select pg_temp.assert_true(public.neighborhood_search_retrieve('provider','',null,null,null,'{"categories":["electrical"],"metric":"rating"}')->0->'comparison'='null'::jsonb,'Zero reviews asserted rating');
reset role;
select pg_temp.assert_true(not has_function_privilege('anon','public.neighborhood_search_retrieve(text,text,uuid,timestamptz,timestamptz,jsonb)','execute'),'Anonymous retrieval');
select pg_temp.assert_true(not (select prosecdef from pg_proc where oid='public.neighborhood_search_retrieve(text,text,uuid,timestamptz,timestamptz,jsonb)'::regprocedure),'RLS bypass');
-- Basic Search and Hire stay available with AI disabled, without consuming usage.
update public.feature_flags set enabled=false where key='ai_neighborhood_assistant';
set local role authenticated;
select pg_temp.assert_true(public.neighborhood_search_context(null)->>'id'='97000000-0000-4000-8000-000000000090','Search context wrongly coupled to AI');
select pg_temp.assert_true(jsonb_array_length(public.neighborhood_provider_catalog('electrical'))=13,'Hire provider eligibility differs');
select pg_temp.assert_true(jsonb_array_length(public.neighborhood_search_retrieve('provider','electrician',null,null,null,'{"categories":["electrical"]}'))=8,'Search stopped at AI flag');
select pg_temp.denied($q$select public.neighborhood_ai_retrieve('provider','plumber')$q$,'42501');
select pg_temp.assert_true(public.neighborhood_ai_quota_status()->>'used'='0','Read consumed quota');
reset role;
update public.feature_flags set enabled=true where key='ai_neighborhood_assistant';
insert into private.neighborhood_ai_usage(profile_id,day_at,day_count,minute_at,minute_count) values
 ('97000000-0000-4000-8000-000000000003',(now() at time zone 'UTC')::date,32,now()-interval '2 minutes',0);
set local role authenticated;
select pg_temp.assert_true((public.neighborhood_ai_quota_status()->>'percent')::numeric=80,'80 percent status incorrect');
select pg_temp.assert_true(public.neighborhood_ai_quota_status()->>'remaining'='8','Remaining incorrect');
select pg_temp.assert_true(public.neighborhood_ai_quota_status()->>'window_type'='calendar_day_utc','Wrong window');
select pg_temp.assert_true((public.neighborhood_ai_meter('start')->'quota'->>'used')::integer=33,'Meter/status disagree');
reset role;
update private.neighborhood_ai_usage set day_count=40,minute_count=0 where profile_id='97000000-0000-4000-8000-000000000003';
set local role authenticated;
select pg_temp.assert_true(public.neighborhood_ai_quota_status()->>'blocked_scope'='account_daily','Daily limit scope');
select pg_temp.denied($q$select public.neighborhood_ai_meter('start')$q$,'54000');
select pg_temp.assert_true(jsonb_array_length(public.neighborhood_search_retrieve('provider','',null,null,null,'{"categories":["electrical"]}'))=8,'Quota broke Search');
reset role;
-- Test server reset clock without changing Preview or exposing time control to clients.
select pg_temp.assert_true(private.neighborhood_ai_quota((date_trunc('day',now() at time zone 'UTC') at time zone 'UTC')+interval '1 day')->>'used'='0','Reset retained stale usage');
update private.neighborhood_ai_usage set day_at=(now() at time zone 'UTC')::date-1,day_count=40,minute_count=0,minute_at=now()-interval '2 minutes' where profile_id='97000000-0000-4000-8000-000000000003';
set local role authenticated;
select pg_temp.assert_true(public.neighborhood_ai_quota_status()->>'used'='0','Old stored usage shown as current');
select pg_temp.assert_true(public.neighborhood_ai_meter('start')->'quota'->>'used'='1','First post-reset use incorrect');
reset role;
select pg_temp.assert_true(not has_function_privilege('authenticated','private.neighborhood_ai_quota(timestamptz)','execute'),'Client can manipulate quota clock');
select pg_temp.assert_true(not has_function_privilege('anon','public.neighborhood_ai_quota_status()','execute'),'Anonymous quota access');
set local role authenticated;
set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000001';
select pg_temp.denied($q$select public.neighborhood_search_context(null)$q$,'42501');
select pg_temp.denied($q$select public.neighborhood_provider_catalog('electrical')$q$,'42501');
reset role;
rollback;
