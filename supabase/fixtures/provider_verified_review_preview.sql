-- Manual Preview fixture, deliberately excluded from migrations and automatic production seeds.
-- Caller must verify the connected project and explicitly opt in for this exact Preview ref.
do $$
declare provider uuid; resident uuid; fixture_job constant uuid:='d3900000-0000-4000-8000-000000000001';
begin
 if current_setting('mycorner.fixture_environment',true) is distinct from 'preview'
 or current_setting('mycorner.fixture_project_ref',true) is distinct from 'opeojxwkwwnnncnsuaag' then
  raise exception 'Preview-only fixture: explicit environment and approved project required';
 end if;
 select id into provider from public.provider_profiles where seed_key='pilot-provider-kwame-pipecare' and business_name='Kwame PipeCare' and accepting_requests;
 if provider is null then raise exception 'Expected active Preview provider not found'; end if;
 select id into resident from public.profiles where seed_key='preview-fictional-review-resident';
 if resident is null then
  insert into public.profiles(display_name,role,seed_key) values('Fictional Preview Resident','requester','preview-fictional-review-resident') returning id into resident;
 end if;
 if exists(select 1 from public.job_requests where id=fixture_job and (requester_id is distinct from resident or provider_id is distinct from provider)) then
  raise exception 'Fixture ID collision; no existing job may be overwritten';
 end if;
 insert into public.job_requests(id,requester_id,provider_id,title,description,original_user_text,urgency,preferred_date,preferred_time,contact_preference,general_area_label,status)
 values(fixture_job,resident,provider,'Fictional demo: kitchen plumbing repair','Fictional Preview demonstration only. No real work or location.','Fictional Preview demonstration only.','flexible',current_date,'Afternoon','app_update','Fictional demo area','Completed') on conflict(id) do nothing;
 insert into public.job_safety_sessions(job_request_id,state,requester_completed_at,provider_completed_at,completed_at)
 values(fixture_job,'completed',now(),now(),now()) on conflict(job_request_id) do nothing;
 if not exists(select 1 from public.job_requests j join public.job_safety_sessions s on s.job_request_id=j.id where j.id=fixture_job and j.status='Completed' and s.state='completed' and s.requester_completed_at is not null and s.provider_completed_at is not null) then
  raise exception 'Fixture requires a completed job and both completion confirmations';
 end if;
 insert into public.reviews(job_request_id,reviewer_id,provider_id,rating,title,body,recommends,verified_job,moderation_status,public_author,provider_response,responded_at,response_status)
 values(fixture_job,resident,provider,4,'Fictional demo: Professional and responsive','Fictional Preview example: communicated clearly and completed the plumbing work professionally.',true,true,'clean','Ama K. (fictional demo)','Fictional demo response: Thank you for choosing Kwame PipeCare.',now(),'clean')
 on conflict(job_request_id) where verified_job do nothing;
end $$;
