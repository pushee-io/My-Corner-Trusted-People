drop policy if exists "provider updates assigned request status" on public.job_requests;
create policy "provider updates assigned request status" on public.job_requests
  for update using (
    provider_id in (
      select pp.id
      from public.provider_profiles pp
      join public.profiles p on p.id = pp.profile_id
      where p.auth_user_id = auth.uid()
    )
  )
  with check (
    status in ('Viewed', 'Accepted', 'Declined', 'In progress', 'Completed')
    and provider_id in (
      select pp.id
      from public.provider_profiles pp
      join public.profiles p on p.id = pp.profile_id
      where p.auth_user_id = auth.uid()
    )
  );

drop policy if exists "requester can cancel or report own request" on public.job_requests;
create policy "requester can cancel or report own request" on public.job_requests
  for update using (
    requester_id in (
      select id
      from public.profiles
      where auth_user_id = auth.uid()
    )
  )
  with check (
    status in ('Cancelled', 'Reported')
    and requester_id in (
      select id
      from public.profiles
      where auth_user_id = auth.uid()
    )
  );

create or replace function public.prevent_job_request_party_changes()
returns trigger
language plpgsql
as $$
begin
  if old.requester_id is distinct from new.requester_id
    or old.provider_id is distinct from new.provider_id
    or old.category_id is distinct from new.category_id
    or old.neighborhood_id is distinct from new.neighborhood_id
    or old.exact_address_private is distinct from new.exact_address_private
  then
    raise exception 'job request participant, category, neighborhood, and private address fields cannot be changed after creation'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_job_request_party_changes on public.job_requests;
create trigger prevent_job_request_party_changes
before update on public.job_requests
for each row
execute function public.prevent_job_request_party_changes();
