import { askNeighborhood, askAllowanceReached, askUnavailable } from '@/lib/neighborhood-assistant';
import { supabase } from '@/lib/supabase';
import { assertMediaSession } from '@/lib/media-session';
jest.mock('@/lib/supabase', () => ({ supabase: { functions: { invoke: jest.fn() } } }));
jest.mock('@/lib/media-session', () => ({ mediaSessionRevision: () => 1, assertMediaSession: jest.fn() }));
const invoke = jest.mocked(supabase.functions.invoke);
beforeEach(() => {
  jest.resetAllMocks();
});
it('decodes the function 429 without exposing raw backend text', async () => {
  invoke.mockResolvedValue({
    data: null,
    error: Object.assign(new Error('http'), {
      context: { status: 429, json: async () => ({ code: 'ASK_ALLOWANCE_REACHED', error: 'untrusted server text' }) },
    }),
  });
  await expect(askNeighborhood('fence', [], 'fixture')).rejects.toThrow(askAllowanceReached);
  expect(assertMediaSession).toHaveBeenCalledWith(1);
});
it('unknown HTTP errors keep the safe unavailable message', async () => {
  invoke.mockResolvedValue({
    data: null,
    error: Object.assign(new Error('private backend details'), {
      context: { status: 429, json: async () => ({ code: 'OTHER', error: 'private backend details' }) },
    }),
  });
  await expect(askNeighborhood('fence', [], 'fixture')).rejects.toThrow(askUnavailable);
});
it('checks session changes after asynchronous error-body decoding', async () => {
  invoke.mockResolvedValue({
    data: null,
    error: Object.assign(new Error('http'), {
      context: {
        status: 429,
        json: async () => {
          jest.mocked(assertMediaSession).mockImplementation(() => {
            throw new Error('Session changed');
          });
          return { code: 'ASK_ALLOWANCE_REACHED' };
        },
      },
    }),
  });
  await expect(askNeighborhood('fence', [], 'fixture')).rejects.toThrow('Session changed');
});
