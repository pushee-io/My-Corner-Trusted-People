import type { Event } from '@/types/events';

export function formatEventDate(value: string, timezone: string) {
  return new Date(value).toLocaleString('en-GH', {
    timeZone: timezone,
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function eventStatusLabel(event: Pick<Event, 'moderationStatus' | 'status'>) {
  if (event.moderationStatus === 'pending') return 'Pending review';
  if (event.moderationStatus === 'rejected' || event.moderationStatus === 'blocked') return 'Rejected';
  if (event.moderationStatus === 'removed') return 'Removed';
  return event.status.charAt(0).toUpperCase() + event.status.slice(1);
}
