create table if not exists neighborhood_feed_posts (
  id uuid primary key default gen_random_uuid(),
  neighborhood_id uuid not null references neighborhoods(id),
  author_user_id uuid not null,
  author_display_name text not null,
  body text not null,
  visibility text not null default 'verified_neighborhood_members'
    check (visibility = 'verified_neighborhood_members'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table neighborhood_feed_posts enable row level security;

create index if not exists neighborhood_feed_posts_neighborhood_created_idx
  on neighborhood_feed_posts (neighborhood_id, created_at desc);

create policy "Verified members can read their neighborhood feed"
  on neighborhood_feed_posts for select
  to authenticated
  using (is_verified_neighborhood_member(neighborhood_id));

create policy "Verified members can create posts in their neighborhood feed"
  on neighborhood_feed_posts for insert
  to authenticated
  with check (
    auth.uid() = author_user_id
    and is_verified_neighborhood_member(neighborhood_id)
  );

comment on table neighborhood_feed_posts is
  'Private neighborhood feed posts. RLS must require server-assigned verified membership for read and write access.';

comment on column neighborhood_feed_posts.author_display_name is
  'Public masked display name only, for example first name and last initial. Do not store legal name here.';
