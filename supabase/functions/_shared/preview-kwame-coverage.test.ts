import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
test('reviewed Preview coverage repair is idempotent, limited to Kwame/East Legon, and fails on drift',async()=>{
 const db=new PGlite();
 try {
  await db.exec(`create table provider_profiles(id uuid primary key,seed_key text,business_name text,general_area text);
   create table neighborhoods(id uuid primary key,name text,city text,country_code text);
   create table provider_service_areas(provider_id uuid,neighborhood_id uuid,area_label text);
   insert into provider_profiles values('dba23ab5-5fbf-496f-9fb7-ff575f93fb28','pilot-provider-kwame-pipecare','Kwame PipeCare','East Legon and nearby'),('00000000-0000-4000-8000-000000000001','other-provider','Other Provider','Osu');
   insert into neighborhoods values('90ac8954-e9ca-467f-8a2e-de7eecbd5422','East Legon','Accra','GH');`);
  const sql=readFileSync('../ops/preview_kwame_east_legon_coverage.sql','utf8');
  await db.exec(sql);await db.exec(sql);
  assert.deepEqual((await db.query('select * from provider_service_areas')).rows,[{provider_id:'dba23ab5-5fbf-496f-9fb7-ff575f93fb28',neighborhood_id:'90ac8954-e9ca-467f-8a2e-de7eecbd5422',area_label:'East Legon'}]);
  await db.exec(`update provider_profiles set general_area='Osu' where seed_key='pilot-provider-kwame-pipecare'`);
  await assert.rejects(db.exec(sql),/does not match/);await db.exec('rollback;');
 }finally{await db.close();}
});
