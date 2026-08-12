import { createClient, processLock } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const startAutoRefresh = jest.fn();
const stopAutoRefresh = jest.fn();
const addEventListener = jest.fn();

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: {} } },
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      startAutoRefresh,
      stopAutoRefresh,
    },
  })),
  processLock: jest.fn(),
}));

jest.mock('react-native', () => ({
  AppState: { addEventListener },
  Platform: { OS: 'android' },
}));

const getItemAsync = jest.mocked(SecureStore.getItemAsync);
const setItemAsync = jest.mocked(SecureStore.setItemAsync);
const deleteItemAsync = jest.mocked(SecureStore.deleteItemAsync);

describe('secure Supabase session storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('configures Supabase to persist sessions with SecureStore', async () => {
    const { secureSessionStorage } = await import('../supabase');

    expect(createClient).toHaveBeenCalledWith('https://placeholder.supabase.co', 'placeholder-anon-key', {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: false,
        lock: processLock,
        persistSession: true,
        storage: secureSessionStorage,
      },
    });
  });

  it('delegates session reads, writes, and removals to SecureStore', async () => {
    getItemAsync.mockResolvedValue('session-json');
    setItemAsync.mockResolvedValue();
    deleteItemAsync.mockResolvedValue();
    const { secureSessionStorage } = await import('../supabase');

    await expect(secureSessionStorage.getItem('auth-key')).resolves.toBe('session-json');
    await secureSessionStorage.setItem('auth-key', 'new-session-json');
    await secureSessionStorage.removeItem('auth-key');

    expect(getItemAsync).toHaveBeenCalledWith('auth-key');
    expect(setItemAsync).toHaveBeenCalledWith('auth-key', 'new-session-json');
    expect(deleteItemAsync).toHaveBeenCalledWith('auth-key');
  });

  it('propagates SecureStore failures to the auth client', async () => {
    const storageError = new Error('keychain unavailable');
    setItemAsync.mockRejectedValue(storageError);
    const { secureSessionStorage } = await import('../supabase');

    await expect(secureSessionStorage.setItem('auth-key', 'session-json')).rejects.toBe(storageError);
  });

  it('refreshes tokens only while the native app is active', async () => {
    await import('../supabase');
    const onAppStateChange = addEventListener.mock.calls[0]?.[1] as (state: string) => void;

    onAppStateChange('active');
    expect(startAutoRefresh).toHaveBeenCalledTimes(1);

    onAppStateChange('background');
    expect(stopAutoRefresh).toHaveBeenCalledTimes(1);
  });
});
