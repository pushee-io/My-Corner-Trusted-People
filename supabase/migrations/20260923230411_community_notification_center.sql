-- One in-app projection over existing notifications and recipient-addressed domain events.
-- Push delivery state is independent of in-app reads; raw event payloads never reach the client.
insert into public.feature_flags(key,enabled) values('community_notifications',false) on conflict(key) do nothing;
alter table public.domain_event_outbox add column in_app_read_at timestamptz;
create index community_event_recipient_idx on public.domain_event_outbox(recipient_profile_id,available_at desc);

create function private.notification_api(action text,target uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.current_profile_id(); result jsonb;
begin
 if actor is null or not private.community_account_active(actor) then raise exception 'Sign in with an active account.' using errcode='42501';end if;
 if action='read' then
  update public.notifications set read_at=coalesce(read_at,now()) where id=target and profile_id=actor;
  update public.domain_event_outbox set in_app_read_at=coalesce(in_app_read_at,now())
   where id=target and recipient_profile_id=actor and available_at<=now();
  return '{}'::jsonb;
 elsif action='list' then
  select coalesce(jsonb_agg(v.data order by v.available_at desc),'[]'::jsonb) into result from (
   select n.created_at available_at,jsonb_build_object('id',n.id,'title',n.title,'body',n.body,'createdAt',n.created_at,
    'readAt',n.read_at,'targetKind',n.target_kind,'targetId',n.target_id,
    'isRequester',case when n.target_kind in ('hire_updated','job_safety_updated') then exists(select 1 from public.job_requests j where j.id=n.target_id and j.requester_id=actor) else null end) data
   from public.notifications n where n.profile_id=actor
   union all
   select e.available_at,jsonb_build_object('id',e.id,'title',case
     when e.event_type like 'event_%' then 'Event update'
     when e.event_type like 'group_%' then 'Group activity'
     when e.event_type like 'comment_%' or e.event_type like 'reply_%' then 'Neighborhood reply'
     when e.event_type like 'marketplace_%' then 'Marketplace update'
     when e.event_type like 'broadcast_%' or e.event_type like 'agency_%' then 'Agency Broadcast'
     when e.event_type like 'job_safety_%' then 'Job Safety update'
     when e.event_type like 'hire_%' then 'Hire update'
     else 'Community update' end,
    'body','Open My Corner to view this update.','createdAt',e.available_at,'readAt',e.in_app_read_at,
    'targetKind',e.event_type,'targetId',e.aggregate_id)
   from public.domain_event_outbox e where e.recipient_profile_id=actor and e.available_at<=now()
    -- These kinds already have a notification row from queue_community_notification.
    and e.event_type not in ('message_received','hire_updated','job_safety_updated')
    and e.event_type not like 'review_%'
   order by available_at desc limit 100
  ) v;return result;
 end if;
 raise exception 'Unknown notification action.' using errcode='22023';
end $$;
revoke all on function private.notification_api(text,uuid) from public,anon,authenticated;
grant execute on function private.notification_api(text,uuid) to authenticated;
create function public.notification_api(action text,target uuid default null) returns jsonb
language sql security invoker set search_path='' as $$select private.notification_api(action,target)$$;
revoke all on function public.notification_api(text,uuid) from public,anon;
grant execute on function public.notification_api(text,uuid) to authenticated;

create function private.queue_job_notification() returns trigger
language plpgsql security definer set search_path='' as $$
declare job public.job_requests; provider_actor uuid; kind text; heading text;
begin
 if not exists(select 1 from public.feature_flags where key='community_notifications' and enabled) then return new;end if;
 if tg_table_name='job_requests' then
  if tg_op='UPDATE' and new.status is not distinct from old.status and new.provider_id is not distinct from old.provider_id then return new;end if;
  job:=new; kind:='hire_updated'; heading:='Hire request updated';
 else
  if tg_op='UPDATE' and new.state is not distinct from old.state then return new;end if;
  select * into job from public.job_requests where id=new.job_request_id;
  kind:='job_safety_updated';heading:='Job Safety session updated';
 end if;
 select profile_id into provider_actor from public.provider_profiles where id=job.provider_id;
 if job.requester_id is not null then perform private.queue_community_notification(job.requester_id,kind,job.id,heading);end if;
 if provider_actor is not null and provider_actor is distinct from job.requester_id then
  perform private.queue_community_notification(provider_actor,kind,job.id,heading);
 end if;
 return new;
end $$;
revoke all on function private.queue_job_notification() from public,anon,authenticated;
create trigger community_hire_notification after insert or update of status,provider_id on public.job_requests
 for each row execute function private.queue_job_notification();
create trigger community_safety_notification after insert or update of state on public.job_safety_sessions
 for each row execute function private.queue_job_notification();
