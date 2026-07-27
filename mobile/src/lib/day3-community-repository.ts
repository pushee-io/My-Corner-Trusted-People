import type {
  AgencyBroadcast,
  CommunityReport,
  CommunityReportResult,
  CreateSocialGroupPostInput,
  Day3NeighborhoodContext,
  Day5ModerationActionResult,
  Day5ModerationCase,
  Day5ModerationDecision,
  SocialGroup,
  SocialGroupJoinRequestResult,
  SocialGroupMembership,
  SocialGroupMembershipStatus,
  SocialGroupPost,
  SocialGroupPostActionResult,
} from '@/types/day3';

const nowIso = '2026-07-26T12:00:00.000Z';

export const defaultDay3NeighborhoodContext: Day3NeighborhoodContext = {
  profileId: 'profile-akosua',
  neighborhoodId: 'east-legon',
  clusterId: 'accra-east',
  regionId: 'greater-accra',
  isVerifiedNeighborhoodMember: true,
};

export const moderatorDay5Context: Day3NeighborhoodContext = {
  profileId: 'profile-moderator',
  neighborhoodId: 'east-legon',
  clusterId: 'accra-east',
  regionId: 'greater-accra',
  isVerifiedNeighborhoodMember: true,
};

const moderatorProfileIds = new Set<string>(['profile-moderator']);

const socialGroups: SocialGroup[] = [
  {
    id: 'group-east-legon-repairs',
    name: 'East Legon repair tips',
    description: 'Private neighborhood group for repair tips and provider recommendations.',
    neighborhoodId: 'east-legon',
    clusterId: 'accra-east',
    visibility: 'verified_neighborhood_members',
    memberCount: 24,
    createdByProfileId: 'profile-akosua',
    createdAt: nowIso,
    moderationStatus: 'clean',
  },
  {
    id: 'group-accra-east-water',
    name: 'Accra East water updates',
    description: 'Cluster group for verified residents comparing local utility updates.',
    neighborhoodId: 'east-legon',
    clusterId: 'accra-east',
    visibility: 'immediate_cluster_members',
    memberCount: 71,
    createdByProfileId: 'profile-ama',
    createdAt: nowIso,
    moderationStatus: 'clean',
  },
  {
    id: 'group-osu-traders',
    name: 'Osu local traders',
    description: 'Neighborhood group for Osu trader recommendations.',
    neighborhoodId: 'osu',
    clusterId: 'accra-central',
    visibility: 'verified_neighborhood_members',
    memberCount: 18,
    createdByProfileId: 'profile-kojo',
    createdAt: nowIso,
    moderationStatus: 'clean',
  },
  {
    id: 'group-hidden-spam',
    name: 'Hidden spam group',
    description: 'Blocked content should not be visible.',
    neighborhoodId: 'east-legon',
    clusterId: 'accra-east',
    visibility: 'verified_neighborhood_members',
    memberCount: 2,
    createdByProfileId: 'profile-spam',
    createdAt: nowIso,
    moderationStatus: 'blocked',
  },
];

const initialSocialGroupMemberships: SocialGroupMembership[] = [
  {
    id: 'membership-east-legon-repairs-akosua',
    groupId: 'group-east-legon-repairs',
    profileId: 'profile-akosua',
    role: 'member',
    status: 'accepted',
    joinedAt: nowIso,
  },
  {
    id: 'membership-accra-east-water-akosua',
    groupId: 'group-accra-east-water',
    profileId: 'profile-akosua',
    role: 'member',
    status: 'accepted',
    joinedAt: nowIso,
  },
  {
    id: 'membership-osu-traders-akosua',
    groupId: 'group-osu-traders',
    profileId: 'profile-akosua',
    role: 'member',
    status: 'pending',
  },
];

let socialGroupMemberships = [...initialSocialGroupMemberships];

const initialSocialGroupPosts: SocialGroupPost[] = [
  {
    id: 'group-post-repair-tip',
    groupId: 'group-east-legon-repairs',
    authorProfileId: 'profile-akosua',
    body: 'Please share electrician recommendations that have helped in East Legon.',
    createdAt: nowIso,
    moderationStatus: 'clean',
  },
  {
    id: 'group-post-hidden',
    groupId: 'group-east-legon-repairs',
    authorProfileId: 'profile-spam',
    body: 'Blocked post.',
    createdAt: nowIso,
    moderationStatus: 'blocked',
  },
];

let socialGroupPosts = [...initialSocialGroupPosts];

const initialAgencyBroadcasts: AgencyBroadcast[] = [
  {
    id: 'broadcast-road-works-approved',
    agencyName: 'Accra Roads Desk',
    title: 'East Legon road works notice',
    body: 'Approved maintenance notice for roads around East Legon this weekend.',
    scope: 'greater_accra',
    regionId: 'greater-accra',
    isAgencyApproved: true,
    moderationStatus: 'clean',
    publishedAt: nowIso,
  },
  {
    id: 'broadcast-water-cluster',
    agencyName: 'Ghana Water Help Desk',
    title: 'Accra East water pressure update',
    body: 'Temporary low pressure is expected in parts of Accra East.',
    scope: 'immediate_cluster',
    clusterId: 'accra-east',
    regionId: 'greater-accra',
    isAgencyApproved: true,
    moderationStatus: 'clean',
    publishedAt: nowIso,
  },
  {
    id: 'broadcast-unapproved-regional',
    agencyName: 'Unverified Desk',
    title: 'Unapproved regional notice',
    body: 'This should not appear until agency approval is complete.',
    scope: 'greater_accra',
    regionId: 'greater-accra',
    isAgencyApproved: false,
    moderationStatus: 'clean',
    publishedAt: nowIso,
  },
  {
    id: 'broadcast-blocked-regional',
    agencyName: 'Blocked Desk',
    title: 'Blocked notice',
    body: 'Blocked agency broadcast should not appear.',
    scope: 'greater_accra',
    regionId: 'greater-accra',
    isAgencyApproved: true,
    moderationStatus: 'blocked',
    publishedAt: nowIso,
  },
];

let agencyBroadcasts = [...initialAgencyBroadcasts];

const initialCommunityReports: CommunityReport[] = [];

let communityReports = [...initialCommunityReports];

export type SocialGroupScreenSection = {
  group: SocialGroup;
  posts: SocialGroupPost[];
  membershipStatus: SocialGroupMembershipStatus;
};

export function canViewSocialGroup(group: SocialGroup, viewer: Day3NeighborhoodContext): boolean {
  if (!viewer.isVerifiedNeighborhoodMember || group.moderationStatus === 'blocked') {
    return false;
  }

  if (group.visibility === 'verified_neighborhood_members') {
    return group.neighborhoodId === viewer.neighborhoodId;
  }

  return group.clusterId === viewer.clusterId;
}

export function getSocialGroupMembershipStatus(groupId: string, profileId: string): SocialGroupMembershipStatus {
  return (
    socialGroupMemberships.find((membership) => membership.groupId === groupId && membership.profileId === profileId)
      ?.status ?? 'none'
  );
}

export function isAcceptedSocialGroupMember(groupId: string, profileId: string): boolean {
  return getSocialGroupMembershipStatus(groupId, profileId) === 'accepted';
}

export function requestSocialGroupMembership(
  groupId: string,
  viewer: Day3NeighborhoodContext,
): SocialGroupJoinRequestResult {
  const group = socialGroups.find((item) => item.id === groupId);

  if (!group || !canViewSocialGroup(group, viewer)) {
    return {
      groupId,
      profileId: viewer.profileId,
      status: 'none',
      created: false,
    };
  }

  const existingStatus = getSocialGroupMembershipStatus(groupId, viewer.profileId);

  if (existingStatus !== 'none') {
    return {
      groupId,
      profileId: viewer.profileId,
      status: existingStatus,
      created: false,
    };
  }

  const membership: SocialGroupMembership = {
    id: `membership-${groupId}-${viewer.profileId}`,
    groupId,
    profileId: viewer.profileId,
    role: 'member',
    status: 'pending',
  };

  socialGroupMemberships.push(membership);

  return {
    groupId,
    profileId: viewer.profileId,
    status: 'pending',
    created: true,
  };
}

export function listVisibleSocialGroups(viewer: Day3NeighborhoodContext): SocialGroup[] {
  return socialGroups.filter((group) => canViewSocialGroup(group, viewer));
}

export function listSocialGroupPosts(groupId: string, viewer: Day3NeighborhoodContext): SocialGroupPost[] {
  const group = socialGroups.find((item) => item.id === groupId);

  if (!group || !canViewSocialGroup(group, viewer) || !isAcceptedSocialGroupMember(groupId, viewer.profileId)) {
    return [];
  }

  return socialGroupPosts.filter((post) => post.groupId === groupId && post.moderationStatus !== 'blocked');
}

export function createSocialGroupPost(input: CreateSocialGroupPostInput): SocialGroupPost | undefined {
  return createSocialGroupPostAction(input).post;
}

export function createSocialGroupPostAction(input: CreateSocialGroupPostInput): SocialGroupPostActionResult {
  const body = input.body.trim();
  const group = socialGroups.find((item) => item.id === input.groupId);

  if (!body) {
    return {
      accepted: false,
      reason: 'empty_body',
    };
  }

  if (!group || group.moderationStatus === 'blocked') {
    return {
      accepted: false,
      reason: 'not_visible',
    };
  }

  if (!isAcceptedSocialGroupMember(input.groupId, input.profileId)) {
    return {
      accepted: false,
      reason: 'not_accepted_member',
    };
  }

  const post: SocialGroupPost = {
    id: `group-post-${socialGroupPosts.length + 1}`,
    groupId: input.groupId,
    authorProfileId: input.profileId,
    body,
    createdAt: new Date().toISOString(),
    moderationStatus: 'not_run',
  };

  socialGroupPosts.unshift(post);

  return {
    post,
    accepted: true,
  };
}

export function canViewAgencyBroadcast(broadcast: AgencyBroadcast, viewer: Day3NeighborhoodContext): boolean {
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

export function listAgencyBroadcastsForViewer(viewer: Day3NeighborhoodContext): AgencyBroadcast[] {
  return agencyBroadcasts.filter((broadcast) => canViewAgencyBroadcast(broadcast, viewer));
}

export function reportAgencyBroadcast(
  broadcastId: string,
  viewer: Day3NeighborhoodContext,
  reason = 'Agency broadcast report',
): CommunityReportResult {
  const broadcast = agencyBroadcasts.find((item) => item.id === broadcastId);

  if (!broadcast || !canViewAgencyBroadcast(broadcast, viewer)) {
    return {
      accepted: false,
      reason: 'not_visible',
    };
  }

  return createCommunityReport('agency_broadcast', broadcastId, viewer.profileId, reason);
}

export function reportSocialGroupPost(
  postId: string,
  viewer: Day3NeighborhoodContext,
  reason = 'Social group post report',
): CommunityReportResult {
  const post = socialGroupPosts.find((item) => item.id === postId);

  if (!post || post.moderationStatus === 'blocked') {
    return {
      accepted: false,
      reason: 'not_visible',
    };
  }

  if (!listSocialGroupPosts(post.groupId, viewer).some((visiblePost) => visiblePost.id === postId)) {
    return {
      accepted: false,
      reason: 'not_visible',
    };
  }

  return createCommunityReport('social_group_post', postId, viewer.profileId, reason);
}

function createCommunityReport(
  targetType: CommunityReport['targetType'],
  targetId: string,
  reporterProfileId: string,
  reason: string,
): CommunityReportResult {
  const alreadyReported = communityReports.some(
    (report) =>
      report.targetType === targetType &&
      report.targetId === targetId &&
      report.reporterProfileId === reporterProfileId,
  );

  if (alreadyReported) {
    return {
      accepted: false,
      reason: 'already_reported',
    };
  }

  const report: CommunityReport = {
    id: `community-report-${communityReports.length + 1}`,
    targetType,
    targetId,
    reporterProfileId,
    reason,
    createdAt: new Date().toISOString(),
  };

  communityReports.push(report);

  return {
    report,
    accepted: true,
  };
}

export function listDay5ModerationCases(viewer: Day3NeighborhoodContext): Day5ModerationCase[] {
  if (!isDay5Moderator(viewer)) {
    return [];
  }

  return communityReports.map((report) => {
    const target = moderationTargetDetails(report);

    return {
      id: `moderation-case-${report.id}`,
      reportId: report.id,
      targetType: report.targetType,
      targetId: report.targetId,
      targetTitle: target.title,
      targetBody: target.body,
      reporterProfileId: report.reporterProfileId,
      reportReason: report.reason,
      status: target.status,
      createdAt: report.createdAt,
      resolvedAt: target.resolvedAt,
      resolvedByProfileId: target.resolvedByProfileId,
      decision: target.decision,
    };
  });
}

export function applyDay5ModerationDecision(
  caseId: string,
  viewer: Day3NeighborhoodContext,
  decision: Day5ModerationDecision,
): Day5ModerationActionResult {
  if (!isDay5Moderator(viewer)) {
    return {
      accepted: false,
      caseId,
      reason: 'not_moderator',
    };
  }

  const reportId = caseId.replace(/^moderation-case-/, '');
  const report = communityReports.find((item) => item.id === reportId);

  if (!report) {
    return {
      accepted: false,
      caseId,
      reason: 'case_not_found',
    };
  }

  const currentCase = listDay5ModerationCases(viewer).find((item) => item.id === caseId);

  if (currentCase?.status === 'resolved') {
    return {
      accepted: false,
      caseId,
      reason: 'already_resolved',
    };
  }

  resolveModerationTarget(report, viewer.profileId, decision);

  return {
    accepted: true,
    caseId,
    status: 'resolved',
    decision,
  };
}

function isDay5Moderator(viewer: Day3NeighborhoodContext) {
  return moderatorProfileIds.has(viewer.profileId);
}

function moderationTargetDetails(report: CommunityReport): {
  title: string;
  body: string;
  status: 'open' | 'resolved';
  resolvedAt?: string;
  resolvedByProfileId?: string;
  decision?: Day5ModerationDecision;
} {
  if (report.targetType === 'agency_broadcast') {
    const broadcast = agencyBroadcasts.find((item) => item.id === report.targetId);

    return {
      title: broadcast?.title ?? 'Agency broadcast unavailable',
      body: broadcast?.body ?? 'The reported broadcast is no longer available.',
      status: broadcast?.moderationStatus === 'flagged' ? 'resolved' : 'open',
      resolvedAt: broadcast?.moderationStatus === 'flagged' ? nowIso : undefined,
      resolvedByProfileId: broadcast?.moderationStatus === 'flagged' ? 'profile-moderator' : undefined,
      decision: broadcast?.moderationStatus === 'flagged' ? 'keep_content' : undefined,
    };
  }

  const post = socialGroupPosts.find((item) => item.id === report.targetId);

  return {
    title: 'Social group post',
    body: post?.body ?? 'The reported group post is no longer available.',
    status: post?.moderationStatus === 'flagged' ? 'resolved' : 'open',
    resolvedAt: post?.moderationStatus === 'flagged' ? nowIso : undefined,
    resolvedByProfileId: post?.moderationStatus === 'flagged' ? 'profile-moderator' : undefined,
    decision: post?.moderationStatus === 'flagged' ? 'keep_content' : undefined,
  };
}

function resolveModerationTarget(
  report: CommunityReport,
  moderatorProfileId: string,
  decision: Day5ModerationDecision,
) {
  if (report.targetType === 'agency_broadcast') {
    agencyBroadcasts = agencyBroadcasts.map((broadcast) => {
      if (broadcast.id !== report.targetId) return broadcast;

      return {
        ...broadcast,
        moderationStatus: decision === 'hide_content' ? 'blocked' : 'flagged',
      };
    });
    return;
  }

  socialGroupPosts = socialGroupPosts.map((post) => {
    if (post.id !== report.targetId) return post;

    return {
      ...post,
      moderationStatus: decision === 'hide_content' ? 'blocked' : 'flagged',
    };
  });

  void moderatorProfileId;
}

export function getSocialGroupScreenSections(
  viewer: Day3NeighborhoodContext = defaultDay3NeighborhoodContext,
): SocialGroupScreenSection[] {
  return listVisibleSocialGroups(viewer).map((group) => ({
    group,
    posts: listSocialGroupPosts(group.id, viewer),
    membershipStatus: getSocialGroupMembershipStatus(group.id, viewer.profileId),
  }));
}

export function getAgencyBroadcastScreenItems(
  viewer: Day3NeighborhoodContext = defaultDay3NeighborhoodContext,
): AgencyBroadcast[] {
  return listAgencyBroadcastsForViewer(viewer);
}

export function resetDay3CommunityRepositoryForTests() {
  socialGroupMemberships = [...initialSocialGroupMemberships];
  socialGroupPosts = [...initialSocialGroupPosts];
  agencyBroadcasts = [...initialAgencyBroadcasts];
  communityReports = [...initialCommunityReports];
}
