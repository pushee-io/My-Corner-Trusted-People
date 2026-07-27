import type {
  AgencyBroadcast,
  CommunityReport,
  CreateSocialGroupPostInput,
  Day3NeighborhoodContext,
  Day5ModerationCase,
  Day5ModerationDecision,
  SocialGroup,
  SocialGroupMembership,
  SocialGroupPost,
} from '@/types/day3';

export type SupabaseSocialGroupRow = {
  id: string;
  name: string;
  description: string;
  neighborhood_id: string;
  cluster_id: string;
  visibility: SocialGroup['visibility'];
  member_count: number;
  created_by_profile_id: string;
  created_at: string;
  moderation_status: SocialGroup['moderationStatus'];
};

export type SupabaseSocialGroupMembershipInsert = {
  group_id: string;
  profile_id: string;
  role: SocialGroupMembership['role'];
  status: SocialGroupMembership['status'];
};

export type SupabaseSocialGroupPostInsert = {
  group_id: string;
  author_profile_id: string;
  body: string;
  moderation_status: SocialGroupPost['moderationStatus'];
};

export type SupabaseAgencyBroadcastRow = {
  id: string;
  agency_name: string;
  title: string;
  body: string;
  scope: AgencyBroadcast['scope'];
  neighborhood_id?: string;
  cluster_id?: string;
  region_id: 'greater-accra';
  is_agency_approved: boolean;
  moderation_status: AgencyBroadcast['moderationStatus'];
  published_at: string;
};

export type SupabaseCommunityReportInsert = {
  target_type: CommunityReport['targetType'];
  target_id: string;
  reporter_profile_id: string;
  reason: string;
};

export type SupabaseModerationDecisionInsert = {
  moderation_case_id: string;
  report_id: string;
  target_type: Day5ModerationCase['targetType'];
  target_id: string;
  decision: Day5ModerationDecision;
  resolved_by_profile_id: string;
  resolved_at: string;
};

export function fromSupabaseSocialGroupRow(row: SupabaseSocialGroupRow): SocialGroup {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    neighborhoodId: row.neighborhood_id,
    clusterId: row.cluster_id,
    visibility: row.visibility,
    memberCount: row.member_count,
    createdByProfileId: row.created_by_profile_id,
    createdAt: row.created_at,
    moderationStatus: row.moderation_status,
  };
}

export function fromSupabaseAgencyBroadcastRow(row: SupabaseAgencyBroadcastRow): AgencyBroadcast {
  return {
    id: row.id,
    agencyName: row.agency_name,
    title: row.title,
    body: row.body,
    scope: row.scope,
    neighborhoodId: row.neighborhood_id,
    clusterId: row.cluster_id,
    regionId: row.region_id,
    isAgencyApproved: row.is_agency_approved,
    moderationStatus: row.moderation_status,
    publishedAt: row.published_at,
  };
}

export function toSupabaseSocialGroupMembershipRequestInsert(
  groupId: string,
  viewer: Day3NeighborhoodContext,
): SupabaseSocialGroupMembershipInsert {
  return {
    group_id: groupId,
    profile_id: viewer.profileId,
    role: 'member',
    status: 'pending',
  };
}

export function toSupabaseSocialGroupPostInsert(input: CreateSocialGroupPostInput): SupabaseSocialGroupPostInsert {
  return {
    group_id: input.groupId,
    author_profile_id: input.profileId,
    body: input.body.trim(),
    moderation_status: 'not_run',
  };
}

export function toSupabaseCommunityReportInsert(
  targetType: CommunityReport['targetType'],
  targetId: string,
  viewer: Day3NeighborhoodContext,
  reason: string,
): SupabaseCommunityReportInsert {
  return {
    target_type: targetType,
    target_id: targetId,
    reporter_profile_id: viewer.profileId,
    reason,
  };
}

export function toSupabaseModerationDecisionInsert(
  moderationCase: Day5ModerationCase,
  decision: Day5ModerationDecision,
  moderator: Day3NeighborhoodContext,
  resolvedAt = new Date().toISOString(),
): SupabaseModerationDecisionInsert {
  return {
    moderation_case_id: moderationCase.id,
    report_id: moderationCase.reportId,
    target_type: moderationCase.targetType,
    target_id: moderationCase.targetId,
    decision,
    resolved_by_profile_id: moderator.profileId,
    resolved_at: resolvedAt,
  };
}
