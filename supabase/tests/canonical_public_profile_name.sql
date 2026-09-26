begin;
create function pg_temp.assert_name(ok boolean,label text) returns void language plpgsql as $$ begin if ok is distinct from true then raise exception '%',label; end if; end $$;
insert into public.profiles(id,auth_user_id,display_name,role) values
 ('97000000-0000-4000-8000-000000000001','97000000-0000-4000-8000-000000000001','Akosua Mensah','requester'),
 ('97000000-0000-4000-8000-000000000002','97000000-0000-4000-8000-000000000002','Kwame Owusu','requester'),
 ('97000000-0000-4000-8000-000000000003','97000000-0000-4000-8000-000000000003','Ama Boateng','requester'),
 ('97000000-0000-4000-8000-000000000004','97000000-0000-4000-8000-000000000004','New neighbor','requester'),
 ('97000000-0000-4000-8000-000000000005','97000000-0000-4000-8000-000000000005','Older name must not win','requester');
insert into public.private_identity_profiles(profile_id,legal_given_name,legal_family_name,public_display_name)
 values('97000000-0000-4000-8000-000000000005','Abena Serwaa','Kusi','Abena K.');
insert into public.neighborhoods(id,name,city) values('97000000-0000-4000-8000-000000000010','Public name QA','QA City');
insert into public.neighborhood_memberships(profile_id,neighborhood_id,status,verified_at)
 select ('97000000-0000-4000-8000-00000000000'||n)::uuid,'97000000-0000-4000-8000-000000000010','verified',now() from generate_series(1,5) n;
update public.feature_flags set enabled=true where key='neighbor_messaging';
-- Historical conversation, without a snapshot or an entry in the new name store.
insert into public.marketplace_conversations(id,buyer_profile_id,seller_profile_id,kind,neighborhood_id,created_at)
 values('97000000-0000-4000-8000-000000000020','97000000-0000-4000-8000-000000000001','97000000-0000-4000-8000-000000000002','neighbor','97000000-0000-4000-8000-000000000010',now()-interval '30 days');
set local role authenticated;
set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000001';
select pg_temp.assert_name(public.own_public_name()->>'name'='Akosua Mensah','Existing public name missing from self profile');
select pg_temp.assert_name(public.messaging_api('thread','97000000-0000-4000-8000-000000000020')->>'name'='Kwame Owusu','Historical thread public name missing');
select public.messaging_api('start','97000000-0000-4000-8000-000000000003');
select public.messaging_api('start','97000000-0000-4000-8000-000000000004');
select public.messaging_api('start','97000000-0000-4000-8000-000000000005');
-- All projections resolve the actual peer, not the current account or a stored name.
select pg_temp.assert_name(
 (select count(*)=4 and bool_and(c->>'name'=public.messaging_api('profile',(c->>'peerId')::uuid)->>'name')
  and bool_and(c->>'name'=public.messaging_api('thread',(c->>'id')::uuid)->>'name')
  and bool_and(exists(select 1 from jsonb_array_elements(public.messaging_api('neighbors')) n where n->>'id'=c->>'peerId' and n->>'name'=c->>'name'))
 from jsonb_array_elements(public.messaging_api('inbox')->'conversations') c),'Profile/discovery/inbox/thread diverged');
select pg_temp.assert_name((select array_agg(c->>'name' order by c->>'name')=array['Abena K.','Ama Boateng','Kwame Owusu','Neighbor'] from jsonb_array_elements(public.messaging_api('inbox')->'conversations') c),'Distinct names or unnamed fallback incorrect');
select pg_temp.assert_name(public.messaging_api('inbox')::text not like '%Abena Serwaa%' and public.messaging_api('neighbors')::text not like '%Kusi%','Legal identity exposed');
-- Reverse participant direction, then change an existing public alias explicitly.
set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000002';
select pg_temp.assert_name(public.messaging_api('thread','97000000-0000-4000-8000-000000000020')->>'name'='Akosua Mensah','Seller resolved own name instead of peer');
select public.own_public_name('Kwame O.');
select pg_temp.assert_name(public.own_public_name()->>'name'='Kwame O.','Self profile retained legacy name after save');
set local request.jwt.claim.sub='97000000-0000-4000-8000-000000000001';
select pg_temp.assert_name(public.messaging_api('thread','97000000-0000-4000-8000-000000000020')->>'name'='Kwame O.','Historical thread froze old public name');
select pg_temp.assert_name(public.messaging_api('profile','97000000-0000-4000-8000-000000000002')->>'name'='Kwame O.','Public profile ignored explicit edit');
select public.messaging_api('block','97000000-0000-4000-8000-000000000020');
select pg_temp.assert_name(not (public.messaging_api('thread','97000000-0000-4000-8000-000000000020')->>'canSend')::boolean,'Blocked peer can send');
select pg_temp.assert_name(not exists(select 1 from jsonb_array_elements(public.messaging_api('neighbors')) n where n->>'id'='97000000-0000-4000-8000-000000000002'),'Blocked peer discoverable');
reset role;
insert into private.community_account_controls(profile_id,suspended) values('97000000-0000-4000-8000-000000000002',true);
set local role authenticated;
select pg_temp.assert_name(public.messaging_api('thread','97000000-0000-4000-8000-000000000020')->>'name'='Neighbor unavailable','Suspended peer name retained');
select pg_temp.assert_name(public.messaging_api('inbox')::text not like '%Kwame%','Suspended peer named in inbox');
reset role;
-- Deletion/missing profile cannot retain an alias; no live user deletion is performed.
select pg_temp.assert_name(private.neighbor_name('97000000-0000-4000-8000-000000000099')='Neighbor unavailable','Missing profile exposed a name');
select pg_temp.assert_name(not has_function_privilege('authenticated','private.neighbor_name(uuid)','execute'),'Private resolver became public API');
select pg_temp.assert_name(not has_table_privilege('authenticated','private.public_profile_names','select'),'Name table became directly readable');
rollback;
