import { communityActionsRepository } from '@/lib/community-actions-repository';

function stringify(value: unknown) {
  return JSON.stringify(value).toLowerCase();
}

describe('Day 6 community actions privacy boundary', () => {
  afterEach(() => {
    communityActionsRepository.resetForTests();
  });

  it('keeps private profile and exact location fields out of group post report cases', () => {
    const report = communityActionsRepository.reportSocialGroupPost(
      'group-post-repair-tip',
      communityActionsRepository.defaultViewer,
      'Needs moderator review',
    );

    expect(report.accepted).toBe(true);

    const [moderationCase] = communityActionsRepository.listModerationCases();
    const payload = stringify(moderationCase);

    expect(moderationCase).toMatchObject({
      targetType: 'social_group_post',
      targetId: 'group-post-repair-tip',
      targetTitle: 'Social group post',
      reportReason: 'Needs moderator review',
      status: 'open',
    });

    expect(payload).not.toContain('phone');
    expect(payload).not.toContain('email');
    expect(payload).not.toContain('ghana_post');
    expect(payload).not.toContain('ghanapost');
    expect(payload).not.toContain('gps');
    expect(payload).not.toContain('digitaladdress');
    expect(payload).not.toContain('digital_address');
    expect(payload).not.toContain('exactaddress');
    expect(payload).not.toContain('exact_address');
    expect(payload).not.toContain('house number');
    expect(payload).not.toContain('street address');
  });

  it('keeps private profile and exact location fields out of agency broadcast report cases', () => {
    const report = communityActionsRepository.reportAgencyBroadcast(
      'broadcast-road-works-approved',
      communityActionsRepository.defaultViewer,
      'Wrong timing',
    );

    expect(report.accepted).toBe(true);

    const [moderationCase] = communityActionsRepository.listModerationCases();
    const payload = stringify(moderationCase);

    expect(moderationCase).toMatchObject({
      targetType: 'agency_broadcast',
      targetId: 'broadcast-road-works-approved',
      targetTitle: 'East Legon road works notice',
      reportReason: 'Wrong timing',
      status: 'open',
    });

    expect(payload).not.toContain('phone');
    expect(payload).not.toContain('email');
    expect(payload).not.toContain('ghana_post');
    expect(payload).not.toContain('ghanapost');
    expect(payload).not.toContain('gps');
    expect(payload).not.toContain('digitaladdress');
    expect(payload).not.toContain('digital_address');
    expect(payload).not.toContain('exactaddress');
    expect(payload).not.toContain('exact_address');
    expect(payload).not.toContain('house number');
    expect(payload).not.toContain('street address');
  });

  it('keeps moderation decision results limited to case metadata', () => {
    communityActionsRepository.reportAgencyBroadcast(
      'broadcast-road-works-approved',
      communityActionsRepository.defaultViewer,
      'Wrong timing',
    );

    const [moderationCase] = communityActionsRepository.listModerationCases();
    const result = communityActionsRepository.applyModerationDecision(moderationCase.id, 'hide_content');
    const payload = stringify(result);

    expect(result).toMatchObject({
      accepted: true,
      caseId: moderationCase.id,
      status: 'resolved',
      decision: 'hide_content',
    });

    expect(payload).not.toContain('phone');
    expect(payload).not.toContain('email');
    expect(payload).not.toContain('ghana_post');
    expect(payload).not.toContain('ghanapost');
    expect(payload).not.toContain('gps');
    expect(payload).not.toContain('digitaladdress');
    expect(payload).not.toContain('digital_address');
    expect(payload).not.toContain('exactaddress');
    expect(payload).not.toContain('exact_address');
    expect(payload).not.toContain('house number');
    expect(payload).not.toContain('street address');
  });
});
