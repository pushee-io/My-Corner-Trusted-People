import type { FeatureFlags } from '@/types/contracts';
import { isEventsClientEnabled } from '@/lib/events-feature';

export const featureFlags: FeatureFlags = {
  events: isEventsClientEnabled(),
  ai_service_request_structurer: false,
  ai_content_moderation: false,
};

export type FeatureFlagKey = keyof FeatureFlags;

export function isFeatureEnabled(flag: FeatureFlagKey) {
  return featureFlags[flag] === true;
}

export const runtimeFlags = {
  simulateOffline: false,
};
