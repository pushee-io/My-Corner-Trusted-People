-- Day 20D: Day 2b live read boundary RLS policies.
-- This migration intentionally enables only authenticated read access for the
-- narrow columns used by mobile/src/lib/day2b-supabase-read-adapter.ts.
-- It does not create tables and does not grant insert, update, delete, or upsert access.

alter table if exists public.provider_profiles enable row level security;
alter table if exists public.provider_services enable row level security;
alter table if exists public.provider_trust_signals enable row level security;
alter table if exists public.job_requests enable row level security;
alter table if exists public.provider_responses enable row level security;

revoke all on table public.provider_profiles from anon, authenticated;
revoke all on table public.provider_services from anon, authenticated;
revoke all on table public.provider_trust_signals from anon, authenticated;
revoke all on table public.job_requests from anon, authenticated;
revoke all on table public.provider_responses from anon, authenticated;

grant select (
  id,
  business_name,
  headline,
  general_area,
  rating,
  review_count,
  completed_jobs,
  response_rate,
  community_recommendations,
  availability,
  accepting_requests,
  account_age
) on table public.provider_profiles to authenticated;

grant select (
  provider_id,
  category_id,
  service_label
) on table public.provider_services to authenticated;

grant select (
  id,
  provider_id,
  label,
  value
) on table public.provider_trust_signals to authenticated;

grant select (
  id,
  requester_id,
  provider_id,
  category_id,
  title,
  description,
  original_user_text,
  urgency,
  preferred_date,
  preferred_time,
  contact_preference,
  general_area_label,
  status,
  moderation_status,
  created_at
) on table public.job_requests to authenticated;

grant select (
  job_request_id,
  message,
  created_at
) on table public.provider_responses to authenticated;

drop policy if exists day2b_provider_profiles_authenticated_read on public.provider_profiles;
create policy day2b_provider_profiles_authenticated_read
  on public.provider_profiles
  for select
  to authenticated
  using (accepting_requests is true);

drop policy if exists day2b_provider_services_authenticated_read on public.provider_services;
create policy day2b_provider_services_authenticated_read
  on public.provider_services
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.provider_profiles visible_provider
      where visible_provider.id = provider_services.provider_id
        and visible_provider.accepting_requests is true
    )
  );

drop policy if exists day2b_provider_trust_signals_authenticated_read on public.provider_trust_signals;
create policy day2b_provider_trust_signals_authenticated_read
  on public.provider_trust_signals
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.provider_profiles visible_provider
      where visible_provider.id = provider_trust_signals.provider_id
        and visible_provider.accepting_requests is true
    )
  );

drop policy if exists day2b_job_requests_authenticated_read on public.job_requests;
create policy day2b_job_requests_authenticated_read
  on public.job_requests
  for select
  to authenticated
  using (
    requester_id::text = auth.uid()::text
    or provider_id::text = auth.uid()::text
  );

drop policy if exists day2b_provider_responses_authenticated_read on public.provider_responses;
create policy day2b_provider_responses_authenticated_read
  on public.provider_responses
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.job_requests visible_request
      where visible_request.id = provider_responses.job_request_id
        and (
          visible_request.requester_id::text = auth.uid()::text
          or visible_request.provider_id::text = auth.uid()::text
        )
    )
  );
