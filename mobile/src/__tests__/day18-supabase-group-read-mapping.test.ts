import { buildSocialGroupScreenSectionsFromSupabaseRows } from '@/lib/community-actions-supabase-read-model';
import type { SupabaseSocialGroupRow } from '@/lib/community-actions-supabase-adapter';
import type {
  SupabaseSocialGroupMembershipRow,
  SupabaseSocialGroupPostRow,
} from '@/lib/community-actions-supabase-read-model';
import type { Day3NeighborhoodContext } from '@/types/day3';

const liveAkosuaProfileId = '8b569954-ff71-46ff-bd61-ae33def50917';
const liveEastLegonNeighborhoodId = '90ac8954-e9ca-467f-8a2e-de7eecbd5422';
const liveAccraEastClusterId = '11111111-1111-4111-8111-111111111111';

const viewerWithSeededAreaSlugs: Day3NeighborhoodContext = {
  profileId: liveAkosuaProfileId,
  neighborhoodId: 'east-legon',
  clusterId: 'accra-east',
  regionId: 'greater-accra',
  isVerifiedNeighborhoodMember: true,
};

const liveGroups: SupabaseSocialGroupRow[] = [
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Accra East water updates',
    description: 'Cluster group for verified residents comparing local utility updates.',
    neighborhood_id: liveEastLegonNeighborhoodId,
    cluster_id: liveAccraEastClusterId,
    visibility: 'immediate_cluster_members',
    member_count: 1,
    created_by_profile_id: liveAkosuaProfileId,
    created_at: '2026-07-26T12:00:00.000Z',
    moderation_status: 'clean',
  },
  {
    id: '22222222-2222-4222-8222-222222222221',
    name: 'East Legon repair tips',
    description: 'Private neighborhood group for repair tips and provider recommendations.',
    neighborhood_id: liveEastLegonNeighborhoodId,
    cluster_id: liveAccraEastClusterId,
    visibility: 'verified_neighborhood_members',
    member_count: 1,
    created_by_profile_id: liveAkosuaProfileId,
    created_at: '2026-07-26T12:00:00.000Z',
    moderation_status: 'clean',
  },
];

const liveMemberships: SupabaseSocialGroupMembershipRow[] = [
  {
    id: '33333333-3333-4333-8333-333333333332',
    group_id: '22222222-2222-4222-8222-222222222222',
    profile_id: liveAkosuaProfileId,
    role: 'member',
    status: 'accepted',
    joined_at: '2026-07-26T12:00:00.000Z',
  },
  {
    id: '33333333-3333-4333-8333-333333333331',
    group_id: '22222222-2222-4222-8222-222222222221',
    profile_id: liveAkosuaProfileId,
    role: 'member',
    status: 'accepted',
    joined_at: '2026-07-26T12:00:00.000Z',
  },
];

const livePosts: SupabaseSocialGroupPostRow[] = [
  {
    id: '44444444-4444-4444-8444-444444444441',
    group_id: '22222222-2222-4222-8222-222222222221',
    author_profile_id: liveAkosuaProfileId,
    body: 'Please share electrician recommendations that have helped in East Legon.',
    created_at: '2026-07-26T12:00:00.000Z',
    moderation_status: 'clean',
  },
  {
    id: '44444444-4444-4444-8444-444444444442',
    group_id: '22222222-2222-4222-8222-222222222222',
    author_profile_id: liveAkosuaProfileId,
    body: 'Water pressure is improving around Accra East.',
    created_at: '2026-07-26T12:00:00.000Z',
    moderation_status: 'clean',
  },
];

describe('Day 18 Supabase group read mapping', () => {
  it('renders RLS-visible live UUID groups without comparing them to seeded area slugs', () => {
    const sections = buildSocialGroupScreenSectionsFromSupabaseRows(
      { groups: liveGroups, memberships: liveMemberships, posts: livePosts },
      viewerWithSeededAreaSlugs,
    );

    expect(sections.map((section) => section.group.name)).toEqual([
      'Accra East water updates',
      'East Legon repair tips',
    ]);
    expect(sections.map((section) => section.group.neighborhoodId)).toEqual([
      liveEastLegonNeighborhoodId,
      liveEastLegonNeighborhoodId,
    ]);
  });

  it('derives membership and readable posts from live group_id plus profile_id rows', () => {
    const sections = buildSocialGroupScreenSectionsFromSupabaseRows(
      { groups: liveGroups, memberships: liveMemberships, posts: livePosts },
      viewerWithSeededAreaSlugs,
    );

    expect(sections.map((section) => section.membershipStatus)).toEqual(['accepted', 'accepted']);
    expect(sections.map((section) => section.posts.map((post) => post.body))).toEqual([
      ['Water pressure is improving around Accra East.'],
      ['Please share electrician recommendations that have helped in East Legon.'],
    ]);
  });

  it('still fails closed for unverified viewers and blocked Supabase rows', () => {
    expect(
      buildSocialGroupScreenSectionsFromSupabaseRows(
        { groups: liveGroups, memberships: liveMemberships, posts: livePosts },
        { ...viewerWithSeededAreaSlugs, isVerifiedNeighborhoodMember: false },
      ),
    ).toEqual([]);

    expect(
      buildSocialGroupScreenSectionsFromSupabaseRows(
        {
          groups: [{ ...liveGroups[0], moderation_status: 'blocked' }],
          memberships: liveMemberships,
          posts: livePosts,
        },
        viewerWithSeededAreaSlugs,
      ),
    ).toEqual([]);
  });

  it('does not expose private address or contact fields in mapped group sections', () => {
    const sections = buildSocialGroupScreenSectionsFromSupabaseRows(
      { groups: liveGroups, memberships: liveMemberships, posts: livePosts },
      viewerWithSeededAreaSlugs,
    );
    const payload = JSON.stringify(sections).toLowerCase();

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
