-- Compatibility helper required by Day 3 RLS policies.
-- Resolves the current auth user to a profile id without exposing private data.

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.profiles p
  where p.auth_user_id = auth.uid()
  limit 1
$$;

comment on function public.current_profile_id() is
  'Compatibility helper for RLS checks. Returns the current authenticated user profile id.';
