-- Read-only completeness gate for every active provider, not only the pilot catalog.
-- A public area label is never a substitute for an explicit neighborhood assignment.
select p.id,p.business_name,p.general_area,
 coalesce((select jsonb_agg(jsonb_build_object('category',s.category_id,'label',s.service_label) order by s.category_id)
  from public.provider_services s where s.provider_id=p.id),'[]') as services,
 coalesce((select jsonb_agg(jsonb_build_object('neighborhood',n.name,'neighborhood_id',n.id) order by n.name)
  from public.provider_service_areas a join public.neighborhoods n on n.id=a.neighborhood_id where a.provider_id=p.id),'[]') as coverage,
 not exists(select 1 from public.provider_services s where s.provider_id=p.id) as missing_category,
 not exists(select 1 from public.provider_service_areas a where a.provider_id=p.id and a.neighborhood_id is not null) as missing_coverage
from public.provider_profiles p where p.accepting_requests order by p.business_name;
