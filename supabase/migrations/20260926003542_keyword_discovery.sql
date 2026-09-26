begin;
-- Literal lexemes only: English inflection normalization, OR recall and word-prefix
-- discovery. No raw question operators, SQL, phrase constraints or topic-specific rules.
create function private.neighborhood_keyword_query(terms text) returns tsquery
language sql immutable security invoker set search_path='' as $$
 select coalesce(to_tsquery('english',string_agg(quote_literal(lexeme)||':*',' | ')),''::tsquery)
 from unnest(tsvector_to_array(to_tsvector('english',regexp_replace(
  left(coalesce(terms,''),160),
  '\m(what|whats|which|who|happening|happen|show|find|please|nearby|neighborhood|neighbourhood)\M',
  ' ','gi')))) lexeme
$$;
revoke all on function private.neighborhood_keyword_query(text) from public,anon;
grant execute on function private.neighborhood_keyword_query(text) to authenticated;

create or replace function public.neighborhood_ai_search(source_kind text, terms text default '', selected_neighborhood uuid default null,
 since_at timestamptz default null, until_at timestamptz default null) returns jsonb
language plpgsql stable security invoker set search_path='' set statement_timeout='5s' as $$
declare hood uuid; result jsonb; query tsquery;
begin
 hood:=(public.neighborhood_ai_context(selected_neighborhood)->>'id')::uuid;
 if char_length(coalesce(terms,''))>160 or source_kind not in ('event','post','group','provider','agency','marketplace') then
  raise exception 'Invalid retrieval tool.' using errcode='22023'; end if;
 query:=private.neighborhood_keyword_query(terms);
 if source_kind='event' then
  select coalesce(jsonb_agg(v.data),'[]') into result from (
   select jsonb_build_object('id',e.id,'kind','event','title',e.title,'text',left(e.description,1600),
    'publishedAt',e.updated_at,'startsAt',e.starts_at,'endsAt',e.ends_at,'timezone',e.timezone,
    'organizer',private.ai_event_organizer(e.id),'authority','Event','href','/events/'||e.id) as data
   from public.events e where e.neighborhood_id=hood and public.is_events_feature_enabled()
    and e.moderation_status='approved' and e.status in ('scheduled','completed')
    -- Private invite-only events are excluded even for moderators/organizers in v1.
    and e.visibility in ('verified_neighborhood_members','immediate_cluster_members') and public.can_view_event(e.id)
    and private.ai_source_author_allowed(e.organizer_profile_id)
    and (since_at is null or e.starts_at>=since_at) and (until_at is null or e.starts_at<until_at)
    and (numnode(query)=0 or to_tsvector('english',e.title||' '||e.description)@@query)
   order by ts_rank(to_tsvector('english',e.title||' '||e.description),query) desc,e.starts_at asc,e.id limit 8) v;
 elsif source_kind='post' then
  select coalesce(jsonb_agg(v.data),'[]') into result from (
   select jsonb_build_object('id',p.id,'kind','post','title','Neighborhood post','text',left(p.body,1600),
    'publishedAt',p.created_at,'authority','Neighbor report','href','/community?postId='||p.id) as data
   from public.neighborhood_feed_posts p where p.neighborhood_id=hood and p.moderation_status in ('clean','not_run')
    and private.ai_source_author_allowed(p.author_id)
    and (since_at is null or p.created_at>=since_at) and (until_at is null or p.created_at<until_at)
    and (numnode(query)=0 or to_tsvector('english',p.body)@@query)
   order by ts_rank(to_tsvector('english',p.body),query) desc,p.created_at desc,p.id limit 8) v;
 elsif source_kind='group' then
  select coalesce(jsonb_agg(v.data),'[]') into result from (
   select jsonb_build_object('id',p.id,'kind','group','title',g.name,'text',left(p.body,1600),
    'publishedAt',p.updated_at,'authority','Group discussion','href','/groups/'||g.id||'?postId='||p.id) as data
   from public.social_group_posts p join public.social_groups g on g.id=p.group_id
   where g.neighborhood_id=hood and public.can_view_social_group(g.id) and public.is_accepted_social_group_member(g.id)
    and g.moderation_status in ('clean','not_run') and p.moderation_status in ('clean','not_run')
    and private.ai_source_author_allowed(p.author_profile_id)
    and (since_at is null or p.created_at>=since_at) and (until_at is null or p.created_at<until_at)
    and (numnode(query)=0 or to_tsvector('english',g.name||' '||p.body)@@query)
   order by ts_rank(to_tsvector('english',g.name||' '||p.body),query) desc,p.created_at desc,p.id limit 8) v;
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
    'publishedAt',m.updated_at,'priceGhs',m.price_ghs,'authority','Marketplace listing',
    'href','/marketplace/listing/'||m.id) as data
   from public.marketplace_listings m where m.neighborhood_id=hood and m.moderation_status in ('clean','not_run')
    and private.ai_source_author_allowed(m.seller_id)
    and (since_at is null or m.created_at>=since_at) and (until_at is null or m.created_at<until_at)
    and (numnode(query)=0 or to_tsvector('english',m.title||' '||m.description)@@query)
   order by ts_rank(to_tsvector('english',m.title||' '||m.description),query) desc,m.created_at desc,m.id limit 8) v;
 elsif source_kind='provider' then
  select coalesce(jsonb_agg(v.data),'[]') into result from (
   select jsonb_build_object('id',p.id,'kind','provider','title',p.business_name,'text',left(p.headline,1000),
    'publishedAt',p.created_at,'availability',p.availability,'authority','Provider profile',
    'href','/hire/provider/'||p.id,
    -- Reuse the server-verified completed-job review projection, never legacy seed counters.
    'reputation',case when exists(select 1 from public.feature_flags where key='verified_job_reviews' and enabled)
     then public.review_api('provider',p.id,'{"limit":3}')-'canRespond'-'nextCursor' else null end) as data
   from public.provider_profiles p where p.accepting_requests and private.ai_source_author_allowed(p.profile_id)
    and exists(select 1 from public.provider_service_areas a where a.provider_id=p.id and a.neighborhood_id=hood)
    and (numnode(query)=0 or to_tsvector('english',p.business_name||' '||p.headline||' '||coalesce((select string_agg(s.service_label||' '||s.category_id,' ') from public.provider_services s where s.provider_id=p.id),''))@@query)
   order by ts_rank(to_tsvector('english',p.business_name||' '||p.headline||' '||coalesce((select string_agg(s.service_label||' '||s.category_id,' ') from public.provider_services s where s.provider_id=p.id),'')),query) desc,p.business_name,p.id limit 8) v;
 end if;
 return result;
end $$;
revoke all on function public.neighborhood_ai_search(text,text,uuid,timestamptz,timestamptz) from public,anon;
grant execute on function public.neighborhood_ai_search(text,text,uuid,timestamptz,timestamptz) to authenticated;

commit;
