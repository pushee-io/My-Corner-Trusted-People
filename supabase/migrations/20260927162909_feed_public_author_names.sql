begin;
-- Resolve names only through visible Feed content, never an arbitrary profile directory.
-- Canonical neighbor_name handles explicit public names and legitimate Neighbor fallback.
create function private.feed_author_names(post_ids uuid[],comment_ids uuid[]) returns jsonb
language plpgsql stable security definer set search_path='' as $$
declare actor uuid:=public.current_profile_id(); peers uuid[]; comment_peers uuid[];
begin
 if auth.uid() is null or actor is null or not private.community_account_active(actor) then
  raise exception 'Feed unavailable.' using errcode='42501'; end if;
 if coalesce(cardinality(post_ids),0)>100 or coalesce(cardinality(comment_ids),0)>100 then
  raise exception 'Too many Feed references.' using errcode='22023'; end if;
 select array_agg(distinct p.author_id) into peers from public.neighborhood_feed_posts p
 where p.id=any(post_ids) and p.moderation_status<>'blocked'
  and public.has_verified_neighborhood_membership(p.neighborhood_id)
  and private.ai_source_author_allowed(p.author_id);
 -- Comments predate canonical history on Preview; a clean database may omit them.
 if to_regclass('public.neighborhood_feed_comments') is not null then
  execute $query$
   select array_agg(distinct c.author_id) from public.neighborhood_feed_comments c
   join public.neighborhood_feed_posts p on p.id=c.post_id
   where c.id=any($1) and c.moderation_status<>'blocked' and p.moderation_status<>'blocked'
    and public.has_verified_neighborhood_membership(p.neighborhood_id)
    and private.ai_source_author_allowed(p.author_id) and private.ai_source_author_allowed(c.author_id)
  $query$ into comment_peers using comment_ids;
 end if;
 return coalesce((select jsonb_agg(jsonb_build_object('id',id,'name',private.neighbor_name(id)) order by id)
  from (select distinct unnest(coalesce(peers,'{}')||coalesce(comment_peers,'{}')) id) allowed),'[]');
end $$;
revoke all on function private.feed_author_names(uuid[],uuid[]) from public,anon;
grant execute on function private.feed_author_names(uuid[],uuid[]) to authenticated;
create function public.feed_author_names(post_ids uuid[] default '{}',comment_ids uuid[] default '{}') returns jsonb
language sql stable security invoker set search_path='' as $$select private.feed_author_names(post_ids,comment_ids)$$;
revoke all on function public.feed_author_names(uuid[],uuid[]) from public,anon;
grant execute on function public.feed_author_names(uuid[],uuid[]) to authenticated;
commit;
