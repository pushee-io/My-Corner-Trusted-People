import type { CurrentProfile } from '../auth';

// Mock the native bridge, not SecureStore's public API: invalid keys must still
// be rejected by the same JS implementation shipped in the Android APK.
const mockDisk = new Map<string, string>();
const mockNativeRead = jest.fn(async (key: string) => mockDisk.get(key) ?? null);
const mockNativeWrite = jest.fn(async (value: string, key: string) => {
  mockDisk.set(key, value);
});
const mockNativeDelete = jest.fn(async (key: string) => {
  mockDisk.delete(key);
});
const mockFetchNetwork = jest.fn();
const mockGetSession = jest.fn();
const mockGetUser = jest.fn();
const mockSignOut = jest.fn();
const mockSingle = jest.fn();

jest.mock('expo-secure-store', () => jest.requireActual('expo-secure-store/src/SecureStore'));
jest.mock('expo-secure-store/src/ExpoSecureStore', () => ({
  __esModule: true,
  default: {
    getValueWithKeyAsync: mockNativeRead,
    setValueWithKeyAsync: mockNativeWrite,
    deleteValueWithKeyAsync: mockNativeDelete,
  },
}));
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { supabaseUrl: 'https://qa.supabase.co', supabaseAnonKey: 'qa-key' } } },
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  AppState: { addEventListener: jest.fn() },
}));
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: { fetch: mockFetchNetwork },
}));
jest.mock('@supabase/supabase-js', () => ({
  processLock: jest.fn(),
  createClient: () => ({
    auth: { getSession: mockGetSession, getUser: mockGetUser, signOut: mockSignOut },
    from: () => ({ select: () => ({ eq: () => ({ single: mockSingle }) }) }),
  }),
}));

const provider: CurrentProfile = {
  id: 'profile-provider',
  authUserId: 'auth-provider',
  displayName: 'QA Provider',
  role: 'provider',
  phoneVerified: true,
};

function goOffline() {
  mockFetchNetwork.mockResolvedValue({ isConnected: false, isInternetReachable: false });
}

describe('native profile cache and startup contract', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockDisk.clear();
    mockFetchNetwork.mockResolvedValue({ isConnected: true, isInternetReachable: true });
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: provider.authUserId } } }, error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: provider.authUserId } }, error: null });
    mockSignOut.mockResolvedValue({ error: null });
    mockSingle.mockResolvedValue({
      data: {
        id: provider.id,
        auth_user_id: provider.authUserId,
        display_name: provider.displayName,
        role: provider.role,
        phone_verified: provider.phoneVerified,
      },
      error: null,
    });
  });

  it('rejects the old colon key before reaching native storage', async () => {
    const { secureSessionStorage } = await import('../supabase');
    const oldKey = 'my-corner:last-verified-profile:v1';
    await expect(secureSessionStorage.setItem(oldKey, '{}')).rejects.toThrow('Invalid key');
    await expect(secureSessionStorage.getItem(oldKey)).rejects.toThrow('Invalid key');
    await expect(secureSessionStorage.removeItem(oldKey)).rejects.toThrow('Invalid key');
    expect(mockNativeRead).not.toHaveBeenCalled();
    expect(mockNativeWrite).not.toHaveBeenCalled();
    expect(mockNativeDelete).not.toHaveBeenCalled();
  });

  it.each(['provider', 'requester'] as const)(
    'persists an online %s profile and restores it after offline module restart',
    async (role) => {
      const expected = { ...provider, role };
      mockSingle.mockResolvedValue({
        data: {
          id: expected.id,
          auth_user_id: expected.authUserId,
          display_name: expected.displayName,
          role,
          phone_verified: expected.phoneVerified,
        },
        error: null,
      });
      const online = await import('../auth');
      await expect(online.restoreSessionProfile()).resolves.toEqual(expected);
      expect(mockDisk.size).toBe(1);
      expect(mockNativeWrite).toHaveBeenCalledTimes(1);

      // Retain only the simulated device storage across a fresh module load.
      jest.resetModules();
      jest.clearAllMocks();
      goOffline();
      const restarted = await import('../auth');
      await expect(restarted.restoreSessionProfile()).resolves.toEqual(expected);
      expect(mockGetSession).not.toHaveBeenCalled();
      expect(mockGetUser).not.toHaveBeenCalled();
      expect(mockSingle).not.toHaveBeenCalled();
      expect(mockNativeRead).toHaveBeenCalledTimes(1);
      expect(mockNativeDelete).not.toHaveBeenCalled();
    },
  );

  it('clears the native routing profile on sign-out and cannot restore it offline', async () => {
    const auth = await import('../auth');
    await auth.restoreSessionProfile();
    await auth.signOutFromDevice();
    expect(mockSignOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(mockNativeDelete).toHaveBeenCalledTimes(1);
    expect(mockDisk.size).toBe(0);
    jest.resetModules();
    goOffline();
    const restarted = await import('../auth');
    await expect(restarted.restoreSessionProfile()).resolves.toBeNull();
  });

  it('fails closed on a cache read error without deleting the profile, then retries successfully', async () => {
    const auth = await import('../auth');
    await auth.restoreSessionProfile();
    goOffline();
    mockNativeRead.mockRejectedValueOnce(new Error('Device storage temporarily unavailable'));
    await expect(auth.restoreSessionProfile()).resolves.toBeNull();
    expect(mockDisk.size).toBe(1);
    expect(mockNativeDelete).not.toHaveBeenCalled();
    await expect(auth.restoreSessionProfile()).resolves.toEqual(provider);
  });

  it('does not report successful sign-out if native cache removal fails', async () => {
    const auth = await import('../auth');
    await auth.restoreSessionProfile();
    mockNativeDelete.mockRejectedValueOnce(new Error('Device storage temporarily unavailable'));
    await expect(auth.signOutFromDevice()).rejects.toThrow('Device storage temporarily unavailable');
    await auth.signOutFromDevice();
    expect(mockDisk.size).toBe(0);
  });

  it('does not restore a profile on a fresh offline installation', async () => {
    goOffline();
    const auth = await import('../auth');
    await expect(auth.restoreSessionProfile()).resolves.toBeNull();
    expect(mockGetSession).not.toHaveBeenCalled();
    expect(mockNativeWrite).not.toHaveBeenCalled();
  });
});
