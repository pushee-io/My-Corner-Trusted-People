import {
  createNeighborhoodFeedPost,
  feedStore,
  getFeedUnlockStatus,
  listUnlockedNeighborhoodPosts,
  resetFeedStore,
} from '@/lib/feed-unlock';
import {
  markMembershipForReverification,
} from '@/lib/neighborhood-assignment';
import {
  getNeighborhoodMembershipRecord,
  resetNeighborhoodMembershipStore,
  saveNeighborhoodMembershipRecord,
} from '@/lib/neighborhood-membership-record';
import type { AuditEvent, NeighborhoodMembership } from '@/types/contracts';

const now = '2026-07-24T13:00:00.000Z';

function membership(overrides: Partial<NeighborhoodMembership> = {}): NeighborhoodMembership {
  return {
    userId: 'user-east-legon',
    neighborhoodId: 'east-legon',
    status: 'verified',
    assignedBy: 'server',
    verifiedAt: now,
    evidenceSummary: ['phone passed', 'standardized_address passed for east-legon', 'postcard_challenge passed for east-legon'],
    ...overrides,
  };
}

function auditEvent(subjectId: string, action = 'neighborhood_membership.verified'): AuditEvent {
  return {
    id: `audit-${subjectId}-${action}`,
    actor: 'system',
    action,
    subjectId,
    createdAt: now,
    metadata: {
      assignedBy: 'server',
      neighborhoodId: 'east-legon',
    },
  };
}

describe('neighborhood authorization', () => {
  beforeEach(() => {
    resetNeighborhoodMembershipStore();
    resetFeedStore();
    feedStore.posts.push(
      {
        id: 'post-east-legon',
        neighborhoodId: 'east-legon',
        authorUserId: 'neighbor-001',
        authorDisplayName: 'Ama A.',
        body: 'East Legon private post',
        createdAt: now,
        visibility: 'verified_neighborhood_members',
      },
      {
        id: 'post-osu',
        neighborhoodId: 'osu',
        authorUserId: 'neighbor-002',
        authorDisplayName: 'Kojo K.',
        body: 'Osu private post',
        createdAt: now,
        visibility: 'verified_neighborhood_members',
      },
    );
  });

  it('proves unverified users cannot read private feed posts', () => {
    saveNeighborhoodMembershipRecord({
      membership: membership({ status: 'unverified', verifiedAt: undefined }),
      auditEvent: auditEvent('user-east-legon', 'neighborhood_membership.rejected'),
      now,
    });

    expect(getFeedUnlockStatus('user-east-legon', 'east-legon')).toMatchObject({
      status: 'locked',
      canRead: false,
      reason: 'not_verified',
    });
    expect(listUnlockedNeighborhoodPosts('user-east-legon', 'east-legon')).toEqual([]);
  });

  it('proves verified members of other neighborhoods cannot read this neighborhood feed', () => {
    saveNeighborhoodMembershipRecord({
      membership: membership({
        userId: 'user-osu',
        neighborhoodId: 'osu',
        evidenceSummary: ['phone passed', 'postcard_challenge passed for osu'],
      }),
      auditEvent: auditEvent('user-osu'),
      now,
    });

    expect(getFeedUnlockStatus('user-osu', 'east-legon')).toMatchObject({
      status: 'locked',
      canRead: false,
      reason: 'wrong_neighborhood',
    });
    expect(listUnlockedNeighborhoodPosts('user-osu', 'east-legon')).toEqual([]);
  });

  it('proves direct API-style read and write attempts are denied without verified membership', () => {
    expect(listUnlockedNeighborhoodPosts('direct-api-user', 'east-legon')).toEqual([]);
    expect(
      createNeighborhoodFeedPost({
        userId: 'direct-api-user',
        neighborhoodId: 'east-legon',
        authorDisplayName: 'Direct A.',
        body: 'Attempted direct write',
        now,
      }),
    ).toBeUndefined();
    expect(feedStore.posts).toHaveLength(2);
  });

  it('proves address changes trigger re-verification and revoke feed access', () => {
    const verifiedRecord = saveNeighborhoodMembershipRecord({
      membership: membership(),
      auditEvent: auditEvent('user-east-legon'),
      now,
    });

    expect(getFeedUnlockStatus('user-east-legon', 'east-legon')).toMatchObject({
      status: 'unlocked',
      canRead: true,
      canPost: true,
    });

    const reVerification = markMembershipForReverification(verifiedRecord, '2026-07-24T14:00:00.000Z');
    saveNeighborhoodMembershipRecord({
      membership: reVerification.membership,
      auditEvent: reVerification.auditEvent,
      now: '2026-07-24T14:00:00.000Z',
    });

    expect(getNeighborhoodMembershipRecord('user-east-legon', 'east-legon')).toMatchObject({
      status: 'pending_reverification',
      requiresReverificationAt: '2026-07-24T14:00:00.000Z',
    });
    expect(getFeedUnlockStatus('user-east-legon', 'east-legon')).toMatchObject({
      status: 'locked',
      canRead: false,
      canPost: false,
      reason: 'not_verified',
    });
    expect(listUnlockedNeighborhoodPosts('user-east-legon', 'east-legon')).toEqual([]);
  });
});
