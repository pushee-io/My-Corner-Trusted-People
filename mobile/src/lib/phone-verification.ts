export type PhoneVerificationStatus = 'not_started' | 'code_sent' | 'verified' | 'failed';

export type PhoneVerificationSession = {
  id: string;
  phoneE164: string;
  localInput: string;
  provider: 'ghana_phone_test_provider';
  status: PhoneVerificationStatus;
  testCode: string;
  createdAt: string;
};

const GHANA_LOCAL_MOBILE = /^(0)?(20|23|24|25|26|27|28|29|50|53|54|55|56|57|59)\d{7}$/;
const GHANA_E164_MOBILE = /^\+233(20|23|24|25|26|27|28|29|50|53|54|55|56|57|59)\d{7}$/;

let currentSession: PhoneVerificationSession | undefined;

export function normalizeGhanaPhone(input: string): string | undefined {
  const digits = input.replace(/\D/g, '');

  if (input.trim().startsWith('+233') && GHANA_E164_MOBILE.test(`+${digits}`)) {
    return `+${digits}`;
  }

  if (digits.startsWith('233')) {
    const e164 = `+${digits}`;
    return GHANA_E164_MOBILE.test(e164) ? e164 : undefined;
  }

  if (GHANA_LOCAL_MOBILE.test(digits)) {
    const withoutLeadingZero = digits.startsWith('0') ? digits.slice(1) : digits;
    return `+233${withoutLeadingZero}`;
  }

  return undefined;
}

export function startPhoneVerification(localInput: string): PhoneVerificationSession {
  const phoneE164 = normalizeGhanaPhone(localInput);

  if (!phoneE164) {
    currentSession = {
      id: `phone-${Date.now()}`,
      phoneE164: '',
      localInput,
      provider: 'ghana_phone_test_provider',
      status: 'failed',
      testCode: '000000',
      createdAt: new Date().toISOString(),
    };
    return currentSession;
  }

  currentSession = {
    id: `phone-${Date.now()}`,
    phoneE164,
    localInput,
    provider: 'ghana_phone_test_provider',
    status: 'code_sent',
    testCode: '123456',
    createdAt: new Date().toISOString(),
  };

  return currentSession;
}

export function confirmPhoneVerification(code: string): PhoneVerificationSession | undefined {
  if (!currentSession) return undefined;

  currentSession = {
    ...currentSession,
    status: code.trim() === currentSession.testCode ? 'verified' : 'failed',
  };

  return currentSession;
}

export function getPhoneVerificationSession(): PhoneVerificationSession | undefined {
  return currentSession;
}
