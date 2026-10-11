import { isActiveOrUpcomingEvent, partitionEvents } from '@/lib/event-lifecycle';
import type { Event } from '@/types/events';
const now = Date.parse('2026-10-11T12:00:00Z');
const event = {
  id: 'plan',
  startsAt: '2026-10-11T13:00:00Z',
  status: 'scheduled',
  moderationStatus: 'approved',
} as Event;
it('separates upcoming, ongoing, ended and pending without trusting status alone', () => {
  const result = partitionEvents(
    [
      event,
      { ...event, id: 'active', startsAt: '2026-10-11T11:00:00Z', endsAt: '2026-10-11T14:00:00Z' },
      { ...event, id: 'ended', startsAt: '2026-10-10T13:00:00Z' },
      { ...event, id: 'pending', moderationStatus: 'pending' },
      { ...event, id: 'cancelled', status: 'cancelled' },
    ],
    now,
  );
  expect(result.upcoming.map((e) => e.id)).toEqual(['active', 'plan']);
  expect(result.pending.map((e) => e.id)).toEqual(['pending']);
  expect(result.past.map((e) => e.id)).toEqual(['cancelled', 'ended']);
});
it('expires at the end boundary, makes no duration up, and rejects malformed dates', () => {
  expect(isActiveOrUpcomingEvent({ ...event, endsAt: '2026-10-11T12:00:00Z' }, now)).toBe(false);
  expect(isActiveOrUpcomingEvent({ ...event, startsAt: '2026-10-11T12:00:00Z' }, now)).toBe(false);
  expect(isActiveOrUpcomingEvent({ ...event, startsAt: 'bad' }, now)).toBe(false);
  expect(isActiveOrUpcomingEvent({ ...event, endsAt: 'bad' }, now)).toBe(false);
  expect(isActiveOrUpcomingEvent({ ...event, moderationStatus: 'blocked' }, now)).toBe(false);
  expect(isActiveOrUpcomingEvent({ ...event, startsAt: '2026-10-11T08:00:00-05:00' }, now)).toBe(true);
});
