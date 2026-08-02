import { createSeededEventsRepository } from '@/lib/events-repository';
import type { EventDraft } from '@/types/events';
import type { EventViewer } from '@/types/events-runtime';

const owner: EventViewer = {
  profileId: 'profile-akosua', displayName: 'Akosua M.', neighborhoodId: 'east-legon',
  clusterId: 'accra-east', isVerifiedNeighborhoodMember: true,
};
const neighbor: EventViewer = {
  profileId: 'profile-efua', displayName: 'Efua A.', neighborhoodId: 'east-legon',
  clusterId: 'accra-east', isVerifiedNeighborhoodMember: true,
};
const outsider: EventViewer = {
  profileId: 'profile-kojo', displayName: 'Kojo N.', neighborhoodId: 'osu',
  clusterId: 'accra-central', isVerifiedNeighborhoodMember: true,
};
const draft: EventDraft = {
  neighborhoodId: 'east-legon', title: 'Neighborhood planning session',
  description: 'Plan the next community cleanup with verified residents.',
  startsAt: '2026-09-12T09:00:00.000Z', endsAt: '2026-09-12T10:00:00.000Z',
  timezone: 'Africa/Accra', areaLabel: 'East Legon, general area only',
  visibility: 'verified_neighborhood_members', capacity: 10,
};

describe('Events complete repository', () => {
  it('creates a moderated draft and rejects unverified creation', async () => {
    const repository = createSeededEventsRepository(owner);
    await expect(repository.createEventForViewer(draft, owner)).resolves.toMatchObject({ status: 'draft', moderationStatus: 'pending' });
    await expect(repository.createEventForViewer(draft, { ...owner, isVerifiedNeighborhoodMember: false })).rejects.toThrow('Verified neighborhood membership');
  });

  it('enforces neighborhood and cluster visibility', async () => {
    const repository = createSeededEventsRepository(owner);
    await expect(repository.getEventForViewer('event-east-legon-cleanup', neighbor)).resolves.not.toBeNull();
    await expect(repository.getEventForViewer('event-east-legon-cleanup', outsider)).resolves.toBeNull();
    await expect(repository.getEventForViewer('event-accra-east-safety', neighbor)).resolves.not.toBeNull();
  });

  it('keeps precise locations private until a confirmed RSVP', async () => {
    const repository = createSeededEventsRepository(owner);
    await expect(repository.getEventForViewer('event-east-legon-cleanup', neighbor)).resolves.not.toHaveProperty('preciseLocation');
    await repository.setGoing('event-east-legon-cleanup', neighbor);
    await expect(repository.getEventForViewer('event-east-legon-cleanup', neighbor)).resolves.toMatchObject({ preciseLocation: 'Private residential address' });
  });

  it('waitlists at capacity and safely promotes no one without an explicit workflow', async () => {
    const repository = createSeededEventsRepository(owner);
    await repository.setGoing('event-east-legon-cleanup', neighbor);
    const result = await repository.setGoing('event-east-legon-cleanup', { ...neighbor, profileId: 'profile-yaw', displayName: 'Yaw T.' });
    expect(result.interestStatus).toBe('waitlisted');
    expect(result.rsvp).toBeUndefined();
  });

  it('limits cancellation and organizer management by role', async () => {
    const repository = createSeededEventsRepository(owner);
    await expect(repository.cancelEventForViewer('event-east-legon-cleanup', neighbor)).rejects.toThrow('not authorized');
    await repository.addOrganizer('event-east-legon-cleanup', neighbor.profileId, owner);
    await expect(repository.updateEventForViewer('event-east-legon-cleanup', { title: 'Updated title' }, neighbor)).resolves.toMatchObject({ title: 'Updated title' });
    await expect(repository.cancelEventForViewer('event-east-legon-cleanup', neighbor)).rejects.toThrow('not authorized');
  });

  it('makes invitations idempotent without granting attendance', async () => {
    const repository = createSeededEventsRepository(owner);
    const first = await repository.invite('event-east-legon-cleanup', neighbor.profileId, owner);
    const second = await repository.invite('event-east-legon-cleanup', neighbor.profileId, owner);
    expect(second.id).toBe(first.id);
    expect(await repository.listAttendees({ eventId: 'event-east-legon-cleanup' })).toHaveLength(1);
  });

  it('creates moderated comments and idempotent reports', async () => {
    const repository = createSeededEventsRepository(owner);
    await expect(repository.addComment('event-east-legon-cleanup', 'I can bring refuse bags.', neighbor)).resolves.toMatchObject({ moderationStatus: 'pending' });
    const first = await repository.report('event-east-legon-cleanup', 'Needs review', neighbor);
    const second = await repository.report('event-east-legon-cleanup', 'Duplicate', neighbor);
    expect(second.id).toBe(first.id);
  });

  it('queues update, cancellation, invitation, and reminder domain events', async () => {
    const repository = createSeededEventsRepository(owner);
    await repository.invite('event-east-legon-cleanup', neighbor.profileId, owner);
    await repository.scheduleReminder('event-east-legon-cleanup', '2026-08-15T07:00:00.000Z', neighbor);
    await repository.updateEventForViewer('event-east-legon-cleanup', { title: 'Cleanup and recycling morning' }, owner);
    await repository.cancelEventForViewer('event-east-legon-cleanup', owner);
    expect((await repository.listOutbox()).map((item) => item.kind)).toEqual(expect.arrayContaining(['event_invitation', 'event_reminder', 'event_updated', 'event_cancelled']));
  });
});
