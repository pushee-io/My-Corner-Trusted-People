import type { EventsRepository, ListAttendeesQuery, ListEventsQuery } from '@/lib/events-repository';
import {
  EVENT_MODERATION_STATUSES,
  EVENT_ORGANIZER_PERMISSIONS,
  EVENT_ORGANIZER_ROLES,
  EVENT_ORGANIZER_ROLE_PERMISSIONS,
  EVENT_STATUSES,
  EVENT_VISIBILITIES,
  RSVP_STATUSES,
  type Event,
  type EventDraft,
  type EventOrganizerAccess,
  type EventRsvp,
  type EventUpdateDraft,
} from '@/types/events';

const event: Event = {
  id: 'event-east-legon-cleanup',
  neighborhoodId: 'east-legon',
  organizerProfileId: 'profile-akosua',
  organizerDisplayName: 'Akosua M.',
  title: 'East Legon community cleanup',
  description: 'Meet neighbors for a morning cleanup around the general community area.',
  startsAt: '2026-08-15T08:00:00.000Z',
  endsAt: '2026-08-15T10:00:00.000Z',
  timezone: 'Africa/Accra',
  venueName: 'East Legon community meeting point',
  areaLabel: 'East Legon, general area only',
  visibility: 'verified_neighborhood_members',
  status: 'scheduled',
  moderationStatus: 'approved',
  capacity: 40,
  attendeeCount: 12,
  currentUserRsvpStatus: 'going',
  createdAt: '2026-08-01T12:00:00.000Z',
  updatedAt: '2026-08-01T12:00:00.000Z',
};

const rsvp: EventRsvp = {
  id: 'rsvp-event-east-legon-cleanup-akosua',
  eventId: event.id,
  profileId: 'profile-akosua',
  attendeeDisplayName: 'Akosua M.',
  status: 'going',
  createdAt: '2026-08-01T12:05:00.000Z',
  updatedAt: '2026-08-01T12:05:00.000Z',
};

describe('Events Phase 1 contracts', () => {
  it('locks the lifecycle, visibility, moderation, RSVP, and organizer values', () => {
    expect(EVENT_STATUSES).toEqual(['draft', 'scheduled', 'cancelled', 'completed', 'archived']);
    expect(EVENT_VISIBILITIES).toEqual([
      'verified_neighborhood_members',
      'immediate_cluster_members',
      'invite_only',
    ]);
    expect(EVENT_MODERATION_STATUSES).toEqual(['pending', 'approved', 'rejected', 'blocked', 'removed']);
    expect(RSVP_STATUSES).toEqual(['going', 'cancelled']);
    expect(EVENT_ORGANIZER_ROLES).toEqual(['owner', 'co_organizer']);
    expect(EVENT_ORGANIZER_PERMISSIONS).toEqual([
      'edit_event',
      'cancel_event',
      'manage_attendees',
      'manage_organizers',
    ]);
  });

  it('gives owners and co-organizers explicit capabilities', () => {
    expect(EVENT_ORGANIZER_ROLE_PERMISSIONS.owner).toEqual({
      edit_event: true,
      cancel_event: true,
      manage_attendees: true,
      manage_organizers: true,
    });
    expect(EVENT_ORGANIZER_ROLE_PERMISSIONS.co_organizer).toEqual({
      edit_event: true,
      cancel_event: false,
      manage_attendees: true,
      manage_organizers: false,
    });

    const access: EventOrganizerAccess = {
      eventId: event.id,
      profileId: event.organizerProfileId,
      role: 'owner',
      permissions: EVENT_ORGANIZER_ROLE_PERMISSIONS.owner,
    };

    expect(access.permissions.manage_organizers).toBe(true);
  });

  it('keeps event and RSVP values JSON-safe', () => {
    expect(JSON.parse(JSON.stringify(event))).toEqual(event);
    expect(JSON.parse(JSON.stringify(rsvp))).toEqual(rsvp);
  });

  it('keeps drafts storage-agnostic and supports explicit nullable updates', () => {
    const draft: EventDraft = {
      neighborhoodId: 'east-legon',
      title: event.title,
      description: event.description,
      startsAt: event.startsAt,
      timezone: event.timezone,
      areaLabel: event.areaLabel,
      visibility: event.visibility,
    };
    const update: EventUpdateDraft = {
      endsAt: null,
      venueName: null,
      capacity: null,
      visibility: 'immediate_cluster_members',
    };

    expect(draft).not.toHaveProperty('organizerProfileId');
    expect(draft).not.toHaveProperty('moderationStatus');
    expect(update).toEqual({
      endsAt: null,
      venueName: null,
      capacity: null,
      visibility: 'immediate_cluster_members',
    });
  });

  it('locks the asynchronous repository signatures without a storage dependency', async () => {
    const repository: EventsRepository = {
      listEvents: async (_query: ListEventsQuery) => [event],
      getEvent: async (eventId: string) => (eventId === event.id ? event : null),
      createEvent: async (_draft: EventDraft) => event,
      updateEvent: async (_eventId: string, _draft: EventUpdateDraft) => event,
      cancelEvent: async (_eventId: string) => ({ ...event, status: 'cancelled' }),
      rsvp: async (_eventId: string) => rsvp,
      cancelRsvp: async (_eventId: string) => ({ ...rsvp, status: 'cancelled' }),
      listAttendees: async (_query: ListAttendeesQuery) => [rsvp],
      listOrganizerEvents: async (_organizerProfileId: string) => [event],
    };

    await expect(repository.listEvents({ neighborhoodId: 'east-legon' })).resolves.toEqual([event]);
    await expect(repository.getEvent('missing-event')).resolves.toBeNull();
    await expect(repository.cancelEvent(event.id)).resolves.toMatchObject({ status: 'cancelled' });
    await expect(repository.cancelRsvp(event.id)).resolves.toMatchObject({ status: 'cancelled' });
    await expect(repository.listAttendees({ eventId: event.id })).resolves.toEqual([rsvp]);
  });
});
