import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { createClient, processLock } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

type SupabaseExtra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
};

export const secureSessionStorage = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

function getBrowserSessionStorage() {
  if (typeof window === 'undefined') return null;

  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export const webSessionStorage = {
  getItem: async (key: string) => getBrowserSessionStorage()?.getItem(key) ?? null,
  setItem: async (key: string, value: string) => {
    getBrowserSessionStorage()?.setItem(key, value);
  },
  removeItem: async (key: string) => {
    getBrowserSessionStorage()?.removeItem(key);
  },
};

export const authSessionStorage = Platform.OS === 'web' ? webSessionStorage : secureSessionStorage;

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
      lock: processLock,
      persistSession: true,
      storage: authSessionStorage,
    },
  },
);

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
