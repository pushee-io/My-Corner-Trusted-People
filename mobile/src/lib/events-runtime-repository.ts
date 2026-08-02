import { EventRepositoryError, normalizeEventError } from '@/lib/events-errors';
import type { CompleteEventsRepository } from '@/lib/events-repository';
import { createCompleteSupabaseEventsRepository } from '@/lib/events-supabase-complete-repository';
import type { Event, EventDraft, EventRsvp, EventUpdateDraft } from '@/types/events';

type QueuedMutation = { key: string; run: () => Promise<unknown> };
type RuntimeOptions = { now?: () => string };

const eventCache = new Map<string, Event>();
const queryCache = new Map<string, string[]>();
const mutationQueue = new Map<string, QueuedMutation>();
let flushPromise: Promise<void> | undefined;

function queryKey(query: { neighborhoodId: string; clusterId?: string }) {
  return `${query.neighborhoodId}:${query.clusterId ?? ''}`;
}

function cachedQuery(query: { neighborhoodId: string; clusterId?: string }) {
  return (queryCache.get(queryKey(query)) ?? []).map((id) => eventCache.get(id)).filter(Boolean) as Event[];
}

function remember(events: Event[], query?: { neighborhoodId: string; clusterId?: string }) {
  events.forEach((event) => eventCache.set(event.id, event));
  if (query) queryCache.set(queryKey(query), events.map((event) => event.id));
}

function enqueue(key: string, run: () => Promise<unknown>) {
  mutationQueue.set(key, { key, run });
}

export function flushEventsMutationQueue() {
  if (flushPromise) return flushPromise;
  flushPromise = (async () => {
    for (const item of [...mutationQueue.values()]) {
      try {
        await item.run();
        mutationQueue.delete(item.key);
      } catch (caught) {
        const error = normalizeEventError(caught);
        if (!error.retryable) mutationQueue.delete(item.key);
      }
    }
  })().finally(() => {
    flushPromise = undefined;
  });
  return flushPromise;
}

export function getQueuedEventMutationCount() {
  return mutationQueue.size;
}

export function createRuntimeEventsRepository(
  liveFactory: () => CompleteEventsRepository = createCompleteSupabaseEventsRepository,
  options: RuntimeOptions = {},
): CompleteEventsRepository {
  let liveRepository: CompleteEventsRepository | undefined;
  const now = options.now ?? (() => new Date().toISOString());
  const live = () => (liveRepository ??= liveFactory());
  const viewer = {
    profileId: 'authenticated-profile',
    displayName: 'Signed-in neighbor',
    neighborhoodId: '',
    clusterId: '',
    isVerifiedNeighborhoodMember: true,
  };

  const repository: CompleteEventsRepository = {
    defaultViewer: viewer,
    async listEvents(query) {
      try {
        const events = await live().listEvents(query);
        remember(events, query);
        void flushEventsMutationQueue();
        return events;
      } catch (caught) {
        const cached = cachedQuery(query);
        if (cached.length > 0) return cached;
        throw normalizeEventError(caught);
      }
    },
    async getEvent(eventId) {
      try {
        const event = await live().getEvent(eventId);
        if (event) remember([event]);
        void flushEventsMutationQueue();
        return event;
      } catch (caught) {
        const cached = eventCache.get(eventId);
        if (cached) return cached;
        throw normalizeEventError(caught);
      }
    },
    async createEvent(draft: EventDraft) {
      try {
        const event = await live().createEvent(draft);
        remember([event]);
        return event;
      } catch (caught) {
        const error = normalizeEventError(caught);
        if (!error.retryable) throw error;
        const createdAt = now();
        const optimistic: Event = {
          ...draft,
          id: `offline-event-${createdAt}`,
          organizerProfileId: viewer.profileId,
          organizerDisplayName: viewer.displayName,
          status: 'draft',
          moderationStatus: 'pending',
          attendeeCount: 0,
          createdAt,
          updatedAt: createdAt,
        };
        remember([optimistic]);
        enqueue(`create:${optimistic.id}`, async () => {
          const saved = await live().createEvent(draft);
          eventCache.delete(optimistic.id);
          remember([saved]);
        });
        return optimistic;
      }
    },
    async updateEvent(eventId: string, draft: EventUpdateDraft) {
      try {
        const event = await live().updateEvent(eventId, draft);
        remember([event]);
        return event;
      } catch (caught) {
        const error = normalizeEventError(caught);
        const cached = eventCache.get(eventId);
        if (!error.retryable || !cached) throw error;
        const optimistic = { ...cached, ...draft, updatedAt: now() } as Event;
        remember([optimistic]);
        enqueue(`update:${eventId}`, async () => {
          const saved = await live().updateEvent(eventId, draft);
          remember([saved]);
        });
        return optimistic;
      }
    },
    async cancelEvent(eventId) {
      try {
        const event = await live().cancelEvent(eventId);
        remember([event]);
        return event;
      } catch (caught) {
        const error = normalizeEventError(caught);
        const cached = eventCache.get(eventId);
        if (!error.retryable || !cached) throw error;
        const optimistic = { ...cached, status: 'cancelled' as const, updatedAt: now() };
        remember([optimistic]);
        enqueue(`cancel:${eventId}`, async () => {
          const saved = await live().cancelEvent(eventId);
          remember([saved]);
        });
        return optimistic;
      }
    },
    async rsvp(eventId) {
      try {
        return await live().rsvp(eventId);
      } catch (caught) {
        const error = normalizeEventError(caught);
        if (!error.retryable) throw error;
        const timestamp = now();
        const optimistic: EventRsvp = {
          id: `offline-rsvp-${eventId}-${viewer.profileId}`,
          eventId,
          profileId: viewer.profileId,
          attendeeDisplayName: viewer.displayName,
          status: 'going',
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        enqueue(`rsvp:${eventId}:${viewer.profileId}`, () => live().rsvp(eventId));
        return optimistic;
      }
    },
    cancelRsvp: (eventId) => live().cancelRsvp(eventId).catch((error) => Promise.reject(normalizeEventError(error))),
    listAttendees: (query) =>
      live()
        .listAttendees(query)
        .catch((error) => Promise.reject(normalizeEventError(error))),
    listOrganizerEvents: (profileId) =>
      live()
        .listOrganizerEvents(profileId)
        .then((events) => {
          remember(events);
          return events;
        })
        .catch((caught) => {
          const cached = [...eventCache.values()].filter((event) => event.organizerProfileId === profileId);
          if (cached.length > 0) return cached;
          throw normalizeEventError(caught);
        }),
    getEventForViewer: (eventId, eventViewer) =>
      live()
        .getEventForViewer(eventId, eventViewer)
        .then((event) => {
          if (event) remember([event]);
          return event;
        })
        .catch((caught) => {
          const cached = eventCache.get(eventId);
          if (cached)
            return {
              ...cached,
              clusterId: eventViewer.clusterId,
              locationType: 'in_person' as const,
              commentsEnabled: true,
            };
          throw normalizeEventError(caught);
        }),
    createEventForViewer: (draft, eventViewer) => repository.createEvent(draft).then((event) => ({
      ...event,
      clusterId: eventViewer.clusterId,
      locationType: 'in_person' as const,
      commentsEnabled: true,
    })),
    updateEventForViewer: (eventId, draft) => repository.updateEvent(eventId, draft).then((event) => ({
      ...event,
      clusterId: '',
      locationType: 'in_person' as const,
      commentsEnabled: true,
    })),
    cancelEventForViewer: (eventId) => repository.cancelEvent(eventId).then((event) => ({
      ...event,
      clusterId: '',
      locationType: 'in_person' as const,
      commentsEnabled: true,
    })),
    setGoing: (eventId, eventViewer) =>
      live()
        .setGoing(eventId, eventViewer)
        .catch(async (caught) => {
          const error = normalizeEventError(caught);
          if (!error.retryable) throw error;
          const rsvp = await repository.rsvp(eventId);
          const event = await repository.getEventForViewer(eventId, eventViewer);
          if (!event) throw new EventRepositoryError('offline', 'The cached event is unavailable.', true);
          return { event, rsvp };
        }),
    setInterest: (eventId, eventViewer) => live().setInterest(eventId, eventViewer),
    cancelAttendance: (eventId, eventViewer) => live().cancelAttendance(eventId, eventViewer),
    invite: (eventId, profileId, eventViewer) => live().invite(eventId, profileId, eventViewer),
    addComment: (eventId, body, eventViewer) => live().addComment(eventId, body, eventViewer),
    report: (eventId, reason, eventViewer) => live().report(eventId, reason, eventViewer),
    scheduleReminder: (eventId, remindAt, eventViewer) => live().scheduleReminder(eventId, remindAt, eventViewer),
    addOrganizer: (eventId, profileId, eventViewer) => live().addOrganizer(eventId, profileId, eventViewer),
    listOutbox: () => live().listOutbox(),
    resetForTests() {
      eventCache.clear();
      queryCache.clear();
      mutationQueue.clear();
      liveRepository?.resetForTests();
    },
  };
  return repository;
}

export const eventsRepository = createRuntimeEventsRepository();
