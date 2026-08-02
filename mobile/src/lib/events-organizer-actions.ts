import { normalizeEventError } from '@/lib/events-errors';
import { eventsRepository } from '@/lib/events-runtime-repository';
import { supabase } from '@/lib/supabase';
import type { EventModerationStatus, EventUpdateDraft } from '@/types/events';

async function attempt<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (caught) {
    throw normalizeEventError(caught);
  }
}

export const eventOrganizerActions = {
  update(eventId: string, draft: EventUpdateDraft) {
    return eventsRepository.updateEventForViewer(eventId, draft, eventsRepository.defaultViewer);
  },
  cancel(eventId: string) {
    return eventsRepository.cancelEventForViewer(eventId, eventsRepository.defaultViewer);
  },
  listAttendees(eventId: string) {
    return eventsRepository.listAttendees({ eventId });
  },
  invite(eventId: string, profileId: string) {
    return eventsRepository.invite(eventId, profileId, eventsRepository.defaultViewer);
  },
  sendReminder(eventId: string, remindAt: string) {
    return eventsRepository.scheduleReminder(eventId, remindAt, eventsRepository.defaultViewer);
  },
  moderateComment(eventId: string, commentId: string, decision: EventModerationStatus) {
    return attempt(async () => {
      const event = await eventsRepository.getEventForViewer(eventId, eventsRepository.defaultViewer);
      if (!event?.currentUserOrganizerRole) throw new Error('You are not an organizer for this event.');
      const { error } = await supabase.rpc('moderate_event_comment', {
        target_comment_id: commentId,
        decision,
      });
      if (error) throw error;
    });
  },
};
