begin;
create function pg_temp.check_name(ok boolean,label text) returns void language plpgsql as $$
begin if ok is distinct from true then raise exception '%',label;end if;end $$;
insert into public.profiles(id,auth_user_id,display_name,role) values
 ('96000000-0000-4000-8000-000000000001','96000000-0000-4000-8000-000000000001','Legacy Public A','requester'),
 ('96000000-0000-4000-8000-000000000002','96000000-0000-4000-8000-000000000002','PRIVATE SELF VALUE','requester'),
 ('96000000-0000-4000-8000-000000000003','96000000-0000-4000-8000-000000000003','PRIVATE AMBIGUOUS VALUE','requester');
insert into public.private_identity_profiles(profile_id,legal_given_name,legal_family_name,public_display_name) values
 ('96000000-0000-4000-8000-000000000002','SECRET','LEGAL','Approved Public B'),
 ('96000000-0000-4000-8000-000000000003','SECRET','LEGAL','');
insert into public.neighborhoods(id,name,city,country_code) values('96000000-0000-4000-8000-000000000090','Feed names fixture','Accra','GH');
insert into public.neighborhood_memberships(profile_id,neighborhood_id,is_primary,status,verified_at) values
 ('96000000-0000-4000-8000-000000000001','96000000-0000-4000-8000-000000000090',true,'verified',now()),
 ('96000000-0000-4000-8000-000000000002','96000000-0000-4000-8000-000000000090',true,'verified',now());
insert into public.neighborhood_feed_posts(id,neighborhood_id,author_id,body,moderation_status) values
 ('96000000-0000-4000-8000-000000000011','96000000-0000-4000-8000-000000000090','96000000-0000-4000-8000-000000000002','Public body','clean'),
 ('96000000-0000-4000-8000-000000000012','96000000-0000-4000-8000-000000000090','96000000-0000-4000-8000-000000000003','No approved name','clean');
set local role authenticated;set local request.jwt.claim.sub='96000000-0000-4000-8000-000000000001';
select pg_temp.check_name(public.feed_author_names(array['96000000-0000-4000-8000-000000000011'::uuid])->0->>'name'='Approved Public B','Other viewer did not receive approved public name');
select pg_temp.check_name(public.feed_author_names(array['96000000-0000-4000-8000-000000000012'::uuid])->0->>'name'='Neighbor','Private self value used as public fallback');
select pg_temp.check_name(not exists(select 1 from public.profiles where id='96000000-0000-4000-8000-000000000002'),'Base profile read broadened');
set local request.jwt.claim.sub='96000000-0000-4000-8000-000000000002';
select public.own_public_name('Updated Public B');
set local request.jwt.claim.sub='96000000-0000-4000-8000-000000000001';
select pg_temp.check_name(public.feed_author_names(array['96000000-0000-4000-8000-000000000011'::uuid])->0->>'name'='Updated Public B','Explicit edit not reflected for another viewer');
set local request.jwt.claim.sub='96000000-0000-4000-8000-000000000003';
select pg_temp.check_name(public.feed_author_names(array['96000000-0000-4000-8000-000000000011'::uuid])='[]','Unverified viewer received name');
reset role;
update public.neighborhood_feed_posts set moderation_status='blocked' where id='96000000-0000-4000-8000-000000000011';
set local role authenticated;set local request.jwt.claim.sub='96000000-0000-4000-8000-000000000001';
select pg_temp.check_name(public.feed_author_names(array['96000000-0000-4000-8000-000000000011'::uuid])='[]','Blocked content name leaked');
reset role;
select pg_temp.check_name(not has_function_privilege('anon','public.feed_author_names(uuid[],uuid[])','execute'),'Anonymous names lookup');
select pg_temp.check_name(not has_function_privilege('authenticated','private.neighbor_name(uuid)','execute'),'Arbitrary profile resolver exposed');
select pg_temp.check_name(not (select prosecdef from pg_proc where oid='public.feed_author_names(uuid[],uuid[])'::regprocedure),'Public wrapper must be invoker');
rollback;
