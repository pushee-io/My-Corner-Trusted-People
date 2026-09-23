-- Older Preview compatibility deployments omitted this existing foundation.
-- Only restore it when absent; do not alter identities, grants or policies where it exists.
do $$
begin
 if to_regclass('public.private_identity_profiles') is null then
  if to_regtype('public.identity_assurance_status') is null then
   create type public.identity_assurance_status as enum ('not_started','in_review','approved_test_mode','rejected','expired');
  end if;
create table public.private_identity_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  legal_given_name text not null,
  legal_family_name text not null,
  public_display_name text not null,
  assurance_status public.identity_assurance_status not null default 'not_started',
  assurance_level text not null default 'test_mode_resident',
  assurance_provider text not null default 'manual_test_mode',
  assurance_method text not null default 'manual_biometrics_policy_no_ghana_card',
  assurance_reference text,
  assurance_reviewed_by uuid references public.profiles(id) on delete set null,
  assurance_reviewed_at timestamptz,
  assurance_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_private_identity_profiles_updated_at
before update on public.private_identity_profiles
for each row
execute function public.set_updated_at();


  alter table public.private_identity_profiles enable row level security;
  revoke all on public.private_identity_profiles from public,anon,authenticated;
 end if;
end $$;
