import { loadAskQuota, parseQuota, quotaMessage, type AskQuota } from '@/lib/ask-quota';
import { askNeighborhood, AskAllowanceError } from '@/lib/neighborhood-assistant';
import { supabase } from '@/lib/supabase';
jest.mock('@/lib/supabase', () => ({ supabase: { rpc: jest.fn(), functions: { invoke: jest.fn() } } }));
jest.mock('@/lib/media-session', () => ({ mediaSessionRevision: () => 1, assertMediaSession: jest.fn() }));
const quota: AskQuota = {
  limit: 40,
  used: 32,
  remaining: 8,
  percent: 80,
  window_type: 'calendar_day_utc',
  window_start: '2026-09-28T00:00:00Z',
  reset_at: '2026-09-29T00:00:00Z',
  blocked_scope: null,
  retry_at: '2026-09-29T00:00:00Z',
  server_time: '2026-09-28T20:00:00Z',
};
beforeEach(() => jest.resetAllMocks());
it('renders 80 percent warning and an actual local reset date without claiming a rolling window', () => {
  expect(parseQuota(quota)).toEqual(quota);
  expect(quotaMessage(quota)).toMatch(/32 of 40.*8 remaining.*80%/);
  expect(quotaMessage(quota)).toContain(
    new Date(quota.reset_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }),
  );
  expect(quotaMessage(quota)).not.toMatch(/24 hours|rolling/);
});
it('both devices read identical account status and read again after server reset', async () => {
  jest.mocked(supabase.rpc).mockResolvedValue({ data: quota, error: null } as never);
  expect(await loadAskQuota()).toEqual(await loadAskQuota());
  const reset = {
    ...quota,
    used: 0,
    remaining: 40,
    percent: 0,
    window_start: quota.reset_at,
    reset_at: '2026-09-30T00:00:00Z',
  };
  jest.mocked(supabase.rpc).mockResolvedValue({ data: reset, error: null } as never);
  expect((await loadAskQuota()).remaining).toBe(40);
  expect(supabase.rpc).toHaveBeenCalledWith('neighborhood_ai_quota_status');
});
it('429 includes exact reset and keeps Search available; minute/global scopes have distinct messages', async () => {
  const exhausted = { ...quota, used: 40, remaining: 0, percent: 100, blocked_scope: 'account_daily' as const };
  jest.mocked(supabase.functions.invoke).mockResolvedValue({
    data: null,
    error: { context: { status: 429, json: async () => ({ code: 'ASK_ALLOWANCE_REACHED', quota: exhausted }) } },
  } as never);
  await expect(askNeighborhood('plumber', [], 'fixture')).rejects.toBeInstanceOf(AskAllowanceError);
  await expect(askNeighborhood('plumber', [], 'fixture')).rejects.toThrow(/Resets.*Search is still available/);
  expect(quotaMessage({ ...quota, blocked_scope: 'account_minute' })).toMatch(/pause between questions/);
  expect(quotaMessage({ ...quota, blocked_scope: 'preview_daily' })).toMatch(/shared Preview/);
});
it('rejects malformed status instead of displaying an invented allowance', () => {
  expect(parseQuota({ ...quota, remaining: 40 })).toBeUndefined();
  expect(parseQuota({ ...quota, reset_at: 'sometime' })).toBeUndefined();
  expect(parseQuota({ ...quota, window_type: 'rolling' })).toBeUndefined();
});
