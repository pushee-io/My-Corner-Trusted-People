import { createNoticeTracker, isPriorityNotice, noticeHref } from '@/lib/communication-notices';
import { feedShareLink } from '@/lib/feed-share';
import { isFocusedForm } from '@/lib/navigation-layout';
import type { Notice } from '@/lib/messaging';
import type { NeighborhoodFeedPost } from '@/types/contracts';
jest.mock('@/lib/events-feature', () => ({ isEventsClientEnabled: () => false }));

const now = Date.parse('2026-10-10T10:00:00Z');
const notice = (id: string, extra: Partial<Notice> = {}): Notice => ({
  id, title: 'Update', body: 'Private detail', createdAt: new Date(now - 1000).toISOString(),
  targetKind: 'job_safety_updated', targetId: 'request', ...extra,
});
it('does not elevate ordinary messages or broadcasts based on their wording', () => {
  expect(isPriorityNotice(notice('a', { targetKind: 'broadcast_created', title: 'Emergency drill' }))).toBe(false);
  expect(isPriorityNotice(notice('b', { targetKind: 'message_received' }))).toBe(false);
  expect(isPriorityNotice(notice('c', { targetKind: 'message_received', priority: 'high' }))).toBe(true);
});
it('does not replay history, duplicates, read items, stale or future notifications', () => {
  const tracker = createNoticeTracker();
  expect(tracker.receive('session', [notice('history')], now)).toEqual([]);
  expect(tracker.receive('session', [notice('history'), notice('new')], now).map((n) => n.id)).toEqual(['new']);
  expect(tracker.receive('session', [notice('new')], now)).toEqual([]);
  expect(tracker.receive('session', [
    notice('read', { readAt: new Date(now).toISOString() }),
    notice('old', { createdAt: new Date(now - 600000).toISOString() }),
    notice('future', { createdAt: new Date(now + 600000).toISOString() }),
  ], now)).toEqual([]);
});
it('resets notification ownership across account changes and background clears', () => {
  const tracker = createNoticeTracker();
  tracker.receive('a', [notice('first')], now);
  expect(tracker.receive('b', [notice('second')], now)).toEqual([]);
  expect(tracker.receive('b', [notice('third')], now).map((n) => n.id)).toEqual(['third']);
  tracker.reset();
  expect(tracker.receive('b', [notice('fourth')], now)).toEqual([]);
});
it('keeps recipient-specific request routes and Events gating', () => {
  expect(noticeHref(notice('a', { isRequester: true }))).toEqual({ pathname: '/hire/request/status', params: { requestId: 'request' } });
  expect(noticeHref(notice('b', { isRequester: false }))).toEqual({ pathname: '/provider/request/[requestId]', params: { requestId: 'request' } });
  expect(noticeHref(notice('c', { targetKind: 'event_updated' }))).toBe('/notifications');
});
it('shares only an authenticated navigation link, never restricted post data', () => {
  const post = { id: 'post-1', moderationStatus: 'clean', body: 'Private body', authorName: 'Private name', imageUrls: ['private-media'], visibility: 'verified_neighborhood_members' } as NeighborhoodFeedPost;
  const payload = JSON.stringify(feedShareLink(post));
  expect(payload).toContain('mycorner://community?postId=post-1');
  for (const secret of ['Private body', 'Private name', 'private-media']) expect(payload).not.toContain(secret);
  expect(feedShareLink({ ...post, moderationStatus: 'blocked' })).toBeUndefined();
  expect(feedShareLink({ ...post, visibility: 'moderator_only' })).toBeUndefined();
});
it.each(['/community/new-post', '/hire/request/new', '/hire/request/report-cancel', '/report/evidence', '/provider/request/respond', '/events/id/edit'])('hides navigation on focused route %s', (route) => {
  expect(isFocusedForm(route)).toBe(true);
});
