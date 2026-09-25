-- Manual, opt-in fictional Preview fixture. Never included in production seed/migrations.
do $$
declare hood uuid; cluster uuid; organizer uuid; provider_owner uuid; provider uuid; saturday timestamptz;
 event_id constant uuid:='b1000000-0000-4000-8000-000000000001';
 post_id constant uuid:='b1000000-0000-4000-8000-000000000002';
 alert_id constant uuid:='b1000000-0000-4000-8000-000000000003';
 job_id constant uuid:='b1000000-0000-4000-8000-000000000004';
 previous_sub text:=current_setting('request.jwt.claim.sub',true);
begin
 if current_setting('mycorner.fixture_environment',true) is distinct from 'preview'
 or current_setting('mycorner.fixture_project_ref',true) is distinct from 'opeojxwkwwnnncnsuaag' then
  raise exception 'Preview-only fixture requires explicit opt-in and the approved project';end if;
 select id into hood from public.neighborhoods where name='East Legon' and country_code='GH';
 if hood is null then raise exception 'East Legon fixture neighborhood missing';end if;
 select cluster_id into cluster from public.neighborhood_cluster_members where neighborhood_id=hood order by created_at limit 1;
 if cluster is null then raise exception 'Existing East Legon cluster missing';end if;
 -- Actor has no Auth login; the synthetic claim only lets existing Event triggers
 -- exercise their normal owner/context path inside this administrative transaction.
 insert into public.profiles(display_name,role,seed_key,auth_user_id)
 values('Fictional AI Demo Organizer','requester','preview-ai-organizer','b2000000-0000-4000-8000-000000000001')
 on conflict(seed_key) where seed_key is not null do nothing;
 select id into organizer from public.profiles where seed_key='preview-ai-organizer';
 insert into public.private_identity_profiles(profile_id,legal_given_name,legal_family_name,public_display_name)
 values(organizer,'Fictional','Demo','Ama K. (fictional demo)') on conflict(profile_id) do nothing;
 insert into public.neighborhood_memberships(profile_id,neighborhood_id,is_primary,status,verified_at)
 values(organizer,hood,true,'verified',now()) on conflict(profile_id,neighborhood_id) do nothing;
 insert into public.profiles(display_name,role,seed_key)
 values('Fictional Fence Provider','provider','preview-ai-fence-provider') on conflict(seed_key) where seed_key is not null do nothing;
 select id into provider_owner from public.profiles where seed_key='preview-ai-fence-provider';
 insert into public.provider_profiles(profile_id,business_name,headline,general_area,availability,accepting_requests,seed_key)
 values(provider_owner,'FenceCare (fictional demo)','Fictional Preview provider for fence repair and gate maintenance.','East Legon','Demo availability; confirm through a request',true,'preview-ai-fencecare')
 on conflict(seed_key) where seed_key is not null do nothing;
 select id into provider from public.provider_profiles where seed_key='preview-ai-fencecare';
 insert into public.provider_services(provider_id,category_id,service_label) values(provider,'carpentry','Fence repair and gate maintenance') on conflict(provider_id,category_id) do nothing;
 insert into public.provider_service_areas(provider_id,neighborhood_id,area_label)
 select provider,hood,'East Legon' where not exists(select 1 from public.provider_service_areas where provider_id=provider and neighborhood_id=hood);
 if exists(select 1 from public.events where id=event_id and organizer_profile_id<>organizer)
 or exists(select 1 from public.neighborhood_feed_posts where id=post_id and author_id<>organizer)
 or exists(select 1 from public.agency_broadcasts where id=alert_id and created_by_profile_id is distinct from organizer)
 or exists(select 1 from public.job_requests where id=job_id and (requester_id<>organizer or provider_id<>provider)) then
  raise exception 'Fixture collision; existing user records will not be changed';end if;
 saturday:=date_trunc('day',now())+(((6-extract(dow from now())::int+7)%7)||' days')::interval+interval '10 hours';
 perform set_config('request.jwt.claim.sub','b2000000-0000-4000-8000-000000000001',true);
 insert into public.events(id,neighborhood_id,cluster_id,organizer_profile_id,organizer_display_name,title,description,starts_at,ends_at,timezone,area_label,visibility,status,moderation_status)
 values(event_id,hood,cluster,organizer,'Ama K. (fictional demo)','Fictional Preview: Community Food Drive',
 'Fictional Preview demonstration, not a real event. Ama K. (fictional demo) organizes this family-friendly food drive with the fictional East Legon Community Volunteers. Saturday at 10 AM. Open the event to see the demonstration RSVP flow.',
 saturday,saturday+interval '2 hours','Africa/Accra','Fictional community space; no real address','verified_neighborhood_members','scheduled','approved')
 on conflict(id) do update set starts_at=excluded.starts_at,ends_at=excluded.ends_at;
 update public.events set status='scheduled',moderation_status='approved' where id=event_id;
 insert into public.neighborhood_feed_posts(id,neighborhood_id,author_id,body,moderation_status,created_at)
 values(post_id,hood,organizer,'Fictional Preview park project discussion. In this demo discussion, neighbors favor retaining the playground and adding lighting. No formal decision or poll result is recorded. The fictional next step is a community consultation; timing is still open. This is demonstration data, not an actual neighborhood decision.','clean',now()-interval '2 days') on conflict(id) do nothing;
 insert into public.agency_broadcasts(id,agency_name,title,body,scope,neighborhood_id,is_agency_approved,moderation_status,published_at,expires_at,created_by_profile_id,approved_by_profile_id,approved_at)
 values(alert_id,'Fictional Preview Roads Agency','Fictional Preview: Road Closure Demonstration',
 'Fictional Preview notice. No real road closure or emergency is being announced. In the demonstration, Boundary Road is closed for resurfacing near the fictional community park. Use this record only to demonstrate a sourced agency answer.',
 'neighborhood',hood,true,'clean',now(),now()+interval '3 days',organizer,organizer,now())
 on conflict(id) do update set published_at=excluded.published_at,expires_at=excluded.expires_at,approved_at=excluded.approved_at;
 insert into public.job_requests(id,requester_id,provider_id,category_id,title,description,original_user_text,urgency,preferred_date,preferred_time,contact_preference,general_area_label,status)
 values(job_id,organizer,provider,'carpentry','Fictional Preview fence repair','Fictional completed job; no real work or address.','Fictional demo.','flexible',current_date,'Morning','app_update','Fictional area','Completed') on conflict(id) do nothing;
 insert into public.job_safety_sessions(job_request_id,state,requester_completed_at,provider_completed_at,completed_at)
 values(job_id,'completed',now(),now(),now()) on conflict(job_request_id) do nothing;
 insert into public.reviews(job_request_id,reviewer_id,provider_id,rating,title,body,recommends,verified_job,moderation_status,public_author)
 values(job_id,organizer,provider,4,'Fictional Preview: Clear communication','Fictional completed-job example: explained the fence repair and communicated clearly.',true,true,'clean','Ama K. (fictional demo)')
 on conflict(job_request_id) where verified_job do nothing;
 perform set_config('request.jwt.claim.sub',coalesce(previous_sub,''),true);
end $$;
