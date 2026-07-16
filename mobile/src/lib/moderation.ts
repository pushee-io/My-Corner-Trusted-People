import { featureFlags } from '@/lib/feature-flags';
import type { ModerationStatus } from '@/types/contracts';

export function moderateText(text: string): { enabled: boolean; status: ModerationStatus; flagged: boolean; reasons?: string[] } {
  if (!featureFlags.ai_content_moderation) {
    return { enabled: false, status: 'not_run', flagged: false };
  }

  const reasons: string[] = [];
  if (/threat|weapon|kill|attack/i.test(text)) reasons.push('potential_violence');
  if (/scam|fraud|419/i.test(text)) reasons.push('fraud_signal');
  if (/stupid|idiot|harass/i.test(text)) reasons.push('abuse_signal');

  return {
    enabled: true,
    status: reasons.length ? 'flagged' : 'clean',
    flagged: reasons.length > 0,
    reasons: reasons.length ? reasons : undefined,
  };
}

export function moderateRequestImage(): { enabled: boolean; status: ModerationStatus } {
  if (!featureFlags.ai_content_moderation) {
    return { enabled: false, status: 'not_run' };
  }

  return { enabled: true, status: 'clean' };
}

export const moderateRequestText = moderateText;
