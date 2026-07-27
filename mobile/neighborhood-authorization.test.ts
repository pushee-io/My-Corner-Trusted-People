import {
  createNeighborhoodFeedPost,
  feedStore,
  getFeedUnlockStatus,
  listUnlockedNeighborhoodPosts,
  resetFeedStore,
} from '@/lib/feed-unlock';
import {
  resetNeighborhoodMembershipStore,
  saveNeighborhoodMembershipRecord,
} from '@/lib/neighborhood-membership-record';
import type { AuditEvent, NeighborhoodFeedPost, NeighborhoodMembership } from '@/types/contracts';

const now = '2026-07-24T12:00:00.000Z';

function membership(overrides: Partial<NeighborhoodMembership> = {}): NeighborhoodMembership {
  return {
    userId: 'user-001',
    neighborhoodId: 'east-legon',
    status: 'verified',
    assignedBy: 'server',
    verifiedAt: now,
    evidenceSummary: ['phone passed', 'postcard_challenge passed for east-legon'],
    ...overrides,
  };
}

function auditEvent(subjectId = 'user-001'): AuditEvent {
  return {
    id: `audit-${subjectId}`,
    actor: 'system',
    action: 'neighborhood_membership.verified',
    subjectId,
    createdAt: now,
    metadata: {
      assignedBy: 'server',
      neighborhoodId: 'east-legon',
    },
  };
}

function feedPost(overrides: Partial<NeighborhoodFeedPost> = {}): NeighborhoodFeedPost {
  return {
    id: 'post-east-legon',
    neighborhoodId: 'east-legon',
    authorId: 'user-002',
    authorName: 'Ama A.',
    body: 'Water pressure is low this morning.',
    moderationStatus: 'clean',
    createdAt: now,
    comments: [],
    likeCount: 0,
    likedByMe: false,
    isReported: false,
    ...overrides,
  };
}

describe('feed unlock', () => {
  beforeEach(() => {
    resetNeighborhoodMembershipStore();
    resetFeedStore();
  });

  it('unlocks read and post access for verified members', () => {
    saveNeighborhoodMembershipRecord({
      membership: membership(),
      auditEvent: auditEvent(),
      now,
    });

    expect(getFeedUnlockStatus('user-001', 'east-legon')).toMatchObject({
      status: 'unlocked',
      canRead: true,
      canPost: true,
      reason: 'verified_member',
    });
  });

  it('keeps the feed locked for users with no membership', () => {
    expect(getFeedUnlockStatus('user-999', 'east-legon')).toMatchObject({
      status: 'locked',
      canRead: false,
      canPost: false,
      reason: 'no_membership',
    });
  });

  it('keeps the feed locked for pending re-verification', () => {
    saveNeighborhoodMembershipRecord({
      membership: membership({ status: 'pending_reverification', verifiedAt: undefined }),
      auditEvent: auditEvent(),
      now,
    });

    expect(getFeedUnlockStatus('user-001', 'east-legon')).toMatchObject({
      status: 'locked',
      reason: 'not_verified',
    });
  });

  it('only returns posts from the unlocked neighborhood', () => {
    saveNeighborhoodMembershipRecord({
      membership: membership(),
      auditEvent: auditEvent(),
      now,
    });

    feedStore.posts.push(
      feedPost(),
      feedPost({
        id: 'post-osu',
        neighborhoodId: 'osu',
        authorId: 'user-003',
        authorName: 'Kojo K.',
        body: 'Osu post should not appear.',
      }),
    );

    expect(listUnlockedNeighborhoodPosts('user-001', 'east-legon')).toHaveLength(1);
    expect(listUnlockedNeighborhoodPosts('user-001', 'east-legon')[0]?.id).toBe('post-east-legon');
    expect(listUnlockedNeighborhoodPosts('user-999', 'east-legon')).toEqual([]);
  });

  it('allows posting only after feed unlock', () => {
    expect(
      createNeighborhoodFeedPost({
        userId: 'user-001',
        neighborhoodId: 'east-legon',
        authorDisplayName: 'Akosua M.',
        body: 'Hello neighbors',
        now,
      }),
    ).toBeUndefined();

    saveNeighborhoodMembershipRecord({
      membership: membership(),
      auditEvent: auditEvent(),
      now,
    });

    const post = createNeighborhoodFeedPost({
      userId: 'user-001',
      neighborhoodId: 'east-legon',
      authorDisplayName: 'Akosua M.',
      body: 'Hello neighbors',
      now,
    });

    expect(post).toMatchObject({
      neighborhoodId: 'east-legon',
      authorName: 'Akosua M.',
      moderationStatus: 'not_run',
    });
    expect(feedStore.posts).toHaveLength(1);
  });
});
