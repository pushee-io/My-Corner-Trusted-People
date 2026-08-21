-- Add member-only comments and likes to the existing social group post model.
-- Reports continue through the existing reports and moderation_cases tables.

create table if not exists public.social_group_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.social_group_posts(id) on delete cascade,
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 500),
  moderation_status public.moderation_status not null default 'not_run',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.social_group_post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.social_group_posts(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  reaction_type text not null default 'like' check (reaction_type = 'like'),
  created_at timestamptz not null default now(),
  unique (post_id, profile_id, reaction_type)
);

alter table public.reports
  add column if not exists social_group_post_id uuid references public.social_group_posts(id) on delete set null;

create index if not exists social_group_post_comments_post_created_idx
  on public.social_group_post_comments(post_id, created_at);

create index if not exists social_group_post_reactions_post_idx
  on public.social_group_post_reactions(post_id);

create unique index if not exists reports_social_group_post_reporter_key
  on public.reports(reporter_id, social_group_post_id)
  where social_group_post_id is not null;

drop trigger if exists set_social_group_post_comments_updated_at on public.social_group_post_comments;
create trigger set_social_group_post_comments_updated_at
before update on public.social_group_post_comments
for each row execute function public.set_updated_at();

alter table public.social_group_post_comments enable row level security;
alter table public.social_group_post_comments force row level security;
alter table public.social_group_post_reactions enable row level security;
alter table public.social_group_post_reactions force row level security;

revoke all on public.social_group_post_comments from anon, authenticated;
revoke all on public.social_group_post_reactions from anon, authenticated;
grant select, insert on public.social_group_post_comments to authenticated;
grant select, insert, delete on public.social_group_post_reactions to authenticated;
grant select, insert on public.reports to authenticated;

drop policy if exists "rls_social_group_post_comments_member_read" on public.social_group_post_comments;
drop policy if exists "rls_social_group_post_comments_member_insert" on public.social_group_post_comments;
drop policy if exists "rls_social_group_post_reactions_member_read" on public.social_group_post_reactions;
drop policy if exists "rls_social_group_post_reactions_own_insert" on public.social_group_post_reactions;
drop policy if exists "rls_social_group_post_reactions_own_delete" on public.social_group_post_reactions;
drop policy if exists "users read own reports" on public.reports;

create policy "rls_social_group_post_comments_member_read"
  on public.social_group_post_comments
  for select
  to authenticated
  using (
    moderation_status <> 'blocked'
    and exists (
      select 1
      from public.social_group_posts post
      where post.id = post_id
        and public.can_view_social_group(post.group_id)
        and public.is_accepted_social_group_member(post.group_id)
    )
  );

create policy "rls_social_group_post_comments_member_insert"
  on public.social_group_post_comments
  for insert
  to authenticated
  with check (
    author_profile_id = public.current_profile_id()
    and moderation_status in ('not_run', 'clean')
    and exists (
      select 1
      from public.social_group_posts post
      where post.id = post_id
        and public.can_view_social_group(post.group_id)
        and public.is_accepted_social_group_member(post.group_id)
    )
  );

create policy "rls_social_group_post_reactions_member_read"
  on public.social_group_post_reactions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.social_group_posts post
      where post.id = post_id
        and public.can_view_social_group(post.group_id)
        and public.is_accepted_social_group_member(post.group_id)
    )
  );

create policy "rls_social_group_post_reactions_own_insert"
  on public.social_group_post_reactions
  for insert
  to authenticated
  with check (
    profile_id = public.current_profile_id()
    and reaction_type = 'like'
    and exists (
      select 1
      from public.social_group_posts post
      where post.id = post_id
        and public.can_view_social_group(post.group_id)
        and public.is_accepted_social_group_member(post.group_id)
    )
  );

create policy "rls_social_group_post_reactions_own_delete"
  on public.social_group_post_reactions
  for delete
  to authenticated
  using (profile_id = public.current_profile_id());

create policy "users read own reports"
  on public.reports
  for select
  to authenticated
  using (reporter_id = public.current_profile_id());

create or replace function public.report_social_group_post(
  target_post_id uuid,
  target_reason text
)
returns table (
  reported boolean,
  already_reported boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor_profile_id uuid;
  target_group_id uuid;
  inserted_count integer;
begin
  actor_profile_id := public.current_profile_id();
  if actor_profile_id is null then
    raise exception 'authenticated profile required' using errcode = '42501';
  end if;

  select post.group_id
  into target_group_id
  from public.social_group_posts post
  where post.id = target_post_id
    and post.moderation_status <> 'blocked';

  if target_group_id is null
    or not public.can_view_social_group(target_group_id)
    or not public.is_accepted_social_group_member(target_group_id)
  then
    raise exception 'visible accepted group membership required' using errcode = '42501';
  end if;

  if char_length(trim(target_reason)) not between 3 and 120 then
    raise exception 'report reason must be between 3 and 120 characters' using errcode = '22023';
  end if;

  insert into public.reports (
    reporter_id,
    social_group_post_id,
    reason,
    details,
    status
  )
  values (
    actor_profile_id,
    target_post_id,
    trim(target_reason),
    'Reported from the social group detail screen.',
    'open'
  )
  on conflict (reporter_id, social_group_post_id)
    where social_group_post_id is not null
  do nothing;

  get diagnostics inserted_count = row_count;
  return query select inserted_count = 1, inserted_count = 0;
end;
$$;

revoke all on function public.report_social_group_post(uuid, text) from public, anon;
grant execute on function public.report_social_group_post(uuid, text) to authenticated;

create or replace function public.queue_social_group_report_for_review()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.social_group_post_id is not null then
    insert into public.moderation_cases (source_table, source_id, reason, status)
    values ('social_group_posts', new.social_group_post_id, new.reason, 'open');
  end if;
  return new;
end;
$$;

drop trigger if exists queue_social_group_report_after_insert on public.reports;
create trigger queue_social_group_report_after_insert
after insert on public.reports
for each row
when (new.social_group_post_id is not null)
execute function public.queue_social_group_report_for_review();

comment on table public.social_group_post_comments is
  'Member-only comments on social group posts. Blocked comments remain hidden by RLS.';

comment on table public.social_group_post_reactions is
  'One like per accepted group member and social group post.';

comment on function public.report_social_group_post(uuid, text) is
  'Reports a visible group post once for an accepted member and queues human moderation.';
