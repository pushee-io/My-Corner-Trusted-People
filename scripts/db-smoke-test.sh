#!/usr/bin/env bash
set -euo pipefail

database_url="${DATABASE_URL:-postgresql://postgres:postgres@localhost:5432/postgres}"

psql "$database_url" \
  --set ON_ERROR_STOP=1 \
  --command "do \$\$ begin if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if; end \$\$;" \
  --command "do \$\$ begin if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if; end \$\$;" \
  --command "create schema if not exists auth;" \
  --command "create or replace function auth.uid() returns uuid language sql stable as \$\$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid \$\$;"

for migration in supabase/migrations/*.sql; do
  psql "$database_url" --set ON_ERROR_STOP=1 --file "$migration"
done

psql "$database_url" --set ON_ERROR_STOP=1 --file supabase/seed.sql

if [ -f supabase/tests/module1_rls_smoke.sql ]; then
  psql "$database_url" --set ON_ERROR_STOP=1 --file supabase/tests/module1_rls_smoke.sql
fi

if [ -f supabase/tests/day2b_verified_neighborhood_access.sql ]; then
  psql "$database_url" --set ON_ERROR_STOP=1 --file supabase/tests/day2b_verified_neighborhood_access.sql
fi
