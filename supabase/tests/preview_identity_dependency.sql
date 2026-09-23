begin;
-- Emulate the older Preview layout without touching any persistent identity data.
alter table public.private_identity_profiles rename to qa_existing_identity_profiles;
\ir ../migrations/20260923231722_preview_identity_dependency.sql
DO $$ begin
 if not (select relrowsecurity from pg_class where oid='public.private_identity_profiles'::regclass) then raise exception 'RLS missing'; end if;
 if has_table_privilege('anon','public.private_identity_profiles','SELECT') or has_table_privilege('authenticated','public.private_identity_profiles','SELECT') then raise exception 'Identity table exposed'; end if;
 if exists(select 1 from public.private_identity_profiles) then raise exception 'Unexpected identity data'; end if;
end $$;
-- A repeated compatibility invocation preserves the restored table.
\ir ../migrations/20260923231722_preview_identity_dependency.sql
rollback;
