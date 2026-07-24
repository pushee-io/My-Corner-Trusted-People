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
      canPost: true,
      reason: 'verified_member',
      title: 'Neighborhood feed unlocked',
      message: 'You can read and post with verified members in this neighborhood.',
    };
  }

  return {
    status: 'locked',
    neighborhoodId,
    canRead: false,
    canPost: false,
    reason: access.reason,
    title: lockedCopy[access.reason].title,
    message: lockedCopy[access.reason].message,
  };
}

export function listUnlockedNeighborhoodPosts(userId: string, neighborhoodId: string): NeighborhoodFeedPost[] {
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
    authorUserId: input.userId,
    authorDisplayName: input.authorDisplayName,
    body: input.body.trim(),
    createdAt: now,
    visibility: 'verified_neighborhood_members',
  };

  feedStore.posts.unshift(post);
  return post;
}

export function resetFeedStore() {
  feedStore.posts.length = 0;
}

const lockedCopy: Record<FeedUnlockResult['reason'], { title: string; message: string }> = {
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
