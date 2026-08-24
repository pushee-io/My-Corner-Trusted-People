import {
  EVENT_ORGANIZER_ROLE_PERMISSIONS,
  type Event,
  type EventDraft,
  type EventRsvp,
  type EventUpdateDraft,
} from '@/types/events';
import type {
  EventAttendanceResult,
  EventComment,
  EventInvitation,
  EventOrganizer,
  EventOutboxItem,
  EventReminder,
  EventReport,
  EventRuntimeDetails,
  EventViewer,
} from '@/types/events-runtime';

export type ListEventsQuery = { neighborhoodId: string; clusterId?: string };
export type ListAttendeesQuery = { eventId: string };

export type EventsRepository = {
  listEvents(query: ListEventsQuery): Promise<Event[]>;
  getEvent(eventId: string): Promise<Event | null>;
  createEvent(draft: EventDraft): Promise<Event>;
  updateEvent(eventId: string, draft: EventUpdateDraft): Promise<Event>;
  cancelEvent(eventId: string): Promise<Event>;
  rsvp(eventId: string): Promise<EventRsvp>;
  cancelRsvp(eventId: string): Promise<EventRsvp>;
  listAttendees(query: ListAttendeesQuery): Promise<EventRsvp[]>;
  listOrganizerEvents(organizerProfileId: string): Promise<Event[]>;
};

export type CompleteEventsRepository = EventsRepository & {
  defaultViewer: EventViewer;
  getEventForViewer(eventId: string, viewer: EventViewer): Promise<EventRuntimeDetails | null>;
  createEventForViewer(draft: EventDraft, viewer: EventViewer): Promise<EventRuntimeDetails>;
  updateEventForViewer(eventId: string, draft: EventUpdateDraft, viewer: EventViewer): Promise<EventRuntimeDetails>;
  cancelEventForViewer(eventId: string, viewer: EventViewer): Promise<EventRuntimeDetails>;
  setGoing(eventId: string, viewer: EventViewer): Promise<EventAttendanceResult>;
  setInterest(eventId: string, viewer: EventViewer): Promise<EventAttendanceResult>;
  cancelAttendance(eventId: string, viewer: EventViewer): Promise<EventAttendanceResult>;
  invite(eventId: string, inviteeProfileId: string, viewer: EventViewer): Promise<EventInvitation>;
  addComment(eventId: string, body: string, viewer: EventViewer): Promise<EventComment>;
  report(eventId: string, reason: string, viewer: EventViewer): Promise<EventReport>;
  scheduleReminder(eventId: string, remindAt: string, viewer: EventViewer): Promise<EventReminder>;
  addOrganizer(eventId: string, profileId: string, viewer: EventViewer): Promise<EventOrganizer>;
  listOutbox(): Promise<EventOutboxItem[]>;
  resetForTests(): void;
};

const fixedNow = '2026-08-01T12:00:00.000Z';
const defaultViewer: EventViewer = {
  profileId: 'profile-akosua',
  displayName: 'Akosua M.',
  neighborhoodId: 'east-legon',
  clusterId: 'accra-east',
  isVerifiedNeighborhoodMember: true,
};

const initialEvents: EventRuntimeDetails[] = [
  {
    id: 'event-east-legon-cleanup',
    neighborhoodId: 'east-legon',
    clusterId: 'accra-east',
    organizerProfileId: 'profile-akosua',
    organizerDisplayName: 'Akosua M.',
    title: 'East Legon community cleanup',
    description: 'Meet neighbors for a morning cleanup around the general community area.',
    startsAt: '2026-08-15T08:00:00.000Z',
    endsAt: '2026-08-15T10:00:00.000Z',
    timezone: 'Africa/Accra',
    venueName: 'Community meeting point',
    areaLabel: 'East Legon, general area only',
    visibility: 'verified_neighborhood_members',
    status: 'scheduled',
    moderationStatus: 'approved',
    capacity: 2,
    attendeeCount: 1,
    createdAt: fixedNow,
    updatedAt: fixedNow,
    locationType: 'in_person',
    publicMeetupPoint: 'East Legon community meeting point',
    commentsEnabled: true,
  },
  {
    id: 'event-accra-east-safety',
    neighborhoodId: 'airport-residential',
    clusterId: 'accra-east',
    organizerProfileId: 'profile-ama',
    organizerDisplayName: 'Ama K.',
    title: 'Accra East safety briefing',
    description: 'A cluster-wide information session.',
    startsAt: '2026-08-20T18:00:00.000Z',
    timezone: 'Africa/Accra',
    areaLabel: 'Accra East, general area only',
    visibility: 'immediate_cluster_members',
    status: 'scheduled',
    moderationStatus: 'approved',
    capacity: 1,
    attendeeCount: 1,
    createdAt: fixedNow,
    updatedAt: fixedNow,
    locationType: 'virtual',
    virtualLink: 'https://example.invalid/private-event-link',
    commentsEnabled: true,
  },
];

const initialRsvps: EventRsvp[] = [
  {
    id: 'rsvp-cleanup-ama',
    eventId: initialEvents[0].id,
    profileId: 'profile-ama',
    attendeeDisplayName: 'Ama K.',
    status: 'going',
    createdAt: fixedNow,
    updatedAt: fixedNow,
  },
  {
    id: 'rsvp-safety-kojo',
    eventId: initialEvents[1].id,
    profileId: 'profile-kojo',
    attendeeDisplayName: 'Kojo N.',
    status: 'going',
    createdAt: fixedNow,
    updatedAt: fixedNow,
  },
];

export function createSeededEventsRepository(seedViewer: EventViewer = defaultViewer): CompleteEventsRepository {
  let events = initialEvents.map((event) => ({ ...event }));
  let rsvps: EventRsvp[] = initialRsvps.map((rsvp) => ({ ...rsvp }));
  let interests: { eventId: string; profileId: string; status: 'interested' | 'not_going' | 'waitlisted' }[] = [];
  let organizers: EventOrganizer[] = [{ eventId: initialEvents[0].id, profileId: 'profile-akosua', role: 'owner' }];
  let invitations: EventInvitation[] = [];
  let comments: EventComment[] = [];
  let reports: EventReport[] = [];
  let reminders: EventReminder[] = [];
  let outbox: EventOutboxItem[] = [];
  const privateLocations = new Map<string, { preciseAddress: string; revealToConfirmedAttendees: boolean }>([
    [initialEvents[0].id, { preciseAddress: 'Private residential address', revealToConfirmedAttendees: true }],
  ]);

  const visible = (event: EventRuntimeDetails, viewer: EventViewer) =>
    organizerRole(event.id, viewer.profileId) !== undefined ||
    (viewer.isVerifiedNeighborhoodMember &&
      event.moderationStatus === 'approved' &&
      (event.visibility === 'verified_neighborhood_members'
        ? event.neighborhoodId === viewer.neighborhoodId
        : event.visibility === 'immediate_cluster_members'
          ? event.clusterId === viewer.clusterId
          : invitations.some(
              (invitation) =>
                invitation.eventId === event.id &&
                invitation.inviteeProfileId === viewer.profileId &&
                invitation.status === 'accepted' &&
                new Date(invitation.expiresAt).getTime() > Date.now(),
            )));
  const find = (eventId: string) => {
    const event = events.find((item) => item.id === eventId);
    if (!event) throw new Error('Event not found.');
    return event;
  };
  const organizerRole = (eventId: string, profileId: string) =>
    organizers.find((item) => item.eventId === eventId && item.profileId === profileId)?.role;
  const requirePermission = (
    eventId: string,
    viewer: EventViewer,
    permission:
      | 'edit_event'
      | 'cancel_event'
      | 'manage_attendees'
      | 'manage_organizers'
      | 'send_reminders'
      | 'moderate_content'
      | 'invite_attendees',
  ) => {
    const role = organizerRole(eventId, viewer.profileId);
    if (!role || !EVENT_ORGANIZER_ROLE_PERMISSIONS[role][permission])
      throw new Error('You are not authorized to manage this event.');
  };
  const forViewer = (event: EventRuntimeDetails, viewer: EventViewer): EventRuntimeDetails => {
    const going = rsvps.some(
      (item) => item.eventId === event.id && item.profileId === viewer.profileId && item.status === 'going',
    );
    const privateLocation = privateLocations.get(event.id);
    const publicEvent = { ...event };
    const virtualLink = publicEvent.virtualLink;
    delete publicEvent.preciseLocation;
    delete publicEvent.virtualLink;
    return {
      ...publicEvent,
      currentUserRsvpStatus: going ? 'going' : undefined,
      currentUserInterestStatus: interests.find(
        (item) => item.eventId === event.id && item.profileId === viewer.profileId,
      )?.status,
      ...(going && privateLocation?.revealToConfirmedAttendees
        ? { preciseLocation: privateLocation.preciseAddress }
        : {}),
      ...((going || organizerRole(event.id, viewer.profileId)) && virtualLink ? { virtualLink } : {}),
      currentUserOrganizerRole: organizerRole(event.id, viewer.profileId),
      comments: comments.filter(
        (comment) =>
          comment.eventId === event.id &&
          (comment.moderationStatus === 'approved' ||
            comment.authorProfileId === viewer.profileId ||
            viewer.isModerator === true),
      ),
    };
  };
  const updateCount = (eventId: string) => {
    events = events.map((event) =>
      event.id === eventId
        ? {
            ...event,
            attendeeCount: rsvps.filter((rsvp) => rsvp.eventId === eventId && rsvp.status === 'going').length,
          }
        : event,
    );
  };
  const notify = (eventId: string, recipientProfileId: string, kind: EventOutboxItem['kind']) => {
    outbox.push({
      id: `event-outbox-${outbox.length + 1}`,
      eventId,
      recipientProfileId,
      kind,
      payload: { eventId },
      createdAt: new Date().toISOString(),
    });
  };

  const repository: CompleteEventsRepository = {
    defaultViewer: seedViewer,
    async listEvents(query) {
      return events.filter(
        (event) =>
          event.status === 'scheduled' &&
          event.moderationStatus === 'approved' &&
          (event.neighborhoodId === query.neighborhoodId || (!!query.clusterId && event.clusterId === query.clusterId)),
      );
    },
    async getEvent(eventId) {
      return events.find((event) => event.id === eventId) ?? null;
    },
    async createEvent(draft) {
      return repository.createEventForViewer(draft, seedViewer);
    },
    async updateEvent(eventId, draft) {
      return repository.updateEventForViewer(eventId, draft, seedViewer);
    },
    async cancelEvent(eventId) {
      return repository.cancelEventForViewer(eventId, seedViewer);
    },
    async rsvp(eventId) {
      const result = await repository.setGoing(eventId, seedViewer);
      if (!result.rsvp) throw new Error('Event capacity reached; attendee was waitlisted.');
      return result.rsvp;
    },
    async cancelRsvp(eventId) {
      await repository.cancelAttendance(eventId, seedViewer);
      const item = rsvps.find((rsvp) => rsvp.eventId === eventId && rsvp.profileId === seedViewer.profileId);
      if (!item) throw new Error('RSVP not found.');
      return item;
    },
    async listAttendees(query) {
      return rsvps.filter((rsvp) => rsvp.eventId === query.eventId && rsvp.status === 'going');
    },
    async listOrganizerEvents(profileId) {
      return events.filter((event) => organizerRole(event.id, profileId));
    },
    async getEventForViewer(eventId, viewer) {
      const event = events.find((item) => item.id === eventId);
      return event && visible(event, viewer) ? forViewer(event, viewer) : null;
    },
    async createEventForViewer(draft, viewer) {
      if (!viewer.isVerifiedNeighborhoodMember || viewer.neighborhoodId !== draft.neighborhoodId)
        throw new Error('Verified neighborhood membership is required.');
      if (!draft.title.trim() || !draft.description.trim()) throw new Error('Title and description are required.');
      if (new Date(draft.startsAt).getTime() <= Date.now()) throw new Error('Event start time must be in the future.');
      if (draft.endsAt && new Date(draft.endsAt) <= new Date(draft.startsAt))
        throw new Error('Event end time must follow its start time.');
      const now = new Date().toISOString();
      const event: EventRuntimeDetails = {
        ...draft,
        id: `event-${events.length + 1}`,
        clusterId: viewer.clusterId,
        organizerProfileId: viewer.profileId,
        organizerDisplayName: viewer.displayName,
        title: draft.title.trim(),
        description: draft.description.trim(),
        status: 'draft',
        moderationStatus: 'pending',
        attendeeCount: 0,
        createdAt: now,
        updatedAt: now,
        locationType: 'in_person',
        commentsEnabled: true,
      };
      events.unshift(event);
      organizers.push({ eventId: event.id, profileId: viewer.profileId, role: 'owner' });
      return event;
    },
    async updateEventForViewer(eventId, draft, viewer) {
      requirePermission(eventId, viewer, 'edit_event');
      const existing = find(eventId);
      const updated = {
        ...existing,
        ...draft,
        endsAt: draft.endsAt === null ? undefined : (draft.endsAt ?? existing.endsAt),
        venueName: draft.venueName === null ? undefined : (draft.venueName ?? existing.venueName),
        capacity: draft.capacity === null ? undefined : (draft.capacity ?? existing.capacity),
        updatedAt: new Date().toISOString(),
      };
      events = events.map((event) => (event.id === eventId ? updated : event));
      rsvps
        .filter((rsvp) => rsvp.eventId === eventId && rsvp.status === 'going')
        .forEach((rsvp) => notify(eventId, rsvp.profileId, 'event_updated'));
      return updated;
    },
    async cancelEventForViewer(eventId, viewer) {
      requirePermission(eventId, viewer, 'cancel_event');
      const updated = { ...find(eventId), status: 'cancelled' as const, updatedAt: new Date().toISOString() };
      events = events.map((event) => (event.id === eventId ? updated : event));
      rsvps
        .filter((rsvp) => rsvp.eventId === eventId && rsvp.status === 'going')
        .forEach((rsvp) => notify(eventId, rsvp.profileId, 'event_cancelled'));
      return updated;
    },
    async setGoing(eventId, viewer) {
      const event = find(eventId);
      if (!visible(event, viewer) || event.status !== 'scheduled') throw new Error('Event is unavailable.');
      const currentGoing = rsvps.filter((item) => item.eventId === eventId && item.status === 'going').length;
      if (event.capacity !== undefined && currentGoing >= event.capacity) {
        interests = interests.filter((item) => !(item.eventId === eventId && item.profileId === viewer.profileId));
        interests.push({ eventId, profileId: viewer.profileId, status: 'waitlisted' });
        return { event: forViewer(find(eventId), viewer), interestStatus: 'waitlisted' };
      }
      let rsvp = rsvps.find((item) => item.eventId === eventId && item.profileId === viewer.profileId);
      const now = new Date().toISOString();
      if (rsvp) Object.assign(rsvp, { status: 'going', updatedAt: now });
      else {
        rsvp = {
          id: `rsvp-${eventId}-${viewer.profileId}`,
          eventId,
          profileId: viewer.profileId,
          attendeeDisplayName: viewer.displayName,
          status: 'going',
          createdAt: now,
          updatedAt: now,
        };
        rsvps.push(rsvp);
      }
      interests = interests.filter((item) => !(item.eventId === eventId && item.profileId === viewer.profileId));
      updateCount(eventId);
      return { event: forViewer(find(eventId), viewer), rsvp };
    },
    async setInterest(eventId, viewer) {
      const event = find(eventId);
      if (!visible(event, viewer)) throw new Error('Event is unavailable.');
      interests = interests.filter((item) => !(item.eventId === eventId && item.profileId === viewer.profileId));
      interests.push({ eventId, profileId: viewer.profileId, status: 'interested' });
      return { event: forViewer(event, viewer), interestStatus: 'interested' };
    },
    async cancelAttendance(eventId, viewer) {
      const rsvp = rsvps.find((item) => item.eventId === eventId && item.profileId === viewer.profileId);
      if (rsvp) {
        rsvp.status = 'cancelled';
        rsvp.updatedAt = new Date().toISOString();
      }
      interests = interests.filter((item) => !(item.eventId === eventId && item.profileId === viewer.profileId));
      updateCount(eventId);
      return { event: forViewer(find(eventId), viewer), rsvp };
    },
    async invite(eventId, inviteeProfileId, viewer) {
      requirePermission(eventId, viewer, 'invite_attendees');
      const existing = invitations.find(
        (item) => item.eventId === eventId && item.inviteeProfileId === inviteeProfileId && item.status === 'pending',
      );
      if (existing) return existing;
      const invitation = {
        id: `event-invite-${invitations.length + 1}`,
        eventId,
        inviterProfileId: viewer.profileId,
        inviteeProfileId,
        status: 'pending' as const,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
      };
      invitations.push(invitation);
      notify(eventId, inviteeProfileId, 'event_invitation');
      return invitation;
    },
    async addComment(eventId, body, viewer) {
      const event = find(eventId);
      if (!visible(event, viewer) || !event.commentsEnabled || !body.trim()) throw new Error('Comment is not allowed.');
      const comment = {
        id: `event-comment-${comments.length + 1}`,
        eventId,
        authorProfileId: viewer.profileId,
        authorDisplayName: viewer.displayName,
        body: body.trim(),
        moderationStatus: 'pending' as const,
        createdAt: new Date().toISOString(),
      };
      comments.push(comment);
      return comment;
    },
    async report(eventId, reason, viewer) {
      if (!visible(find(eventId), viewer)) throw new Error('Event is unavailable.');
      const existing = reports.find((item) => item.eventId === eventId && item.reporterProfileId === viewer.profileId);
      if (existing) return existing;
      const report = {
        id: `event-report-${reports.length + 1}`,
        eventId,
        reporterProfileId: viewer.profileId,
        reason: reason.trim(),
        createdAt: new Date().toISOString(),
      };
      reports.push(report);
      return report;
    },
    async scheduleReminder(eventId, remindAt, viewer) {
      if (!visible(find(eventId), viewer)) throw new Error('Event is unavailable.');
      const role = organizerRole(eventId, viewer.profileId);
      if (role) {
        requirePermission(eventId, viewer, 'send_reminders');
        rsvps
          .filter((rsvp) => rsvp.eventId === eventId && rsvp.status === 'going')
          .forEach((rsvp) => notify(eventId, rsvp.profileId, 'event_reminder'));
      }
      const existing = reminders.find((item) => item.eventId === eventId && item.profileId === viewer.profileId);
      if (existing) return existing;
      const reminder = {
        id: `event-reminder-${reminders.length + 1}`,
        eventId,
        profileId: viewer.profileId,
        remindAt,
        createdAt: new Date().toISOString(),
      };
      reminders.push(reminder);
      if (!role) notify(eventId, viewer.profileId, 'event_reminder');
      return reminder;
    },
    async addOrganizer(eventId, profileId, viewer) {
      requirePermission(eventId, viewer, 'manage_organizers');
      const existing = organizers.find((item) => item.eventId === eventId && item.profileId === profileId);
      if (existing) return existing;
      const organizer = { eventId, profileId, role: 'co_organizer' as const };
      organizers.push(organizer);
      return organizer;
    },
    async listOutbox() {
      return [...outbox];
    },
    resetForTests() {
      events = initialEvents.map((event) => ({ ...event }));
      rsvps = initialRsvps.map((rsvp) => ({ ...rsvp }));
      interests = [];
      organizers = [{ eventId: initialEvents[0].id, profileId: 'profile-akosua', role: 'owner' }];
      invitations = [];
      comments = [];
      reports = [];
      reminders = [];
      outbox = [];
    },
  };
  return repository;
}
