import { loadHomeBroadcast, loadHomeFeed, loadHomeMarketplace, loadHomeNotificationCount, previewImage } from '@/lib/home-dashboard';
import { getCurrentCapabilities } from '@/lib/capabilities';
import { getCurrentNeighborhood, listNeighborhoodFeedPosts } from '@/lib/community-repository';
import { getCommunityActionsReadRepository } from '@/lib/community-actions-repository';
import { getMarketplaceNeighborhood, listMarketplaceListings } from '@/lib/marketplace-repository';
import { listMedia } from '@/lib/media-repository';
import { loadNotifications } from '@/lib/messaging';

jest.mock('@/lib/capabilities', () => ({ getCurrentCapabilities: jest.fn() }));
jest.mock('@/lib/community-repository', () => ({ getCurrentNeighborhood: jest.fn(), listNeighborhoodFeedPosts: jest.fn() }));
jest.mock('@/lib/community-actions-repository', () => ({ getCommunityActionsReadRepository: jest.fn() }));
jest.mock('@/lib/marketplace-repository', () => ({ getMarketplaceNeighborhood: jest.fn(), listMarketplaceListings: jest.fn() }));
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
  jest.mocked(getCommunityActionsReadRepository).mockReturnValue({ mode: 'seeded', listAgencyBroadcasts: list } as never);
  await expect(loadHomeBroadcast()).rejects.toThrow('Live broadcasts unavailable');
  expect(list).not.toHaveBeenCalled();
});
it('uses the signed-in viewer, excludes unapproved/expired/future broadcasts and selects newest', async () => {
  jest.mocked(getCurrentCapabilities).mockResolvedValue({ community: true, profileId: 'viewer', neighborhoodId: 'area', clusterId: 'cluster' } as never);
  const current = { id: 'new', publishedAt: '2026-01-02', isAgencyApproved: true, moderationStatus: 'clean' };
  const list = jest.fn(async () => [
    { ...current, id: 'old', publishedAt: '2026-01-01' }, current,
    { ...current, id: 'unapproved', isAgencyApproved: false },
    { ...current, id: 'blocked', moderationStatus: 'blocked' },
    { ...current, id: 'expired', expiresAt: '2020-01-01' },
    { ...current, id: 'future', publishedAt: '2099-01-01' },
  ]);
  jest.mocked(getCommunityActionsReadRepository).mockReturnValue({ mode: 'supabase', listAgencyBroadcasts: list } as never);
  expect((await loadHomeBroadcast())?.id).toBe('new');
  expect(list).toHaveBeenCalledWith(expect.objectContaining({ profileId: 'viewer', neighborhoodId: 'area', clusterId: 'cluster' }));
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
