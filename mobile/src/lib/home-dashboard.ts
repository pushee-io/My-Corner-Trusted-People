import { getCurrentCapabilities } from '@/lib/capabilities';
import { getCurrentNeighborhood, listNeighborhoodFeedPosts } from '@/lib/community-repository';
import { getCommunityActionsReadRepository } from '@/lib/community-actions-repository';
import { getMarketplaceNeighborhood, listMarketplaceListings } from '@/lib/marketplace-repository';
import { listMedia } from '@/lib/media-repository';
import { loadNotifications } from '@/lib/messaging';
import type { DisplayMedia } from '@/lib/media-contract';

export async function loadHomeFeed() {
  const neighborhood = await getCurrentNeighborhood();
  const posts = await listNeighborhoodFeedPosts(neighborhood.id, undefined, 1);
  const post = posts[0];
  const media = post ? await listMedia('neighborhood_post', [post.id]).catch(() => []) : [];
  return { post, media: media.find((item) => item.media_type === 'image' || item.posterUrl) };
}

export async function loadHomeMarketplace() {
  const neighborhood = await getMarketplaceNeighborhood();
  return listMarketplaceListings(neighborhood.id, 6);
}

export async function loadHomeBroadcast() {
  const repository = getCommunityActionsReadRepository();
  // Never let the legacy development fallback become a real Home announcement.
  if (repository.mode !== 'supabase') throw new Error('Live broadcasts unavailable');
  const viewer = await getCurrentCapabilities();
  if (!viewer.community || !viewer.neighborhoodId) return undefined;
  const broadcasts = await repository.listAgencyBroadcasts({
    profileId: viewer.profileId,
    neighborhoodId: viewer.neighborhoodId,
    clusterId: viewer.clusterId ?? '',
    regionId: 'greater-accra',
    isVerifiedNeighborhoodMember: viewer.community,
  });
  return broadcasts
    .filter(
      (item) =>
        item.isAgencyApproved &&
        item.moderationStatus !== 'blocked' &&
        Date.parse(item.publishedAt) <= Date.now() &&
        (!item.expiresAt || Date.parse(item.expiresAt) > Date.now()),
    )
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))[0];
}

export async function loadHomeNotificationCount() {
  const notifications = await loadNotifications();
  return notifications.filter((item) => !item.readAt).length;
}

export function previewImage(media?: DisplayMedia) {
  if (!media || media.expiresAt <= Date.now()) return undefined;
  return media.posterUrl ?? (media.media_type === 'image' ? media.url : undefined);
}
