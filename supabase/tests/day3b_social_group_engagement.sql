create or replace function pg_temp.assert_true(ok boolean, message text)
returns void
language plpgsql
as $$
begin
  if not ok then
    raise exception '%', message;
  end if;
end;
$$;

create or replace function pg_temp.assert_denied(statement text, message text)
returns void
language plpgsql
as $$
begin
  execute statement;
  raise exception '%', message;
exception
  when insufficient_privilege then
    null;
  when check_violation then
    null;
  when unique_violation then
    null;
  when others then
    if sqlstate = '42501' then
      null;
    else
      raise;
    end if;
end;
$$;

reset role;

delete from public.moderation_cases
where source_table = 'social_group_posts'
  and source_id = 'd3500000-0000-4000-8000-000000000001';

delete from public.reports
where social_group_post_id = 'd3500000-0000-4000-8000-000000000001';

delete from public.social_group_post_reactions
where post_id = 'd3500000-0000-4000-8000-000000000001';

delete from public.social_group_post_comments
where post_id = 'd3500000-0000-4000-8000-000000000001';

reset role;
set role authenticated;
set request.jwt.claim.sub = 'd3aa1111-1111-4111-8111-111111111111';

insert into public.social_group_post_comments (
  post_id,
  author_profile_id,
  body,
  moderation_status
)
values (
  'd3500000-0000-4000-8000-000000000001',
  public.current_profile_id(),
  'This is a member-only test comment.',
  'not_run'
);

select pg_temp.assert_true(
  exists (
    select 1
    from public.social_group_post_comments
    where post_id = 'd3500000-0000-4000-8000-000000000001'
      and body = 'This is a member-only test comment.'
  ),
  'accepted group member should create and read a comment'
);

insert into public.social_group_post_reactions (post_id, profile_id, reaction_type)
values (
  'd3500000-0000-4000-8000-000000000001',
  public.current_profile_id(),
  'like'
);

select pg_temp.assert_true(
  (
    select count(*)
    from public.social_group_post_reactions
    where post_id = 'd3500000-0000-4000-8000-000000000001'
  ) = 1,
  'accepted group member should create and read one like'
);

select pg_temp.assert_denied(
  $$insert into public.social_group_post_reactions (post_id, profile_id, reaction_type)
    values (
      'd3500000-0000-4000-8000-000000000001',
      public.current_profile_id(),
      'like'
    )$$,
  'one member must not create duplicate likes on one post'
);

select pg_temp.assert_true(
  (
    select report.reported and not report.already_reported
    from public.report_social_group_post(
      'd3500000-0000-4000-8000-000000000001',
      'Unsafe or inappropriate'
    ) report
  ),
  'accepted group member should report a visible post'
);

select pg_temp.assert_true(
  (
    select not report.reported and report.already_reported
    from public.report_social_group_post(
      'd3500000-0000-4000-8000-000000000001',
      'Unsafe or inappropriate'
    ) report
  ),
  'repeated group post reports should be idempotent'
);

reset role;

select pg_temp.assert_true(
  exists (
    select 1
    from public.moderation_cases
    where source_table = 'social_group_posts'
      and source_id = 'd3500000-0000-4000-8000-000000000001'
      and reason = 'Unsafe or inappropriate'
  ),
  'group post reports should create a human moderation case'
);

reset role;
set role authenticated;
set request.jwt.claim.sub = 'd3bb2222-2222-4222-8222-222222222222';

select pg_temp.assert_true(
  not exists (
    select 1
    from public.social_group_post_comments
    where post_id = 'd3500000-0000-4000-8000-000000000001'
  ),
  'a resident outside the group must not read its comments'
);

select pg_temp.assert_denied(
  $$insert into public.social_group_post_comments (
      post_id,
      author_profile_id,
      body,
      moderation_status
    )
    values (
      'd3500000-0000-4000-8000-000000000001',
      public.current_profile_id(),
      'This comment must be rejected.',
      'not_run'
    )$$,
  'a resident outside the group must not create comments'
);

select pg_temp.assert_denied(
  $$select * from public.report_social_group_post(
      'd3500000-0000-4000-8000-000000000001',
      'Unsafe or inappropriate'
    )$$,
  'a resident outside the group must not report a hidden group post'
);

reset role;

select 'day3b_social_group_engagement_passed' as result;
