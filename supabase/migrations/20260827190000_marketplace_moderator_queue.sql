begin;

alter table public.reports
  add column if not exists marketplace_listing_id uuid references public.marketplace_listings(id) on delete set null;

create index if not exists reports_marketplace_status_created_idx
  on public.reports(status, created_at desc)
  where marketplace_listing_id is not null;

alter table public.moderation_cases
  add column if not exists report_id uuid references public.reports(id) on delete set null,
  add column if not exists decision text,
  add column if not exists decision_reason text,
  add column if not exists decision_notes text,
  add column if not exists resolved_by uuid references public.profiles(id) on delete set null,
  add column if not exists resolved_at timestamptz;

create unique index if not exists moderation_cases_report_unique_idx
  on public.moderation_cases(report_id)
  where report_id is not null;

alter table public.reports enable row level security;
alter table public.moderation_cases enable row level security;
alter table public.audit_events enable row level security;

grant select on public.reports, public.moderation_cases, public.audit_events to authenticated;
revoke insert, update, delete on public.moderation_cases, public.audit_events from authenticated;

drop policy if exists "moderators read marketplace reports" on public.reports;
create policy "moderators read marketplace reports" on public.reports
  for select using (
    marketplace_listing_id is not null
    and public.is_admin_or_moderator()
  );

drop policy if exists "moderators read marketplace cases" on public.moderation_cases;
create policy "moderators read marketplace cases" on public.moderation_cases
  for select using (
    public.is_admin_or_moderator()
    and source_table = 'marketplace_listings'
  );

drop policy if exists "moderators read marketplace audit history" on public.audit_events;
create policy "moderators read marketplace audit history" on public.audit_events
  for select using (
    public.is_admin_or_moderator()
    and target_table = 'marketplace_listings'
  );

create or replace function public.list_marketplace_moderation_queue(report_status_filter text default 'open')
returns table (
  report_id uuid,
  report_reason text,
  report_details text,
  report_status text,
  reported_at timestamptz,
  reporter_name text,
  listing_id uuid,
  listing_title text,
  listing_description text,
  listing_moderation_status public.moderation_status,
  seller_id uuid,
  seller_name text,
  neighborhood_name text,
  image_url text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin_or_moderator() then
    raise exception 'moderator access required' using errcode = '42501';
  end if;

  if report_status_filter not in ('open', 'reviewing', 'resolved', 'all') then
    raise exception 'invalid report status filter' using errcode = '22023';
  end if;

  return query
  select
    r.id,
    r.reason,
    r.details,
    r.status,
    r.created_at,
    coalesce(reporter.display_name, 'Neighbor'),
    ml.id,
    ml.title,
    ml.description,
    ml.moderation_status,
    ml.seller_id,
    coalesce(seller.display_name, 'Neighbor'),
    n.name,
    ml.image_url
  from public.reports r
  join public.marketplace_listings ml on ml.id = r.marketplace_listing_id
  join public.profiles seller on seller.id = ml.seller_id
  join public.neighborhoods n on n.id = ml.neighborhood_id
  left join public.profiles reporter on reporter.id = r.reporter_id
  where report_status_filter = 'all' or r.status = report_status_filter
  order by
    case r.status when 'open' then 0 when 'reviewing' then 1 else 2 end,
    r.created_at asc;
end;
$$;

create or replace function public.get_marketplace_moderation_report(target_report_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  if not public.is_admin_or_moderator() then
    raise exception 'moderator access required' using errcode = '42501';
  end if;

  select jsonb_build_object(
    'report_id', r.id,
    'report_reason', r.reason,
    'report_details', r.details,
    'report_status', r.status,
    'reported_at', r.created_at,
    'reporter_name', coalesce(reporter.display_name, 'Neighbor'),
    'listing_id', ml.id,
    'listing_title', ml.title,
    'listing_description', ml.description,
    'listing_moderation_status', ml.moderation_status,
    'listing_pickup_area', ml.pickup_area,
    'seller_id', ml.seller_id,
    'seller_name', coalesce(seller.display_name, 'Neighbor'),
    'neighborhood_name', n.name,
    'image_url', ml.image_url,
    'image_paths', coalesce((
      select jsonb_agg(mli.object_path order by mli.position)
      from public.marketplace_listing_images mli
      where mli.listing_id = ml.id
    ), '[]'::jsonb),
    'audit_history', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', ae.id,
          'actor_name', coalesce(actor.display_name, 'System'),
          'action', ae.metadata ->> 'decision',
          'reason_code', ae.metadata ->> 'reason_code',
          'reason_details', ae.metadata ->> 'reason_details',
          'previous_status', ae.metadata ->> 'previous_status',
          'resulting_status', ae.metadata ->> 'resulting_status',
          'created_at', ae.created_at
        ) order by ae.created_at desc
      )
      from public.audit_events ae
      left join public.profiles actor on actor.id = ae.actor_id
      where ae.action = 'marketplace_report_reviewed'
        and ae.target_table = 'marketplace_listings'
        and ae.target_id = ml.id
        and ae.metadata ->> 'report_id' = r.id::text
    ), '[]'::jsonb)
  )
  into result
  from public.reports r
  join public.marketplace_listings ml on ml.id = r.marketplace_listing_id
  join public.profiles seller on seller.id = ml.seller_id
  join public.neighborhoods n on n.id = ml.neighborhood_id
  left join public.profiles reporter on reporter.id = r.reporter_id
  where r.id = target_report_id;

  if result is null then
    raise exception 'marketplace report not found' using errcode = 'P0002';
  end if;

  return result;
end;
$$;

create or replace function public.review_marketplace_report(
  target_report_id uuid,
  decision text,
  reason_code text,
  reason_details text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile_id uuid := public.current_profile_id();
  report_row public.reports;
  listing_row public.marketplace_listings;
  next_content_status public.moderation_status;
  next_report_status text;
begin
  if actor_profile_id is null or not public.is_admin_or_moderator() then
    raise exception 'moderator access required' using errcode = '42501';
  end if;

  if decision not in ('approve', 'flag', 'block') then
    raise exception 'invalid moderation decision' using errcode = '22023';
  end if;

  if reason_code not in (
    'no_violation', 'insufficient_evidence', 'misleading_or_scam', 'prohibited_item',
    'unsafe_pickup', 'harassment', 'privacy_exposure', 'duplicate_or_spam', 'other'
  ) then
    raise exception 'invalid moderation reason' using errcode = '22023';
  end if;

  if decision = 'approve' and reason_code not in ('no_violation', 'insufficient_evidence') then
    raise exception 'reason does not match approval' using errcode = '22023';
  end if;
  if decision = 'flag' and reason_code not in (
    'insufficient_evidence', 'misleading_or_scam', 'unsafe_pickup', 'harassment',
    'privacy_exposure', 'duplicate_or_spam', 'other'
  ) then
    raise exception 'reason does not match flag action' using errcode = '22023';
  end if;
  if decision = 'block' and reason_code not in (
    'misleading_or_scam', 'prohibited_item', 'unsafe_pickup', 'harassment',
    'privacy_exposure', 'duplicate_or_spam', 'other'
  ) then
    raise exception 'reason does not match block action' using errcode = '22023';
  end if;
  if reason_code = 'other' and char_length(btrim(coalesce(reason_details, ''))) < 10 then
    raise exception 'other reason requires at least 10 characters' using errcode = '22023';
  end if;
  if char_length(coalesce(reason_details, '')) > 500 then
    raise exception 'moderator notes exceed 500 characters' using errcode = '22023';
  end if;

  select * into report_row
  from public.reports
  where id = target_report_id
    and marketplace_listing_id is not null
  for update;

  if not found then
    raise exception 'marketplace report not found' using errcode = 'P0002';
  end if;
  if report_row.status = 'resolved' then
    raise exception 'resolved reports cannot be changed' using errcode = '22023';
  end if;

  select * into listing_row
  from public.marketplace_listings
  where id = report_row.marketplace_listing_id
  for update;

  if not found then
    raise exception 'marketplace listing not found' using errcode = 'P0002';
  end if;

  next_content_status := case decision
    when 'approve' then 'clean'::public.moderation_status
    when 'flag' then 'flagged'::public.moderation_status
    else 'blocked'::public.moderation_status
  end;
  next_report_status := case when decision = 'flag' then 'reviewing' else 'resolved' end;

  update public.marketplace_listings
  set moderation_status = next_content_status,
      updated_at = now()
  where id = listing_row.id;

  update public.reports
  set status = next_report_status
  where id = report_row.id;

  insert into public.moderation_cases (
    source_table, source_id, reason, status, report_id, decision, decision_reason,
    decision_notes, resolved_by, resolved_at
  ) values (
    'marketplace_listings', listing_row.id, report_row.reason,
    case when decision = 'flag' then 'reviewing' else 'resolved' end,
    report_row.id, decision, reason_code, nullif(btrim(reason_details), ''), actor_profile_id,
    case when decision = 'flag' then null else now() end
  )
  on conflict (report_id) where report_id is not null do update
  set status = excluded.status,
      decision = excluded.decision,
      decision_reason = excluded.decision_reason,
      decision_notes = excluded.decision_notes,
      resolved_by = excluded.resolved_by,
      resolved_at = excluded.resolved_at;

  insert into public.audit_events(actor_id, action, target_table, target_id, metadata)
  values (
    actor_profile_id,
    'marketplace_report_reviewed',
    'marketplace_listings',
    listing_row.id,
    jsonb_build_object(
      'report_id', report_row.id,
      'seller_id', listing_row.seller_id,
      'decision', decision,
      'reason_code', reason_code,
      'reason_details', nullif(btrim(reason_details), ''),
      'previous_status', listing_row.moderation_status,
      'resulting_status', next_content_status,
      'report_status', next_report_status
    )
  );

  return jsonb_build_object(
    'reportId', report_row.id,
    'reportStatus', next_report_status,
    'listingModerationStatus', next_content_status
  );
end;
$$;

revoke all on function public.list_marketplace_moderation_queue(text) from public, anon;
revoke all on function public.get_marketplace_moderation_report(uuid) from public, anon;
revoke all on function public.review_marketplace_report(uuid, text, text, text) from public, anon;

grant execute on function public.list_marketplace_moderation_queue(text) to authenticated;
grant execute on function public.get_marketplace_moderation_report(uuid) to authenticated;
grant execute on function public.review_marketplace_report(uuid, text, text, text) to authenticated;

commit;
