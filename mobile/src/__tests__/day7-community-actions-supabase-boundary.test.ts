import { readFileSync } from 'fs';
import {
  createCommunityActionsRepository,
  seededCommunityActionsRepository,
  supabaseCommunityActionsRepository,
} from '@/lib/community-actions-repository';
import {
  toSupabaseCommunityReportInsert,
  toSupabaseModerationDecisionInsert,
  toSupabaseSocialGroupMembershipRequestInsert,
  toSupabaseSocialGroupPostInsert,
} from '@/lib/community-actions-supabase-adapter';

describe('Day 7 community actions Supabase boundary', () => {
  afterEach(() => {
    seededCommunityActionsRepository.resetForTests();
  });

  it('keeps seeded repository as the default Expo Go fallback', () => {
    expect(createCommunityActionsRepository().mode).toBe('seeded');
    expect(createCommunityActionsRepository('seeded').mode).toBe('seeded');
  });

  it('can opt into the Supabase-shaped adapter without breaking seeded prototype behavior', () => {
    const repository = createCommunityActionsRepository('supabase');

    expect(repository.mode).toBe('supabase');

    const result = repository.createSocialGroupPost(
      'group-east-legon-repairs',
      'Please recommend a reliable tiler near East Legon.',
    );

    expect(result.accepted).toBe(true);
    expect(result.post).toMatchObject({
      groupId: 'group-east-legon-repairs',
      authorProfileId: repository.defaultViewer.profileId,
      moderationStatus: 'not_run',
    });
  });

  it('maps group membership requests to Supabase table shape', () => {
    expect(
      toSupabaseSocialGroupMembershipRequestInsert(
        'group-east-legon-repairs',
        supabaseCommunityActionsRepository.defaultViewer,
      ),
    ).toEqual({
      group_id: 'group-east-legon-repairs',
      profile_id: 'profile-akosua',
      role: 'member',
      status: 'pending',
    });
  });

  it('maps group posts to Supabase table shape without private location fields', () => {
    const insert = toSupabaseSocialGroupPostInsert({
      groupId: 'group-east-legon-repairs',
      profileId: 'profile-akosua',
      body: '  Please recommend an electrician.  ',
    });
    const payload = JSON.stringify(insert).toLowerCase();

    expect(insert).toEqual({
      group_id: 'group-east-legon-repairs',
      author_profile_id: 'profile-akosua',
      body: 'Please recommend an electrician.',
      moderation_status: 'not_run',
    });
    expect(payload).not.toContain('phone');
    expect(payload).not.toContain('email');
    expect(payload).not.toContain('gps');
    expect(payload).not.toContain('ghana');
    expect(payload).not.toContain('exact_address');
  });

  it('maps reports and moderation decisions to Supabase table shapes', () => {
    const repository = createCommunityActionsRepository('supabase');

    repository.reportAgencyBroadcast('broadcast-road-works-approved', repository.defaultViewer, 'Wrong timing');

    const [moderationCase] = repository.listModerationCases();

    expect(
      toSupabaseCommunityReportInsert(
        'agency_broadcast',
        'broadcast-road-works-approved',
        repository.defaultViewer,
        'Wrong timing',
      ),
    ).toEqual({
      target_type: 'agency_broadcast',
      target_id: 'broadcast-road-works-approved',
      reporter_profile_id: 'profile-akosua',
      reason: 'Wrong timing',
    });

    expect(
      toSupabaseModerationDecisionInsert(
        moderationCase,
        'hide_content',
        repository.moderatorViewer,
        '2026-07-27T12:00:00.000Z',
      ),
    ).toEqual({
      moderation_case_id: moderationCase.id,
      report_id: moderationCase.reportId,
      target_type: 'agency_broadcast',
      target_id: 'broadcast-road-works-approved',
      decision: 'hide_content',
      resolved_by_profile_id: 'profile-moderator',
      resolved_at: '2026-07-27T12:00:00.000Z',
    });
  });

  it('keeps community action screens dependent on the repository boundary only', () => {
    const screenPaths = ['app/groups.tsx', 'app/agency-broadcasts.tsx', 'app/community/moderation.tsx'];

    for (const path of screenPaths) {
      const source = readFileSync(path, 'utf8');

      expect(source).toContain('@/lib/community-actions-repository');
      expect(source).not.toContain('@/lib/day3-community-repository');
    }
  });
});
