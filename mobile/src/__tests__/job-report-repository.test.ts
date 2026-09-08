import { reportRequest } from '@/lib/repository';
import { supabase } from '@/lib/supabase';

jest.mock('@/lib/auth', () => ({
  getCurrentProfile: jest.fn(async () => ({ id: 'qa-requester', role: 'requester' })),
}));

jest.mock('@/lib/supabase', () => ({
  assertSupabaseConfigured: jest.fn(),
  supabase: { from: jest.fn(), rpc: jest.fn() },
}));

const client = supabase as unknown as { from: jest.Mock; rpc: jest.Mock };
const request = {
  id: 'qa-request',
  requester_id: 'qa-requester',
  provider_id: 'qa-provider',
  status: 'Reported',
  created_at: '2026-09-08T00:00:00Z',
};

describe('Job report submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    client.rpc.mockResolvedValue({ data: { report_id: 'qa-report', status: 'open' }, error: null });
    client.from.mockImplementation((table: string) => {
      const result = { data: table === 'job_requests' ? request : [], error: null };
      const chain: Record<string, unknown> = {};
      for (const name of ['update', 'insert', 'select', 'eq', 'in', 'order', 'single']) {
        chain[name] = jest.fn(() => chain);
      }
      chain.then = Promise.resolve(result).then.bind(Promise.resolve(result));
      return chain;
    });
  });

  it('persists the concern through the atomic reporting RPC before reading request status', async () => {
    await reportRequest('qa-request');

    expect(client.rpc).toHaveBeenCalledWith('submit_job_report', {
      target_job_request_id: 'qa-request',
      report_details: 'Safety concern reported by the requester.',
    });
    expect(client.from.mock.calls.map(([table]) => table)).not.toContain('reports');
    expect(client.rpc.mock.invocationCallOrder[0]).toBeLessThan(client.from.mock.invocationCallOrder[0]);
  });

  it('propagates a rejected report instead of presenting a saved request state', async () => {
    const rejection = { code: '42501', message: 'requester access required' };
    client.rpc.mockResolvedValue({ data: null, error: rejection });

    await expect(reportRequest('someone-elses-request')).rejects.toEqual(rejection);
    expect(client.from).not.toHaveBeenCalled();
  });
});
