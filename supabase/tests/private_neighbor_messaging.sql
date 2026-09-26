begin;
create function pg_temp.assert_true(ok boolean,label text) returns void language plpgsql as $$ begin if ok is distinct from true then raise exception '%',label;end if;end $$;
create function pg_temp.denied(command text,expected text) returns void language plpgsql as $$
begin begin execute command;exception when others then if sqlstate=expected then return;end if;raise;end;raise exception 'Unexpectedly permitted: %',command;end $$;
insert into public.profiles(id,auth_user_id,display_name,role) values
 ('98000000-0000-4000-8000-000000000001','98000000-0000-4000-8000-000000000001','PRIVATE LEGAL A','requester'),
 ('98000000-0000-4000-8000-000000000002','98000000-0000-4000-8000-000000000002','PRIVATE LEGAL B','requester'),
 ('98000000-0000-4000-8000-000000000003','98000000-0000-4000-8000-000000000003','Other neighborhood','requester'),
 ('98000000-0000-4000-8000-000000000004','98000000-0000-4000-8000-000000000004','Moderator','moderator');
insert into public.neighborhoods(id,name,city) values
 ('98000000-0000-4000-8000-000000000010','QA One','QA City'),('98000000-0000-4000-8000-000000000011','QA Two','QA City');
insert into public.neighborhood_memberships(profile_id,neighborhood_id,status,verified_at)
 select ('98000000-0000-4000-8000-00000000000'||n)::uuid,
 case when n=3 then '98000000-0000-4000-8000-000000000011'::uuid else '98000000-0000-4000-8000-000000000010'::uuid end,'verified',now()
 from generate_series(1,3) n;
update public.feature_flags set enabled=true where key='neighbor_messaging';
create temporary table chat_context(id uuid,message_id uuid,seq bigint,report_id uuid);
grant all on chat_context to authenticated;
set local role authenticated;
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000001';
select pg_temp.denied($q$select public.messaging_api('start','98000000-0000-4000-8000-000000000003')$q$,'42501');
select pg_temp.assert_true(public.messaging_api('neighbors')::text not like '%PRIVATE LEGAL%','Legal name leaked in discovery');
insert into chat_context(id) select (public.messaging_api('start','98000000-0000-4000-8000-000000000002')->>'conversationId')::uuid;
select pg_temp.assert_true((public.messaging_api('start','98000000-0000-4000-8000-000000000002')->>'conversationId')::uuid=(select id from chat_context),'Duplicate conversation');
with sent as(select public.messaging_api('send',id,'{"body":"Hello neighbor","nonce":"98000000-0000-4000-8000-000000000030"}') data from chat_context)
 update chat_context set message_id=(sent.data->>'id')::uuid,seq=(sent.data->>'seq')::bigint from sent;
select public.messaging_api('send',id,'{"body":"Hello neighbor","nonce":"98000000-0000-4000-8000-000000000030"}') from chat_context;
select pg_temp.assert_true((select count(*) from public.marketplace_messages where conversation_id=(select id from chat_context))=1,'Retry duplicated message');
select pg_temp.denied($q$select public.messaging_api('send',id,'{"body":"Changed retry","nonce":"98000000-0000-4000-8000-000000000030"}') from chat_context$q$,'22023');
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000003';
select pg_temp.assert_true((select count(*) from public.marketplace_messages where conversation_id=(select id from chat_context))=0,'Outsider read messages');
select pg_temp.denied($q$select public.messaging_api('thread',id) from chat_context$q$,'42501');
select pg_temp.denied($q$select public.messaging_api('read',id,'{"through":999999999}') from chat_context$q$,'42501');
select pg_temp.denied('select * from private.message_reports','42501');
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000002';
-- A missing identity record is not permission to expose profiles.display_name.
select pg_temp.assert_true(public.own_public_name()->>'name' is null,'Private name copied into public name');
select pg_temp.assert_true(public.own_public_name('  Kwame Owusu  ')->>'name'='Kwame Owusu','Public name not saved/trimmed');
select pg_temp.denied('select * from private.public_profile_names','42501');
select pg_temp.denied($q$select private.neighbor_name('98000000-0000-4000-8000-000000000001')$q$,'42501');
select pg_temp.denied($q$select public.own_public_name(' ')$q$,'22023');
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000001';
select pg_temp.assert_true(public.own_public_name()->>'name' is null,'Another account name overwritten');
select public.own_public_name('Akosua Mensah');
select pg_temp.assert_true(public.messaging_api('inbox')->'conversations'->0->>'name'='Kwame Owusu','Inbox lost public name');
select pg_temp.assert_true(public.messaging_api('thread',(select id from chat_context))->>'name'='Kwame Owusu','Thread lost public name');
select pg_temp.assert_true(public.messaging_api('inbox')::text not like '%PRIVATE LEGAL%','Inbox leaked legal identity');
select pg_temp.assert_true(public.messaging_api('neighbors')::text like '%Kwame Owusu%','Discovery lost public name');
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000002';
select public.own_public_name('Ama Boateng');
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000001';
select pg_temp.assert_true(public.messaging_api('thread',(select id from chat_context))->>'name'='Ama Boateng','Thread retained stale name');
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000002';
select pg_temp.assert_true((public.messaging_api('unread')->>'unread')::int=1,'Unread count incorrect');
select public.messaging_api('read',id,jsonb_build_object('through',seq)) from chat_context;
select pg_temp.assert_true((public.messaging_api('unread')->>'unread')::int=0,'Read cursor not applied');
select public.messaging_api('report',id,jsonb_build_object('messageId',message_id,'reason','QA inappropriate message')) from chat_context;
select public.messaging_api('block',id) from chat_context;
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000001';
select pg_temp.assert_true((public.messaging_api('thread',(select id from chat_context))->>'canSend')::boolean=false,'Blocked sender allowed');
select pg_temp.denied($q$select public.messaging_api('send',id,'{"body":"Blocked attempt","nonce":"98000000-0000-4000-8000-000000000031"}') from chat_context$q$,'42501');
-- Old clients cannot bypass the RPC by inserting directly into the shared table.
select pg_temp.denied($q$insert into public.marketplace_messages(conversation_id,sender_profile_id,body) select id,public.current_profile_id(),'Direct blocked attempt' from chat_context$q$,'42501');
select pg_temp.denied($q$select public.messaging_api('start','98000000-0000-4000-8000-000000000002')$q$,'42501');
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000002';
select public.messaging_api('unblock',id) from chat_context;
select public.messaging_api('settings',null,'{"allowNeighborMessages":false}');
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000001';
select pg_temp.denied($q$select public.messaging_api('send',id,'{"body":"Opt-out attempt","nonce":"98000000-0000-4000-8000-000000000032"}') from chat_context$q$,'42501');
select pg_temp.denied($q$select public.messaging_api('reports')$q$,'42501');
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000004';
-- Moderation can read only voluntarily reported evidence, not arbitrary threads.
select pg_temp.denied($q$select public.messaging_api('thread',id) from chat_context$q$,'42501');
select pg_temp.assert_true(public.messaging_api('reports')::text like '%Hello neighbor%','Report evidence missing');
update chat_context set report_id=(public.messaging_api('reports')->0->>'id')::uuid;
select public.messaging_api('moderate',report_id,'{"decision":"remove_message","reason":"QA moderation verification"}') from chat_context;
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000001';
select pg_temp.assert_true(public.messaging_api('thread',(select id from chat_context))::text not like '%Hello neighbor%','Removed body leaked');
reset role;
select pg_temp.assert_true((select count(*) from public.notifications where profile_id='98000000-0000-4000-8000-000000000002' and target_kind='message_received')=1,'Retry duplicated notifications');
select pg_temp.assert_true(not exists(select 1 from public.domain_event_outbox where recipient_profile_id='98000000-0000-4000-8000-000000000002' and payload::text like '%Hello neighbor%'),'Message body in outbox');
-- Notification opt-out and minute quota are enforced on the same direct-insert path.
set local role authenticated;
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000002';
select public.messaging_api('settings',null,'{"allowNeighborMessages":true,"notifyMessages":false}');
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000001';
insert into public.marketplace_messages(conversation_id,sender_profile_id,body)
 select id,public.current_profile_id(),'Rate boundary fixture '||n from chat_context cross join generate_series(1,29) n;
select pg_temp.denied($q$insert into public.marketplace_messages(conversation_id,sender_profile_id,body) select id,public.current_profile_id(),'Thirty-first send' from chat_context$q$,'42501');
reset role;
select pg_temp.assert_true((select count(*) from public.notifications where profile_id='98000000-0000-4000-8000-000000000002' and target_kind='message_received')=1,'Notification opt-out ignored');
insert into private.community_account_controls(profile_id,suspended) values('98000000-0000-4000-8000-000000000001',true);
set local role authenticated;
set local request.jwt.claim.sub='98000000-0000-4000-8000-000000000001';
select pg_temp.assert_true((select count(*) from public.marketplace_messages where conversation_id=(select id from chat_context))=0,'Suspended account read messages');
select pg_temp.denied($q$select public.messaging_api('inbox')$q$,'42501');
select pg_temp.denied($q$select public.own_public_name('Suspended name')$q$,'42501');
reset role;
rollback;
