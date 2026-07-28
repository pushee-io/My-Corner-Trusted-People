import {
  fromSupabaseAgencyBroadcastRow,
  fromSupabaseSocialGroupRow,
  type SupabaseAgencyBroadcastRow,
  type SupabaseSocialGroupRow,
} from '@/lib/community-actions-supabase-adapter';
import type { SocialGroupScreenSection } from '@/lib/day3-community-repository';
import type {
  AgencyBroadcast,
  CommunityReport,
  Day3NeighborhoodContext,
  Day5ModerationCase,
  Day5ModerationDecision,
  SocialGroup,
  SocialGroupMembership,
  SocialGroupMembershipStatus,
  SocialGroupPost,
} from '@/types/day3';

export type SupabaseSocialGroupMembershipRow = {
  id: string;
  group_id: string;
  profile_id: string;
  role: SocialGroupMembership['role'];
  status: SocialGroupMembership['status'];
  joined_at?: string;
};

export type SupabaseSocialGroupPostRow = {
  id: string;
  group_id: string;
  author_profile_id: string;
  body: string;
  created_at: string;
  moderation_status: SocialGroupPost['moderationStatus'];
};

export type SupabaseCommunityReportRow = {
  id: string;
  target_type: CommunityReport['targetType'];
  target_id: string;
  reporter_profile_id: string;
  reason: string;
  created_at: string;
};

export type SupabaseModerationCaseRow = {
  id: string;
  source_table: string;
  source_id: string;
  reason: string;
  status: string;
  created_at: string;
  resolved_by?: string;
  resolution_action?: string;
  resolved_at?: string;
};

export type SupabaseSocialGroupScreenRows = {
  groups: SupabaseSocialGroupRow[];
  memberships: SupabaseSocialGroupMembershipRow[];
  posts: SupabaseSocialGroupPostRow[];
};

export type SupabaseModerationCaseRows = {
  moderationCases: SupabaseModerationCaseRow[];
  groupPosts: SupabaseSocialGroupPostRow[];
  agencyBroadcasts: SupabaseAgencyBroadcastRow[];
};

export function fromSupabaseSocialGroupMembershipRow(row: SupabaseSocialGroupMembershipRow): SocialGroupMembership {
  return {
    id: row.id,
    groupId: row.group_id,
    profileId: row.profile_id,
    role: row.role,
    status: row.status,
    joinedAt: row.joined_at,
  };
}

export function fromSupabaseSocialGroupPostRow(row: SupabaseSocialGroupPostRow): SocialGroupPost {
  return {
    id: row.id,
    groupId: row.group_id,
    authorProfileId: row.author_profile_id,
    body: row.body,
    createdAt: row.created_at,
    moderationStatus: row.moderation_status,
  };
}

export function fromSupabaseCommunityReportRow(row: SupabaseCommunityReportRow): CommunityReport {
  return {
    id: row.id,
    targetType: row.target_type,
    targetId: row.target_id,
    reporterProfileId: row.reporter_profile_id,
    reason: row.reason,
    createdAt: row.created_at,
  };
}

export function canViewSupabaseSocialGroup(group: SocialGroup, viewer: Day3NeighborhoodContext): boolean {
  if (!viewer.isVerifiedNeighborhoodMember || group.moderationStatus === 'blocked') {
    return false;
  }

  if (usesLiveSupabaseAreaIds(group.neighborhoodId, group.clusterId)) {
    return true;
  }

  if (group.visibility === 'verified_neighborhood_members') {
    return group.neighborhoodId === viewer.neighborhoodId;
  }

  return group.clusterId === viewer.clusterId;
}

export function canViewSupabaseAgencyBroadcast(broadcast: AgencyBroadcast, viewer: Day3NeighborhoodContext): boolean {
  if (!viewer.isVerifiedNeighborhoodMember || !broadcast.isAgencyApproved || broadcast.moderationStatus === 'blocked') {
    return false;
  }

  if (broadcast.scope === 'greater_accra') {
    return broadcast.regionId === viewer.regionId;
  }

  if (broadcast.scope === 'immediate_cluster') {
    if (usesLiveSupabaseAreaIds(broadcast.neighborhoodId, broadcast.clusterId)) {
      return true;
    }

    return broadcast.clusterId === viewer.clusterId;
  }

  if (usesLiveSupabaseAreaIds(broadcast.neighborhoodId, broadcast.clusterId)) {
    return true;
  }

  return broadcast.neighborhoodId === viewer.neighborhoodId;
}

export function buildSocialGroupScreenSectionsFromSupabaseRows(
  rows: SupabaseSocialGroupScreenRows,
  viewer: Day3NeighborhoodContext,
): SocialGroupScreenSection[] {
  if (!viewer.isVerifiedNeighborhoodMember) {
    return [];
  }

  const memberships = rows.memberships.map(fromSupabaseSocialGroupMembershipRow);
  const posts = rows.posts.map(fromSupabaseSocialGroupPostRow);

  return rows.groups
    .map(fromSupabaseSocialGroupRow)
    .filter((group) => canViewSupabaseSocialGroup(group, viewer))
    .map((group) => {
      const membershipStatus = getSupabaseMembershipStatus(group.id, viewer.profileId, memberships);
      const canReadPosts = membershipStatus === 'accepted';

      return {
        group,
        membershipStatus,
        posts: canReadPosts
          ? posts.filter((post) => post.groupId === group.id && post.moderationStatus !== 'blocked')
          : [],
      };
    });
}

export function buildAgencyBroadcastsFromSupabaseRows(
  rows: SupabaseAgencyBroadcastRow[],
  viewer: Day3NeighborhoodContext,
): AgencyBroadcast[] {
  return rows
    .map(fromSupabaseAgencyBroadcastRow)
    .filter((broadcast) => canViewSupabaseAgencyBroadcast(broadcast, viewer));
}

export function buildDay5ModerationCasesFromSupabaseRows(
  rows: SupabaseModerationCaseRows,
  viewer: Day3NeighborhoodContext,
  moderatorProfileIds = new Set<string>(['profile-moderator']),
): Day5ModerationCase[] {
  if (!moderatorProfileIds.has(viewer.profileId)) {
    return [];
  }

  const groupPosts = rows.groupPosts.map(fromSupabaseSocialGroupPostRow);
  const agencyBroadcasts = rows.agencyBroadcasts.map(fromSupabaseAgencyBroadcastRow);

  return rows.moderationCases.map((moderationCase) => {
    const targetType = getModerationCaseTargetType(moderationCase.source_table);
    const target = getModerationTargetSummary(targetType, moderationCase.source_id, groupPosts, agencyBroadcasts);
    const decision = getModerationCaseDecision(moderationCase.resolution_action);

    return {
      id: moderationCase.id,
      reportId: moderationCase.id,
      targetType,
      targetId: moderationCase.source_id,
      targetTitle: target.title,
      targetBody: target.body,
      reporterProfileId: 'unknown',
      reportReason: moderationCase.reason,
      status: moderationCase.status === 'resolved' || moderationCase.resolved_at ? 'resolved' : 'open',
      createdAt: moderationCase.created_at,
      resolvedAt: moderationCase.resolved_at,
      resolvedByProfileId: moderationCase.resolved_by,
      decision,
    };
  });
}

function getSupabaseMembershipStatus(
  groupId: string,
  profileId: string,
  memberships: SocialGroupMembership[],
): SocialGroupMembershipStatus {
  return (
    memberships.find((membership) => membership.groupId === groupId && membership.profileId === profileId)?.status ??
    'none'
  );
}

function getModerationTargetSummary(
  targetType: Day5ModerationCase['targetType'],
  targetId: string,
  groupPosts: SocialGroupPost[],
  agencyBroadcasts: AgencyBroadcast[],
): { title: string; body: string } {
  if (targetType === 'agency_broadcast') {
    const broadcast = agencyBroadcasts.find((item) => item.id === targetId);

    return {
      title: broadcast?.title ?? 'Agency broadcast unavailable',
      body: broadcast?.body ?? 'The reported broadcast is no longer available.',
    };
  }

  const post = groupPosts.find((item) => item.id === targetId);

  return {
    title: 'Social group post',
    body: post?.body ?? 'The reported group post is no longer available.',
  };
}

function getModerationCaseTargetType(sourceTable: string): Day5ModerationCase['targetType'] {
  return sourceTable === 'agency_broadcasts' || sourceTable === 'agency_broadcast' ? 'agency_broadcast' : 'social_group_post';
}

function getModerationCaseDecision(resolutionAction: string | undefined): Day5ModerationDecision | undefined {
  if (resolutionAction === 'hide_content' || resolutionAction === 'keep_content') {
    return resolutionAction;
  }

  return undefined;
}

function usesLiveSupabaseAreaIds(neighborhoodId: string | undefined, clusterId: string | undefined): boolean {
  return Boolean((neighborhoodId && isUuid(neighborhoodId)) || (clusterId && isUuid(clusterId)));
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
