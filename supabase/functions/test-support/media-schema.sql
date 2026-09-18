-- Isolated PostgreSQL harness. Production migrations are never modified for it.
-- Only prerequisite table shapes are reduced; authorization helpers are loaded
-- verbatim from the repository and the media migration runs without rewriting.
create role anon; create role authenticated; create role service_role bypassrls;
create schema auth; create schema storage;
grant usage on schema auth,storage,public to anon,authenticated,service_role;
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create type public.moderation_status as enum ('not_run','clean','flagged','blocked');
create table public.profiles(id uuid primary key,auth_user_id uuid,display_name text,role text);
create table public.neighborhoods(id uuid primary key,name text,city text,country_code text);
create table public.neighborhood_memberships(profile_id uuid,neighborhood_id uuid,is_primary boolean,status text,verified_at timestamptz,ended_at timestamptz,verification_expires_at timestamptz);
create table public.neighborhood_clusters(id uuid primary key,name text,region_id text);
create table public.neighborhood_cluster_members(neighborhood_id uuid,cluster_id uuid);
create table public.provider_profiles(id uuid primary key,profile_id uuid,business_name text,headline text,general_area text,availability text,accepting_requests boolean);
create table public.service_categories(id text primary key,name text);
create table public.job_requests(id uuid primary key,requester_id uuid,provider_id uuid,category_id text,title text,description text,original_user_text text,urgency text,preferred_date date,preferred_time text,contact_preference text,neighborhood_id uuid,general_area_label text,status text,exact_address_private text);
create table public.social_groups(id uuid primary key,name text,description text,neighborhood_id uuid,cluster_id uuid,visibility text,created_by_profile_id uuid,moderation_status text default 'not_run');
create table public.social_group_memberships(group_id uuid,profile_id uuid,status text,role text);
create table public.social_group_posts(id uuid primary key,group_id uuid,author_profile_id uuid,body text,moderation_status text default 'not_run');
create table public.events(id uuid primary key,neighborhood_id uuid,cluster_id uuid,organizer_profile_id uuid,organizer_display_name text,title text,description text,starts_at timestamptz,area_label text,visibility text,status text,moderation_status text);
create table public.event_organizers(event_id uuid,profile_id uuid,role text,permissions text[]);
create table public.event_invitations(event_id uuid,inviter_profile_id uuid,invitee_profile_id uuid,status text,expires_at timestamptz);
create table public.marketplace_listings(id uuid primary key,neighborhood_id uuid,seller_id uuid,title text,description text,availability text,pickup_area text,moderation_status text default 'not_run');
create table public.feature_flags(key text primary key,enabled boolean,description text);
insert into public.feature_flags values('events',false,'Events');
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text,unique(bucket_id,name));
alter table storage.objects enable row level security;
grant select,insert,update,delete on storage.objects to authenticated;
