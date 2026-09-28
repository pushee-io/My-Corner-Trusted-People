import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
test('SQL metrics rank the full covered population before cap; no legacy counters or missing areas',async()=>{
 const db=new PGlite();
 try{
 await db.exec(`create schema private; create role anon;create role authenticated;
 create function public.neighborhood_ai_context(uuid) returns jsonb language sql as $$select '{"id":"97000000-0000-4000-8000-000000000090"}'::jsonb$$;
 create function private.ai_source_author_allowed(uuid) returns boolean language sql as $$select true$$;
 create table public.feature_flags(key text,enabled boolean);insert into feature_flags values('verified_job_reviews',true);
 create table public.provider_profiles(id uuid,profile_id uuid,business_name text,headline text,created_at timestamptz default now(),availability text,accepting_requests boolean);
 create table public.provider_services(provider_id uuid,service_label text,category_id text);
 create table public.provider_service_areas(provider_id uuid,neighborhood_id uuid);
 create function public.can_view_social_group(uuid) returns boolean language sql as $$select true$$;
 create function public.is_accepted_social_group_member(uuid) returns boolean language sql as $$select true$$;
 create table public.social_groups(id uuid,moderation_status text);
 create table public.social_group_posts(id uuid,group_id uuid,moderation_status text,author_profile_id uuid);
 create table public.social_group_post_comments(id uuid,post_id uuid,author_profile_id uuid,body text,moderation_status text,created_at timestamptz);
 create function public.review_api(text,uuid,jsonb) returns jsonb language sql as $$select jsonb_build_object('verifiedCount',case when $2::text like '%012' then 7 else 0 end,'average',case when $2::text like '%012' then 4.5 else 0 end,'completedJobs',case when $2::text like '%012' then 9 else 0 end,'reviews','[]'::jsonb)$$;`);
 const old=readFileSync('../migrations/20260926003542_keyword_discovery.sql','utf8');
 await db.exec(old.slice(0,old.indexOf('create or replace function public.neighborhood_ai_search'))+'commit;');
 await db.exec(readFileSync('../migrations/20260927040151_assistant_structured_retrieval.sql','utf8'));
 await db.exec(`insert into provider_profiles select ('97000000-0000-4000-8000-'||lpad(n::text,12,'0'))::uuid,null,'Provider '||n,'Electrical',now(),'Provider stated',true from generate_series(1,13)n;
 insert into provider_services select id,'Electrical','electrical' from provider_profiles;
 insert into provider_service_areas select id,'97000000-0000-4000-8000-000000000090' from provider_profiles where id::text not like '%013';`);
 const phrase=await db.query<{ok:boolean}>(`select not private.ai_phrase_evidence('Adding park lighting','["lights off","power outage"]') and private.ai_phrase_evidence('Lights off at the public square','["lights off","power outage"]') ok`);assert.equal(phrase.rows[0].ok,true);
 for(const metric of ['verified_reviews','rating','completed_jobs']){
 const r=await db.query<{data:any}>(`select public.neighborhood_ai_retrieve('provider','electrician',null,null,null,$1::jsonb) data`,[JSON.stringify({categories:['electrical'],metric})]);
 assert.equal(r.rows[0].data.length,8);assert.ok(r.rows[0].data[0].id.endsWith('012'));assert.equal(r.rows[0].data[0].comparison.eligibleCount,12);assert.equal(r.rows[0].data[0].comparison.tiedCount,1);
 }
 const r=await db.query<{data:any}>(`select public.neighborhood_ai_retrieve('provider','qzxvbnm') data`);assert.deepEqual(r.rows[0].data,[]);
 await assert.rejects(db.query(`select public.neighborhood_ai_retrieve('provider','',null,null,null,'{"metric":"trust_score"}')`));
 // Reproduce the missing second local plumber using actual retrieval SQL.
 await db.exec(`insert into provider_profiles values
 ('97000000-0000-4000-8000-000000000020',null,'First Plumber','Plumbing',now(),'Today',true),
 ('97000000-0000-4000-8000-000000000021',null,'Second Plumber','Plumbing',now(),'Today',true);
 insert into provider_services values
 ('97000000-0000-4000-8000-000000000020','Plumbing','plumbing'),
 ('97000000-0000-4000-8000-000000000021','Plumbing','plumbing');
 insert into provider_service_areas values('97000000-0000-4000-8000-000000000020','97000000-0000-4000-8000-000000000090');`);
 const plumbing=async()=> (await db.query<{data:any}>(`select public.neighborhood_ai_retrieve('provider','plumber',null,null,null,'{"categories":["plumbing"]}') data`)).rows[0].data;
 assert.equal((await plumbing()).length,1);
 await db.exec(`insert into provider_service_areas values('97000000-0000-4000-8000-000000000021','97000000-0000-4000-8000-000000000090');`);
 assert.deepEqual((await plumbing()).map((p:any)=>p.title),['First Plumber','Second Plumber']);
 await db.exec(`update provider_profiles set accepting_requests=false where id='97000000-0000-4000-8000-000000000021'`);
 assert.equal((await plumbing()).length,1,'inactive providers remain excluded');
 }finally{await db.close();}
});
