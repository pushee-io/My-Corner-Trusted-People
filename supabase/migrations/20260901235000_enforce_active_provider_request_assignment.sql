drop policy if exists "requester creates own requests" on public.job_requests;

create policy "requester creates own requests" on public.job_requests
  for insert
  with check (
    requester_id in (
      select profile.id
      from public.profiles profile
      where profile.auth_user_id = auth.uid()
    )
    and provider_id in (
      select provider.id
      from public.provider_profiles provider
      where provider.accepting_requests
    )
  );

comment on policy "requester creates own requests" on public.job_requests is
  'Requesters may create their own requests only for provider profiles that are currently accepting requests.';
