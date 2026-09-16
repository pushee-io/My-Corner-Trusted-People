import {
  arrivalCodeForJobSafetyRoute,
  sessionForJobSafetyRoute,
  type RouteBoundArrivalCode,
} from '@/lib/job-safety-route-state';
import type { JobSafetySession } from '@/types/contracts';

const previousSession: JobSafetySession = {
  jobRequestId: 'previous-request',
  state: 'completed',
  viewerRole: 'requester',
  canViewExactLocation: true,
  privateLatitude: 5.65045,
  privateLongitude: -0.15412,
  privateLocationLabel: 'Private previous location',
  codeAttemptCount: 0,
};

describe('Job Safety route isolation', () => {
  it('withholds an earlier session when the route changes to another request', () => {
    expect(sessionForJobSafetyRoute(previousSession, 'missing-request')).toBeUndefined();
  });

  it('exposes a session only on its own request route', () => {
    expect(sessionForJobSafetyRoute(previousSession, 'previous-request')).toBe(previousSession);
  });

  it('withholds a one-time arrival code when the route changes', () => {
    const previousCode: RouteBoundArrivalCode = {
      jobRequestId: 'previous-request',
      value: '123456',
    };

    expect(arrivalCodeForJobSafetyRoute(previousCode, 'missing-request')).toBeUndefined();
    expect(arrivalCodeForJobSafetyRoute(previousCode, 'previous-request')).toBe('123456');
  });
});
