import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

type ExpoExtra = Record<string, string | undefined>;

type SupabaseConfig = {
  url?: string;
  anonKey?: string;
};

let cachedClient: SupabaseClient | undefined;

function getExpoExtra(): ExpoExtra {
  return (Constants.expoConfig?.extra ?? {}) as ExpoExtra;
}

export function getSupabaseConfig(): SupabaseConfig {
  const extra = getExpoExtra();
  const env = typeof process !== 'undefined' ? process.env : undefined;

  return {
    url: env?.EXPO_PUBLIC_SUPABASE_URL ?? env?.SUPABASE_URL ?? extra.supabaseUrl,
    anonKey: env?.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? env?.SUPABASE_ANON_KEY ?? extra.supabaseAnonKey,
  };
}

export function isSupabaseConfigured() {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}

export function getSupabaseClient(): SupabaseClient {
  const config = getSupabaseConfig();

  if (!config.url || !config.anonKey) {
    throw new Error('Supabase URL and anon key are required. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
  }

  cachedClient ??= createClient(config.url, config.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });

  return cachedClient;
}
