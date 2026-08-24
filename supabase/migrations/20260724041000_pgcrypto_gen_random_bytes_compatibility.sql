-- Supabase-hosted projects install pgcrypto in the extensions schema, while
-- some local Postgres environments expose its functions in public. Day 2B
-- predates that distinction and uses gen_random_bytes() in a table default.
do $$
begin
  if to_regprocedure('public.gen_random_bytes(integer)') is null then
    if to_regprocedure('extensions.gen_random_bytes(integer)') is null then
      raise exception 'pgcrypto gen_random_bytes(integer) is unavailable';
    end if;

    execute $function$
      create function public.gen_random_bytes(byte_count integer)
      returns bytea
      language sql
      volatile
      security invoker
      set search_path = ''
      as 'select extensions.gen_random_bytes(byte_count)'
    $function$;
  end if;
end;
$$;
