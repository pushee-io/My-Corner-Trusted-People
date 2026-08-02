import { getCurrentProfile } from '@/lib/auth';
import { fromEventRow, fromEventRsvpRow, toEventInsert, toEventUpdate, type EventRow, type EventRsvpRow } from '@/lib/events-supabase-adapter';
import type { EventsRepository, ListAttendeesQuery, ListEventsQuery } from '@/lib/events-repository';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Event, EventDraft, EventRsvp, EventUpdateDraft } from '@/types/events';

const eventColumns = 'id, neighborhood_id, cluster_id, organizer_profile_id, organizer_display_name, title, description, starts_at, ends_at, timezone, venue_name, area_label, visibility, status, moderation_status, capacity, attendee_count, created_at, updated_at';
const rsvpColumns = 'id, event_id, profile_id, attendee_display_name, status, created_at, updated_at';

async function readEvent(eventId: string): Promise<Event> {
  const { data, error } = await supabase.from('events').select(eventColumns).eq('id', eventId).single();
  if (error) throw error;
  return fromEventRow(data as EventRow);
}

async function readCurrentRsvp(eventId: string): Promise<EventRsvp> {
  const profile = await getCurrentProfile();
  const { data, error } = await supabase
    .from('event_rsvps')
    .select(rsvpColumns)
    .eq('event_id', eventId)
    .eq('profile_id', profile.id)
    .single();
  if (error) throw error;
  return fromEventRsvpRow(data as EventRsvpRow);
}

export function createSupabaseEventsRepository(): EventsRepository {
  assertSupabaseConfigured();

  return {
    async listEvents(query: ListEventsQuery) {
      let request = supabase
        .from('events')
        .select(eventColumns)
        .eq('status', 'scheduled')
        .eq('moderation_status', 'approved')
        .order('starts_at', { ascending: true });

      request = query.clusterId
        ? request.or(`neighborhood_id.eq.${query.neighborhoodId},cluster_id.eq.${query.clusterId}`)
        : request.eq('neighborhood_id', query.neighborhoodId);

      const { data, error } = await request;
      if (error) throw error;
      return ((data ?? []) as EventRow[]).map((row) => fromEventRow(row));
    },

    async getEvent(eventId: string) {
      const { data, error } = await supabase.from('events').select(eventColumns).eq('id', eventId).maybeSingle();
      if (error) throw error;
      return data ? fromEventRow(data as EventRow) : null;
    },

    async createEvent(draft: EventDraft) {
      const { data, error } = await supabase.from('events').insert(toEventInsert(draft)).select(eventColumns).single();
      if (error) throw error;
      return fromEventRow(data as EventRow);
    },

    async updateEvent(eventId: string, draft: EventUpdateDraft) {
      const { data, error } = await supabase
        .from('events')
        .update(toEventUpdate(draft))
        .eq('id', eventId)
        .select(eventColumns)
        .single();
      if (error) throw error;
      return fromEventRow(data as EventRow);
    },

    async cancelEvent(eventId: string) {
      const { error } = await supabase.rpc('cancel_managed_event', { target_event_id: eventId });
      if (error) throw error;
      return readEvent(eventId);
    },

    async rsvp(eventId: string) {
      const { data, error } = await supabase.rpc('rsvp_to_event', { target_event_id: eventId });
      if (error) throw error;
      if (data === 'waitlisted') throw new Error('This event is full. You have been added to the waitlist.');
      return readCurrentRsvp(eventId);
    },

    async cancelRsvp(eventId: string) {
      const { error } = await supabase.rpc('cancel_event_rsvp', { target_event_id: eventId });
      if (error) throw error;
      return readCurrentRsvp(eventId);
    },

    async listAttendees(query: ListAttendeesQuery) {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select(rsvpColumns)
        .eq('event_id', query.eventId)
        .eq('status', 'going')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return ((data ?? []) as EventRsvpRow[]).map(fromEventRsvpRow);
    },

    async listOrganizerEvents(organizerProfileId: string) {
      const { data: access, error: accessError } = await supabase
        .from('event_organizers')
        .select('event_id')
        .eq('profile_id', organizerProfileId);
      if (accessError) throw accessError;
      const eventIds = (access ?? []).map((row) => row.event_id);
      if (eventIds.length === 0) return [];
      const { data, error } = await supabase.from('events').select(eventColumns).in('id', eventIds).order('starts_at');
      if (error) throw error;
      return ((data ?? []) as EventRow[]).map((row) => fromEventRow(row));
    },
  };
}
