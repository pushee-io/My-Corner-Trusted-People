-- REVIEWED TARGET: Preview opeojxwkwwnnncnsuaag ONLY. Requires founder approval to apply.
-- One existing pilot provider / one named neighborhood. No inference from "nearby".
begin;
do $$
begin
 perform 1 from public.provider_profiles
 where id='dba23ab5-5fbf-496f-9fb7-ff575f93fb28'
   and seed_key='pilot-provider-kwame-pipecare'
   and business_name='Kwame PipeCare' and general_area='East Legon and nearby'
 for update;
 if not found then raise exception 'Expected Preview Kwame profile does not match; stop.'; end if;
 if not exists(select 1 from public.neighborhoods where id='90ac8954-e9ca-467f-8a2e-de7eecbd5422'
   and name='East Legon' and city='Accra' and country_code='GH') then
  raise exception 'Expected Preview East Legon neighborhood does not match; stop.';
 end if;
 insert into public.provider_service_areas(provider_id,neighborhood_id,area_label)
 select 'dba23ab5-5fbf-496f-9fb7-ff575f93fb28','90ac8954-e9ca-467f-8a2e-de7eecbd5422','East Legon'
 where not exists(select 1 from public.provider_service_areas
  where provider_id='dba23ab5-5fbf-496f-9fb7-ff575f93fb28' and neighborhood_id='90ac8954-e9ca-467f-8a2e-de7eecbd5422');
end $$;
commit;
