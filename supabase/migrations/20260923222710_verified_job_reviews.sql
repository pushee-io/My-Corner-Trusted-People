-- Extend the original reviews/notifications/moderation foundations.
insert into public.feature_flags(key,enabled,description) values
 ('verified_job_reviews',false,'Completed-job reviews; explicitly enable in Preview') on conflict(key) do nothing;
create table private.community_account_controls (
 profile_id uuid primary key references public.profiles(id) on delete cascade,
 suspended boolean not null default false
);
alter table private.community_account_controls enable row level security;
revoke all on private.community_account_controls from public,anon,authenticated;
create function private.community_account_active(actor uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select actor is not null and exists(select 1 from public.profiles where id=actor)
 and not exists(select 1 from private.community_account_controls where profile_id=actor and suspended)
$$;
revoke all on function private.community_account_active(uuid) from public,anon;
grant execute on function private.community_account_active(uuid) to authenticated;

alter table public.reviews
 add column title text not null default '',
 add column recommends boolean,
 add column verified_job boolean not null default false,
 add column public_author text not null default 'Neighbor',
 add column updated_at timestamptz not null default now(),
 add column provider_response text,
 add column responded_at timestamptz,
 add column response_status public.moderation_status not null default 'not_run';
create unique index reviews_one_verified_job on public.reviews(job_request_id) where verified_job;
create index reviews_provider_published on public.reviews(provider_id,created_at desc) where verified_job and moderation_status='clean';
alter table public.reviews add constraint verified_review_shape check(not verified_job or (
 job_request_id is not null and reviewer_id is not null and provider_id is not null and recommends is not null
 and char_length(title) between 3 and 100 and char_length(body) between 10 and 2000));
-- Base records contain private relationships. Only curated RPC output is public.
revoke all on public.reviews from anon,authenticated;
create table private.review_versions (
 id bigint generated always as identity primary key,
 review_id uuid not null references public.reviews(id) on delete cascade,
 actor_id uuid references public.profiles(id) on delete set null,
 snapshot jsonb not null,
 created_at timestamptz not null default now()
);
alter table private.review_versions enable row level security;
revoke all on private.review_versions from public,anon,authenticated;
alter table public.reports add column review_id uuid references public.reviews(id) on delete set null;
alter table public.notifications add column target_kind text, add column target_id uuid;

create function private.queue_community_notification(recipient uuid,kind text,target uuid,heading text)
returns void language plpgsql security definer set search_path='' as $$
begin
 insert into public.notifications(profile_id,title,body,target_kind,target_id)
 values(recipient,heading,'Open My Corner to view this update.',kind,target);
 insert into public.domain_event_outbox(aggregate_type,aggregate_id,recipient_profile_id,event_type,payload)
 values(kind,target,recipient,kind,jsonb_build_object('targetId',target));
end $$;
revoke all on function private.queue_community_notification(uuid,text,uuid,text) from public,anon,authenticated;

create function private.review_api(action text,target uuid,payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare
 actor uuid:=public.current_profile_id(); job public.job_requests; item public.reviews;
 provider public.provider_profiles; score integer; heading text; content text; recommendation boolean;
 state public.moderation_status; result jsonb; editing boolean:=false; response_target boolean; completed_verified boolean;
begin
 if auth.uid() is null or not private.community_account_active(actor) then
  raise exception 'Sign in with an active account.' using errcode='42501';
 end if;
 if not exists(select 1 from public.feature_flags where key='verified_job_reviews' and enabled) then
  raise exception 'Reviews are not available yet.' using errcode='42501';
 end if;
 if action='provider' then
  select * into provider from public.provider_profiles where id=target;
  if not found then raise exception 'Provider unavailable.' using errcode='42501'; end if;
  select jsonb_build_object('average',coalesce(round(avg(rating),1),0),'count',count(*),
   'recommendationPercent',case when count(*)>=5 then round(100.0*count(*) filter(where recommends)/count(*)) else null end,
   'completedJobs',(select count(*) from public.job_requests where provider_id=target and status='Completed'),
   'canRespond',provider.profile_id=actor,
   'reviews',coalesce((select jsonb_agg(v.data order by v.created_at desc) from (
    select r.created_at,jsonb_build_object('id',r.id,'rating',r.rating,'title',r.title,'body',r.body,
     'author',r.public_author,'createdAt',r.created_at,'updatedAt',r.updated_at,'recommends',r.recommends,
     'response',case when r.response_status='clean' then r.provider_response end,
     'respondedAt',case when r.response_status='clean' then r.responded_at end,
     'canRespond',provider.profile_id=actor and r.responded_at is null) as data
    from public.reviews r where r.provider_id=target and r.verified_job and r.moderation_status='clean'
    order by r.created_at desc limit 50) v),'[]'::jsonb)) into result
   from public.reviews where provider_id=target and verified_job and moderation_status='clean';
  return result;
 elsif action in ('job','submit','event') then
  select * into job from public.job_requests where id=target for update;
  if not found or job.requester_id is distinct from actor or job.provider_id is null then
   raise exception 'This job is not available for review.' using errcode='42501';
  end if;
  select * into provider from public.provider_profiles where id=job.provider_id;
  select * into item from public.reviews where job_request_id=target and verified_job;
  completed_verified:=job.status='Completed' and exists(select 1 from public.job_safety_sessions where job_request_id=job.id and state='completed' and requester_completed_at is not null and provider_completed_at is not null);
  if action='event' then
   if payload->>'event' is null or payload->>'event' not in ('review_prompt_viewed','review_started') or not completed_verified then
    raise exception 'Invalid review event.' using errcode='22023';
   end if;
   if not exists(select 1 from public.audit_events ae where ae.actor_id=actor and ae.target_id=target and ae.action=payload->>'event') then
    insert into public.audit_events(actor_id,action,target_table,target_id) values(actor,payload->>'event','job_requests',target);
   end if;
   return '{}'::jsonb;
  end if;
  if action='job' then
   return jsonb_build_object('providerName',provider.business_name,'providerId',provider.id,
    'completed',completed_verified,'canReview',completed_verified and item.id is null,
    'canEdit',item.moderation_status='clean' and item.responded_at is null and item.created_at>now()-interval '7 days',
    'review',case when item.id is not null then jsonb_build_object('id',item.id,'rating',item.rating,'title',item.title,
      'body',item.body,'recommends',item.recommends,'status',item.moderation_status) end);
  end if;
  if not completed_verified or provider.profile_id=actor then
   raise exception 'Only your completed job can be reviewed.' using errcode='42501';
  end if;
  score:=(payload->>'rating')::integer; heading:=btrim(payload->>'title');content:=btrim(payload->>'body');
  recommendation:=(payload->>'recommends')::boolean;
  if score is null or score not between 1 and 5 or heading is null or char_length(heading) not between 3 and 100
   or content is null or char_length(content) not between 10 and 2000 or recommendation is null then
   raise exception 'Add 1–5 stars, a title (3–100 characters), a review (10–2000 characters), and a recommendation.' using errcode='22023';
  end if;
  if regexp_replace(heading||content,E'[\n\r\t]','','g') ~ '<[^>]*>|[[:cntrl:]]' then
   raise exception 'Use plain text without HTML or control characters.' using errcode='22023';
  end if;
  state:=case when heading||' '||content ~* '([[:alnum:]._%+-]+@[[:alnum:].-]+\.[a-z]{2,}|[0-9][0-9 ()+.-]{6,}[0-9]|\m[A-Z]{2}-[0-9]{3,4}-[0-9]{4}\M|exact address|house number)' then 'flagged'::public.moderation_status else 'clean'::public.moderation_status end;
  if item.id is not null then
   if coalesce((payload->>'edit')::boolean,false) is false then
    raise exception 'This job already has a review.' using errcode='23505';
   end if;
   if item.responded_at is not null or item.created_at<=now()-interval '7 days' or item.moderation_status<>'clean' then
    raise exception 'This review can no longer be edited.' using errcode='42501';
   end if;
   editing:=true;
   insert into private.review_versions(review_id,actor_id,snapshot) values(item.id,actor,to_jsonb(item));
   update public.reviews set rating=score,title=heading,body=content,recommends=recommendation,
    moderation_status=state,updated_at=now() where id=item.id returning * into item;
  else
   insert into public.reviews(job_request_id,reviewer_id,provider_id,rating,title,body,recommends,verified_job,moderation_status,public_author)
   values(job.id,actor,job.provider_id,score,heading,content,recommendation,true,state,
    coalesce((select nullif(public_display_name,'') from public.private_identity_profiles where profile_id=actor),'Neighbor')) returning * into item;
  end if;
  insert into public.audit_events(actor_id,action,target_table,target_id,metadata)
   values(actor,case when editing then 'review_edited' else 'review_submitted' end,'reviews',item.id,jsonb_build_object('rating',score,'status',state));
  if state='flagged' then
   insert into public.moderation_cases(source_table,source_id,reason) values('reviews',item.id,'Possible personal information');
  elsif not editing then
   perform private.queue_community_notification(provider.profile_id,'review_received',provider.id,'You received a verified review');
  end if;
  return jsonb_build_object('id',item.id,'status',state);
 elsif action='mine' then
  select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'jobId',r.job_request_id,'providerId',r.provider_id,
   'title',r.title,'rating',r.rating,'status',r.moderation_status,'createdAt',r.created_at) order by r.created_at desc),'[]'::jsonb)
   into result from public.reviews r where r.reviewer_id=actor and r.verified_job;
  return result;
 elsif action='queue' then
  if not public.is_admin_or_moderator() then raise exception 'Moderator access required.' using errcode='42501'; end if;
  select coalesce(jsonb_agg(v.data),'[]'::jsonb) into result from (
   select jsonb_build_object('caseId',c.id,'reviewId',r.id,'reason',c.reason,'title',r.title,'body',r.body,
    'response',r.provider_response,'rating',r.rating,'status',r.moderation_status) data
   from public.moderation_cases c join public.reviews r on r.id=c.source_id and c.source_table='reviews'
   where c.status in ('open','reviewing') order by c.created_at limit 100) v;
  return result;
 elsif action in ('reply','report','moderate') then
  select * into item from public.reviews where id=target and verified_job for update;
  if not found then raise exception 'Review unavailable.' using errcode='42501'; end if;
  select * into provider from public.provider_profiles where id=item.provider_id;
  if action='reply' then
   if provider.profile_id is distinct from actor or item.responded_at is not null or item.moderation_status<>'clean' then
    raise exception 'A provider can respond once to their published review.' using errcode='42501';
   end if;
   content:=btrim(payload->>'body');
   if content is null or char_length(content) not between 2 and 1000 or regexp_replace(content,E'[\n\r\t]','','g') ~ '<[^>]*>|[[:cntrl:]]' then
    raise exception 'Use 2–1000 characters of plain text.' using errcode='22023'; end if;
   state:=case when content ~* '(@|[0-9][0-9 ()+.-]{6,}[0-9]|exact address|house number)' then 'flagged'::public.moderation_status else 'clean'::public.moderation_status end;
   update public.reviews set provider_response=content,responded_at=now(),response_status=state where id=item.id;
   insert into public.audit_events(actor_id,action,target_table,target_id) values(actor,'provider_review_response_added','reviews',item.id);
   if state='flagged' then insert into public.moderation_cases(source_table,source_id,reason) values('reviews',item.id,'Response: possible personal information');
   else perform private.queue_community_notification(item.reviewer_id,'review_response',provider.id,'Your review received a response'); end if;
  elsif action='report' then
   if item.moderation_status<>'clean' then raise exception 'Review unavailable.' using errcode='42501'; end if;
   content:=btrim(payload->>'reason');
   if content is null or char_length(content) not between 5 and 500 then raise exception 'Add a reason (5–500 characters).' using errcode='22023'; end if;
   if exists(select 1 from public.reports where reporter_id=actor and review_id=item.id and status='open') then return '{}'::jsonb; end if;
   if (select count(*) from public.reports where reporter_id=actor and created_at>now()-interval '1 day')>=20 then raise exception 'Please try again later.' using errcode='42501'; end if;
   insert into public.reports(reporter_id,provider_id,review_id,reason) values(actor,item.provider_id,item.id,content);
   insert into public.moderation_cases(source_table,source_id,reason) values('reviews',item.id,content);
   insert into public.audit_events(actor_id,action,target_table,target_id) values(actor,'review_reported','reviews',item.id);
  else
   if not public.is_admin_or_moderator() then raise exception 'Moderator access required.' using errcode='42501'; end if;
   if payload->>'decision' is null or payload->>'decision' not in ('clean','flagged','blocked') then raise exception 'Invalid decision.' using errcode='22023'; end if;
   content:=btrim(payload->>'reason');
   if content is null or char_length(content) not between 5 and 500 then raise exception 'Add decision notes.' using errcode='22023'; end if;
   insert into private.review_versions(review_id,actor_id,snapshot) values(item.id,actor,to_jsonb(item));
   response_target:=coalesce((payload->>'response')::boolean,false);
   if response_target then update public.reviews set response_status=(payload->>'decision')::public.moderation_status where id=item.id;
   else update public.reviews set moderation_status=(payload->>'decision')::public.moderation_status,updated_at=now() where id=item.id; end if;
   update public.moderation_cases set status='resolved' where source_table='reviews' and source_id=item.id;
   update public.reports set status='resolved' where review_id=item.id;
   insert into public.audit_events(actor_id,action,target_table,target_id,metadata) values(actor,'review_moderated','reviews',item.id,jsonb_build_object('decision',payload->>'decision','response',response_target,'reason',content));
  end if;
  return '{}'::jsonb;
 end if;
 raise exception 'Unknown review action.' using errcode='22023';
end $$;
revoke all on function private.review_api(text,uuid,jsonb) from public,anon;
grant execute on function private.review_api(text,uuid,jsonb) to authenticated;
create function public.review_api(action text,target uuid default null,payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$ select private.review_api(action,target,payload) $$;
revoke all on function public.review_api(text,uuid,jsonb) from public,anon;
grant execute on function public.review_api(text,uuid,jsonb) to authenticated;
