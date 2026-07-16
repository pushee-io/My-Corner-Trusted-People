import { featureFlags } from '@/lib/feature-flags';
import type { RequestUrgency } from '@/types/contracts';

export function structureServiceRequest(input: string) {
  if (!featureFlags.ai_service_request_structurer) {
    return {
      enabled: false,
      originalText: input,
      title: '',
      description: input,
      urgency: 'flexible' as RequestUrgency,
      missingInfo: [],
      safetyWarning: '',
    };
  }

  const normalized = input.trim();
  const lower = normalized.toLowerCase();
  const urgency: RequestUrgency = /urgent|asap|immediately|today/.test(lower)
    ? 'urgent'
    : /tomorrow|soon|this week/.test(lower)
      ? 'soon'
      : 'flexible';

  return {
    enabled: true,
    originalText: input,
    title: normalized ? normalized.slice(0, 40) : 'Service request',
    description: normalized,
    urgency,
    missingInfo: normalized.includes('when') ? [] : ['Preferred time'],
    safetyWarning: /gas|electrical fire|smoke/.test(lower) ? 'This may need urgent professional attention.' : '',
  };
}
