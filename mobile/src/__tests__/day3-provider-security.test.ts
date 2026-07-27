import {
  createIdentityVerificationProvider,
  createPushProvider,
  createResidenceVerificationProvider,
  createSmsVerificationProvider,
} from '@/lib/provider-adapters';

describe('Day 3 provider security foundation', () => {
  it('allows fixed OTP only for non-production SMS verification', async () => {
    const provider = createSmsVerificationProvider({ environment: 'test' });
    const session = await provider.startVerification('+233241234567');
    const result = await provider.confirmVerification(session.sessionId, '123456');

    expect(result).toEqual({
      verified: true,
      provider: 'test_sms_verification_provider',
      reason: undefined,
    });
  });

  it('rejects fixed OTP codes in production SMS verification', async () => {
    const provider = createSmsVerificationProvider({
      environment: 'production',
      credentials: { SMS_PROVIDER_API_KEY: 'prod-sms-key' },
    });
    const session = await provider.startVerification('+233241234567');

    await expect(provider.confirmVerification(session.sessionId, '123456')).resolves.toMatchObject({
      verified: false,
      reason: 'fixed_test_code_rejected',
    });
  });

  it('fails closed when production SMS credentials are missing', () => {
    expect(() => createSmsVerificationProvider({ environment: 'production' })).toThrow(
      'Missing production provider credential: SMS_PROVIDER_API_KEY',
    );
  });

  it('fails closed when production identity credentials are missing', () => {
    expect(() => createIdentityVerificationProvider({ environment: 'production' })).toThrow(
      'Missing production provider credential: IDENTITY_PROVIDER_API_KEY',
    );
  });

  it('keeps test identity verification human-reviewed and Ghana Card image free', async () => {
    const provider = createIdentityVerificationProvider({ environment: 'test' });

    await expect(provider.verifyIdentity('profile-akosua')).resolves.toEqual({
      status: 'needs_human_review',
      provider: 'test_identity_verification_provider',
      collectsGhanaCardImages: false,
      finalDecisionByAi: false,
    });
  });

  it('does not auto-approve test postcard codes in production residence verification', async () => {
    const provider = createResidenceVerificationProvider({
      environment: 'production',
      credentials: { RESIDENCE_PROVIDER_API_KEY: 'prod-residence-key' },
    });

    await expect(provider.verifyResidence('profile-akosua', 'MC-2468')).resolves.toMatchObject({
      status: 'rejected',
      exactAddressPublic: false,
      autoApproved: false,
    });
  });

  it('fails closed when production residence credentials are missing', () => {
    expect(() => createResidenceVerificationProvider({ environment: 'production' })).toThrow(
      'Missing production provider credential: RESIDENCE_PROVIDER_API_KEY',
    );
  });

  it('fails closed when production push credentials are missing', () => {
    expect(() => createPushProvider({ environment: 'production' })).toThrow(
      'Missing production provider credential: PUSH_PROVIDER_API_KEY',
    );
  });
});