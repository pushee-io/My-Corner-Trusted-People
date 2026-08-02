import fs from 'node:fs';
import path from 'node:path';
jest.mock('@/lib/events-supabase-complete-repository', () => ({
  createCompleteSupabaseEventsRepository: jest.fn(),
}));
import { createRuntimeEventsRepository, getQueuedEventMutationCount } from '@/lib/events-runtime-repository';
import type { CompleteEventsRepository } from '@/lib/events-repository';
import { EventRepositoryError } from '@/lib/events-errors';
import { createSeededEventsRepository } from '@/lib/events-repository';

const root = path.resolve(__dirname, '../..');
const owner = {
  profileId: 'profile-akosua',
  displayName: 'Akosua M.',
  neighborhoodId: 'east-legon',
  clusterId: 'accra-east',
  isVerifiedNeighborhoodMember: true,
};

function offlineRepository(seed: CompleteEventsRepository): CompleteEventsRepository {
  const offline = new EventRepositoryError('offline', 'offline', true);
  return {
    ...seed,
    listEvents: async () => Promise.reject(offline),
    createEvent: async () => Promise.reject(offline),
    rsvp: async () => Promise.reject(offline),
    setGoing: async () => Promise.reject(offline),
  };
}

describe('Events stabilization', () => {
  it('keeps screens on the runtime boundary and protects every Events route with a layout guard', () => {
    const routeDirectory = path.join(root, 'app/events');
    const screens = fs
      .readdirSync(routeDirectory)
      .filter((file) => file.endsWith('.tsx') && file !== '_layout.tsx')
      .map((file) => fs.readFileSync(path.join(routeDirectory, file), 'utf8'));
    screens.push(fs.readFileSync(path.join(routeDirectory, '[eventId]/manage.tsx'), 'utf8'));
    expect(screens.every((source) => source.includes('@/lib/events-runtime-repository'))).toBe(true);
    expect(screens.every((source) => !source.includes('@/lib/events-repository'))).toBe(true);
    expect(fs.readFileSync(path.join(routeDirectory, '_layout.tsx'), 'utf8')).toContain('useEventsFeatureFlag');
    expect(fs.readFileSync(path.join(root, 'app/home.tsx'), 'utf8')).toContain('eventsEnabled ?');
    expect(screens.at(-1)).toContain('organizerCan');
  });

  it('serves cached browse data when the live repository goes offline', async () => {
    const seed = createSeededEventsRepository(owner);
    let offline = false;
    const live = {
      ...seed,
      listEvents: async (query: Parameters<CompleteEventsRepository['listEvents']>[0]) => {
        if (offline) throw new EventRepositoryError('offline', 'offline', true);
        return seed.listEvents(query);
      },
    };
    const repository = createRuntimeEventsRepository(() => live);
    const query = { neighborhoodId: owner.neighborhoodId, clusterId: owner.clusterId };
    const first = await repository.listEvents(query);
    offline = true;
    await expect(repository.listEvents(query)).resolves.toEqual(first);
  });

  it('queues failed create and RSVP mutations with optimistic results', async () => {
    const seed = createSeededEventsRepository(owner);
    const repository = createRuntimeEventsRepository(() => offlineRepository(seed), {
      now: () => '2026-08-02T17:00:00.000Z',
    });
    const created = await repository.createEvent({
      neighborhoodId: owner.neighborhoodId,
      title: 'Offline planning session',
      description: 'A complete description for an offline event draft.',
      startsAt: '2026-09-12T09:00:00.000Z',
      timezone: 'Africa/Accra',
      areaLabel: 'East Legon, general area only',
      visibility: 'verified_neighborhood_members',
    });
    const rsvp = await repository.rsvp('event-east-legon-cleanup');
    expect(created.id).toContain('offline-event');
    expect(rsvp.status).toBe('going');
    expect(getQueuedEventMutationCount()).toBe(2);
    repository.resetForTests();
  });

  it('locks invitation, lifecycle, RLS, and immutable audit controls in the stabilization migration', () => {
    const sql = fs.readFileSync(
      path.join(root, '../supabase/migrations/20260802170000_events_stabilization.sql'),
      'utf8',
    );
    expect(sql).toContain('add column if not exists expires_at');
    expect(sql).toContain('active event invitation already exists');
    expect(sql).toContain('event invitation rate limit exceeded');
    expect(sql).toContain('invitee is outside the event audience');
    expect(sql).toContain('validate_event_lifecycle_transition');
    expect(sql).toContain('event_invitation_created');
    expect(sql).toContain('revoke update, delete on public.event_audit_events');
    expect(sql).toContain("eo.role = 'co_organizer'");
  });
});
