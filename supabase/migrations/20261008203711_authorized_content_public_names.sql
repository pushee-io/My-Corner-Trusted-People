begin;
-- One canonical resolver, reached only through authorized content IDs. This is
-- not a profile directory. Every branch mirrors the corresponding SELECT policy.
create function private.content_public_names(kind text, content_ids uuid[]) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare actor uuid:=public.current_profile_id(); peers uuid[];
begin
 if auth.uid() is null or actor is null or not private.community_account_active(actor) then
  raise exception 'Sign in with an active account.' using errcode='42501'; end if;
 if coalesce(cardinality(content_ids),0)>100 then
  raise exception 'Too many content references.' using errcode='22023'; end if;
 case kind
 when 'service_request' then
  select array_agg(distinct r.requester_id) into peers from public.job_requests r
  where r.id=any(content_ids) and private.media_parent_allowed('service_request',r.id,false);
 when 'marketplace_listing' then
  select array_agg(distinct l.seller_id) into peers from public.marketplace_listings l
  where l.id=any(content_ids) and l.moderation_status<>'blocked'
   and (public.is_admin_or_moderator() or public.has_verified_neighborhood_membership(l.neighborhood_id));
 when 'marketplace_pickup' then
  select array_agg(distinct r.requester_id) into peers from public.marketplace_pickup_requests r
  join public.marketplace_listings l on l.id=r.listing_id
  where r.id=any(content_ids) and (actor=r.requester_id or actor=l.seller_id or public.is_admin_or_moderator());
 when 'marketplace_message' then
  select array_agg(distinct m.sender_profile_id) into peers from public.marketplace_messages m
  where m.id=any(content_ids) and m.moderation_status='clean' and private.can_read_conversation(m.conversation_id);
 when 'group_post' then
  select array_agg(distinct p.author_profile_id) into peers from public.social_group_posts p
  where p.id=any(content_ids) and p.moderation_status<>'blocked'
   and public.can_view_social_group(p.group_id) and public.is_accepted_social_group_member(p.group_id);
 when 'group_comment' then
  select array_agg(distinct c.author_profile_id) into peers from public.social_group_post_comments c
  join public.social_group_posts p on p.id=c.post_id
  where c.id=any(content_ids) and c.moderation_status<>'blocked' and p.moderation_status<>'blocked'
   and public.can_view_social_group(p.group_id) and public.is_accepted_social_group_member(p.group_id);
 when 'event' then
  select array_agg(distinct e.organizer_profile_id) into peers from public.events e
  where e.id=any(content_ids) and public.is_events_feature_enabled() and public.can_view_event(e.id);
 when 'event_comment' then
  select array_agg(distinct c.author_profile_id) into peers from public.event_comments c
  where c.id=any(content_ids) and public.is_events_feature_enabled() and public.can_view_event(c.event_id)
   and (c.moderation_status='approved' or c.author_profile_id=actor or public.is_admin_or_moderator());
 when 'event_rsvp' then
  select array_agg(distinct r.profile_id) into peers from public.event_rsvps r
  where r.id=any(content_ids) and public.is_events_feature_enabled()
   and (r.profile_id=actor or public.can_manage_event(r.event_id,'manage_attendees'));
 else raise exception 'Invalid content kind.' using errcode='22023';
 end case;
 return coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',private.neighbor_name(id)) order by id)
  from (select distinct unnest(peers) id) allowed where private.ai_source_author_allowed(id)), '[]');
end $$;
revoke all on function private.content_public_names(text,uuid[]) from public,anon;
grant execute on function private.content_public_names(text,uuid[]) to authenticated;
create function public.content_public_names(kind text,content_ids uuid[]) returns jsonb
language sql stable security invoker set search_path='' as $$select private.content_public_names(kind,content_ids)$$;
revoke all on function public.content_public_names(text,uuid[]) from public,anon;
grant execute on function public.content_public_names(text,uuid[]) to authenticated;
-- Aggregate and public rows share one server-verified completed-job relation.
create or replace function private.provider_review_page(target uuid,payload jsonb) returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.current_profile_id(); owner_id uuid; page_size integer:=greatest(0,least(10,coalesce((payload->>'limit')::integer,3)));
 cursor_time timestamptz; cursor_id uuid; result jsonb;
begin
 if actor is null or not private.community_account_active(actor) then raise exception 'Sign in with an active account.' using errcode='42501';end if;
 -- Match the accepting-provider SELECT policy used by the public profile repository.
 select profile_id into owner_id from public.provider_profiles where id=target and accepting_requests;
 if not found then raise exception 'Provider unavailable.' using errcode='42501';end if;
 if payload->'before' is not null then
  cursor_time:=(payload->'before'->>'createdAt')::timestamptz; cursor_id:=(payload->'before'->>'id')::uuid;
  if cursor_time is null or cursor_id is null then raise exception 'Invalid review cursor.' using errcode='22023';end if;
 end if;
 with eligible as materialized (
  select r.* from public.reviews r join public.job_requests j on j.id=r.job_request_id
   join public.job_safety_sessions s on s.job_request_id=j.id
  where r.provider_id=target and r.verified_job and r.moderation_status='clean'
   and j.requester_id=r.reviewer_id and j.provider_id=r.provider_id and j.status='Completed'
   and s.state='completed' and s.requester_completed_at is not null and s.provider_completed_at is not null
 ), candidates as (
  select * from eligible where cursor_time is null or (created_at,id)<(cursor_time,cursor_id)
  order by created_at desc,id desc limit page_size+1
 ), page as (select * from candidates order by created_at desc,id desc limit page_size)
 select jsonb_build_object(
  'average',coalesce((select round(avg(rating),1) from eligible),0),
  'count',(select count(*) from eligible),'verifiedCount',(select count(*) from eligible),
  'recommendationPercent',(select case when count(*)>=5 then round(100.0*count(*) filter(where recommends)/count(*)) else null end from eligible),
  'completedJobs',(select count(*) from public.job_requests j join public.job_safety_sessions s on s.job_request_id=j.id where j.provider_id=target and j.status='Completed' and s.state='completed' and s.requester_completed_at is not null and s.provider_completed_at is not null),
  'canRespond',owner_id=actor,
  'reviews',coalesce((select jsonb_agg(jsonb_build_object(
   'id',r.id,'rating',r.rating,'title',r.title,'body',r.body,'author',case
     -- Reviews historically never exposed an unqualified profiles.display_name.
     -- Apply current canonical names when public consent exists; otherwise keep
     -- the already-approved review projection, including intentional anonymity.
     when exists(select 1 from private.public_profile_names n where n.profile_id=r.reviewer_id)
       or exists(select 1 from public.private_identity_profiles n where n.profile_id=r.reviewer_id)
     then private.neighbor_name(r.reviewer_id)
     else coalesce(nullif(r.public_author,''),'Neighbor') end,
   'createdAt',r.created_at,'updatedAt',r.updated_at,'recommends',r.recommends,
   'response',case when r.response_status='clean' then r.provider_response end,
   'respondedAt',case when r.response_status='clean' then r.responded_at end,
   'canRespond',owner_id=actor and r.responded_at is null) order by r.created_at desc,r.id desc) from page r),'[]'::jsonb),
  'nextCursor',case when page_size>0 and (select count(*) from candidates)>page_size then
   (select jsonb_build_object('id',id,'createdAt',created_at) from page order by created_at,id limit 1) else null end
 ) into result; return result;
end $$;
revoke all on function private.provider_review_page(uuid,jsonb) from public,anon,authenticated;


commit;
