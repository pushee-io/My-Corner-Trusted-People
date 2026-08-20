import {
  canViewAgencyBroadcast,
  canViewSocialGroup,
  createSocialGroupPost,
  isAcceptedSocialGroupMember,
  listAgencyBroadcastsForViewer,
  listSocialGroupPosts,
  listVisibleSocialGroups,
  resetDay3CommunityRepositoryForTests,
} from '@/lib/day3-community-repository';
import type { AgencyBroadcast, Day3NeighborhoodContext, SocialGroup } from '@/types/day3';

const eastLegonViewer: Day3NeighborhoodContext = {
  profileId: 'profile-akosua',
  neighborhoodId: 'east-legon',
  clusterId: 'accra-east',
  regionId: 'greater-accra',
  isVerifiedNeighborhoodMember: true,
};

describe('Day 3 social groups and agency broadcasts', () => {
  afterEach(() => {
    resetDay3CommunityRepositoryForTests();
  });

  it('keeps verified-neighborhood groups inside the viewer neighborhood', () => {
    const eastLegonGroup: SocialGroup = {
      id: 'group-east-legon',
      name: 'East Legon repairs',
      description: 'Neighborhood repair recommendations.',
      neighborhoodId: 'east-legon',
      clusterId: 'accra-east',
      visibility: 'verified_neighborhood_members',
      memberCount: 12,
      createdByProfileId: 'profile-akosua',
      createdAt: '2026-07-26T12:00:00.000Z',
      moderationStatus: 'clean',
    };
    const osuGroup: SocialGroup = {
      ...eastLegonGroup,
      id: 'group-osu',
      neighborhoodId: 'osu',
      clusterId: 'accra-central',
    };

    expect(canViewSocialGroup(eastLegonGroup, eastLegonViewer)).toBe(true);
    expect(canViewSocialGroup(osuGroup, eastLegonViewer)).toBe(false);
  });

  it('allows immediate-cluster groups only inside the viewer cluster', () => {
    const clusterGroup: SocialGroup = {
      id: 'group-cluster',
      name: 'Accra East updates',
      description: 'Cluster-level local updates.',
      neighborhoodId: 'east-legon',
      clusterId: 'accra-east',
      visibility: 'immediate_cluster_members',
      memberCount: 30,
      createdByProfileId: 'profile-ama',
      createdAt: '2026-07-26T12:00:00.000Z',
      moderationStatus: 'clean',
    };
    const outsideClusterGroup: SocialGroup = {
      ...clusterGroup,
      id: 'group-central',
      neighborhoodId: 'osu',
      clusterId: 'accra-central',
    };

    expect(canViewSocialGroup(clusterGroup, eastLegonViewer)).toBe(true);
    expect(canViewSocialGroup(outsideClusterGroup, eastLegonViewer)).toBe(false);
  });

  it('requires accepted group membership before reading or creating group posts', () => {
    expect(isAcceptedSocialGroupMember('group-east-legon-repairs', 'profile-akosua')).toBe(true);
    expect(isAcceptedSocialGroupMember('group-osu-traders', 'profile-akosua')).toBe(false);

    expect(listSocialGroupPosts('group-east-legon-repairs', eastLegonViewer)).toEqual([
      {
        id: 'group-post-repair-tip',
        groupId: 'group-east-legon-repairs',
        authorProfileId: 'profile-akosua',
        body: 'Please share electrician recommendations that have helped in East Legon.',
        createdAt: '2026-07-26T12:00:00.000Z',
        moderationStatus: 'clean',
      },
    ]);

    expect(
      createSocialGroupPost({
        groupId: 'group-osu-traders',
        profileId: 'profile-akosua',
        body: 'Can I post before approval?',
      }),
    ).toBeUndefined();
  });

  it('creates pending-moderation group posts only for accepted members', () => {
    const post = createSocialGroupPost({
      groupId: 'group-east-legon-repairs',
      profileId: 'profile-akosua',
      body: '  Who can repair a water pump this week?  ',
    });

    expect(post).toMatchObject({
      groupId: 'group-east-legon-repairs',
      authorProfileId: 'profile-akosua',
      body: 'Who can repair a water pump this week?',
      moderationStatus: 'not_run',
    });
    expect(listSocialGroupPosts('group-east-legon-repairs', eastLegonViewer)[0]).toMatchObject({
      body: 'Who can repair a water pump this week?',
      moderationStatus: 'not_run',
    });
  });

  it('lists only visible groups for the verified viewer', () => {
    expect(listVisibleSocialGroups(eastLegonViewer).map((group) => group.id)).toEqual([
      'group-east-legon-repairs',
      'group-accra-east-water',
      'group-east-legon-schools',
    ]);
  });

  it('does not show groups to unverified viewers', () => {
    expect(
      listVisibleSocialGroups({
        ...eastLegonViewer,
        isVerifiedNeighborhoodMember: false,
      }),
    ).toEqual([]);
  });

  it('lists only approved agency broadcasts matching the viewer area', () => {
    expect(listAgencyBroadcastsForViewer(eastLegonViewer).map((broadcast) => broadcast.id)).toEqual([
      'broadcast-road-works-approved',
      'broadcast-water-cluster',
    ]);
  });

  it('requires approval before a Greater Accra broadcast enters the regional feed', () => {
    const approved: AgencyBroadcast = {
      id: 'broadcast-approved',
      agencyName: 'Accra Roads Desk',
      title: 'Approved notice',
      body: 'Approved agency notice.',
      scope: 'greater_accra',
      regionId: 'greater-accra',
      isAgencyApproved: true,
      moderationStatus: 'clean',
      publishedAt: '2026-07-26T12:00:00.000Z',
    };
    const unapproved: AgencyBroadcast = {
      ...approved,
      id: 'broadcast-unapproved',
      isAgencyApproved: false,
    };

    expect(canViewAgencyBroadcast(approved, eastLegonViewer)).toBe(true);
    expect(canViewAgencyBroadcast(unapproved, eastLegonViewer)).toBe(false);
  });
});
