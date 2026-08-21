begin;

do $$
declare
  events_enabled boolean;
begin
  select enabled
  into events_enabled
  from public.feature_flags
  where key = 'events';

  if events_enabled is null then
    raise exception 'events feature flag must be provisioned';
  end if;

  if events_enabled then
    raise exception 'clean database migrations must not activate Events automatically';
  end if;
end;
$$;

rollback;
