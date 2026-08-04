import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

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
  createClient: jest.fn(() => ({})),
}));

const getItemAsync = SecureStore.getItemAsync as jest.MockedFunction<typeof SecureStore.getItemAsync>;
const setItemAsync = SecureStore.setItemAsync as jest.MockedFunction<typeof SecureStore.setItemAsync>;
const deleteItemAsync = SecureStore.deleteItemAsync as jest.MockedFunction<typeof SecureStore.deleteItemAsync>;

describe('secure Supabase session storage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('configures Supabase to persist sessions with SecureStore', async () => {
    const { secureSessionStorage } = await import('../supabase');

    expect(createClient).toHaveBeenCalledWith(
      'https://placeholder.supabase.co',
      'placeholder-anon-key',
      {
        auth: {
          autoRefreshToken: true,
          detectSessionInUrl: false,
          persistSession: true,
          storage: secureSessionStorage,
        },
      },
    );
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
});
