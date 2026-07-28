import { communityActionsRepository } from '@/lib/community-actions-repository';
import {
  createSupabaseCommunityActionsReadRepository,
  type SupabaseCommunityReadClient,
  type SupabaseCommunityReadTableName,
} from '@/lib/community-actions-supabase-read-adapter';
import type { SupabaseAgencyBroadcastRow, SupabaseSocialGroupRow } from '@/lib/community-actions-supabase-adapter';
import type {
  SupabaseModerationCaseRow,
  SupabaseSocialGroupMembershipRow,
  SupabaseSocialGroupPostRow,
} from '@/lib/community-actions-supabase-read-model';
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
  {
    id: 'group-osu-traders',
    name: 'Osu local traders',
    description: 'Neighborhood group for Osu trader recommendations.',
    neighborhood_id: 'osu',
    cluster_id: 'accra-central',
    visibility: 'verified_neighborhood_members',
    member_count: 18,
    created_by_profile_id: 'profile-kojo',
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
  {
    id: 'group-post-hidden',
    group_id: 'group-east-legon-repairs',
    author_profile_id: 'profile-spam',
    body: 'Blocked post.',
    created_at: '2026-07-26T12:00:00.000Z',
    moderation_status: 'blocked',
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
  {
    id: 'broadcast-blocked-regional',
    agency_name: 'Blocked Desk',
    title: 'Blocked notice',
    body: 'Blocked agency broadcast should not appear.',
    scope: 'greater_accra',
    region_id: 'greater-accra',
    is_agency_approved: true,
    moderation_status: 'blocked',
    published_at: '2026-07-26T12:00:00.000Z',
  },
];

const moderationCases: SupabaseModerationCaseRow[] = [
  {
    id: 'moderation-case-community-report-1',
    source_table: 'social_group_posts',
    source_id: 'group-post-repair-tip',
    reason: 'Needs moderator review',
    status: 'open',
    created_at: '2026-07-27T12:00:00.000Z',
  },
  {
    id: 'moderation-case-community-report-2',
    source_table: 'agency_broadcasts',
    source_id: 'broadcast-road-works-approved',
    reason: 'Wrong timing',
    status: 'resolved',
    created_at: '2026-07-27T12:05:00.000Z',
    resolved_by: 'profile-moderator',
    resolution_action: 'hide_content',
    resolved_at: '2026-07-27T12:10:00.000Z',
  },
];

type MockRows = Partial<Record<SupabaseCommunityReadTableName, unknown[]>>;

function createMockSupabaseReadClient(rows: MockRows, failingTable?: SupabaseCommunityReadTableName) {
  const calls: Array<{ table: SupabaseCommunityReadTableName; columns?: string }> = [];

  const client: SupabaseCommunityReadClient = {
    from(table) {
      return {
        async select(columns) {
          calls.push({ table, columns });

          if (table === failingTable) {
            return {
              data: null,
              error: { message: 'database unavailable' },
            };
          }

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

describe('Day 9 Supabase community read adapter', () => {
  it('keeps the seeded repository as the default Expo Go fallback', () => {
    expect(communityActionsRepository.mode).toBe('seeded');
  });

  it('reads group screen sections through a mocked Supabase client', async () => {
    const { client, calls } = createMockSupabaseReadClient({
      social_groups: socialGroups,
      social_group_memberships: socialGroupMemberships,
      social_group_posts: socialGroupPosts,
    });
    const repository = createSupabaseCommunityActionsReadRepository(client);

    const sections = await repository.listSocialGroupScreenSections(viewer);

    expect(sections.map((section) => section.group.id)).toEqual(['group-east-legon-repairs']);
    expect(sections[0].membershipStatus).toBe('accepted');
    expect(sections[0].posts.map((post) => post.id)).toEqual(['group-post-repair-tip']);
    expect(calls.map((call) => call.table)).toEqual([
      'social_groups',
      'social_group_memberships',
      'social_group_posts',
    ]);
  });

  it('reads approved agency broadcasts through a mocked Supabase client', async () => {
    const { client, calls } = createMockSupabaseReadClient({
      agency_broadcasts: agencyBroadcasts,
    });
    const repository = createSupabaseCommunityActionsReadRepository(client);

    const broadcasts = await repository.listAgencyBroadcasts(viewer);

    expect(broadcasts.map((broadcast) => broadcast.id)).toEqual(['broadcast-road-works-approved']);
    expect(calls.map((call) => call.table)).toEqual(['agency_broadcasts']);
  });

  it('reads moderation cases through a mocked Supabase client', async () => {
    const { client, calls } = createMockSupabaseReadClient({
      moderation_cases: moderationCases,
      social_group_posts: socialGroupPosts,
      agency_broadcasts: agencyBroadcasts,
    });
    const repository = createSupabaseCommunityActionsReadRepository(client);

    const cases = await repository.listModerationCases(moderator);

    expect(cases).toHaveLength(2);
    expect(cases[0]).toMatchObject({
      id: 'moderation-case-community-report-1',
      targetType: 'social_group_post',
      targetId: 'group-post-repair-tip',
      status: 'open',
    });
    expect(cases[1]).toMatchObject({
      id: 'moderation-case-community-report-2',
      targetType: 'agency_broadcast',
      targetId: 'broadcast-road-works-approved',
      status: 'resolved',
      decision: 'hide_content',
    });
    expect(calls.map((call) => call.table)).toEqual(['moderation_cases', 'social_group_posts', 'agency_broadcasts']);
  });

  it('does not expose moderation cases to non-moderators', async () => {
    const { client } = createMockSupabaseReadClient({
      moderation_cases: moderationCases,
      social_group_posts: socialGroupPosts,
      agency_broadcasts: agencyBroadcasts,
    });
    const repository = createSupabaseCommunityActionsReadRepository(client);

    await expect(repository.listModerationCases(viewer)).resolves.toEqual([]);
  });

  it('returns an empty moderation queue when live moderation_cases has no rows', async () => {
    const { client } = createMockSupabaseReadClient({
      moderation_cases: [],
      social_group_posts: socialGroupPosts,
      agency_broadcasts: agencyBroadcasts,
    });
    const repository = createSupabaseCommunityActionsReadRepository(client);

    await expect(repository.listModerationCases(moderator)).resolves.toEqual([]);
  });

  it('fails closed with a useful read error when Supabase returns an error', async () => {
    const { client } = createMockSupabaseReadClient({}, 'social_groups');
    const repository = createSupabaseCommunityActionsReadRepository(client);

    await expect(repository.listSocialGroupScreenSections(viewer)).rejects.toThrow(
      'Could not read social_groups: database unavailable',
    );
  });
});
