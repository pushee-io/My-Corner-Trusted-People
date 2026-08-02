export const EVENT_STATUSES = ['draft', 'scheduled', 'cancelled', 'completed', 'archived'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const EVENT_VISIBILITIES = [
  'verified_neighborhood_members',
  'immediate_cluster_members',
  'private_invitees',
] as const;
export type EventVisibility = (typeof EVENT_VISIBILITIES)[number];

export const EVENT_MODERATION_STATUSES = ['pending', 'approved', 'rejected', 'removed'] as const;
export type EventModerationStatus = (typeof EVENT_MODERATION_STATUSES)[number];

export const RSVP_STATUSES = ['going', 'cancelled'] as const;
export type RsvpStatus = (typeof RSVP_STATUSES)[number];

export const EVENT_ORGANIZER_ROLES = ['owner', 'co_organizer'] as const;
export type EventOrganizerRole = (typeof EVENT_ORGANIZER_ROLES)[number];

export const EVENT_ORGANIZER_PERMISSIONS = [
  'edit_event',
  'cancel_event',
  'manage_attendees',
  'manage_organizers',
  'send_reminders',
  'moderate_content',
  'invite_attendees',
] as const;
export type EventOrganizerPermission = (typeof EVENT_ORGANIZER_PERMISSIONS)[number];

export type EventOrganizerPermissionSet = Readonly<Record<EventOrganizerPermission, boolean>>;

export const EVENT_ORGANIZER_ROLE_PERMISSIONS = {
  owner: {
    edit_event: true,
    cancel_event: true,
    manage_attendees: true,
    manage_organizers: true,
    send_reminders: true,
    moderate_content: true,
    invite_attendees: true,
  },
  co_organizer: {
    edit_event: true,
    cancel_event: false,
    manage_attendees: true,
    manage_organizers: false,
    send_reminders: true,
    moderate_content: true,
    invite_attendees: true,
  },
} as const satisfies Readonly<Record<EventOrganizerRole, EventOrganizerPermissionSet>>;

export function organizerCan(role: EventOrganizerRole | undefined, permission: EventOrganizerPermission) {
  return role ? EVENT_ORGANIZER_ROLE_PERMISSIONS[role][permission] : false;
}

export const EVENT_LIFECYCLE_STATES = [
  'pending',
  'approved',
  'rejected',
  'removed',
  'cancelled',
  'completed',
  'archived',
] as const;
export type EventLifecycleState = (typeof EVENT_LIFECYCLE_STATES)[number];

export function getEventLifecycleState(event: Pick<Event, 'status' | 'moderationStatus'>): EventLifecycleState {
  if (event.status === 'cancelled' || event.status === 'completed' || event.status === 'archived') return event.status;
  return event.moderationStatus;
}

export type EventOrganizerAccess = {
  eventId: string;
  profileId: string;
  role: EventOrganizerRole;
  permissions: EventOrganizerPermissionSet;
};

export type Event = {
  id: string;
  neighborhoodId: string;
  organizerProfileId: string;
  organizerDisplayName: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt?: string;
  timezone: string;
  venueName?: string;
  areaLabel: string;
  visibility: EventVisibility;
  status: EventStatus;
  moderationStatus: EventModerationStatus;
  capacity?: number;
  attendeeCount: number;
  currentUserRsvpStatus?: RsvpStatus;
  createdAt: string;
  updatedAt: string;
};

export type EventDraft = {
  neighborhoodId: string;
  title: string;
  description: string;
  startsAt: string;
  endsAt?: string;
  timezone: string;
  venueName?: string;
  areaLabel: string;
  visibility: EventVisibility;
  capacity?: number;
};

export type EventUpdateDraft = {
  title?: string;
  description?: string;
  startsAt?: string;
  endsAt?: string | null;
  timezone?: string;
  venueName?: string | null;
  areaLabel?: string;
  visibility?: EventVisibility;
  capacity?: number | null;
};

export type EventRsvp = {
  id: string;
  eventId: string;
  profileId: string;
  attendeeDisplayName: string;
  status: RsvpStatus;
  createdAt: string;
  updatedAt: string;
};
