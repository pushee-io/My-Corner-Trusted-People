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
const mockSignIn = jest.fn();
const mockSetSession = jest.fn();
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
    auth: {
      getSession: mockGetSession,
      getUser: mockGetUser,
      signOut: mockSignOut,
      signInWithPassword: mockSignIn,
      setSession: mockSetSession,
    },
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

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function profileResponse(profile: CurrentProfile) {
  return {
    data: {
      id: profile.id,
      auth_user_id: profile.authUserId,
      display_name: profile.displayName,
      role: profile.role,
      phone_verified: profile.phoneVerified,
    },
    error: null,
  };
}

const requester: CurrentProfile = {
  ...provider,
  id: 'profile-requester',
  authUserId: 'auth-requester',
  displayName: 'QA Requester',
  role: 'requester',
};

describe('native profile cache and startup contract', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockDisk.clear();
    mockFetchNetwork.mockResolvedValue({ isConnected: true, isInternetReachable: true });
    mockGetSession.mockResolvedValue({ data: { session: { user: { id: provider.authUserId } } }, error: null });
    mockGetUser.mockResolvedValue({ data: { user: { id: provider.authUserId } }, error: null });
    mockSignOut.mockResolvedValue({ error: null });
    mockSignIn.mockResolvedValue({ error: null });
    mockSetSession.mockResolvedValue({ error: null });
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
    expect(mockSignOut).not.toHaveBeenCalled();
    await auth.signOutFromDevice();
    expect(mockDisk.size).toBe(0);
  });

  it.each(['getUser', 'profile'] as const)(
    'rejects a delayed %s response after sign-out instead of restoring the old profile',
    async (stage) => {
      const started = deferred<void>();
      const response = deferred<unknown>();
      const mockRequest = stage === 'getUser' ? mockGetUser : mockSingle;
      mockRequest.mockImplementationOnce(() => {
        started.resolve();
        return response.promise;
      });
      const auth = await import('../auth');
      const lateProfile = auth.getCurrentProfile();
      const rejected = expect(lateProfile).rejects.toThrow('Your session changed');
      await started.promise;
      await auth.signOutFromDevice();
      response.resolve(
        stage === 'getUser' ? { data: { user: { id: provider.authUserId } }, error: null } : profileResponse(provider),
      );
      await rejected;
      expect(mockDisk.size).toBe(0);
      expect(mockNativeWrite).not.toHaveBeenCalled();
      jest.resetModules();
      goOffline();
      const restarted = await import('../auth');
      await expect(restarted.restoreSessionProfile()).resolves.toBeNull();
    },
  );

  it('waits for a native write already in progress before completing cache removal', async () => {
    const started = deferred<void>();
    const releaseWrite = deferred<void>();
    mockNativeWrite.mockImplementationOnce(async (value, key) => {
      started.resolve();
      await releaseWrite.promise;
      mockDisk.set(key, value);
    });
    const auth = await import('../auth');
    const lateProfile = auth.getCurrentProfile();
    const rejected = expect(lateProfile).rejects.toThrow('Your session changed');
    await started.promise;
    const signingOut = auth.signOutFromDevice();
    expect(mockSignOut).not.toHaveBeenCalled();
    releaseWrite.resolve();
    await signingOut;
    await rejected;
    expect(mockDisk.size).toBe(0);
    expect(mockNativeWrite.mock.invocationCallOrder[0]).toBeLessThan(mockNativeDelete.mock.invocationCallOrder[0]);
    jest.resetModules();
    goOffline();
    const restarted = await import('../auth');
    await expect(restarted.restoreSessionProfile()).resolves.toBeNull();
  });

  it('prevents an old account response from overwriting a newly signed-in account', async () => {
    const started = deferred<void>();
    const response = deferred<ReturnType<typeof profileResponse>>();
    mockSingle.mockImplementationOnce(() => {
      started.resolve();
      return response.promise;
    });
    const auth = await import('../auth');
    const lateProfile = auth.getCurrentProfile();
    const rejected = expect(lateProfile).rejects.toThrow('Your session changed');
    await started.promise;
    mockGetUser.mockResolvedValue({ data: { user: { id: requester.authUserId } }, error: null });
    mockSingle.mockResolvedValue(profileResponse(requester));
    await expect(auth.signInWithEmailPassword('qa@example.com', 'test-password')).resolves.toEqual(requester);
    response.resolve(profileResponse(provider));
    await rejected;
    jest.resetModules();
    goOffline();
    const restarted = await import('../auth');
    await expect(restarted.restoreSessionProfile()).resolves.toEqual(requester);
  });

  it('does not retain the old cache when a replacement account profile fails to load', async () => {
    const auth = await import('../auth');
    await auth.getCurrentProfile();
    mockGetUser.mockResolvedValue({ data: { user: { id: requester.authUserId } }, error: null });
    mockSingle.mockResolvedValue({ data: null, error: new Error('Network request failed') });
    await expect(auth.signInWithEmailPassword('qa@example.com', 'test-password')).rejects.toThrow('Network');
    goOffline();
    await expect(auth.restoreSessionProfile()).resolves.toBeNull();
  });

  it('blocks profile reads during a session change and serializes a following sign-in', async () => {
    const started = deferred<void>();
    const releaseSignOut = deferred<void>();
    mockSignOut.mockImplementationOnce(async () => {
      started.resolve();
      await releaseSignOut.promise;
      return { error: null };
    });
    const auth = await import('../auth');
    const signingOut = auth.signOutFromDevice();
    await started.promise;
    await expect(auth.getCurrentProfile()).rejects.toThrow('Your session changed');
    await expect(auth.restoreSessionProfile()).rejects.toThrow('Your session changed');
    expect(mockGetUser).not.toHaveBeenCalled();
    mockGetUser.mockResolvedValue({ data: { user: { id: requester.authUserId } }, error: null });
    mockSingle.mockResolvedValue(profileResponse(requester));
    const signingIn = auth.signInWithEmailPassword('qa@example.com', 'test-password');
    expect(mockSignIn).not.toHaveBeenCalled();
    releaseSignOut.resolve();
    await signingOut;
    await expect(signingIn).resolves.toEqual(requester);
    goOffline();
    await expect(auth.restoreSessionProfile()).resolves.toEqual(requester);
  });

  it('rejects an offline cache read that finishes after sign-out', async () => {
    const auth = await import('../auth');
    await auth.getCurrentProfile();
    goOffline();
    const started = deferred<void>();
    const releaseRead = deferred<void>();
    mockNativeRead.mockImplementationOnce(async (key) => {
      const oldValue = mockDisk.get(key) ?? null;
      started.resolve();
      await releaseRead.promise;
      return oldValue;
    });
    const lateRestore = auth.restoreSessionProfile();
    const rejected = expect(lateRestore).rejects.toThrow('Your session changed');
    await started.promise;
    await auth.signOutFromDevice();
    releaseRead.resolve();
    await rejected;
    await expect(auth.restoreSessionProfile()).resolves.toBeNull();
  });

  it('rejects an old startup result instead of clearing a newly signed-in account cache', async () => {
    const started = deferred<void>();
    const response = deferred<unknown>();
    mockGetSession.mockImplementationOnce(() => {
      started.resolve();
      return response.promise;
    });
    const auth = await import('../auth');
    const lateRestore = auth.restoreSessionProfile();
    const rejected = expect(lateRestore).rejects.toThrow('Your session changed');
    await started.promise;
    mockGetUser.mockResolvedValue({ data: { user: { id: requester.authUserId } }, error: null });
    mockSingle.mockResolvedValue(profileResponse(requester));
    await auth.signInWithEmailPassword('qa@example.com', 'test-password');
    response.resolve({ data: { session: null }, error: null });
    await rejected;
    goOffline();
    await expect(auth.restoreSessionProfile()).resolves.toEqual(requester);
  });

  it('invalidates old profile requests when a recovery link replaces the session', async () => {
    const started = deferred<void>();
    const response = deferred<ReturnType<typeof profileResponse>>();
    mockSingle.mockImplementationOnce(() => {
      started.resolve();
      return response.promise;
    });
    const auth = await import('../auth');
    const lateProfile = auth.getCurrentProfile();
    const rejected = expect(lateProfile).rejects.toThrow('Your session changed');
    await started.promise;
    await auth.createPasswordRecoverySession(
      'mycorner://reset-password#access_token=qa-token&refresh_token=qa-refresh&type=recovery',
    );
    response.resolve(profileResponse(provider));
    await rejected;
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
