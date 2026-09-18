begin;
do $$ begin
 if has_table_privilege('authenticated','private.media_cleanup_tickets','select')
  or has_table_privilege('anon','private.media_cleanup_tickets','select')
  or has_table_privilege('authenticated','vault.decrypted_secrets','select')
  or has_function_privilege('authenticated','private.invoke_media_cleanup()','execute')
  or has_function_privilege('authenticated','public.authorize_media_cleanup(text)','execute') then
  raise exception 'Application roles can access internal cleanup credentials or scheduling';
 end if;
 if public.authorize_media_cleanup(repeat('x',72)) then
  raise exception 'Forged cleanup token was accepted';
 end if;
 if not exists(select 1 from cron.job where jobname='shared-media-cleanup' and schedule='*/5 * * * *') then
  raise exception 'Media cleanup schedule missing';
 end if;
end $$;
insert into private.media_cleanup_tickets(ticket_hash,expires_at) values
 (encode(extensions.digest(repeat('a',72),'sha256'),'hex'),now()+interval '2 minutes'),
 (encode(extensions.digest(repeat('b',72),'sha256'),'hex'),now()-interval '1 second');
do $$ begin
 if not public.authorize_media_cleanup(repeat('a',72)) then raise exception 'Valid ticket denied'; end if;
 if public.authorize_media_cleanup(repeat('a',72)) then raise exception 'Replayed ticket accepted'; end if;
 if public.authorize_media_cleanup(repeat('b',72)) then raise exception 'Expired ticket accepted'; end if;
 if exists(select 1 from vault.secrets where name='media_cleanup_token') then
  raise exception 'Reusable cleanup credential still exists';
 end if;
end $$;
rollback;
