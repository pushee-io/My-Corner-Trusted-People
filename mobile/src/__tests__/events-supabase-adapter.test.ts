import { fromEventRow, fromEventRuntimeRow, toEventInsert, toEventUpdate, type EventRow } from '@/lib/events-supabase-adapter';

const row: EventRow = {
  id: 'event-1',
  neighborhood_id: 'east-legon',
  cluster_id: 'accra-east',
  organizer_profile_id: 'profile-akosua',
  organizer_display_name: 'Akosua M.',
  title: 'Community cleanup',
  description: 'A neighborhood cleanup.',
  cover_image_path: null,
  starts_at: '2026-09-12T09:00:00.000Z',
  ends_at: null,
  timezone: 'Africa/Accra',
  location_type: 'in_person',
  venue_name: null,
  area_label: 'East Legon, general area only',
  public_meetup_point: null,
  visibility: 'verified_neighborhood_members',
  status: 'scheduled',
  moderation_status: 'approved',
  capacity: null,
  attendee_count: 0,
  comments_enabled: true,
  created_at: '2026-08-01T12:00:00.000Z',
  updated_at: '2026-08-01T12:00:00.000Z',
};

describe('Events Supabase adapter', () => {
  it('maps nullable storage values without leaking snake case', () => {
    expect(fromEventRow(row)).toMatchObject({
      id: 'event-1',
      endsAt: undefined,
      venueName: undefined,
      attendeeCount: 0,
    });
  });

  it('normalizes inserts and preserves explicit null updates', () => {
    expect(
      toEventInsert({
        neighborhoodId: 'east-legon',
        title: '  Cleanup  ',
        description: '  Join us. ',
        startsAt: row.starts_at,
        timezone: 'Africa/Accra',
        areaLabel: ' East Legon ',
        visibility: 'verified_neighborhood_members',
      }),
    ).toMatchObject({ title: 'Cleanup', description: 'Join us.', area_label: 'East Legon' });
    expect(toEventUpdate({ endsAt: null, venueName: null, capacity: null })).toEqual({
      ends_at: null,
      venue_name: null,
      capacity: null,
    });
  });

  it('maps runtime-only public fields and private access without leaking storage names', () => {
    expect(
      fromEventRuntimeRow(row, {
        currentUserOrganizerRole: 'co_organizer',
        currentUserInterestStatus: 'interested',
        preciseLocation: 'Private location',
      }),
    ).toMatchObject({
      clusterId: 'accra-east',
      locationType: 'in_person',
      commentsEnabled: true,
      currentUserOrganizerRole: 'co_organizer',
      currentUserInterestStatus: 'interested',
      preciseLocation: 'Private location',
    });
  });
});
