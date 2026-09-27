import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
const catalog=JSON.parse(readFileSync('../fixtures/provider_coverage_catalog.json','utf8')) as {seed_key:string;business_name:string;general_area:string;neighborhoods:string[]}[];
const repair=readFileSync('../ops/preview_provider_coverage_catalog.sql','utf8');
const block=(s:string)=>s.slice(s.indexOf('-- BEGIN EXPLICIT PROVIDER COVERAGE CATALOG'),s.indexOf('-- END EXPLICIT PROVIDER COVERAGE CATALOG'));
test('complete explicit coverage catalog is idempotent, bounded, shared by fresh seeds and rejects drift',async()=>{
 assert.equal(block(readFileSync('../seed.sql','utf8')),block(repair));
 const db=new PGlite();
 try{
 await db.exec(`create table provider_profiles(id uuid primary key,seed_key text unique,business_name text,general_area text);
 create table neighborhoods(id uuid primary key,name text,city text,country_code text);
 create table provider_service_areas(provider_id uuid,neighborhood_id uuid,area_label text);`);
 const hoodNames=[...new Set(catalog.flatMap(p=>p.neighborhoods))];
 for(const [i,name] of hoodNames.entries())await db.query(`insert into neighborhoods values($1,$2,'Accra','GH')`,[name==='East Legon'?'90ac8954-e9ca-467f-8a2e-de7eecbd5422':`98000000-0000-4000-8000-${String(i).padStart(12,'0')}`,name]);
 for(const [i,p] of catalog.entries())await db.query('insert into provider_profiles values($1,$2,$3,$4)',[`99000000-0000-4000-8000-${String(i).padStart(12,'0')}`,p.seed_key,p.business_name,p.general_area]);
 await db.exec(`insert into provider_profiles values('99000000-0000-4000-8000-000000000099','unlisted','Not in catalog','East Legon and nearby');`);
 const before=(await db.query('select * from provider_profiles order by id')).rows;
 await db.exec(repair);await db.exec(repair);
 assert.equal((await db.query('select * from provider_service_areas')).rows.length,20);
 assert.deepEqual((await db.query('select * from provider_profiles order by id')).rows,before);
 for(const p of catalog){
  const actual=await db.query<{area_label:string}>(`select a.area_label from provider_service_areas a join provider_profiles p on p.id=a.provider_id where p.seed_key=$1 order by area_label`,[p.seed_key]);
  assert.deepEqual(actual.rows.map(a=>a.area_label),[...p.neighborhoods].sort(),p.business_name);
 }
 assert.equal((await db.query(`select * from provider_service_areas where provider_id='99000000-0000-4000-8000-000000000099'`)).rows.length,0);
 assert.deepEqual((await db.query<{business_name:string}>(`select p.business_name from provider_profiles p join provider_service_areas a on a.provider_id=p.id where a.area_label='East Legon' order by p.business_name`)).rows.map(p=>p.business_name),['FenceCare (fictional demo)','Kwame PipeCare','Real Neighbor Plumbing (Demo)']);
 await db.exec(`delete from provider_service_areas; update provider_profiles set general_area='Osu' where seed_key='preview-realneighbor-provider'`);
 await assert.rejects(db.exec(repair),/catalog drift/);await db.exec('rollback');
 assert.equal((await db.query('select * from provider_service_areas')).rows.length,0,'repair must roll back earlier inserts when a later profile drifts');
 await db.exec(`update provider_profiles set general_area='East Legon' where seed_key='preview-realneighbor-provider'; delete from neighborhoods where name='Spintex'`);
 await assert.rejects(db.exec(repair),/Missing explicit coverage/);await db.exec('rollback');
 assert.equal((await db.query('select * from provider_service_areas')).rows.length,0);
 }finally{await db.close();}
});
