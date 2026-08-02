import { getCurrentProfile } from '@/lib/auth';
import { normalizeEventError } from '@/lib/events-errors';
import type { CompleteEventsRepository } from '@/lib/events-repository';
import { fromEventRsvpRow, type EventRsvpRow } from '@/lib/events-supabase-adapter';
import { createSupabaseEventsRepository } from '@/lib/events-supabase-repository';
import { supabase } from '@/lib/supabase';
import type { EventDraft, EventUpdateDraft } from '@/types/events';
import type {
  EventComment,
  EventInvitation,
  EventOrganizer,
  EventReminder,
  EventReport,
  EventRuntimeDetails,
  EventViewer,
} from '@/types/events-runtime';

const runtimeViewer: EventViewer = {
  profileId: 'authenticated-profile',
  displayName: 'Signed-in neighbor',
  neighborhoodId: '',
  clusterId: '',
  isVerifiedNeighborhoodMember: true,
};

const runtimeColumns =
  'id,neighborhood_id,cluster_id,organizer_profile_id,organizer_display_name,title,description,starts_at,ends_at,timezone,location_type,venue_name,area_label,public_meetup_point,visibility,status,moderation_status,capacity,attendee_count,comments_enabled,created_at,updated_at';

async function attempt<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (caught) {
    throw normalizeEventError(caught);
  }
}

async function readDetails(eventId: string): Promise<EventRuntimeDetails | null> {
  const profile = await getCurrentProfile();
  const { data: row, error } = await supabase.from('events').select(runtimeColumns).eq('id', eventId).maybeSingle();
  if (error) throw error;
  if (!row) return null;

  const [{ data: organizer }, { data: rsvp }, { data: interest }, { data: privateRows, error: privateError }] =
    await Promise.all([
      supabase
        .from('event_organizers')
        .select('role')
        .eq('event_id', eventId)
        .eq('profile_id', profile.id)
        .maybeSingle(),
      supabase.from('event_rsvps').select('status').eq('event_id', eventId).eq('profile_id', profile.id).maybeSingle(),
      supabase
        .from('event_interests')
        .select('status')
        .eq('event_id', eventId)
        .eq('profile_id', profile.id)
        .maybeSingle(),
      supabase.rpc('get_event_private_access', { target_event_id: eventId }),
    ]);
  if (privateError) throw privateError;
  const privateAccess = Array.isArray(privateRows) ? privateRows[0] : privateRows;

  return {
    id: row.id,
    neighborhoodId: row.neighborhood_id,
    clusterId: row.cluster_id,
    organizerProfileId: row.organizer_profile_id,
    organizerDisplayName: row.organizer_display_name,
    title: row.title,
    description: row.description,
    startsAt: row.starts_at,
    endsAt: row.ends_at ?? undefined,
    timezone: row.timezone,
    locationType: row.location_type,
    venueName: row.venue_name ?? undefined,
    areaLabel: row.area_label,
    publicMeetupPoint: row.public_meetup_point ?? undefined,
    visibility: row.visibility,
    status: row.status,
    moderationStatus: row.moderation_status,
    capacity: row.capacity ?? undefined,
    attendeeCount: row.attendee_count,
    commentsEnabled: row.comments_enabled,
    currentUserRsvpStatus: rsvp?.status,
    currentUserInterestStatus: interest?.status,
    currentUserOrganizerRole: organizer?.role,
    preciseLocation: privateAccess?.precise_address ?? undefined,
    virtualLink: privateAccess?.virtual_link ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as EventRuntimeDetails;
}

export function createCompleteSupabaseEventsRepository(): CompleteEventsRepository {
  const base = createSupabaseEventsRepository();
  const repository: CompleteEventsRepository = {
    ...base,
    defaultViewer: runtimeViewer,
    getEventForViewer: (eventId) => attempt(() => readDetails(eventId)),
    createEventForViewer: (draft: EventDraft) =>
      attempt(async () => {
        const event = await base.createEvent(draft);
        const details = await readDetails(event.id);
        if (!details) throw new Error('Created event could not be read.');
        return details;
      }),
    updateEventForViewer: (eventId: string, draft: EventUpdateDraft) =>
      attempt(async () => {
        await base.updateEvent(eventId, draft);
        const details = await readDetails(eventId);
        if (!details) throw new Error('Updated event could not be read.');
        return details;
      }),
    cancelEventForViewer: (eventId) =>
      attempt(async () => {
        await base.cancelEvent(eventId);
        const details = await readDetails(eventId);
        if (!details) throw new Error('Cancelled event could not be read.');
        return details;
      }),
    setGoing: (eventId) =>
      attempt(async () => {
        const { data, error } = await supabase.rpc('rsvp_to_event', { target_event_id: eventId });
        if (error) throw error;
        const event = await readDetails(eventId);
        if (!event) throw new Error('Event unavailable.');
        if (data === 'waitlisted') return { event, interestStatus: 'waitlisted' as const };
        const profile = await getCurrentProfile();
        const { data: rsvpRow, error: rsvpError } = await supabase
          .from('event_rsvps')
          .select('id,event_id,profile_id,attendee_display_name,status,created_at,updated_at')
          .eq('event_id', eventId)
          .eq('profile_id', profile.id)
          .single();
        if (rsvpError) throw rsvpError;
        const rsvp = fromEventRsvpRow(rsvpRow as EventRsvpRow);
        return { event, rsvp };
      }),
    setInterest: (eventId) =>
      attempt(async () => {
        const profile = await getCurrentProfile();
        const { error } = await supabase
          .from('event_interests')
          .upsert({ event_id: eventId, profile_id: profile.id, status: 'interested' });
        if (error) throw error;
        const event = await readDetails(eventId);
        if (!event) throw new Error('Event unavailable.');
        return { event, interestStatus: 'interested' as const };
      }),
    cancelAttendance: (eventId) =>
      attempt(async () => {
        const rsvp = await base.cancelRsvp(eventId);
        const event = await readDetails(eventId);
        if (!event) throw new Error('Event unavailable.');
        return { event, rsvp };
      }),
    invite: (eventId, inviteeProfileId) =>
      attempt(async () => {
        const profile = await getCurrentProfile();
        const { data, error } = await supabase
          .from('event_invitations')
          .insert({ event_id: eventId, inviter_profile_id: profile.id, invitee_profile_id: inviteeProfileId })
          .select('id,event_id,inviter_profile_id,invitee_profile_id,status,expires_at,created_at')
          .single();
        if (error) throw error;
        return {
          id: data.id,
          eventId: data.event_id,
          inviterProfileId: data.inviter_profile_id,
          inviteeProfileId: data.invitee_profile_id,
          status: data.status,
          expiresAt: data.expires_at,
          createdAt: data.created_at,
        } as EventInvitation;
      }),
    addComment: (eventId, body) =>
      attempt(async () => {
        const profile = await getCurrentProfile();
        const { data, error } = await supabase
          .from('event_comments')
          .insert({ event_id: eventId, author_profile_id: profile.id, author_display_name: profile.displayName, body })
          .select('id,event_id,author_profile_id,author_display_name,body,moderation_status,created_at')
          .single();
        if (error) throw error;
        return {
          id: data.id,
          eventId: data.event_id,
          authorProfileId: data.author_profile_id,
          authorDisplayName: data.author_display_name,
          body: data.body,
          moderationStatus: data.moderation_status,
          createdAt: data.created_at,
        } as EventComment;
      }),
    report: (eventId, reason) =>
      attempt(async () => {
        const profile = await getCurrentProfile();
        const { data, error } = await supabase
          .from('event_reports')
          .upsert(
            { event_id: eventId, reporter_profile_id: profile.id, reason },
            { onConflict: 'event_id,reporter_profile_id' },
          )
          .select('id,event_id,reporter_profile_id,reason,created_at')
          .single();
        if (error) throw error;
        return {
          id: data.id,
          eventId: data.event_id,
          reporterProfileId: data.reporter_profile_id,
          reason: data.reason,
          createdAt: data.created_at,
        } as EventReport;
      }),
    scheduleReminder: (eventId, remindAt) =>
      attempt(async () => {
        const profile = await getCurrentProfile();
        const { data: organizer, error: organizerError } = await supabase
          .from('event_organizers')
          .select('role')
          .eq('event_id', eventId)
          .eq('profile_id', profile.id)
          .maybeSingle();
        if (organizerError) throw organizerError;
        if (organizer) {
          const { error } = await supabase.rpc('send_managed_event_reminder', { target_event_id: eventId });
          if (error) throw error;
          return {
            id: `organizer-reminder-${eventId}-${profile.id}`,
            eventId,
            profileId: profile.id,
            remindAt,
            createdAt: new Date().toISOString(),
          } as EventReminder;
        }
        const { data, error } = await supabase
          .from('event_reminders')
          .upsert({ event_id: eventId, profile_id: profile.id, remind_at: remindAt })
          .select('id,event_id,profile_id,remind_at,created_at')
          .single();
        if (error) throw error;
        return {
          id: data.id,
          eventId: data.event_id,
          profileId: data.profile_id,
          remindAt: data.remind_at,
          createdAt: data.created_at,
        } as EventReminder;
      }),
    addOrganizer: (eventId, profileId) =>
      attempt(async () => {
        const { data, error } = await supabase
          .from('event_organizers')
          .insert({ event_id: eventId, profile_id: profileId, role: 'co_organizer' })
          .select('event_id,profile_id,role')
          .single();
        if (error) throw error;
        return { eventId: data.event_id, profileId: data.profile_id, role: data.role } as EventOrganizer;
      }),
    async listOutbox() {
      return [];
    },
    resetForTests() {},
  };
  return repository;
}
