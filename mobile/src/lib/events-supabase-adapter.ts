import type { Event, EventDraft, EventRsvp, EventUpdateDraft } from '@/types/events';
import type { EventRuntimeDetails } from '@/types/events-runtime';

export type EventRow = {
  id: string;
  neighborhood_id: string;
  cluster_id: string;
  organizer_profile_id: string;
  organizer_display_name: string;
  title: string;
  description: string;
  cover_image_path: string | null;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  location_type: 'in_person' | 'virtual' | 'hybrid';
  venue_name: string | null;
  area_label: string;
  public_meetup_point: string | null;
  visibility: Event['visibility'];
  status: Event['status'];
  moderation_status: Event['moderationStatus'];
  capacity: number | null;
  attendee_count: number;
  comments_enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type EventRsvpRow = {
  id: string;
  event_id: string;
  profile_id: string;
  attendee_display_name: string;
  status: EventRsvp['status'];
  created_at: string;
  updated_at: string;
};

export type EventInsert = {
  client_request_id?: string;
  neighborhood_id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at?: string;
  timezone: string;
  venue_name?: string;
  area_label: string;
  visibility: Event['visibility'];
  capacity?: number;
};

export function fromEventRow(row: EventRow, currentUserRsvpStatus?: EventRsvp['status']): Event {
  return {
    id: row.id,
    neighborhoodId: row.neighborhood_id,
    organizerProfileId: row.organizer_profile_id,
    organizerDisplayName: row.organizer_display_name,
    title: row.title,
    description: row.description,
    startsAt: row.starts_at,
    endsAt: row.ends_at ?? undefined,
    timezone: row.timezone,
    venueName: row.venue_name ?? undefined,
    areaLabel: row.area_label,
    visibility: row.visibility,
    status: row.status,
    moderationStatus: row.moderation_status,
    capacity: row.capacity ?? undefined,
    attendeeCount: row.attendee_count,
    currentUserRsvpStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function fromEventRuntimeRow(
  row: EventRow,
  state: {
    currentUserRsvpStatus?: EventRsvp['status'];
    currentUserInterestStatus?: EventRuntimeDetails['currentUserInterestStatus'];
    preciseLocation?: string;
    virtualLink?: string;
    currentUserOrganizerRole?: EventRuntimeDetails['currentUserOrganizerRole'];
  } = {},
): EventRuntimeDetails {
  return {
    ...fromEventRow(row, state.currentUserRsvpStatus),
    clusterId: row.cluster_id,
    locationType: row.location_type,
    publicMeetupPoint: row.public_meetup_point ?? undefined,
    coverImageUrl: row.cover_image_path ?? undefined,
    commentsEnabled: row.comments_enabled,
    currentUserInterestStatus: state.currentUserInterestStatus,
    preciseLocation: state.preciseLocation,
    virtualLink: state.virtualLink,
    currentUserOrganizerRole: state.currentUserOrganizerRole,
  };
}

export function fromEventRsvpRow(row: EventRsvpRow): EventRsvp {
  return {
    id: row.id,
    eventId: row.event_id,
    profileId: row.profile_id,
    attendeeDisplayName: row.attendee_display_name,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toEventInsert(draft: EventDraft): EventInsert {
  return {
    client_request_id: draft.clientRequestId,
    neighborhood_id: draft.neighborhoodId,
    title: draft.title.trim(),
    description: draft.description.trim(),
    starts_at: draft.startsAt,
    ends_at: draft.endsAt,
    timezone: draft.timezone,
    venue_name: draft.venueName?.trim() || undefined,
    area_label: draft.areaLabel.trim(),
    visibility: draft.visibility,
    capacity: draft.capacity,
  };
}

export function toEventUpdate(draft: EventUpdateDraft): Record<string, string | number | null> {
  const row: Record<string, string | number | null> = {};
  if (draft.title !== undefined) row.title = draft.title.trim();
  if (draft.description !== undefined) row.description = draft.description.trim();
  if (draft.startsAt !== undefined) row.starts_at = draft.startsAt;
  if (draft.endsAt !== undefined) row.ends_at = draft.endsAt;
  if (draft.timezone !== undefined) row.timezone = draft.timezone;
  if (draft.venueName !== undefined) row.venue_name = draft.venueName === null ? null : draft.venueName.trim();
  if (draft.areaLabel !== undefined) row.area_label = draft.areaLabel.trim();
  if (draft.visibility !== undefined) row.visibility = draft.visibility;
  if (draft.capacity !== undefined) row.capacity = draft.capacity;
  return row;
}
