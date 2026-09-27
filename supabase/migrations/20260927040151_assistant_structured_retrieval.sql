begin;
-- No new content store or vector index. Reuse caller RLS and existing public text.
-- Feed comments predate canonical migrations in some Preview schemas; absence is
-- an explicit supported capability, never a reason to fail all Feed retrieval.
create function private.ai_feed_comment_text(target uuid, query tsquery) returns text
language plpgsql stable security invoker set search_path='' as $$
declare result text;
begin
 if to_regclass('public.neighborhood_feed_comments') is null then return '';end if;
 if not has_table_privilege(current_user,'public.neighborhood_feed_comments','select') then return '';end if;
 select coalesce(string_agg(E'\nNeighbor comment: '||v.body,''),'') into result from (
  select c.body from public.neighborhood_feed_comments c where c.post_id=target
   and c.moderation_status in ('clean','not_run') and private.ai_source_author_allowed(c.author_id)
   and (numnode(query)=0 or to_tsvector('english',c.body)@@query)
  order by ts_rank(to_tsvector('english',c.body),query) desc,c.created_at desc,c.id limit 2
 ) v;return result;
end $$;
create function private.ai_group_comment_text(target uuid, query tsquery) returns text
language sql stable security invoker set search_path='' as $$
 select coalesce(string_agg(E'\nGroup comment: '||v.body,''),'') from (
  select c.body from public.social_group_post_comments c where c.post_id=target
   and c.moderation_status in ('clean','not_run') and private.ai_source_author_allowed(c.author_profile_id)
   and (numnode(query)=0 or to_tsvector('english',c.body)@@query)
  order by ts_rank(to_tsvector('english',c.body),query) desc,c.created_at desc,c.id limit 2
 ) v
$$;
revoke all on function private.ai_feed_comment_text(uuid,tsquery),private.ai_group_comment_text(uuid,tsquery) from public,anon;
grant execute on function private.ai_feed_comment_text(uuid,tsquery),private.ai_group_comment_text(uuid,tsquery) to authenticated;

create function public.neighborhood_ai_retrieve(source_kind text, terms text default '', selected_neighborhood uuid default null,
 since_at timestamptz default null, until_at timestamptz default null, options jsonb default '{}') returns jsonb
language plpgsql stable security invoker set search_path='' set statement_timeout='5s' as $$
declare hood uuid; result jsonb; query tsquery; metric text:=options->>'metric'; categories jsonb:=coalesce(options->'categories','[]'::jsonb);
begin
 hood:=(public.neighborhood_ai_context(selected_neighborhood)->>'id')::uuid;
 if char_length(coalesce(terms,''))>160 or source_kind not in ('event','post','group','provider','agency','marketplace') then
  raise exception 'Invalid retrieval tool.' using errcode='22023'; end if;
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
    and (numnode(query)=0 or to_tsvector('english',e.title||' '||e.description)@@query)
   order by case when metric='rsvps' then e.attendee_count end desc nulls last,ts_rank(to_tsvector('english',e.title||' '||e.description),query) desc,e.starts_at asc,e.id limit 8) v;
 elsif source_kind='post' then
  select coalesce(jsonb_agg(v.data),'[]') into result from (
   select jsonb_build_object('id',p.id,'kind','post','title','Neighborhood post','text',left(p.body,800)||private.ai_feed_comment_text(p.id,query),
    'publishedAt',p.created_at,'authority','Neighbor report','href','/community?postId='||p.id) as data
   from public.neighborhood_feed_posts p where p.neighborhood_id=hood and p.moderation_status in ('clean','not_run')
    and private.ai_source_author_allowed(p.author_id)
    and (since_at is null or p.created_at>=since_at) and (until_at is null or p.created_at<until_at)
    and (numnode(query)=0 or to_tsvector('english',p.body||private.ai_feed_comment_text(p.id,query))@@query)
   order by ts_rank(to_tsvector('english',p.body||private.ai_feed_comment_text(p.id,query)),query) desc,p.created_at desc,p.id limit 8) v;
 elsif source_kind='group' then
  select coalesce(jsonb_agg(v.data),'[]') into result from (
   select jsonb_build_object('id',p.id,'kind','group','title',g.name,'text',left(g.description,400)||E'\nDiscussion: '||left(p.body,700)||private.ai_group_comment_text(p.id,query),
    'publishedAt',p.updated_at,'authority','Group discussion','href','/groups/'||g.id||'?postId='||p.id) as data
   from public.social_group_posts p join public.social_groups g on g.id=p.group_id
   where g.neighborhood_id=hood and public.can_view_social_group(g.id) and public.is_accepted_social_group_member(g.id)
    and g.moderation_status in ('clean','not_run') and p.moderation_status in ('clean','not_run')
    and private.ai_source_author_allowed(p.author_profile_id)
    and (since_at is null or p.created_at>=since_at) and (until_at is null or p.created_at<until_at)
    and (numnode(query)=0 or to_tsvector('english',g.name||' '||g.description||' '||p.body||private.ai_group_comment_text(p.id,query))@@query)
   order by ts_rank(to_tsvector('english',g.name||' '||g.description||' '||p.body||private.ai_group_comment_text(p.id,query)),query) desc,p.created_at desc,p.id limit 8) v;
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
    and (numnode(query)=0 or to_tsvector('english',m.title||' '||m.description)@@query)
   order by case when metric='newest' then m.created_at end desc nulls last,ts_rank(to_tsvector('english',m.title||' '||m.description),query) desc,m.created_at desc,m.id limit 8) v;
 elsif source_kind='provider' then
  -- Materialize ALL authorized category candidates before computing the metric,
  -- ties, population size and limit. Never rank a capped lexical sample.
  with eligible as materialized (
   select p.id,p.business_name,p.headline,p.created_at,p.availability,
    case when exists(select 1 from public.feature_flags where key='verified_job_reviews' and enabled)
     then public.review_api('provider',p.id,'{"limit":3}')-'canRespond'-'nextCursor' else null end reputation,
    ts_rank(to_tsvector('english',p.business_name||' '||p.headline||' '||coalesce(s.labels,'')),query) relevance
   from public.provider_profiles p
   left join lateral (select string_agg(service_label||' '||category_id,' ') labels from public.provider_services where provider_id=p.id) s on true
   where p.accepting_requests and private.ai_source_author_allowed(p.profile_id)
    and exists(select 1 from public.provider_service_areas a where a.provider_id=p.id and a.neighborhood_id=hood)
    and (options->>'providerId' is null or p.id=(options->>'providerId')::uuid)
    and (case when jsonb_array_length(categories)>0 then exists(select 1 from public.provider_services c where c.provider_id=p.id and categories ? c.category_id)
     else numnode(query)=0 or to_tsvector('english',p.business_name||' '||p.headline||' '||coalesce(s.labels,''))@@query end)
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
revoke all on function public.neighborhood_ai_retrieve(text,text,uuid,timestamptz,timestamptz,jsonb) from public,anon;
grant execute on function public.neighborhood_ai_retrieve(text,text,uuid,timestamptz,timestamptz,jsonb) to authenticated;

create or replace function public.neighborhood_ai_search(source_kind text,terms text default '',selected_neighborhood uuid default null,
 since_at timestamptz default null,until_at timestamptz default null) returns jsonb
language sql stable security invoker set search_path='' as $$
 select public.neighborhood_ai_retrieve(source_kind,terms,selected_neighborhood,since_at,until_at,'{}')
$$;
commit;
