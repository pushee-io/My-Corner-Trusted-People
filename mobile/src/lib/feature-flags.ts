import type { FeatureFlags } from '@/types/contracts';

export const featureFlags: FeatureFlags = {
  ai_service_request_structurer: false,
  ai_content_moderation: false,
  events: process.env.EXPO_PUBLIC_FEATURE_EVENTS === 'true',
};

export type FeatureFlagKey = keyof FeatureFlags;

export function isFeatureEnabled(flag: FeatureFlagKey) {
  return featureFlags[flag] === true;
}

export const runtimeFlags = {
  simulateOffline: false,
};
