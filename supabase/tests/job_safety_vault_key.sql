-- Isolated reset database only. Every fixture and setting is rolled back.
begin;

do $$
declare
  encrypted_payload bytea;
begin
  if exists (select 1 from vault.secrets where name = 'job_safety_location_key') then
    raise exception 'key test requires an isolated database without a configured Vault key';
  end if;

  perform set_config('app.settings.job_safety_location_key', '', true);
  begin
    perform public.job_safety_location_key();
    raise exception 'a missing key must fail closed';
  exception
    when sqlstate '55000' then null;
  end;

  perform vault.create_secret(
    encode(extensions.gen_random_bytes(32), 'hex'),
    'job_safety_location_key',
    'Transaction-only fictional QA fixture'
  );

  if public.job_safety_location_key() !~ '^[0-9a-f]{64}$' then
    raise exception 'Vault fallback must return the provisioned 256-bit key';
  end if;

  encrypted_payload := extensions.pgp_sym_encrypt(
    'Fictional QA payload; no real location.',
    public.job_safety_location_key(),
    'cipher-algo=aes256'
  );
  if extensions.pgp_sym_decrypt(encrypted_payload, public.job_safety_location_key())
    is distinct from 'Fictional QA payload; no real location.' then
    raise exception 'Vault-backed encryption must round trip';
  end if;

  perform set_config('app.settings.job_safety_location_key',
    'legacy-job-safety-fixture-key-2026-only', true);
  if public.job_safety_location_key()
    is distinct from current_setting('app.settings.job_safety_location_key') then
    raise exception 'an existing server key must keep precedence';
  end if;

  perform set_config('app.settings.job_safety_location_key', 'too-short', true);
  begin
    perform public.job_safety_location_key();
    raise exception 'an invalid configured key must not silently switch to Vault';
  exception
    when sqlstate '55000' then null;
  end;

  perform set_config('app.settings.job_safety_location_key', '', true);
  if has_function_privilege('anon', 'public.job_safety_location_key()', 'EXECUTE')
    or has_function_privilege('authenticated', 'public.job_safety_location_key()', 'EXECUTE')
    or has_table_privilege('anon', 'vault.decrypted_secrets', 'SELECT')
    or has_table_privilege('authenticated', 'vault.decrypted_secrets', 'SELECT') then
    raise exception 'client roles must not access encryption keys';
  end if;
end
$$;

set local role anon;
do $$
begin
  perform public.job_safety_location_key();
  raise exception 'anonymous direct key access must be denied';
exception
  when insufficient_privilege then null;
end
$$;
reset role;

set local role authenticated;
do $$
begin
  perform public.job_safety_location_key();
  raise exception 'authenticated direct key access must be denied';
exception
  when insufficient_privilege then null;
end
$$;
reset role;

rollback;
select 'job_safety_vault_key_passed' as result;
