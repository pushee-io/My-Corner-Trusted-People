begin;
set local mycorner.fixture_environment='preview';
set local mycorner.fixture_project_ref='opeojxwkwwnnncnsuaag';
\ir ../fixtures/neighborhood_assistant_preview.sql
\ir ../fixtures/neighborhood_assistant_preview.sql
update public.feature_flags set enabled=true where key in ('ai_neighborhood_assistant','verified_job_reviews','events');
set local request.jwt.claim.sub='b2000000-0000-4000-8000-000000000001';
set local role authenticated;
do $$
declare result jsonb; provider uuid;
begin
 result:=public.neighborhood_ai_search('event','food drive',null,now(),now()+interval '7 days');
 if result::text not like '%Ama K. (fictional demo)%' or result::text not like '%Fictional Preview: Community Food Drive%' then raise exception 'Weekend event/organizer fixture missing';end if;
 result:=public.neighborhood_ai_search('provider','fence');
 if jsonb_array_length(result)<>1 or result->0->'reputation'->>'count'<>'1' or (result->0->'reputation'->>'average')::numeric<>4 then raise exception 'Fence provider lacks actual matching review: %',result;end if;
 result:=public.neighborhood_ai_search('agency','closure');
 if result::text not like '%No real road closure%' then raise exception 'Fictional closure missing or mislabeled';end if;
 result:=public.neighborhood_ai_search('post','park');
 if result::text not like '%No formal decision or poll result%' then raise exception 'Park source invents formal decision';end if;
end $$;
reset role;
do $$ begin
 if (select count(*) from public.reviews where job_request_id='b1000000-0000-4000-8000-000000000004')<>1 then raise exception 'Fixture duplicates reviews';end if;
 if (select count(*) from public.provider_profiles where seed_key='preview-ai-fencecare')<>1 then raise exception 'Fixture duplicates provider';end if;
end $$;
rollback;
