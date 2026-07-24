import {
  canViewCommunityItem,
  createLocalPost,
  listAgencyBroadcasts,
  listGreaterAccraFeed,
  listLocalPosts,
} from '@/lib/community-repository';

describe('community visibility', () => {
  it('keeps ordinary posts inside the verified neighborhood', () => {
    expect(
      canViewCommunityItem({
        type: 'ordinary_post',
        visibilityScope: 'verified_neighborhood',
        neighborhoodId: 'east-legon',
        clusterId: 'accra-east',
        isAgencyApproved: false,
        isRegionalOptIn: false,
      }),
    ).toBe(true);

    expect(
      canViewCommunityItem({
        type: 'ordinary_post',
        visibilityScope: 'verified_neighborhood',
        neighborhoodId: 'osu',
        clusterId: 'accra-central',
        isAgencyApproved: false,
        isRegionalOptIn: false,
      }),
    ).toBe(false);
  });

  it('does not expose ordinary neighborhood posts in the Greater Accra feed', () => {
    const regionalItems = listGreaterAccraFeed();
    expect(regionalItems.every((item) => item.type !== 'ordinary_post')).toBe(true);
    expect(regionalItems.every((item) => item.isAgencyApproved || item.isRegionalOptIn)).toBe(true);
  });

  it('allows immediate-cluster visibility only for permitted content types', () => {
    expect(
      canViewCommunityItem({
        type: 'ordinary_post',
        visibilityScope: 'immediate_cluster',
        neighborhoodId: 'east-legon',
        clusterId: 'accra-east',
        isAgencyApproved: false,
        isRegionalOptIn: false,
      }),
    ).toBe(false);

    expect(
      canViewCommunityItem({
        type: 'recommendation',
        visibilityScope: 'immediate_cluster',
        neighborhoodId: 'east-legon',
        clusterId: 'accra-east',
        isAgencyApproved: false,
        isRegionalOptIn: false,
      }),
    ).toBe(true);
  });

  it('creates ordinary posts with verified-neighborhood visibility only', () => {
    const post = createLocalPost({
      title: 'Streetlight question',
      body: 'Is anyone else seeing the outage near the junction?',
    });

    expect(post.visibilityScope).toBe('verified_neighborhood');
    expect(post.neighborhoodId).toBe('east-legon');
    expect(listLocalPosts().some((item) => item.id === post.id)).toBe(true);
  });

  it('lists only approved agency broadcasts for agency feed', () => {
    expect(listAgencyBroadcasts().every((item) => item.isAgencyApproved)).toBe(true);
  });
});
