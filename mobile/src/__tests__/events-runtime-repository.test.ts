import { EventsRuntimeError, type EventsRuntimeRepository } from '@/lib/events-runtime-contract';
import { createResilientEventsRepository } from '@/lib/events-runtime-repository';
import type { EventRuntimeDetails } from '@/types/events-runtime';

const event: EventRuntimeDetails = {
  id: 'event-1',
  neighborhoodId: 'neighborhood-1',
  clusterId: 'cluster-1',
  organizerProfileId: 'profile-1',
  organizerDisplayName: 'Ama K.',
  title: 'Neighborhood cleanup',
  description: 'A cleanup for verified neighborhood members.',
  startsAt: '2026-09-12T09:00:00.000Z',
  timezone: 'Africa/Accra',
  areaLabel: 'General area only',
  visibility: 'verified_neighborhood_members',
  status: 'scheduled',
  moderationStatus: 'approved',
  attendeeCount: 1,
  createdAt: '2026-08-02T00:00:00.000Z',
  updatedAt: '2026-08-02T00:00:00.000Z',
  locationType: 'in_person',
  commentsEnabled: true,
};

function createInnerRepository(): EventsRuntimeRepository & { offline: boolean } {
  const repository: EventsRuntimeRepository & { offline: boolean } = {
    offline: false,
    mode: 'supabase',
    async isEnabled() { return true; },
    async getContext() {
      return {
        profileId: 'profile-2',
        displayName: 'Efua A.',
        neighborhoodId: 'neighborhood-1',
        neighborhoodName: 'East Legon',
        clusterId: 'cluster-1',
        isVerifiedNeighborhoodMember: true,
        isStaff: false,
      };
    },
    async listEvents() {
      if (repository.offline) throw new EventsRuntimeError('offline', 'offline', true);
      return [event];
    },
    async getEvent() {
      if (repository.offline) throw new EventsRuntimeError('offline', 'offline', true);
      return event;
    },
    async createEvent() { return event; },
    async updateEvent() { return event; },
    async transitionEvent() { return event; },
    async setGoing() {
      if (repository.offline) throw new EventsRuntimeError('offline', 'offline', true);
      return { event: { ...event, currentUserRsvpStatus: 'going', attendeeCount: 2 } };
    },
    async setInterest() { return { event, interestStatus: 'interested' }; },
    async cancelAttendance() { return { event }; },
    async invite() { throw new Error('not used'); },
    async respondToInvitation() { return 'accepted'; },
    async addComment() { throw new Error('not used'); },
    async report() { throw new Error('not used'); },
    async scheduleReminder() { throw new Error('not used'); },
    async sendOrganizerReminder() { return 0; },
    async moderateContent() {},
    async retryPendingWrites() { return 0; },
    getDiagnostics() { return { mode: 'supabase', lastReadUsedCache: false, pendingWriteCount: 0 }; },
  };
  return repository;
}

describe('resilient Events runtime repository', () => {
  it('uses cached live browse data when the network becomes unavailable', async () => {
    const inner = createInnerRepository();
    const repository = createResilientEventsRepository(inner);
    await expect(repository.listEvents()).resolves.toEqual([event]);
    inner.offline = true;
    await expect(repository.listEvents()).resolves.toEqual([event]);
    expect(repository.getDiagnostics().lastReadUsedCache).toBe(true);
  });

  it('optimistically records an RSVP and retries the idempotent write', async () => {
    const inner = createInnerRepository();
    const repository = createResilientEventsRepository(inner);
    await repository.getEvent(event.id);
    inner.offline = true;
    await expect(repository.setGoing(event.id)).resolves.toMatchObject({
      event: { currentUserRsvpStatus: 'going', attendeeCount: 2 },
    });
    expect(repository.getDiagnostics().pendingWriteCount).toBe(1);
    inner.offline = false;
    await expect(repository.retryPendingWrites()).resolves.toBe(1);
    expect(repository.getDiagnostics().pendingWriteCount).toBe(0);
  });
});
