begin;
create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

-- Generate a dedicated worker credential inside Vault. Never expose the
-- service-role key to pg_net, SQL literals, clients, logs, or cron.job.
do $$ begin
 if not exists(select 1 from vault.secrets where name='media_cleanup_token') then
  perform vault.create_secret(gen_random_uuid()::text||gen_random_uuid()::text,'media_cleanup_token');
 end if;
end $$;

create function private.authorize_media_cleanup(worker_token text) returns boolean
language sql stable security definer set search_path = '' as $$
 select length(worker_token)=72 and exists(
  select 1 from vault.decrypted_secrets where name='media_cleanup_token' and decrypted_secret=worker_token)
$$;
revoke all on function private.authorize_media_cleanup(text) from public,anon,authenticated;
grant execute on function private.authorize_media_cleanup(text) to service_role;
create function public.authorize_media_cleanup(worker_token text) returns boolean
language sql stable security invoker set search_path = '' as $$
 select private.authorize_media_cleanup(worker_token)
$$;
revoke all on function public.authorize_media_cleanup(text) from public,anon,authenticated;
grant execute on function public.authorize_media_cleanup(text) to service_role;

create function private.invoke_media_cleanup() returns bigint
language plpgsql security definer set search_path = '' as $$
declare endpoint text; credential text;
begin
 select decrypted_secret into endpoint from vault.decrypted_secrets where name='media_cleanup_url';
 -- Remains inactive until an operator configures this project's HTTPS endpoint.
 if endpoint is null then return null; end if;
 if endpoint !~ '^https://[a-z0-9]+\.supabase\.co/functions/v1/cleanup-media$' then
  raise exception 'Invalid media cleanup endpoint';
 end if;
 select decrypted_secret into credential from vault.decrypted_secrets where name='media_cleanup_token';
 return net.http_post(url:=endpoint,headers:=jsonb_build_object(
  'Content-Type','application/json','x-media-cleanup-token',credential),body:='{}'::jsonb,timeout_milliseconds:=60000);
end $$;
revoke all on function private.invoke_media_cleanup() from public,anon,authenticated,service_role;
select cron.schedule('shared-media-cleanup','*/5 * * * *','select private.invoke_media_cleanup()');
commit;
