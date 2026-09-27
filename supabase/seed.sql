insert into public.service_categories (id, name, description, sort_order) values
  ('plumbing', 'Plumbing', 'Leaks, pipes, fittings, drainage', 10),
  ('electrical', 'Electrical', 'Power faults, sockets, lighting', 20),
  ('cleaning', 'Cleaning', 'Home, office, move-in, deep cleaning', 30),
  ('carpentry', 'Carpentry', 'Doors, shelves, cabinets, repairs', 40),
  ('air-conditioning', 'Air conditioning and refrigeration', 'AC servicing, cooling faults, fridge support', 50),
  ('appliance-repair', 'Appliance repair', 'Washers, cookers, small appliances', 60),
  ('moving-delivery', 'Moving and delivery', 'Small moves, delivery, loading help', 70),
  ('painting', 'Painting', 'Interior and exterior painting', 80)
on conflict (id) do nothing;

insert into public.neighborhoods (name, city, country_code) values
  ('East Legon', 'Accra', 'GH'),
  ('Osu', 'Accra', 'GH'),
  ('Labone', 'Accra', 'GH'),
  ('Madina', 'Accra', 'GH'),
  ('Adenta', 'Accra', 'GH'),
  ('Spintex', 'Accra', 'GH'),
  ('Cantonments', 'Accra', 'GH'),
  ('Dzorwulu', 'Accra', 'GH'),
  ('Dansoman', 'Accra', 'GH'),
  ('Achimota', 'Accra', 'GH')
on conflict (name, city, country_code) do nothing;

insert into public.feature_flags (key, enabled, description) values
  ('ai_service_request_structurer', false, 'Server-side OpenAI Responses API structuring for request drafts'),
  ('ai_content_moderation', false, 'Server-side moderation for text and images')
on conflict (key) do update set enabled = excluded.enabled, description = excluded.description;

-- Stable keys keep fictional pilot profiles idempotent without constraining real display names.
insert into public.profiles (seed_key, display_name, role, phone_verified) values
  ('pilot-requester-akosua-mensah', 'Akosua Mensah', 'requester', true),
  ('pilot-provider-kwame-pipecare', 'Kwame PipeCare', 'provider', true),
  ('pilot-provider-ama-spark-works', 'Ama Spark Works', 'provider', true),
  ('pilot-provider-brightclean-ghana', 'BrightClean Ghana', 'provider', true),
  ('pilot-provider-kojo-wood-fit', 'Kojo Wood & Fit', 'provider', true),
  ('pilot-provider-naa-homefix', 'Naa HomeFix', 'provider', true),
  ('pilot-provider-coolair-tema', 'CoolAir Tema', 'provider', true),
  ('pilot-provider-freshnest-cleaners', 'FreshNest Cleaners', 'provider', true),
  ('pilot-provider-reliable-brush-co', 'Reliable Brush Co.', 'provider', true),
  ('pilot-provider-afi-pipe-drain', 'Afi Pipe & Drain', 'provider', true),
  ('pilot-provider-tidyspace-crew', 'TidySpace Crew', 'provider', true),
  ('pilot-provider-eben-appliance-assist', 'Eben Appliance Assist', 'provider', true),
  ('pilot-provider-swiftmove-accra', 'SwiftMove Accra', 'provider', true)
on conflict (seed_key) where seed_key is not null do update
set
  display_name = excluded.display_name,
  role = excluded.role,
  phone_verified = excluded.phone_verified;

insert into public.provider_profiles
  (
    seed_key,
    profile_id,
    business_name,
    headline,
    general_area,
    rating,
    review_count,
    completed_jobs,
    response_rate,
    community_recommendations,
    availability,
    accepting_requests
  )
select
  seed.seed_key,
  profile.id,
  seed.business_name,
  seed.headline,
  seed.general_area,
  seed.rating,
  seed.review_count,
  seed.completed_jobs,
  seed.response_rate,
  seed.recommendations,
  seed.availability,
  true
from (
  values
    ('pilot-provider-kwame-pipecare', 'Kwame PipeCare', 'Fast home plumbing support', 'East Legon and nearby', 4.8, 37, 46, 92, 18, 'Available today after 3:00 PM'),
    ('pilot-provider-ama-spark-works', 'Ama Spark Works', 'Careful electrical repairs for homes and shops', 'Osu and Labone', 4.7, 29, 32, 89, 12, 'Usually responds within 1 hour'),
    ('pilot-provider-brightclean-ghana', 'BrightClean Ghana', 'Reliable home and office cleaning team', 'Labone and Cantonments', 4.9, 44, 58, 95, 21, 'Available tomorrow morning'),
    ('pilot-provider-kojo-wood-fit', 'Kojo Wood & Fit', 'Door, shelf, and cabinet repairs', 'Madina and Adenta', 4.6, 18, 25, 84, 9, 'Available this week'),
    ('pilot-provider-naa-homefix', 'Naa HomeFix', 'Small household repairs and quick fixes', 'Adenta and Madina', 4.5, 16, 19, 80, 8, 'Available Saturday'),
    ('pilot-provider-coolair-tema', 'CoolAir Tema', 'AC and refrigeration servicing', 'Tema Community 25 and Spintex', 4.8, 31, 40, 90, 13, 'Available today'),
    ('pilot-provider-freshnest-cleaners', 'FreshNest Cleaners', 'Apartment and office cleaning', 'Cantonments and Airport Residential', 4.8, 39, 51, 93, 17, 'Available weekdays'),
    ('pilot-provider-reliable-brush-co', 'Reliable Brush Co.', 'Neat finishing and repainting', 'Airport Residential and Cantonments', 4.7, 27, 36, 88, 10, 'Available this week'),
    ('pilot-provider-afi-pipe-drain', 'Afi Pipe & Drain', 'Leak and drain support', 'Spintex and Tema border', 4.6, 22, 28, 87, 7, 'Usually responds same day'),
    ('pilot-provider-tidyspace-crew', 'TidySpace Crew', 'Move-in and deep cleaning', 'Dzorwulu and Achimota', 4.8, 34, 44, 91, 15, 'Available tomorrow'),
    ('pilot-provider-eben-appliance-assist', 'Eben Appliance Assist', 'Washer, cooker, and small appliance repair', 'Dansoman and Kaneshie', 4.5, 15, 21, 85, 6, 'Available in 2 days'),
    ('pilot-provider-swiftmove-accra', 'SwiftMove Accra', 'Small moves and delivery help', 'Achimota and Dzorwulu', 4.7, 24, 30, 86, 11, 'Available today before 6:00 PM')
) as seed(seed_key, business_name, headline, general_area, rating, review_count, completed_jobs, response_rate, recommendations, availability)
join public.profiles profile on profile.seed_key = seed.seed_key
on conflict (seed_key) where seed_key is not null do update
set
  profile_id = excluded.profile_id,
  business_name = excluded.business_name,
  headline = excluded.headline,
  general_area = excluded.general_area,
  rating = excluded.rating,
  review_count = excluded.review_count,
  completed_jobs = excluded.completed_jobs,
  response_rate = excluded.response_rate,
  community_recommendations = excluded.community_recommendations,
  availability = excluded.availability,
  accepting_requests = true;

insert into public.provider_services (provider_id, category_id, service_label)
select provider.id, seed.category_id, seed.service_label
from public.provider_profiles provider
join (
  values
    ('pilot-provider-kwame-pipecare', 'plumbing', 'Plumbing'),
    ('pilot-provider-ama-spark-works', 'electrical', 'Electrical'),
    ('pilot-provider-brightclean-ghana', 'cleaning', 'Cleaning'),
    ('pilot-provider-kojo-wood-fit', 'carpentry', 'Carpentry'),
    ('pilot-provider-naa-homefix', 'plumbing', 'Plumbing'),
    ('pilot-provider-naa-homefix', 'electrical', 'Electrical'),
    ('pilot-provider-coolair-tema', 'air-conditioning', 'Air conditioning and refrigeration'),
    ('pilot-provider-freshnest-cleaners', 'cleaning', 'Cleaning'),
    ('pilot-provider-reliable-brush-co', 'painting', 'Painting'),
    ('pilot-provider-afi-pipe-drain', 'plumbing', 'Plumbing'),
    ('pilot-provider-tidyspace-crew', 'cleaning', 'Cleaning'),
    ('pilot-provider-eben-appliance-assist', 'appliance-repair', 'Appliance repair'),
    ('pilot-provider-swiftmove-accra', 'moving-delivery', 'Moving and delivery')
) as seed(provider_seed_key, category_id, service_label)
  on provider.seed_key = seed.provider_seed_key
on conflict (provider_id, category_id) do update
set service_label = excluded.service_label;

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

insert into public.provider_trust_signals (provider_id, signal_type, label, value, moderator_reviewed)
select
  provider.id,
  signal.signal_type,
  signal.label,
  signal.value,
  signal.moderator_reviewed
from public.provider_profiles provider
cross join lateral (
  values
    ('phone', 'Phone verified', 'Yes', true),
    ('completed_jobs', 'Completed jobs', provider.completed_jobs::text, true),
    ('response_rate', 'Response rate', provider.response_rate::text || '%', true),
    ('recommendations', 'Community recommendations', provider.community_recommendations::text, false)
) as signal(signal_type, label, value, moderator_reviewed)
where provider.seed_key like 'pilot-provider-%'
  and not exists (
    select 1
    from public.provider_trust_signals existing
    where existing.provider_id = provider.id
      and existing.signal_type = signal.signal_type
  );

insert into public.job_requests
  (
    requester_id,
    provider_id,
    category_id,
    title,
    description,
    original_user_text,
    urgency,
    preferred_date,
    preferred_time,
    contact_preference,
    neighborhood_id,
    general_area_label,
    status
  )
select
  requester.id,
  provider.id,
  'plumbing',
  'Kitchen sink leak',
  'My kitchen sink has been leaking since yesterday evening. I need help this week.',
  'Kitchen sink is leaking badly since yesterday. I need someone this week.',
  'soon',
  date '2026-07-18',
  'Weekday afternoon',
  'app_update',
  neighborhood.id,
  'East Legon, near Lagos Avenue',
  'Submitted'
from public.profiles requester
join public.provider_profiles provider on provider.seed_key = 'pilot-provider-kwame-pipecare'
join public.neighborhoods neighborhood on neighborhood.name = 'East Legon'
where requester.seed_key = 'pilot-requester-akosua-mensah'
  and not exists (
    select 1
    from public.job_requests existing
    where existing.requester_id = requester.id
      and existing.provider_id = provider.id
      and existing.title = 'Kitchen sink leak'
  );
