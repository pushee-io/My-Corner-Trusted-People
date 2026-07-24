export type LocationProviderPolicy = {
  provider:
    | 'google_places_new'
    | 'google_place_details'
    | 'google_geocoding'
    | 'google_maps'
    | 'ghana_post_gps'
    | 'loqate_optional_normalization';
  purpose: string;
  provesResidence: false;
};

export const addressProviderPolicies: LocationProviderPolicy[] = [
  {
    provider: 'google_places_new',
    purpose: 'Find public places, landmarks, and businesses for local discovery.',
    provesResidence: false,
  },
  {
    provider: 'google_place_details',
    purpose: 'Resolve selected public place metadata through a backend service.',
    provesResidence: false,
  },
  {
    provider: 'google_geocoding',
    purpose: 'Support broad area and neighborhood labels through a backend service.',
    provesResidence: false,
  },
  {
    provider: 'google_maps',
    purpose: 'Display masked neighborhood-level maps without exact home pins.',
    provesResidence: false,
  },
  {
    provider: 'ghana_post_gps',
    purpose: 'Optional private address reference. Not public proof of residence.',
    provesResidence: false,
  },
  {
    provider: 'loqate_optional_normalization',
    purpose: 'Optional address normalization only. Not proof of residence.',
    provesResidence: false,
  },
];

export const identityProviderPolicy = {
  provider: 'nia_ivsp_test_provider',
  purpose: 'Test-only abstraction for future NIA IVSP integration.',
  collectsGhanaCardImages: false,
  productionApproved: false,
  finalIdentityDecisionByAi: false,
} as const;

export const manualBiometricPolicy = {
  provider: 'manual_biometric_test_review',
  purpose: 'Human-reviewed biometric check without Ghana Card use.',
  usesGhanaCard: false,
  collectsGhanaCardImages: false,
  finalIdentityDecisionByAi: false,
  requiresExplicitConsent: true,
} as const;
