import {
  addressProviderPolicies,
  identityProviderPolicy,
  manualBiometricPolicy,
} from '@/lib/location-providers';

describe('privacy provider policies', () => {
  it('does not include Google Address Validation API for Ghana', () => {
    expect(addressProviderPolicies.some((policy) => policy.provider.includes('address_validation'))).toBe(false);
  });

  it('treats Loqate as optional normalization and not proof of residence', () => {
    const loqate = addressProviderPolicies.find((policy) => policy.provider === 'loqate_optional_normalization');

    expect(loqate?.provesResidence).toBe(false);
    expect(loqate?.purpose).toContain('normalization');
  });

  it('uses a test NIA IVSP abstraction without Ghana Card images', () => {
    expect(identityProviderPolicy.provider).toBe('nia_ivsp_test_provider');
    expect(identityProviderPolicy.collectsGhanaCardImages).toBe(false);
    expect(identityProviderPolicy.productionApproved).toBe(false);
    expect(identityProviderPolicy.finalIdentityDecisionByAi).toBe(false);
  });

  it('allows manual biometric review only without Ghana Card use', () => {
    expect(manualBiometricPolicy.provider).toBe('manual_biometric_test_review');
    expect(manualBiometricPolicy.usesGhanaCard).toBe(false);
    expect(manualBiometricPolicy.collectsGhanaCardImages).toBe(false);
    expect(manualBiometricPolicy.finalIdentityDecisionByAi).toBe(false);
    expect(manualBiometricPolicy.requiresExplicitConsent).toBe(true);
  });
});
