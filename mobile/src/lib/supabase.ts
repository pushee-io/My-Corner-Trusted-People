import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

type SupabaseExtra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as SupabaseExtra;

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.supabaseUrl;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.supabaseAnonKey;

export const supabaseConfigDiagnostics = {
  hasSupabaseUrl: Boolean(supabaseUrl),
  hasSupabaseAnonKey: Boolean(supabaseAnonKey),
};

export function assertSupabaseConfigured() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: false,
      persistSession: false,
    },
  },
);
