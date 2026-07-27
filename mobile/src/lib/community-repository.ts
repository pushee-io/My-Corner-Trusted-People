import { getCurrentProfile } from '@/lib/auth';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type { ModerationQueueItem, NeighborhoodFeedComment, NeighborhoodFeedPost } from '@/types/contracts';

type NeighborhoodMembershipRow = {
  neighborhood_id: string;
  neighborhoods:
    | {
        id: string;
        name: string;
      }
    | {
        id: string;
        name: string;
      }[]
    | null;
};

type FeedPostRow = {
  id: string;
  neighborhood_id: string;
  author_id: string;
  body: string;
  moderation_status: NeighborhoodFeedPost['moderationStatus'];
  created_at: string;
};

type FeedCommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  moderation_status: NeighborhoodFeedComment['moderationStatus'];
  created_at: string;
};

type ReactionRow = {
  id: string;
  post_id: string;
  profile_id: string;
};

type ReportRow = {
  neighborhood_feed_post_id: string | null;
  neighborhood_feed_comment_id: string | null;
};

export type CurrentNeighborhood = {
  id: string;
  name: string;
};

function neighborhoodName(row: NeighborhoodMembershipRow) {
  const neighborhood = Array.isArray(row.neighborhoods) ? row.neighborhoods[0] : row.neighborhoods;
  return neighborhood?.name ?? 'Your neighborhood';
}

function mapFeedComment(row: FeedCommentRow, authorName = 'Neighbor', isReported = false): NeighborhoodFeedComment {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    authorName,
    body: row.body,
    moderationStatus: row.moderation_status,
    createdAt: row.created_at,
    isReported,
  };
}

function mapFeedPost(
  row: FeedPostRow,
  authorName = 'Neighbor',
  comments: NeighborhoodFeedComment[] = [],
  likeCount = 0,
  likedByMe = false,
  isReported = false,
): NeighborhoodFeedPost {
  return {
    id: row.id,
    neighborhoodId: row.neighborhood_id,
    authorId: row.author_id,
    authorName,
    body: row.body,
    moderationStatus: row.moderation_status,
    createdAt: row.created_at,
    comments,
    likeCount,
    likedByMe,
    isReported,
  };
}

export async function getCurrentNeighborhood(): Promise<CurrentNeighborhood> {
  assertSupabaseConfigured();
  const profile = await getCurrentProfile();

  const { data, error } = await supabase
    .from('neighborhood_memberships')
    .select('neighborhood_id, neighborhoods(id, name)')
    .eq('profile_id', profile.id)
    .eq('is_primary', true)
    .limit(1);

  if (error) throw error;

  const row = data?.[0] as NeighborhoodMembershipRow | undefined;
  if (!row) throw new Error('No primary neighborhood membership found for this signed-in user.');

  return {
    id: row.neighborhood_id,
    name: neighborhoodName(row),
  };
}

async function authorNames(authorIds: string[]) {
  const uniqueIds = [...new Set(authorIds)];
  if (uniqueIds.length === 0) return new Map<string, string>();

  const { data, error } = await supabase.from('profiles').select('id, display_name').in('id', uniqueIds);
  if (error) throw error;

  return new Map((data ?? []).map((row) => [row.id, row.display_name]));
}

async function reportsForCurrentUser(postIds: string[], commentIds: string[]) {
  const profile = await getCurrentProfile();
  const postReports = new Set<string>();
  const commentReports = new Set<string>();
  const reportFilters = [
    postIds.length ? `neighborhood_feed_post_id.in.(${postIds.join(',')})` : '',
    commentIds.length ? `neighborhood_feed_comment_id.in.(${commentIds.join(',')})` : '',
  ].filter(Boolean);

  if (reportFilters.length === 0) {
    return { postReports, commentReports };
  }

  const { data, error } = await supabase
    .from('reports')
    .select('neighborhood_feed_post_id, neighborhood_feed_comment_id')
    .eq('reporter_id', profile.id)
    .or(reportFilters.join(','));

  if (error) throw error;

  ((data ?? []) as ReportRow[]).forEach((report) => {
    if (report.neighborhood_feed_post_id) postReports.add(report.neighborhood_feed_post_id);
    if (report.neighborhood_feed_comment_id) commentReports.add(report.neighborhood_feed_comment_id);
  });

  return { postReports, commentReports };
}

export async function listNeighborhoodFeedPosts(neighborhoodId: string): Promise<NeighborhoodFeedPost[]> {
  assertSupabaseConfigured();
  const profile = await getCurrentProfile();

  const { data: posts, error: postsError } = await supabase
    .from('neighborhood_feed_posts')
    .select('id, neighborhood_id, author_id, body, moderation_status, created_at')
    .eq('neighborhood_id', neighborhoodId)
    .neq('moderation_status', 'blocked')
    .order('created_at', { ascending: false })
    .limit(50);

  if (postsError) throw postsError;

  const postRows = (posts ?? []) as FeedPostRow[];
  const postIds = postRows.map((post) => post.id);

  const [{ data: comments, error: commentsError }, { data: reactions, error: reactionsError }] = await Promise.all([
    postIds.length
      ? supabase
          .from('neighborhood_feed_comments')
          .select('id, post_id, author_id, body, moderation_status, created_at')
          .in('post_id', postIds)
          .neq('moderation_status', 'blocked')
          .order('created_at', { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    postIds.length
      ? supabase.from('neighborhood_feed_reactions').select('id, post_id, profile_id').in('post_id', postIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (commentsError) throw commentsError;
  if (reactionsError) throw reactionsError;

  const commentRows = (comments ?? []) as FeedCommentRow[];
  const reactionRows = (reactions ?? []) as ReactionRow[];
  const names = await authorNames([...postRows.map((post) => post.author_id), ...commentRows.map((comment) => comment.author_id)]);
  const reports = await reportsForCurrentUser(postIds, commentRows.map((comment) => comment.id));

  return postRows.map((post) => {
    const postComments = commentRows
      .filter((comment) => comment.post_id === post.id)
      .map((comment) =>
        mapFeedComment(comment, names.get(comment.author_id), reports.commentReports.has(comment.id)),
      );
    const postReactions = reactionRows.filter((reaction) => reaction.post_id === post.id);

    return mapFeedPost(
      post,
      names.get(post.author_id),
      postComments,
      postReactions.length,
      postReactions.some((reaction) => reaction.profile_id === profile.id),
      reports.postReports.has(post.id),
    );
  });
}

export async function createNeighborhoodFeedPost(neighborhoodId: string, body: string): Promise<NeighborhoodFeedPost> {
  assertSupabaseConfigured();
  const profile = await getCurrentProfile();

  const { data, error } = await supabase
    .from('neighborhood_feed_posts')
    .insert({
      neighborhood_id: neighborhoodId,
      author_id: profile.id,
      body: body.trim(),
      moderation_status: 'not_run',
    })
    .select('id, neighborhood_id, author_id, body, moderation_status, created_at')
    .single();

  if (error) throw error;
  return mapFeedPost(data as FeedPostRow, profile.displayName);
}

export async function createNeighborhoodFeedComment(postId: string, body: string): Promise<NeighborhoodFeedComment> {
  assertSupabaseConfigured();
  const profile = await getCurrentProfile();

  const { data, error } = await supabase
    .from('neighborhood_feed_comments')
    .insert({
      post_id: postId,
      author_id: profile.id,
      body: body.trim(),
      moderation_status: 'not_run',
    })
    .select('id, post_id, author_id, body, moderation_status, created_at')
    .single();

  if (error) throw error;
  return mapFeedComment(data as FeedCommentRow, profile.displayName);
}

export async function toggleNeighborhoodFeedLike(post: NeighborhoodFeedPost): Promise<{ likeCount: number; likedByMe: boolean }> {
  assertSupabaseConfigured();
  const profile = await getCurrentProfile();

  if (post.likedByMe) {
    const { error } = await supabase
      .from('neighborhood_feed_reactions')
      .delete()
      .eq('post_id', post.id)
      .eq('profile_id', profile.id)
      .eq('reaction_type', 'like');

    if (error) throw error;
    return { likeCount: Math.max(post.likeCount - 1, 0), likedByMe: false };
  }

  const { error } = await supabase.from('neighborhood_feed_reactions').insert({
    post_id: post.id,
    profile_id: profile.id,
    reaction_type: 'like',
  });

  if (error && error.code !== '23505') throw error;
  return { likeCount: post.likeCount + (post.likedByMe ? 0 : 1), likedByMe: true };
}

export async function reportNeighborhoodFeedPost(postId: string, reason = 'Community feed report') {
  assertSupabaseConfigured();
  const profile = await getCurrentProfile();

  const { error } = await supabase.from('reports').insert({
    reporter_id: profile.id,
    neighborhood_feed_post_id: postId,
    reason,
    details: 'Reported from the neighborhood feed.',
    status: 'open',
  });

  if (error) throw error;
}

export async function reportNeighborhoodFeedComment(commentId: string, reason = 'Community reply report') {
  assertSupabaseConfigured();
  const profile = await getCurrentProfile();

  const { error } = await supabase.from('reports').insert({
    reporter_id: profile.id,
    neighborhood_feed_comment_id: commentId,
    reason,
    details: 'Reported from a neighborhood feed reply.',
    status: 'open',
  });

  if (error) throw error;
}

export async function listModerationQueue(): Promise<ModerationQueueItem[]> {
  assertSupabaseConfigured();

  const { data, error } = await supabase
    .from('moderation_cases')
    .select('id, source_table, source_id, reason, status, created_at, resolution_action, resolved_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    sourceTable: row.source_table,
    sourceId: row.source_id,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
    resolutionAction: row.resolution_action ?? undefined,
    resolvedAt: row.resolved_at ?? undefined,
  }));
}

export async function applyModerationAction(
  caseId: string,
  action: 'keep_content' | 'hide_content' | 'resolve_case',
): Promise<ModerationQueueItem> {
  assertSupabaseConfigured();

  const { data, error } = await supabase.rpc('resolve_moderation_case', {
    case_id: caseId,
    action,
  });

  if (error) throw error;

  return {
    id: data.id,
    sourceTable: data.source_table,
    sourceId: data.source_id,
    reason: data.reason,
    status: data.status,
    createdAt: data.created_at,
    resolutionAction: data.resolution_action ?? undefined,
    resolvedAt: data.resolved_at ?? undefined,
  };
}

export function subscribeToNeighborhoodFeedPosts(
  neighborhoodId: string,
  onPost: (post: NeighborhoodFeedPost) => void,
  onComment: (comment: NeighborhoodFeedComment) => void,
  onPostHidden: (postId: string) => void,
  onCommentHidden: (commentId: string) => void,
  onError: (message: string) => void,
  onStatus: (status: 'live' | 'reconnecting' | 'paused') => void,
) {
  const channel = supabase
    .channel(`neighborhood-feed:${neighborhoodId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'neighborhood_feed_posts',
        filter: `neighborhood_id=eq.${neighborhoodId}`,
      },
      (payload) => {
        const row = payload.new as FeedPostRow;
        if (row.moderation_status !== 'blocked') onPost(mapFeedPost(row));
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'neighborhood_feed_posts',
        filter: `neighborhood_id=eq.${neighborhoodId}`,
      },
      (payload) => {
        const row = payload.new as FeedPostRow;
        if (row.moderation_status === 'blocked') onPostHidden(row.id);
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'neighborhood_feed_comments',
      },
      (payload) => {
        const row = payload.new as FeedCommentRow;
        if (row.moderation_status !== 'blocked') onComment(mapFeedComment(row));
      },
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'neighborhood_feed_comments',
      },
      (payload) => {
        const row = payload.new as FeedCommentRow;
        if (row.moderation_status === 'blocked') onCommentHidden(row.id);
      },
    )
    .subscribe((status, error) => {
      if (status === 'SUBSCRIBED') onStatus('live');
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') onStatus('reconnecting');
      if (status === 'CLOSED') onStatus('paused');

      if (error) onError(error.message);
      if (status === 'CHANNEL_ERROR') onError('Realtime feed connection failed.');
    });

  return () => {
    supabase.removeChannel(channel);
  };
}
