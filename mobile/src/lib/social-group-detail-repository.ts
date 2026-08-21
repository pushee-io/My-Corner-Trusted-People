import { getCurrentProfile } from '@/lib/auth';
import { seededCommunityActionsRepository } from '@/lib/community-actions-repository';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type { SocialGroupPost } from '@/types/day3';

export type SocialGroupPostComment = {
  id: string;
  postId: string;
  authorProfileId: string;
  authorName: string;
  body: string;
  createdAt: string;
};

export type SocialGroupPostDetail = SocialGroupPost & {
  authorName: string;
  comments: SocialGroupPostComment[];
  likeCount: number;
  likedByMe: boolean;
  isReported: boolean;
};

export type SocialGroupReportResult = 'reported' | 'already_reported';

export type SocialGroupDetailRepository = {
  listPosts: (groupId: string) => Promise<SocialGroupPostDetail[]>;
  createPost: (groupId: string, body: string) => Promise<SocialGroupPostDetail>;
  createComment: (postId: string, body: string) => Promise<SocialGroupPostComment>;
  toggleLike: (post: SocialGroupPostDetail) => Promise<Pick<SocialGroupPostDetail, 'likeCount' | 'likedByMe'>>;
  reportPost: (postId: string, reason: string) => Promise<SocialGroupReportResult>;
};

type SocialGroupPostRow = {
  id: string;
  group_id: string;
  author_profile_id: string;
  body: string;
  created_at: string;
  moderation_status: SocialGroupPost['moderationStatus'];
};

type SocialGroupPostCommentRow = {
  id: string;
  post_id: string;
  author_profile_id: string;
  body: string;
  created_at: string;
};

type SocialGroupPostReactionRow = {
  post_id: string;
  profile_id: string;
};

type SocialGroupPostReportRow = {
  social_group_post_id: string | null;
};

type SocialGroupPostReportRpcRow = {
  reported: boolean;
  already_reported: boolean;
};

type SeededComment = Omit<SocialGroupPostComment, 'authorName'>;

const initialSeededComments: SeededComment[] = [
  {
    id: 'group-comment-repair-tip',
    postId: 'group-post-repair-tip',
    authorProfileId: 'profile-ama',
    body: 'Please include the area served and whether the electrician is available this week.',
    createdAt: '2026-07-26T12:10:00.000Z',
  },
];

const initialSeededLikes = [{ postId: 'group-post-repair-tip', profileId: 'profile-ama' }];

let seededComments = [...initialSeededComments];
let seededLikes = [...initialSeededLikes];
let seededReportedPostIds = new Set<string>();

function seededAuthorName(profileId: string) {
  if (profileId === 'profile-akosua') return 'Akosua Mensah';
  if (profileId === 'profile-ama') return 'Ama Owusu';
  return 'Group member';
}

function mapSeededPost(post: SocialGroupPost): SocialGroupPostDetail {
  return {
    ...post,
    authorName: seededAuthorName(post.authorProfileId),
    comments: seededComments
      .filter((comment) => comment.postId === post.id)
      .map((comment) => ({ ...comment, authorName: seededAuthorName(comment.authorProfileId) })),
    likeCount: seededLikes.filter((like) => like.postId === post.id).length,
    likedByMe: seededLikes.some(
      (like) => like.postId === post.id && like.profileId === seededCommunityActionsRepository.defaultViewer.profileId,
    ),
    isReported: seededReportedPostIds.has(post.id),
  };
}

const seededRepository: SocialGroupDetailRepository = {
  async listPosts(groupId) {
    return seededCommunityActionsRepository
      .listSocialGroupPosts(groupId, seededCommunityActionsRepository.defaultViewer)
      .map(mapSeededPost);
  },

  async createPost(groupId, body) {
    const result = seededCommunityActionsRepository.createSocialGroupPost(
      groupId,
      body,
      seededCommunityActionsRepository.defaultViewer,
    );

    if (!result.accepted || !result.post) {
      throw new Error('Could not publish this group post.');
    }

    return mapSeededPost(result.post);
  },

  async createComment(postId, body) {
    const normalizedBody = body.trim();
    if (!normalizedBody) throw new Error('Write a comment before sending.');

    const comment: SeededComment = {
      id: `group-comment-${seededComments.length + 1}`,
      postId,
      authorProfileId: seededCommunityActionsRepository.defaultViewer.profileId,
      body: normalizedBody,
      createdAt: new Date().toISOString(),
    };
    seededComments.push(comment);

    return { ...comment, authorName: seededAuthorName(comment.authorProfileId) };
  },

  async toggleLike(post) {
    const profileId = seededCommunityActionsRepository.defaultViewer.profileId;
    const existingIndex = seededLikes.findIndex((like) => like.postId === post.id && like.profileId === profileId);

    if (existingIndex >= 0) {
      seededLikes.splice(existingIndex, 1);
      return { likeCount: Math.max(post.likeCount - 1, 0), likedByMe: false };
    }

    seededLikes.push({ postId: post.id, profileId });
    return { likeCount: post.likeCount + 1, likedByMe: true };
  },

  async reportPost(postId) {
    if (seededReportedPostIds.has(postId)) return 'already_reported';
    seededReportedPostIds.add(postId);
    return 'reported';
  },
};

function mapPostRow(
  row: SocialGroupPostRow,
  profile: { id: string; displayName: string },
  comments: SocialGroupPostComment[],
  reactions: SocialGroupPostReactionRow[],
  isReported: boolean,
): SocialGroupPostDetail {
  return {
    id: row.id,
    groupId: row.group_id,
    authorProfileId: row.author_profile_id,
    authorName: row.author_profile_id === profile.id ? profile.displayName : 'Group member',
    body: row.body,
    createdAt: row.created_at,
    moderationStatus: row.moderation_status,
    comments,
    likeCount: reactions.length,
    likedByMe: reactions.some((reaction) => reaction.profile_id === profile.id),
    isReported,
  };
}

const supabaseRepository: SocialGroupDetailRepository = {
  async listPosts(groupId) {
    assertSupabaseConfigured();
    const profile = await getCurrentProfile();
    const { data: postData, error: postError } = await supabase
      .from('social_group_posts')
      .select('id,group_id,author_profile_id,body,created_at,moderation_status')
      .eq('group_id', groupId)
      .neq('moderation_status', 'blocked')
      .order('created_at', { ascending: false })
      .limit(50);

    if (postError) throw new Error('Could not load group posts. Try again later.');

    const posts = (postData ?? []) as SocialGroupPostRow[];
    const postIds = posts.map((post) => post.id);
    if (postIds.length === 0) return [];

    const [commentResult, reactionResult, reportResult] = await Promise.all([
      supabase
        .from('social_group_post_comments')
        .select('id,post_id,author_profile_id,body,created_at')
        .in('post_id', postIds)
        .neq('moderation_status', 'blocked')
        .order('created_at', { ascending: true }),
      supabase
        .from('social_group_post_reactions')
        .select('post_id,profile_id')
        .in('post_id', postIds)
        .eq('reaction_type', 'like'),
      supabase.from('reports').select('social_group_post_id').in('social_group_post_id', postIds),
    ]);

    if (commentResult.error || reactionResult.error || reportResult.error) {
      throw new Error('Could not load group activity. Try again later.');
    }

    const commentRows = (commentResult.data ?? []) as SocialGroupPostCommentRow[];
    const reactions = (reactionResult.data ?? []) as SocialGroupPostReactionRow[];
    const reportedPostIds = new Set(
      ((reportResult.data ?? []) as SocialGroupPostReportRow[]).flatMap((report) =>
        report.social_group_post_id ? [report.social_group_post_id] : [],
      ),
    );

    return posts.map((post) =>
      mapPostRow(
        post,
        profile,
        commentRows
          .filter((comment) => comment.post_id === post.id)
          .map((comment) => ({
            id: comment.id,
            postId: comment.post_id,
            authorProfileId: comment.author_profile_id,
            authorName: comment.author_profile_id === profile.id ? profile.displayName : 'Group member',
            body: comment.body,
            createdAt: comment.created_at,
          })),
        reactions.filter((reaction) => reaction.post_id === post.id),
        reportedPostIds.has(post.id),
      ),
    );
  },

  async createPost(groupId, body) {
    assertSupabaseConfigured();
    const profile = await getCurrentProfile();
    const { data, error } = await supabase
      .from('social_group_posts')
      .insert({
        group_id: groupId,
        author_profile_id: profile.id,
        body: body.trim(),
        moderation_status: 'not_run',
      })
      .select('id,group_id,author_profile_id,body,created_at,moderation_status')
      .single();

    if (error || !data) throw new Error('Could not publish this group post.');
    return mapPostRow(data as SocialGroupPostRow, profile, [], [], false);
  },

  async createComment(postId, body) {
    assertSupabaseConfigured();
    const profile = await getCurrentProfile();
    const { data, error } = await supabase
      .from('social_group_post_comments')
      .insert({
        post_id: postId,
        author_profile_id: profile.id,
        body: body.trim(),
        moderation_status: 'not_run',
      })
      .select('id,post_id,author_profile_id,body,created_at')
      .single();

    if (error || !data) throw new Error('Could not add your comment.');
    const row = data as SocialGroupPostCommentRow;
    return {
      id: row.id,
      postId: row.post_id,
      authorProfileId: row.author_profile_id,
      authorName: profile.displayName,
      body: row.body,
      createdAt: row.created_at,
    };
  },

  async toggleLike(post) {
    assertSupabaseConfigured();
    const profile = await getCurrentProfile();

    if (post.likedByMe) {
      const { error } = await supabase
        .from('social_group_post_reactions')
        .delete()
        .eq('post_id', post.id)
        .eq('profile_id', profile.id)
        .eq('reaction_type', 'like');

      if (error) throw new Error('Could not update this like.');
      return { likeCount: Math.max(post.likeCount - 1, 0), likedByMe: false };
    }

    const { error } = await supabase.from('social_group_post_reactions').insert({
      post_id: post.id,
      profile_id: profile.id,
      reaction_type: 'like',
    });

    if (error && error.code !== '23505') throw new Error('Could not update this like.');
    return { likeCount: post.likeCount + 1, likedByMe: true };
  },

  async reportPost(postId, reason) {
    assertSupabaseConfigured();
    const { data, error } = await supabase.rpc('report_social_group_post', {
      target_post_id: postId,
      target_reason: reason,
    });

    if (error) throw new Error('Could not submit this report.');
    const row = (Array.isArray(data) ? data[0] : data) as SocialGroupPostReportRpcRow | undefined;
    if (!row) throw new Error('Could not confirm this report.');
    return row.already_reported ? 'already_reported' : 'reported';
  },
};

function configuredMode() {
  return process.env.EXPO_PUBLIC_COMMUNITY_ACTIONS_REPOSITORY === 'supabase' ? 'supabase' : 'seeded';
}

export function createSocialGroupDetailRepository(mode: 'seeded' | 'supabase' = configuredMode()) {
  return mode === 'supabase' ? supabaseRepository : seededRepository;
}

let cachedRepository: SocialGroupDetailRepository | undefined;

export function getSocialGroupDetailRepository() {
  if (!cachedRepository) cachedRepository = createSocialGroupDetailRepository();
  return cachedRepository;
}

export function resetSocialGroupDetailRepositoryForTests() {
  cachedRepository = undefined;
  seededComments = [...initialSeededComments];
  seededLikes = [...initialSeededLikes];
  seededReportedPostIds = new Set<string>();
}
