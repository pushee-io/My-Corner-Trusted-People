import {
  buildAgencyBroadcastsFromSupabaseRows,
  buildDay5ModerationCasesFromSupabaseRows,
  buildSocialGroupScreenSectionsFromSupabaseRows,
  fromSupabaseCommunityReportRow,
  fromSupabaseSocialGroupMembershipRow,
  fromSupabaseSocialGroupPostRow,
} from '@/lib/community-actions-supabase-read-model';
import type { SupabaseAgencyBroadcastRow, SupabaseSocialGroupRow } from '@/lib/community-actions-supabase-adapter';
import type {
  SupabaseCommunityReportRow,
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

const groups: SupabaseSocialGroupRow[] = [
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
    id: 'group-accra-east-water',
    name: 'Accra East water updates',
    description: 'Cluster group for verified residents comparing local utility updates.',
    neighborhood_id: 'east-legon',
    cluster_id: 'accra-east',
    visibility: 'immediate_cluster_members',
    member_count: 71,
    created_by_profile_id: 'profile-ama',
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
  {
    id: 'group-hidden-spam',
    name: 'Hidden spam group',
    description: 'Blocked content should not be visible.',
    neighborhood_id: 'east-legon',
    cluster_id: 'accra-east',
    visibility: 'verified_neighborhood_members',
    member_count: 2,
    created_by_profile_id: 'profile-spam',
    created_at: '2026-07-26T12:00:00.000Z',
    moderation_status: 'blocked',
  },
];

const memberships: SupabaseSocialGroupMembershipRow[] = [
  {
    id: 'membership-east-legon-repairs-akosua',
    group_id: 'group-east-legon-repairs',
    profile_id: 'profile-akosua',
    role: 'member',
    status: 'accepted',
    joined_at: '2026-07-26T12:00:00.000Z',
  },
  {
    id: 'membership-accra-east-water-akosua',
    group_id: 'group-accra-east-water',
    profile_id: 'profile-akosua',
    role: 'member',
    status: 'pending',
  },
];

const posts: SupabaseSocialGroupPostRow[] = [
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
  {
    id: 'group-post-water',
    group_id: 'group-accra-east-water',
    author_profile_id: 'profile-ama',
    body: 'Water pressure is low today.',
    created_at: '2026-07-26T12:00:00.000Z',
    moderation_status: 'clean',
  },
];

const broadcasts: SupabaseAgencyBroadcastRow[] = [
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
    id: 'broadcast-water-cluster',
    agency_name: 'Ghana Water Help Desk',
    title: 'Accra East water pressure update',
    body: 'Temporary low pressure is expected in parts of Accra East.',
    scope: 'immediate_cluster',
    cluster_id: 'accra-east',
    region_id: 'greater-accra',
    is_agency_approved: true,
    moderation_status: 'clean',
    published_at: '2026-07-26T12:00:00.000Z',
  },
  {
    id: 'broadcast-unapproved-regional',
    agency_name: 'Unverified Desk',
    title: 'Unapproved regional notice',
    body: 'This should not appear until agency approval is complete.',
    scope: 'greater_accra',
    region_id: 'greater-accra',
    is_agency_approved: false,
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

const reports: SupabaseCommunityReportRow[] = [
  {
    id: 'community-report-1',
    target_type: 'social_group_post',
    target_id: 'group-post-repair-tip',
    reporter_profile_id: 'profile-akosua',
    reason: 'Needs moderator review',
    created_at: '2026-07-27T12:00:00.000Z',
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

describe('Day 8 community actions Supabase reads', () => {
  it('maps individual Supabase rows into app contracts', () => {
    expect(fromSupabaseSocialGroupMembershipRow(memberships[0])).toEqual({
      id: 'membership-east-legon-repairs-akosua',
      groupId: 'group-east-legon-repairs',
      profileId: 'profile-akosua',
      role: 'member',
      status: 'accepted',
      joinedAt: '2026-07-26T12:00:00.000Z',
    });

    expect(fromSupabaseSocialGroupPostRow(posts[0])).toEqual({
      id: 'group-post-repair-tip',
      groupId: 'group-east-legon-repairs',
      authorProfileId: 'profile-akosua',
      body: 'Please share electrician recommendations that have helped in East Legon.',
      createdAt: '2026-07-26T12:00:00.000Z',
      moderationStatus: 'clean',
    });

    expect(fromSupabaseCommunityReportRow(reports[0])).toEqual({
      id: 'community-report-1',
      targetType: 'social_group_post',
      targetId: 'group-post-repair-tip',
      reporterProfileId: 'profile-akosua',
      reason: 'Needs moderator review',
      createdAt: '2026-07-27T12:00:00.000Z',
    });
  });

  it('builds group screen sections using neighborhood, cluster, membership, and moderation rules', () => {
    const sections = buildSocialGroupScreenSectionsFromSupabaseRows({ groups, memberships, posts }, viewer);

    expect(sections.map((section) => section.group.id)).toEqual(['group-east-legon-repairs', 'group-accra-east-water']);
    expect(sections.map((section) => section.membershipStatus)).toEqual(['accepted', 'pending']);
    expect(sections[0].posts.map((post) => post.id)).toEqual(['group-post-repair-tip']);
    expect(sections[1].posts).toEqual([]);
  });

  it('locks group screen sections for unverified viewers', () => {
    expect(
      buildSocialGroupScreenSectionsFromSupabaseRows(
        { groups, memberships, posts },
        { ...viewer, isVerifiedNeighborhoodMember: false },
      ),
    ).toEqual([]);
  });

  it('builds agency broadcast screen items using approval, area, and moderation rules', () => {
    expect(buildAgencyBroadcastsFromSupabaseRows(broadcasts, viewer).map((broadcast) => broadcast.id)).toEqual([
      'broadcast-road-works-approved',
      'broadcast-water-cluster',
    ]);
  });

  it('builds moderation cases from live moderation case rows for moderators only', () => {
    expect(
      buildDay5ModerationCasesFromSupabaseRows(
        { moderationCases, groupPosts: posts, agencyBroadcasts: broadcasts },
        viewer,
      ),
    ).toEqual([]);

    const cases = buildDay5ModerationCasesFromSupabaseRows(
      { moderationCases, groupPosts: posts, agencyBroadcasts: broadcasts },
      moderator,
    );

    expect(cases).toHaveLength(2);
    expect(cases[0]).toMatchObject({
      id: 'moderation-case-community-report-1',
      targetType: 'social_group_post',
      targetId: 'group-post-repair-tip',
      targetTitle: 'Social group post',
      targetBody: 'Please share electrician recommendations that have helped in East Legon.',
      status: 'open',
    });
    expect(cases[1]).toMatchObject({
      id: 'moderation-case-community-report-2',
      targetType: 'agency_broadcast',
      targetId: 'broadcast-road-works-approved',
      targetTitle: 'East Legon road works notice',
      status: 'resolved',
      decision: 'hide_content',
      resolvedByProfileId: 'profile-moderator',
    });
  });

  it('keeps private address and contact fields out of screen read models', () => {
    const sections = buildSocialGroupScreenSectionsFromSupabaseRows({ groups, memberships, posts }, viewer);
    const agencyItems = buildAgencyBroadcastsFromSupabaseRows(broadcasts, viewer);
    const cases = buildDay5ModerationCasesFromSupabaseRows(
      { moderationCases: [], groupPosts: posts, agencyBroadcasts: broadcasts },
      moderator,
    );
    const payload = JSON.stringify({ sections, agencyItems, cases }).toLowerCase();

    expect(payload).not.toContain('phone');
    expect(payload).not.toContain('email');
    expect(payload).not.toContain('gps');
    expect(payload).not.toContain('ghana_post');
    expect(payload).not.toContain('ghanapost');
    expect(payload).not.toContain('exact_address');
    expect(payload).not.toContain('exactaddress');
    expect(payload).not.toContain('street address');
    expect(payload).not.toContain('house number');
  });
});
