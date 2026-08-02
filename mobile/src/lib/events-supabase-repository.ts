import { getCurrentProfile } from '@/lib/auth';
import {
  fromEventRow,
  fromEventRuntimeRow,
  fromEventRsvpRow,
  toEventInsert,
  toEventUpdate,
  type EventRow,
  type EventRsvpRow,
} from '@/lib/events-supabase-adapter';
import type { EventsRepository, ListAttendeesQuery, ListEventsQuery } from '@/lib/events-repository';
import {
  EventsRuntimeError,
  type EventsRuntimeContext,
  type EventsRuntimeErrorCode,
  type EventsRuntimeRepository,
} from '@/lib/events-runtime-contract';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Event, EventDraft, EventRsvp, EventUpdateDraft } from '@/types/events';
import type {
  EventComment,
  EventInvitation,
  EventReminder,
  EventReport,
  EventRuntimeDetails,
} from '@/types/events-runtime';

const eventColumns =
  'id, neighborhood_id, cluster_id, organizer_profile_id, organizer_display_name, title, description, cover_image_path, starts_at, ends_at, timezone, location_type, venue_name, area_label, public_meetup_point, visibility, status, moderation_status, capacity, attendee_count, comments_enabled, created_at, updated_at';
const rsvpColumns = 'id, event_id, profile_id, attendee_display_name, status, created_at, updated_at';

async function readEvent(eventId: string): Promise<Event> {
  const { data, error } = await supabase.from('events').select(eventColumns).eq('id', eventId).single();
  if (error) throw error;
  return fromEventRow(data as EventRow);
}

type EventsContextRow = {
  profile_id: string;
  display_name: string;
  neighborhood_id: string;
  neighborhood_name: string;
  cluster_id: string;
  is_verified_neighborhood_member: boolean;
  is_staff: boolean;
};

type EventInvitationRow = {
  id: string;
  event_id: string;
  inviter_profile_id: string;
  invitee_profile_id: string;
  status: EventInvitation['status'];
  expires_at: string;
  created_at: string;
};

function toRuntimeError(caught: unknown): EventsRuntimeError {
  if (caught instanceof EventsRuntimeError) return caught;
  const candidate = caught as { code?: string; message?: string } | undefined;
  const rawMessage = candidate?.message ?? 'Events request failed.';
  const message = rawMessage.replace(/https?:\/\/\S+/gi, '[redacted-url]').replace(/eyJ[\w.-]+/g, '[redacted-token]').slice(0, 220);
  const code = candidate?.code;
  let runtimeCode: EventsRuntimeErrorCode = 'unknown';
  let retryable = false;

  if (/network|fetch|offline|timeout|connection/i.test(rawMessage)) {
    runtimeCode = 'offline';
    retryable = true;
  } else if (code === '42501' || /not authorized|unavailable/i.test(rawMessage)) {
    runtimeCode = 'forbidden';
  } else if (code === 'PGRST301' || /jwt|session|sign in|authentication required/i.test(rawMessage)) {
    runtimeCode = 'authentication_expired';
  } else if (code === '23505' || /duplicate/i.test(rawMessage)) {
    runtimeCode = 'duplicate';
  } else if (code === '22023' || code === '23514' || /required|invalid|must be/i.test(rawMessage)) {
    runtimeCode = 'validation';
  } else if (code === 'P0002' || /not found/i.test(rawMessage)) {
    runtimeCode = 'not_found';
  } else if (/capacity|waitlist|full/i.test(rawMessage)) {
    runtimeCode = 'capacity_reached';
  }

  return new EventsRuntimeError(runtimeCode, message, retryable);
}

async function runtimeCall<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (caught) {
    throw toRuntimeError(caught);
  }
}

function mapContext(row: EventsContextRow): EventsRuntimeContext {
  return {
    profileId: row.profile_id,
    displayName: row.display_name,
    neighborhoodId: row.neighborhood_id,
    neighborhoodName: row.neighborhood_name,
    clusterId: row.cluster_id,
    isVerifiedNeighborhoodMember: row.is_verified_neighborhood_member,
    isStaff: row.is_staff,
  };
}

function mapInvitation(row: EventInvitationRow): EventInvitation {
  return {
    id: row.id,
    eventId: row.event_id,
    inviterProfileId: row.inviter_profile_id,
    inviteeProfileId: row.invitee_profile_id,
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export function createSupabaseEventsRuntimeRepository(): EventsRuntimeRepository {
  assertSupabaseConfigured();
  const core = createSupabaseEventsRepository();

  async function getContext(): Promise<EventsRuntimeContext> {
    return runtimeCall(async () => {
      const { data, error } = await supabase.rpc('get_current_events_context');
      if (error) throw error;
      const row = (data as EventsContextRow[] | null)?.[0];
      if (!row) throw new EventsRuntimeError('forbidden', 'Verified neighborhood membership is required.');
      return mapContext(row);
    });
  }

  async function getEvent(eventId: string): Promise<EventRuntimeDetails | null> {
    return runtimeCall(async () => {
      const context = await getContext();
      const { data, error } = await supabase.from('events').select(eventColumns).eq('id', eventId).maybeSingle();
      if (error) throw error;
      if (!data) return null;

      const [rsvpResult, interestResult, privateResult, organizerResult] = await Promise.all([
        supabase
          .from('event_rsvps')
          .select('status')
          .eq('event_id', eventId)
          .eq('profile_id', context.profileId)
          .maybeSingle(),
        supabase
          .from('event_interests')
          .select('status')
          .eq('event_id', eventId)
          .eq('profile_id', context.profileId)
          .maybeSingle(),
        supabase.rpc('get_event_private_access', { target_event_id: eventId }),
        supabase
          .from('event_organizers')
          .select('role')
          .eq('event_id', eventId)
          .eq('profile_id', context.profileId)
          .maybeSingle(),
      ]);
      if (rsvpResult.error) throw rsvpResult.error;
      if (interestResult.error) throw interestResult.error;
      if (privateResult.error) throw privateResult.error;
      if (organizerResult.error) throw organizerResult.error;
      const privateAccess = (privateResult.data as { precise_address?: string; virtual_link?: string }[] | null)?.[0];
      const rsvpStatus = rsvpResult.data?.status === 'going' ? ('going' as const) : undefined;

      return fromEventRuntimeRow(data as EventRow, {
        currentUserRsvpStatus: rsvpStatus,
        currentUserInterestStatus: interestResult.data?.status,
        preciseLocation: privateAccess?.precise_address,
        virtualLink: privateAccess?.virtual_link,
        currentUserOrganizerRole: organizerResult.data?.role,
      });
    });
  }

  const repository: EventsRuntimeRepository = {
    mode: 'supabase',
    async isEnabled() {
      return runtimeCall(async () => {
        const { data, error } = await supabase.rpc('is_events_feature_enabled');
        if (error) throw error;
        return data === true;
      });
    },
    getContext,
    async listEvents() {
      return runtimeCall(async () => {
        const context = await getContext();
        const [visible, managed] = await Promise.all([
          core.listEvents({ neighborhoodId: context.neighborhoodId, clusterId: context.clusterId }),
          core.listOrganizerEvents(context.profileId),
        ]);
        return [...new Map([...visible, ...managed].map((event) => [event.id, event])).values()].sort((left, right) =>
          left.startsAt.localeCompare(right.startsAt),
        );
      });
    },
    getEvent,
    async createEvent(draft) {
      return runtimeCall(async () => {
        const context = await getContext();
        const insert = toEventInsert({ ...draft, neighborhoodId: context.neighborhoodId });
        const { data, error } = await supabase
          .from('events')
          .upsert(insert, { onConflict: 'organizer_profile_id,client_request_id' })
          .select(eventColumns)
          .single();
        if (error) throw error;
        return fromEventRuntimeRow(data as EventRow);
      });
    },
    async updateEvent(eventId, draft) {
      return runtimeCall(async () => {
        await core.updateEvent(eventId, draft);
        const event = await getEvent(eventId);
        if (!event) throw new EventsRuntimeError('not_found', 'Event not found.');
        return event;
      });
    },
    async transitionEvent(eventId, status) {
      return runtimeCall(async () => {
        const { error } = await supabase.rpc('transition_managed_event', {
          target_event_id: eventId,
          next_status: status,
        });
        if (error) throw error;
        const event = await getEvent(eventId);
        if (!event) throw new EventsRuntimeError('not_found', 'Event not found.');
        return event;
      });
    },
    async setGoing(eventId) {
      return runtimeCall(async () => {
        const { data, error } = await supabase.rpc('rsvp_to_event', { target_event_id: eventId });
        if (error) throw error;
        const event = await getEvent(eventId);
        if (!event) throw new EventsRuntimeError('not_found', 'Event not found.');
        if (data === 'waitlisted') return { event, interestStatus: 'waitlisted' };
        const rsvp = await readCurrentRsvp(eventId);
        return { event, rsvp };
      });
    },
    async setInterest(eventId) {
      return runtimeCall(async () => {
        const context = await getContext();
        const { error } = await supabase.from('event_interests').upsert({
          event_id: eventId,
          profile_id: context.profileId,
          status: 'interested',
          updated_at: new Date().toISOString(),
        });
        if (error) throw error;
        const event = await getEvent(eventId);
        if (!event) throw new EventsRuntimeError('not_found', 'Event not found.');
        return { event, interestStatus: 'interested' };
      });
    },
    async cancelAttendance(eventId) {
      return runtimeCall(async () => {
        const { error } = await supabase.rpc('cancel_event_rsvp', { target_event_id: eventId });
        if (error) throw error;
        const event = await getEvent(eventId);
        if (!event) throw new EventsRuntimeError('not_found', 'Event not found.');
        return { event };
      });
    },
    async invite(eventId, inviteeProfileId) {
      return runtimeCall(async () => {
        const { data, error } = await supabase
          .from('event_invitations')
          .insert({ event_id: eventId, invitee_profile_id: inviteeProfileId })
          .select('id,event_id,inviter_profile_id,invitee_profile_id,status,expires_at,created_at')
          .single();
        if (error) {
          if (error.code === '23505') {
            const existing = await supabase
              .from('event_invitations')
              .select('id,event_id,inviter_profile_id,invitee_profile_id,status,expires_at,created_at')
              .eq('event_id', eventId)
              .eq('invitee_profile_id', inviteeProfileId)
              .eq('status', 'pending')
              .single();
            if (existing.error) throw existing.error;
            return mapInvitation(existing.data as EventInvitationRow);
          }
          throw error;
        }
        return mapInvitation(data as EventInvitationRow);
      });
    },
    async respondToInvitation(invitationId, accept) {
      return runtimeCall(async () => {
        const { data, error } = await supabase.rpc('respond_to_event_invitation', {
          target_invitation_id: invitationId,
          accept_invitation: accept,
        });
        if (error) throw error;
        return data as EventInvitation['status'];
      });
    },
    async addComment(eventId, body) {
      return runtimeCall(async () => {
        const { data, error } = await supabase
          .from('event_comments')
          .insert({ event_id: eventId, body: body.trim() })
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
      });
    },
    async report(eventId, reason) {
      return runtimeCall(async () => {
        const context = await getContext();
        const columns = 'id,event_id,reporter_profile_id,reason,created_at';
        const existing = await supabase
          .from('event_reports')
          .select(columns)
          .eq('event_id', eventId)
          .eq('reporter_profile_id', context.profileId)
          .maybeSingle();
        if (existing.error) throw existing.error;
        let row = existing.data;
        if (!row) {
          const created = await supabase
            .from('event_reports')
            .insert({ event_id: eventId, reporter_profile_id: context.profileId, reason: reason.trim() })
            .select(columns)
            .single();
          if (created.error) throw created.error;
          row = created.data;
        }
        return {
          id: row.id,
          eventId: row.event_id,
          reporterProfileId: row.reporter_profile_id,
          reason: row.reason,
          createdAt: row.created_at,
        } as EventReport;
      });
    },
    async scheduleReminder(eventId, remindAt) {
      return runtimeCall(async () => {
        const context = await getContext();
        const { data, error } = await supabase
          .from('event_reminders')
          .upsert({ event_id: eventId, profile_id: context.profileId, remind_at: remindAt })
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
      });
    },
    async sendOrganizerReminder(eventId, message) {
      return runtimeCall(async () => {
        const { data, error } = await supabase.rpc('queue_event_organizer_reminder', {
          target_event_id: eventId,
          reminder_message: message,
        });
        if (error) throw error;
        return Number(data ?? 0);
      });
    },
    async moderateContent(kind, targetId, status, reason) {
      return runtimeCall(async () => {
        const { error } = await supabase.rpc('moderate_event_content', {
          target_kind: kind,
          target_id: targetId,
          next_status: status,
          decision_reason: reason,
        });
        if (error) throw error;
      });
    },
    async retryPendingWrites() {
      return 0;
    },
    getDiagnostics() {
      return { mode: 'supabase', lastReadUsedCache: false, pendingWriteCount: 0 };
    },
  };

  return repository;
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
