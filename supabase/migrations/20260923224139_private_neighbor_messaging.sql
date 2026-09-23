-- One conversation/message store: extend the existing Marketplace foundation.
insert into public.feature_flags(key,enabled,description) values('neighbor_messaging',false,'Verified-neighbor text chat; explicit Preview activation') on conflict(key) do nothing;
alter table public.marketplace_conversations alter column pickup_request_id drop not null, alter column listing_id drop not null;
alter table public.marketplace_conversations
 add column kind text not null default 'marketplace' check(kind in ('marketplace','neighbor')),
 add column neighborhood_id uuid references public.neighborhoods(id),
 add column initiated_by uuid references public.profiles(id),
 add column buyer_read_seq bigint not null default 0,
 add column seller_read_seq bigint not null default 0,
 add constraint conversation_context_valid check(
  (kind='marketplace' and pickup_request_id is not null and listing_id is not null)
  or (kind='neighbor' and pickup_request_id is null and listing_id is null and neighborhood_id is not null));
create unique index neighbor_conversation_pair on public.marketplace_conversations
 (least(buyer_profile_id,seller_profile_id),greatest(buyer_profile_id,seller_profile_id)) where kind='neighbor';
alter table public.marketplace_messages
 add column client_nonce uuid not null default gen_random_uuid(),
 add column message_seq bigint generated always as identity,
 add column moderation_status public.moderation_status not null default 'clean';
create unique index message_retry_nonce on public.marketplace_messages(sender_profile_id,client_nonce);
create index message_unread_lookup on public.marketplace_messages(conversation_id,message_seq,sender_profile_id);
create table public.communication_preferences (
 profile_id uuid primary key references public.profiles(id) on delete cascade,
 discoverable boolean not null default true,
 allow_neighbor_messages boolean not null default true,
 notify_messages boolean not null default true,
 notify_reviews boolean not null default true
);
alter table public.communication_preferences enable row level security;
revoke all on public.communication_preferences from public,anon,authenticated;
grant select on public.communication_preferences to authenticated;
create policy "read own communication preferences" on public.communication_preferences for select to authenticated using(profile_id=public.current_profile_id());
revoke all on public.blocks from anon,authenticated;
grant select on public.blocks, public.notifications to authenticated;
create policy "read own blocks" on public.blocks for select to authenticated using(blocker_id=public.current_profile_id());
create table private.message_reports (
 id uuid primary key default gen_random_uuid(),
 reporter_id uuid not null references public.profiles(id),
 reported_profile_id uuid not null references public.profiles(id),
 conversation_id uuid not null references public.marketplace_conversations(id),
 message_id uuid references public.marketplace_messages(id),
 reason text not null check(char_length(reason) between 5 and 500),
 evidence jsonb not null,
 status text not null default 'open',
 decision_notes text,
 created_at timestamptz not null default now()
);
alter table private.message_reports enable row level security;
revoke all on private.message_reports from public,anon,authenticated;

create function private.neighbor_name(profile uuid) returns text
language sql stable security definer set search_path='' as $$
 select coalesce((select nullif(public_display_name,'') from public.private_identity_profiles where profile_id=profile),'Neighbor')
$$;
revoke all on function private.neighbor_name(uuid) from public,anon,authenticated;
create function private.verified_member(profile uuid,neighborhood uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.neighborhood_memberships nm where nm.profile_id=profile and nm.neighborhood_id=neighborhood
 and nm.status='verified' and nm.verified_at is not null and nm.ended_at is null
 and (nm.verification_expires_at is null or nm.verification_expires_at>now()))
$$;
revoke all on function private.verified_member(uuid,uuid) from public,anon,authenticated;
create function private.neighbor_eligible(actor uuid,peer uuid,neighborhood uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select actor<>peer and private.community_account_active(actor) and private.community_account_active(peer)
 and private.verified_member(actor,neighborhood) and private.verified_member(peer,neighborhood)
 and not exists(select 1 from public.blocks b where (b.blocker_id=actor and b.blocked_id=peer) or (b.blocker_id=peer and b.blocked_id=actor))
 and not exists(select 1 from public.communication_preferences p where p.profile_id=peer and (not p.discoverable or not p.allow_neighbor_messages))
$$;
revoke all on function private.neighbor_eligible(uuid,uuid,uuid) from public,anon,authenticated;
create function private.can_read_conversation(conversation uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and private.community_account_active(public.current_profile_id()) and exists(
 select 1 from public.marketplace_conversations c where c.id=conversation and public.current_profile_id() in(c.buyer_profile_id,c.seller_profile_id)
 and (c.kind='marketplace' or exists(select 1 from public.feature_flags where key='neighbor_messaging' and enabled)))
$$;
revoke all on function private.can_read_conversation(uuid) from public,anon;
grant execute on function private.can_read_conversation(uuid) to authenticated;
create function private.can_send_conversation(conversation uuid) returns boolean
language sql stable security definer set search_path='' as $$
 select private.can_read_conversation(conversation) and exists(select 1 from public.marketplace_conversations c
 where c.id=conversation and private.community_account_active(c.buyer_profile_id) and private.community_account_active(c.seller_profile_id)
 and not exists(select 1 from public.blocks b where (b.blocker_id=c.buyer_profile_id and b.blocked_id=c.seller_profile_id) or (b.blocker_id=c.seller_profile_id and b.blocked_id=c.buyer_profile_id))
 and (c.kind='marketplace' or private.neighbor_eligible(public.current_profile_id(),case when c.buyer_profile_id=public.current_profile_id() then c.seller_profile_id else c.buyer_profile_id end,c.neighborhood_id)))
$$;
revoke all on function private.can_send_conversation(uuid) from public,anon,authenticated;

create or replace function private.queue_community_notification(recipient uuid,kind text,target uuid,heading text)
returns void language plpgsql security definer set search_path='' as $$
begin
 if exists(select 1 from public.communication_preferences p where p.profile_id=recipient
 and ((kind like 'review_%' and not p.notify_reviews) or (kind='message_received' and not p.notify_messages))) then return; end if;
 insert into public.notifications(profile_id,title,body,target_kind,target_id)
 values(recipient,heading,'Open My Corner to view this update.',kind,target);
 insert into public.domain_event_outbox(aggregate_type,aggregate_id,recipient_profile_id,event_type,payload)
 values(kind,target,recipient,kind,jsonb_build_object('targetId',target));
end $$;

create function private.guard_conversation_message() returns trigger
language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.current_profile_id(); c public.marketplace_conversations; peer uuid;
begin
 select * into c from public.marketplace_conversations where id=new.conversation_id;
 if actor is null or new.sender_profile_id is distinct from actor or c.id is null then raise exception 'Conversation unavailable for sending.' using errcode='42501'; end if;
 perform pg_advisory_xact_lock(hashtextextended('chat-user:'||actor,0));
 perform pg_advisory_xact_lock(hashtextextended('chat-pair:'||least(c.buyer_profile_id,c.seller_profile_id)||greatest(c.buyer_profile_id,c.seller_profile_id),0));
 if not private.can_send_conversation(c.id) then raise exception 'Conversation unavailable for sending.' using errcode='42501'; end if;
 if new.moderation_status<>'clean' then raise exception 'Invalid message state.' using errcode='42501'; end if;
 new.body:=btrim(new.body);
 if char_length(new.body) not between 1 and 1000 or regexp_replace(new.body,E'[\n\r\t]','','g') ~ '[[:cntrl:]]' then
  raise exception 'Use 1–1000 characters of plain text.' using errcode='22023'; end if;
 if (select count(*) from public.marketplace_messages where sender_profile_id=actor and created_at>clock_timestamp()-interval '1 minute')>=30
 or (select count(*) from public.marketplace_messages where sender_profile_id=actor and created_at>clock_timestamp()-interval '1 day')>=500 then
  raise exception 'Please wait before sending more messages.' using errcode='42501'; end if;
 new.created_at:=clock_timestamp();
 return new;
end $$;
revoke all on function private.guard_conversation_message() from public,anon,authenticated;
create trigger conversation_message_guard before insert on public.marketplace_messages for each row execute function private.guard_conversation_message();
-- Preserve Marketplace's stricter pickup-information policy; neighbor text is not injected with contact details.
create or replace function public.guard_marketplace_message() returns trigger language plpgsql set search_path='' as $$
begin
 if exists(select 1 from public.marketplace_conversations where id=new.conversation_id and kind='marketplace') and (
  new.body ~* '(ghana\s*post|digital\s+address|exact\s+address|house\s+(number|no\.?))'
  or new.body ~* '\m[A-Z]{2}-[0-9]{3,4}-[0-9]{4}\M' or new.body ~* '\m(\+233|0)[0-9][0-9 -]{7,12}\M') then
  raise exception 'Keep exact addresses and phone numbers in the protected pickup confirmation.' using errcode='22023'; end if;
 return new;
end $$;
create function private.after_conversation_message() returns trigger language plpgsql security definer set search_path='' as $$
declare peer uuid;
begin
 update public.marketplace_conversations set updated_at=new.created_at where id=new.conversation_id
 returning case when buyer_profile_id=new.sender_profile_id then seller_profile_id else buyer_profile_id end into peer;
 perform private.queue_community_notification(peer,'message_received',new.conversation_id,'New private message');
 return new;
end $$;
revoke all on function private.after_conversation_message() from public,anon,authenticated;
create trigger conversation_message_received after insert on public.marketplace_messages for each row execute function private.after_conversation_message();

drop policy "marketplace participants read conversations" on public.marketplace_conversations;
create policy "participants read conversations" on public.marketplace_conversations for select to authenticated using(private.can_read_conversation(id));
drop policy "marketplace participants read messages" on public.marketplace_messages;
create policy "participants read messages" on public.marketplace_messages for select to authenticated using(private.can_read_conversation(conversation_id) and moderation_status='clean');
-- The existing INSERT policy is retained; the shared trigger enforces blocks, suspension and rate limits for old clients too.

create function private.messaging_api(action text,target uuid,payload jsonb default '{}') returns jsonb
language plpgsql security definer set search_path='' as $$
declare actor uuid:=public.current_profile_id(); peer uuid; neighborhood uuid; conversation_row public.marketplace_conversations;
 m public.marketplace_messages; report private.message_reports; result jsonb; content text; nonce uuid; seen bigint; older bigint;
begin
 if auth.uid() is null or not private.community_account_active(actor) then raise exception 'Sign in with an active account.' using errcode='42501'; end if;
 if action in ('neighbors','profile','start') then
  if not exists(select 1 from public.feature_flags where key='neighbor_messaging' and enabled) then raise exception 'Neighbor messages are not available yet.' using errcode='42501'; end if;
  if action='neighbors' then
   content:=left(btrim(coalesce(payload->>'query','')),80);
   select coalesce(jsonb_agg(v.data),'[]'::jsonb) into result from (
    select distinct jsonb_build_object('id',nm.profile_id,'name',private.neighbor_name(nm.profile_id),'neighborhood',n.name) data
    from public.neighborhood_memberships nm join public.neighborhoods n on n.id=nm.neighborhood_id
    where private.neighbor_eligible(actor,nm.profile_id,nm.neighborhood_id)
    and (content='' or position(lower(content) in lower(private.neighbor_name(nm.profile_id)))>0) limit 30) v;
   return result;
  end if;
  peer:=target;
  select nm.neighborhood_id into neighborhood from public.neighborhood_memberships nm
   where nm.profile_id=peer and private.neighbor_eligible(actor,peer,nm.neighborhood_id) order by nm.neighborhood_id limit 1;
  if neighborhood is null then raise exception 'Neighbor unavailable.' using errcode='42501'; end if;
  if action='profile' then return jsonb_build_object('id',peer,'name',private.neighbor_name(peer),
   'neighborhood',(select name from public.neighborhoods where id=neighborhood),'canMessage',true); end if;
  perform pg_advisory_xact_lock(hashtextextended('chat-user:'||actor,0));
  perform pg_advisory_xact_lock(hashtextextended('chat-pair:'||least(actor,peer)||greatest(actor,peer),0));
  if not private.neighbor_eligible(actor,peer,neighborhood) then raise exception 'Neighbor unavailable.' using errcode='42501'; end if;
  select * into conversation_row from public.marketplace_conversations where kind='neighbor' and least(buyer_profile_id,seller_profile_id)=least(actor,peer) and greatest(buyer_profile_id,seller_profile_id)=greatest(actor,peer);
  if conversation_row.id is null then
   if (select count(*) from public.marketplace_conversations where initiated_by=actor and kind='neighbor' and created_at>now()-interval '1 day')>=10 then raise exception 'Please wait before starting more conversations.' using errcode='42501'; end if;
   insert into public.marketplace_conversations(buyer_profile_id,seller_profile_id,kind,neighborhood_id,initiated_by)
   values(least(actor,peer),greatest(actor,peer),'neighbor',neighborhood,actor) returning * into conversation_row;
  end if;
  return jsonb_build_object('conversationId',conversation_row.id);
 elsif action='settings' then
  insert into public.communication_preferences(profile_id) values(actor) on conflict do nothing;
  if payload<>'{}'::jsonb then update public.communication_preferences set
   discoverable=coalesce((payload->>'discoverable')::boolean,discoverable),allow_neighbor_messages=coalesce((payload->>'allowNeighborMessages')::boolean,allow_neighbor_messages),
   notify_messages=coalesce((payload->>'notifyMessages')::boolean,notify_messages),notify_reviews=coalesce((payload->>'notifyReviews')::boolean,notify_reviews) where profile_id=actor; end if;
  select jsonb_build_object('discoverable',p.discoverable,'allowNeighborMessages',p.allow_neighbor_messages,'notifyMessages',p.notify_messages,'notifyReviews',p.notify_reviews) into result from public.communication_preferences p where p.profile_id=actor;
  return result;
 elsif action in ('inbox','unread') then
  select jsonb_build_object('unread',coalesce(sum(v.unread),0),'conversations',coalesce(jsonb_agg(v.data order by v.activity desc),'[]'::jsonb)) into result from (
   select counts.unread,coalesce(latest.created_at,c.created_at) activity,jsonb_build_object('id',c.id,'kind',c.kind,
    'peerId',case when c.buyer_profile_id=actor then c.seller_profile_id else c.buyer_profile_id end,
    'name',private.neighbor_name(case when c.buyer_profile_id=actor then c.seller_profile_id else c.buyer_profile_id end),
    'preview',case when latest.moderation_status='clean' then left(latest.body,80) else 'Message unavailable' end,
    'updatedAt',coalesce(latest.created_at,c.created_at),'unread',counts.unread) data
   from public.marketplace_conversations c
   left join lateral(select body,created_at,moderation_status from public.marketplace_messages where conversation_id=c.id order by message_seq desc limit 1) latest on true
   cross join lateral(select count(*) unread from public.marketplace_messages where conversation_id=c.id and sender_profile_id<>actor and moderation_status='clean' and message_seq>case when c.buyer_profile_id=actor then c.buyer_read_seq else c.seller_read_seq end) counts
   where private.can_read_conversation(c.id)) v;
  if action='unread' then return jsonb_build_object('unread',result->'unread'); end if;
  return result;
 elsif action='notifications' then
  select coalesce(jsonb_agg(v.data order by v.created_at desc),'[]'::jsonb) into result from (
   select n.created_at,jsonb_build_object('id',n.id,'title',n.title,'body',n.body,'readAt',n.read_at,'createdAt',n.created_at,'targetKind',n.target_kind,'targetId',n.target_id) data
   from public.notifications n where n.profile_id=actor order by n.created_at desc limit 100) v; return result;
 elsif action='read_notification' then
  update public.notifications set read_at=coalesce(read_at,now()) where id=target and profile_id=actor;return '{}'::jsonb;
 elsif action='reports' then
  if not public.is_admin_or_moderator() then raise exception 'Moderator access required.' using errcode='42501';end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',r.id,'reason',r.reason,'evidence',r.evidence,'createdAt',r.created_at) order by r.created_at),'[]'::jsonb) into result from private.message_reports r where r.status='open';return result;
 elsif action='moderate' then
  if not public.is_admin_or_moderator() then raise exception 'Moderator access required.' using errcode='42501';end if;
  select * into report from private.message_reports where id=target and status='open' for update;
  if not found then raise exception 'Report unavailable.' using errcode='42501';end if;
  content:=btrim(payload->>'reason');
  if content is null or char_length(content) not between 5 and 500 or payload->>'decision' is null or payload->>'decision' not in ('dismiss','remove_message','suspend') then raise exception 'Choose a decision and add notes.' using errcode='22023';end if;
  if payload->>'decision'='remove_message' then
   if report.message_id is null then raise exception 'This report does not identify one message.' using errcode='22023';end if;
   update public.marketplace_messages set moderation_status='blocked' where id=report.message_id;
  elsif payload->>'decision'='suspend' then
   insert into private.community_account_controls(profile_id,suspended) values(report.reported_profile_id,true) on conflict(profile_id) do update set suspended=true;
  end if;
  update private.message_reports set status='resolved',decision_notes=content where id=target;
  update public.moderation_cases set status='resolved' where source_table='message_reports' and source_id=target;
  insert into public.audit_events(actor_id,action,target_table,target_id,metadata) values(actor,'message_report_moderated','message_reports',target,jsonb_build_object('decision',payload->>'decision'));
  return '{}'::jsonb;
 end if;
 -- Both current inbox routes and existing Marketplace request links reach the same thread.
 if action='resolve_marketplace' then
  select * into conversation_row from public.marketplace_conversations where pickup_request_id=target and kind='marketplace';
 else select * into conversation_row from public.marketplace_conversations where id=target;end if;
 if conversation_row.id is null or not private.can_read_conversation(conversation_row.id) then raise exception 'Conversation unavailable.' using errcode='42501';end if;
 peer:=case when conversation_row.buyer_profile_id=actor then conversation_row.seller_profile_id else conversation_row.buyer_profile_id end;
 if action='resolve_marketplace' then return jsonb_build_object('conversationId',conversation_row.id); end if;
 if action='thread' then
  older:=coalesce((payload->>'before')::bigint,9223372036854775807);
  select jsonb_build_object('id',conversation_row.id,'name',private.neighbor_name(peer),'peerId',peer,'canSend',private.can_send_conversation(conversation_row.id),
   'blockedByMe',exists(select 1 from public.blocks where blocker_id=actor and blocked_id=peer),
   'messages',coalesce(jsonb_agg(v.data order by v.seq),'[]'::jsonb),'nextBefore',min(v.seq)) into result from (
    select thread_message.message_seq seq,jsonb_build_object('id',thread_message.id,'seq',thread_message.message_seq,'isOwn',thread_message.sender_profile_id=actor,'body',case when thread_message.moderation_status='clean' then thread_message.body else 'Message removed' end,'createdAt',thread_message.created_at,'nonce',thread_message.client_nonce) data
    from public.marketplace_messages thread_message where thread_message.conversation_id=conversation_row.id and thread_message.message_seq<older order by thread_message.message_seq desc limit 50) v;return result;
 elsif action='send' then
  nonce:=(payload->>'nonce')::uuid;content:=btrim(payload->>'body');
  if nonce is null or content is null or char_length(content) not between 1 and 1000 then raise exception 'Add a message of 1–1000 characters.' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended('chat-user:'||actor,0));
  select * into m from public.marketplace_messages where sender_profile_id=actor and client_nonce=nonce;
  if m.id is not null then
   if m.conversation_id<>conversation_row.id or m.body<>content then raise exception 'Retry does not match original message.' using errcode='22023';end if;
   return jsonb_build_object('id',m.id,'seq',m.message_seq);end if;
  insert into public.marketplace_messages(conversation_id,sender_profile_id,body,client_nonce) values(conversation_row.id,actor,content,nonce) returning * into m;
  return jsonb_build_object('id',m.id,'seq',m.message_seq);
 elsif action='read' then
  seen:=greatest(0,coalesce((payload->>'through')::bigint,0));
  select coalesce(max(message_seq),0) into seen from public.marketplace_messages where conversation_id=conversation_row.id and message_seq<=seen;
  update public.marketplace_conversations set buyer_read_seq=case when buyer_profile_id=actor then greatest(buyer_read_seq,seen) else buyer_read_seq end,
   seller_read_seq=case when seller_profile_id=actor then greatest(seller_read_seq,seen) else seller_read_seq end where id=conversation_row.id;
  return '{}'::jsonb;
 elsif action in ('block','unblock') then
  perform pg_advisory_xact_lock(hashtextextended('chat-pair:'||least(actor,peer)||greatest(actor,peer),0));
  if action='block' then insert into public.blocks(blocker_id,blocked_id) values(actor,peer) on conflict do nothing;
  else delete from public.blocks where blocker_id=actor and blocked_id=peer;end if;
  update public.marketplace_conversations set updated_at=now() where id=conversation_row.id;return '{}'::jsonb;
 elsif action='report' then
  content:=btrim(payload->>'reason');
  if content is null or char_length(content) not between 5 and 500 then raise exception 'Add a reason (5–500 characters).' using errcode='22023';end if;
  if (select count(*) from private.message_reports where reporter_id=actor and created_at>now()-interval '1 day')>=10 then raise exception 'Please try again later.' using errcode='42501';end if;
  if payload->>'messageId' is not null then
   select * into m from public.marketplace_messages where id=(payload->>'messageId')::uuid and conversation_id=conversation_row.id and sender_profile_id=peer;
   if not found then raise exception 'Message unavailable for reporting.' using errcode='42501';end if;
  end if;
  select coalesce(jsonb_agg(v.data order by v.seq),'[]'::jsonb) into result from (
   select message_seq seq,jsonb_build_object('body',body,'sender',private.neighbor_name(sender_profile_id),'createdAt',created_at) data
   from public.marketplace_messages where conversation_id=conversation_row.id and (m.id is null or id=m.id) order by message_seq desc limit 10) v;
  insert into private.message_reports(reporter_id,reported_profile_id,conversation_id,message_id,reason,evidence)
   values(actor,peer,conversation_row.id,m.id,content,result) returning * into report;
  insert into public.moderation_cases(source_table,source_id,reason) values('message_reports',report.id,'Private message report; evidence restricted to report review');
  insert into public.audit_events(actor_id,action,target_table,target_id) values(actor,'message_reported','message_reports',report.id);
  return '{}'::jsonb;
 end if;
 raise exception 'Unknown messaging action.' using errcode='22023';
end $$;
revoke all on function private.messaging_api(text,uuid,jsonb) from public,anon;
grant execute on function private.messaging_api(text,uuid,jsonb) to authenticated;
create function public.messaging_api(action text,target uuid default null,payload jsonb default '{}') returns jsonb
language sql security invoker set search_path='' as $$ select private.messaging_api(action,target,payload) $$;
revoke all on function public.messaging_api(text,uuid,jsonb) from public,anon;
grant execute on function public.messaging_api(text,uuid,jsonb) to authenticated;
do $$ declare t text; begin
 foreach t in array array['marketplace_conversations','marketplace_messages','notifications'] loop
  if not exists(select 1 from pg_publication_tables where pubname='supabase_realtime' and schemaname='public' and tablename=t) then
   execute format('alter publication supabase_realtime add table public.%I',t);
  end if;
 end loop;
end $$;
