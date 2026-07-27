import {
  applyDay5ModerationDecision,
  defaultDay3NeighborhoodContext,
  listAgencyBroadcastsForViewer,
  listDay5ModerationCases,
  listSocialGroupPosts,
  moderatorDay5Context,
  reportAgencyBroadcast,
  reportSocialGroupPost,
  resetDay3CommunityRepositoryForTests,
} from '@/lib/day3-community-repository';

describe('Day 5 moderation actions', () => {
  afterEach(() => {
    resetDay3CommunityRepositoryForTests();
  });

  it('does not expose moderation cases to ordinary verified residents', () => {
    reportAgencyBroadcast('broadcast-road-works-approved', defaultDay3NeighborhoodContext, 'Wrong timing');

    expect(listDay5ModerationCases(defaultDay3NeighborhoodContext)).toEqual([]);
  });

  it('shows group post and agency broadcast reports to moderators', () => {
    reportSocialGroupPost('group-post-repair-tip', defaultDay3NeighborhoodContext, 'Needs moderator review');
    reportAgencyBroadcast('broadcast-road-works-approved', defaultDay3NeighborhoodContext, 'Wrong timing');

    const cases = listDay5ModerationCases(moderatorDay5Context);

    expect(cases).toHaveLength(2);
    expect(cases.map((item) => item.targetType)).toEqual(['social_group_post', 'agency_broadcast']);
    expect(cases.every((item) => item.status === 'open')).toBe(true);
    expect(cases.every((item) => item.reporterProfileId === defaultDay3NeighborhoodContext.profileId)).toBe(true);
  });

  it('prevents ordinary residents from applying moderation decisions', () => {
    reportAgencyBroadcast('broadcast-road-works-approved', defaultDay3NeighborhoodContext, 'Wrong timing');

    const [moderationCase] = listDay5ModerationCases(moderatorDay5Context);
    const result = applyDay5ModerationDecision(moderationCase.id, defaultDay3NeighborhoodContext, 'hide_content');

    expect(result).toEqual({
      accepted: false,
      caseId: moderationCase.id,
      reason: 'not_moderator',
    });
    expect(
      listAgencyBroadcastsForViewer(defaultDay3NeighborhoodContext).some(
        (broadcast) => broadcast.id === 'broadcast-road-works-approved',
      ),
    ).toBe(true);
  });

  it('keeps reported agency broadcasts visible when a moderator keeps the content', () => {
    reportAgencyBroadcast('broadcast-road-works-approved', defaultDay3NeighborhoodContext, 'Wrong timing');

    const [moderationCase] = listDay5ModerationCases(moderatorDay5Context);
    const result = applyDay5ModerationDecision(moderationCase.id, moderatorDay5Context, 'keep_content');

    expect(result).toMatchObject({
      accepted: true,
      caseId: moderationCase.id,
      status: 'resolved',
      decision: 'keep_content',
    });

    expect(
      listAgencyBroadcastsForViewer(defaultDay3NeighborhoodContext).some(
        (broadcast) => broadcast.id === 'broadcast-road-works-approved',
      ),
    ).toBe(true);

    const [resolvedCase] = listDay5ModerationCases(moderatorDay5Context);
    expect(resolvedCase).toMatchObject({
      id: moderationCase.id,
      status: 'resolved',
      decision: 'keep_content',
      resolvedByProfileId: moderatorDay5Context.profileId,
    });
    expect(resolvedCase.resolvedAt).toBeDefined();
  });

  it('hides reported agency broadcasts from resident screens when a moderator hides the content', () => {
    reportAgencyBroadcast('broadcast-road-works-approved', defaultDay3NeighborhoodContext, 'Wrong timing');

    const [moderationCase] = listDay5ModerationCases(moderatorDay5Context);
    const result = applyDay5ModerationDecision(moderationCase.id, moderatorDay5Context, 'hide_content');

    expect(result).toMatchObject({
      accepted: true,
      caseId: moderationCase.id,
      status: 'resolved',
      decision: 'hide_content',
    });

    expect(
      listAgencyBroadcastsForViewer(defaultDay3NeighborhoodContext).some(
        (broadcast) => broadcast.id === 'broadcast-road-works-approved',
      ),
    ).toBe(false);
  });

  it('hides reported group posts from group feeds when a moderator hides the content', () => {
    reportSocialGroupPost('group-post-repair-tip', defaultDay3NeighborhoodContext, 'Unsafe recommendation');

    const [moderationCase] = listDay5ModerationCases(moderatorDay5Context);
    const result = applyDay5ModerationDecision(moderationCase.id, moderatorDay5Context, 'hide_content');

    expect(result).toMatchObject({
      accepted: true,
      caseId: moderationCase.id,
      status: 'resolved',
      decision: 'hide_content',
    });

    expect(
      listSocialGroupPosts('group-east-legon-repairs', defaultDay3NeighborhoodContext).some(
        (post) => post.id === 'group-post-repair-tip',
      ),
    ).toBe(false);
  });

  it('does not resolve the same moderation case twice', () => {
    reportSocialGroupPost('group-post-repair-tip', defaultDay3NeighborhoodContext, 'Unsafe recommendation');

    const [moderationCase] = listDay5ModerationCases(moderatorDay5Context);

    expect(applyDay5ModerationDecision(moderationCase.id, moderatorDay5Context, 'hide_content')).toMatchObject({
      accepted: true,
      caseId: moderationCase.id,
      status: 'resolved',
      decision: 'hide_content',
    });

    expect(applyDay5ModerationDecision(moderationCase.id, moderatorDay5Context, 'keep_content')).toEqual({
      accepted: false,
      caseId: moderationCase.id,
      reason: 'already_resolved',
    });
  });

  it('fails closed for missing moderation cases', () => {
    expect(applyDay5ModerationDecision('moderation-case-missing', moderatorDay5Context, 'hide_content')).toEqual({
      accepted: false,
      caseId: 'moderation-case-missing',
      reason: 'case_not_found',
    });
  });
});
