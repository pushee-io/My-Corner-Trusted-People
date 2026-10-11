import {
  loadHomeBroadcast,
  loadHomeGroups,
  loadHomeEvents,
  loadHomeFeed,
  loadHomeMarketplace,
  loadHomeNotificationCount,
  previewImage,
} from '@/lib/home-dashboard';
import { getCurrentCapabilities } from '@/lib/capabilities';
import { getCurrentNeighborhood, listNeighborhoodFeedPosts } from '@/lib/community-repository';
import { getCommunityActionsReadRepository } from '@/lib/community-actions-repository';
import { getMarketplaceNeighborhood, listMarketplaceListings } from '@/lib/marketplace-repository';
import { listMedia } from '@/lib/media-repository';
import { loadNotifications } from '@/lib/messaging';

import { eventsRuntimeRepository } from '@/lib/events-runtime-repository';
jest.mock('@/lib/events-runtime-repository', () => ({
  eventsRuntimeRepository: { mode: 'supabase', isEnabled: jest.fn(), listEvents: jest.fn(), getDiagnostics: jest.fn() },
}));

jest.mock('@/lib/capabilities', () => ({ getCurrentCapabilities: jest.fn() }));
jest.mock('@/lib/community-repository', () => ({
  getCurrentNeighborhood: jest.fn(),
  listNeighborhoodFeedPosts: jest.fn(),
}));
jest.mock('@/lib/community-actions-repository', () => ({ getCommunityActionsReadRepository: jest.fn() }));
jest.mock('@/lib/marketplace-repository', () => ({
  getMarketplaceNeighborhood: jest.fn(),
  listMarketplaceListings: jest.fn(),
}));
jest.mock('@/lib/media-repository', () => ({ listMedia: jest.fn() }));
jest.mock('@/lib/messaging', () => ({ loadNotifications: jest.fn() }));
beforeEach(() => jest.resetAllMocks());
it('bounds Feed to one authorized post and requests media only for its parent', async () => {
  jest.mocked(getCurrentNeighborhood).mockResolvedValue({ id: 'area', name: 'Area' });
  jest.mocked(listNeighborhoodFeedPosts).mockResolvedValue([{ id: 'post', authorName: 'Public name' }] as never);
  jest.mocked(listMedia).mockResolvedValue([]);
  const result = await loadHomeFeed();
  expect(listNeighborhoodFeedPosts).toHaveBeenCalledWith('area', undefined, 1);
  expect(listMedia).toHaveBeenCalledWith('neighborhood_post', ['post']);
  expect(result.post.authorName).toBe('Public name');
  jest.mocked(listMedia).mockRejectedValueOnce(new Error('Media unavailable'));
  expect((await loadHomeFeed()).post.id).toBe('post');
});
it('does not invent a Feed card or fetch media for an empty feed', async () => {
  jest.mocked(getCurrentNeighborhood).mockResolvedValue({ id: 'area', name: 'Area' });
  jest.mocked(listNeighborhoodFeedPosts).mockResolvedValue([]);
  expect((await loadHomeFeed()).post).toBeUndefined();
  expect(listMedia).not.toHaveBeenCalled();
});
it('requires Marketplace neighborhood authorization and bounds listing hydration to six', async () => {
  jest.mocked(getMarketplaceNeighborhood).mockResolvedValue({ id: 'verified-area', name: 'Area' });
  jest.mocked(listMarketplaceListings).mockResolvedValue([]);
  expect(await loadHomeMarketplace()).toEqual([]);
  expect(listMarketplaceListings).toHaveBeenCalledWith('verified-area', 6);
  jest.mocked(getMarketplaceNeighborhood).mockRejectedValueOnce(new Error('Not verified'));
  await expect(loadHomeMarketplace()).rejects.toThrow('Not verified');
  expect(listMarketplaceListings).toHaveBeenCalledTimes(1);
});
it('refuses seeded broadcast fallback', async () => {
  const list = jest.fn();
  jest
    .mocked(getCommunityActionsReadRepository)
    .mockReturnValue({ mode: 'seeded', listAgencyBroadcasts: list } as never);
  await expect(loadHomeBroadcast()).rejects.toThrow('Live broadcasts unavailable');
  expect(list).not.toHaveBeenCalled();
});
it('uses the signed-in viewer, excludes unapproved/expired/future broadcasts and selects newest', async () => {
  jest
    .mocked(getCurrentCapabilities)
    .mockResolvedValue({ community: true, profileId: 'viewer', neighborhoodId: 'area', clusterId: 'cluster' } as never);
  const current = { id: 'new', publishedAt: '2026-01-02', isAgencyApproved: true, moderationStatus: 'clean' };
  const list = jest.fn(async () => [
    { ...current, id: 'old', publishedAt: '2026-01-01' },
    current,
    { ...current, id: 'unapproved', isAgencyApproved: false },
    { ...current, id: 'blocked', moderationStatus: 'blocked' },
    { ...current, id: 'expired', expiresAt: '2020-01-01' },
    { ...current, id: 'future', publishedAt: '2099-01-01' },
  ]);
  jest
    .mocked(getCommunityActionsReadRepository)
    .mockReturnValue({ mode: 'supabase', listAgencyBroadcasts: list } as never);
  expect((await loadHomeBroadcast())?.id).toBe('new');
  expect(list).toHaveBeenCalledWith(
    expect.objectContaining({ profileId: 'viewer', neighborhoodId: 'area', clusterId: 'cluster' }),
  );
  jest.mocked(getCurrentCapabilities).mockResolvedValue({ community: false } as never);
  expect(await loadHomeBroadcast()).toBeUndefined();
  expect(list).toHaveBeenCalledTimes(1);
});
it('counts only unread returned notifications and does not fabricate a count on failure', async () => {
  jest.mocked(loadNotifications).mockResolvedValue([{ id: 'a' }, { id: 'b', readAt: '2026-01-01' }] as never);
  expect(await loadHomeNotificationCount()).toBe(1);
  jest.mocked(loadNotifications).mockRejectedValueOnce(new Error('Unauthorized'));
  await expect(loadHomeNotificationCount()).rejects.toThrow('Unauthorized');
});
it('never displays expired signed media or uses a video URL as an image', () => {
  expect(previewImage({ expiresAt: 1, url: 'expired', media_type: 'image' } as never)).toBeUndefined();
  expect(previewImage({ expiresAt: Date.now() + 10000, url: 'video', media_type: 'video' } as never)).toBeUndefined();
});

it('previews recent authorized groups without posts or membership identities, with bounded media', async () => {
  jest
    .mocked(getCurrentCapabilities)
    .mockResolvedValue({ community: true, profileId: 'viewer', neighborhoodId: 'area', clusterId: 'cluster' } as never);
  const section = (id: string, createdAt: string, moderationStatus = 'clean') => ({
    group: { id, name: id, description: 'Group context', createdAt, moderationStatus, memberCount: 4 },
    membershipStatus: 'accepted',
    posts: [{ body: 'PRIVATE POST' }],
    memberships: [{ profileId: 'PRIVATE MEMBER' }],
  });
  const list = jest.fn(async () => [
    section('old', '2026-01-01'),
    section('new', '2026-02-01'),
    section('third', '2025-01-01'),
    section('blocked', '2026-03-01', 'blocked'),
  ]);
  jest
    .mocked(getCommunityActionsReadRepository)
    .mockReturnValue({ mode: 'supabase', listSocialGroupScreenSections: list } as never);
  jest.mocked(listMedia).mockResolvedValue([]);
  const result = await loadHomeGroups();
  expect(result.map((group) => group.id)).toEqual(['new', 'old']);
  expect(result[0]).toMatchObject({ memberCount: 4, isMember: true });
  expect(JSON.stringify(result)).not.toMatch(/PRIVATE|posts|memberships/);
  expect(list).toHaveBeenCalledWith(
    expect.objectContaining({
      profileId: 'viewer',
      neighborhoodId: 'area',
      clusterId: 'cluster',
      isVerifiedNeighborhoodMember: true,
    }),
  );
  expect(listMedia).toHaveBeenCalledWith('group_avatar', ['new', 'old']);
  jest.mocked(getCurrentCapabilities).mockResolvedValue({ community: false } as never);
  expect(await loadHomeGroups()).toEqual([]);
  expect(list).toHaveBeenCalledTimes(1);
});
it('refuses seeded groups and propagates authorization failures', async () => {
  const list = jest.fn();
  jest
    .mocked(getCommunityActionsReadRepository)
    .mockReturnValue({ mode: 'seeded', listSocialGroupScreenSections: list } as never);
  await expect(loadHomeGroups()).rejects.toThrow('Live groups unavailable');
  expect(list).not.toHaveBeenCalled();
  jest
    .mocked(getCommunityActionsReadRepository)
    .mockReturnValue({ mode: 'supabase', listSocialGroupScreenSections: list } as never);
  jest.mocked(getCurrentCapabilities).mockRejectedValue(new Error('Unauthorized'));
  await expect(loadHomeGroups()).rejects.toThrow('Unauthorized');
  expect(list).not.toHaveBeenCalled();
});
it('keeps Events closed without querying content when its gate is disabled', async () => {
  jest.mocked(eventsRuntimeRepository.isEnabled).mockResolvedValue(false);
  expect(await loadHomeEvents()).toEqual({ enabled: false, events: [] });
  expect(eventsRuntimeRepository.listEvents).not.toHaveBeenCalled();
});
it('shows only the next approved scheduled events and strips private detail fields', async () => {
  jest.mocked(eventsRuntimeRepository.isEnabled).mockResolvedValue(true);
  jest.mocked(eventsRuntimeRepository.getDiagnostics).mockReturnValue({ lastReadUsedCache: false } as never);
  const event = {
    id: 'first',
    title: 'Local plan',
    startsAt: '2099-01-01',
    timezone: 'Africa/Accra',
    areaLabel: 'Osu',
    status: 'scheduled',
    moderationStatus: 'approved',
    currentUserRsvpStatus: 'going',
    venueName: 'PRIVATE VENUE',
    privateAddress: 'PRIVATE ADDRESS',
    organizerProfileId: 'PRIVATE ID',
  };
  jest
    .mocked(eventsRuntimeRepository.listEvents)
    .mockResolvedValue([
      { ...event, id: 'later', startsAt: '2099-02-01' },
      event,
      { ...event, id: 'past', startsAt: '2020-01-01' },
      { ...event, id: 'pending', moderationStatus: 'pending' },
      { ...event, id: 'blocked', moderationStatus: 'blocked' },
      { ...event, id: 'cancelled', status: 'cancelled' },
      { ...event, id: 'draft', status: 'draft' },
      { ...event, id: 'third', startsAt: '2099-03-01' },
    ] as never);
  const result = await loadHomeEvents();
  expect(result.events.map((item) => item.id)).toEqual(['first', 'later']);
  expect(result.events[0]).toMatchObject({ areaLabel: 'Osu', isGoing: true });
  expect(JSON.stringify(result)).not.toContain('PRIVATE');
  jest.mocked(eventsRuntimeRepository.getDiagnostics).mockReturnValue({ lastReadUsedCache: true } as never);
  await expect(loadHomeEvents()).rejects.toThrow('Live events unavailable');
  jest.mocked(eventsRuntimeRepository.listEvents).mockRejectedValue(new Error('Forbidden'));
  await expect(loadHomeEvents()).rejects.toThrow('Forbidden');
});
