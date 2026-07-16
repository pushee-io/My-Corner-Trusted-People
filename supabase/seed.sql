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

-- Fictional pilot accounts. Auth user ids are null until linked in a real Supabase auth environment.
insert into public.profiles (display_name, role, phone_verified) values
  ('Akosua Mensah', 'requester', true),
  ('Kwame PipeCare', 'provider', true),
  ('Ama Spark Works', 'provider', true),
  ('BrightClean Ghana', 'provider', true),
  ('Kojo Wood & Fit', 'provider', true),
  ('Naa HomeFix', 'provider', true),
  ('CoolAir Tema', 'provider', true),
  ('FreshNest Cleaners', 'provider', true),
  ('Reliable Brush Co.', 'provider', true),
  ('Afi Pipe & Drain', 'provider', true),
  ('TidySpace Crew', 'provider', true),
  ('Eben Appliance Assist', 'provider', true),
  ('SwiftMove Accra', 'provider', true);

insert into public.provider_profiles
  (profile_id, business_name, headline, general_area, rating, review_count, completed_jobs, response_rate, community_recommendations, availability)
select p.id, p.display_name, seed.headline, seed.general_area, seed.rating, seed.review_count, seed.completed_jobs, seed.response_rate, seed.recommendations, seed.availability
from public.profiles p
join (values
  ('Kwame PipeCare', 'Fast home plumbing support', 'East Legon and nearby', 4.8, 37, 46, 92, 18, 'Available today after 3:00 PM'),
  ('Ama Spark Works', 'Careful electrical repairs for homes and shops', 'Osu and Labone', 4.7, 29, 32, 89, 12, 'Usually responds within 1 hour'),
  ('BrightClean Ghana', 'Reliable home and office cleaning team', 'Labone and Cantonments', 4.9, 44, 58, 95, 21, 'Available tomorrow morning'),
  ('Kojo Wood & Fit', 'Door, shelf, and cabinet repairs', 'Madina and Adenta', 4.6, 18, 25, 84, 9, 'Available this week'),
  ('Naa HomeFix', 'Small household repairs and quick fixes', 'Adenta and Madina', 4.5, 16, 19, 80, 8, 'Available Saturday'),
  ('CoolAir Tema', 'AC and refrigeration servicing', 'Tema Community 25 and Spintex', 4.8, 31, 40, 90, 13, 'Available today'),
  ('FreshNest Cleaners', 'Apartment and office cleaning', 'Cantonments and Airport Residential', 4.8, 39, 51, 93, 17, 'Available weekdays'),
  ('Reliable Brush Co.', 'Neat finishing and repainting', 'Airport Residential and Cantonments', 4.7, 27, 36, 88, 10, 'Available this week'),
  ('Afi Pipe & Drain', 'Leak and drain support', 'Spintex and Tema border', 4.6, 22, 28, 87, 7, 'Usually responds same day'),
  ('TidySpace Crew', 'Move-in and deep cleaning', 'Dzorwulu and Achimota', 4.8, 34, 44, 91, 15, 'Available tomorrow'),
  ('Eben Appliance Assist', 'Washer, cooker, and small appliance repair', 'Dansoman and Kaneshie', 4.5, 15, 21, 85, 6, 'Available in 2 days'),
  ('SwiftMove Accra', 'Small moves and delivery help', 'Achimota and Dzorwulu', 4.7, 24, 30, 86, 11, 'Available today before 6:00 PM')
) as seed(name, headline, general_area, rating, review_count, completed_jobs, response_rate, recommendations, availability)
on p.display_name = seed.name;

insert into public.provider_services (provider_id, category_id, service_label)
select pp.id, seed.category_id, seed.service_label
from public.provider_profiles pp
join (values
  ('Kwame PipeCare', 'plumbing', 'Plumbing'),
  ('Ama Spark Works', 'electrical', 'Electrical'),
  ('BrightClean Ghana', 'cleaning', 'Cleaning'),
  ('Kojo Wood & Fit', 'carpentry', 'Carpentry'),
  ('Naa HomeFix', 'plumbing', 'Plumbing'),
  ('Naa HomeFix', 'electrical', 'Electrical'),
  ('CoolAir Tema', 'air-conditioning', 'Air conditioning and refrigeration'),
  ('FreshNest Cleaners', 'cleaning', 'Cleaning'),
  ('Reliable Brush Co.', 'painting', 'Painting'),
  ('Afi Pipe & Drain', 'plumbing', 'Plumbing'),
  ('TidySpace Crew', 'cleaning', 'Cleaning'),
  ('Eben Appliance Assist', 'appliance-repair', 'Appliance repair'),
  ('SwiftMove Accra', 'moving-delivery', 'Moving and delivery')
) as seed(name, category_id, service_label)
on pp.business_name = seed.name
on conflict (provider_id, category_id) do nothing;

insert into public.provider_trust_signals (provider_id, signal_type, label, value, moderator_reviewed)
select pp.id, seed.signal_type, seed.label, seed.value, seed.reviewed
from public.provider_profiles pp
join (
  select business_name, 'phone' signal_type, 'Phone verified' label, 'Yes' value, true reviewed from public.provider_profiles
  union all
  select business_name, 'completed_jobs', 'Completed jobs', completed_jobs::text, true from public.provider_profiles
  union all
  select business_name, 'response_rate', 'Response rate', response_rate::text || '%', true from public.provider_profiles
  union all
  select business_name, 'recommendations', 'Community recommendations', community_recommendations::text, false from public.provider_profiles
) seed on pp.business_name = seed.business_name;

insert into public.job_requests
  (requester_id, provider_id, category_id, title, description, original_user_text, urgency, preferred_date, preferred_time, contact_preference, neighborhood_id, general_area_label, status)
select requester.id, provider.id, 'plumbing', 'Kitchen sink leak',
  'My kitchen sink has been leaking since yesterday evening. I need help this week.',
  'Kitchen sink is leaking badly since yesterday. I need someone this week.',
  'soon', date '2026-07-18', 'Weekday afternoon', 'app_update', n.id, 'East Legon, near Lagos Avenue', 'Submitted'
from public.profiles requester
join public.provider_profiles provider on provider.business_name = 'Kwame PipeCare'
join public.neighborhoods n on n.name = 'East Legon'
where requester.display_name = 'Akosua Mensah';
