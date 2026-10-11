import type { Event } from '@/types/events';

type EventTime = Pick<Event, 'startsAt' | 'endsAt' | 'status' | 'moderationStatus'>;

/** No guessed duration: without an end time, an event leaves Upcoming at its start. */
export function isActiveOrUpcomingEvent(event: EventTime, now = Date.now()) {
  if (event.status !== 'scheduled' || event.moderationStatus !== 'approved') return false;
  const start = Date.parse(event.startsAt);
  const end = event.endsAt ? Date.parse(event.endsAt) : start;
  return Number.isFinite(start) && Number.isFinite(end) && end >= start && end > now;
}

export function isEventHappeningNow(event: EventTime, now = Date.now()) {
  return isActiveOrUpcomingEvent(event, now) && Date.parse(event.startsAt) <= now;
}

export function partitionEvents(events: Event[], now = Date.now()) {
  const upcoming = events.filter((event) => isActiveOrUpcomingEvent(event, now));
  const pending = events.filter((event) => event.moderationStatus === 'pending');
  const past = events.filter((event) => event.moderationStatus !== 'pending' && !isActiveOrUpcomingEvent(event, now));
  upcoming.sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  past.sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt));
  return { upcoming, pending, past };
}
