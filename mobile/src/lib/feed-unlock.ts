import { canAccessPrivateNeighborhoodFeed } from '@/lib/neighborhood-membership-record';
import type { FeedUnlockResult, NeighborhoodFeedPost } from '@/types/contracts';

type FeedStore = {
  posts: NeighborhoodFeedPost[];
};

type CreatePostInput = {
  userId: string;
  neighborhoodId: string;
  authorDisplayName: string;
  body: string;
  now?: string;
};

type FeedLockReason = NonNullable<FeedUnlockResult['reason']>;

export const feedStore: FeedStore = {
  posts: [],
};

export function getFeedUnlockStatus(userId: string, neighborhoodId: string): FeedUnlockResult {
  const access = canAccessPrivateNeighborhoodFeed(userId, neighborhoodId);

  if (access.canReadPrivateFeed) {
    return {
      status: 'unlocked',
      neighborhoodId,
      canRead: true,
      canWrite: true,
      canPost: true,
      reason: 'verified_member',
      title: 'Neighborhood feed unlocked',
      message: 'You can read and post with verified members in this neighborhood.',
    };
  }

  const reason = access.reason as FeedLockReason;

  return {
    status: 'locked',
    neighborhoodId,
    canRead: false,
    canWrite: false,
    canPost: false,
    reason,
    title: lockedCopy[reason].title,
    message: lockedCopy[reason].message,
  };
}

export function listUnlockedNeighborhoodPosts(
  userId: string,
  neighborhoodId: string,
): NeighborhoodFeedPost[] {
  const unlock = getFeedUnlockStatus(userId, neighborhoodId);
  if (!unlock.canRead) return [];

  return feedStore.posts.filter((post) => post.neighborhoodId === neighborhoodId);
}

export function createNeighborhoodFeedPost(input: CreatePostInput): NeighborhoodFeedPost | undefined {
  const unlock = getFeedUnlockStatus(input.userId, input.neighborhoodId);
  if (!unlock.canPost) return undefined;

  const now = input.now ?? new Date().toISOString();

  const post: NeighborhoodFeedPost = {
    id: `post-${feedStore.posts.length + 1}`,
    neighborhoodId: input.neighborhoodId,
    authorId: input.userId,
    authorName: input.authorDisplayName,
    body: input.body.trim(),
    imageUrls: [],
    moderationStatus: 'not_run',
    createdAt: now,
    comments: [],
    likeCount: 0,
    likedByMe: false,
    isReported: false,
    visibility: 'verified_neighborhood_members',
  };

  feedStore.posts.unshift(post);
  return post;
}

export function resetFeedStore() {
  feedStore.posts.length = 0;
}

const lockedCopy: Record<FeedLockReason, { title: string; message: string }> = {
  verified_member: {
    title: 'Neighborhood feed unlocked',
    message: 'You can read and post with verified members in this neighborhood.',
  },
  no_membership: {
    title: 'Verify your neighborhood',
    message: 'Complete residence verification before opening this private neighborhood feed.',
  },
  wrong_neighborhood: {
    title: 'Different neighborhood',
    message: 'This feed is only available to verified members assigned to this neighborhood.',
  },
  not_verified: {
    title: 'Verification pending',
    message: 'Your neighborhood membership must be verified before feed access unlocks.',
  },
};