import type { FeatureFlags } from '@/types/contracts';

export const featureFlags: FeatureFlags = {
  ai_service_request_structurer: false,
  ai_content_moderation: false,
};

export const runtimeFlags = {
  simulateOffline: false,
};
