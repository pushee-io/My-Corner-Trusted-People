import type { Event, EventOrganizerRole, EventRsvp } from '@/types/events';

export type EventViewer = {
  profileId: string;
  displayName: string;
  neighborhoodId: string;
  clusterId: string;
  isVerifiedNeighborhoodMember: boolean;
  isModerator?: boolean;
};

export type EventLocationType = 'in_person' | 'virtual' | 'hybrid';
export type EventInterestStatus = 'interested' | 'not_going' | 'waitlisted';
export type EventInviteStatus = 'pending' | 'accepted' | 'declined' | 'revoked';

export type EventPrivateLocation = {
  eventId: string;
  preciseAddress: string;
  revealToConfirmedAttendees: boolean;
};

export type EventRuntimeDetails = Event & {
  clusterId: string;
  locationType: EventLocationType;
  publicMeetupPoint?: string;
  virtualLink?: string;
  coverImageUrl?: string;
  commentsEnabled: boolean;
  preciseLocation?: string;
  currentUserInterestStatus?: EventInterestStatus;
};

export type EventInvitation = {
  id: string;
  eventId: string;
  inviterProfileId: string;
  inviteeProfileId: string;
  status: EventInviteStatus;
  createdAt: string;
};

export type EventComment = {
  id: string;
  eventId: string;
  authorProfileId: string;
  authorDisplayName: string;
  body: string;
  moderationStatus: 'pending' | 'approved' | 'blocked' | 'removed';
  createdAt: string;
};

export type EventReport = {
  id: string;
  eventId: string;
  reporterProfileId: string;
  reason: string;
  createdAt: string;
};

export type EventReminder = {
  id: string;
  eventId: string;
  profileId: string;
  remindAt: string;
  createdAt: string;
};

export type EventOutboxItem = {
  id: string;
  eventId: string;
  recipientProfileId: string;
  kind: 'event_invitation' | 'event_updated' | 'event_cancelled' | 'event_reminder';
  payload: Record<string, string>;
  createdAt: string;
};

export type EventOrganizer = {
  eventId: string;
  profileId: string;
  role: EventOrganizerRole;
};

export type EventAttendanceResult = {
  event: EventRuntimeDetails;
  rsvp?: EventRsvp;
  interestStatus?: EventInterestStatus;
};
