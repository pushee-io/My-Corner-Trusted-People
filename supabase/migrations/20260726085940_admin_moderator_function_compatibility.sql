-- Compatibility helper required by Day 3 moderation/admin RLS policies.
-- Uses profile role only; does not expose private user data.

create or replace function public.is_admin_or_moderator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and p.role in ('admin', 'moderator')
  )
$$;

comment on function public.is_admin_or_moderator() is
  'Compatibility helper for RLS checks. Returns true when the current auth user profile has admin or moderator role.';
