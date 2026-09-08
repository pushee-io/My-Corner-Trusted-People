import { getCurrentProfile } from '@/lib/auth';
import {
  getJobModerationReport,
  getRequesterJobReport,
  listJobModerationQueue,
  resolveJobReport,
  submitJobReport,
} from '@/lib/job-report-repository';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/auth', () => ({ getCurrentProfile: jest.fn() }));
jest.mock('@/lib/supabase', () => ({
  assertSupabaseConfigured: jest.fn(),
  supabase: { rpc: jest.fn() },
}));
const rpc = supabase.rpc as jest.Mock;
const profile = getCurrentProfile as jest.Mock;
const row = {
  report_id: 'qa-report',
  job_request_id: 'qa-job',
  request_title: 'QA safety test',
  neighborhood_name: 'QA area',
  status: 'open',
  reported_at: '2026-09-08T00:00:00Z',
  reason: 'Safety concern',
  session_state: 'cancelled',
  details: 'This is a QA safety test.',
  request_status: 'Reported',
  reporter_name: 'QA requester',
  review_notes: 'Private review note',
  audit_history: [{ action: 'job_report_submitted', created_at: '2026-09-08T00:00:00Z', actor_name: 'QA requester' }],
  exact_address_private: 'PRIVATE_ADDRESS_SENTINEL',
  internal_evidence: 'PRIVATE_EVIDENCE_SENTINEL',
};

describe('job report authorization and allowed payloads', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    profile.mockResolvedValue({ id: 'qa-moderator', role: 'moderator' });
    rpc.mockResolvedValue({ data: row, error: null });
  });

  it.each(['requester', 'provider'])(
    'rejects %s queue, detail and action before invoking moderator RPCs',
    async (role) => {
      profile.mockResolvedValue({ role });
      await expect(listJobModerationQueue()).rejects.toThrow('Moderator access');
      await expect(getJobModerationReport('qa-report')).rejects.toThrow('Moderator access');
      await expect(resolveJobReport('qa-report', 'no_violation', '')).rejects.toThrow('Moderator access');
      expect(rpc).not.toHaveBeenCalled();
    },
  );

  it.each(['moderator', 'admin'])('uses the protected queue RPC for %s', async (role) => {
    profile.mockResolvedValue({ role });
    rpc.mockResolvedValue({ data: [row], error: null });
    const queue = await listJobModerationQueue('open');
    expect(rpc).toHaveBeenCalledWith('list_job_moderation_queue', { report_status_filter: 'open' });
    expect(queue).toHaveLength(1);
    expect(queue[0]).toMatchObject({ requestId: 'qa-job', reportId: 'qa-report', sessionState: 'cancelled' });
    expect(JSON.stringify(queue)).not.toContain('PRIVATE_');
    expect(queue[0]).not.toHaveProperty('reviewNotes');
  });

  it('maps only the allowed moderator context and history', async () => {
    const report = await getJobModerationReport('qa-report');
    expect(report.reporterName).toBe('QA requester');
    expect(report.reviewNotes).toBe('Private review note');
    expect(report.auditHistory).toHaveLength(1);
    expect(JSON.stringify(report)).not.toContain('PRIVATE_');
  });

  it('returns only requester-visible outcome fields', async () => {
    rpc.mockResolvedValue({
      data: {
        ...row,
        status: 'resolved',
        submitted_at: row.reported_at,
        resolved_at: row.reported_at,
        outcome: 'Review complete. No further action was taken.',
        moderator_name: 'PRIVATE_MODERATOR',
        moderator_notes: 'PRIVATE_NOTES',
      },
      error: null,
    });
    const outcome = await getRequesterJobReport('qa-job');
    expect(Object.keys(outcome!).sort()).toEqual(['outcome', 'resolvedAt', 'status', 'submittedAt']);
    expect(outcome?.status).toBe('resolved');
    expect(JSON.stringify(outcome)).not.toContain('PRIVATE_');
  });

  it('does not invent an outcome for a request with no report', async () => {
    rpc.mockResolvedValue({ data: null, error: null });
    expect(await getRequesterJobReport('qa-job')).toBeUndefined();
  });

  it('propagates server authorization failure even when the client profile says moderator', async () => {
    const rejection = { code: '42501', message: 'moderator access required' };
    rpc.mockResolvedValue({ data: null, error: rejection });
    await expect(getJobModerationReport('outside-scope')).rejects.toEqual(rejection);
    await expect(resolveJobReport('outside-scope', 'no_violation', '')).rejects.toEqual(rejection);
  });

  it('validates report details and sends one trimmed submission', async () => {
    await expect(submitJobReport('qa-job', 'short')).rejects.toThrow('10 to 1000');
    await expect(submitJobReport('qa-job', 'x'.repeat(1001))).rejects.toThrow('10 to 1000');
    expect(rpc).not.toHaveBeenCalled();
    await submitJobReport('qa-job', '  This is a QA safety test.  ');
    expect(rpc).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('submit_job_report', {
      target_job_request_id: 'qa-job',
      report_details: 'This is a QA safety test.',
    });
  });

  it('preserves the server duplicate-resolution result and explicit reason', async () => {
    rpc.mockResolvedValue({ data: { status: 'resolved', already_resolved: true }, error: null });
    expect(await resolveJobReport('qa-report', 'no_violation', '  QA review  ')).toEqual({
      status: 'resolved',
      already_resolved: true,
    });
    expect(rpc).toHaveBeenCalledWith('resolve_job_report', {
      target_report_id: 'qa-report',
      reason_code: 'no_violation',
      moderator_notes: 'QA review',
    });
  });
});
