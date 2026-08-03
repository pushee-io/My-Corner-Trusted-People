#!/usr/bin/env bash
set -euo pipefail

database_url="${DATABASE_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"

supabase db reset

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

legacy_tests=(
  supabase/tests/module1_rls_smoke.sql
  supabase/tests/day2b_live_read_smoke.sql
  supabase/tests/day2b_verified_neighborhood_access.sql
  supabase/tests/day3_social_groups_broadcasts.sql
)

for test_file in "${legacy_tests[@]}"; do
  if [[ -f "$test_file" ]]; then
    psql "$database_url" --set ON_ERROR_STOP=1 --file "$test_file"
  fi
done

pgtap_tests=(
  supabase/tests/events_rls_smoke.sql
  supabase/tests/events_stabilization_rls.sql
  supabase/tests/events_stabilization_rls_smoke.sql
)

for test_file in "${pgtap_tests[@]}"; do
  supabase test db "$test_file"
done
