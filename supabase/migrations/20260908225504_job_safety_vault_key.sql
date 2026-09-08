-- Keep the existing server setting for compatibility with configured deployments
-- and isolated tests. Hosted deployments may provision the named secret in Vault.
-- This migration never generates, replaces, or logs an encryption key.
create extension if not exists supabase_vault with schema vault;

create or replace function public.job_safety_location_key()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  encryption_key text := nullif(
    pg_catalog.current_setting('app.settings.job_safety_location_key', true),
    ''
  );
begin
  if encryption_key is null then
    select secret.decrypted_secret into encryption_key
    from vault.decrypted_secrets secret
    where secret.name = 'job_safety_location_key';
  end if;

  if encryption_key is null or pg_catalog.char_length(encryption_key) < 32 then
    raise exception 'job safety location encryption is not configured' using errcode = '55000';
  end if;

  return encryption_key;
end
$$;

revoke all on function public.job_safety_location_key() from public, anon, authenticated;
