begin;
-- Shared authorized retrieval. Search does not depend on the AI flag or quota.
create function public.neighborhood_search_context(selected_neighborhood uuid default null) returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare result jsonb;
begin
 if auth.uid() is null or not private.community_account_active(public.current_profile_id()) then
  raise exception 'Search unavailable.' using errcode='42501'; end if;
 select jsonb_build_object('id',n.id,'name',n.name,'city',n.city,'timezone','Africa/Accra') into result
 from public.neighborhood_memberships m join public.neighborhoods n on n.id=m.neighborhood_id
 where m.profile_id=public.current_profile_id() and public.has_verified_neighborhood_membership(n.id)
 and (selected_neighborhood is null or n.id=selected_neighborhood)
 order by m.is_primary desc,n.id limit 1;
 if result is null then raise exception 'Verify your neighborhood to use Search.' using errcode='42501';end if;
 return result;
end $$;
revoke all on function public.neighborhood_search_context(uuid) from public,anon;
grant execute on function public.neighborhood_search_context(uuid) to authenticated;

create function private.neighborhood_provider_eligible(provider uuid,hood uuid) returns boolean
language sql stable security invoker set search_path='' as $$
 select public.has_verified_neighborhood_membership(hood) and exists(
  select 1 from public.provider_profiles p where p.id=provider and p.accepting_requests
   and private.ai_source_author_allowed(p.profile_id)
   and exists(select 1 from public.provider_service_areas a where a.provider_id=p.id and a.neighborhood_id=hood))
$$;
revoke all on function private.neighborhood_provider_eligible(uuid,uuid) from public,anon;
grant execute on function private.neighborhood_provider_eligible(uuid,uuid) to authenticated;

create function public.neighborhood_provider_catalog(category text,selected_neighborhood uuid default null) returns jsonb
language plpgsql stable security invoker set search_path='' set statement_timeout='5s' as $$
declare hood uuid; result jsonb;
begin
 hood:=(public.neighborhood_search_context(selected_neighborhood)->>'id')::uuid;
 if category is null or length(category)>80 then raise exception 'Invalid category.' using errcode='22023';end if;
 select coalesce(jsonb_agg(v.row),'[]') into result from (
  select jsonb_build_object('id',p.id,'profile_id',p.profile_id,'business_name',p.business_name,'headline',p.headline,
   'general_area',p.general_area,'rating',p.rating,'review_count',p.review_count,'completed_jobs',p.completed_jobs,
   'response_rate',p.response_rate,'community_recommendations',p.community_recommendations,'availability',p.availability,
   'accepting_requests',p.accepting_requests) row
  from public.provider_profiles p where private.neighborhood_provider_eligible(p.id,hood)
   and exists(select 1 from public.provider_services s where s.provider_id=p.id and s.category_id=category)
  order by p.business_name,p.id
 ) v;return result;
end $$;
revoke all on function public.neighborhood_provider_catalog(text,uuid) from public,anon;
grant execute on function public.neighborhood_provider_catalog(text,uuid) to authenticated;
create function private.neighborhood_review_summary(target uuid,terms text,hood uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.current_profile_id(); owner_id uuid; page_size integer:=3; query tsquery:=private.neighborhood_keyword_query(terms);
 cursor_time timestamptz; cursor_id uuid; result jsonb;
begin
 if actor is null or not private.community_account_active(actor) then raise exception 'Sign in with an active account.' using errcode='42501';end if;
 -- Match the accepting-provider SELECT policy used by the public profile repository.
 select profile_id into owner_id from public.provider_profiles where id=target and accepting_requests;
 if not found then raise exception 'Provider unavailable.' using errcode='42501';end if;
 if not private.neighborhood_provider_eligible(target,hood) then raise exception 'Provider unavailable.' using errcode='42501';end if;
 with eligible as materialized (
  select r.* from public.reviews r join public.job_requests j on j.id=r.job_request_id
   join public.job_safety_sessions s on s.job_request_id=j.id
  where r.provider_id=target and private.ai_source_author_allowed(r.reviewer_id) and r.verified_job and r.moderation_status='clean'
   and j.requester_id=r.reviewer_id and j.provider_id=r.provider_id and j.status='Completed'
   and s.state='completed' and s.requester_completed_at is not null and s.provider_completed_at is not null
 ), candidates as (
  select * from eligible where numnode(query)=0 or to_tsvector('english',title||' '||body)@@query
  order by ts_rank(to_tsvector('english',title||' '||body),query) desc,created_at desc,id desc limit page_size
 ), page as (select * from candidates order by created_at desc,id desc limit page_size)
 select jsonb_build_object(
  'matches',exists(select 1 from candidates),
  'average',coalesce((select round(avg(rating),1) from eligible),0),
  'count',(select count(*) from eligible),'verifiedCount',(select count(*) from eligible),
  'recommendationPercent',(select case when count(*)>=5 then round(100.0*count(*) filter(where recommends)/count(*)) else null end from eligible),
  'completedJobs',(select count(*) from public.job_requests j join public.job_safety_sessions s on s.job_request_id=j.id where j.provider_id=target and j.status='Completed' and s.state='completed' and s.requester_completed_at is not null and s.provider_completed_at is not null),
  'canRespond',owner_id=actor,
  'reviews',coalesce((select jsonb_agg(jsonb_build_object(
   'id',r.id,'rating',r.rating,'title',r.title,'body',r.body,'author',coalesce(nullif(r.public_author,''),'Neighbor'),
   'createdAt',r.created_at,'updatedAt',r.updated_at,'recommends',r.recommends,
   'response',case when r.response_status='clean' then r.provider_response end,
   'respondedAt',case when r.response_status='clean' then r.responded_at end,
   'canRespond',owner_id=actor and r.responded_at is null) order by r.created_at desc,r.id desc) from page r),'[]'::jsonb),
  'nextCursor',case when page_size>0 and (select count(*) from candidates)>page_size then
   (select jsonb_build_object('id',id,'createdAt',created_at) from page order by created_at,id limit 1) else null end
 ) into result; return result;
end $$;
revoke all on function private.neighborhood_review_summary(uuid,text,uuid) from public,anon;
grant execute on function private.neighborhood_review_summary(uuid,text,uuid) to authenticated;

create function public.neighborhood_search_retrieve(source_kind text, terms text default '', selected_neighborhood uuid default null,
 since_at timestamptz default null, until_at timestamptz default null, options jsonb default '{}') returns jsonb
language plpgsql stable security invoker set search_path='' set statement_timeout='5s' as $$
declare hood uuid; result jsonb; query tsquery; metric text:=options->>'metric'; categories jsonb:=coalesce(options->'categories','[]'::jsonb);
begin
 hood:=(public.neighborhood_search_context(selected_neighborhood)->>'id')::uuid;
 if char_length(coalesce(terms,''))>160 or source_kind not in ('event','post','group','provider','agency','marketplace') then
  raise exception 'Invalid retrieval tool.' using errcode='22023'; end if;
 if options ? 'phrases' and (jsonb_typeof(options->'phrases')<>'array' or jsonb_array_length(options->'phrases')>20) then raise exception 'Invalid concept evidence.' using errcode='22023';end if;
 if options ? 'phrases' and exists(select 1 from jsonb_array_elements_text(options->'phrases') v where v !~ '^[a-zA-Z0-9 ]{2,80}$') then raise exception 'Invalid concept evidence.' using errcode='22023';end if;
 if jsonb_typeof(options)<>'object' or octet_length(options::text)>2000 or jsonb_typeof(categories)<>'array' or jsonb_array_length(categories)>4
  or (metric is not null and metric not in ('verified_reviews','rating','completed_jobs','rsvps','newest'))
  or (options ? 'providerId' and options->>'providerId' !~ '^[0-9a-f-]{36}$') then
  raise exception 'Invalid retrieval plan.' using errcode='22023'; end if;
 query:=private.neighborhood_keyword_query(terms);
 if source_kind='event' then
  select coalesce(jsonb_agg(v.data),'[]') into result from (
   select jsonb_build_object('id',e.id,'kind','event','title',e.title,'text',left(e.description,1600),
    'publishedAt',e.updated_at,'startsAt',e.starts_at,'endsAt',e.ends_at,'timezone',e.timezone,
    'comparison',case when metric='rsvps' then jsonb_build_object('metric',metric,'value',e.attendee_count,'eligibleCount',count(*) over(),'tiedCount',count(*) over(partition by e.attendee_count)) end,
    'organizer',private.ai_event_organizer(e.id),'authority','Event','href','/events/'||e.id) as data
   from public.events e where e.neighborhood_id=hood and public.is_events_feature_enabled()
    and e.moderation_status='approved' and e.status in ('scheduled','completed')
    -- Private invite-only events are excluded even for moderators/organizers in v1.
    and e.visibility in ('verified_neighborhood_members','immediate_cluster_members') and public.can_view_event(e.id)
    and private.ai_source_author_allowed(e.organizer_profile_id)
    and (since_at is null or e.starts_at>=since_at) and (until_at is null or e.starts_at<until_at)
    and private.ai_phrase_evidence(e.title||' '||e.description,options->'phrases')
    and (numnode(query)=0 or to_tsvector('english',e.title||' '||e.description)@@query)
   order by case when metric='rsvps' then e.attendee_count end desc nulls last,ts_rank(to_tsvector('english',e.title||' '||e.description),query) desc,e.starts_at asc,e.id limit 8) v;
 elsif source_kind='post' then
  select coalesce(jsonb_agg(v.data),'[]') into result from (
   select jsonb_build_object('id',p.id,'kind','post','title','Neighborhood post','text',left(p.body,800)||private.ai_feed_comment_text(p.id,query),
    'publishedAt',p.created_at,'authority','Neighbor report','href','/community?postId='||p.id) as data
   from public.neighborhood_feed_posts p where p.neighborhood_id=hood and p.moderation_status in ('clean','not_run')
    and private.ai_source_author_allowed(p.author_id)
    and (since_at is null or p.created_at>=since_at) and (until_at is null or p.created_at<until_at)
    and private.ai_phrase_evidence(p.body||private.ai_feed_comment_text(p.id,query),options->'phrases')
    and (numnode(query)=0 or to_tsvector('english',p.body||private.ai_feed_comment_text(p.id,query))@@query)
   order by ts_rank(to_tsvector('english',p.body||private.ai_feed_comment_text(p.id,query)),query) desc,p.created_at desc,p.id limit 8) v;
 elsif source_kind='group' then
  with eligible_groups as materialized (
   select g.id,g.name,g.description,g.created_at from public.social_groups g
   where g.neighborhood_id=hood and public.can_view_social_group(g.id) and public.is_accepted_social_group_member(g.id)
    and g.moderation_status in ('clean','not_run') and private.ai_source_author_allowed(g.created_by_profile_id)
  ), documents as (
   select g.id,g.id group_id,g.name title,g.description content,g.created_at published_at,'Group' authority from eligible_groups g
   union all
   select p.id,g.id,g.name,left(g.description,400)||E'\nDiscussion: '||p.body||private.ai_group_comment_text(p.id,query),p.created_at,'Group discussion'
   from eligible_groups g join public.social_group_posts p on p.group_id=g.id
   where p.moderation_status in ('clean','not_run') and private.ai_source_author_allowed(p.author_profile_id)
  ) select coalesce(jsonb_agg(v.data),'[]') into result from (
   select jsonb_build_object('id',id,'kind','group','title',title,'text',left(content,1600),
    'publishedAt',published_at,'authority',authority,'href','/groups/'||group_id||case when id<>group_id then '?postId='||id else '' end) data
   from documents where (since_at is null or published_at>=since_at) and (until_at is null or published_at<until_at)
    and private.ai_phrase_evidence(title||' '||content,options->'phrases')
    and (numnode(query)=0 or to_tsvector('english',title||' '||content)@@query)
   order by ts_rank(to_tsvector('english',title||' '||content),query) desc,published_at desc,id limit 8
  ) v;
 elsif source_kind='agency' then
  select coalesce(jsonb_agg(v.data),'[]') into result from (
   select jsonb_build_object('id',a.id,'kind','agency','title',a.title,'text',left(a.body,1600),
    'publishedAt',a.published_at,'expiresAt',a.expires_at,'authority','Verified Agency: '||a.agency_name,
    'href','/agency-broadcasts?broadcastId='||a.id) as data
   from public.agency_broadcasts a where public.can_view_agency_broadcast(a.id)
    and a.is_agency_approved and a.approved_at is not null and a.moderation_status='clean' and a.published_at<=now()
    and (a.expires_at is null or a.expires_at>now())
    and (a.neighborhood_id=hood or (a.scope='immediate_cluster' and exists(select 1 from public.neighborhood_cluster_members m where m.neighborhood_id=hood and m.cluster_id=a.cluster_id))
     or (a.scope='greater_accra' and exists(select 1 from public.neighborhoods n where n.id=hood and n.region='Greater Accra')))
    and private.ai_source_author_allowed(a.created_by_profile_id)
    and (since_at is null or a.published_at>=since_at) and (until_at is null or a.published_at<until_at)
    and private.ai_phrase_evidence(a.title||' '||a.body,options->'phrases')
    and (numnode(query)=0 or to_tsvector('english',a.title||' '||a.body)@@query)
   order by ts_rank(to_tsvector('english',a.title||' '||a.body),query) desc,a.published_at desc,a.id limit 8) v;
 elsif source_kind='marketplace' then
  select coalesce(jsonb_agg(v.data),'[]') into result from (
   select jsonb_build_object('id',m.id,'kind','marketplace','title',m.title,'text',left(m.description,1200),
    'comparison',case when metric='newest' then jsonb_build_object('metric',metric,'value',extract(epoch from m.created_at),'eligibleCount',count(*) over(),'tiedCount',count(*) over(partition by m.created_at)) end,
    'publishedAt',m.created_at,'priceGhs',m.price_ghs,'authority','Marketplace listing',
    'href','/marketplace/listing/'||m.id) as data
   from public.marketplace_listings m where m.neighborhood_id=hood and m.moderation_status in ('clean','not_run')
    and private.ai_source_author_allowed(m.seller_id)
    and (since_at is null or m.created_at>=since_at) and (until_at is null or m.created_at<until_at)
    and private.ai_phrase_evidence(m.title||' '||m.description,options->'phrases')
    and (numnode(query)=0 or to_tsvector('english',m.title||' '||m.description)@@query)
   order by case when metric='newest' then m.created_at end desc nulls last,ts_rank(to_tsvector('english',m.title||' '||m.description),query) desc,m.created_at desc,m.id limit 8) v;
 elsif source_kind='provider' then
  -- Materialize ALL authorized category candidates before computing the metric,
  -- ties, population size and limit. Never rank a capped lexical sample.
  with eligible as materialized (
   select p.id,p.business_name,p.headline,p.created_at,p.availability,
    case when exists(select 1 from public.feature_flags where key='verified_job_reviews' and enabled)
     then private.neighborhood_review_summary(p.id,case when jsonb_array_length(categories)>0 then '' else terms end,hood)-'canRespond'-'nextCursor'-'matches' else null end reputation,
    ts_rank(to_tsvector('english',p.business_name||' '||p.headline||' '||coalesce(s.labels,'')),query) relevance
   from public.provider_profiles p
   left join lateral (select string_agg(service_label||' '||category_id,' ') labels from public.provider_services where provider_id=p.id) s on true
   where private.neighborhood_provider_eligible(p.id,hood)
    and (options->>'providerId' is null or p.id=(options->>'providerId')::uuid)
    and (case when jsonb_array_length(categories)>0 then exists(select 1 from public.provider_services c where c.provider_id=p.id and categories ? c.category_id)
     else numnode(query)=0 or to_tsvector('english',p.business_name||' '||p.headline||' '||coalesce(s.labels,''))@@query
      or (exists(select 1 from public.feature_flags where key='verified_job_reviews' and enabled) and (private.neighborhood_review_summary(p.id,terms,hood)->>'matches')::boolean) end)
  ), measured as (
   select *,case metric when 'verified_reviews' then (reputation->>'verifiedCount')::numeric
    when 'rating' then case when (reputation->>'verifiedCount')::integer>0 then (reputation->>'average')::numeric end
    when 'completed_jobs' then (reputation->>'completedJobs')::numeric end metric_value from eligible
  ), ranked as (
   select *,count(*) over() population,count(*) over(partition by metric_value) ties from measured
  ) select coalesce(jsonb_agg(v.data),'[]') into result from (
   select jsonb_build_object('id',id,'kind','provider','title',business_name,'text',left(headline,1000),
    'publishedAt',created_at,'availability',availability,'authority','Provider profile','href','/hire/provider/'||id,
    'reputation',reputation,'comparison',case when metric_value is not null then
     jsonb_build_object('metric',metric,'value',metric_value,'eligibleCount',population,'tiedCount',ties) end) data
   from ranked order by metric_value desc nulls last,relevance desc,business_name,id limit 8
  ) v;
 end if;
 return result;
end $$;
revoke all on function public.neighborhood_search_retrieve(text,text,uuid,timestamptz,timestamptz,jsonb) from public,anon;
grant execute on function public.neighborhood_search_retrieve(text,text,uuid,timestamptz,timestamptz,jsonb) to authenticated;

create or replace function public.neighborhood_ai_retrieve(source_kind text,terms text default '',selected_neighborhood uuid default null,
 since_at timestamptz default null,until_at timestamptz default null,options jsonb default '{}') returns jsonb
language plpgsql stable security invoker set search_path='' set statement_timeout='5s' as $$
begin
 perform public.neighborhood_ai_context(selected_neighborhood);
 return public.neighborhood_search_retrieve(source_kind,terms,selected_neighborhood,since_at,until_at,options);
end $$;
-- Status does not write, reset or spend quota. Its UTC boundaries also drive metering.
create function private.neighborhood_ai_quota(at_time timestamptz) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare actor uuid:=public.current_profile_id(); u private.neighborhood_ai_usage;
 day_start timestamptz:=date_trunc('day',at_time at time zone 'UTC') at time zone 'UTC';
 used integer; minute_used integer; global_used integer; blocked text; retry_at timestamptz;
begin
 if auth.uid() is null or not private.community_account_active(actor) then raise exception 'Unavailable.' using errcode='42501';end if;
 perform public.neighborhood_search_context(null);
 select * into u from private.neighborhood_ai_usage where profile_id=actor;
 used:=case when u.day_at=(at_time at time zone 'UTC')::date then u.day_count else 0 end;
 minute_used:=case when u.minute_at>at_time-interval '1 minute' then u.minute_count else 0 end;
 select count(*) into global_used from private.neighborhood_ai_runs where created_at>=day_start and created_at<day_start+interval '1 day';
 blocked:=case when used>=40 then 'account_daily' when global_used>=500 then 'preview_daily' when minute_used>=6 then 'account_minute' end;
 retry_at:=case when blocked='account_minute' then u.minute_at+interval '1 minute' else day_start+interval '1 day' end;
 return jsonb_build_object('limit',40,'used',used,'remaining',greatest(0,40-used),'percent',least(100,used*100.0/40),
  'window_type','calendar_day_utc','window_start',day_start,'reset_at',day_start+interval '1 day',
  'blocked_scope',blocked,'retry_at',retry_at,'server_time',at_time);
end $$;
revoke all on function private.neighborhood_ai_quota(timestamptz) from public,anon,authenticated;
create function public.neighborhood_ai_quota_status() returns jsonb
language sql stable security definer set search_path='' as $$ select private.neighborhood_ai_quota(now()) $$;
revoke all on function public.neighborhood_ai_quota_status() from public,anon;
grant execute on function public.neighborhood_ai_quota_status() to authenticated;
create or replace function private.neighborhood_ai_meter(action text,run_id uuid,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.current_profile_id(); u private.neighborhood_ai_usage; ticket uuid; r private.neighborhood_ai_runs;
begin
 if auth.uid() is null or not private.community_account_active(actor) or not exists(select 1 from public.feature_flags where key='ai_neighborhood_assistant' and enabled) then
  raise exception 'Ask My Corner unavailable.' using errcode='42501';end if;
 if action='start' then
  perform public.neighborhood_ai_context(null);
  -- Serialize per-user and global daily quotas. No paid-service commitment or unbounded model calls.
  perform pg_advisory_xact_lock(hashtextextended('neighborhood-ai-daily',0));
  if (select count(*) from private.neighborhood_ai_runs where created_at>=date_trunc('day',now() at time zone 'UTC') at time zone 'UTC')>=500 then
   raise exception 'Daily Preview allowance reached.' using errcode='54000',detail=private.neighborhood_ai_quota(now())::text;end if;
  insert into private.neighborhood_ai_usage(profile_id) values(actor) on conflict do nothing;
  select * into u from private.neighborhood_ai_usage where profile_id=actor for update;
  if u.minute_at<=now()-interval '1 minute' then u.minute_at:=now();u.minute_count:=0;end if;
  if u.day_at<>(now() at time zone 'UTC')::date then u.day_at:=(now() at time zone 'UTC')::date;u.day_count:=0;end if;
  if u.minute_count>=6 or u.day_count>=40 then raise exception 'Ask My Corner allowance reached.' using errcode='54000',detail=private.neighborhood_ai_quota(now())::text;end if;
  update private.neighborhood_ai_usage set minute_at=u.minute_at,minute_count=u.minute_count+1,day_at=u.day_at,day_count=u.day_count+1 where profile_id=actor;
  insert into private.neighborhood_ai_runs(profile_id) values(actor) returning id into ticket;
  return jsonb_build_object('id',ticket,'quota',private.neighborhood_ai_quota(now()));
 end if;
 select * into r from private.neighborhood_ai_runs where id=run_id and profile_id=actor for update;
 if not found then raise exception 'Answer unavailable.' using errcode='42501';end if;
 if action='feedback' then
  if payload->>'value' is null or payload->>'value' not in ('helpful','not_helpful','inaccurate') then raise exception 'Invalid feedback.';end if;
  update private.neighborhood_ai_runs set feedback=payload->>'value' where id=run_id;
 elsif action='click' then
  if not exists(select 1 from jsonb_array_elements_text(r.source_refs) x where x=payload->>'ref') then raise exception 'Invalid source.';end if;
  update private.neighborhood_ai_runs set clicked_ref=payload->>'ref' where id=run_id;
 elsif action='finish' then
  -- Metrics are diagnostic, not billing records. Caller can report only bounded metadata, never text.
  if r.outcome<>'started' then return '{}'::jsonb;end if;
  if coalesce(payload->>'intent','') not in ('events','providers','alerts','organizer','memory','marketplace','digest','unsupported')
   or coalesce(payload->>'outcome','') not in ('answered','no_results','unavailable','refused')
   or coalesce(jsonb_typeof(payload->'sources'),'')<>'array' or jsonb_array_length(payload->'sources')>16
   or exists(select 1 from jsonb_array_elements_text(payload->'sources') x where x !~ '^(event|post|group|provider|agency|marketplace):[0-9a-f-]{36}$')
   then raise exception 'Invalid metrics.';end if;
  update private.neighborhood_ai_runs set intent=payload->>'intent',outcome=payload->>'outcome',source_refs=payload->'sources',
   retrieval_ms=greatest(0,least(60000,(payload->>'retrievalMs')::integer)),answer_ms=greatest(0,least(60000,(payload->>'answerMs')::integer)),
   input_tokens=greatest(0,least(20000,(payload->>'inputTokens')::integer)),output_tokens=greatest(0,least(2400,(payload->>'outputTokens')::integer)),
   model=case when payload->>'model' ~ '^[a-zA-Z0-9._-]{1,80}$' then payload->>'model' end where id=run_id;
 else raise exception 'Invalid action.';end if;
 return '{}'::jsonb;
end $$;
commit;
