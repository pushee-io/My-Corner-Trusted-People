import { readFileSync } from 'fs';

type ScreenExpectation = {
  path: string;
  readMethod: string;
  loadingTitle: string;
  errorMessage: string;
};

const screens: ScreenExpectation[] = [
  {
    path: 'app/groups.tsx',
    readMethod: 'listSocialGroupScreenSections',
    loadingTitle: 'Loading groups',
    errorMessage: 'Could not load groups. Try again later.',
  },
  {
    path: 'app/agency-broadcasts.tsx',
    readMethod: 'listAgencyBroadcasts',
    loadingTitle: 'Loading agency broadcasts',
    errorMessage: 'Could not load agency broadcasts. Try again later.',
  },
  {
    path: 'app/community/moderation.tsx',
    readMethod: 'listModerationCases',
    loadingTitle: 'Loading moderation queue',
    errorMessage: 'Could not load moderation queue. Try again later.',
  },
];

describe('Day 12 async community read screens', () => {
  it('loads screen data through the async read repository boundary', () => {
    for (const screen of screens) {
      const source = readFileSync(screen.path, 'utf8');

      expect(source).toContain('getCommunityActionsReadRepository');
      expect(source).toContain(`.${screen.readMethod}()`);
      expect(source).toContain('useFocusEffect');
      expect(source).toContain('useCallback');
      expect(source).not.toContain('@/lib/day3-community-repository');
      expect(source).not.toContain('@/lib/community-actions-supabase-read-adapter');
      expect(source).not.toContain('@/lib/community-actions-supabase-live-client');
    }
  });

  it('shows loading, empty, and safe error states for async reads', () => {
    for (const screen of screens) {
      const source = readFileSync(screen.path, 'utf8');

      expect(source).toContain('LoadingState');
      expect(source).toContain('EmptyState');
      expect(source).toContain('ErrorState');
      expect(source).toContain(screen.loadingTitle);
      expect(source).toContain(screen.errorMessage);
      expect(source).not.toContain('caught.message');
    }
  });

  it('keeps write and moderation actions on the existing action repository path', () => {
    const groupsSource = readFileSync('app/groups.tsx', 'utf8');
    const agencyBroadcastsSource = readFileSync('app/agency-broadcasts.tsx', 'utf8');
    const moderationSource = readFileSync('app/community/moderation.tsx', 'utf8');

    expect(groupsSource).toContain('communityActionsRepository.requestSocialGroupMembership');
    expect(groupsSource).toContain('communityActionsRepository.createSocialGroupPost');
    expect(groupsSource).toContain('communityActionsRepository.reportSocialGroupPost');
    expect(agencyBroadcastsSource).toContain('communityActionsRepository.reportAgencyBroadcast');
    expect(moderationSource).toContain('communityActionsRepository.applyModerationDecision');
  });
});
