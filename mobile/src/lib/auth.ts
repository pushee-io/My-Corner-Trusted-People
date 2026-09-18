import NetInfo from '@react-native-community/netinfo';
import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import { isNetworkOffline } from '@/lib/network-status';
import {
  clearCachedSessionProfile,
  readCachedSessionProfile,
  writeCachedSessionProfile,
} from '@/lib/session-profile-cache';
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
let sessionRevision = 0;
let pendingSessionChanges = 0;
let sessionChangeQueue: Promise<void> = Promise.resolve();

function isCurrentSession(revision: number): boolean {
  return revision === sessionRevision && pendingSessionChanges === 0;
}

function assertCurrentSession(revision: number): void {
  if (!isCurrentSession(revision)) throw new Error('Your session changed. Please try again.');
}

function changeSession(operation: () => Promise<void>): Promise<void> {
  // Invalidate in-flight reads synchronously, before the first auth/storage await.
  sessionRevision += 1;
  pendingSessionChanges += 1;
  const result = sessionChangeQueue
    .then(async () => {
      // If removal fails, do not change accounts or claim successful sign-out.
      await clearCachedSessionProfile();
      await operation();
    })
    .finally(() => {
      sessionRevision += 1;
      pendingSessionChanges -= 1;
    });
  sessionChangeQueue = result.catch(() => undefined);
  return result;
}

export async function signInWithEmailPassword(email: string, password: string): Promise<CurrentProfile> {
  assertSupabaseConfigured();

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password) {
    throw new Error('Enter your email and password.');
  }

  await changeSession(async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (error) throw error;
  });

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
  const { accessToken, refreshToken } = parameters;
  if (parameters.type !== 'recovery' || !accessToken || !refreshToken) {
    throw new Error('This password recovery link is invalid or has expired.');
  }

  await changeSession(async () => {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) throw new Error('This password recovery link is invalid or has expired.');
  });
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

  await changeSession(async () => {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw error;
  });
}

const sessionRestoreTimeoutMs = 8_000;

export async function restoreSessionProfile(timeoutMs = sessionRestoreTimeoutMs): Promise<CurrentProfile | null> {
  assertSupabaseConfigured();
  const context: { authUserId?: string; revision: number } = { revision: sessionRevision };
  assertCurrentSession(context.revision);

  const offlineProfile = await cachedProfileIfDeviceOffline();
  assertCurrentSession(context.revision);
  if (offlineProfile !== undefined) return offlineProfile;

  try {
    const profile = await withTimeout(restoreSessionProfileWithoutTimeout(context), timeoutMs);
    assertCurrentSession(context.revision);
    return profile;
  } catch (caught) {
    assertCurrentSession(context.revision);
    const profile = await cachedProfileForOfflineRestore(caught, context.authUserId);
    assertCurrentSession(context.revision);
    return profile;
  }
}

async function restoreSessionProfileWithoutTimeout(context: {
  authUserId?: string;
  revision: number;
}): Promise<CurrentProfile | null> {
  const { data, error } = await supabase.auth.getSession();
  assertCurrentSession(context.revision);
  if (error) throw error;
  if (!data.session) {
    const offlineProfile = await cachedProfileIfDeviceOffline();
    assertCurrentSession(context.revision);
    if (offlineProfile !== undefined) return offlineProfile;

    await clearCachedSessionProfile();
    return null;
  }

  context.authUserId = data.session.user.id;
  return getCurrentProfile();
}

async function cachedProfileIfDeviceOffline(): Promise<CurrentProfile | null | undefined> {
  try {
    const networkState = await NetInfo.fetch();
    if (!isNetworkOffline(networkState)) return undefined;

    return readCachedSessionProfile();
  } catch {
    // Unknown reachability falls through to Supabase's normal session restoration.
    return undefined;
  }
}

async function cachedProfileForOfflineRestore(caught: unknown, authUserId?: string): Promise<CurrentProfile> {
  if (!isOfflineRestoreError(caught)) throw caught;

  const cachedProfile = await readCachedSessionProfile();
  if (!cachedProfile || (authUserId && cachedProfile.authUserId !== authUserId)) throw caught;

  return cachedProfile;
}

function isOfflineRestoreError(caught: unknown): boolean {
  const message = caught instanceof Error ? caught.message : String(caught);
  return /network|fetch|offline|timed out|timeout|connection/i.test(message);
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
  const revision = sessionRevision;
  assertCurrentSession(revision);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  assertCurrentSession(revision);
  if (userError) throw userError;
  if (!userData.user) {
    throw new Error('Sign in before using live data.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, auth_user_id, display_name, role, phone_verified')
    .eq('auth_user_id', userData.user.id)
    .single();

  assertCurrentSession(revision);
  if (error) throw error;
  if (!data) throw new Error('No My Corner profile is linked to this account.');

  const profile: CurrentProfile = {
    id: data.id,
    authUserId: data.auth_user_id,
    displayName: data.display_name,
    role: data.role,
    phoneVerified: data.phone_verified,
  };

  try {
    await writeCachedSessionProfile(profile, () => isCurrentSession(revision));
  } catch {
    // A cache write must not block an otherwise valid online session.
  }
  assertCurrentSession(revision);
  return profile;
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
