import { readFileSync } from 'fs';
import {
  communityActionsReadRepository,
  createCommunityActionsReadRepository,
  seededCommunityActionsRepository,
} from '@/lib/community-actions-repository';
import type { SupabaseAgencyBroadcastRow, SupabaseSocialGroupRow } from '@/lib/community-actions-supabase-adapter';
import type {
  SupabaseModerationCaseRow,
  SupabaseSocialGroupMembershipRow,
  SupabaseSocialGroupPostRow,
} from '@/lib/community-actions-supabase-read-model';
import type {
  SupabaseCommunityReadClient,
  SupabaseCommunityReadTableName,
} from '@/lib/community-actions-supabase-read-adapter';
import type { Day3NeighborhoodContext } from '@/types/day3';

const viewer: Day3NeighborhoodContext = {
  profileId: 'profile-akosua',
  neighborhoodId: 'east-legon',
  clusterId: 'accra-east',
  regionId: 'greater-accra',
  isVerifiedNeighborhoodMember: true,
};

const moderator: Day3NeighborhoodContext = {
  ...viewer,
  profileId: 'profile-moderator',
};

const socialGroups: SupabaseSocialGroupRow[] = [
  {
    id: 'group-east-legon-repairs',
    name: 'East Legon repair tips',
    description: 'Private neighborhood group for repair tips and provider recommendations.',
    neighborhood_id: 'east-legon',
    cluster_id: 'accra-east',
    visibility: 'verified_neighborhood_members',
    member_count: 24,
    created_by_profile_id: 'profile-akosua',
    created_at: '2026-07-26T12:00:00.000Z',
    moderation_status: 'clean',
  },
];

const socialGroupMemberships: SupabaseSocialGroupMembershipRow[] = [
  {
    id: 'membership-east-legon-repairs-akosua',
    group_id: 'group-east-legon-repairs',
    profile_id: 'profile-akosua',
    role: 'member',
    status: 'accepted',
    joined_at: '2026-07-26T12:00:00.000Z',
  },
];

const socialGroupPosts: SupabaseSocialGroupPostRow[] = [
  {
    id: 'group-post-repair-tip',
    group_id: 'group-east-legon-repairs',
    author_profile_id: 'profile-akosua',
    body: 'Please share electrician recommendations that have helped in East Legon.',
    created_at: '2026-07-26T12:00:00.000Z',
    moderation_status: 'clean',
  },
];

const agencyBroadcasts: SupabaseAgencyBroadcastRow[] = [
  {
    id: 'broadcast-road-works-approved',
    agency_name: 'Accra Roads Desk',
    title: 'East Legon road works notice',
    body: 'Approved maintenance notice for roads around East Legon this weekend.',
    scope: 'greater_accra',
    region_id: 'greater-accra',
    is_agency_approved: true,
    moderation_status: 'clean',
    published_at: '2026-07-26T12:00:00.000Z',
  },
];

const moderationCases: SupabaseModerationCaseRow[] = [
  {
    id: 'moderation-case-community-report-1',
    source_table: 'agency_broadcasts',
    source_id: 'broadcast-road-works-approved',
    reason: 'Wrong timing',
    status: 'open',
    created_at: '2026-07-27T12:05:00.000Z',
  },
];

type MockRows = Partial<Record<SupabaseCommunityReadTableName, unknown[]>>;

function createMockSupabaseReadClient(rows: MockRows) {
  const calls: SupabaseCommunityReadTableName[] = [];

  const client: SupabaseCommunityReadClient = {
    from(table) {
      return {
        async select() {
          calls.push(table);

          return {
            data: rows[table] ?? [],
            error: null,
          };
        },
      };
    },
  };

  return { client, calls };
}

describe('Day 10 community actions read mode integration', () => {
  afterEach(() => {
    seededCommunityActionsRepository.resetForTests();
    delete process.env.EXPO_PUBLIC_COMMUNITY_ACTIONS_REPOSITORY;
  });

  it('keeps seeded read repository as the default Expo Go fallback', async () => {
    expect(communityActionsReadRepository.mode).toBe('seeded');
    expect(createCommunityActionsReadRepository().mode).toBe('seeded');

    const sections = await createCommunityActionsReadRepository().listSocialGroupScreenSections(viewer);

    expect(sections.map((section) => section.group.id)).toEqual(['group-east-legon-repairs', 'group-accra-east-water', 'group-east-legon-schools']);
  });

  it('falls back to seeded reads when Supabase mode has no read client', async () => {
    const repository = createCommunityActionsReadRepository({ mode: 'supabase' });

    expect(repository.mode).toBe('seeded');

    const broadcasts = await repository.listAgencyBroadcasts(viewer);

    expect(broadcasts.map((broadcast) => broadcast.id)).toEqual([
      'broadcast-road-works-approved',
      'broadcast-water-cluster',
    ]);
  });

  it('uses the Supabase read adapter when Supabase mode receives a client', async () => {
    const { client, calls } = createMockSupabaseReadClient({
      social_groups: socialGroups,
      social_group_memberships: socialGroupMemberships,
      social_group_posts: socialGroupPosts,
      agency_broadcasts: agencyBroadcasts,
      moderation_cases: moderationCases,
    });
    const repository = createCommunityActionsReadRepository({
      mode: 'supabase',
      supabaseReadClient: client,
    });

    expect(repository.mode).toBe('supabase');

    const sections = await repository.listSocialGroupScreenSections(viewer);
    const broadcasts = await repository.listAgencyBroadcasts(viewer);
    const cases = await repository.listModerationCases(moderator);

    expect(sections.map((section) => section.group.id)).toEqual(['group-east-legon-repairs']);
    expect(broadcasts.map((broadcast) => broadcast.id)).toEqual(['broadcast-road-works-approved']);
    expect(cases.map((item) => item.id)).toEqual(['moderation-case-community-report-1']);
    expect(calls).toEqual([
      'social_groups',
      'social_group_memberships',
      'social_group_posts',
      'agency_broadcasts',
      'moderation_cases',
      'social_group_posts',
      'agency_broadcasts',
    ]);
  });

  it('keeps live Supabase writes disabled by leaving write actions on the seeded prototype path', () => {
    const repository = createCommunityActionsReadRepository({ mode: 'supabase' });

    expect(repository.mode).toBe('seeded');

    const writeRepositorySource = readFileSync('src/lib/community-actions-repository.ts', 'utf8');

    expect(writeRepositorySource).toContain('return seededCommunityActionsRepository.createSocialGroupPost');
    expect(writeRepositorySource).toContain('return seededCommunityActionsRepository.reportSocialGroupPost');
    expect(writeRepositorySource).toContain('return seededCommunityActionsRepository.reportAgencyBroadcast');
    expect(writeRepositorySource).toContain('return seededCommunityActionsRepository.applyModerationDecision');
  });

  it('keeps screens dependent on the community actions boundary only', () => {
    const screenPaths = ['app/groups.tsx', 'app/agency-broadcasts.tsx', 'app/community/moderation.tsx'];

    for (const path of screenPaths) {
      const source = readFileSync(path, 'utf8');

      expect(source).toContain('@/lib/community-actions-repository');
      expect(source).not.toContain('@/lib/day3-community-repository');
      expect(source).not.toContain('@/lib/community-actions-supabase-read-adapter');
    }
  });
});
