alter function public.create_test_residence_challenge(uuid, text)
  set search_path = public, extensions;

alter function public.verify_test_residence_challenge(uuid, text)
  set search_path = public, extensions;
