export type CommunityContentType =
  | 'ordinary_post'
  | 'marketplace_listing'
  | 'recommendation'
  | 'group'
  | 'agency_broadcast'
  | 'private_message'
  | 'community_review';

export type VisibilityScope = 'verified_neighborhood' | 'immediate_cluster' | 'greater_accra';

export type CommunityItem = {
  id: string;
  type: CommunityContentType;
  title: string;
  body: string;
  neighborhoodId: string;
  clusterId: string;
  visibilityScope: VisibilityScope;
  isAgencyApproved: boolean;
  isRegionalOptIn: boolean;
};

export const allowedImmediateClusterContentTypes: CommunityContentType[] = [
  'marketplace_listing',
  'recommendation',
  'group',
  'agency_broadcast',
  'community_review',
];

const currentNeighborhoodId = 'east-legon';
const currentClusterId = 'accra-east';

const communityItems: CommunityItem[] = [
  {
    id: 'post-001',
    type: 'ordinary_post',
    title: 'Water pressure around Lagos Avenue',
    body: 'Has anyone else had low water pressure this morning?',
    neighborhoodId: 'east-legon',
    clusterId: 'accra-east',
    visibilityScope: 'verified_neighborhood',
    isAgencyApproved: false,
    isRegionalOptIn: false,
  },
  {
    id: 'post-002',
    type: 'ordinary_post',
    title: 'Osu streetlight outage',
    body: 'Streetlights near the junction were out last night.',
    neighborhoodId: 'osu',
    clusterId: 'accra-central',
    visibilityScope: 'verified_neighborhood',
    isAgencyApproved: false,
    isRegionalOptIn: false,
  },
  {
    id: 'cluster-001',
    type: 'recommendation',
    title: 'Reliable fridge technician near East Legon',
    body: 'Two neighbors recommended a technician around East Legon and Adjiriganor.',
    neighborhoodId: 'east-legon',
    clusterId: 'accra-east',
    visibilityScope: 'immediate_cluster',
    isAgencyApproved: false,
    isRegionalOptIn: false,
  },
  {
    id: 'broadcast-001',
    type: 'agency_broadcast',
    title: 'Planned sanitation pickup notice',
    body: 'Approved agency broadcast for selected Accra neighborhoods.',
    neighborhoodId: 'east-legon',
    clusterId: 'accra-east',
    visibilityScope: 'greater_accra',
    isAgencyApproved: true,
    isRegionalOptIn: true,
  },
];

export function canViewCommunityItem(
  item: Pick<
    CommunityItem,
    'type' | 'visibilityScope' | 'neighborhoodId' | 'clusterId' | 'isAgencyApproved' | 'isRegionalOptIn'
  >,
  viewerNeighborhoodId = currentNeighborhoodId,
  viewerClusterId = currentClusterId,
): boolean {
  if (item.visibilityScope === 'verified_neighborhood') {
    return item.neighborhoodId === viewerNeighborhoodId;
  }

  if (item.visibilityScope === 'immediate_cluster') {
    return item.clusterId === viewerClusterId && allowedImmediateClusterContentTypes.includes(item.type);
  }

  return item.type !== 'ordinary_post' && (item.isAgencyApproved || item.isRegionalOptIn);
}

export function listLocalPosts(): CommunityItem[] {
  return communityItems.filter((item) => item.type === 'ordinary_post' && canViewCommunityItem(item));
}

export function listGreaterAccraFeed(): CommunityItem[] {
  return communityItems.filter((item) => item.visibilityScope === 'greater_accra' && canViewCommunityItem(item));
}

export function listAgencyBroadcasts(): CommunityItem[] {
  return communityItems.filter((item) => item.type === 'agency_broadcast' && item.isAgencyApproved);
}

export function createLocalPost(input: { title: string; body: string }): CommunityItem {
  const post: CommunityItem = {
    id: `post-${communityItems.length + 101}`,
    type: 'ordinary_post',
    title: input.title,
    body: input.body,
    neighborhoodId: currentNeighborhoodId,
    clusterId: currentClusterId,
    visibilityScope: 'verified_neighborhood',
    isAgencyApproved: false,
    isRegionalOptIn: false,
  };

  communityItems.unshift(post);
  return post;
}
