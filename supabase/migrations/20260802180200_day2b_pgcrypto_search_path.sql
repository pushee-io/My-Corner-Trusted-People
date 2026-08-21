-- Some linked development projects recorded the Day 2B migration before these
-- test-only helpers were added to its local migration file. Harden each helper
-- when present without blocking later migrations when that historical drift
-- means the helper does not exist.
do $$
begin
  if to_regprocedure('public.create_test_residence_challenge(uuid,text)') is not null then
    execute 'alter function public.create_test_residence_challenge(uuid, text) set search_path = public, extensions';
  end if;

  if to_regprocedure('public.verify_test_residence_challenge(uuid,text)') is not null then
    execute 'alter function public.verify_test_residence_challenge(uuid, text) set search_path = public, extensions';
  end if;
end;
$$;
