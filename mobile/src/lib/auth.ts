import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/contracts';

export type CurrentProfile = {
  id: string;
  authUserId: string;
  displayName: string;
  role: UserRole;
  phoneVerified: boolean;
};

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

export async function signOutFromDevice(): Promise<void> {
  assertSupabaseConfigured();

  const { error } = await supabase.auth.signOut({ scope: 'local' });
  if (error) throw error;
}

export async function restoreSessionProfile(): Promise<CurrentProfile | null> {
  assertSupabaseConfigured();

  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  if (!data.session) return null;

  return getCurrentProfile();
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

export async function getCurrentProviderProfileId(): Promise<string> {
  const profile = await getCurrentProfile();
  const { data, error } = await supabase.from('provider_profiles').select('id').eq('profile_id', profile.id).single();

  if (error) throw error;
  if (!data) throw new Error('The signed-in account is not linked to a provider profile.');

  return data.id;
}
