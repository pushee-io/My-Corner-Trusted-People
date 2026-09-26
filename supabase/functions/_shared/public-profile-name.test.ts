import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

test('Postgres public identity resolver reuses legacy public names without legal identity or backfill', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create schema private; create schema auth;
      create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      create table public.profiles(id uuid primary key, display_name text);
      create table public.private_identity_profiles(profile_id uuid primary key, public_display_name text, legal_given_name text, legal_family_name text);
      create function public.current_profile_id() returns uuid language sql as $$ select auth.uid() $$;
      grant usage on schema private,public,auth to authenticated;`);
    const controls = readFileSync('../migrations/20260923222710_verified_job_reviews.sql','utf8');
    await db.exec(controls.slice(controls.indexOf('create table private.community_account_controls'),controls.indexOf('alter table public.reviews')));
    await db.exec(readFileSync('../migrations/20260926004155_messaging_public_display_name.sql','utf8'));
    await db.exec(readFileSync('../migrations/20260926213111_canonical_public_profile_name.sql','utf8'));
    const id = (n: number) => `97000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
    for (const [i,name] of ['Akosua Mensah','Kwame Owusu','Ama Boateng','New neighbor','Old public name','Ambiguous legacy value','   '].entries())
      await db.query('insert into public.profiles values($1,$2)',[id(i+1),name]);
    await db.query("insert into public.private_identity_profiles values($1,'Abena K.','Abena Serwaa','Kusi'),($2,'','PRIVATE','LEGAL')",[id(5),id(6)]);
    const name = async (n: number) => (await db.query<{name:string}>('select private.neighbor_name($1) name',[id(n)])).rows[0].name;
    assert.deepEqual(await Promise.all([1,2,3,4,5,6,7].map(name)),['Akosua Mensah','Kwame Owusu','Ama Boateng','Neighbor','Abena K.','Neighbor','Neighbor']);
    assert.equal((await db.query('select * from private.public_profile_names')).rows.length,0,'resolution must not backfill');
    await db.exec(`set role authenticated; set request.jwt.claim.sub='${id(1)}';`);
    assert.deepEqual((await db.query('select public.own_public_name() value')).rows[0],{value:{name:'Akosua Mensah'}});
    await db.query("select public.own_public_name('Akosua M.')");
    await assert.rejects(db.query('select private.neighbor_name($1)',[id(2)]),/permission denied/);
    await db.exec('reset role');
    assert.equal(await name(1),'Akosua M.');
    await db.query('insert into private.community_account_controls values($1,true)',[id(1)]);
    assert.equal(await name(1),'Neighbor unavailable');
    assert.equal(await name(99),'Neighbor unavailable');
    assert.equal((await db.query<{display_name:string}>('select display_name from public.profiles where id=$1',[id(1)])).rows[0].display_name,'Akosua Mensah','explicit alias must not mutate old identity data');
  } finally { await db.close(); }
});
