-- PREVIEW opeojxwkwwnnncnsuaag ONLY. Review/approve this complete mapping before applying.
-- Expected live delta: 18 new coverage rows across 12 profiles; 2 existing rows preserved.
-- No profile, identity, category, neighborhood, secret, quota or other content edits.
begin;
do $$
begin
 if not exists(select 1 from public.neighborhoods where id='90ac8954-e9ca-467f-8a2e-de7eecbd5422'
  and name='East Legon' and city='Accra' and country_code='GH') then
  raise exception 'Expected Preview neighborhood does not match; stop.';
 end if;
 if (select count(*) from public.provider_profiles where seed_key in ('pilot-provider-kwame-pipecare','pilot-provider-ama-spark-works','pilot-provider-brightclean-ghana','pilot-provider-kojo-wood-fit','pilot-provider-naa-homefix','pilot-provider-coolair-tema','pilot-provider-freshnest-cleaners','pilot-provider-reliable-brush-co','pilot-provider-afi-pipe-drain','pilot-provider-tidyspace-crew','pilot-provider-eben-appliance-assist','pilot-provider-swiftmove-accra','preview-realneighbor-provider','preview-ai-fencecare'))<>14 then
  raise exception 'Expected Preview catalog of 14 providers does not match; stop.';
 end if;
end $$;
-- BEGIN EXPLICIT PROVIDER COVERAGE CATALOG
-- Stable pilot/demo keys only. Never derive authorization by parsing public prose.
-- Missing named neighborhoods remain unresolved; nearby/border imply no extra area.
do $$
declare entry record; provider uuid; hood uuid; area text;
begin
 for entry in select * from (values
  ('pilot-provider-kwame-pipecare','Kwame PipeCare','East Legon and nearby',array['East Legon']::text[]),
  ('pilot-provider-ama-spark-works','Ama Spark Works','Osu and Labone',array['Osu','Labone']::text[]),
  ('pilot-provider-brightclean-ghana','BrightClean Ghana','Labone and Cantonments',array['Labone','Cantonments']::text[]),
  ('pilot-provider-kojo-wood-fit','Kojo Wood & Fit','Madina and Adenta',array['Madina','Adenta']::text[]),
  ('pilot-provider-naa-homefix','Naa HomeFix','Adenta and Madina',array['Adenta','Madina']::text[]),
  ('pilot-provider-coolair-tema','CoolAir Tema','Tema Community 25 and Spintex',array['Spintex']::text[]),
  ('pilot-provider-freshnest-cleaners','FreshNest Cleaners','Cantonments and Airport Residential',array['Cantonments']::text[]),
  ('pilot-provider-reliable-brush-co','Reliable Brush Co.','Airport Residential and Cantonments',array['Cantonments']::text[]),
  ('pilot-provider-afi-pipe-drain','Afi Pipe & Drain','Spintex and Tema border',array['Spintex']::text[]),
  ('pilot-provider-tidyspace-crew','TidySpace Crew','Dzorwulu and Achimota',array['Dzorwulu','Achimota']::text[]),
  ('pilot-provider-eben-appliance-assist','Eben Appliance Assist','Dansoman and Kaneshie',array['Dansoman']::text[]),
  ('pilot-provider-swiftmove-accra','SwiftMove Accra','Achimota and Dzorwulu',array['Achimota','Dzorwulu']::text[]),
  ('preview-realneighbor-provider','Real Neighbor Plumbing (Demo)','East Legon',array['East Legon']::text[]),
  ('preview-ai-fencecare','FenceCare (fictional demo)','East Legon',array['East Legon']::text[])
 ) as catalog(seed_key,business_name,general_area,neighborhoods) loop
  select p.id into provider from public.provider_profiles p where p.seed_key=entry.seed_key for update;
  -- Demo profiles need not exist on a fresh seed. Existing profiles must match.
  if provider is null then continue; end if;
  if not exists(select 1 from public.provider_profiles p where p.id=provider
   and p.business_name=entry.business_name and p.general_area=entry.general_area) then
   raise exception 'Provider coverage catalog drift: %',entry.seed_key;
  end if;
  foreach area in array entry.neighborhoods loop
   select n.id into hood from public.neighborhoods n where n.name=area and n.city='Accra' and n.country_code='GH';
   if hood is null then raise exception 'Missing explicit coverage neighborhood: %',area; end if;
   insert into public.provider_service_areas(provider_id,neighborhood_id,area_label)
   select provider,hood,area where not exists(select 1 from public.provider_service_areas a where a.provider_id=provider and a.neighborhood_id=hood);
  end loop;
 end loop;
end $$;
-- END EXPLICIT PROVIDER COVERAGE CATALOG
commit;
