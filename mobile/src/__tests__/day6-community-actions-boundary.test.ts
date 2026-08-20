import { communityActionsRepository } from '@/lib/community-actions-repository';

describe('Day 6 community actions repository boundary', () => {
  afterEach(() => {
    communityActionsRepository.resetForTests();
  });

  it('keeps groups screen data behind a repository boundary', () => {
    const sections = communityActionsRepository.getSocialGroupScreenSections();

    expect(sections.map((section) => section.group.id)).toEqual(['group-east-legon-repairs', 'group-accra-east-water', 'group-east-legon-schools']);
    expect(sections.flatMap((section) => section.posts).every((post) => post.moderationStatus !== 'blocked')).toBe(
      true,
    );
  });

  it('creates group posts through the repository boundary', () => {
    const result = communityActionsRepository.createSocialGroupPost(
      'group-east-legon-repairs',
      'Please recommend a reliable painter near East Legon.',
    );

    expect(result.accepted).toBe(true);
    expect(result.post).toMatchObject({
      groupId: 'group-east-legon-repairs',
      authorProfileId: communityActionsRepository.defaultViewer.profileId,
      moderationStatus: 'not_run',
    });
  });

  it('routes group post reports into moderator cases', () => {
    const report = communityActionsRepository.reportSocialGroupPost(
      'group-post-repair-tip',
      communityActionsRepository.defaultViewer,
      'Needs moderator review',
    );

    expect(report.accepted).toBe(true);

    const cases = communityActionsRepository.listModerationCases();

    expect(cases).toHaveLength(1);
    expect(cases[0]).toMatchObject({
      targetType: 'social_group_post',
      targetId: 'group-post-repair-tip',
      status: 'open',
      reportReason: 'Needs moderator review',
    });
  });

  it('routes agency broadcast reports into moderator cases', () => {
    const report = communityActionsRepository.reportAgencyBroadcast(
      'broadcast-road-works-approved',
      communityActionsRepository.defaultViewer,
      'Wrong schedule',
    );

    expect(report.accepted).toBe(true);

    const cases = communityActionsRepository.listModerationCases();

    expect(cases).toHaveLength(1);
    expect(cases[0]).toMatchObject({
      targetType: 'agency_broadcast',
      targetId: 'broadcast-road-works-approved',
      status: 'open',
      reportReason: 'Wrong schedule',
    });
  });

  it('applies moderation decisions through the repository boundary', () => {
    communityActionsRepository.reportAgencyBroadcast(
      'broadcast-road-works-approved',
      communityActionsRepository.defaultViewer,
      'Wrong schedule',
    );

    const [moderationCase] = communityActionsRepository.listModerationCases();
    const result = communityActionsRepository.applyModerationDecision(moderationCase.id, 'hide_content');

    expect(result).toMatchObject({
      accepted: true,
      caseId: moderationCase.id,
      status: 'resolved',
      decision: 'hide_content',
    });

    expect(
      communityActionsRepository
        .listAgencyBroadcastsForViewer()
        .some((broadcast) => broadcast.id === 'broadcast-road-works-approved'),
    ).toBe(false);
  });
});
