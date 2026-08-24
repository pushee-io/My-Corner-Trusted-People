begin;

-- Provision the operational switch without activating Events in any environment.
-- Development, staging, and production must be enabled independently after verification.
insert into public.feature_flags (key, enabled, description)
values (
  'events',
  false,
  'Neighborhood Events availability. Enable per environment only after repository, RLS, and device verification.'
)
on conflict (key) do update
set description = excluded.description,
    updated_at = now();

commit;
