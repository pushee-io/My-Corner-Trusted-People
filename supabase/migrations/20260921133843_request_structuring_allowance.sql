-- One rolling-minute and daily counter per authenticated profile, never directly client-readable.
create table private.request_structuring_usage (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  minute_started_at timestamptz not null default now(),
  minute_count integer not null default 0,
  day_started_at date not null default current_date,
  day_count integer not null default 0
);
alter table private.request_structuring_usage enable row level security;
revoke all on private.request_structuring_usage from public, anon, authenticated;

create function private.consume_request_structuring_allowance()
returns boolean language plpgsql security definer set search_path = '' as $$
declare caller uuid; usage_row private.request_structuring_usage%rowtype;
begin
  if auth.uid() is null then return false; end if;
  select id into caller from public.profiles where auth_user_id=auth.uid();
  if caller is null or not exists(select 1 from public.feature_flags where key='ai_service_request_structurer' and enabled) then return false; end if;
  insert into private.request_structuring_usage(profile_id) values(caller) on conflict do nothing;
  select * into usage_row from private.request_structuring_usage where profile_id=caller for update;
  if usage_row.minute_started_at <= now() - interval '1 minute' then usage_row.minute_count:=0; usage_row.minute_started_at:=now(); end if;
  if usage_row.day_started_at <> current_date then usage_row.day_count:=0; usage_row.day_started_at:=current_date; end if;
  if usage_row.minute_count >= 6 or usage_row.day_count >= 40 then return false; end if;
  update private.request_structuring_usage set minute_started_at=usage_row.minute_started_at, minute_count=usage_row.minute_count+1,
    day_started_at=usage_row.day_started_at, day_count=usage_row.day_count+1 where profile_id=caller;
  return true;
end;
$$;
revoke all on function private.consume_request_structuring_allowance() from public, anon;
grant execute on function private.consume_request_structuring_allowance() to authenticated;
create function public.consume_request_structuring_allowance()
returns boolean language sql security invoker set search_path = '' as $$ select private.consume_request_structuring_allowance(); $$;
revoke all on function public.consume_request_structuring_allowance() from public, anon;
grant execute on function public.consume_request_structuring_allowance() to authenticated;
