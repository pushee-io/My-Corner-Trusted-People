-- PENDING explicit founder approval: Preview opeojxwkwwnnncnsuaag ONLY.
-- Existing founder-created confirmed Auth user and completed fictional requester profile.
-- Adds only East Legon demo membership; not real-world residence verification.
-- No profile, Auth, phone, identity, quota, provider, moderator or admin changes.
begin;
do $$
declare profile uuid; hood uuid;
begin
 select p.id into strict profile from public.profiles p join auth.users u on u.id=p.auth_user_id
 where u.id='2f41fc5a-d437-4fc5-b4d1-8feac5ddff65'
 and lower(u.email)='vc-requester-20260927@example.com' and u.email_confirmed_at is not null
 and p.id='7051b1be-3305-43ea-8ef9-3df1eaa51dc1'
 and p.seed_key='preview-vc-requester-20260927' and p.role='requester';
 select id into strict hood from public.neighborhoods
 where id='90ac8954-e9ca-467f-8a2e-de7eecbd5422' and name='East Legon' and city='Accra';
 if exists(select 1 from public.neighborhood_memberships where profile_id=profile) then
  raise exception 'Membership already exists; inspect before reapplication';
 end if;
 insert into public.neighborhood_memberships(profile_id,neighborhood_id,is_primary,status,verified_at)
 values(profile,hood,true,'verified',now());
end $$;
commit;
