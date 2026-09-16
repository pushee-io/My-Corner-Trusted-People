import type { JobSafetySession } from '@/types/contracts';

export type RouteBoundArrivalCode = {
  jobRequestId: string;
  value: string;
};

export function sessionForJobSafetyRoute(session: JobSafetySession | undefined, requestId: string | undefined) {
  return session?.jobRequestId === requestId ? session : undefined;
}

export function arrivalCodeForJobSafetyRoute(code: RouteBoundArrivalCode | undefined, requestId: string | undefined) {
  return code && code.jobRequestId === requestId ? code.value : undefined;
}
