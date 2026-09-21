begin;
-- Limit this change to the credential-bearing queue introduced with media
-- cleanup. Preserve other net tables/functions and privileged worker access.
revoke all on table net.http_request_queue from public,anon,authenticated;
-- This newly created credential belongs only to the media cleanup worker.
do $$ declare token_id uuid; begin
 select id into token_id from vault.secrets where name='media_cleanup_token';
 if token_id is not null then
  perform vault.update_secret(token_id,gen_random_uuid()::text||gen_random_uuid()::text);
 end if;
end $$;
commit;
