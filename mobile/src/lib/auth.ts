import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/contracts';

export type CurrentProfile = {
  id: string;
  authUserId: string;
  displayName: string;
  role: UserRole;
  phoneVerified: boolean;
};

export type CurrentProviderProfile = {
  id: string;
  businessName: string;
};

const passwordRecoveryRedirect = 'mycorner://reset-password';

export async function signInWithEmailPassword(email: string, password: string): Promise<CurrentProfile> {
  assertSupabaseConfigured();

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    throw new Error('Enter your email and password.');
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password,
  });
  if (error) throw error;

  return getCurrentProfile();
}

export async function requestPasswordReset(email: string): Promise<void> {
  assertSupabaseConfigured();

  const normalizedEmail = email.trim().toLowerCase();
  if (!isValidEmail(normalizedEmail)) {
    throw new Error('Enter a valid email address.');
  }

  const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
    redirectTo: passwordRecoveryRedirect,
  });
  if (error) throw new Error('We could not send recovery instructions. Please try again later.');
}

export async function createPasswordRecoverySession(url: string): Promise<void> {
  assertSupabaseConfigured();

  const parameters = recoveryParameters(url);
  if (parameters.type !== 'recovery' || !parameters.accessToken || !parameters.refreshToken) {
    throw new Error('This password recovery link is invalid or has expired.');
  }

  const { error } = await supabase.auth.setSession({
    access_token: parameters.accessToken,
    refresh_token: parameters.refreshToken,
  });
  if (error) throw new Error('This password recovery link is invalid or has expired.');
}

export async function updateRecoveredPassword(password: string): Promise<void> {
  assertSupabaseConfigured();

  if (password.length < 10) {
    throw new Error('Use at least 10 characters for your new password.');
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) throw new Error('Could not update your password. Request a new recovery link and try again.');

  await signOutFromDevice();
}

export async function signOutFromDevice(): Promise<void> {
  assertSupabaseConfigured();

  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
}

const sessionRestoreTimeoutMs = 8_000;

export async function restoreSessionProfile(timeoutMs = sessionRestoreTimeoutMs): Promise<CurrentProfile | null> {
  assertSupabaseConfigured();

  return withTimeout(restoreSessionProfileWithoutTimeout(), timeoutMs);
}

async function restoreSessionProfileWithoutTimeout(): Promise<CurrentProfile | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) return null;

  return getCurrentProfile();
}

async function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error('Session restoration timed out. Continue to sign in.')), timeoutMs);
  });

  try {
    return await Promise.race([operation, deadline]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function getCurrentProfile(): Promise<CurrentProfile> {
  assertSupabaseConfigured();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) {
    throw new Error('Sign in before using live data.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, auth_user_id, display_name, role, phone_verified')
    .eq('auth_user_id', userData.user.id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('No My Corner profile is linked to this account.');

  return {
    id: data.id,
    authUserId: data.auth_user_id,
    displayName: data.display_name,
    role: data.role,
    phoneVerified: data.phone_verified,
  };
}

export async function getCurrentProviderProfile(): Promise<CurrentProviderProfile> {
  const profile = await getCurrentProfile();
  const { data, error } = await supabase
    .from('provider_profiles')
    .select('id, business_name')
    .eq('profile_id', profile.id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('The signed-in account is not linked to a provider profile.');

  return {
    id: data.id,
    businessName: data.business_name,
  };
}

export async function getCurrentProviderProfileId(): Promise<string> {
  return (await getCurrentProviderProfile()).id;
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function recoveryParameters(url: string) {
  const fragmentStart = url.indexOf('#');
  const queryStart = url.indexOf('?');
  const parameterText =
    fragmentStart >= 0 ? url.slice(fragmentStart + 1) : queryStart >= 0 ? url.slice(queryStart + 1) : '';
  const parameters = new URLSearchParams(parameterText);

  return {
    accessToken: parameters.get('access_token'),
    refreshToken: parameters.get('refresh_token'),
    type: parameters.get('type'),
  };
}
