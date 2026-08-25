do $$
begin
  create type public.job_safety_session_state as enum (
    'awaiting_location',
    'location_shared',
    'provider_arrived',
    'arrival_confirmed',
    'active',
    'completion_pending',
    'completed',
    'cancelled'
  );
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.job_safety_sessions (
  job_request_id uuid primary key references public.job_requests(id) on delete cascade,
  state public.job_safety_session_state not null default 'awaiting_location',
  private_location_ciphertext bytea,
  location_consent_version text,
  location_consented_at timestamptz,
  location_shared_at timestamptz,
  provider_arrived_at timestamptz,
  arrival_confirmed_at timestamptz,
  active_at timestamptz,
  code_hash text,
  code_expires_at timestamptz,
  code_attempt_count integer not null default 0 check (code_attempt_count between 0 and 5),
  requester_completed_at timestamptz,
  provider_completed_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_safety_location_consent_version_length check (
    location_consent_version is null or char_length(location_consent_version) between 3 and 80
  )
);

alter table public.job_safety_sessions enable row level security;
revoke all on public.job_safety_sessions from anon, authenticated;

create or replace function public.job_safety_location_key()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  encryption_key text := current_setting('app.settings.job_safety_location_key', true);
begin
  if encryption_key is null or char_length(encryption_key) < 32 then
    raise exception 'job safety location encryption is not configured' using errcode = '55000';
  end if;
  return encryption_key;
end
$$;

create or replace function public.is_job_requester(target_job_request_id uuid, target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.job_requests request
    where request.id = target_job_request_id
      and request.requester_id = target_profile_id
  )
$$;

create or replace function public.is_job_provider(target_job_request_id uuid, target_profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.job_requests request
    join public.provider_profiles provider on provider.id = request.provider_id
    where request.id = target_job_request_id
      and provider.profile_id = target_profile_id
  )
$$;

create or replace function public.create_job_safety_session_on_accept()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'Accepted' and old.status is distinct from 'Accepted' then
    insert into public.job_safety_sessions (job_request_id)
    values (new.id)
    on conflict (job_request_id) do nothing;
  end if;

  if new.status in ('Cancelled', 'Declined', 'Reported') then
    update public.job_safety_sessions
    set state = 'cancelled', updated_at = now()
    where job_request_id = new.id
      and state not in ('completed', 'cancelled');
  end if;

  return new;
end
$$;

drop trigger if exists create_job_safety_session_on_accept on public.job_requests;
create trigger create_job_safety_session_on_accept
after update of status on public.job_requests
for each row
execute function public.create_job_safety_session_on_accept();

insert into public.job_safety_sessions (job_request_id)
select request.id
from public.job_requests request
where request.status in ('Accepted', 'In progress')
on conflict (job_request_id) do nothing;

create or replace function public.get_job_safety_session(target_job_request_id uuid)
returns table (
  job_request_id uuid,
  state public.job_safety_session_state,
  viewer_role text,
  can_view_exact_location boolean,
  private_latitude numeric,
  private_longitude numeric,
  private_location_label text,
  location_shared_at timestamptz,
  provider_arrived_at timestamptz,
  arrival_confirmed_at timestamptz,
  active_at timestamptz,
  code_expires_at timestamptz,
  code_attempt_count integer,
  requester_completed_at timestamptz,
  provider_completed_at timestamptz,
  completed_at timestamptz
)
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  viewer_profile_id uuid := public.current_profile_id();
  requester_view boolean;
  provider_view boolean;
  session_state public.job_safety_session_state;
  location_payload jsonb;
begin
  requester_view := public.is_job_requester(target_job_request_id, viewer_profile_id);
  provider_view := public.is_job_provider(target_job_request_id, viewer_profile_id);

  if not requester_view and not provider_view then
    raise exception 'job safety session is not available to this user' using errcode = '42501';
  end if;

  select safety.state into session_state
  from public.job_safety_sessions safety
  where safety.job_request_id = target_job_request_id;

  if session_state is null then
    return;
  end if;

  if requester_view or session_state <> 'awaiting_location' then
    select pgp_sym_decrypt(safety.private_location_ciphertext, public.job_safety_location_key())::jsonb
    into location_payload
    from public.job_safety_sessions safety
    where safety.job_request_id = target_job_request_id
      and safety.private_location_ciphertext is not null;
  end if;

  insert into public.audit_events (actor_id, action, target_table, target_id, metadata)
  values (
    viewer_profile_id,
    'job_safety_session_viewed',
    'job_safety_sessions',
    target_job_request_id,
    jsonb_build_object(
      'viewer_role', case when requester_view then 'requester' else 'provider' end,
      'exact_location_released', requester_view or session_state <> 'awaiting_location'
    )
  );

  return query
  select
    safety.job_request_id,
    safety.state,
    case when requester_view then 'requester' else 'provider' end,
    requester_view or safety.state <> 'awaiting_location',
    case when requester_view or safety.state <> 'awaiting_location' then (location_payload ->> 'latitude')::numeric end,
    case when requester_view or safety.state <> 'awaiting_location' then (location_payload ->> 'longitude')::numeric end,
    case when requester_view or safety.state <> 'awaiting_location' then location_payload ->> 'label' end,
    safety.location_shared_at,
    safety.provider_arrived_at,
    safety.arrival_confirmed_at,
    safety.active_at,
    safety.code_expires_at,
    safety.code_attempt_count,
    safety.requester_completed_at,
    safety.provider_completed_at,
    safety.completed_at
  from public.job_safety_sessions safety
  where safety.job_request_id = target_job_request_id;
end
$$;

create or replace function public.set_job_safety_location(
  target_job_request_id uuid,
  target_latitude numeric,
  target_longitude numeric,
  target_location_label text,
  target_consent_version text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile_id uuid := public.current_profile_id();
  generated_code text;
  current_state public.job_safety_session_state;
begin
  if not public.is_job_requester(target_job_request_id, actor_profile_id) then
    raise exception 'only the requester can release the service location' using errcode = '42501';
  end if;

  if target_latitude not between -90 and 90 or target_longitude not between -180 and 180 then
    raise exception 'location coordinates are invalid' using errcode = '22023';
  end if;

  if char_length(btrim(target_location_label)) not between 3 and 240 then
    raise exception 'location label must be between 3 and 240 characters' using errcode = '22023';
  end if;

  if char_length(btrim(target_consent_version)) not between 3 and 80 then
    raise exception 'location consent version is required' using errcode = '22023';
  end if;

  select state into current_state
  from public.job_safety_sessions
  where job_request_id = target_job_request_id
  for update;

  if current_state not in ('awaiting_location', 'location_shared') then
    raise exception 'the location can no longer be changed for this session' using errcode = '22023';
  end if;

  generated_code := (
    ((('x' || encode(gen_random_bytes(4), 'hex'))::bit(32)::bigint % 900000) + 100000)::integer
  )::text;

  update public.job_safety_sessions
  set
    state = 'location_shared',
    private_location_ciphertext = pgp_sym_encrypt(
      jsonb_build_object(
        'latitude', target_latitude,
        'longitude', target_longitude,
        'label', btrim(target_location_label)
      )::text,
      public.job_safety_location_key(),
      'cipher-algo=aes256, compress-algo=1'
    ),
    location_consent_version = btrim(target_consent_version),
    location_consented_at = now(),
    location_shared_at = now(),
    code_hash = crypt(generated_code, gen_salt('bf', 8)),
    code_expires_at = now() + interval '15 minutes',
    code_attempt_count = 0,
    updated_at = now()
  where job_request_id = target_job_request_id;

  insert into public.audit_events (actor_id, action, target_table, target_id, metadata)
  values (
    actor_profile_id,
    'job_safety_location_released',
    'job_safety_sessions',
    target_job_request_id,
    jsonb_build_object(
      'code_expires_at', now() + interval '15 minutes',
      'consent_version', btrim(target_consent_version)
    )
  );

  return jsonb_build_object(
    'job_request_id', target_job_request_id,
    'state', 'location_shared',
    'one_time_code', generated_code,
    'code_expires_at', now() + interval '15 minutes'
  );
end
$$;

create or replace function public.regenerate_job_safety_code(target_job_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile_id uuid := public.current_profile_id();
  generated_code text;
  current_state public.job_safety_session_state;
  expires_at timestamptz := now() + interval '15 minutes';
begin
  if not public.is_job_requester(target_job_request_id, actor_profile_id) then
    raise exception 'only the requester can replace the arrival code' using errcode = '42501';
  end if;

  select state into current_state
  from public.job_safety_sessions
  where job_request_id = target_job_request_id
  for update;

  if current_state not in ('location_shared', 'provider_arrived', 'arrival_confirmed') then
    raise exception 'the arrival code cannot be replaced in the current session state' using errcode = '22023';
  end if;

  generated_code := (
    ((('x' || encode(gen_random_bytes(4), 'hex'))::bit(32)::bigint % 900000) + 100000)::integer
  )::text;

  update public.job_safety_sessions
  set
    code_hash = crypt(generated_code, gen_salt('bf', 8)),
    code_expires_at = expires_at,
    code_attempt_count = 0,
    updated_at = now()
  where job_request_id = target_job_request_id;

  insert into public.audit_events (actor_id, action, target_table, target_id, metadata)
  values (
    actor_profile_id,
    'job_safety_code_replaced',
    'job_safety_sessions',
    target_job_request_id,
    jsonb_build_object('code_expires_at', expires_at)
  );

  return jsonb_build_object(
    'job_request_id', target_job_request_id,
    'state', current_state,
    'one_time_code', generated_code,
    'code_expires_at', expires_at
  );
end
$$;

create or replace function public.mark_job_safety_arrived(target_job_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile_id uuid := public.current_profile_id();
  current_state public.job_safety_session_state;
begin
  if not public.is_job_provider(target_job_request_id, actor_profile_id) then
    raise exception 'only the assigned provider can mark arrival' using errcode = '42501';
  end if;

  select state into current_state
  from public.job_safety_sessions
  where job_request_id = target_job_request_id
  for update;

  if current_state in ('provider_arrived', 'arrival_confirmed', 'active', 'completion_pending', 'completed') then
    return;
  end if;

  update public.job_safety_sessions
  set state = 'provider_arrived', provider_arrived_at = now(), updated_at = now()
  where job_request_id = target_job_request_id
    and state = 'location_shared';

  if not found then
    raise exception 'arrival cannot be marked in the current session state' using errcode = '22023';
  end if;

  insert into public.audit_events (actor_id, action, target_table, target_id)
  values (actor_profile_id, 'job_safety_provider_arrived', 'job_safety_sessions', target_job_request_id);
end
$$;

create or replace function public.confirm_job_safety_arrival(target_job_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile_id uuid := public.current_profile_id();
  current_state public.job_safety_session_state;
begin
  if not public.is_job_requester(target_job_request_id, actor_profile_id) then
    raise exception 'only the requester can confirm arrival' using errcode = '42501';
  end if;

  select state into current_state
  from public.job_safety_sessions
  where job_request_id = target_job_request_id
  for update;

  if current_state in ('arrival_confirmed', 'active', 'completion_pending', 'completed') then
    return;
  end if;

  update public.job_safety_sessions
  set state = 'arrival_confirmed', arrival_confirmed_at = now(), updated_at = now()
  where job_request_id = target_job_request_id
    and state = 'provider_arrived';

  if not found then
    raise exception 'arrival cannot be confirmed in the current session state' using errcode = '22023';
  end if;

  insert into public.audit_events (actor_id, action, target_table, target_id)
  values (actor_profile_id, 'job_safety_arrival_confirmed', 'job_safety_sessions', target_job_request_id);
end
$$;

create or replace function public.start_job_safety_session(
  target_job_request_id uuid,
  supplied_code text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile_id uuid := public.current_profile_id();
  safety public.job_safety_sessions%rowtype;
begin
  if not public.is_job_provider(target_job_request_id, actor_profile_id) then
    raise exception 'only the assigned provider can start the session' using errcode = '42501';
  end if;

  select * into safety
  from public.job_safety_sessions
  where job_request_id = target_job_request_id
  for update;

  if safety.state in ('active', 'completion_pending', 'completed') then
    return jsonb_build_object('started', true, 'state', 'active', 'already_started', true);
  end if;

  if safety.state <> 'arrival_confirmed' then
    raise exception 'the requester must confirm arrival before the code can be used' using errcode = '22023';
  end if;

  if safety.code_attempt_count >= 5 then
    return jsonb_build_object('started', false, 'reason', 'attempt_limit_reached');
  end if;

  if safety.code_expires_at < now() then
    return jsonb_build_object('started', false, 'reason', 'code_expired');
  end if;

  if supplied_code !~ '^[0-9]{6}$' or crypt(supplied_code, safety.code_hash) <> safety.code_hash then
    update public.job_safety_sessions
    set code_attempt_count = code_attempt_count + 1, updated_at = now()
    where job_request_id = target_job_request_id;

    insert into public.audit_events (actor_id, action, target_table, target_id, metadata)
    values (
      actor_profile_id,
      'job_safety_code_rejected',
      'job_safety_sessions',
      target_job_request_id,
      jsonb_build_object('attempt_number', safety.code_attempt_count + 1)
    );

    return jsonb_build_object(
      'started', false,
      'reason', case when safety.code_attempt_count + 1 >= 5 then 'attempt_limit_reached' else 'invalid_code' end,
      'attempts_remaining', greatest(0, 5 - safety.code_attempt_count - 1)
    );
  end if;

  update public.job_safety_sessions
  set
    state = 'active',
    active_at = now(),
    code_hash = null,
    code_expires_at = null,
    updated_at = now()
  where job_request_id = target_job_request_id;

  update public.job_requests
  set status = 'In progress', updated_at = now()
  where id = target_job_request_id
    and status = 'Accepted';

  insert into public.job_request_status_events (job_request_id, status, actor_id, note)
  values (target_job_request_id, 'In progress', actor_profile_id, 'Arrival verified with the requester code.');

  insert into public.audit_events (actor_id, action, target_table, target_id)
  values (actor_profile_id, 'job_safety_session_started', 'job_safety_sessions', target_job_request_id);

  return jsonb_build_object('started', true, 'state', 'active');
end
$$;

create or replace function public.acknowledge_job_safety_completion(target_job_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_profile_id uuid := public.current_profile_id();
  requester_actor boolean;
  provider_actor boolean;
  safety public.job_safety_sessions%rowtype;
  finished boolean;
begin
  requester_actor := public.is_job_requester(target_job_request_id, actor_profile_id);
  provider_actor := public.is_job_provider(target_job_request_id, actor_profile_id);

  if not requester_actor and not provider_actor then
    raise exception 'only job participants can confirm completion' using errcode = '42501';
  end if;

  select * into safety
  from public.job_safety_sessions
  where job_request_id = target_job_request_id
  for update;

  if safety.state not in ('active', 'completion_pending') then
    raise exception 'completion cannot be confirmed in the current session state' using errcode = '22023';
  end if;

  update public.job_safety_sessions
  set
    requester_completed_at = case when requester_actor then coalesce(requester_completed_at, now()) else requester_completed_at end,
    provider_completed_at = case when provider_actor then coalesce(provider_completed_at, now()) else provider_completed_at end,
    state = 'completion_pending',
    updated_at = now()
  where job_request_id = target_job_request_id
  returning * into safety;

  finished := safety.requester_completed_at is not null and safety.provider_completed_at is not null;

  if finished then
    update public.job_safety_sessions
    set state = 'completed', completed_at = now(), updated_at = now()
    where job_request_id = target_job_request_id;

    update public.job_requests
    set status = 'Completed', updated_at = now()
    where id = target_job_request_id
      and status = 'In progress';

    insert into public.job_request_status_events (job_request_id, status, actor_id, note)
    values (target_job_request_id, 'Completed', actor_profile_id, 'Requester and provider both confirmed completion.');
  end if;

  insert into public.audit_events (actor_id, action, target_table, target_id, metadata)
  values (
    actor_profile_id,
    'job_safety_completion_acknowledged',
    'job_safety_sessions',
    target_job_request_id,
    jsonb_build_object(
      'participant', case when requester_actor then 'requester' else 'provider' end,
      'two_party_complete', finished
    )
  );

  return jsonb_build_object(
    'state', case when finished then 'completed' else 'completion_pending' end,
    'requester_confirmed', safety.requester_completed_at is not null,
    'provider_confirmed', safety.provider_completed_at is not null,
    'completed', finished
  );
end
$$;

create or replace function public.enforce_job_request_status_transition()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.status = new.status then
    return new;
  end if;

  if not (
    (old.status = 'Draft' and new.status = 'Submitted')
    or (old.status = 'Submitted' and new.status in ('Viewed', 'Cancelled', 'Reported'))
    or (old.status = 'Viewed' and new.status in ('Accepted', 'Declined', 'Cancelled', 'Reported'))
    or (old.status = 'Accepted' and new.status in ('In progress', 'Cancelled', 'Reported'))
    or (old.status = 'In progress' and new.status in ('Completed', 'Reported'))
  ) then
    raise exception 'invalid job request status transition from % to %', old.status, new.status
      using errcode = '22023';
  end if;

  return new;
end
$$;

drop trigger if exists enforce_job_request_status_transition on public.job_requests;
create trigger enforce_job_request_status_transition
before update of status on public.job_requests
for each row
execute function public.enforce_job_request_status_transition();

drop policy if exists "provider updates assigned request status" on public.job_requests;
create policy "provider updates assigned request status" on public.job_requests
  for update using (
    provider_id in (
      select provider.id
      from public.provider_profiles provider
      join public.profiles profile on profile.id = provider.profile_id
      where profile.auth_user_id = auth.uid()
    )
  )
  with check (
    status in ('Viewed', 'Accepted', 'Declined')
    and provider_id in (
      select provider.id
      from public.provider_profiles provider
      join public.profiles profile on profile.id = provider.profile_id
      where profile.auth_user_id = auth.uid()
    )
  );

revoke all on function public.is_job_requester(uuid, uuid) from public, anon, authenticated;
revoke all on function public.is_job_provider(uuid, uuid) from public, anon, authenticated;
revoke all on function public.get_job_safety_session(uuid) from public, anon;
revoke all on function public.job_safety_location_key() from public, anon, authenticated;
revoke all on function public.set_job_safety_location(uuid, numeric, numeric, text, text) from public, anon;
revoke all on function public.regenerate_job_safety_code(uuid) from public, anon;
revoke all on function public.mark_job_safety_arrived(uuid) from public, anon;
revoke all on function public.confirm_job_safety_arrival(uuid) from public, anon;
revoke all on function public.start_job_safety_session(uuid, text) from public, anon;
revoke all on function public.acknowledge_job_safety_completion(uuid) from public, anon;

grant execute on function public.get_job_safety_session(uuid) to authenticated;
grant execute on function public.set_job_safety_location(uuid, numeric, numeric, text, text) to authenticated;
grant execute on function public.regenerate_job_safety_code(uuid) to authenticated;
grant execute on function public.mark_job_safety_arrived(uuid) to authenticated;
grant execute on function public.confirm_job_safety_arrival(uuid) to authenticated;
grant execute on function public.start_job_safety_session(uuid, text) to authenticated;
grant execute on function public.acknowledge_job_safety_completion(uuid) to authenticated;

comment on table public.job_safety_sessions is
  'Private, server-mediated safety state for accepted jobs. Direct authenticated table access is intentionally denied.';
