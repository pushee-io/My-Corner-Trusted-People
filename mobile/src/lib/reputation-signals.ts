import type { TrustSignal } from '@/types/contracts';

// Presentation of existing authorized aggregate evidence only; no inferred verification.
export function reputationSignals(
  reputation?: {
    average: number;
    verifiedCount: number;
    completedJobs?: number;
    recommendationPercent: number | null;
  } | null,
): TrustSignal[] {
  if (!reputation) return [];
  const signals: TrustSignal[] = [
    {
      id: 'reviews',
      label: 'Verified reviews',
      value:
        reputation.verifiedCount > 0
          ? `${reputation.average.toFixed(1)} / 5 · ${reputation.verifiedCount} verified ${reputation.verifiedCount === 1 ? 'review' : 'reviews'}`
          : 'No verified reviews yet.',
    },
  ];
  if (reputation.completedJobs !== undefined)
    signals.push({
      id: 'jobs',
      label: 'Confirmed My Corner jobs',
      value: String(reputation.completedJobs),
    });
  if (reputation.verifiedCount > 0 && reputation.recommendationPercent !== null)
    signals.push({
      id: 'recommend',
      label: 'Would recommend',
      value: `${reputation.recommendationPercent}%`,
    });
  return signals;
}
