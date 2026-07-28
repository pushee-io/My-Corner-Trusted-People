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

export type SupabaseModerationDecisionRow = {
  moderation_case_id: string;
  report_id: string;
  target_type: Day5ModerationCase['targetType'];
  target_id: string;
  decision: Day5ModerationDecision;
  resolved_by_profile_id: string;
  resolved_at: string;
};

export type SupabaseSocialGroupScreenRows = {
  groups: SupabaseSocialGroupRow[];
  memberships: SupabaseSocialGroupMembershipRow[];
  posts: SupabaseSocialGroupPostRow[];
};

export type SupabaseModerationCaseRows = {
  reports: SupabaseCommunityReportRow[];
  decisions: SupabaseModerationDecisionRow[];
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

  if (usesLiveSupabaseAreaIds(group)) {
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
    return broadcast.clusterId === viewer.clusterId;
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

  return rows.reports.map((reportRow) => {
    const report = fromSupabaseCommunityReportRow(reportRow);
    const caseId = `moderation-case-${report.id}`;
    const decision = rows.decisions.find((item) => item.moderation_case_id === caseId || item.report_id === report.id);
    const target = getModerationTargetSummary(report, groupPosts, agencyBroadcasts);

    return {
      id: caseId,
      reportId: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      targetTitle: target.title,
      targetBody: target.body,
      reporterProfileId: report.reporterProfileId,
      reportReason: report.reason,
      status: decision ? 'resolved' : 'open',
      createdAt: report.createdAt,
      resolvedAt: decision?.resolved_at,
      resolvedByProfileId: decision?.resolved_by_profile_id,
      decision: decision?.decision,
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
  report: CommunityReport,
  groupPosts: SocialGroupPost[],
  agencyBroadcasts: AgencyBroadcast[],
): { title: string; body: string } {
  if (report.targetType === 'agency_broadcast') {
    const broadcast = agencyBroadcasts.find((item) => item.id === report.targetId);

    return {
      title: broadcast?.title ?? 'Agency broadcast unavailable',
      body: broadcast?.body ?? 'The reported broadcast is no longer available.',
    };
  }

  const post = groupPosts.find((item) => item.id === report.targetId);

  return {
    title: 'Social group post',
    body: post?.body ?? 'The reported group post is no longer available.',
  };
}

function usesLiveSupabaseAreaIds(group: SocialGroup): boolean {
  return isUuid(group.neighborhoodId) || (group.clusterId ? isUuid(group.clusterId) : false);
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
