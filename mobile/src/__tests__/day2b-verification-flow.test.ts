import {
  completeResidenceVerificationFromPostcard,
  createDay2BLocalPost,
  day2bNeighborhoodId,
  getDay2BFeedUnlockStatus,
  listDay2BNeighborhoodPosts,
} from '@/lib/day2b-verification';
import { resetFeedStore } from '@/lib/feed-unlock';
import { resetNeighborhoodMembershipStore } from '@/lib/neighborhood-membership-record';

describe('Day 2B mobile verification flow', () => {
  beforeEach(() => {
    resetNeighborhoodMembershipStore();
    resetFeedStore();
  });

  it('keeps the neighborhood feed locked before residence verification', () => {
    expect(getDay2BFeedUnlockStatus()).toMatchObject({
      status: 'locked',
      canRead: false,
      canPost: false,
      neighborhoodId: day2bNeighborhoodId,
    });
    expect(listDay2BNeighborhoodPosts()).toEqual([]);
    expect(createDay2BLocalPost('Hello neighbors')).toBeUndefined();
  });

  it('unlocks feed read and post after test postcard verification creates membership', () => {
    const membership = completeResidenceVerificationFromPostcard();

    expect(membership).toMatchObject({
      neighborhoodId: day2bNeighborhoodId,
      status: 'verified',
      assignedBy: 'server',
    });

    expect(getDay2BFeedUnlockStatus()).toMatchObject({
      status: 'unlocked',
      canRead: true,
      canPost: true,
      reason: 'verified_member',
    });

    const post = createDay2BLocalPost('Please share plumber recommendations for East Legon.');

    expect(post).toMatchObject({
      neighborhoodId: day2bNeighborhoodId,
      authorName: 'Akosua M.',
      moderationStatus: 'not_run',
    });

    expect(listDay2BNeighborhoodPosts()).toHaveLength(1);
  });
});