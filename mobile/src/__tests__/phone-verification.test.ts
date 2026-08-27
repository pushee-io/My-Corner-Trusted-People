import {
  confirmPhoneVerification,
  isTestPhoneVerificationEnabled,
  normalizeGhanaPhone,
  startPhoneVerification,
} from '@/lib/phone-verification';

const localTestEnvironment = {
  NODE_ENV: 'development',
  EXPO_PUBLIC_PHONE_VERIFICATION_PROVIDER: 'test',
};

describe('Ghana phone verification test provider', () => {
  it('normalizes local Ghana mobile numbers', () => {
    expect(normalizeGhanaPhone('0240000000')).toBe('+233240000000');
    expect(normalizeGhanaPhone('240000000')).toBe('+233240000000');
    expect(normalizeGhanaPhone('+233240000000')).toBe('+233240000000');
  });

  it('rejects invalid phone numbers', () => {
    expect(normalizeGhanaPhone('12345')).toBeUndefined();
    expect(normalizeGhanaPhone('+15555555555')).toBeUndefined();
  });

  it('verifies with the fictional test code only', () => {
    const session = startPhoneVerification('0240000000', localTestEnvironment);

    expect(session.provider).toBe('ghana_phone_test_provider');
    expect(session.status).toBe('code_sent');
    expect(session.testCode).toBe('123456');

    expect(confirmPhoneVerification('123456')?.status).toBe('verified');
  });

  it('fails when the test code is wrong', () => {
    startPhoneVerification('0240000000', localTestEnvironment);

    expect(confirmPhoneVerification('000000')?.status).toBe('failed');
  });

  it('fails closed in Preview and Production even when the test provider value is present', () => {
    expect(
      isTestPhoneVerificationEnabled({
        NODE_ENV: 'production',
        EXPO_PUBLIC_PHONE_VERIFICATION_PROVIDER: 'test',
      }),
    ).toBe(false);

    const session = startPhoneVerification('0240000000', {
      NODE_ENV: 'production',
      EXPO_PUBLIC_PHONE_VERIFICATION_PROVIDER: 'test',
    });

    expect(session).toMatchObject({
      provider: 'not_configured',
      status: 'failed',
      phoneE164: '+233240000000',
    });
    expect(session.testCode).toBeUndefined();
    expect(confirmPhoneVerification('123456')?.status).toBe('failed');
  });
});
