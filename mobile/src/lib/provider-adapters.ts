import type {
  AddressNormalizationProvider,
  AddressSearchProvider,
  GeocodingProvider,
  IdentityVerificationProvider,
  ProviderConfig,
  ProviderEnvironment,
  PushProvider,
  ResidenceVerificationProvider,
  SmsVerificationProvider,
} from '@/types/day3';

const TEST_SMS_CODE = '123456';
const TEST_POSTCARD_CODE = 'MC-2468';

function requireProductionCredential(config: ProviderConfig, key: string) {
  const value = config.credentials?.[key]?.trim();

  if (!value) {
    throw new Error(`Missing production provider credential: ${key}`);
  }

  return value;
}

function assertProduction(config: ProviderConfig, providerName: string) {
  if (config.environment !== 'production') {
    throw new Error(`${providerName} is a production provider and cannot run in ${config.environment}.`);
  }
}

function isNonProduction(environment: ProviderEnvironment) {
  return environment === 'test' || environment === 'development' || environment === 'staging';
}

export function createSmsVerificationProvider(config: ProviderConfig): SmsVerificationProvider {
  if (isNonProduction(config.environment)) {
    return {
      name: 'test_sms_verification_provider',
      environment: config.environment,
      async startVerification(phoneE164) {
        return {
          sessionId: `sms-test-${phoneE164}`,
          phoneE164,
          provider: 'test_sms_verification_provider',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        };
      },
      async confirmVerification(_sessionId, code) {
        const verified = code.trim() === TEST_SMS_CODE;

        return {
          verified,
          provider: 'test_sms_verification_provider',
          reason: verified ? undefined : 'invalid_code',
        };
      },
    };
  }

  requireProductionCredential(config, 'SMS_PROVIDER_API_KEY');

  return {
    name: 'production_sms_verification_provider',
    environment: 'production',
    async startVerification(phoneE164) {
      assertProduction(config, 'production_sms_verification_provider');

      return {
        sessionId: `sms-production-${Date.now()}`,
        phoneE164,
        provider: 'production_sms_verification_provider',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      };
    },
    async confirmVerification(_sessionId, code) {
      assertProduction(config, 'production_sms_verification_provider');

      if (code.trim() === TEST_SMS_CODE) {
        return {
          verified: false,
          provider: 'production_sms_verification_provider',
          reason: 'fixed_test_code_rejected',
        };
      }

      return {
        verified: false,
        provider: 'production_sms_verification_provider',
        reason: 'production_confirmation_requires_backend_provider',
      };
    },
  };
}

export function createAddressSearchProvider(config: ProviderConfig): AddressSearchProvider {
  if (isNonProduction(config.environment)) {
    return {
      name: 'test_address_search_provider',
      environment: config.environment,
      async search(query) {
        return [
          {
            id: 'address-east-legon-test',
            label: query.trim() || 'East Legon, Accra',
            neighborhood: 'East Legon',
            city: 'Accra',
            countryCode: 'GH',
          },
        ];
      },
    };
  }

  requireProductionCredential(config, 'ADDRESS_PROVIDER_API_KEY');

  return {
    name: 'production_address_search_provider',
    environment: 'production',
    async search() {
      return [];
    },
  };
}

export function createAddressNormalizationProvider(config: ProviderConfig): AddressNormalizationProvider {
  if (isNonProduction(config.environment)) {
    return {
      name: 'test_address_normalization_provider',
      environment: config.environment,
      async normalize(address) {
        return {
          label: address.trim(),
          neighborhood: 'East Legon',
          city: 'Accra',
          countryCode: 'GH',
          exactAddressPublic: false,
        };
      },
    };
  }

  requireProductionCredential(config, 'ADDRESS_PROVIDER_API_KEY');

  return {
    name: 'production_address_normalization_provider',
    environment: 'production',
    async normalize(address) {
      return {
        label: address.trim(),
        countryCode: 'GH',
        exactAddressPublic: false,
      };
    },
  };
}

export function createGeocodingProvider(config: ProviderConfig): GeocodingProvider {
  if (isNonProduction(config.environment)) {
    return {
      name: 'test_geocoding_provider',
      environment: config.environment,
      async geocode() {
        return {
          latitude: 5.6505,
          longitude: -0.1496,
          accuracy: 'neighborhood',
          exactCoordinatesPublic: false,
        };
      },
    };
  }

  requireProductionCredential(config, 'GEOCODING_PROVIDER_API_KEY');

  return {
    name: 'production_geocoding_provider',
    environment: 'production',
    async geocode() {
      return {
        latitude: 0,
        longitude: 0,
        accuracy: 'neighborhood',
        exactCoordinatesPublic: false,
      };
    },
  };
}

export function createIdentityVerificationProvider(config: ProviderConfig): IdentityVerificationProvider {
  if (isNonProduction(config.environment)) {
    return {
      name: 'test_identity_verification_provider',
      environment: config.environment,
      async verifyIdentity() {
        return {
          status: 'needs_human_review',
          provider: 'test_identity_verification_provider',
          collectsGhanaCardImages: false,
          finalDecisionByAi: false,
        };
      },
    };
  }

  requireProductionCredential(config, 'IDENTITY_PROVIDER_API_KEY');

  return {
    name: 'production_identity_verification_provider',
    environment: 'production',
    async verifyIdentity() {
      return {
        status: 'needs_human_review',
        provider: 'production_identity_verification_provider',
        collectsGhanaCardImages: false,
        finalDecisionByAi: false,
      };
    },
  };
}

export function createResidenceVerificationProvider(config: ProviderConfig): ResidenceVerificationProvider {
  if (isNonProduction(config.environment)) {
    return {
      name: 'test_residence_verification_provider',
      environment: config.environment,
      async verifyResidence(_profileId, code) {
        return {
          status: code?.trim().toUpperCase() === TEST_POSTCARD_CODE ? 'needs_human_review' : 'rejected',
          provider: 'test_residence_verification_provider',
          exactAddressPublic: false,
          autoApproved: false,
        };
      },
    };
  }

  requireProductionCredential(config, 'RESIDENCE_PROVIDER_API_KEY');

  return {
    name: 'production_residence_verification_provider',
    environment: 'production',
    async verifyResidence(_profileId, code) {
      return {
        status: code?.trim().toUpperCase() === TEST_POSTCARD_CODE ? 'rejected' : 'needs_human_review',
        provider: 'production_residence_verification_provider',
        exactAddressPublic: false,
        autoApproved: false,
      };
    },
  };
}

export function createPushProvider(config: ProviderConfig): PushProvider {
  if (isNonProduction(config.environment)) {
    return {
      name: 'test_push_provider',
      environment: config.environment,
      async send() {
        return {
          queued: true,
          provider: 'test_push_provider',
          messageId: `push-test-${Date.now()}`,
        };
      },
    };
  }

  requireProductionCredential(config, 'PUSH_PROVIDER_API_KEY');

  return {
    name: 'production_push_provider',
    environment: 'production',
    async send() {
      return {
        queued: false,
        provider: 'production_push_provider',
      };
    },
  };
}