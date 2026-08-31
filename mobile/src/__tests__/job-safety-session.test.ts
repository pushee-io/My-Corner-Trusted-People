import {
  acknowledgeJobSafetyCompletion,
  confirmJobSafetyArrival,
  getJobSafetySession,
  markJobSafetyArrived,
  regenerateJobSafetyCode,
  releaseJobSafetyLocation,
  startJobSafetySession,
} from '@/lib/job-safety-repository';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';

jest.mock('@/lib/supabase', () => ({
  assertSupabaseConfigured: jest.fn(),
  supabase: {
    rpc: jest.fn(),
  },
}));

const mockedAssertSupabaseConfigured = assertSupabaseConfigured as jest.MockedFunction<typeof assertSupabaseConfigured>;
const mockedRpc = supabase.rpc as jest.Mock;

describe('Job Safety Session repository', () => {
  beforeEach(() => jest.clearAllMocks());

  it('maps a requester-authorized session without exposing a code hash', async () => {
    mockedRpc.mockResolvedValue({
      data: [
        {
          job_request_id: 'request-1',
          state: 'location_shared',
          viewer_role: 'requester',
          can_view_exact_location: true,
          private_latitude: '5.650450',
          private_longitude: '-0.154120',
          private_location_label: 'Private gate near Lagos Avenue',
          location_shared_at: '2026-08-25T10:00:00Z',
          provider_arrived_at: null,
          arrival_confirmed_at: null,
          active_at: null,
          code_expires_at: '2026-08-26T10:00:00Z',
          code_attempt_count: 0,
          requester_completed_at: null,
          provider_completed_at: null,
          completed_at: null,
        },
      ],
      error: null,
    });

    const session = await getJobSafetySession('request-1');

    expect(mockedAssertSupabaseConfigured).toHaveBeenCalled();
    expect(mockedRpc).toHaveBeenCalledWith('get_job_safety_session', { target_job_request_id: 'request-1' });
    expect(session).toMatchObject({
      jobRequestId: 'request-1',
      viewerRole: 'requester',
      privateLatitude: 5.65045,
      privateLongitude: -0.15412,
      privateLocationLabel: 'Private gate near Lagos Avenue',
    });
    expect(session).not.toHaveProperty('codeHash');
  });

  it('returns the one-time code only from the requester location-release call', async () => {
    mockedRpc.mockResolvedValue({
      data: {
        job_request_id: 'request-1',
        state: 'location_shared',
        one_time_code: '483921',
        code_expires_at: '2026-08-26T10:00:00Z',
      },
      error: null,
    });

    const release = await releaseJobSafetyLocation({
      jobRequestId: 'request-1',
      latitude: 5.65045,
      longitude: -0.15412,
      locationLabel: 'Private gate near Lagos Avenue',
      consentVersion: 'job_safety_location_v1',
    });

    expect(mockedRpc).toHaveBeenCalledWith('set_job_safety_location', {
      target_job_request_id: 'request-1',
      target_latitude: 5.65045,
      target_longitude: -0.15412,
      target_location_label: 'Private gate near Lagos Avenue',
      target_consent_version: 'job_safety_location_v1',
    });
    expect(release.oneTimeCode).toBe('483921');
  });

  it('allows the requester repository path to replace a lost code', async () => {
    mockedRpc.mockResolvedValue({
      data: {
        job_request_id: 'request-1',
        state: 'arrival_confirmed',
        one_time_code: '638204',
        code_expires_at: '2026-08-26T11:00:00Z',
      },
      error: null,
    });

    const replacement = await regenerateJobSafetyCode('request-1');

    expect(mockedRpc).toHaveBeenCalledWith('regenerate_job_safety_code', {
      target_job_request_id: 'request-1',
    });
    expect(replacement.oneTimeCode).toBe('638204');
  });

  it('uses separate RPCs for arrival, code verification, and two-party completion', async () => {
    mockedRpc
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: null, error: null })
      .mockResolvedValueOnce({ data: { started: true, state: 'active' }, error: null })
      .mockResolvedValueOnce({
        data: {
          state: 'completion_pending',
          requester_confirmed: false,
          provider_confirmed: true,
          completed: false,
        },
        error: null,
      });

    await markJobSafetyArrived('request-1');
    await confirmJobSafetyArrival('request-1');
    const started = await startJobSafetySession('request-1', '483921');
    const completion = await acknowledgeJobSafetyCompletion('request-1');

    expect(started.started).toBe(true);
    expect(completion).toEqual({
      state: 'completion_pending',
      requesterConfirmed: false,
      providerConfirmed: true,
      completed: false,
    });
    expect(mockedRpc.mock.calls.map(([name]) => name)).toEqual([
      'mark_job_safety_arrived',
      'confirm_job_safety_arrival',
      'start_job_safety_session',
      'acknowledge_job_safety_completion',
    ]);
  });

  it('preserves invalid-code attempt information for the provider UI', async () => {
    mockedRpc.mockResolvedValue({
      data: { started: false, reason: 'invalid_code', attempts_remaining: 4 },
      error: null,
    });

    await expect(startJobSafetySession('request-1', '000000')).resolves.toEqual({
      started: false,
      state: undefined,
      reason: 'invalid_code',
      attemptsRemaining: 4,
    });
  });
});
