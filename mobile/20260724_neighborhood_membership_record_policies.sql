create index if not exists neighborhood_memberships_user_status_idx
  on neighborhood_memberships (user_id, status);

create index if not exists neighborhood_memberships_neighborhood_verified_idx
  on neighborhood_memberships (neighborhood_id, status)
  where status = 'verified';

create or replace function is_verified_neighborhood_member(target_neighborhood_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from neighborhood_memberships
    where user_id = auth.uid()
      and neighborhood_id = target_neighborhood_id
      and status = 'verified'
  );
$$;

comment on function is_verified_neighborhood_member(uuid) is
  'Returns true only when the current authenticated user has a server-assigned verified membership for the target neighborhood.';

comment on column neighborhood_memberships.evidence_summary is
  'Non-sensitive summary only. Do not store exact address, exact coordinates, phone number, legal name, or raw identity evidence here.';
