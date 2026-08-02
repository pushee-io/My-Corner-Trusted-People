export type EventErrorCode =
  | 'api_failure'
  | 'authorization_denied'
  | 'authentication_expired'
  | 'validation_failed'
  | 'duplicate_rsvp'
  | 'capacity_reached'
  | 'offline';

export class EventRepositoryError extends Error {
  constructor(
    readonly code: EventErrorCode,
    message: string,
    readonly retryable = false,
  ) {
    super(message);
    this.name = 'EventRepositoryError';
  }
}

type ErrorLike = { code?: string; message?: string; status?: number };

export function normalizeEventError(caught: unknown): EventRepositoryError {
  if (caught instanceof EventRepositoryError) return caught;
  const error = (caught ?? {}) as ErrorLike;
  const message = error.message?.toLowerCase() ?? '';
  if (error.status === 401 || message.includes('jwt') || message.includes('sign in'))
    return new EventRepositoryError('authentication_expired', 'Your session expired. Sign in and try again.');
  if (error.code === '42501' || message.includes('not authorized') || message.includes('permission denied'))
    return new EventRepositoryError('authorization_denied', 'You do not have permission for this event action.');
  if (message.includes('capacity') || message.includes('full') || message.includes('waitlist'))
    return new EventRepositoryError('capacity_reached', 'This event is full. You have been added to the waitlist.');
  if (error.code === '23505' && message.includes('rsvp'))
    return new EventRepositoryError('duplicate_rsvp', 'Your RSVP is already recorded.');
  if (error.code === '23505' || error.code === '23514' || error.code === '22P02')
    return new EventRepositoryError('validation_failed', 'Check the event details and try again.');
  if (message.includes('network') || message.includes('offline') || message.includes('fetch'))
    return new EventRepositoryError(
      'offline',
      'You appear to be offline. We will retry when the connection returns.',
      true,
    );
  return new EventRepositoryError('api_failure', 'Events could not be updated. Please try again.', true);
}
