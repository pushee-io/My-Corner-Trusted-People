import type { Event, EventDraft, EventUpdateDraft } from '@/types/events';
import type {
  EventAttendanceResult,
  EventComment,
  EventInvitation,
  EventReminder,
  EventReport,
  EventRuntimeDetails,
} from '@/types/events-runtime';

export type EventsRuntimeMode = 'supabase' | 'seeded-development';

export type EventsRuntimeContext = {
  profileId: string;
  displayName: string;
  neighborhoodId: string;
  neighborhoodName: string;
  clusterId: string;
  isVerifiedNeighborhoodMember: boolean;
  isStaff: boolean;
};

export type EventsRuntimeErrorCode =
  | 'offline'
  | 'forbidden'
  | 'authentication_expired'
  | 'validation'
  | 'duplicate'
  | 'capacity_reached'
  | 'feature_disabled'
  | 'not_found'
  | 'unknown';

export class EventsRuntimeError extends Error {
  constructor(
    public readonly code: EventsRuntimeErrorCode,
    message: string,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = 'EventsRuntimeError';
  }
}

export type EventsRuntimeDiagnostics = {
  mode: EventsRuntimeMode;
  lastReadUsedCache: boolean;
  pendingWriteCount: number;
};

export type EventsRuntimeRepository = {
  mode: EventsRuntimeMode;
  isEnabled(): Promise<boolean>;
  getContext(): Promise<EventsRuntimeContext>;
  listEvents(): Promise<Event[]>;
  getEvent(eventId: string): Promise<EventRuntimeDetails | null>;
  createEvent(draft: EventDraft): Promise<EventRuntimeDetails>;
  updateEvent(eventId: string, draft: EventUpdateDraft): Promise<EventRuntimeDetails>;
  transitionEvent(eventId: string, status: 'cancelled' | 'completed' | 'archived'): Promise<EventRuntimeDetails>;
  setGoing(eventId: string): Promise<EventAttendanceResult>;
  setInterest(eventId: string): Promise<EventAttendanceResult>;
  cancelAttendance(eventId: string): Promise<EventAttendanceResult>;
  invite(eventId: string, inviteeProfileId: string): Promise<EventInvitation>;
  respondToInvitation(invitationId: string, accept: boolean): Promise<EventInvitation['status']>;
  addComment(eventId: string, body: string): Promise<EventComment>;
  report(eventId: string, reason: string): Promise<EventReport>;
  scheduleReminder(eventId: string, remindAt: string): Promise<EventReminder>;
  sendOrganizerReminder(eventId: string, message: string): Promise<number>;
  moderateContent(
    kind: 'event' | 'comment',
    targetId: string,
    status: 'approved' | 'rejected' | 'removed',
    reason: string,
  ): Promise<void>;
  retryPendingWrites(): Promise<number>;
  getDiagnostics(): EventsRuntimeDiagnostics;
};
