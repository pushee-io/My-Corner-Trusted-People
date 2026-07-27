import { assertSupabaseConfigured, supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/contracts';

type TestAccount = {
  email?: string;
  password?: string;
};

export type CurrentProfile = {
  id: string;
  authUserId: string;
  displayName: string;
  role: UserRole;
  phoneVerified: boolean;
};

function testAccountFor(role: 'requester' | 'provider'): TestAccount {
  if (role === 'provider') {
    return {
      email: process.env.EXPO_PUBLIC_SUPABASE_TEST_PROVIDER_EMAIL,
      password: process.env.EXPO_PUBLIC_SUPABASE_TEST_PROVIDER_PASSWORD,
    };
  }

  return {
    email: process.env.EXPO_PUBLIC_SUPABASE_TEST_REQUESTER_EMAIL,
    password: process.env.EXPO_PUBLIC_SUPABASE_TEST_REQUESTER_PASSWORD,
  };
}

export async function signInWithConfiguredTestAccount(role: 'requester' | 'provider') {
  assertSupabaseConfigured();
  const { email, password } = testAccountFor(role);

  if (!email || !password) {
    throw new Error(`Missing configured ${role} test account credentials.`);
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function getCurrentProfile(): Promise<CurrentProfile> {
  assertSupabaseConfigured();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!userData.user) {
    throw new Error('Sign in with a Supabase test account before using live data.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, auth_user_id, display_name, role, phone_verified')
    .eq('auth_user_id', userData.user.id)
    .single();

  if (error) throw error;
  if (!data) throw new Error('No My Corner profile is linked to the signed-in Supabase user.');

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
