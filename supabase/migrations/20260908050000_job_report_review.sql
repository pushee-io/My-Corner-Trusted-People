begin;

-- A job concern is submitted atomically through its RPC. Other report types
-- retain their existing policies; direct clients cannot fabricate job reports.
create policy "job reports require submission RPC" on public.reports
  as restrictive for insert to authenticated
  with check (job_request_id is null);
create policy "job reports require review RPC" on public.reports
  as restrictive for update to authenticated
  using (job_request_id is null) with check (job_request_id is null);

create index if not exists reports_job_request_reporter_idx
  on public.reports(job_request_id, reporter_id, created_at)
  where job_request_id is not null;

-- Moderator RPCs depend on the server-owned profile role. A profile owner may
-- edit display settings, but not turn that permission into an authority change.
create or replace function public.protect_profile_authority()
returns trigger language plpgsql set search_path = '' as $$
begin
  if current_user in ('authenticated', 'anon') and (
    new.id is distinct from old.id
    or new.auth_user_id is distinct from old.auth_user_id
    or new.role is distinct from old.role
  ) then
    raise exception 'profile authority is server controlled' using errcode = '42501';
  end if;
  return new;
end;
$$;
create trigger protect_profile_authority
before update on public.profiles
for each row execute function public.protect_profile_authority();
revoke all on function public.protect_profile_authority() from public, anon, authenticated;

create or replace function public.submit_job_report(target_job_request_id uuid, report_details text)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := public.current_profile_id();
  job public.job_requests%rowtype;
  concern public.reports%rowtype;
begin
  if actor is null then
    raise exception 'requester access required' using errcode = '42501';
  end if;
  if report_details is null or char_length(btrim(report_details)) not between 10 and 1000 then
    raise exception 'report details must contain 10 to 1000 characters' using errcode = '22023';
  end if;

  -- Serialize submissions for this job, including simultaneous duplicate taps.
  select * into job from public.job_requests
  where id = target_job_request_id and requester_id = actor for update;
  if not found then
    raise exception 'requester access required' using errcode = '42501';
  end if;

  select * into concern from public.reports
  where job_request_id = job.id and reporter_id = actor
    and marketplace_listing_id is null and social_group_post_id is null
  order by created_at, id limit 1;
  if found then
    return jsonb_build_object('report_id', concern.id, 'status', concern.status, 'already_reported', true);
  end if;
  if job.status not in ('Submitted', 'Viewed', 'Accepted', 'In progress', 'Reported') then
    raise exception 'this request can no longer be reported' using errcode = '22023';
  end if;

  insert into public.reports (reporter_id, job_request_id, provider_id, reason, details, status)
  values (actor, job.id, job.provider_id, 'Safety concern', btrim(report_details), 'open')
  returning * into concern;
  insert into public.moderation_cases (source_table, source_id, reason, status, report_id)
  values ('job_requests', job.id, concern.reason, 'open', concern.id);

  if job.status <> 'Reported' then
    update public.job_requests set status = 'Reported', updated_at = now() where id = job.id;
    insert into public.job_request_status_events (job_request_id, status, actor_id, note)
    values (job.id, 'Reported', actor, 'A concern was submitted for review.');
  end if;
  insert into public.audit_events (actor_id, action, target_table, target_id, metadata)
  values (actor, 'job_report_submitted', 'job_requests', job.id,
    jsonb_build_object('report_id', concern.id));

  return jsonb_build_object('report_id', concern.id, 'status', concern.status, 'already_reported', false);
end;
$$;

create or replace function public.get_requester_job_report(target_job_request_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  result jsonb;
begin
  if not exists (select 1 from public.job_requests
    where id = target_job_request_id and requester_id = public.current_profile_id()) then
    raise exception 'requester access required' using errcode = '42501';
  end if;
  -- Deliberate allowlist: no moderator identity, notes, audit metadata or location.
  select jsonb_build_object(
    'status', r.status, 'submitted_at', r.created_at, 'resolved_at', c.resolved_at,
    'outcome', case when r.status = 'resolved' and c.decision = 'approve'
      then 'Review complete. No further action was taken.' else null end
  ) into result
  from public.reports r
  join public.moderation_cases c on c.report_id = r.id and c.source_table = 'job_requests'
  where r.job_request_id = target_job_request_id and r.reporter_id = public.current_profile_id()
    and r.marketplace_listing_id is null and r.social_group_post_id is null
  order by r.created_at, r.id limit 1;
  return result;
end;
$$;

create or replace function public.list_job_moderation_queue(report_status_filter text default 'open')
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  result jsonb;
begin
  if not public.is_admin_or_moderator() then
    raise exception 'moderator access required' using errcode = '42501';
  end if;
  if report_status_filter is null or report_status_filter not in ('open', 'reviewing', 'resolved', 'all') then
    raise exception 'invalid report status filter' using errcode = '22023';
  end if;
  select coalesce(jsonb_agg(item.payload order by item.created_at, item.id), '[]'::jsonb) into result
  from (
    select r.id, r.created_at, jsonb_build_object(
      'report_id', r.id, 'job_request_id', j.id, 'request_title', j.title,
      'neighborhood_name', n.name, 'status', r.status, 'reported_at', r.created_at,
      'reason', r.reason, 'session_state', s.state
    ) as payload
    from public.reports r
    join public.moderation_cases c on c.report_id = r.id and c.source_table = 'job_requests'
    join public.job_requests j on j.id = r.job_request_id
    left join public.neighborhoods n on n.id = j.neighborhood_id
    left join public.job_safety_sessions s on s.job_request_id = j.id
    where r.marketplace_listing_id is null and r.social_group_post_id is null
      and (report_status_filter = 'all' or r.status = report_status_filter)
    order by r.created_at, r.id limit 100
  ) item;
  return result;
end;
$$;

create or replace function public.get_job_moderation_report(target_report_id uuid)
returns jsonb language plpgsql stable security definer set search_path = '' as $$
declare
  result jsonb;
begin
  if not public.is_admin_or_moderator() then
    raise exception 'moderator access required' using errcode = '42501';
  end if;
  -- Scope is the existing global moderator/admin role, restricted to job cases.
  -- Never join private location, request photos, identity evidence or messaging.
  select jsonb_build_object(
    'report_id', r.id, 'job_request_id', j.id, 'request_title', j.title,
    'neighborhood_name', n.name, 'status', r.status, 'reported_at', r.created_at,
    'reason', r.reason, 'session_state', s.state, 'details', r.details,
    'request_status', j.status, 'reporter_name', p.display_name,
    'review_notes', c.decision_notes,
    'audit_history', coalesce((
      select jsonb_agg(jsonb_build_object(
        'action', a.action, 'created_at', a.created_at,
        'actor_name', actor.display_name, 'reason', a.metadata ->> 'reason'
      ) order by a.created_at, a.id)
      from public.audit_events a
      left join public.profiles actor on actor.id = a.actor_id
      where a.target_table = 'job_requests' and a.target_id = j.id
        and a.metadata ->> 'report_id' = r.id::text
        and a.action in ('job_report_submitted', 'job_report_resolved')
    ), '[]'::jsonb)
  ) into result
  from public.reports r
  join public.moderation_cases c on c.report_id = r.id and c.source_table = 'job_requests'
  join public.job_requests j on j.id = r.job_request_id
  left join public.profiles p on p.id = r.reporter_id
  left join public.neighborhoods n on n.id = j.neighborhood_id
  left join public.job_safety_sessions s on s.job_request_id = j.id
  where r.id = target_report_id and r.marketplace_listing_id is null and r.social_group_post_id is null;
  if result is null then
    raise exception 'job report unavailable' using errcode = 'P0002';
  end if;
  return result;
end;
$$;

create or replace function public.resolve_job_report(
  target_report_id uuid, reason_code text, moderator_notes text default null
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := public.current_profile_id();
  concern public.reports%rowtype;
begin
  if actor is null or not public.is_admin_or_moderator() then
    raise exception 'moderator access required' using errcode = '42501';
  end if;
  -- Reuse existing non-destructive approval reasons and resolved state.
  if reason_code is null or reason_code not in ('no_violation', 'insufficient_evidence') then
    raise exception 'choose a supported resolution reason' using errcode = '22023';
  end if;
  if char_length(coalesce(moderator_notes, '')) > 500 then
    raise exception 'review notes must contain at most 500 characters' using errcode = '22023';
  end if;
  select r.* into concern from public.reports r
  where r.id = target_report_id and r.job_request_id is not null
    and r.marketplace_listing_id is null and r.social_group_post_id is null
    and exists (select 1 from public.moderation_cases c
      where c.report_id = r.id and c.source_table = 'job_requests')
  for update;
  if not found then
    raise exception 'job report unavailable' using errcode = 'P0002';
  end if;
  if concern.status = 'resolved' then
    return jsonb_build_object('status', 'resolved', 'already_resolved', true);
  end if;
  if concern.status not in ('open', 'reviewing') then
    raise exception 'job report cannot be resolved in this state' using errcode = '22023';
  end if;

  update public.reports set status = 'resolved' where id = concern.id;
  update public.moderation_cases
  set status = 'resolved', decision = 'approve', decision_reason = reason_code,
    decision_notes = nullif(btrim(moderator_notes), ''), resolved_by = actor, resolved_at = now()
  where report_id = concern.id and source_table = 'job_requests';
  insert into public.audit_events (actor_id, action, target_table, target_id, metadata)
  values (actor, 'job_report_resolved', 'job_requests', concern.job_request_id,
    jsonb_build_object('report_id', concern.id, 'reason', reason_code,
      'previous_status', concern.status, 'resulting_status', 'resolved'));
  -- Resolving a concern never reopens a reported job or cancelled safety session.
  return jsonb_build_object('status', 'resolved', 'already_resolved', false);
end;
$$;

revoke all on function public.submit_job_report(uuid, text) from public, anon;
revoke all on function public.get_requester_job_report(uuid) from public, anon;
revoke all on function public.list_job_moderation_queue(text) from public, anon;
revoke all on function public.get_job_moderation_report(uuid) from public, anon;
revoke all on function public.resolve_job_report(uuid, text, text) from public, anon;
grant execute on function public.submit_job_report(uuid, text) to authenticated;
grant execute on function public.get_requester_job_report(uuid) to authenticated;
grant execute on function public.list_job_moderation_queue(text) to authenticated;
grant execute on function public.get_job_moderation_report(uuid) to authenticated;
grant execute on function public.resolve_job_report(uuid, text, text) to authenticated;

commit;
