begin;
do $$
declare caller_auth uuid := gen_random_uuid(); caller_profile uuid; n integer;
begin
  insert into public.profiles(auth_user_id,display_name) values(caller_auth,'AI limit fixture') returning id into caller_profile;
  update public.feature_flags set enabled=true where key='ai_service_request_structurer';
  perform set_config('request.jwt.claim.sub',caller_auth::text,true);
  for n in 1..6 loop
    if not public.consume_request_structuring_allowance() then raise exception 'Valid allowance rejected'; end if;
  end loop;
  if public.consume_request_structuring_allowance() then raise exception 'Minute limit bypassed'; end if;
  update private.request_structuring_usage set minute_started_at=now()-interval '2 minutes',day_count=40 where profile_id=caller_profile;
  if public.consume_request_structuring_allowance() then raise exception 'Daily limit bypassed'; end if;
  update private.request_structuring_usage set day_started_at=current_date-1 where profile_id=caller_profile;
  if not public.consume_request_structuring_allowance() then raise exception 'Next day allowance not reset'; end if;
  perform set_config('request.jwt.claim.sub','',true);
  if public.consume_request_structuring_allowance() then raise exception 'Anonymous allowance'; end if;
  if has_table_privilege('authenticated','private.request_structuring_usage','UPDATE') then raise exception 'Client can reset allowance'; end if;
end;
$$;
rollback;
