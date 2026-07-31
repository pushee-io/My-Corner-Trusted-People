-- Compatibility helper required by Day 3 social group and broadcast RLS.
-- Uses verified neighborhood membership metadata only, not exact addresses.

create or replace function public.has_verified_neighborhood_membership(target_neighborhood_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.neighborhood_memberships nm
    join public.profiles p
      on p.id = nm.profile_id
    where p.auth_user_id = auth.uid()
      and nm.neighborhood_id = target_neighborhood_id
      and nm.status = 'verified'
      and nm.verified_at is not null
      and nm.ended_at is null
      and (nm.verification_expires_at is null or nm.verification_expires_at > now())
  )
$$;

comment on function public.has_verified_neighborhood_membership(uuid) is
  'Compatibility helper for RLS checks. Returns true when the current auth user has active verified membership in a neighborhood.';
