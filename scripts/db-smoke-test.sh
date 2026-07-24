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

psql "$database_url" \
  --set ON_ERROR_STOP=1 \
  --command "grant usage on schema public to anon, authenticated;" \
  --command "grant select, update on public.profiles to authenticated;" \
  --command "grant select on public.neighborhoods to anon, authenticated;" \
  --command "grant select on public.service_categories to anon, authenticated;" \
  --command "grant select on public.provider_profiles to anon, authenticated;" \
  --command "grant select on public.provider_services to anon, authenticated;" \
  --command "grant select on public.provider_service_areas to anon, authenticated;" \
  --command "grant select on public.provider_trust_signals to anon, authenticated;" \
  --command "grant select, insert on public.job_request_photos to authenticated;" \
  --command "grant select, insert on public.job_request_status_events to authenticated;" \
  --command "grant select, insert on public.provider_responses to authenticated;" \
  --command "grant insert on public.reports to authenticated;" \
  --command "grant select on public.notifications to authenticated;"


if [ -f supabase/tests/module1_rls_smoke.sql ]; then
  psql "$database_url" --set ON_ERROR_STOP=1 --file supabase/tests/module1_rls_smoke.sql
fi

if [ -f supabase/tests/day2b_verified_neighborhood_access.sql ]; then
  psql "$database_url" --set ON_ERROR_STOP=1 --file supabase/tests/day2b_verified_neighborhood_access.sql
fi
