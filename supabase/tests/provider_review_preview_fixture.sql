begin;
set local mycorner.fixture_environment='preview';
set local mycorner.fixture_project_ref='opeojxwkwwnnncnsuaag';
\ir ../fixtures/provider_verified_review_preview.sql
\ir ../fixtures/provider_verified_review_preview.sql
DO $$ begin
 if (select count(*) from public.reviews where job_request_id='d3900000-0000-4000-8000-000000000001')<>1 then raise exception 'Demo fixture not idempotent';end if;
 if not exists(select 1 from public.reviews r join public.job_requests j on j.id=r.job_request_id join public.job_safety_sessions s on s.job_request_id=j.id where j.id='d3900000-0000-4000-8000-000000000001' and r.reviewer_id=j.requester_id and r.provider_id=j.provider_id and j.status='Completed' and s.state='completed' and r.title like 'Fictional demo:%' and r.public_author='Ama K. (fictional demo)') then raise exception 'Demo review relationship or label missing';end if;
end $$;
rollback;
