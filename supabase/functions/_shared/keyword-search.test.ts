import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

test('Postgres keyword normalization, prefix, OR recall and relevance before limit',async()=>{
 const db=new PGlite();
 try {
  await db.exec('create schema private; create role anon; create role authenticated;');
  const file=readdirSync('../migrations').find(f=>f.endsWith('_keyword_discovery.sql'))!;
  const sql=readFileSync('../migrations/'+file,'utf8');
  await db.exec(sql.slice(0,sql.indexOf('create or replace function public.neighborhood_ai_search'))+'commit;');
  await db.exec(`create table documents(title text, body text);
   insert into documents values ('Pig Racing Festival','Community animal race'),('Music Festival','Live performance'),('Food Drive','Food donations');
   insert into documents select 'Unrelated activity '||i,'General gathering' from generate_series(1,12) i;`);
  for(const [q,expected] of [
   ['festival',['Music Festival','Pig Racing Festival']],['festivals',['Music Festival','Pig Racing Festival']],
   ['What festivals are happening?',['Music Festival','Pig Racing Festival']],['festiv',['Music Festival','Pig Racing Festival']],
   ['racing',['Pig Racing Festival']],['pig',['Pig Racing Festival']],['music',['Music Festival']],
   ['food',['Food Drive']],['food drive',['Food Drive']],['pig racing',['Pig Racing Festival']],
  ] as [string,string[]][]){
   const r=await db.query<{title:string}>(`select title from documents where to_tsvector('english',title||' '||body) @@ private.neighborhood_keyword_query($1) order by title`,[q]);
   assert.deepEqual(r.rows.map(r=>r.title),expected,q);
  }
  const ranked=await db.query<{title:string}>(`select title from documents where to_tsvector('english',title||' '||body) @@ private.neighborhood_keyword_query('music festival') order by ts_rank(to_tsvector('english',title||' '||body),private.neighborhood_keyword_query('music festival')) desc limit 1`);
  assert.equal(ranked.rows[0].title,'Music Festival');
  for(const q of ['"pig racing festival"','pig | !missing','pig:*','pig; DROP TABLE documents;'])
   await db.query('select private.neighborhood_keyword_query($1)',[q]);
 } finally {await db.close();}
});
