import type {
  AgencyBroadcast,
  CreateSocialGroupPostInput,
  Day3NeighborhoodContext,
  SocialGroup,
  SocialGroupMembership,
  SocialGroupPost,
} from '@/types/day3';

const nowIso = '2026-07-26T12:00:00.000Z';

export const defaultDay3NeighborhoodContext: Day3NeighborhoodContext = {
  profileId: 'profile-akosua',
  neighborhoodId: 'east-legon',
  clusterId: 'accra-east',
  regionId: 'greater-accra',
  isVerifiedNeighborhoodMember: true,
};

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

const socialGroupMemberships: SocialGroupMembership[] = [
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

const agencyBroadcasts: AgencyBroadcast[] = [
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

export type SocialGroupScreenSection = {
  group: SocialGroup;
  posts: SocialGroupPost[];
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

export function isAcceptedSocialGroupMember(groupId: string, profileId: string): boolean {
  return socialGroupMemberships.some(
    (membership) =>
      membership.groupId === groupId && membership.profileId === profileId && membership.status === 'accepted',
  );
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
  const group = socialGroups.find((item) => item.id === input.groupId);

  if (!group || group.moderationStatus === 'blocked' || !isAcceptedSocialGroupMember(input.groupId, input.profileId)) {
    return undefined;
  }

  const post: SocialGroupPost = {
    id: `group-post-${socialGroupPosts.length + 1}`,
    groupId: input.groupId,
    authorProfileId: input.profileId,
    body: input.body.trim(),
    createdAt: new Date().toISOString(),
    moderationStatus: 'not_run',
  };

  socialGroupPosts.unshift(post);
  return post;
}

export function resetDay3CommunityRepositoryForTests() {
  socialGroupPosts = [...initialSocialGroupPosts];
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

export function getSocialGroupScreenSections(
  viewer: Day3NeighborhoodContext = defaultDay3NeighborhoodContext,
): SocialGroupScreenSection[] {
  return listVisibleSocialGroups(viewer).map((group) => ({
    group,
    posts: listSocialGroupPosts(group.id, viewer),
  }));
}

export function getAgencyBroadcastScreenItems(
  viewer: Day3NeighborhoodContext = defaultDay3NeighborhoodContext,
): AgencyBroadcast[] {
  return listAgencyBroadcastsForViewer(viewer);
}