import { supabase } from '@/lib/supabase';
import { assertMediaSession, mediaSessionRevision } from '@/lib/media-session';
export type AskQuota = {
  limit: number;
  used: number;
  remaining: number;
  percent: number;
  window_type: 'calendar_day_utc';
  window_start: string;
  reset_at: string;
  blocked_scope: 'account_daily' | 'account_minute' | 'preview_daily' | null;
  retry_at: string;
  server_time: string;
};
export function parseQuota(value: unknown): AskQuota | undefined {
  if (!value || typeof value !== 'object') return;
  const q = value as AskQuota;
  if (
    q.window_type !== 'calendar_day_utc' ||
    !Number.isInteger(q.limit) ||
    q.limit <= 0 ||
    !Number.isInteger(q.used) ||
    q.used < 0 ||
    q.remaining !== Math.max(0, q.limit - q.used) ||
    !Number.isFinite(q.percent) ||
    q.percent < 0 ||
    q.percent > 100 ||
    ![null, 'account_daily', 'account_minute', 'preview_daily'].includes(q.blocked_scope) ||
    [q.window_start, q.reset_at, q.retry_at, q.server_time].some(
      (v) => typeof v !== 'string' || !Number.isFinite(Date.parse(v)),
    )
  )
    return;
  return q;
}
export async function loadAskQuota() {
  const revision = mediaSessionRevision();
  const { data, error } = await supabase.rpc('neighborhood_ai_quota_status');
  assertMediaSession(revision);
  if (error) throw new Error('Question usage is temporarily unavailable.');
  const quota = parseQuota(data);
  if (!quota) throw new Error('Question usage is temporarily unavailable.');
  return quota;
}
export function quotaMessage(q: AskQuota) {
  const reset = new Date(q.blocked_scope ? q.retry_at : q.reset_at).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  if (q.blocked_scope === 'account_minute')
    return `Please pause between questions. Try again ${reset} (your local time). Search is still available.`;
  if (q.blocked_scope === 'preview_daily')
    return `The shared Preview daily limit is reached. Try again ${reset} (your local time). Search is still available.`;
  if (q.remaining === 0)
    return `Your daily question limit is reached. Resets ${reset} (your local time). Search is still available.`;
  return `${q.used} of ${q.limit} daily questions used · ${q.remaining} remaining.${q.percent >= 80 ? ' You have used at least 80% of your daily allowance.' : ''} Resets ${reset} (your local time; midnight UTC).`;
}
