import { EventsRuntimeError } from '@/lib/events-runtime-contract';

export function eventErrorMessage(caught: unknown): string {
  if (!(caught instanceof EventsRuntimeError)) {
    return caught instanceof Error ? caught.message : 'The Events request failed.';
  }
  switch (caught.code) {
    case 'authentication_expired':
      return 'Your session expired. Sign in again to continue.';
   case 'forbidden':
  return caught.message;
    case 'capacity_reached':
      return 'This event is full. You may be placed on the waitlist.';
    case 'duplicate':
      return 'This response has already been recorded.';
    case 'feature_disabled':
      return 'Events is currently disabled.';
    case 'not_found':
      return 'This event is no longer available.';
    case 'offline':
      return 'You are offline. Retry when your connection returns.';
    case 'validation':
    case 'unknown':
    default:
      return caught.message;
  }
}
