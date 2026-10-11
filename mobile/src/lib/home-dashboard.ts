import { getCurrentCapabilities } from '@/lib/capabilities';
import { getCurrentNeighborhood, listNeighborhoodFeedPosts } from '@/lib/community-repository';
import { getCommunityActionsReadRepository } from '@/lib/community-actions-repository';
import { getMarketplaceNeighborhood, listMarketplaceListings } from '@/lib/marketplace-repository';
import { listMedia } from '@/lib/media-repository';
import { loadNotifications } from '@/lib/messaging';
import { eventsRuntimeRepository } from '@/lib/events-runtime-repository';
import type { DisplayMedia } from '@/lib/media-contract';
import { isActiveOrUpcomingEvent, isEventHappeningNow } from '@/lib/event-lifecycle';

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

export async function loadHomeGroups() {
  const repository = getCommunityActionsReadRepository();
  if (repository.mode !== 'supabase') throw new Error('Live groups unavailable');
  const viewer = await getCurrentCapabilities();
  if (!viewer.community || !viewer.neighborhoodId) return [];
  const sections = await repository.listSocialGroupScreenSections({
    profileId: viewer.profileId,
    neighborhoodId: viewer.neighborhoodId,
    clusterId: viewer.clusterId ?? '',
    regionId: 'greater-accra',
    isVerifiedNeighborhoodMember: viewer.community,
  });
  const groups = sections
    .filter(({ group }) => group.moderationStatus !== 'blocked')
    .sort((a, b) => Date.parse(b.group.createdAt) - Date.parse(a.group.createdAt))
    .slice(0, 2);
  const ids = groups.map(({ group }) => group.id);
  const [covers, avatars] = ids.length
    ? await Promise.all([listMedia('group_cover', ids).catch(() => []), listMedia('group_avatar', ids).catch(() => [])])
    : [[], []];
  // Home needs public group metadata, never posts or other people's membership.
  return groups.map(({ group, membershipStatus }) => ({
    id: group.id,
    name: group.name,
    description: group.description,
    memberCount: group.memberCount,
    isMember: membershipStatus === 'accepted',
    image: firstPreviewImage(covers, group.id) ?? firstPreviewImage(avatars, group.id),
    avatar: firstPreviewImage(avatars, group.id),
  }));
}
export type HomeGroup = Awaited<ReturnType<typeof loadHomeGroups>>[number];

export async function loadHomeEvents() {
  if (eventsRuntimeRepository.mode !== 'supabase') throw new Error('Live events unavailable');
  if (!(await eventsRuntimeRepository.isEnabled())) return { enabled: false, events: [] };
  const events = await eventsRuntimeRepository.listEvents();
  // The legacy offline cache is not scoped to Home's signed-in session. Fail closed.
  if (eventsRuntimeRepository.getDiagnostics().lastReadUsedCache) throw new Error('Live events unavailable');
  const now = Date.now();
  const selected = events
    .filter((event) => isActiveOrUpcomingEvent(event, now))
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .slice(0, 2);
  const media = selected.length
    ? await listMedia(
        'event',
        selected.map((event) => event.id),
      ).catch(() => [])
    : [];
  return {
    enabled: true,
    events: selected.map((event) => ({
      id: event.id,
      title: event.title,
      startsAt: event.startsAt,
      endsAt: event.endsAt,
      timezone: event.timezone,
      areaLabel: event.areaLabel,
      isGoing: event.currentUserRsvpStatus === 'going',
      happeningNow: isEventHappeningNow(event, now),
      image: firstPreviewImage(media, event.id),
    })),
  };
}
export type HomeEvent = Awaited<ReturnType<typeof loadHomeEvents>>['events'][number];

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

/** Prefer the first authorized photo; use an authorized video poster only as fallback. */
export function firstPreviewImage(media: DisplayMedia[], parentId: string) {
  const items = media.filter((item) => item.parent_id === parentId && previewImage(item));
  return previewImage(items.find((item) => item.media_type === 'image') ?? items[0]);
}
