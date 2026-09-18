begin;
-- Hosted pg_net owns its queue and may retain PUBLIC grants. Put no reusable
-- secret into it: each dispatch carries a two-minute, single-use capability.
create table private.media_cleanup_tickets (
 ticket_hash text primary key check(length(ticket_hash)=64),
 expires_at timestamptz not null
);
alter table private.media_cleanup_tickets enable row level security;
revoke all on private.media_cleanup_tickets from public,anon,authenticated;
create index media_cleanup_ticket_expiry on private.media_cleanup_tickets(expires_at);

create or replace function private.authorize_media_cleanup(worker_token text) returns boolean
language plpgsql volatile security definer set search_path = '' as $$
declare consumed integer;
begin
 if worker_token is null or length(worker_token)<>72 then return false; end if;
 delete from private.media_cleanup_tickets
  where ticket_hash=encode(extensions.digest(worker_token,'sha256'),'hex') and expires_at>now();
 get diagnostics consumed=row_count;
 return consumed=1;
end $$;
revoke all on function private.authorize_media_cleanup(text) from public,anon,authenticated;
grant execute on function private.authorize_media_cleanup(text) to service_role;
create or replace function public.authorize_media_cleanup(worker_token text) returns boolean
language sql volatile security invoker set search_path = '' as $$
 select private.authorize_media_cleanup(worker_token)
$$;
revoke all on function public.authorize_media_cleanup(text) from public,anon,authenticated;
grant execute on function public.authorize_media_cleanup(text) to service_role;

create or replace function private.invoke_media_cleanup() returns bigint
language plpgsql security definer set search_path = '' as $$
declare endpoint text; ticket text;
begin
 delete from private.media_cleanup_tickets where expires_at<=now();
 select decrypted_secret into endpoint from vault.decrypted_secrets where name='media_cleanup_url';
 if endpoint is null then return null; end if;
 if endpoint !~ '^https://[a-z0-9]+\.supabase\.co/functions/v1/cleanup-media$' then
  raise exception 'Invalid media cleanup endpoint';
 end if;
 ticket:=gen_random_uuid()::text||gen_random_uuid()::text;
 insert into private.media_cleanup_tickets(ticket_hash,expires_at)
  values(encode(extensions.digest(ticket,'sha256'),'hex'),now()+interval '2 minutes');
 return net.http_post(url:=endpoint,headers:=jsonb_build_object(
  'Content-Type','application/json','x-media-cleanup-token',ticket),body:='{}'::jsonb,timeout_milliseconds:=60000);
end $$;
revoke all on function private.invoke_media_cleanup() from public,anon,authenticated,service_role;
-- The prior reusable credential is now rejected and is no longer needed.
delete from vault.secrets where name='media_cleanup_token';
commit;
