import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

test('PostgreSQL registration ignores privilege claims and AI limits cannot be reset by clients', async () => {
  const db = new PGlite();
  try {
    await db.exec(`create role anon; create role authenticated; create schema auth; create schema private;
      grant usage on schema private, public, auth to authenticated;
      create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb);
      create table public.profiles(id uuid primary key default gen_random_uuid(), auth_user_id uuid unique, display_name text, role text default 'requester', phone_verified boolean default false);
      grant select, update on public.profiles to authenticated;
      create table public.neighborhood_memberships(profile_id uuid); create table public.provider_profiles(profile_id uuid);
      create table public.feature_flags(key text primary key,enabled boolean); insert into public.feature_flags values('ai_service_request_structurer',false);`);
    await db.exec(readFileSync('../migrations/20260921133831_preview_self_registration.sql','utf8'));
    await db.exec(readFileSync('../migrations/20260921133843_request_structuring_allowance.sql','utf8'));
    await db.exec(readFileSync('../tests/self_registration.sql','utf8'));
    await db.exec(readFileSync('../tests/request_structuring_allowance.sql','utf8'));
    await db.exec(`insert into auth.users values ('00000000-0000-0000-0000-000000000123', 'verification-fixture@mycorner.example', '{"my_corner_signup":true}'); grant select, update on public.profiles to authenticated;`);
    await assert.rejects(db.exec('set role authenticated; update public.profiles set phone_verified=true;'), /phone verification is server controlled/);
    await db.exec("reset role; set role authenticated; update public.profiles set display_name='Editable name'; reset role;");
    await assert.rejects(db.exec('set role authenticated; select * from private.request_structuring_usage;'));
    await db.exec('reset role;');
    await assert.rejects(db.exec('set role anon; select public.consume_request_structuring_allowance();'));
  } finally { await db.close(); }
});
