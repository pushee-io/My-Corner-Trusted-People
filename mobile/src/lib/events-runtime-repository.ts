import { createSeededEventsRepository } from '@/lib/events-repository';
import { isEventsClientEnabled, isSeededEventsDevelopmentMode } from '@/lib/events-feature';
import {
  EventsRuntimeError,
  type EventsRuntimeContext,
  type EventsRuntimeRepository,
} from '@/lib/events-runtime-contract';
import { createSupabaseEventsRuntimeRepository } from '@/lib/events-supabase-repository';
import { getActiveLocationContext } from '@/lib/location-context';
import type { Event, EventDraft } from '@/types/events';
import type { EventRuntimeDetails } from '@/types/events-runtime';

type PendingWrite = { id: string; run: () => Promise<unknown> };

export { isEventsClientEnabled, isSeededEventsDevelopmentMode } from '@/lib/events-feature';

function createSeededDevelopmentRepository(): EventsRuntimeRepository {
  const location = getActiveLocationContext();
  const seeded = createSeededEventsRepository({
    profileId: 'profile-akosua',
    displayName: 'Akosua M.',
    neighborhoodId: location.neighborhoodId,
    clusterId: location.clusterId,
    isVerifiedNeighborhoodMember: location.isVerifiedNeighborhoodMember,
  });
  const context: EventsRuntimeContext = {
    profileId: seeded.defaultViewer.profileId,
    displayName: seeded.defaultViewer.displayName,
    neighborhoodId: location.neighborhoodId,
    neighborhoodName: location.neighborhoodName,
    clusterId: location.clusterId,
    isVerifiedNeighborhoodMember: location.isVerifiedNeighborhoodMember,
    isStaff: false,
  };

  return {
    mode: 'seeded-development',
    async isEnabled() {
      return isEventsClientEnabled();
    },
    async getContext() {
      return context;
    },
    async listEvents() {
      const [visible, managed] = await Promise.all([
        seeded.listEvents({ neighborhoodId: context.neighborhoodId, clusterId: context.clusterId }),
        seeded.listOrganizerEvents(context.profileId),
      ]);
      return [...new Map([...visible, ...managed].map((event) => [event.id, event])).values()];
    },
    getEvent(eventId) {
      return seeded.getEventForViewer(eventId, seeded.defaultViewer);
    },
    createEvent(draft) {
      return seeded.createEventForViewer({ ...draft, neighborhoodId: context.neighborhoodId }, seeded.defaultViewer);
    },
    updateEvent(eventId, draft) {
      return seeded.updateEventForViewer(eventId, draft, seeded.defaultViewer);
    },
    async transitionEvent(eventId, status) {
      if (status !== 'cancelled') {
        throw new EventsRuntimeError('validation', 'This lifecycle transition requires the live repository.');
      }
      return seeded.cancelEventForViewer(eventId, seeded.defaultViewer);
    },
    setGoing(eventId) {
      return seeded.setGoing(eventId, seeded.defaultViewer);
    },
    setInterest(eventId) {
      return seeded.setInterest(eventId, seeded.defaultViewer);
    },
    cancelAttendance(eventId) {
      return seeded.cancelAttendance(eventId, seeded.defaultViewer);
    },
    invite(eventId, inviteeProfileId) {
      return seeded.invite(eventId, inviteeProfileId, seeded.defaultViewer);
    },
    async respondToInvitation(_invitationId, accept) {
      return accept ? 'accepted' : 'declined';
    },
    addComment(eventId, body) {
      return seeded.addComment(eventId, body, seeded.defaultViewer);
    },
    report(eventId, reason) {
      return seeded.report(eventId, reason, seeded.defaultViewer);
    },
    scheduleReminder(eventId, remindAt) {
      return seeded.scheduleReminder(eventId, remindAt, seeded.defaultViewer);
    },
    async sendOrganizerReminder() {
      throw new EventsRuntimeError('validation', 'Organizer delivery requires the live repository.');
    },
    async moderateContent() {
      throw new EventsRuntimeError('forbidden', 'Staff moderation requires the live repository.');
    },
    async retryPendingWrites() {
      return 0;
    },
    getDiagnostics() {
      return { mode: 'seeded-development', lastReadUsedCache: false, pendingWriteCount: 0 };
    },
  };
}

function createClosedRepository(): EventsRuntimeRepository {
  const disabled = () => Promise.reject(new EventsRuntimeError('feature_disabled', 'Events is not available yet.'));
  return {
    mode: 'supabase',
    async isEnabled() {
      return false;
    },
    getContext: disabled,
    listEvents: disabled,
    getEvent: disabled,
    createEvent: disabled,
    updateEvent: disabled,
    transitionEvent: disabled,
    setGoing: disabled,
    setInterest: disabled,
    cancelAttendance: disabled,
    invite: disabled,
    respondToInvitation: disabled,
    addComment: disabled,
    report: disabled,
    scheduleReminder: disabled,
    sendOrganizerReminder: disabled,
    moderateContent: disabled,
    async retryPendingWrites() {
      return 0;
    },
    getDiagnostics() {
      return { mode: 'supabase', lastReadUsedCache: false, pendingWriteCount: 0 };
    },
  };
}

export function createResilientEventsRepository(inner: EventsRuntimeRepository): EventsRuntimeRepository {
  let cachedList: Event[] | undefined;
  let cachedContext: EventsRuntimeContext | undefined;
  let enabledCache = false;
  let lastReadUsedCache = false;
  const details = new Map<string, EventRuntimeDetails>();
  const pendingWrites: PendingWrite[] = [];

  const diagnostics = () => ({
    mode: inner.mode,
    lastReadUsedCache,
    pendingWriteCount: pendingWrites.length,
  });
  const remember = (event: EventRuntimeDetails) => {
    details.set(event.id, event);
    if (cachedList) cachedList = cachedList.map((item) => (item.id === event.id ? event : item));
    return event;
  };
  const queue = (id: string, run: () => Promise<unknown>) => {
    if (!pendingWrites.some((item) => item.id === id)) pendingWrites.push({ id, run });
  };
  const offline = (caught: unknown) => caught instanceof EventsRuntimeError && caught.code === 'offline';

  return {
    ...inner,
    async isEnabled() {
      if (!isEventsClientEnabled()) return false;
      try {
        enabledCache = await inner.isEnabled();
        return enabledCache;
      } catch (caught) {
        if (offline(caught)) return enabledCache;
        throw caught;
      }
    },
    async getContext() {
      try {
        cachedContext = await inner.getContext();
        lastReadUsedCache = false;
        return cachedContext;
      } catch (caught) {
        if (offline(caught) && cachedContext) {
          lastReadUsedCache = true;
          return cachedContext;
        }
        throw caught;
      }
    },
    async listEvents() {
      try {
        cachedList = await inner.listEvents();
        cachedList.forEach((event) => details.set(event.id, event as EventRuntimeDetails));
        lastReadUsedCache = false;
        return cachedList;
      } catch (caught) {
        if (offline(caught) && cachedList) {
          lastReadUsedCache = true;
          return cachedList;
        }
        throw caught;
      }
    },
    async getEvent(eventId) {
      try {
        const event = await inner.getEvent(eventId);
        lastReadUsedCache = false;
        return event ? remember(event) : null;
      } catch (caught) {
        if (offline(caught) && details.has(eventId)) {
          lastReadUsedCache = true;
          return details.get(eventId)!;
        }
        throw caught;
      }
    },
    async createEvent(draft) {
      const context = cachedContext ?? (await inner.getContext());
      const clientRequestId = draft.clientRequestId ?? createClientRequestId();
      const stableDraft = { ...draft, clientRequestId, neighborhoodId: context.neighborhoodId };
      try {
        return remember(await inner.createEvent(stableDraft));
      } catch (caught) {
        if (!offline(caught)) throw caught;
        const optimistic = optimisticDraft(stableDraft, context);
        details.set(optimistic.id, optimistic);
        cachedList = [optimistic, ...(cachedList ?? [])];
        queue(`create:${clientRequestId}`, async () => {
          const created = await inner.createEvent(stableDraft);
          details.delete(optimistic.id);
          cachedList = (cachedList ?? []).filter((item) => item.id !== optimistic.id);
          remember(created);
        });
        return optimistic;
      }
    },
    async updateEvent(eventId, draft) {
      try {
        return remember(await inner.updateEvent(eventId, draft));
      } catch (caught) {
        if (!offline(caught) || !details.has(eventId)) throw caught;
        const current = details.get(eventId)!;
        const optimistic = remember({
          ...current,
          ...draft,
          endsAt: draft.endsAt === null ? undefined : (draft.endsAt ?? current.endsAt),
          venueName: draft.venueName === null ? undefined : (draft.venueName ?? current.venueName),
          capacity: draft.capacity === null ? undefined : (draft.capacity ?? current.capacity),
          updatedAt: new Date().toISOString(),
        });
        queue(`update:${eventId}`, () => inner.updateEvent(eventId, draft).then(remember));
        return optimistic;
      }
    },
    async transitionEvent(eventId, status) {
      try {
        return remember(await inner.transitionEvent(eventId, status));
      } catch (caught) {
        if (!offline(caught) || !details.has(eventId)) throw caught;
        const optimistic = remember({ ...details.get(eventId)!, status, updatedAt: new Date().toISOString() });
        queue(`transition:${eventId}:${status}`, () => inner.transitionEvent(eventId, status).then(remember));
        return optimistic;
      }
    },
    async setGoing(eventId) {
      try {
        const result = await inner.setGoing(eventId);
        remember(result.event);
        return result;
      } catch (caught) {
        if (!offline(caught) || !details.has(eventId)) throw caught;
        const current = details.get(eventId)!;
        const event = remember({
          ...current,
          currentUserRsvpStatus: 'going',
          currentUserInterestStatus: undefined,
          attendeeCount: current.currentUserRsvpStatus === 'going' ? current.attendeeCount : current.attendeeCount + 1,
        });
        queue(`rsvp:${eventId}:going`, () => inner.setGoing(eventId).then((result) => remember(result.event)));
        return { event };
      }
    },
    async setInterest(eventId) {
      try {
        const result = await inner.setInterest(eventId);
        remember(result.event);
        return result;
      } catch (caught) {
        if (!offline(caught) || !details.has(eventId)) throw caught;
        const event = remember({ ...details.get(eventId)!, currentUserInterestStatus: 'interested' });
        queue(`rsvp:${eventId}:interested`, () => inner.setInterest(eventId).then((result) => remember(result.event)));
        return { event, interestStatus: 'interested' };
      }
    },
    async cancelAttendance(eventId) {
      try {
        const result = await inner.cancelAttendance(eventId);
        remember(result.event);
        return result;
      } catch (caught) {
        if (!offline(caught) || !details.has(eventId)) throw caught;
        const current = details.get(eventId)!;
        const event = remember({
          ...current,
          currentUserRsvpStatus: undefined,
          currentUserInterestStatus: 'not_going',
          attendeeCount:
            current.currentUserRsvpStatus === 'going' ? Math.max(0, current.attendeeCount - 1) : current.attendeeCount,
        });
        queue(`rsvp:${eventId}:cancelled`, () =>
          inner.cancelAttendance(eventId).then((result) => remember(result.event)),
        );
        return { event };
      }
    },
    async report(eventId, reason) {
      try {
        return await inner.report(eventId, reason);
      } catch (caught) {
        if (!offline(caught)) throw caught;
        const context = cachedContext ?? (await inner.getContext());
        queue(`report:${eventId}`, () => inner.report(eventId, reason));
        return {
          id: `pending-report-${eventId}`,
          eventId,
          reporterProfileId: context.profileId,
          reason,
          createdAt: new Date().toISOString(),
        };
      }
    },
    async scheduleReminder(eventId, remindAt) {
      try {
        return await inner.scheduleReminder(eventId, remindAt);
      } catch (caught) {
        if (!offline(caught)) throw caught;
        const context = cachedContext ?? (await inner.getContext());
        queue(`reminder:${eventId}`, () => inner.scheduleReminder(eventId, remindAt));
        return {
          id: `pending-reminder-${eventId}`,
          eventId,
          profileId: context.profileId,
          remindAt,
          createdAt: new Date().toISOString(),
        };
      }
    },
    async retryPendingWrites() {
      let completed = 0;
      for (let index = pendingWrites.length - 1; index >= 0; index -= 1) {
        try {
          await pendingWrites[index].run();
          pendingWrites.splice(index, 1);
          completed += 1;
        } catch (caught) {
          if (!offline(caught)) pendingWrites.splice(index, 1);
        }
      }
      return completed;
    },
    getDiagnostics: diagnostics,
  };
}

function optimisticDraft(draft: EventDraft, context: EventsRuntimeContext): EventRuntimeDetails {
  const now = new Date().toISOString();
  return {
    ...draft,
    id: `pending-event-${draft.clientRequestId}`,
    clusterId: context.clusterId,
    organizerProfileId: context.profileId,
    organizerDisplayName: context.displayName,
    status: 'draft',
    moderationStatus: 'pending',
    attendeeCount: 0,
    createdAt: now,
    updatedAt: now,
    locationType: 'in_person',
    commentsEnabled: true,
  };
}

function createClientRequestId(): string {
  const cryptoValue = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto?.randomUUID?.();
  return cryptoValue ?? `event-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createConfiguredRepository(): EventsRuntimeRepository {
  if (!isEventsClientEnabled()) return createClosedRepository();
  if (isSeededEventsDevelopmentMode()) return createSeededDevelopmentRepository();

  try {
    return createResilientEventsRepository(createSupabaseEventsRuntimeRepository());
  } catch {
    return createClosedRepository();
  }
}

let configuredRepository: EventsRuntimeRepository | undefined;

export function getEventsRuntimeRepository(): EventsRuntimeRepository {
  configuredRepository ??= createConfiguredRepository();
  return configuredRepository;
}

export function resetEventsRuntimeRepositoryForTests() {
  configuredRepository = undefined;
}

export const eventsRuntimeRepository = getEventsRuntimeRepository();
