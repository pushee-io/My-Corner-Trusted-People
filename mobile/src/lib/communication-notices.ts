import type { Href } from 'expo-router';
import type { Notice } from '@/lib/messaging';
import { isEventsClientEnabled } from '@/lib/events-feature';

export function noticeHref(notice: Notice): Href | undefined {
  if (!notice.targetId) return '/notifications';
  if (notice.targetKind === 'message_received')
    return { pathname: '/messages', params: { conversationId: notice.targetId } };
  if (notice.targetKind?.startsWith('review_'))
    return { pathname: '/hire/provider/[providerId]', params: { providerId: notice.targetId } };
  if (notice.targetKind?.startsWith('hire_') || notice.targetKind?.startsWith('job_safety_'))
    return notice.isRequester
      ? { pathname: '/hire/request/status', params: { requestId: notice.targetId } }
      : { pathname: '/provider/request/[requestId]', params: { requestId: notice.targetId } };
  if (notice.targetKind?.startsWith('event_'))
    return isEventsClientEnabled()
      ? { pathname: '/events/[eventId]', params: { eventId: notice.targetId } }
      : undefined;
  if (notice.targetKind?.startsWith('group_')) return '/groups';
  if (notice.targetKind?.startsWith('marketplace_')) return '/marketplace';
  if (notice.targetKind?.startsWith('agency_') || notice.targetKind?.startsWith('broadcast_'))
    return '/agency-broadcasts';
  if (notice.targetKind?.startsWith('comment_') || notice.targetKind?.startsWith('reply_')) return '/community';
  return '/notifications';
}

export function isPriorityNotice(notice: Notice) {
  return (
    notice.priority === 'high' ||
    notice.priority === 'critical' ||
    notice.priority === 'emergency' ||
    notice.targetKind === 'job_safety_updated'
  );
}

// A bounded, session-scoped deduplication record persists across screen navigation.
// Initial history is not replayed as a flood of banners.
export function createNoticeTracker() {
  let owner: string | undefined;
  let initialized = false;
  let seen = new Set<string>();
  return {
    reset() {
      owner = undefined;
      initialized = false;
      seen.clear();
    },
    receive(session: string, notices: Notice[], now = Date.now()) {
      if (owner !== session) {
        owner = session;
        initialized = false;
        seen.clear();
      }
      const fresh = initialized
        ? notices.filter(
            (notice) =>
              !seen.has(notice.id) &&
              !notice.readAt &&
              isPriorityNotice(notice) &&
              Number.isFinite(Date.parse(notice.createdAt)) &&
              Date.parse(notice.createdAt) <= now &&
              now - Date.parse(notice.createdAt) < 120000,
          )
        : [];
      initialized = true;
      seen = new Set([...seen, ...notices.map((notice) => notice.id)].slice(-500));
      return fresh.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt)).slice(-3);
    },
  };
}
