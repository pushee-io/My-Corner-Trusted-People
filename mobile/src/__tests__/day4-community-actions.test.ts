import {
  createSocialGroupPostAction,
  getSocialGroupMembershipStatus,
  reportAgencyBroadcast,
  reportSocialGroupPost,
  requestSocialGroupMembership,
  resetDay3CommunityRepositoryForTests,
} from '@/lib/day3-community-repository';
import type { Day3NeighborhoodContext } from '@/types/day3';

const eastLegonViewer: Day3NeighborhoodContext = {
  profileId: 'profile-akosua',
  neighborhoodId: 'east-legon',
  clusterId: 'accra-east',
  regionId: 'greater-accra',
  isVerifiedNeighborhoodMember: true,
};

const newEastLegonViewer: Day3NeighborhoodContext = {
  ...eastLegonViewer,
  profileId: 'profile-new-member',
};

const unverifiedViewer: Day3NeighborhoodContext = {
  ...eastLegonViewer,
  profileId: 'profile-unverified',
  isVerifiedNeighborhoodMember: false,
};

describe('Day 4 community actions', () => {
  afterEach(() => {
    resetDay3CommunityRepositoryForTests();
  });

  it('lets a verified viewer request to join a visible group', () => {
    expect(getSocialGroupMembershipStatus('group-east-legon-repairs', newEastLegonViewer.profileId)).toBe('none');

    expect(requestSocialGroupMembership('group-east-legon-repairs', newEastLegonViewer)).toEqual({
      groupId: 'group-east-legon-repairs',
      profileId: 'profile-new-member',
      status: 'pending',
      created: true,
    });

    expect(getSocialGroupMembershipStatus('group-east-legon-repairs', newEastLegonViewer.profileId)).toBe('pending');
  });

  it('does not duplicate existing accepted or pending memberships', () => {
    expect(requestSocialGroupMembership('group-east-legon-repairs', eastLegonViewer)).toEqual({
      groupId: 'group-east-legon-repairs',
      profileId: 'profile-akosua',
      status: 'accepted',
      created: false,
    });

    expect(requestSocialGroupMembership('group-osu-traders', eastLegonViewer)).toEqual({
      groupId: 'group-osu-traders',
      profileId: 'profile-akosua',
      status: 'none',
      created: false,
    });
  });

  it('does not allow unverified viewers to request hidden group membership', () => {
    expect(requestSocialGroupMembership('group-east-legon-repairs', unverifiedViewer)).toEqual({
      groupId: 'group-east-legon-repairs',
      profileId: 'profile-unverified',
      status: 'none',
      created: false,
    });
  });

  it('lets accepted members create pending-moderation group posts', () => {
    const result = createSocialGroupPostAction({
      groupId: 'group-east-legon-repairs',
      profileId: 'profile-akosua',
      body: '  Who can repair a water pump this week?  ',
    });

    expect(result.accepted).toBe(true);
    expect(result.post).toMatchObject({
      groupId: 'group-east-legon-repairs',
      authorProfileId: 'profile-akosua',
      body: 'Who can repair a water pump this week?',
      moderationStatus: 'not_run',
    });
  });

  it('blocks group post creation for pending members and empty posts', () => {
    expect(
      createSocialGroupPostAction({
        groupId: 'group-osu-traders',
        profileId: 'profile-akosua',
        body: 'Can I post before approval?',
      }),
    ).toEqual({
      accepted: false,
      reason: 'not_accepted_member',
    });

    expect(
      createSocialGroupPostAction({
        groupId: 'group-east-legon-repairs',
        profileId: 'profile-akosua',
        body: '   ',
      }),
    ).toEqual({
      accepted: false,
      reason: 'empty_body',
    });
  });

  it('lets verified viewers report visible agency broadcasts once', () => {
    const firstReport = reportAgencyBroadcast('broadcast-road-works-approved', eastLegonViewer, 'Wrong date');

    expect(firstReport.accepted).toBe(true);
    expect(firstReport.report).toMatchObject({
      targetType: 'agency_broadcast',
      targetId: 'broadcast-road-works-approved',
      reporterProfileId: 'profile-akosua',
      reason: 'Wrong date',
    });

    expect(reportAgencyBroadcast('broadcast-road-works-approved', eastLegonViewer, 'Wrong date')).toEqual({
      accepted: false,
      reason: 'already_reported',
    });
  });

  it('blocks reports for hidden agency broadcasts', () => {
    expect(reportAgencyBroadcast('broadcast-unapproved-regional', eastLegonViewer)).toEqual({
      accepted: false,
      reason: 'not_visible',
    });

    expect(reportAgencyBroadcast('broadcast-road-works-approved', unverifiedViewer)).toEqual({
      accepted: false,
      reason: 'not_visible',
    });
  });

  it('lets accepted members report visible social group posts once', () => {
    const firstReport = reportSocialGroupPost('group-post-repair-tip', eastLegonViewer, 'Needs review');

    expect(firstReport.accepted).toBe(true);
    expect(firstReport.report).toMatchObject({
      targetType: 'social_group_post',
      targetId: 'group-post-repair-tip',
      reporterProfileId: 'profile-akosua',
      reason: 'Needs review',
    });

    expect(reportSocialGroupPost('group-post-repair-tip', eastLegonViewer, 'Needs review')).toEqual({
      accepted: false,
      reason: 'already_reported',
    });
  });
});
