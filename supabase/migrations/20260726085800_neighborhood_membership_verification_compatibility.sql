-- Compatibility columns required by Day 3 verified neighborhood and cluster visibility.
-- These columns contain verification status metadata only, not exact resident addresses.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'neighborhood_membership_status') then
    create type public.neighborhood_membership_status as enum (
      'pending',
      'verified',
      'rejected',
      'expired'
    );
  end if;
end
$$;

alter table public.neighborhood_memberships
  add column if not exists status public.neighborhood_membership_status not null default 'verified',
  add column if not exists verified_at timestamptz default now(),
  add column if not exists ended_at timestamptz,
  add column if not exists verification_expires_at timestamptz;

create index if not exists idx_neighborhood_memberships_status
  on public.neighborhood_memberships(status);

create index if not exists idx_neighborhood_memberships_verified_active
  on public.neighborhood_memberships(profile_id, neighborhood_id)
  where status = 'verified' and ended_at is null;

comment on column public.neighborhood_memberships.status is
  'Compatibility verification status used by RLS visibility checks.';

comment on column public.neighborhood_memberships.verified_at is
  'Compatibility timestamp for when neighborhood membership was verified.';

comment on column public.neighborhood_memberships.ended_at is
  'Compatibility timestamp for ended memberships. Null means active.';

comment on column public.neighborhood_memberships.verification_expires_at is
  'Optional compatibility expiration timestamp for verified neighborhood membership.';
