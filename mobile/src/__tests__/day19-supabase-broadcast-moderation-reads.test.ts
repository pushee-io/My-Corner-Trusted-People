import { buildAgencyBroadcastsFromSupabaseRows } from '@/lib/community-actions-supabase-read-model';
import {
  createSupabaseCommunityActionsReadRepository,
  type SupabaseCommunityReadClient,
  type SupabaseCommunityReadTableName,
} from '@/lib/community-actions-supabase-read-adapter';
import type { SupabaseAgencyBroadcastRow } from '@/lib/community-actions-supabase-adapter';
import type { Day3NeighborhoodContext } from '@/types/day3';

const liveEastLegonNeighborhoodId = '90ac8954-e9ca-467f-8a2e-de7eecbd5422';
const liveAccraEastClusterId = '11111111-1111-4111-8111-111111111111';

const viewerWithSeededAreaSlugs: Day3NeighborhoodContext = {
  profileId: '8b569954-ff71-46ff-bd61-ae33def50917',
  neighborhoodId: 'east-legon',
  clusterId: 'accra-east',
  regionId: 'greater-accra',
  isVerifiedNeighborhoodMember: true,
};

const liveBroadcasts: SupabaseAgencyBroadcastRow[] = [
  {
    id: '55555555-5555-4555-8555-555555555551',
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
    id: '55555555-5555-4555-8555-555555555552',
    agency_name: 'Ghana Water Help Desk',
    title: 'Accra East water pressure update',
    body: 'Temporary low pressure is expected in parts of Accra East.',
    scope: 'immediate_cluster',
    neighborhood_id: liveEastLegonNeighborhoodId,
    cluster_id: liveAccraEastClusterId,
    region_id: 'greater-accra',
    is_agency_approved: true,
    moderation_status: 'clean',
    published_at: '2026-07-26T12:00:00.000Z',
  },
  {
    id: '55555555-5555-4555-8555-555555555553',
    agency_name: 'Blocked Desk',
    title: 'Blocked notice',
    body: 'Blocked agency broadcast should not appear.',
    scope: 'immediate_cluster',
    cluster_id: liveAccraEastClusterId,
    region_id: 'greater-accra',
    is_agency_approved: true,
    moderation_status: 'blocked',
    published_at: '2026-07-26T12:00:00.000Z',
  },
  {
    id: '55555555-5555-4555-8555-555555555554',
    agency_name: 'Unverified Desk',
    title: 'Unapproved regional notice',
    body: 'This should not appear until agency approval is complete.',
    scope: 'greater_accra',
    region_id: 'greater-accra',
    is_agency_approved: false,
    moderation_status: 'clean',
    published_at: '2026-07-26T12:00:00.000Z',
  },
];

type MockRows = Partial<Record<SupabaseCommunityReadTableName, unknown[]>>;

function createMockSupabaseReadClient(rows: MockRows): { client: SupabaseCommunityReadClient; calls: string[] } {
  const calls: string[] = [];

  return {
    calls,
    client: {
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
    },
  };
}

describe('Day 19 Supabase broadcast and moderation read mapping', () => {
  it('renders RLS-visible live UUID cluster broadcasts without comparing them to seeded slugs', () => {
    const broadcasts = buildAgencyBroadcastsFromSupabaseRows(liveBroadcasts, viewerWithSeededAreaSlugs);

    expect(broadcasts.map((broadcast) => broadcast.title)).toEqual([
      'East Legon road works notice',
      'Accra East water pressure update',
    ]);
  });

  it('keeps approval, blocked-content, and verified-viewer checks for live broadcasts', () => {
    expect(
      buildAgencyBroadcastsFromSupabaseRows(liveBroadcasts, {
        ...viewerWithSeededAreaSlugs,
        isVerifiedNeighborhoodMember: false,
      }),
    ).toEqual([]);

    const broadcasts = buildAgencyBroadcastsFromSupabaseRows(liveBroadcasts, viewerWithSeededAreaSlugs);
    const payload = JSON.stringify(broadcasts);

    expect(payload).not.toContain('Blocked notice');
    expect(payload).not.toContain('Unapproved regional notice');
  });

  it('uses moderation_cases and does not query a missing moderation_decisions table', async () => {
    const { client, calls } = createMockSupabaseReadClient({
      moderation_cases: [],
      social_group_posts: [],
      agency_broadcasts: liveBroadcasts,
    });
    const repository = createSupabaseCommunityActionsReadRepository(client);

    await expect(
      repository.listModerationCases({ ...viewerWithSeededAreaSlugs, profileId: 'profile-moderator' }),
    ).resolves.toEqual([]);
    expect(calls).toEqual(['moderation_cases', 'social_group_posts', 'agency_broadcasts']);
    expect(calls).not.toContain('moderation_decisions');
  });

  it('does not expose private address or contact fields in live broadcast read models', () => {
    const broadcasts = buildAgencyBroadcastsFromSupabaseRows(liveBroadcasts, viewerWithSeededAreaSlugs);
    const payload = JSON.stringify(broadcasts).toLowerCase();

    expect(payload).not.toContain('phone');
    expect(payload).not.toContain('email');
    expect(payload).not.toContain('gps');
    expect(payload).not.toContain('ghana_post');
    expect(payload).not.toContain('ghanapost');
    expect(payload).not.toContain('exact_address');
    expect(payload).not.toContain('street address');
    expect(payload).not.toContain('house number');
  });
});
