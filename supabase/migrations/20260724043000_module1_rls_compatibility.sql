grant usage on schema public to anon, authenticated;

grant select, insert on public.job_request_photos to authenticated;
grant select, insert on public.job_request_status_events to authenticated;
grant select, insert on public.provider_responses to authenticated;

drop policy if exists "requester manages own request photos" on public.job_request_photos;
create policy "requester manages own request photos" on public.job_request_photos
  for insert with check (
    job_request_id in (
      select jr.id
      from public.job_requests jr
      where jr.requester_id in (
        select id from public.profiles where auth_user_id = auth.uid()
      )
    )
  );

drop policy if exists "request participants read photos" on public.job_request_photos;
create policy "request participants read photos" on public.job_request_photos
  for select using (
    job_request_id in (
      select jr.id
      from public.job_requests jr
      where jr.requester_id in (
        select id from public.profiles where auth_user_id = auth.uid()
      )
      or jr.provider_id in (
        select pp.id
        from public.provider_profiles pp
        join public.profiles p on p.id = pp.profile_id
        where p.auth_user_id = auth.uid()
      )
    )
  );

drop policy if exists "request participants read provider responses" on public.provider_responses;
create policy "request participants read provider responses" on public.provider_responses
  for select using (
    job_request_id in (
      select jr.id
      from public.job_requests jr
      where jr.requester_id in (
        select id from public.profiles where auth_user_id = auth.uid()
      )
      or jr.provider_id in (
        select pp.id
        from public.provider_profiles pp
        join public.profiles p on p.id = pp.profile_id
        where p.auth_user_id = auth.uid()
      )
    )
  );

drop policy if exists "provider creates own request responses" on public.provider_responses;
create policy "provider creates own request responses" on public.provider_responses
  for insert with check (
    response_status in ('Accepted', 'Declined')
    and provider_id in (
      select pp.id
      from public.provider_profiles pp
      join public.profiles p on p.id = pp.profile_id
      where p.auth_user_id = auth.uid()
    )
    and job_request_id in (
      select jr.id
      from public.job_requests jr
      where jr.provider_id = provider_responses.provider_id
    )
  );
